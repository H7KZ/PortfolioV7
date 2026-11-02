# V7 redesign tasks

Every task runs through the loop in [LOOP.md](LOOP.md). IDs are stable; reference them in commits (`feat(web): home hero (T07)`) and in `STATE.md`. "Figma" lists desktop / tablet / mobile node ids; more in [frame-map.md](design/frame-map.md).

## Graph

```
M0 Setup       T00 ─► T01 ─► T02
                       │
M1 Foundation          ├─► T03 CMS schema + seed ──────────────┐
                       └─► T04 tokens/fonts/shell ─► T05 components ─► T06 test harness
                                                               │
M2 Pages (parallel, max 3)  T07 Home  T08 Case template  T09 Architecture diagram
                            T10 Résumé  T11 Contact + states  T12 Blog/post/legal  T13 404 + mobile menu
                                                               │
M3 Polish                   T14 SEO/meta/redirects ─► T15 performance ─► T16 a11y sweep ─► T17 cleanup
                                                               │
M4 Ship                     T18 full critique + fix ─► T19 PR
```

Milestone ends: `design-critic` runs after M1 (T05 done), after M2 and after M3.

---

## M0 Setup

### T00 · Branch and baseline · lead · opus

- Create `feat/v7-redesign` from `main`. Create `STATE.md` from the template in LOOP.md section 4.
- Run the local stack (README "Local development"), seed V6 content with `migrate:v6` if the local DB is empty, capture V6 screenshots of every route at 390/768/1440 into `docs/redesign/reference/v6/` (gitignored) for before/after.
- Record Node, pnpm and Playwright versions in `STATE.md`.
- **Done:** branch exists, local site renders, `pnpm verify` passes on the untouched branch.

### T01 · Invariant and docs · lead · opus

- Replace the V6 visual invariant in `AGENTS.md` (SPEC 3.1). Add `docs/redesign/reference/` and `apps/web/tests/redesign/out/` to `.gitignore`. Link `docs/redesign/SPEC.md` from `docs/README.md`.
- **Done:** one `docs:` commit; no other file changed.

### T02 · Figma cache · figma-reader · haiku

- For every frame in frame-map.md, fetch `get_metadata` (section ids) and save it. Then fetch `get_design_context` and `get_screenshot` per **section** (not whole page) for desktop, tablet and mobile, plus every component in the Components table. Save under `docs/redesign/reference/<node-id>/{context.md,shot.png,meta.json}`.
- Pace requests: one at a time, retry once on rate limit after 60 s, log skipped nodes in `STATE.md`.
- **Done:** an index file `docs/redesign/reference/INDEX.md` maps page → section → node id → files; missing nodes listed.

---

## M1 Foundation

### T03 · CMS schema, migrations and seed · cms-schema · sonnet

- Implement every row of SPEC section 6 and the seed script in 6.1, plus `docs/runbooks/v7-content-seed.md`.
- Update `packages/content/src/contact-form.ts` (budget enum, message min 20) and the web server route that maps submissions.
- Update `apps/web/shared/types/content.ts` and `server/api/content/*` so pages receive the new fields; extend revalidation if new cached keys appear.
- Inputs: SPEC 6, `content/copy.*.json`, `assets/manifest.json`, `apps/cms/scripts/migrate-v6.ts` as the pattern.
- **Done:** G1, G2 (fresh DB migrate, `seed:v7` twice, second run reports no changes); `seed:v7 --dry-run` prints a readable diff; CMS admin shows the new fields with sensible labels and descriptions; EN and CS both populated; redirects present.

### T04 · Tokens, fonts, shell · ui-builder · sonnet

- Apply `design/tokens.css` to `app.css`; self-host Space Grotesk and JetBrains Mono (SPEC 4.2) with metric-matched fallbacks; update preloads in `nuxt.config.ts`; theme-color `#0b0d10`.
- Layout shell: skip link, `SiteNav` (desktop and mobile closed state), `SiteFooter`, `ContactCta`, backdrop (SPEC 4.4), container and gutters.
- Figma: Nav `1066:51`, Footer `1066:141`, Contact CTA `1066:126`, Home top `1068:73` / `1085:1643` / `1085:2165` (Backdrop and Nav only).
- **Done:** G1 to G5 on `/` with the old page body still in place; nav, footer and CTA match Figma at three widths; no CLS from font swap (Lighthouse CLS ≤ 0.02).

### T05 · Shared components · ui-builder · sonnet

- Build the components in SPEC section 5 except page-specific ones (`ArchitectureDiagram`, `ContactForm`). Add a hidden dev route `/_dev/components` (only when `import.meta.dev`) that renders every component in every state for screenshotting.
- Figma: Design system `1065:18`; components listed in frame-map.md.
- **Done:** G1 to G5 on `/_dev/components`; every state of Button, Link, Chip and Field matches its variant; focus ring visible on each.

### T06 · Test harness · screenshot-runner + a11y-auditor · haiku / sonnet

