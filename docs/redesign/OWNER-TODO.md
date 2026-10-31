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

| Claim                                                               | Field                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| IONT: "ČSOB-certified", "five months" to launch                     | Projects > IONT platform > Case study > `lede`, `impact`, and Home card > `description`  |
| DeepTrace: "Supports 1000+ nodes"                                   | Projects > DeepTrace > Case study > `contributions`                                      |
| Contact: "on-site Thursdays and Fridays"                            | Globals > Contact > `intro`                                                              |
| Scorecard shown as a case study, not linked on LinkedIn             | Projects > Scorecard; Home page > More work                                              |
| "Seven companies", "12+ shipped projects"                           | Home page > Hero > `valueProp`; Résumé > `bio`, Impact                                   |
| "500+ connections · 6 recommendations"                              | Globals > Contact > `linkedinSub`. Typed text, update it by hand when the numbers change |
| "Right now" rows: VEROC Group, Ohlídáme, 200+ students, teaching C# | Home page > Now > `items`                                                                |
| Kreditožrouti: "589 visitors", "204 finished setup", "35%"          | Projects > Kreditožrouti > Case study > `impact`                                         |

## 4. Home

- **Flagship is now IONT platform** (badge and first position, EN and CS). Nothing else is needed for the slot: it has a hero image, three metrics, four chips and a card description.
- **Decide:** the hero sentence still lists the projects in the old order, DeepTrace first: "A zero-trust data provenance platform, an EV charging network with live payments, and a course scheduler". To lead with IONT, change `globals.home.hero.valueProp` in both copy files. Left as it is because it is your sentence.
- **Check:** the recommendations link now shows at every width and opens `https://www.linkedin.com/in/jan-kominek/details/recommendations/`, as do the "Read more" links on the quotes. LinkedIn asks logged-out visitors to sign in on that page. If you prefer the public profile, empty Home page > Sections > `allRecommendationsUrl`.
- **Check:** `{count}` in the link is the number of published testimonials, six today (three shown, three hidden). Keep the collection in step with LinkedIn.
- **Decide:** Marek Vospěl, Petr Krejčí and Zdeněk Glazer stay hidden. To show one, add it to `collections.testimonials` in both copy files; the seed hides every other testimonial.

## 5. Screenshots per project

Each row is one window on the case study. Field: Projects > project > Case study > Gallery > row N > `image`. Rows count from 1. No placeholders are left. No client data in any capture. New images need a new filename, because the seed keeps a file it already has.

Every image was rebuilt at 2400 px where a sharp source exists, so it stays crisp on 2× screens. The site also serves 1600 and 800 px sizes.

### IONT platform (flagship)

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

**To do:** new in-game captures, yours by hand. Row 2 is a fresh 2× capture of the GitHub repository. The hero (920 px) and the anvil row (from an 800 px GIF) stay as they are until then, because no sharper source exists.

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
