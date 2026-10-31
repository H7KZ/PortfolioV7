# V7 redesign state

Branch: feat/v7-redesign (from develop, which contains main) · Last update: 2026-10-29 · Milestone: M4, PR description ready

## Board

| Task                     | Status  | Gates                    | Notes                                                                                                    |
| ------------------------ | ------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| T00 Branch and baseline  | done    |                          | Branched from develop (main is behind it, no divergence). V6 screenshots not captured.                   |
| T01 Invariant and docs   | done    | G1✓                      |                                                                                                          |
| T02 Figma cache          | blocked |                          | Figma MCP not authorized in the session. Everything is built from SPEC, tokens and copy.                 |
| T03 CMS schema and seed  | done    | G1✓ G2✓                  | Migration `v7_schema`; `seed:v7` second run: 0 changed                                                   |
| T04 Tokens, fonts, shell | done    | G1✓ G3✓ G5✓              | Space Grotesk + JetBrains Mono self-hosted, metric fallbacks, CLS 0                                      |
| T05 Shared components    | done    | G1✓ G5✓                  | No `/_dev/components` route                                                                              |
| T06 Test harness         | done    |                          | `pnpm --filter @portfolio/web test:redesign`; see `apps/web/tests/redesign/README.md`                    |
| T07 to T13 Pages         | done    | G1✓ G2✓ G3✓ G5✓ G4 Figma | All routes, EN and CS                                                                                    |
| T14 SEO and redirects    | done    | G3✓                      | 301s, sitemap without redirected slugs, titles, Person JSON-LD on home and résumé, llms.txt from V7 copy |
| T15 Performance          | partial | G5 Lighthouse ✗ perf     | See Lighthouse below                                                                                     |
| T16 Accessibility sweep  | done    | G5✓                      | axe 0 serious or critical on 14 routes × 2 widths × 2 locales; keyboard paths scripted                   |
| T17 Cleanup              | done    |                          | V6 components, fonts, icon sets removed. `v7_cleanup` migration deferred, see Needs owner                |
| T18 Critique and fixes   | done    | G6 see below             | Round 1: 2 blockers, 8 majors. Round 2: all fixed except F-10 (owner); new F-14 fixed and reseeded       |
| T19 Pull request         | ready   |                          | Description below; not pushed                                                                            |

## Gate results (last run)

- G1: `pnpm verify` and `pnpm format:check` pass; no U+2014 in changed files.
- G2: `pnpm build` passes; migrations apply; `seed:v7` reruns with 0 changes.
- G3: `render.spec.ts`: 29 routes (13 pages + 404, EN and CS) render with one h1, no console error, no failed request, no horizontal scroll at the 11 widths; old project URLs answer 301; résumé grids have 4 columns at 1440.
- G5: `a11y.spec.ts`: axe zero serious or critical at 390 and 1440 in EN and CS; skip link; 44 px targets; mobile menu (fills the screen, traps focus, Esc returns focus, background inert); contact form (no early errors, summary focus, field links, success focus, `budgetRange` stored).
- G4: pending Figma.
- G6 (design critic, fresh context, two rounds): no blocker. One major open and left to the owner: F-10, em dashes and a "◆" in the Traefik post (CMS content kept by SPEC 7.7). Round 2 rubric: 4 on every line except credibility and Czech, both raised by F-14 (stale V6 meta descriptions, English on `/cs`), which is now fixed: `seed:v7` writes V7 SEO titles and descriptions for home, résumé, contact and blog in both locales plus the default site description. Remaining minors: Kreditožrouti card crop and Live badge over its logo.

### Lighthouse (mobile, simulated throttling, production build, local)

| Route                     | Perf | A11y | BP  | SEO | LCP   | CLS | TBT   |
| ------------------------- | ---- | ---- | --- | --- | ----- | --- | ----- |
| `/`                       | 89   | 100  | 100 | 100 | 3.4 s | 0   | 44 ms |
| `/projects/kreditozrouti` | 88   | 100  | 100 | 100 | 3.6 s | 0   | 21 ms |
| `/resume`                 | 93   | 100  | 100 | 100 | 2.9 s | 0   | 27 ms |
| `/contact`                | 92   | 100  | 100 | 100 | 3.2 s | 0   | 20 ms |

