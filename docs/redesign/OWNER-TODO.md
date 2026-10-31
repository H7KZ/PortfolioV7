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

| Claim                                                               | Field                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| IONT: "ČSOB-certified", "five months" to launch                     | Projects > IONT platform > Case study > `lede`, `impact`, and Home card > `description`  |
| DeepTrace: "Supports 1000+ nodes", "SHA-256"                        | Projects > DeepTrace > Case study > `contributions`                                      |
| Contact: "on-site Thursdays and Fridays"                            | Globals > Contact > `intro`                                                              |
| Scorecard shown as a case study, not linked on LinkedIn             | Projects > Scorecard; Home page > More work                                              |
| "Seven companies", "12+ shipped projects"                           | Home page > Hero > `valueProp`; Résumé > `bio`, Impact                                   |
| "500+ connections · 6 recommendations"                              | Globals > Contact > `linkedinSub`. Typed text, update it by hand when the numbers change |
| "Right now" rows: VEROC Group, Ohlídáme, 200+ students, teaching C# | Home page > Now > `items`                                                                |
| Kreditožrouti: "588 visitors", "204 finished setup", "35%"          | Projects > Kreditožrouti > Case study > `impact`                                         |

## 4. Home

- **Flagship is now IONT platform** (badge and first position, EN and CS). Nothing else is needed for the slot: it has a hero image, three metrics, four chips and a card description.
- **Decide:** the hero sentence still lists the projects in the old order, DeepTrace first: "A zero-trust data provenance platform, an EV charging network with live payments, and a course scheduler". To lead with IONT, change `globals.home.hero.valueProp` in both copy files. Left as it is because it is your sentence.
- **Check:** the recommendations link now shows at every width and opens `https://www.linkedin.com/in/jan-kominek/details/recommendations/`, as do the "Read more" links on the quotes. LinkedIn asks logged-out visitors to sign in on that page. If you prefer the public profile, empty Home page > Sections > `allRecommendationsUrl`.
- **Check:** `{count}` in the link is the number of published testimonials, six today (three shown, three hidden). Keep the collection in step with LinkedIn.
- **Decide:** Marek Vospěl, Petr Krejčí and Zdeněk Glazer stay hidden. To show one, add it to `collections.testimonials` in both copy files; the seed hides every other testimonial.

## 5. Screenshots per project

Each row is one window on the case study. Field: Projects > project > Case study > Gallery > row N > `image`. Rows count from 1. An uploaded image replaces the placeholder and its label. No client data in any capture.

### IONT platform (flagship)

| Row | Window                                 | Show                                               | Capture                     |
| --- | -------------------------------------- | -------------------------------------------------- | --------------------------- |
| 5   | `~/projects/iont_platform/driver-app`  | Driver app on a phone: find a charger, pay, charge | 390 × 844 at 3×, demo data  |
| 6   | `~/projects/iont_platform/admin-panel` | On-device admin panel on the charger screen        | 1440 × 900 at 2×, demo data |
| 7   | `~/projects/iont_platform/hardware`    | A real charger with the app in hand                | Photo, landscape, well lit  |

Rows 1 to 4 and the hero already have images. Row 5 repeats what the `iont-phones` image on row 2 shows, so deleting it is also fine.

### DeepTrace

| Row | Window                               | Show                                                | Capture                     |
| --- | ------------------------------------ | --------------------------------------------------- | --------------------------- |
| 2   | `~/projects/deeptrace/lineage-graph` | Lineage graph, full screen                          | 1440 × 900 at 2×, demo data |
| 3   | `~/projects/deeptrace/verification`  | Verification passed vs. tampered link, side by side | 1440 × 900 at 2×, demo data |

No metrics yet. Case study > `impact` is empty, so the section is hidden. Add three rows (label, value, sub) if you can publish numbers.

### Kreditožrouti

| Row | Window                               | Show                                          | Capture                     |
| --- | ------------------------------------ | --------------------------------------------- | --------------------------- |
| 2   | `~/projects/kreditozrouti/timetable` | Timetable builder with a real schedule        | 1440 × 900 at 2×, demo data |
| 3   | `~/projects/kreditozrouti/search`    | Course search with filters                    | 1440 × 900 at 2×, demo data |
| 4   | `~/projects/kreditozrouti/usage`     | Usage chart: 588 visitors, 204 finished setup | 1440 × 900 at 2×, demo data |

### Intedat

The only project with no image at all. Its home card shows a dotted empty panel, and it is one of the four cards on the home page, so this is the most visible gap on the site.

| Slot                            | Window                      | Show                       | Capture                     |
| ------------------------------- | --------------------------- | -------------------------- | --------------------------- |
| Case study > `thumbnail` (hero) | `~/projects/intedat/main`   | Main workflow screen       | 1440 × 900 at 2×, demo data |
| Gallery row 1                   | `~/projects/intedat/search` | Search results             | 1440 × 900 at 2×, demo data |
| Gallery row 2                   | `~/projects/intedat/detail` | A detail or editing screen | 1440 × 900 at 2×, demo data |

No metrics yet: Case study > `impact` is empty. Check that Intedat allows showing any of this.

### Scorecard

| Row | Window                              | Show                                        | Capture                     |
| --- | ----------------------------------- | ------------------------------------------- | --------------------------- |
| 2   | `~/projects/corac_scorecard/report` | Report builder next to an exported PDF page | 1440 × 900 at 2×, demo data |

No metrics yet: Case study > `impact` is empty.

### Disenchantment

| Row | Window                           | Show                                              | Capture                     |
| --- | -------------------------------- | ------------------------------------------------- | --------------------------- |
| 2   | `~/projects/disenchantment/repo` | GitHub repository header with stars and downloads | 1440 × 900 at 2×, demo data |

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