- Add Playwright with `@axe-core/playwright` to `apps/web` dev dependencies; `test:redesign` script; specs: `render.spec.ts` (G3: console errors, overflow at 11 widths), `visual.spec.ts` (screenshots per route × width × locale), `a11y.spec.ts` (axe + keyboard paths from SPEC 9.3), Lighthouse CI config for the four key routes.
- Run against `pnpm dev` locally and against `pnpm build && node .output/server/index.mjs` for Lighthouse.
- **Done:** harness runs on the current branch; reports land in `apps/web/tests/redesign/out/` (gitignored); README section in `apps/web/tests/redesign/README.md` (short).

**Milestone M1 critique** (design-critic, opus): tokens, type, shell and component states against Figma.

---

## M2 Pages

Run up to three page-builders in parallel worktrees. Each page task's done checks are the same: **G1 to G5 green for the page's routes in EN and CS at 390, 768, 1440, and every section listed matches its Figma node.**

### T07 · Home · page-builder

- SPEC 7.2. Figma `1068:73` / `1085:1643` / `1085:2165`.
- Watch: hero portrait is the LCP; equal-height feature cards; "More work" rows with and without links; testimonial truncation.

### T08 · Case study template · page-builder

- SPEC 7.3. Build once, verify on all six projects. Figma: Kreditožrouti `1072:448`, DeepTrace `1072:637`, IONT `1072:824`, Intedat `2728:4943`, Scorecard `1079:1018`, Disenchantment `1080:1214` and their tablet/mobile twins.
- Watch: stats only when present; window frames with placeholders; next-project wrap; back link target.

### T09 · Architecture diagram · page-builder (or ui-builder) · sonnet, effort high

- SPEC 7.4. Figma `2753:4955` / `2753:5026` / `2753:5096`. Depends on T08 for placement and T03 for data.
- Watch: edges stay attached between breakpoints (test at 768, 900, 1024, 1280); labels never overlap lines; text alternative present; works in CS (longer labels).

### T10 · Résumé · page-builder

- SPEC 7.5. Figma `1082:1076` / `2703:3557` / `2703:4648`.
- Watch: four timelines; live dots; skills columns 4/2/1; CV download.

### T11 · Contact and form states · page-builder · sonnet, effort high

- SPEC 7.6 and 8.3. Figma contact `1083:1411` / `2703:4156` / `2703:5239`; error `2758:4940` / `2758:5324` / `2758:5690`; sent `2758:5068` / `2758:5445` / `2758:5802`.
- Watch: no red before first submit; summary focus; chips as a radio group; success focus; server error keeps input; Cal.com button still works under the CSP.
- Extra done check: Playwright test submits the form against the local CMS and a `contact-submissions` record appears with `budgetRange`.

### T12 · Blog, post, legal · page-builder

- SPEC 7.7 and 7.8. Figma blog `1083:1527`, post `1084:1511`, privacy `1084:1708`, terms `1084:1829` and twins.
- Watch: prose styles, code blocks scroll inside, long Czech legal text at 390.

### T13 · 404 and mobile menu · page-builder

- SPEC 7.9 and 8.1. Figma 404 `2758:5183` / `2758:5556` / `2758:5904`; menu `2758:6029`.
- Watch: focus handling, inert background, Esc, route change closes, `noindex` on errors.

**Milestone M2 critique** (design-critic): every page, three widths, both locales.

---

## M3 Polish

### T14 · SEO, metadata, redirects · page-builder · sonnet

- SPEC 11 and the redirect list in 6.1. Verify `sitemap.xml`, `feed.xml`, `llms*.txt`, hreflang, JSON-LD with a validator.
- **Done:** old project URLs 301 in EN and CS; JSON-LD valid; sitemap lists exactly the live pages.

### T15 · Performance · ui-builder · sonnet

- Hit SPEC 1.1 item 5 and SPEC 10 budgets. Image `sizes`, preload, font subsetting, unused CSS and JS.
- **Done:** Lighthouse report for the four key routes saved; all budgets met.

### T16 · Accessibility sweep · a11y-auditor · sonnet

- Full SPEC 9 across all routes, 200 % zoom and 320 px reflow, screen-reader spot check of the home, a case study and the contact form (VoiceOver or NVDA notes as text).
- **Done:** zero serious or critical; findings fixed through the owning builder.

### T17 · Cleanup · ui-builder · sonnet

- Remove unused V6 components, CSS, fonts and preloads; remove dead CMS fields only in a `v7_cleanup` migration that the owner runs after production is seeded (prepare it, do not merge it into the main PR if the owner prefers; ask in `STATE.md`).
- **Done:** `rg` shows no references to removed files; build size not larger than before.

**Milestone M3 critique** (design-critic).

---

## M4 Ship

### T18 · Final critique and fixes · lead · opus

- design-critic over the whole site; route blockers and majors; re-run all gates on all routes.

### T19 · Pull request · lead · opus

- Prepare the PR from `feat/v7-redesign` to `main` (push and open it only if the owner asked for that in the session) with: summary, screenshots (EN, three widths, every page; CS for home and contact), gate table from `STATE.md`, Lighthouse numbers, the owner checklist (SPEC 15) and the unconfirmed facts (SPEC 14).
- Do not merge. Do not deploy.
- **Done:** PR link in `STATE.md`; lead stops.