Measured through a local gzip proxy, as Cloudflare compresses in production. Observed (unthrottled) LCP is about 0.2 s; the simulated LCP is dominated by about 150 kB of Nuxt, Vue and i18n JavaScript that Lighthouse puts on the critical path. Done: CSS inlined, one font preload, CMS text files kept out of page payloads. Not met: Performance ≥ 95 and LCP ≤ 2.0 s. Next levers, each a trade-off for the owner: drop @nuxtjs/i18n runtime messages, or lazy-hydrate below-the-fold sections.

## Decisions

- Gallery is a new `screens` array on projects; the V6 `gallery` upload field stays until `v7_cleanup`.
- Hero placeholder is two flat fields (`heroPlaceholderLabel`, `heroPlaceholderSpec`) rather than a group.
- Media gets a read-only `formats` JSON (AVIF and 800 px siblings) so `<picture>` only offers files that exist.
- Skill names became localized (CS translates "System architecture").
- Testimonials got `show` and `quoteLanguage`; the three in the copy show, the rest are hidden.
- Strings the design needs but the copy lacks, seeded from `EXTRA` in `seed-v7.ts`: `navigation.navLabel`, `site.newTabLabel`, `resume.primarySkillLabel`, the updated `site.personDescription`.
- `copy.cs.json`: the email label and privacy note were English; translated (`E-mailová adresa *`, `Uloženo na mém vlastním serveru, smazáno po 12 měsících.`).
- "Book a 30-min call" links to `https://cal.com/<site.calLink>` in a new tab; the inline Cal.com embed is gone.
- "Next case study" skips projects without a kicker (archived V6 ones) and redirected slugs.
- Home no longer renders or ships the hidden `geoSummary` paragraph (SPEC 8.4: no hidden text); the field stays in the CMS.
- SEO titles for résumé, contact and blog reuse the navigation labels (the site appends the name); descriptions reuse each page's lead text.
- Rich text that opens with an h1 (the Traefik post) drops it on the page so there is one h1.
- Case study section headings use H2 and the contact block title H2, for consistency with home and résumé.

## Needs owner

- Authorize the Figma MCP so G4 can run. Layout choices made without the frames: project card image left from 1440 only, label column for case study sections, portrait crop 4:5, contact block title size.
- Lighthouse performance budget (see above).
- The Traefik post body and excerpt contain em dashes and a "◆" in a heading (critic F-10, major). SPEC 7.7 keeps post content, so edit it in the CMS or waive it here.
- `v7_cleanup` migration (drop V6-only fields: home taglines, names, stats, now title; services number; footer V6 fields; projects `gallery`; contact form slider and `budgetRange` message) once production is seeded.
- Confirm the facts in SPEC 14.

## Pull request description

**V7 redesign of jankominek.com**

Moves the site from the V6 look to the V7 design (Figma `jDa51GQCd58Qv9YBteYeQZ`, contract in `docs/redesign/SPEC.md`), in English and Czech, with every string still coming from Payload.

- CMS: new fields for the V7 pages, migration `v7_schema`, and `seed:v7`, which writes the copy and images, renames `corac_sith` to `deeptrace` and `iont_info` to `iont_platform`, adds `intedat`, and adds 301 redirects from the old project URLs. Runbook: `docs/runbooks/v7-content-seed.md`.
- Web: V7 tokens and type, self-hosted Space Grotesk and JetBrains Mono, new nav with an accessible mobile menu, contact block and footer, and every page rebuilt: home, case studies with placeholders and the Kreditožrouti architecture diagram, résumé, contact with budget presets, error summary and sent state, blog, post, legal, 404.
- Contact budget is now preset chips (WCAG 2.5.7); submissions store `budgetRange`.
- Checks: `pnpm --filter @portfolio/web test:redesign` (Playwright render, axe, keyboard; visual baselines opt-in). Not wired into deploys.

Gate results and Lighthouse numbers: see `docs/redesign/STATE.md`.

Owner checklist (SPEC 15):

1. Review and merge to `main` (deploys development).
2. Seed production with `docs/runbooks/v7-content-seed.md`, dry run first.
3. Turn off Cloudflare Web Analytics automatic setup for the zone.
4. Confirm the facts: DeepTrace "1000+ nodes"; IONT "ČSOB-certified" and "five months"; contact "on-site Thursdays and Fridays"; Scorecard shown as a case study.
5. Replace the Disenchantment hero and anvil row with new in-game captures; no other screenshots remain (see `OWNER-TODO.md`).
6. Have `/cs` read once by a native speaker.
7. Deploy production through the Deploy workflow.

Known gaps: G4 visual match waits for Figma access; Lighthouse performance 88 to 93 against a 95 budget.
