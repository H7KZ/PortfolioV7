# V7 redesign state

Branch: feat/v7-redesign (from develop, which contains main) · Last update: 2026-10-29 · Milestone: M2 built, M3 open

## Board

| Task                     | Status      | Gates                    | Notes                                                                                      |
| ------------------------ | ----------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| T00 Branch and baseline  | done        |                          | Branched from develop (main is behind it, no divergence). V6 screenshots not captured.     |
| T01 Invariant and docs   | done        | G1✓                      |                                                                                            |
| T02 Figma cache          | blocked     |                          | Figma MCP not authorized in the session. Everything below is built from SPEC, tokens, copy |
| T03 CMS schema and seed  | done        | G1✓ G2✓                  | Migration `v7_schema`; `seed:v7` second run: 0 changed                                     |
| T04 Tokens, fonts, shell | done        | G1✓ G3✓                  | Space Grotesk + JetBrains Mono self-hosted, metric fallbacks                               |
| T05 Shared components    | done        | G1✓                      | No `/_dev/components` route yet                                                            |
| T06 Test harness         | not started |                          | Playwright + axe not added                                                                 |
| T07 Home                 | built       | G1✓ G3✓ G4 pending Figma |                                                                                            |
| T08 Case template        | built       | G1✓ G3✓ G4 pending Figma | All six case studies render; next-project wraps                                            |
| T09 Architecture diagram | built       | G1✓ G3✓ G4 pending Figma | Labels checked inside the card at 320, 390, 1024 in EN and CS                              |
| T10 Résumé               | built       | G1✓ G3✓ G4 pending Figma |                                                                                            |
| T11 Contact and states   | built       | G1✓ G3✓ G4 pending Figma | Empty submit, summary focus, field links, success focus, `budgetRange` stored: checked     |
| T12 Blog, post, legal    | built       | G1✓ G3✓ G4 pending Figma |                                                                                            |
| T13 404 and mobile menu  | built       | G1✓ G3✓ G4 pending Figma | Menu focus, inert, Esc, focus return: checked                                              |
| T14 SEO and redirects    | partial     |                          | 301s and sitemap filtering done; titles, Person JSON-LD scope, llms.txt not done           |
| T15 to T19               | not started |                          |                                                                                            |

G3 here means: every route answers 200 (404 for unknown, 301 for old project URLs) in EN and CS, and no horizontal overflow at 320 and 390 on home, a case study, résumé, contact, post and privacy. The full 11-width matrix waits for T06.

## Decisions

- Gallery is a new `screens` array on projects; the V6 `gallery` upload field stays until `v7_cleanup`.
- Hero placeholder is two flat fields (`heroPlaceholderLabel`, `heroPlaceholderSpec`) rather than a group.
- Media gets a read-only `formats` JSON (AVIF and 800 px siblings) so `<picture>` only offers files that exist. The seed uploads every file in the manifest and points relations at the full WebP.
- Skill names became localized (CS translates "System architecture").
- Testimonials got `show` and `quoteLanguage`; the three in the copy show, the rest are hidden.
- Strings the design needs but the copy JSON lacks, seeded from `EXTRA` in `seed-v7.ts`: `navigation.navLabel`, `site.newTabLabel` ("(opens in a new tab)"), `resume.primarySkillLabel` ("(daily)"), the updated `site.personDescription`.
- "Book a 30-min call" links to `https://cal.com/<site.calLink>` in a new tab; the inline Cal.com embed is gone.
- Case study sequence for "Next case study" skips projects without a kicker (archived V6 ones) and redirected slugs.
- Contact on tablet and mobile drops the "What to include" card, per SPEC 7.6 order.

## Needs owner

- Authorize the Figma MCP so G4 (visual match) can run; layout choices not stated in SPEC were made without the frames (project card image left only from 1440, section label column, portrait crop 4:5).
- Confirm the facts in SPEC 14.
