# Owner to-do for the V7 launch

Everything here needs Jan: material only he has, accounts only he controls, or a decision. Written 2026-10-31 against `develop` and the development CMS (`cms-dev.jankominek.com`). Field paths read as they appear in the CMS admin.

## How content reaches production

Production gets its content from the [V7 seed](../runbooks/v7-content-seed.md), not from the development CMS. An edit made only in `cms-dev` is lost at launch. Rerunning the seed also writes the copy JSON back over the CMS, including empty images on rows that are placeholders in the JSON.

- Text: change `docs/redesign/content/copy.en.json` and `copy.cs.json` in the repository, or ask for it.
- Screenshot available before launch: add it to `docs/redesign/assets/` and `manifest.json`, add its alt text to `ALT` in `apps/cms/scripts/seed-v7.ts`, and set `image` on the gallery row in both copy files. This is the path for anything that must be live on launch day.
- Screenshot available after launch: upload it straight into the production CMS on the row named below, then do not rerun the seed.

## 1. Accounts and security

| #   | What                                                                                                                                                                                                                                                                                                                                                                                                            | Where                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1.1 | Store the new development admin password in your password manager. It was given in chat, nowhere else.                                                                                                                                                                                                                                                                                                          | `cms-dev.jankominek.com/admin`                     |
| 1.2 | Rotate the CMS API keys pasted in chat earlier: generate new values with `openssl rand -base64 32` for `CMS_READ_API_KEY` and `CMS_CONTACT_API_KEY`, in both environments.                                                                                                                                                                                                                                      | GitHub Environments `development` and `production` |
| 1.3 | After 1.2, write the keys onto the `reader@` and `contact@` users with `api-keys:set` over the tunnel ([Development CMS](../runbooks/development-cms.md#fill-or-refresh-from-production-on-the-vps-as-the-deploy-user)), then run **Deploy** with `mode` `reuse` for each environment. The production pair goes in as part of the launch window, not before.                                                    | VPS tunnel, GitHub Actions                         |
| 1.4 | Find or reset the production admin password. The development hash was an exact copy of production's and the password you tried did not match it, so production has the same unknown password. "Forgot password" sends nothing, the CMS has no email adapter. Fix: `password:set` over the production tunnel ([runbook](../runbooks/development-cms.md#reset-an-admin-password)). Do it at launch at the latest. | `cms.jankominek.com/admin`                         |

## 2. Cloudflare and GitHub

| #   | What                                                                                                                                                      | Where                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 2.1 | Turn off Web Analytics automatic setup, so the beacon stops loading. The privacy policy says Umami is the only analytics.                                 | Cloudflare, zone `jankominek.com`, Web Analytics |
| 2.2 | Decide who may open `dev.jankominek.com`. It sits behind Cloudflare Access like `cms-dev`, so a preview link will not work for anyone outside the policy. | Cloudflare Zero Trust, Access applications       |
| 2.3 | Confirm `UMAMI_WEBSITE_ID` is set, otherwise V7 ships without analytics.                                                                                  | GitHub Environment `production`, variable        |

## 3. Facts to confirm (SPEC 14)

These stay exactly as written until you confirm them.

The hash in the DeepTrace copy and alt text was corrected from SHA-256 to SHA-512, which is what the app computes (`crypto.subtle.digest`). Nothing needed from you.

| Claim                                                                                              | Field                                                                                    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Ohlídáme: "61 days", "706 commits", "around 30,000 CZK" for a lawyer, the Trade Inspection wording | Projects > Ohlídáme > Case study; Blog > `ohlidame_61_days_with_ai_agents`; Résumé       |
| IONT: "ČSOB-certified", "five months" to launch                                                    | Projects > IONT platform > Case study > `lede`, `impact`, and Home card > `description`  |
| DeepTrace: "Supports 1000+ nodes"                                                                  | Projects > DeepTrace > Case study > `contributions`                                      |
| Contact: "on-site Thursdays and Fridays"                                                           | Globals > Contact > `intro`                                                              |
| Scorecard shown as a case study, not linked on LinkedIn                                            | Projects > Scorecard; Home page > More work                                              |
| "Seven companies", "12+ shipped projects"                                                          | Home page > Hero > `valueProp`; Résumé > `bio`, Impact                                   |
| "500+ connections · 6 recommendations"                                                             | Globals > Contact > `linkedinSub`. Typed text, update it by hand when the numbers change |
| "Right now" rows: VEROC Group, Ohlídáme, 200+ students, teaching C#                                | Home page > Now > `items`                                                                |
| Kreditožrouti: "589 visitors", "204 finished setup", "35%"                                         | Projects > Kreditožrouti > Case study > `impact`                                         |

## 4. Home

- **Flagship is now Ohlídáme** (badge and first position, EN and CS). IONT platform moves to second place. The home grid stays at four cards, so Intedat moved to More work; its case study stays at `/projects/intedat`. To swap it back, set `card.show` on the project and remove the row from `globals.home.more.items`.
- **Decide:** the hero sentence still lists the projects in the old order, DeepTrace first: "A zero-trust data provenance platform, an EV charging network with live payments, and a course scheduler". To lead with IONT, change `globals.home.hero.valueProp` in both copy files. Left as it is because it is your sentence.
- **Check:** the recommendations link now shows at every width and opens `https://www.linkedin.com/in/jan-kominek/details/recommendations/`, as do the "Read more" links on the quotes. LinkedIn asks logged-out visitors to sign in on that page. If you prefer the public profile, empty Home page > Sections > `allRecommendationsUrl`.
- **Check:** `{count}` in the link is the number of published testimonials, six today (three shown, three hidden). Keep the collection in step with LinkedIn.
- **Decide:** Marek Vospěl, Petr Krejčí and Zdeněk Glazer stay hidden. To show one, add it to `collections.testimonials` in both copy files; the seed hides every other testimonial.

## 5. Screenshots per project

Each row is one window on the case study. Field: Projects > project > Case study > Gallery > row N > `image`. Rows count from 1. No placeholders are left. No client data in any capture. New images need a new filename, because the seed keeps a file it already has.

Every image was rebuilt at 2400 px where a sharp source exists, so it stays crisp on 2× screens. The site also serves 1600 and 800 px sizes.

### Ohlídáme (flagship)

The hero and the guides are the current site at 2×. Rows 1 to 4 are a real scan on a local stack, run against the fictional Test shop, so no real shop appears. Row 6 is that Test shop. Before launch, confirm the figures below. Numbers come from the repository on 2026-10-31: 872 commits, 706 with a Claude co-author, first commit 2026-08-26, first production release 2026-10-26.

- **Read:** the blog post `ohlidame_61_days_with_ai_agents` is written in your voice from the repository's decision records and handoffs. Check the opinions, not only the facts. Its Czech version sits in the same post with the locale set to Czech.
- **Refresh:** the numbers in the post, the case study and the résumé are fixed text. They do not update as the repository grows.

### IONT platform

All rows and the hero are sharp and come from the original 4K to 9K files. Rows 5 and 6 use the design mockups, row 6 also the real pairing screen. Row 7 shows three installed chargers, from the iont.tech photos you approved.

### DeepTrace

The hero and all three rows are fresh 2× captures of the running app on a mock API, filled with made-up data (Demo Analytics, DEMO-SAT 1). The hero is the lineage view, row 1 the verified hash chain, row 2 the trusted sources table, row 3 a passed chain next to a tampered one. Case study > `impact` is empty. Add three rows (label, value, sub) if you can publish numbers.

### Kreditožrouti

The hero, light mode, timetable and course list are sharp. The hero and light mode are fresh 2× captures of the live site, showing the wizard. Lecturer names on the timetable are painted over, so they cannot be recovered.

Row 4 is your umami screenshot, 1277 px wide, so it is the softest image on this page. A 2× screenshot under a new filename would fix it. The figures follow your numbers for Jun 16 to Oct 31, 2026: 35% is 204 of 589 visitors. Umami's 40% counts from `wizard_start`, a different definition. The 204 appears in the case study text, not in the image.

### Intedat

The hero (task list), row 1 (global search) and row 2 (company detail) are fresh 2× captures of web2 running alone on a mock API. Every company, person and activity is made up, and the search results are mocked, so they do not come from Elasticsearch.

- **Decide:** check that Intedat allows showing these screens. To withdraw them, set the rows back to placeholders in both copy files.
- No metrics: Case study > `impact` is empty, and nothing was published from the internal docs. The harvester benchmark reports 241 successes against 12 failures (95%) on one run, but it does not say what a success means and the case study does not mention the harvester.

### Scorecard

The hero and row 1 are fresh 2× captures of the running app, filled with made-up demo rows. Row 2 shows the overview and treatment pages of an exported PDF with the same rows. Case study > `impact` is empty.

### Disenchantment

The hero and rows 1 to 3 come from the plugin repository's `assets/`, recorded on Paper 26.3. The hero is the 1920 px library shot, row 1 a still from `before-after.gif`, row 2 the anvil result, row 3 the enchantments GUI. Rows 1 to 3 are enlarged 2× or 3× without smoothing, so the game's pixels stay crisp. Row 4 is a fresh 2× capture of the GitHub repository. The GIFs are not used, because the site shows still images.

## 6. Blog

- **Decide:** the Figma mock post has a "Heads up" callout and a "Fig. 1" caption. The real Traefik article has neither, and the rich text editor only has code blocks. Either leave them out (current state, nothing to do) or write the text and ask for a callout and a caption block, which is a schema change.
- The Traefik post is English only; `/cs` falls back to English. Write a Czech version in Posts > Traefik > `content` with the locale set to Czech if you want one.
- Nine posts stay drafts: `pi_zero_departure_board` (no thumbnail) and eight `archived-*`. Publish only what you want listed. `archived-vse` has a date in 2027.

## 7. Résumé, legal, site

| #   | What                                                                                                                                                                                           | Field                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 7.1 | `/cv.pdf` still serves the PDF uploaded for V6. Export a current one that matches the V7 résumé (seven companies, roles, dates).                                                               | Résumé > `cv`                                     |
| 7.2 | Read Privacy and Terms again. They keep their V6 text. Check that Umami is named as the only analytics and that the contact form's new budget presets are covered. Set the date when you edit. | Privacy, Terms                                    |
| 7.3 | Check the social share image. It is still the V6 upload.                                                                                                                                       | Site settings > Default SEO > `image`, `imageAlt` |
| 7.4 | Confirm `twitterHandle` is `@jankominek` and `calLink` is `jankominek/30min`.                                                                                                                  | Site settings                                     |
| 7.5 | Have a native Czech reader skim `/cs` once.                                                                                                                                                    | `copy.cs.json`                                    |
| 7.6 | Accept or reject the Lighthouse result: performance 88 to 93 on mobile against a budget of 95, see `STATE.md`.                                                                                 | Decision                                          |

## 8. Production launch

In this order. Until step 3 production keeps serving V6, and steps 3 and 4 belong in one sitting, because the V7 migration breaks V6 pages until the seed runs.

1. Finish sections 3 to 7, or decide what ships with placeholders.
2. Merge `develop` into `main` through a pull request.
3. Run **Deploy** with `environment` `production`, `ref` `main`. The CMS applies the migrations when it starts. A verified backup first ([Backups](../runbooks/backups.md)).
4. Seed: [V7 content seed](../runbooks/v7-content-seed.md), dry run, real run, second run ending in `0 changed`, then copy the media and restart the web.
5. Set the production admin password (1.4) and the new production API keys (1.2, 1.3).
6. Verify as in the seed runbook: home, one case study, résumé and contact in EN and under `/cs`, the 301s from the old project URLs, and a test message through the contact form.
7. Once production has been stable for a while, ask for the `v7_cleanup` migration, which drops the V6-only fields (see `STATE.md`).

## 9. From the full pre-launch check

Found by [FULL-CHECK-REPORT.md](FULL-CHECK-REPORT.md) (2026-11-01). None blocks the code; each needs you or an account only you have. The report row for each gives the evidence.

| #    | What                                                                                                                                                                                                                                                                                                                                                          | Where                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 9.1  | Turn off Rocket Loader and Email Address Obfuscation. Production HTML carries both. They can break V7 hydration and rewrite `mailto:` links. Check on dev first.                                                                                                                                                                                              | Cloudflare, Speed > Optimization; Scrape Shield |
| 9.2  | HSTS is `max-age=0` on every host. Set a real value (start at six months) once all subdomains are HTTPS.                                                                                                                                                                                                                                                      | Cloudflare SSL/TLS > Edge Certificates          |
| 9.3  | `/media/*` on production serves a textbook PDF and exam PDFs from posts that are now drafts (30 files). Copyright risk. Delete the media or keep the posts private.                                                                                                                                                                                           | Production CMS, Media                           |
| 9.4  | Privacy policy wording: it says no cookies (the `locale` cookie exists, one year), says the Cal.com calendar loads on scroll (V7 only links to it), and says nothing is stored in the browser (the opt-out stores `umami.disabled`).                                                                                                                          | Privacy                                         |
| 9.5  | The "Updated" date on Privacy and Terms is `updatedAt`, which every save and every seed run overwrites. A separate date field needs a schema change and migration. Say if you want it.                                                                                                                                                                        | Decision                                        |
| 9.6  | Archived projects stay live at `/projects/noteful`, `pangolin`, `portfolio_v5`, `portfolio_v4` with V6 text (em dashes included). Not linked, not in the sitemap. Redirect, 404 or keep?                                                                                                                                                                      | Decision                                        |
| 9.7  | `cv.pdf` is the V6 file: untagged, no language, title has an em dash, "~20 h a week" (site says 10), "around 350 students" (site 589 visitors), 4 editions (site 5). Export a new tagged PDF with title and language.                                                                                                                                         | Résumé > `cv`                                   |
| 9.8  | Dependency bump: undici 7.30.1, payload 3.92.1, next 16.4.3. `pnpm audit --prod` lists 2 critical and 13 high, mostly transitive in dev tooling and the admin editor. The web image itself carries `@intlify/*` 11.4.12, `undici` 6.28.0 and `brace-expansion` 5.0.9 (high advisories, low exposure). Add vue-i18n 11.4.14 to the bump. Dependabot can do it. | Decision                                        |
| 9.9  | The contact form has a rate limit and an Origin check but no honeypot or captcha. Turnstile needs a site key from your Cloudflare.                                                                                                                                                                                                                            | Cloudflare Turnstile, then ask                  |
| 9.10 | CSP keeps `'unsafe-inline'` for scripts (the `js` class script and `window.__NUXT__`). Hashes or a nonce remove it, at the cost of a build step. Accept or ask.                                                                                                                                                                                               | Decision                                        |
| 9.11 | Mail: SPF `~all`, DMARC `p=none`, no MTA-STS, no TLS-RPT, DKIM selectors not found. Tighten DMARC once mail flows.                                                                                                                                                                                                                                            | Cloudflare DNS                                  |
| 9.12 | `og:locale` is `en` and `cs`; Facebook expects `en_US` and `cs_CZ`. `google: notranslate` meta blocks browser translation. Both are one-line changes if you want them.                                                                                                                                                                                        | Decision                                        |
| 9.13 | The web container limit is 256M. Local production process reached about 300 MB working set under load. Check `docker stats` on dev after a few days and raise the limit if it nears the cap.                                                                                                                                                                  | `deployment/compose`                            |
| 9.14 | If the CMS is down, pages still render from cache but `/media/*` and `/cv.pdf` fail (live proxy) and images vanish. A Cloudflare cache rule for `/media/*` covers it. The CMS fetch timeout is 10 s twice, 5 s is enough.                                                                                                                                     | Cloudflare Cache Rules; `server/utils/cms.ts`   |
| 9.15 | Uploads in the CMS have no size limit (admin only). Set one if anyone else gets admin access.                                                                                                                                                                                                                                                                 | Decision                                        |
| 9.16 | Compose hardening flags are absent: `read_only`, `cap_drop: [ALL]`, `no-new-privileges`. `node:24-alpine` is not pinned by digest. Healthcheck only covers `/robots.txt`.                                                                                                                                                                                     | `deployment/compose`                            |
| 9.17 | Mobile LCP is 3.0 to 3.2 s on `/`, `/blog` and `/projects/iont_platform` (performance 92 to 94, budget 95). Same as 7.6 with newer numbers; the cost is the Nuxt JavaScript on the lab's critical path.                                                                                                                                                       | Decision                                        |
| 9.18 | Manifest `theme_color` is `#ffffff`, the site is `#0b0d10`. `humans.txt` says "Last update: 2026-09-22". `og:type` is `article` on case studies. Low.                                                                                                                                                                                                         | Decision                                        |
| 9.19 | Privacy and Terms keep stored HTML with `li value` attributes (vnu errors on 6 rendered pages, harmless). They clear on the next save of Privacy and Terms in the CMS.                                                                                                                                                                                        | Privacy, Terms                                  |
| 9.20 | Workflows (zizmor): `_build.yml:88` expands `${{ inputs.service }}` inside a `run` block (move it to an `env` variable); checkouts without `persist-credentials: false`; `secrets: inherit` on 8 calls. Deployment files are not mine to change here.                                                                                                         | `.github/workflows`                             |
| 9.21 | `x-powered-by: Nuxt` is sent on responses; the `locale` cookie has no `Secure` flag on production (`cookieSecure` in the i18n config). Low.                                                                                                                                                                                                                   | Decision                                        |
