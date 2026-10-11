# PortfolioV7 migration plan

Goal: rebuild jankominek.com on Nuxt (Vue), move all visitor-facing content into a self-hosted
Payload CMS, add Umami analytics with privacy and terms pages, and deploy everything to the shared
VPS the same way Kreditožrouti and Ohlídáme deploy. **Visual output stays pixel-identical to V6.**
Design tweaks come later, separately.

Status: agreed (grilling session, 2026-09-22). Decision log in [section 12](#12-decision-log).

---

## 1. Architecture

```
                     Cloudflare (orange cloud) + Access on dev., cms., and umami.
                                             |
                               Infrastructure Traefik (-p global)
                                             |  public-network
     +-------------------------+-------------+--------------+---------------------------+
     |                         |                            |                           |
 jankominek.com          dev.jankominek.com        cms.jankominek.com          umami.jankominek.com
 jankominek.com/stats ---------------------------------------------------------------> |
     |                         |                            |                           |
 portfolio-web           portfolio-web-dev            portfolio-cms               portfolio-umami
 Nuxt 4 SSR (Node 24)    Nuxt 4 SSR, noindex          Payload 3 (Next.js)         umami 3.x
     |                         |                       |          |                     |
     +------ portfolio-cms-network (REST, API keys) ---+    portfolio-postgres    portfolio-umami-postgres
             + cache-invalidation webhooks back              + uploads volume
```

- **One global CMS.** Production and dev sites both read `portfolio-cms` over the private
  `portfolio-cms-network`. The browser never talks to Payload; `cms.jankominek.com` is admin only.
- **Rendering:** Nuxt server-renders every page from Payload data and caches the result in Nitro
  storage. A Payload `afterChange` / `afterDelete` hook calls `POST /_internal/revalidate` (shared
  secret, internal network only) on both sites, which clears the cache. Edits show on the next page
  load; no rebuild, no redeploy. If the CMS is down, visitors get the last cached pages.
- **Cloudflare** caches static assets only (`/_nuxt/*`, `/media/*`, fonts). HTML is never edge
  cached, so there is nothing to purge at Cloudflare.

---

## 2. Hosts and URLs

| Host / path                | Serves                                   | Protection                        |
| -------------------------- | ---------------------------------------- | --------------------------------- |
| `jankominek.com`           | site, English at today's URLs            | public                            |
| `jankominek.com/cs/...`    | site, Czech (`hreflang` pairs both ways) | public                            |
| `jankominek.com/media/...` | Payload media, proxied by Nuxt, cached   | public                            |
| `jankominek.com/cv.pdf`    | CV currently set in the Resume global    | public                            |
| `jankominek.com/stats/*`   | Umami tracker + collect, first-party     | public                            |
| `cms.jankominek.com`       | Payload admin                            | Cloudflare Access + Payload login |
| `dev.jankominek.com`       | dev site, `noindex`, not tracked         | Cloudflare Access                 |
| `umami.jankominek.com`     | Umami dashboard                          | Cloudflare Access + Umami login   |

Redirects (301, Nuxt server middleware):

- `?locale=cs` on any URL -> `/cs/...` equivalent; `?locale=en` -> unprefixed.
- `/projects/disenchament` -> `/projects/disenchantment` (kept from V6).
- Every V6 `/images/...` and `/files/...` path -> its new `/media/...` URL, from a redirect map the
  migration script writes into the CMS (`Redirects` collection, so it stays editable).
- `/files/Jan_Kominek_CV_*.pdf` -> `/cv.pdf`.

---

## 3. Repository layout

pnpm + turbo, same toolchain as Kreditožrouti / Ohlídáme (tabs, width 4, no semicolons, single
quotes, sorted imports, TS strict, `catalog:` in `pnpm-workspace.yaml`).

```
PortfolioV7/
├─ apps/
│  ├─ web/            @portfolio/web: Nuxt 4, @nuxtjs/i18n, Tailwind v4, unplugin-icons, @unhead
│  └─ cms/            @portfolio/cms: Payload 3, @payloadcms/db-postgres, richtext-lexical, plugin-seo
├─ packages/
│  └─ content/        @portfolio/content: payload-types.ts (generated), typed REST client used by
│                     web's server, contact-form Zod schema builder. Types + pure code only,
│                     never Payload runtime.
├─ scripts/
│  └─ migrate-v6.ts   one-shot import of all V6 content via Payload Local API (section 5)
├─ deployment/
│  ├─ deploy.sh, rollback.sh      pinned toolkit release adapters
│  ├─ production/                 web, cms, postgres
│  ├─ development/                web-dev only (reads the production CMS)
│  ├─ analytics/                  umami, umami-postgres, umami/retention.sql
│  ├─ boot-recovery/              root toolkit reconcile; install disabled
│  └─ scripts/pre-migrate-dump.sh
├─ .github/workflows/  hosted verify, build, environment deploy, analytics and rollback
├─ docker-compose.local.yml       local Postgres for development
├─ AGENTS.md / CLAUDE.md          house rules (section 11)
└─ docs/
```

Naming follows `Infrastructure/docs/NAMING.md` with project token `portfolio`. `cms` is added to the
component lexicon there, and a `portfolio` row to the project list.

---

## 4. Site: Svelte to Nuxt port (design parity)

Rule: **port markup and classes 1:1.** No restyling, no "while we're here" refactors.

| V6 (SvelteKit)                             | V7 (Nuxt 4)                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `src/app.css` tokens + Tailwind v4         | copied verbatim, `@tailwindcss/vite`                                   |
| 25 components, 8 routes (`.svelte`)        | `.vue` SFCs, `<script setup lang="ts">`, identical templates/classes   |
| `$state / $derived / $effect`              | `ref / computed / watchEffect`                                         |
| svelte-i18n, locale in localStorage        | `@nuxtjs/i18n`, `prefix_except_default`, UI text from CMS (section 5)  |
| `import.meta.glob` markdown loading        | server-side fetch from Payload via `@portfolio/content`, Nitro-cached  |
| mdsvex + shiki                             | Lexical JSON rendered server-side; `Code` block highlighted with shiki |
| unplugin-icons (tabler, iconamoon, mynaui) | unplugin-icons Vue compiler, same `~icons/...` imports                 |
| `JanKominekName.svelte`                    | `JanKominekName.vue`                                                   |
| `onNavigate` view transitions              | Nuxt `experimental.viewTransition` / router hook                       |
| `+error.svelte` + 40 status strings        | `error.vue`, strings from the `Errors` global                          |
| `hooks.server.ts` CSP + security headers   | Nitro route rules / server middleware, same header set minus GA hosts  |
| `feed.xml`, `sitemap.xml`                  | Nitro server routes from CMS data (sitemap includes `/cs` alternates)  |
| `llms.txt`, `llms-full.txt`, `humans.txt`  | Nitro server routes from CMS data                                      |
| `security.txt`                             | Nitro route: contact from `Site` global, `Expires` = now + 1 year      |
| `robots.txt`, favicons                     | `public/`, static                                                      |
| `/api/forms` -> Discord                    | Nitro `/api/contact` (section 6)                                       |
| Google Fonts link                          | self-hosted via Fontsource: DM Sans, Roboto Mono, Fraunces, same axes  |
| Cloudflare Workers adapter                 | Node 24 alpine image, `node .output/server/index.mjs`                  |

**Parity check:** throwaway Playwright script (not committed) screenshots every route x {en, cs} x
{mobile, desktop} on V6 and V7 and diffs them. Any pixel difference is a bug. Run after phase 2 and
again after phase 4.

---

## 5. CMS: content model

Localization: `en` (default), `cs`, `fallback: true` (empty Czech fields show English). Required
fields cannot be left empty. Drafts + versions on every collection and global that renders publicly.
**Everything a visitor can read lives here.** Only technical text stays in code (`robots.txt`, ARIA
roles, HTML attribute plumbing).

### Collections

| Collection              | Contents                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Projects**            | slug, date, order, title, thumbnail, tags, lede, client, role, team, timeline, sector, impact[], contributions[], stack[], gallery[], body (Lexical), home card badge + description, SEO |
| **Posts**               | slug, date, title, author, thumbnail, description, tags, body (Lexical), reading time (computed on save), SEO                                                                            |
| **Experience**          | kind (work, own product, leadership, education), dates, duration, role, company/org, description, highlights[], order                                                                    |
| **Testimonials**        | quote, name, role, order                                                                                                                                                                 |
| **Services**            | number, title, description, order                                                                                                                                                        |
| **Media**               | uploads (images, PDFs incl. CV), alt text (localized), stored in `portfolio-uploads-volume`                                                                                              |
| **Redirects**           | from, to, status; seeded by the migration                                                                                                                                                |
| **Contact submissions** | read-only in admin; option keys + label snapshot; auto-deleted after 12 months                                                                                                           |
| **Users**               | Payload auth; you only                                                                                                                                                                   |

### Globals (structured, one per page or area, tabs + labelled fields)

| Global          | Contents                                                                                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Site**        | name, contact email, LinkedIn, JSON-LD Person data (job title, description, skills, services), default SEO + share image                                                                                                                           |
| **Navigation**  | nav items: label, link, order, visible; hire button                                                                                                                                                                                                |
| **Footer**      | contact block copy and links, legal links                                                                                                                                                                                                          |
| **Home**        | hero, value prop, stats, "now" block, section headings for work / services / testimonials, SEO                                                                                                                                                     |
| **Resume**      | hero, bio, impact tiles, section headings, skill groups, CV file (drives `/cv.pdf`), SEO                                                                                                                                                           |
| **Blog**        | index headings, empty/draft labels, SEO                                                                                                                                                                                                            |
| **Contact**     | page copy, booking copy, form step copy, SEO                                                                                                                                                                                                       |
| **ContactForm** | field labels, placeholders, validation messages, option lists (stable key + localized label, reorderable) for project type, features, technologies, assets, audiences, hosting, support, legal, priority; budget slider min / max / step / default |
| **Errors**      | generic error copy + per-status-code messages                                                                                                                                                                                                      |
| **Legal**       | privacy policy + terms (Lexical), last-updated dates, SEO                                                                                                                                                                                          |

### Admin extras

- **Preview button** on Projects, Posts and page globals: opens the real page with draft content,
  authenticated by a Payload-signed preview token, bypassing the Nitro cache. Live Preview
  (side-by-side) is a later add-on.
- **SEO plugin** (`@payloadcms/plugin-seo`): meta title, description, image, with a search-result preview.
- **Cache invalidation hook** on every collection and global (section 1).
- **Retention job:** Payload jobs queue, daily, deletes contact submissions older than 12 months.

### Migration (`scripts/migrate-v6.ts`)

Reads V6 directly from `../PortfolioV6`:

- `src/projects/*/{en,cs}.md` -> Projects (both locales), body markdown -> Lexical.
- `src/posts/*.md` -> Posts, published. `_draft_*` and `_archived/**` -> Posts, **unpublished drafts**.
- `src/locales/{en,cs}.json` -> the globals above plus Experience, Testimonials, Services.
- `+layout.svelte` JSON-LD and per-page meta -> `Site` and the SEO fields.
- `static/images/**`, `static/files/**` -> Media, then writes the Redirects rows.
- Contact form option lists (from `ContactForm.svelte` + locales) -> `ContactForm` global.

Idempotent (upserts by slug / key) so it can be re-run while iterating.

---

## 6. Contact form

1. Visitor submits to Nuxt `POST /api/contact`.
2. Nuxt checks the payload (50 KB limit, JSON only, origin check), rate-limits per IP, and validates
   with a Zod schema **built from the `ContactForm` global** (option keys, budget bounds, limits).
3. Nuxt creates the submission in Payload with a **create-only** API key.
4. Payload `afterChange` hook sends Discord: `New inquiry from <company or email domain>` plus a
   link to the entry on `cms.jankominek.com`. No name, email or message goes to Discord.
5. Submissions older than 12 months are deleted by the retention job.

---

## 7. Analytics (Umami)

Stack `deployment/analytics/` (compose project `portfolio-analytics`): `umami` + `umami-postgres`
copied from Kreditožrouti's monitoring compose, nothing else. `postgres:18-alpine` mounted at
`/var/lib/postgresql`, `TRACKER_SCRIPT_NAME=stats.js`, `DISABLE_TELEMETRY=1`,
`CLIENT_IP_HEADER=cf-connecting-ip`, 13-month retention via `umami/retention.sql` +
an initially disabled host timer/service under the toolkit repository lock.

- Dashboard at `umami.jankominek.com` (Cloudflare Access and Umami login). Tracker first-party at
  `jankominek.com/stats` (Traefik stripprefix), so ad blockers do not break it.
- Nuxt client plugin ported from Kreditožrouti `analytics.ts`: `data-exclude-search`,
  `data-exclude-hash`, `data-before-send` URL redaction. Off when `NUXT_PUBLIC_UMAMI_WEBSITE_ID` is
  empty, which is how dev stays untracked.
- Events: `book-call`, `contact-sent` (success only, no form data), `cv-download`, `project-open`,
  `locale-switch`, `outbound-click` (`target`: `linkedin` | `email`).
- Opt-out toggle on `/privacy` (`localStorage umami.disabled`).

---

## 8. Privacy and legal

- **Google Analytics removed** (gtag, `_initGA`, GA CSP hosts). **Cookie banner removed**: nothing
  left needs consent. Umami sets no cookies and stores nothing on the device (ePrivacy art. 5(3),
  § 89(3) ZEK not triggered); processing on legitimate interest, GDPR art. 6(1)(f).
- **Fonts self-hosted**, no request to Google.
- **Cal.com** loads only when the visitor opens the booking picker.
- **Pages** `/privacy` + `/terms` (and `/cs/...`), content in the `Legal` global, linked from the
  footer. **Czech version prevails** if the two differ, stated on both.

`/privacy` covers:

- Controller: **Jan Komínek, IČO 19814585, Oblouková 1352/43, 252 19 Rudná**, contact email.
- What is processed and why: Umami aggregate statistics; contact form data (name, email, company,
  message, project details) to answer inquiries, kept 12 months; Cal.com bookings (Cal.com as
  independent service, its own policy); technical logs at Cloudflare and the VPS.
- Recipients / processors: Cloudflare, VPS provider, Cal.com, Discord (notification without
  personal data).
- Data subject rights, right to complain to ÚOOÚ, opt-out toggle for Umami.

`/terms` covers website use only: content and IP, code samples, no warranty, limitation of
liability, links to third parties, Czech law, contact. B2B terms stay in individual contracts.

Copy follows the writing-style rules (no em dashes, evergreen). A quick lawyer read before going
live is sensible.

---

## 9. Deployment

Images live on GHCR. GitHub-hosted workflows create complete immutable environment snapshots
through the repository's pinned toolkit at `~/portfolio/versions/<env>/<fullSHA>-<run>-<attempt>/`.
Toolkit owns `current`/`previous`, private dotenv, resolved Compose, digest pins, locks and health.
Pushes to main verify, build and deploy development. Manual dispatch also supports development;
production and analytics remain manual, with source ref independent of target environment. Production includes web and CMS
together; development includes web only. Rollback restores an existing snapshot exactly.
Analytics uses environment `monitoring` with analytics-specific Compose files. See the
[deployment guide](setup/deployment.md) for installation, migration and host units.

| Container                  | Image                                | Compose project       | Networks                                                  |
| -------------------------- | ------------------------------------ | --------------------- | --------------------------------------------------------- |
| `portfolio-web-prod`       | `ghcr.io/h7kz/portfoliov7/web:<sha>` | `portfolio`           | public, portfolio-cms-network                             |
| `portfolio-cms`            | `ghcr.io/h7kz/portfoliov7/cms:<sha>` | `portfolio`           | public, portfolio-cms-network, portfolio-internal-network |
| `portfolio-postgres`       | `postgres:18-alpine`                 | `portfolio`           | portfolio-internal-network                                |
| `portfolio-web-dev`        | `ghcr.io/h7kz/portfoliov7/web:<sha>` | `portfolio-dev`       | public, portfolio-cms-network                             |
| `portfolio-umami`          | `ghcr.io/umami-software/umami:3.3.1` | `portfolio-analytics` | public, portfolio-analytics-internal-network              |
| `portfolio-umami-postgres` | `postgres:18-alpine`                 | `portfolio-analytics` | portfolio-analytics-internal-network                      |

Volumes (external): `portfolio-postgres-volume`, `portfolio-uploads-volume`,
`portfolio-umami-postgres-volume`.

Traefik routers `portfolio-<router>-${PROJECT}`, `certresolver=letsencrypt`: `web`
(Host jankominek.com), `web-dev` (Host dev.jankominek.com), `cms` (Host cms.jankominek.com),
`stats` (Host jankominek.com && PathPrefix /stats, prio 210, stripprefix), `umami`
(Host umami.jankominek.com). Infrastructure's global middlewares apply automatically.

**CMS deploys:** `deployment/scripts/pre-migrate-dump.sh` runs `pg_dump` into
`~/portfolio/dumps/` in toolkit's locked prepare hook before the new CMS container starts (no automatic pruning), then the
container runs `payload migrate` on start. Schema changes are tested locally against a copy of
production content first; there is no dev CMS.

Secrets / vars (GitHub Environments `production`, `development`, `monitoring`): `DOMAIN`, `PROJECT`,
`POSTGRES_*`, `PAYLOAD_SECRET`, `CMS_READ_API_KEY`, `CMS_CONTACT_API_KEY`, `REVALIDATE_SECRET`,
`PREVIEW_SECRET`, `DISCORD_WEBHOOK_URL`, `UMAMI_DB_*`, `UMAMI_APP_SECRET`,
`NUXT_PUBLIC_UMAMI_WEBSITE_ID` (production only).

Cloudflare (manual, one time): DNS for `cms`, `dev`, `umami`; Access applications for all three protected hostnames. See the [setup guides](README.md#setup) for the current operational procedure.

---

## 10. Phases

| #   | Phase             | Output                                                                                                                                                                                              | Size |
| --- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 0   | Scaffold          | monorepo, toolchain config, AGENTS.md, CLAUDE.md, local Postgres compose                                                                                                                            | S    |
| 1   | Nuxt port         | all routes and components on V6 content copied in locally, `/cs` routing, headers, fonts, parity screenshots pass                                                                                   | L    |
| 2   | Payload CMS       | `apps/cms` schema (section 5), `migrate-v6.ts`, admin usable locally, preview, SEO plugin                                                                                                           | L    |
| 3   | Site reads CMS    | local content removed, `@portfolio/content` client, Nitro cache + revalidate hook, media proxy, redirects, feeds / sitemap / llms, parity re-checked                                                | M    |
| 4   | Contact form      | `/api/contact`, CMS-built Zod schema, submissions, Discord hook, retention job                                                                                                                      | S    |
| 5   | Analytics + legal | Umami plugin + events, GA and banner removed, Cal.com lazy, privacy + terms content, opt-out                                                                                                        | M    |
| 6   | Deployment        | Dockerfiles, compose stacks, hosted workflows, toolkit snapshots, pre-migrate dump, Cloudflare setup                                                                                                | M    |
| 7   | Cutover           | deploy CMS + run migration on the VPS, deploy dev, final parity + Lighthouse, switch `jankominek.com` origin from Cloudflare Workers to the VPS; V6 Worker stays 2 weeks as rollback, then archived | S    |

---

## 11. House rules for this repo (AGENTS.md / CLAUDE.md)

Carried from Kreditožrouti: no em dashes in any file, **no tests unless asked**, token discipline and
session boundaries, Conventional Commits. V7 specifics: Nuxt + Payload, all visitor-facing text lives
in the CMS (never hardcode copy), web imports only types and pure code from `@portfolio/content`,
visual parity with V6 until you decide otherwise.

---

## 12. Decision log

| Topic             | Decision                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Rendering         | Nuxt SSR, Nitro cache, invalidated by Payload hooks; no rebuilds for content               |
| CMS               | Payload 3 + Postgres, one global instance at `cms.jankominek.com` behind Cloudflare Access |
| Dev environment   | permanent `dev.jankominek.com`, reads production CMS read-only, noindex, not tracked       |
| Content scope     | everything visitor-readable in the CMS, structured globals per page, editable lists        |
| Rich text         | Lexical                                                                                    |
| Locales           | EN unprefixed, CS under `/cs`, Czech falls back to English                                 |
| Media / old links | served at `/media`, `/cv.pdf` stable, 301 map for V6 paths                                 |
| Draft preview     | yes (preview button); Live Preview later                                                   |
| Legacy posts      | imported as unpublished drafts                                                             |
| Contact form      | Nuxt route -> Payload (create-only key); Discord gets no personal data; 12-month retention |
| Umami             | in this repo, `umami.jankominek.com`, first-party `/stats`, six events                     |
| Cookie banner     | removed                                                                                    |
| Legal             | privacy + website-use terms, Czech prevails                                                |
| Deploys           | main pushes deploy development after verification; manual dispatch for both environments   |
| Backups           | **none (accepted risk)**; migration recovery dumps on the VPS, no automatic pruning        |

### Accepted risks

- **No backups.** A lost disk or deleted volume loses all content, media and contact submissions
  with no recovery. The pre-migration dump only covers a bad schema migration.
- **One CMS for both environments.** CMS schema changes cannot be tried on dev; they go from local
  testing straight to production, guarded only by the pre-migration dump.
