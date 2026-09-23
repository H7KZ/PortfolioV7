# DNS cutover: Cloudflare Worker to VPS (jankominek.com) research findings

**TL;DR:** V6 binds jankominek.com to its Worker with no `wrangler.toml`/`wrangler.jsonc` in the
repo at all (confirmed absent from working tree and full git history), so the binding is 100%
Cloudflare-dashboard state: almost certainly a Workers **Custom Domain**, which auto-creates and
locks a DNS record for as long as the Custom Domain exists. V7's Traefik stack already issues certs
via DNS-01 against the Cloudflare API (not HTTP-01), so there is no first-cert race with a proxied
apex. Cloudflare does not cache HTML by default and V7 sets no HTML `Cache-Control`, so the "Nitro
cache defeated by an edge Cache Rule" risk is low but not zero: legacy Page Rules are mid-migration
to Cache Rules as of this research and the zone has not been checked directly (cannot be, this task
is read-only against local repos and public docs). No Search Console Change of Address is needed
(domain is not changing). The biggest concrete new-to-this-migration gotcha: the VPS origin firewall
(`Infrastructure/traefik/scripts/cloudflare-firewall.sh`) drops all non-Cloudflare traffic on
80/443, so the "verify with `curl --resolve`" technique from a laptop will not work unless the
tester's IP is added to `EXTRA_ALLOWED_V4`/`_V6` first.

---

## 1. Moving the apex from a Worker to a proxied A/AAAA record

### How V6 currently binds the domain

- No `wrangler.toml` or `wrangler.jsonc` exists in `PortfolioV6`, in the working tree or anywhere in
  git history (`git log --all --diff-filter=A --name-only | grep -i wrangler` and
  `git log --all -- "*wrangler*"` both return nothing). `PortfolioV6/svelte.config.js:1,13` only
  calls `adapter()` from `@sveltejs/adapter-cloudflare` with no options.
- `PortfolioV6/package.json` has no deploy script that shells out to `wrangler deploy` with a
  `--route` or config file, and there is no `.github/workflows` directory in the repo. Deploys are
  manual, and the domain-to-Worker binding lives entirely in the Cloudflare dashboard (Workers &
  Pages, the Worker's Settings, Domains & Routes tab).
- `Infrastructure/docs/SETUP.md:4-5` states the VPS setup "assumes ... DNS for `jankominek.com` on
  Cloudflare with the **orange cloud (proxied)** on for every public record," and
  `Infrastructure/docs/CONTEXT.md:29-31` confirms "VPS sits behind Cloudflare orange cloud
  (proxied)." So the zone itself is already on Cloudflare's nameservers; the only question is which
  Cloudflare-side mechanism currently claims the `jankominek.com` hostname.

Cloudflare's docs describe exactly two dashboard-level ways to point a hostname at a Worker, and the
absence of any `routes` array in a wrangler config (there is none) combined with a dashboard-managed
Worker points to Custom Domains being the more likely of the two:

- **Custom Domains**: "Custom Domains allow you to connect your Worker to a domain or subdomain,
  without having to make changes to your DNS settings or perform any certificate management."
  (<https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>). Cloudflare
  creates the DNS record and the certificate for you; the same page's limitations note "You cannot
  create a Custom Domain on a hostname with an existing CNAME DNS record," implying Custom Domains
  own the record outright rather than sitting on top of one you manage.
- **Routes**: by contrast, Routes require a DNS record to already exist and be proxied: "All domains
  and subdomains must have a DNS record to be proxied on Cloudflare and used to invoke a Worker"
  (<https://developers.cloudflare.com/workers/configuration/routing/routes/>). A Route is a rule
  layered on top of a record you still fully control; deleting the Route does not touch the DNS
  record.

**Does the binding own/lock the DNS record?** For a Custom Domain, yes, functionally: Cloudflare's
own docs do not state a record is "locked," but multiple threads in the official Cloudflare Community
forum (not a primary source, treated here as corroboration only) describe the DNS record a Custom
Domain creates as showing `Source: Workers` and refusing dashboard edits with error 1043
("configured as read only") until the Custom Domain itself is removed. The authoritative behavior
documented by Cloudflare is narrower but consistent: removing a Custom Domain does **not**
automatically clean up its associated certificate ("When you delete a Custom Domain, the associated
Advanced Certificate is **not** automatically deleted. You must manually remove the certificate from
the Cloudflare dashboard.") which is the same "you must explicitly tear it down" pattern.
**Action item before the cutover:** open the Worker's Settings > Domains & Routes in the dashboard
and confirm which of the two mechanisms is in use; this cannot be verified from the repos alone.

### Required order of operations

1. Confirm the binding type in the dashboard (Custom Domain vs Route) as above.
2. If it is a **Custom Domain**: remove the Custom Domain for `jankominek.com` from the Worker's
   Domains & Routes tab. This frees the hostname's DNS record for normal editing (or deletes it,
   per the migration guidance Cloudflare gives for the reverse operation, which instructs deleting
   the placeholder record before adding a Custom Domain). Then create a new proxied A and/or AAAA
   record for `jankominek.com` pointing at the VPS's public IP(s), matching the pattern already used
   for `Kreditozrouti`/`Ohlidame` apex records (`Kreditozrouti/deployment/production/docker-compose.production.yml:199`,
   `Ohlidame/deployment/production/docker-compose.production.yml:185`; both use a Traefik `Host`
   rule and `certresolver=letsencrypt`, with no DNS config in this repo because DNS is dashboard-only).
3. If it is a **Route**: a DNS record already exists (Cloudflare requires one for Routes). Edit that
   record in place to point at the VPS IP, keep it proxied, then delete the Route from the Worker.
4. Either way, the router that will answer for `jankominek.com` on the VPS
   (`PortfolioV7/deployment/production/docker-compose.production.yml:41-48`,
   `traefik.http.routers.portfolio-web-${PROJECT}.rule=Host(\`${DOMAIN}\`)`) must already be deployed
   and healthy on the VPS **before** step 2/3, so there is no gap between "Worker stops answering"
   and "VPS starts answering."

### Expected downtime

Cloudflare's own docs do not give a numeric propagation time for this operation. In practice, because
Cloudflare is authoritative for the zone (orange-cloud proxied), the change is a **control-plane**
change at Cloudflare's edge, not a client-side DNS TTL wait: once the record (or the Custom Domain
removal) is saved, Cloudflare's edge starts routing new connections to the new target within its own
internal propagation window, typically noted by Cloudflare as being effective globally within
seconds to a couple of minutes, not the classic 24-48 hour DNS TTL expectation that applies to
non-proxied records. There is no official page cited here quantifying this exactly for a Custom
Domain removal; treat "a few minutes of inconsistent routing at the edge" as the working assumption
and validate empirically during the cutover window (see runbook).

### Can both coexist for verification before the real cutover?

Yes, with a caveat specific to this stack's hardening. Two options:

- **A temporary/staging hostname.** Create a proxied A/AAAA record for something like
  `vps-check.jankominek.com` pointing at the VPS, add a temporary Traefik router for it (or reuse
  `dev.jankominek.com`, which per `PortfolioV7/docs/PLAN.md:52` and `README.md` is meant to exist
  permanently behind Cloudflare Access), and browse to it. Because it goes through Cloudflare's
  proxy, it passes the origin firewall (see below) and gets a valid edge certificate automatically.
- **`curl --resolve jankominek.com:443:<VPS_IP>`** direct to the VPS, bypassing Cloudflare. This is
  the standard technique to test an origin before cutover, but **it will not work unprotected against
  this VPS**: `Infrastructure/traefik/scripts/cloudflare-firewall.sh:66-100` installs an nftables
  table whose terminal rule set is `tcp dport { 80, 443 } ip saddr @cf_v4 accept` /
  `... drop` for everything else, i.e. only Cloudflare's published edge ranges may reach 80/443 on
  the VPS at all. A `curl --resolve` from a home or office IP will be silently dropped ("DROP, not
  REJECT: a scanner learns nothing from a timeout," per the script's own comment). To use this
  technique, first add the tester's IP to `EXTRA_ALLOWED_V4`/`EXTRA_ALLOWED_V6`
  (`cloudflare-firewall.sh:38-39`) and re-run the script, or run the check from a Cloudflare Worker /
  something that already egresses from a Cloudflare range.

The Custom Domain and the new A/AAAA record cannot both claim `jankominek.com` at the same time in
Cloudflare's own model (a Custom Domain "cannot be created on a hostname with an existing CNAME DNS
record," and its own record is exclusive), so true coexistence at the apex is not possible; the
temporary-hostname approach above is the supported substitute.

---

## 2. Rollback: keeping the V6 Worker deployed but unbound

`PortfolioV7/docs/PLAN.md:299` (section 10, phase 7) already states the intended plan: "switch
`jankominek.com` origin from Cloudflare Workers to the VPS; V6 Worker stays 2 weeks as rollback, then
archived."

- **Keeping it deployed but unbound** is simply: do not delete the Worker itself, only remove its
  Custom Domain / Route (step 2/3 above). A Cloudflare Worker with no route or Custom Domain still
  exists and is still deployed; it just is not reachable at `jankominek.com` (it remains reachable at
  its `*.workers.dev` subdomain, if that was ever enabled, or purely via `wrangler dev`/API).
  Cloudflare's docs do not describe an explicit "disable but keep" state beyond removing the
  binding; there is no cost or expiry concern documented for an idle Worker with no traffic.
- **Rebinding speed:** re-adding a Custom Domain (or a Route, if that is what V6 used) is the same
  dashboard action as the original setup, i.e. a few clicks and a wait for Cloudflare to
  (re)provision the record and certificate, the same order of magnitude as the initial cutover
  itself (see downtime discussion above: no official numeric SLA found, treat as low minutes). The
  practical bottleneck for a fast rollback is not Cloudflare, it is reversing whatever DNS change was
  made on the VPS side (deleting/repointing the A/AAAA record back off the VPS) and re-adding the
  Worker's Custom Domain, both of which are dashboard operations with no propagation delay beyond
  Cloudflare's own internal edge-config push.
- Nothing in the V6 repo or Cloudflare's docs suggests a Worker needs redeploying to be rebound; the
  Worker's code and the domain binding are independent, so as long as nobody deletes the Worker
  itself during the 2-week window, rollback is "remove the new record, re-add the Custom Domain,"
  not a redeploy.

---

## 3. TLS mode and first-cert issuance

### What Traefik needs

`Infrastructure/traefik/config/traefik.yml:193-211` defines the production resolver:

```
letsencrypt:
  acme:
    email: '${ACME_EMAIL}'
    storage: /certs/acme.json
    caServer: https://acme-v02.api.letsencrypt.org/directory
    keyType: EC256
    dnsChallenge:
      provider: cloudflare
      propagation:
        delayBeforeChecks: 10s
        disableChecks: false
        requireAllRNS: false
      resolvers:
        - '1.1.1.1:53'
        - '8.8.8.8:53'
```

This is **DNS-01**, using the `CF_DNS_API_TOKEN` env var
(`Infrastructure/traefik/docker-compose.traefik.yml:105-108`) against the Cloudflare API, not
HTTP-01. The file's own comment block explains why: "DNS-01 keeps working with the Cloudflare orange
cloud on, issues wildcards, and never needs :80 reachable from the internet"
(`traefik.yml:188-191`). `PortfolioV7/deployment/production/docker-compose.production.yml:46,98` set
`tls.certresolver=letsencrypt` on both the `portfolio-web` and `portfolio-cms` routers, so V7 uses
this same resolver.

Confirmed against Traefik's own docs
(<https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/>):
"when using the `HTTP-01` challenge, `certificatesresolvers.myresolver.acme.httpchallenge.entrypoint`
must be reachable by Let's Encrypt through port 80," whereas DNS-01 "generate[s] and renew[s] ACME
certificates by provisioning a DNS record" with no port-reachability requirement, and "wildcard
certificates can only be generated through a `DNS-01` challenge." So: **no HTTP-01/proxy conflict
exists here at all**, because this stack never uses HTTP-01 for Cloudflare-zoned domains. (It reserves
`letsencrypt-http`, an HTTP-01 resolver, only for `jirikominek.cz`, a domain outside the Cloudflare
zone; see `traefik.yml:213-227`. `jankominek.com` is inside the Cloudflare zone, so this path does
not apply to it.)

### Required Cloudflare SSL/TLS mode

Because the origin (Traefik) presents a real, publicly-trusted Let's Encrypt certificate, Cloudflare's
own guidance is to use **Full (strict)**:
"Similar to Full Mode, but with added validation of the origin server's certificate, which can be
issued by a public CA like Let's Encrypt or by Cloudflare Origin CA," and "Cloudflare strongly
recommends using Full or Full (strict) modes to prevent malicious connections to your origin"
(<https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/>). Full (strict) is strictly
better than plain Full here since the origin cert is a real, CA-signed, non-self-signed cert; there is
no reason to accept the weaker Full mode's "any certificate, even invalid" tolerance.

**Action item:** confirm in the Cloudflare dashboard (SSL/TLS > Overview) that the zone is currently
set to Full or Full (strict) already (it must be, for `Kreditozrouti`/`Ohlidame`/`traefik.jankominek.com`
to already work the same way), and leave it there; nothing about the cutover requires changing this
setting, only verifying it is not accidentally on Flexible (which would break WebSocket/SSE traffic
and any use of `X-Forwarded-Proto: https` trust, since Cloudflare-to-origin would be plaintext HTTP
while Traefik's `security-headers` middleware sets `customRequestHeaders: X-Forwarded-Proto: https`
unconditionally, `middlewares.yml:41-43`, which would be a lie under Flexible).

### Conflict during first cert issuance on a proxied apex?

None, precisely because DNS-01 needs no inbound port at all: "the DNS-01 challenge to generate and
renew ACME certificates by provisioning a DNS record" happens entirely via the Cloudflare API (an
outbound call from Traefik), independent of whether the same hostname's A/AAAA record is proxied
(orange cloud) or DNS-only (grey cloud), and independent of whether anything is listening on port 80
at the origin yet. The certificate for `jankominek.com` can be, and by this stack's design already
would be, requested and issued via `certResolver=letsencrypt` the moment the router is deployed,
even before the DNS record is repointed at the VPS. There is no race condition to sequence around.

---

## 4. Cloudflare edge caching of Nuxt SSR HTML

### Cloudflare's default behavior

Confirmed directly: "The Cloudflare CDN does not cache HTML or JSON by default."
(<https://developers.cloudflare.com/cache/concepts/default-cache-behavior/>). Cloudflare's default
cache eligibility is driven by a fixed list of static file extensions plus origin `Cache-Control`/
`Expires` headers; HTML is excluded from that default extension list. Caching HTML requires an
explicit Cache Rule ("create a rule to cache everything"), an explicit origin `Cache-Control` header
telling Cloudflare to cache it, or a Worker doing custom caching. None of those exist for V7 by
default.

### What V7 itself sends

`PortfolioV7/apps/web/nuxt.config.ts:79-83` sets `Cache-Control: public, max-age=31536000, immutable`
only for `/fonts/**`, `/favicon/**`, and `/_nuxt/**` (build assets), and no `routeRules` entry exists
for HTML pages at all, so pages fall through to Nitro/Nuxt's default (no explicit long-lived
Cache-Control), matching `PortfolioV7/docs/PLAN.md:37-38`'s own claim: "Cloudflare caches static
assets only (`/_nuxt/*`, `/media/*`, fonts). HTML is never edge cached, so there is nothing to purge
at Cloudflare." That statement in the PLAN is consistent with Cloudflare's documented default
behavior, given the current `nuxt.config.ts` sends no cache-enabling header for HTML.

**So by default, no conflict exists between V7's Nitro cache/Payload-hook revalidation and Cloudflare's
edge cache** for HTML specifically, because Cloudflare simply is not caching that HTML at all. The
Nitro cache (`nitro.storage.content: { driver: 'memory' }`, `nuxt.config.ts:72-74`) is the only cache
in the path for page content, and it is correctly invalidated in-process by the Payload
`afterChange`/`afterDelete` hooks calling `/_internal/revalidate` (per `PLAN.md:34-36`), with no edge
layer to also purge.

### What could not be verified locally (a real gap)

Neither repo contains the zone's actual Cloudflare Cache Rules, Page Rules, or Transform Rules
configuration, since none of that lives in code for this project (Cloudflare dashboard-only, same as
the DNS binding). Two specific risks that only a dashboard check can rule out:

1. **Leftover Page Rules from the V6 era.** Cloudflare is mid-migration off legacy Page Rules:
   "Cloudflare will handle the migration of your existing Page Rules automatically. This process is
   planned for late 2025 or beyond, with no action required on your part."
   (<https://developers.cloudflare.com/rules/reference/page-rules-migration/>). Given today's date,
   this migration may or may not have already run against this zone; if any legacy Page Rule ever
   existed for `jankominek.com` (e.g. a cache-everything rule, a redirect, or a "Cache Level: Bypass"
   rule set up for the Worker era), it either still exists as a Page Rule or was auto-migrated into an
   equivalent Cache/Configuration/Redirect Rule, and either way it would keep applying after cutover
   regardless of which origin answers, since Page/Cache Rules match by URL pattern on the zone, not by
   origin type. **This needs a manual dashboard check** (Rules > Overview, and SSL/TLS > page rules
   listing) before cutover; nothing in either repo can confirm or rule this out.
2. **A stray Worker-era Transform Rule or Cache Rule** written specifically to accommodate the
   Workers deployment (for instance, one bypassing cache for `/api/forms` or forcing a particular
   `Cache-Control` override) would keep firing verbatim against the new VPS origin and could
   accidentally defeat, or unnecessarily bypass, the new stack's behavior. Same action item as above.

---

## 5. Google Search Console / SEO for the same-domain platform swap

### Is Change of Address needed?

No. Google's own scoping is explicit: "You only need it when moving from one domain or subdomain to
another (such as `example.com` to `example.net`, or `a.example.com` to `b.example.com`). You don't
need it for HTTP to HTTPS moves, switching between www and non-www on the same domain, or moving
paths within the same domain."
(<https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes>). Since
`jankominek.com` stays `jankominek.com`, the platform underneath changes (SvelteKit/Workers to
Nuxt/VPS) but Google's own domain-move page is explicit that Change of Address is scoped to
domain/subdomain identity changes, not hosting/platform changes; Google's dedicated guide for this
exact scenario, migrating hosting/platform without changing user-visible URLs, does not mention
Change of Address at all and instead frames it as four steps: "Prepare the new hosting
infrastructure," "Start the site move" (via the DNS change itself), "Monitor traffic," and "Shut down
old hosting" (<https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes>).

### What to resubmit

A sitemap, once the new one is live. Google's guidance: "Submit the new sitemap in Search Console.
This will help Google learn about the new URLs. At this point you can remove your old sitemap, since
Google will use the new sitemap going forward."
(<https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes>). V6 already
serves `src/routes/sitemap.xml` and V7's plan carries the same route forward as a Nitro server route
generated from CMS data, "sitemap includes `/cs` alternates" (`PortfolioV7/docs/PLAN.md:117`). Since
most URLs are staying pixel-identical (`PLAN.md:5`, "Visual output stays pixel-identical to V6"), this
is largely the "no URL changes" scenario for the bulk of the site, plus a genuine "with URL changes"
sub-case for the specific redirected paths (`/images/...`, `/files/...` to `/media/...`,
`PLAN.md:59-61`). Submitting the new sitemap through Search Console once V7 is live covers both cases;
no separate Change of Address action applies to either.

### How long to keep the 301s

Google's stated guidance: "Keep the redirects for as long as possible, generally at least 1 year.
This timeframe allows Google to transfer all signals to the new URLs, including recrawling and
reassigning links on other sites that point to your old URLs," and separately notes that from a
user's perspective it is worth "keeping redirects indefinitely" for old, possibly bookmarked or
externally linked URLs, despite the added overhead.
(<https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes>). V7's
`Redirects` collection is explicitly designed to be a durable, editable table rather than a one-shot
script (`PLAN.md:59,148`: "kept editable"), which fits this guidance well; there is no indication a
short-lived redirect map would be adequate. Treat 1 year as the documented floor, and keep the
`/projects/disenchament` typo redirect and the CV/PDF redirects indefinitely, matching V6's own
existing behavior (`hooks.server.ts:24-33` already treats that one as permanent, with a 1-year
`Cache-Control` on the redirect response itself).

---

## 6. www vs apex, HSTS, security.txt, Cloudflare Access for cms/dev/umami

### www vs apex

Both V6 (Traefik-independent, Cloudflare Worker era) and the future V7-on-Traefik setup already
agree on apex-canonical, www-redirects-to-apex. `Infrastructure/traefik/config/dynamic/middlewares.yml:49-53`
defines a global `www-redirect` middleware applied to the shared `websecure` entrypoint for every
site behind this Traefik instance (`traefik.yml:137-142`, `www-redirect@file` is in the entrypoint's
default middleware chain): `regex: '^https://www\.(.*)'` to `'https://${1}'`, permanent. This means
once `jankominek.com` is served through this Traefik, `www.jankominek.com` will 301 to the apex
automatically, with no per-project configuration needed, and no conflicting rule should be added on
the Cloudflare side (a Cloudflare-side www-redirect Redirect Rule would be redundant with, not
necessarily conflicting with, this Traefik middleware, but is unnecessary to add).

### HSTS

V6 currently sends **no** `Strict-Transport-Security` header at all:
`PortfolioV6/src/hooks.server.ts:43-52` sets CSP, `X-Content-Type-Options`, `X-Frame-Options`,
`X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and
`Cross-Origin-Resource-Policy`, but never `Strict-Transport-Security`. Once cutover happens, Traefik's
global `security-headers` middleware will start sending one on every response for `jankominek.com`,
because it is applied at the shared `websecure` entrypoint level, not per-router:
`stsSeconds: 31536000, stsIncludeSubdomains: true, stsPreload: false, forceSTSHeader: true`
(`Infrastructure/traefik/config/dynamic/middlewares.yml:22-30`). This is a genuinely new behavior
change introduced by the cutover itself, not a pre-existing one being carried over.

- `stsIncludeSubdomains: true` means the header, once seen by a browser for `jankominek.com`, tells
  that browser to also demand HTTPS for every subdomain, including `cms.`, `dev.`, and `umami.`
  before those exist. Since all of them will sit behind Cloudflare's proxy (which terminates TLS at
  the edge automatically for any proxied record on Cloudflare's Universal SSL), this is low risk in
  practice, but Cloudflare's own HSTS documentation for its **separate**, dashboard-level HSTS
  toggle warns generally that "Subdomains are inaccessible if they do not support HTTPS" once
  `includeSubDomains` is on (<https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/>).
  That Cloudflare-dashboard setting is a distinct control from Traefik's own header (this repo's HSTS
  is being set at the origin, by Traefik, and simply passed through by Cloudflare's proxy by
  default), but the same downstream browser behavior applies regardless of which layer sent the
  header.
- `stsPreload: false` here (deliberately: the Infrastructure repo's own comment reads "HSTS preload
  is a one-way door: once you submit the domain to hstspreload.org, browsers will refuse plain HTTP
  for it for a long time. Leave stsPreload false until you are sure,"
  `middlewares.yml:19-21`) means this is **not** the irreversible preload-list commitment; it is only
  a `max-age`-bounded header, which is far more forgiving if something is briefly broken during
  cutover (the browser will stop enforcing it `max-age` seconds after the last time it saw the
  header, once you stop sending it, rather than needing a preload-list removal request).

**Action item:** confirm `dev`, `cms`, and `umami` DNS records will exist and be Cloudflare-proxied
(hence auto-HTTPS at the edge) by the time `jankominek.com` starts sending an `includeSubdomains`
HSTS header, so no subdomain is ever addressed over plain HTTP after that point. Given the deployment
order in `PLAN.md`'s phase 7 (CMS and dev already deployed and DNS'd before the apex origin switch),
this should naturally already be satisfied.

### security.txt

V6 already serves one at `PortfolioV6/static/.well-known/security.txt` (and a duplicate at
`static/security.txt`): `Contact: mailto:contact@jankominek.com`, `Expires: 2027-01-01T00:00:00.000Z`,
`Preferred-Languages: en, cs`, `Canonical: https://jankominek.com/.well-known/security.txt`.
`PortfolioV7/docs/PLAN.md:119` already plans the equivalent as a Nitro route: "Nitro route: contact
from `Site` global, `Expires` = now + 1 year." No Cloudflare-specific behavior applies to this file;
it is served by the app/origin exactly like any other static asset. The only action item is making
sure the V7 route is live (and its `Expires` value current) before or at the same moment the apex
cuts over, so there is no window where `jankominek.com/.well-known/security.txt` briefly 404s or
serves stale V6 content from a Cloudflare cache (unlikely per section 4's findings, since this path
would also not be edge-cached by default as it's HTML-adjacent plain text with no explicit
Cache-Control, but confirm the extension is not on Cloudflare's default-cached static list;
`.txt` is not typically included).

### Cloudflare Access for cms/dev/umami

At the time of this research, `PLAN.md` listed Access applications for `cms` and `dev`, while the
`README.md` setup list also included `umami`. The [current plan](../PLAN.md#2-hosts-and-urls) resolves
that difference: all three dashboard hostnames use Cloudflare Access, and Umami keeps its own login.

Cloudflare's own guidance on ordering, in the context of publishing a self-hosted app behind Access,
is direct: "We recommend creating an Access application before setting up the tunnel route. If you do
not have an Access application in place, the published application will be available to anyone on the
Internet." (<https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/>).
V7 does not use Cloudflare Tunnel (it is a direct proxied DNS record to a Traefik-routed VPS
container), so the exact "tunnel route" mechanic does not apply, but the underlying principle is the
same and directly relevant here: **create the Access application and its policy before creating (or
at minimum before letting resolve) the public DNS record for that hostname**, so `cms.jankominek.com`,
`dev.jankominek.com`, and `umami.jankominek.com` are never reachable, even briefly, without Access in front of them. Since
Traefik will start routing and issuing a valid cert for these hostnames as soon as their containers
and labels are deployed (`docker-compose.production.yml:95-100` for `cms`), the practical ordering
that avoids any exposure window is: deploy the Access application and policy in Cloudflare first,
then create the DNS record, then (or concurrently) deploy the container/router on the VPS.

---

## Cutover runbook

1. **Before touching DNS:** deploy `portfolio-web`, `portfolio-cms`, `portfolio-postgres` on the VPS
   (`deployment/production/docker-compose.production.yml`) and confirm the Traefik router for
   `Host(jankominek.com)` is healthy and has already obtained (or can obtain) its Let's Encrypt cert
   via the existing DNS-01 `letsencrypt` resolver, independent of the apex's current DNS state
   (section 3).
2. Verify CMS and development web through their Access-protected hostnames without touching the
   live apex. Check the production web container's health separately. The dev site is a separate
   deployment and cannot submit contact forms; full production routing and contact checks follow
   the apex cutover. Do not rely on a direct `curl --resolve` from an arbitrary machine; the VPS
   firewall drops non-Cloudflare traffic on 80/443 by default (section 1).
3. In the Cloudflare dashboard, confirm SSL/TLS mode is Full or Full (strict) for the zone (section
   3); this should already be true given the other apps on the same VPS, but is a one-click check
   worth doing explicitly for this hostname before flipping DNS.
4. Set up the Cloudflare Access applications and policies for `cms.jankominek.com`,
   `dev.jankominek.com`, and `umami.jankominek.com` **before** creating their DNS records, per
   Cloudflare's own ordering guidance (section 6).
   Create those DNS records (proxied), confirm Access is enforced, and only then rely on them for
   anything.
5. Manually check the Cloudflare dashboard (Rules > Overview, SSL/TLS legacy Page Rules list) for any
   leftover Page Rule, Cache Rule, or Transform Rule from the Worker era that could still apply to
   `jankominek.com`'s URL patterns after cutover (section 4). This cannot be verified from either
   repo; it must be checked directly.
6. In the Worker's dashboard settings, confirm whether `jankominek.com` is bound as a Custom Domain
   or a Route (section 1). Do **not** delete the Worker itself.
7. Cut over: remove the Custom Domain (or edit the existing Route's underlying A/AAAA record, per
   whichever binding type step 6 found) for `jankominek.com`, and create/point a proxied A/AAAA
   record at the VPS. Do this promptly after step 6's check, since the hostname is briefly unbound
   between "remove Worker binding" and "new record active."
8. Confirm `jankominek.com` now serves V7 (check response headers for the new stack's fingerprints,
   e.g. absence of the CF Worker-specific behavior, presence of the new security headers from
   `security-headers@file`, correct HTML content) and that HSTS, CSP, and other headers look as
   expected (section 6). Watch for the first `Strict-Transport-Security` header ever sent for this
   domain; note the rollout date for later reference given the header's `max-age` implications.
9. Submit the updated sitemap for `jankominek.com` in Search Console (section 5). Do **not** submit a
   Change of Address; none is needed since the domain itself is unchanged.
10. Leave the V6 Worker deployed, unbound, for the planned 2-week window
    (`PortfolioV7/docs/PLAN.md:299`). Do not delete it. If a rollback is needed, re-add its Custom
    Domain/Route and revert the VPS-pointing A/AAAA record; this is fast (low minutes, dashboard-only,
    no redeploy required, section 2).
11. After 2 weeks with no rollback needed, archive the V6 Worker per the existing plan.

## Open questions the user must decide

- **Custom Domain vs Route for V6 today**: not verifiable from the repo; check the Cloudflare
  dashboard directly before planning the exact removal step (section 1).
- **Exact downtime/propagation tolerance for the apex cutover** is not quantified by Cloudflare's
  docs for this specific operation (Custom Domain removal plus new proxied record creation); no
  official SLA number was found. Decide how much of a gap (if any) is acceptable, and whether to
  schedule the cutover for low-traffic hours as a precaution.
- **Whether to pre-authorize a tester's IP in `EXTRA_ALLOWED_V4`/`_V6`** on the VPS firewall for
  direct-origin verification during the cutover, or to rely solely on Cloudflare-proxied verification
  paths (section 1).
- **Whether to check/clean up legacy Cloudflare Page Rules, Cache Rules, or Transform Rules** from
  the Worker era before or immediately after cutover (section 4); this requires dashboard access this
  research did not have.
- **HSTS preload**: staying with `stsPreload: false` (current Infrastructure default) through the
  cutover, or deciding a later date to opt in, is a decision, not a research finding (section 6).
- **Whether the `/images/...`/`/files/...` to `/media/...` redirect map and the CV redirect are
  considered "at least 1 year" or "indefinite"** per Google's own stated range (section 5); the
  `Redirects` collection supports either, but the retention decision itself is the user's to make.
