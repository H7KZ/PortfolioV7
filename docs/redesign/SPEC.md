# V7 redesign: implementation spec

Status: ready to build · Written 2026-10-29 · Owner: Jan Komínek · Design: Figma `jDa51GQCd58Qv9YBteYeQZ`

This is the contract for moving jankominek.com from the V6 look to the V7 design. It is written for coding agents first and humans second. Read it top to bottom once, then use the section numbers as references. [TASKS.md](TASKS.md) breaks it into work; [LOOP.md](LOOP.md) says how each task is built, checked and accepted.

---

## 0. What is in this folder

| Path                                  | What it is                                                                   | Who reads it             |
| ------------------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| `SPEC.md`                             | This file. Goal, rules, every page, component, state and check.              | Everyone                 |
| `TASKS.md`                            | Task graph with IDs, owners, models, inputs, outputs and done checks.        | Lead, implementers       |
| `LOOP.md`                             | The build, verify, critique, fix loop, gates, state file and stop rules.     | Lead, QA                 |
| `STATE.md`                            | Created by the lead on first run. Live progress log.                         | Lead, owner              |
| `design/tokens.json`                  | Colors, radius, spacing, type styles from Figma (W3C token format).          | ui-builder               |
| `design/tokens.css`                   | The same tokens as CSS custom properties plus a Tailwind v4 `@theme`.        | ui-builder               |
| `design/frame-map.md`                 | Every Figma frame and component id per page and breakpoint.                  | Everyone                 |
| `content/copy.en.json`                | All visible copy, grouped by the CMS global or collection that will hold it. | cms-schema, page-builder |
| `content/copy.cs.json`                | Czech translation, same shape.                                               | cms-schema               |
| `assets/`                             | AVIF and WebP images with `manifest.json`.                                   | cms-schema               |
| `../../.claude/agents/*.md`           | Subagent definitions.                                                        | Claude Code              |
| `../../.claude/skills/redesign-loop/` | The loop as a skill the lead loads.                                          | Lead                     |

---

## 1. Goal

Ship the V7 design to jankominek.com in English and Czech, at 390, 768 and 1440 px and everything between, with every string still coming from Payload, without regressing performance, accessibility, SEO or the CMS editing flow.

The portfolio exists to win part-time B2B contracts. Every decision below serves one path: a CTO or founder lands, understands in ten seconds that Jan takes products from an empty repo to production, reads one case study, and sends a brief or books a call.

### 1.1 Definition of done (all must hold)

1. Every page and state in [frame-map.md](design/frame-map.md) is implemented and passes gate G4 (visual match) at 390, 768 and 1440 px, in EN and CS.
2. All copy renders from the CMS. `content/copy.en.json` and `copy.cs.json` are seeded through a rerunnable script; no visible string lives in a `.vue` file or locale JSON.
3. `pnpm verify`, `pnpm format:check` and `pnpm build` pass on the branch.
4. axe-core reports zero serious or critical issues on every route in both locales; the keyboard walkthrough in section 9.3 passes.
5. Lighthouse (mobile, throttled) on `/`, `/projects/kreditozrouti`, `/resume`, `/contact`: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100. LCP ≤ 2.0 s, CLS ≤ 0.02, INP ≤ 150 ms (lab TBT ≤ 150 ms).
6. Old URLs still work: `/projects/corac_sith`, `/projects/iont_info`, `/projects/iont_charge`, `/projects/iont_admin` redirect (301) to their new pages; every V6 redirect still resolves.
7. The design critic (fresh context, section 13) returns no blocker and no major finding.
8. No em dash (U+2014) anywhere in the diff: `rg -n '\x{2014}'` returns nothing in changed files and in seeded copy.
9. A pull request description is ready (screenshots for every page at three widths, the gate report from `STATE.md`, the owner checklist from section 15). The lead pushes `feat/v7-redesign` and opens the PR against `main` only if the owner asked for that in the session; otherwise the description waits in `STATE.md`. Nobody pushes to `main` or deploys; the owner merges.

### 1.2 Non-goals

- No new features beyond the states the design shows (no dark/light switch, no blog comments, no search).
- No CMS admin redesign.
- No deployment or infrastructure change, except the CSP note in section 12.
- No real screenshots of client products. The design ships labelled placeholders; the owner replaces them later in the CMS.

---

## 2. Sources of truth and precedence

When two sources disagree, the higher one wins and the conflict is logged in `STATE.md` under "Conflicts":

1. **Owner instructions** in the session.
2. **Figma** (`jDa51GQCd58Qv9YBteYeQZ`, page `1060:30`). Layout, spacing, hierarchy, states, responsive behaviour. Desktop frames are canonical for copy; tablet and mobile frames are canonical for their own layout.
3. **`content/copy.*.json`**. Exact strings. Extracted from Figma on 2026-10-29; if Figma text changed later, Figma wins and the JSON is updated in the same commit.
4. **This spec.** Behaviour Figma cannot show: focus order, validation, motion, semantics, data flow.
5. **Repository rules** in `AGENTS.md` and `deployment/AGENTS.md`, except the one invariant this redesign replaces (section 3.1).
6. **The V6 implementation.** Reference only, for data flow and edge cases. Never for visuals.

Figma access: the file lives in the owner's "Diář FISáka" team, which has the higher MCP plan limit. Fetch through the `figma-reader` agent only, which caches results under `docs/redesign/reference/` (gitignored) so the same node is never fetched twice. If the Figma MCP is unavailable or rate limited, keep building from the cache, the copy JSON and this spec, and mark affected checks as "pending Figma" in `STATE.md`.

---

## 3. Constraints

### 3.1 Repository invariants

All invariants in `AGENTS.md` stay in force, with one replacement. In the first commit of the branch, change:

> The visual design matches V6. Change markup or classes only when asked.

to:

> The visual design matches V7 (Figma `jDa51GQCd58Qv9YBteYeQZ`, see `docs/redesign/`). Change markup or classes only when asked.

Consequences that agents most often get wrong:

- **Every visible string comes from the CMS.** That includes aria-labels, alt text, error messages, the 404 suggestions, the architecture diagram labels and the "current" marker in the mobile menu. If a field is missing, add it (section 6). Brand names inside data (for example `Vue 3` in a stack list) are CMS data too.
- **The web reads the CMS only on the server.** The contact form validation schema comes from `packages/content` and the CMS config, never from a client fetch.
- **New cached data must be cleared by `/_internal/revalidate`.**
- **Schema change = collection or global edit, `generate:types`, `migrate:create`, migration committed.** Never hand-edit `payload-types.ts`.
- **No em dashes.** Use a colon, comma, full stop or parentheses. En dashes only in ranges (`2023–2024`, `€2–5k`).
- **Comments explain why, not what.** Conventional commits.
- **Tests.** The house rule is "no tests unless asked". The owner asks for this redesign: add the Playwright visual and axe checks in section 13, under `apps/web/tests/redesign/`, runnable with `pnpm --filter @portfolio/web test:redesign`. Do not wire them into the deploy workflow; the owner decides that later.

### 3.2 Git

- Branch `feat/v7-redesign` from `main`. One branch, many commits. Parallel agents work in git worktrees on `feat/v7-redesign--<task-id>` and the lead merges them back.
- Commit per task, conventional: `feat(web): contact form budget presets`, `feat(cms): project architecture block`, `chore(redesign): seed v7 copy`.
- Never push to `main`, never run a deploy workflow, never touch `deployment/toolkit*` or `deployment/vendor/`.
- Never commit secrets, `.env` files, database dumps or anything from `docs/redesign/reference/`.

### 3.3 Client confidentiality

Case studies describe client work (CORAC Engineering, IONT tech, Intedat, VEROC Group). Show only what the copy JSON says. No internal URLs, API shapes, repository names, screenshots with real data, or architecture of client systems. The only architecture diagram is Kreditožrouti, which is Jan's own product and public on GitHub.

---

## 4. Design system

### 4.1 Tokens

Replace the V6 `:root` tokens in `apps/web/app/assets/css/app.css` with `design/tokens.css`. Keep the prose overrides that still apply; delete V6 aliases (`--font-dmsans`, `--font-robotomono`, `--bg-2`...) once no component uses them. Tailwind v4 reads tokens through `@theme inline`; use utilities like `bg-surface`, `text-ink-soft`, `border-line`, `rounded-lg`, `font-mono`.

Color roles (from Figma variables; hex in `tokens.json`):

| Token                   | Use                                                                                       | Never use for                         |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| `bg`                    | Page                                                                                      |                                       |
| `surface`, `surface-2`  | Cards; nested blocks, inputs on cards, diagram nodes                                      | Text                                  |
| `line`, `line-strong`   | Card borders, dividers                                                                    | Input borders (use `control`)         |
| `ink`                   | Headings, primary text                                                                    |                                       |
| `ink-soft`              | Body copy                                                                                 |                                       |
| `mute`, `faint`         | Meta, labels, placeholders                                                                | Body paragraphs                       |
| `accent`                | Primary button fill, live dot, request path in the diagram, one word in a heading at most | Large text blocks, links in body copy |
| `accent-hover`          | Primary button hover                                                                      |                                       |
| `accent-soft`           | Selected chip fill, success icon background                                               |                                       |
| `control`               | Input and secondary-button borders, diagram edges                                         |                                       |
| `danger`, `danger-soft` | Errors only                                                                               | Decoration                            |
| `focus`                 | Focus ring only                                                                           |                                       |

`mute` and `faint` were raised for APCA; do not darken them. Every text and background pair used in Figma passes WCAG 2.2 AA and APCA Lc 60 for body sizes (placeholders are Lc 48 by design and exempt).

### 4.2 Type

Fonts: **Space Grotesk** (400, 500, 700) and **JetBrains Mono** (400, 500), both OFL. Self-host as variable woff2 in `apps/web/public/fonts/`, Latin and Latin Extended subsets (Czech needs `ěščřžýáíéůú`), `font-display: swap`, preload the two Latin files used above the fold (Space Grotesk 700 and 400 if separate files). Add the OFL text files. Remove DM Sans, Fraunces and Roboto Mono files and their preloads once nothing references them. Set `size-adjust` fallbacks (`ascent-override` and friends) so the swap causes no layout shift.

Styles (sizes in px, mobile to desktop; fluid ones use the `clamp()` values in `tokens.css`):

| Style         | Size    | Weight              | Line height  | Tracking | Use                                                                |
| ------------- | ------- | ------------------- | ------------ | -------- | ------------------------------------------------------------------ |
| Display XL    | 40 → 64 | 700                 | 0.94 to 0.98 | -0.04em  | Home headline only                                                 |
| Display L     | 34 → 52 | 700                 | 1.0 to 1.04  | -0.03em  | Page titles (case, résumé, contact, blog, 404)                     |
| H2            | 26 → 36 | 700                 | 1.08 to 1.12 | -0.027em | Section headings                                                   |
| H3            | 20 → 22 | 500                 | 1.22 to 1.25 | -0.015em | Card titles, timeline roles                                        |
| H4            | 18      | 500                 | 1.32         | -0.011em | Small card titles                                                  |
| Body L        | 17 → 18 | 400                 | 1.52         | 0        | Leads                                                              |
| Body M        | 16      | 400                 | 1.6          | 0        | Body                                                               |
| Body M Medium | 16      | 500                 | 1.5          | 0        | Emphasis, diagram node names                                       |
| Body S        | 14      | 400                 | 1.56         | 0        | Secondary text, errors                                             |
| Quote         | 17      | 400                 | 1.56         | 0        | Testimonials                                                       |
| Mono Label    | 12      | 500                 | 1.3          | 0        | Labels, chips' meta, legend. Sentence case, no uppercase transform |
| Mono S        | 13      | 400                 | 1.5          | 0        | Meta, tags, terminal rows                                          |
| Mono M        | 15      | 500                 | 1.4          | 0        | Stat units, small mono emphasis                                    |
| Stat          | 32      | 700 (Space Grotesk) | 1.0          | -0.037em | Stat values                                                        |
| Button        | 15      | 500                 | 1.0          | 0        | Buttons, nav links                                                 |

Rules: body copy never below 16 px; nothing below 12 px; measure 45 to 75 characters for paragraphs (cap paragraph width at `68ch`); headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`. No all-caps labels. Line breaks in headings come from `\n` in CMS text; render with `white-space: pre-line` on headings only.

### 4.3 Layout and breakpoints

- Container 1200 px centered, side padding `--gutter` (20 px at 390, 40 px at 768).
- Breakpoints: `md` 768, `lg` 1024, `xl` 1440. Design frames are 390, 768 and 1440. Between frames the layout must hold without overflow, clipped text or collisions; check 320, 360, 414, 600, 900, 1024, 1280 and 1920 in gate G4.
- Desktop sections use a 360 + 840 two-column grid (label column, content column). Tablet and mobile stack them.
- Vertical rhythm between sections: 120 / 96 desktop, 96 / 64 tablet, 72 / 48 mobile (exact spacers are in each frame).
- No horizontal scroll at any width. Tables and code blocks scroll inside their own box.

### 4.4 Backdrop

Dot grid plus a soft green glow behind the top of each page only (the `Backdrop` layer in every frame: 900 px tall desktop, 820 tablet, 720 mobile). Implement as a CSS background on a positioned, `aria-hidden`, `pointer-events: none` element with a radial gradient and a repeating dot pattern. It fades out before the first content section ends. Not on cards, not repeated further down.

### 4.5 Motion

Short and purposeful: 150 ms for color and border, 200 ms for transforms, `cubic-bezier(0.2, 0, 0, 1)`. Allowed: hover color, focus ring, menu open (opacity and 8 px translate), chip select, form success swap, View Transitions between pages (already enabled). Nothing animates on scroll. Respect `prefers-reduced-motion` (rule included in `tokens.css`).

### 4.6 Icons and marks

Use unplugin-icons (`~icons/...`) for any icon; the design mostly uses text glyphs (`→`, `↗`, `↓`, `✓`, `!`, `@`). Decorative glyphs get `aria-hidden="true"`; meaning goes in text. The wordmark is text (`jankominek.com` with the green caret mark), not an image.

---

## 5. Components

Build these once in `apps/web/app/components/` and compose pages from them. Names are suggestions; keep the repo's existing naming style. Each row maps to a Figma component or a named frame.

| Vue component             | Figma                                              | Props (data from CMS)                                             | States and behaviour                                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UiButton`                | Button `1065:27`                                   | `kind: 'primary' \| 'secondary'`, `to` or `href` or `type`, label | Default, hover, focus, disabled, loading (label swaps to the CMS `sendingLabel`, `aria-busy`). Min height 48 desktop, 44 everywhere. No arrow glyph (the Arrow property is off by design). Renders `<a>` for navigation, `<button>` for actions.               |
| `UiLink`                  | Link `2756:4913`                                   | label, `to`, `current`                                            | Default `ink-soft`, hover `ink` plus underline (offset 4 px), focus ring, current: `ink` plus a 16×2 accent bar below and `aria-current="page"`. Hit area 44 px tall.                                                                                          |
| `UiTag`                   | Tag `1065:28`                                      | label                                                             | Static. Mono S on `surface-2`, radius sm.                                                                                                                                                                                                                      |
| `UiStatus`                | Status `1065:36`                                   | label, `tone: 'live' \| 'neutral'`                                | Live has the accent dot. The dot is decorative; the label carries meaning.                                                                                                                                                                                     |
| `UiChip` / `ChoiceChips`  | Choice chip `2756:4967`                            | options `{key,label}[]`, `modelValue`                             | Radio group: `role="radiogroup"` with native `<input type="radio">` visually hidden inside labels, arrow keys move selection, one tab stop. Selected shows `✓` and `accent-soft` fill. 44 px tall. Optional field: clicking the selected chip again clears it. |
| `UiField`                 | Field `2756:4954`                                  | label, name, type, placeholder, error                             | Default, focus (2 px accent border), filled, error (2 px danger border, message below with `!`), disabled. `<label for>`, `aria-invalid`, `aria-describedby` to the error id. Textarea variant for Message.                                                    |
| `SectionHeader`           | Section Header `1065:57`                           | heading, sub                                                      | The label row above the heading is hidden in V7. Do not render it.                                                                                                                                                                                             |
| `SiteNav`                 | Nav `1066:51`                                      | navigation global                                                 | Desktop: wordmark, links, `Hire me` secondary button, `EN / CS` toggle. Mobile: wordmark, `Hire me`, menu button. See 8.1.                                                                                                                                     |
| `MobileMenu`              | Menu · open `2758:6029`                            | navigation global                                                 | Full-screen panel, see 8.1.                                                                                                                                                                                                                                    |
| `SiteFooter`              | Footer `1066:141`                                  | footer global                                                     | Copyright, Privacy, Terms, RSS, LinkedIn ↗. Link wrappers 44 px tall.                                                                                                                                                                                          |
| `ContactCta`              | Contact CTA `1066:126`                             | footer global `cta`                                               | Title with the accent word, body, two buttons, terminal card with key and value rows. Above the footer on every page except Contact, 404, Privacy, Terms.                                                                                                      |
| `ProjectCard`             | Project Card `1067:98` (Feature)                   | project `card` group                                              | Image left (desktop) or top, meta, title, description, four tags, "Read case study" link. Whole card is one link (title link with a stretched pseudo-element), not nested links. Badge (`Flagship`, `Live`) only when set.                                     |
| `MoreWorkRow`             | Home `More work list`                              | home `more.items[]`                                               | Meta, title, description, trailing link label. Rows without `href` render as plain text with no hover.                                                                                                                                                         |
| `NowList`                 | Home `Now running`                                 | home `now`                                                        | Label plus key and value rows.                                                                                                                                                                                                                                 |
| `EngagementCard`          | Home `Row · Engagements`                           | services collection                                               | Status label, title, body, tags.                                                                                                                                                                                                                               |
| `Testimonial`             | Testimonial `1067:99`                              | testimonials collection                                           | Quote cut at `quoteLimit` on a word boundary with `…`, then "Read more ↗" to the LinkedIn recommendations page (`target="_blank" rel="noopener"`). Initials avatar. `<figure>`, `<blockquote>`, `<figcaption>`.                                                |
| `StatTile`                | Stat `1065:40`                                     | `{label, value, sub}`                                             | Value in Stat style. A `<dl>` group for a row of tiles.                                                                                                                                                                                                        |
| `TimelineItem`            | Timeline Item `1067:164`                           | experience entry                                                  | Date, role, organization, summary, up to three highlights, tags. Live state (accent dot) when `current`. Highlights are a `<ul>`; no leading dash in data.                                                                                                     |
| `CaseHeader`              | Case `Header`                                      | project                                                           | Back link, kicker, title, lede, role, timeline, sector as a `<dl>`.                                                                                                                                                                                            |
| `WindowFrame`             | Case `Hero` and `Gallery` items                    | `{path, image?, placeholder?}`                                    | Fake window chrome with the mono path in the title bar. Contains either an image (`<picture>` AVIF, WebP) or a `ScreenshotPlaceholder`.                                                                                                                        |
| `ScreenshotPlaceholder`   | Screenshot placeholder `2733:4800`                 | `{label, spec}`                                                   | Dashed surface with a camera glyph, label and spec. Only rendered when no image is set. Visible label text comes from the CMS; it is real content, not hidden.                                                                                                 |
| `ArchitectureDiagram`     | Kreditožrouti `Architecture` (`2753:4955` desktop) | project `architecture` group                                      | See 7.4.                                                                                                                                                                                                                                                       |
| `ContactForm`             | Contact `Project brief`                            | contact-form global                                               | See 8.3. Replaces the V6 form. Reuse V6 logic for submit, rate limit and analytics.                                                                                                                                                                            |
| `ErrorPage` (`error.vue`) | 404 frames                                         | errors global                                                     | See 7.9.                                                                                                                                                                                                                                                       |

Delete V6 components that end up unused (`BoldButton`, `JanKominekName`, `SliderInput` and others) in the cleanup task, after checking with `rg` that nothing imports them.

---

## 6. Content model changes (Payload)

Every change: edit the global or collection, `pnpm --filter @portfolio/cms run generate:types`, `pnpm --filter @portfolio/cms run migrate:create v7_<name>`, commit the migration. All new text fields use the `text()`/`textarea()` helpers so they are localized. Keep old fields until the seed has copied their data and nothing reads them; remove them in a final migration (`v7_cleanup`) only after the owner confirms production is seeded.

| Where                                  | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Why                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `home` Hero                            | Add `eyebrowCommand` (text), `headline` (textarea), `portraitCaption` group (`user`, `path`, `note`). Reuse `valueProp`, `primaryCta`, `secondaryCta`, `availability.detail` (as the availability line), `portrait`. Stop rendering `firstName`, `lastName`, `stats`, `taglines`.                                                                                                                                                                                                                                                                                                           | V7 hero has a command line, a two-line headline and no stat strip.           |
| `home` Now                             | Replace the single `now` group with `now.label` plus `now.items[]` (`key`, `value`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Four rows.                                                                   |
| `home` Sections                        | Add `more` section header plus `more.items[]` (`meta`, `title`, `description`, `linkLabel`, `href` not localized, `external` checkbox). Remove `viewProjectLabel` from rendering.                                                                                                                                                                                                                                                                                                                                                                                                           | "More work" list mixes projects and non-project entries.                     |
| `services`                             | Add `label` (localized text) used as the status label; stop rendering `number`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Engagement cards show "From scratch", "Rescue", "Scale".                     |
| `projects`                             | Add `kicker` (text), `card.year` (text, not localized), `card.meta` (text). Replace `gallery` (upload hasMany) with an array: `image` (upload, optional), `path` (text, not localized), `placeholderLabel` (text), `placeholderSpec` (text). Add `heroPath` and `heroPlaceholder` group. Add optional `architecture` group: `nodes[]` (`key` not localized, `name`, `tech`, `external` checkbox), `edges[]` (`from`, `to`, `kind` select request/sync/async, `label`, `labelShort`, `bidirectional`), `legend` (`request`, `sync`, `async`), `observability`, `caption`, `textAlternative`. | Placeholders, window paths and the diagram.                                  |
| `project-page`                         | Add `architectureLabel`, `nextLabel`, `placeholderLabel`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                              |
| `navigation`                           | Add `closeMenuLabel`, `currentLabel`, `mobileMenu` group (`extraItems[]`, `primaryCta` link, `email`), `languageNames` (`en`, `cs`).                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Mobile menu.                                                                 |
| `footer`                               | Restructure the CTA: `cta.title` (textarea), `cta.titleAccent` (text, the words to tint), `cta.body`, `cta.primaryCta` link, `cta.secondaryCtaLabel` (opens Cal.com), `cta.terminalPrompt`, `cta.terminalRows[]` (`key` not localized, `value`, `href`, `live`). Add `copyright`.                                                                                                                                                                                                                                                                                                           | V7 contact block.                                                            |
| `contact`                              | Add `emailSub`, `briefSentLabel`, `skipFormCta`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                                                              |
| `contact-form`                         | Replace the `budget` slider group with `budget.label`, `budget.hint`, `budget.options[]` (`key` stable, `label`). Add `advancedHint`, `privacyNote`, `success.title` (with `{name}`), `success.titleNoName`, `success.body`, `success.sendAnotherLabel`, `validation.summaryOne`, `validation.summaryMany`, `validation.tooShort`. Remove `validation.budgetRange` after cleanup.                                                                                                                                                                                                           | Presets replace the drag-only slider (WCAG 2.5.7); success and error states. |
| `packages/content/src/contact-form.ts` | `budget` becomes an optional string enum of the configured option keys. Message gets `min(20)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                                              |
| `contact-submissions`                  | Add `budgetRange` (text). Keep the old numeric `budget` for history.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                              |
| `errors`                               | Add `suggestions[]` (`icon` not localized, `label`, `sub`, `href`) and `codeLabel` (`HTTP {status}`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 404 design.                                                                  |
| `blog`                                 | Add `lead`, `readLabel`, `draftingLabel`, `nextUpText`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                              |
| `site`                                 | No schema change. Update `jobTitle`, `personDescription`, `knowsAbout`, `sameAs` in the seed to match the résumé copy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Structured data.                                                             |

### 6.1 Seed script

Add `apps/cms/scripts/seed-v7.ts` and `pnpm --filter @portfolio/cms run seed:v7`, modelled on `migrate-v6.ts`:

- Reads `docs/redesign/content/copy.en.json` and `copy.cs.json` (path overridable by `V7_COPY_DIR`) and `docs/redesign/assets/manifest.json`.
- Writes English first, then Czech, reusing English array row ids so localized sub-fields pair up (same technique as V6).
- Upserts projects by slug; creates `intedat`, `deeptrace`, `iont_platform`; moves content from `corac_sith` and `iont_info` to the new slugs; unpublishes nothing; sets `card.show` false for `pangolin`, `noteful`, `iont_charge`, `iont_admin`, `corac_scorecard`, `disenchantment` (the last two are linked from "More work" instead).
- Adds redirects (301): `/projects/corac_sith` → `/projects/deeptrace`, `/projects/iont_info` → `/projects/iont_platform`, `/projects/iont_charge` → `/projects/iont_platform`, `/projects/iont_admin` → `/projects/iont_platform`, and the same under `/cs`.
- Uploads assets from `docs/redesign/assets` into `media` (once, keyed by filename) with English and Czech alt text the script asks for in a `ALT` map at the top of the file. Alt text describes what the picture shows, not "screenshot of".
- Strips the trailing `*` from skill names and sets `primary`.
- Is idempotent and prints a summary. Has a `--dry-run` flag that prints the diff per document without writing.
- Never runs against production from an agent. Agents run it against the local Docker database only. Production seeding is an owner step in section 15, using the same tunnel procedure as `docs/runbooks/content-import.md`. Add a short runbook `docs/runbooks/v7-content-seed.md` and link it from `docs/README.md`.

---

## 7. Pages

Each page lists its sections in order with the Figma section name in brackets. Desktop ids are in [frame-map.md](design/frame-map.md). Copy keys are in `content/copy.en.json`.

### 7.1 Layout shell (all pages)

Skip link (from `site.skipToContent`) → `SiteNav` → `<main id="main">` → optional `ContactCta` → `SiteFooter`. Backdrop behind the top of the page. `<html lang>` follows the locale. One `<h1>` per page.

### 7.2 Home `/` (Figma `1068:73`)

1. **Hero** [Hero]: mono command line (`$` prompt in accent), headline (Display XL, `\n` line break), value prop (Body L, max 60ch), primary "Start a project" and secondary "View résumé", availability line with a live dot, portrait with the `jan@prague ~ · shipping since 2022` caption bar. Portrait is the LCP candidate: `fetchpriority="high"`, explicit width and height, AVIF.
2. **Now running** [Now running]: label "Right now" plus four key and value rows. Desktop: one row under the hero; mobile: stacked list.
3. **Selected work** [Section Header + Featured work], `id="work"`: four `ProjectCard`s in order DeepTrace, IONT platform, Kreditožrouti, Intedat. Desktop: 2×2 grid of equal-height cards. Tablet and mobile: one column.
4. **More work** [Section Header + More work list]: five rows.
5. **Engagements** [Section Header + Row · Engagements]: three cards. Desktop three columns, tablet and mobile one column.
6. **Testimonials** [Section Header + Testimonials]: three quotes.
7. `ContactCta`, footer.

No stat strip, no section numbers, no labels above headings: these were removed on purpose in the design critique.

### 7.3 Case study `/projects/[slug]` (Kreditožrouti `1072:448`, DeepTrace `1072:637`, IONT `1072:824`, Intedat `2728:4943`, Scorecard `1079:1018`, Disenchantment `1080:1214`)

1. **Header** [Header]: back link "← All work" to `/#work`, kicker, title (Display L), lede, `<dl>` with Role, Timeline, Sector.
2. **Hero** [Hero]: `WindowFrame` with the hero image or placeholder.
3. **Stats** [Stats]: only when `impact` has rows (Kreditožrouti, IONT, Disenchantment). Three `StatTile`s.
4. **The challenge** [Challenge]: label column plus rich text (one or two paragraphs).
5. **What I owned** [What I owned]: 2×2 cards on desktop and tablet, one column on mobile. Titles in H4 style; no numbers.
6. **Architecture** [Architecture]: only when the project has an `architecture` group (Kreditožrouti). See 7.4.
7. **Stack** [Stack]: tags.
8. **Gallery** [Gallery]: `WindowFrame`s, images first, then placeholders. Images open nothing on click (no lightbox in V7).
9. **Next project** [Next project]: "Next case study" plus the next title, linking to the next slug by `order`, wrapping around.
10. `ContactCta`, footer.

SEO: `CreativeWork` JSON-LD stays; `description` from `lede`.

### 7.4 Architecture diagram (Kreditožrouti only)

Figma: desktop `2753:4955`, tablet `2753:5026`, mobile `2753:5096`. Read the screenshot of each before building.

- **Topology** (same at every width): row 1 Web app, AI clients; row 2 Traefik (full width); row 3 API, MCP server; row 4 Redis, MySQL; row 5 Scraper worker, InSIS (external, dashed border, no fill). Two columns with a fixed gap; Traefik spans both.
- **Edges**: request path in `accent`, 2 px (Web → Traefik → API → MySQL); sync calls in `control`, 1.5 px solid; async in `control`, 1.5 px dashed 5/4 (API → Redis, Redis ↔ Scraper, Scraper → InSIS). Open arrowheads. Orthogonal routing; the API → MySQL edge bends once in the row gap.
- **Edge labels** in Mono Label, `faint`: "enqueue" (left of API → Redis), "reads + writes" (above the bend; mobile uses `labelShort` "writes"), "read-only" (right of MCP → MySQL), "jobs · results" (right of Redis ↔ Scraper).
- **Footer** of the card: legend (three line samples with labels) and the observability line, above a hairline.
- **Caption** below the card in Body M, max 68ch.
- **Build it as** an HTML grid for the nodes (real text, selectable, translatable) with one absolutely positioned inline SVG layer for the edges, computed from node positions with a `ResizeObserver`, or as precomputed SVG paths per breakpoint if that is simpler and robust between breakpoints. Node text never lives inside the SVG.
- **Accessibility**: the card is a `<figure>` with the caption as `<figcaption>`; the SVG is `aria-hidden`; a visually hidden paragraph holds `textAlternative` from the CMS. Node order in the DOM follows the request flow.
- **Data**: all labels from the project's `architecture` group; geometry and colors in the component, keyed by node `key`.

### 7.5 Résumé `/resume` (`1082:1076`)

1. **Header**: mono command line, name (Display L), role line, summary, "Download résumé ↓" (links `/cv.pdf`, `download` attribute, tracks `cv-download`) and "Hire me".
2. **Stats**: four tiles (Since 2022, 7 companies, primary stack in mono text style, status in accent style).
3. **Experience**, **Products I run myself**, **Leading and teaching** (`id="leadership"`), **Formal training**: `SectionHeader` plus a vertical timeline of `TimelineItem`s. Live items have the accent dot.
4. **Stack**: four columns desktop, two tablet, one mobile; green dot for `primary`, with a visually hidden "(daily)" from the CMS sub text for screen readers.
5. `ContactCta`, footer.

JSON-LD `Person` from the `site` global (section 11).

### 7.6 Contact `/contact` (`1083:1411`; error `2758:4940`; sent `2758:5068`)

Desktop two columns: left has the mono command, title, intro, three channel rows (Email direct with `mailto:`, LinkedIn external, Book a 30-min call opening Cal.com) and the "What to include" card; right has the Project brief card and the "Prefer to skip the form?" card. Tablet and mobile stack: header, channels, brief, skip-form card. No `ContactCta` on this page. Form behaviour in 8.3.

### 7.7 Blog `/blog` and post (`1083:1527`, `1084:1511`)

Blog index: mono command, title, lead, post cards (date, reading time, title, excerpt, tags, "Read the guide →"), then a "Drafting" note with the RSS line. Post: re-skin the existing template to V7 type and colors; keep the share block, RSS link, code highlighting and the stored `contentHtml`. Prose uses `ink-soft` body at 16 to 18 px, `ink` headings, code in JetBrains Mono on `surface-2`.

### 7.8 Privacy and Terms (`1084:1708`, `1084:1829`)

Re-skin `LegalDocument`. Text unchanged. Keep `AnalyticsOptOut` on Privacy. No `ContactCta`.

### 7.9 Errors (`2758:5183`)

`error.vue` renders inside the shell: title from `errors.messages[status]` (Display L), message, three suggestion rows (reuse the contact channel row component) and a faint `HTTP 404` code line. Status 500 and others use `fallbackMessage` and only the "Back to home" link. `noindex` on error pages. Clear the error on navigation (`clearError`).

---

## 8. States and interactions

### 8.1 Navigation

- Desktop: links are `UiLink`; current page gets `aria-current="page"` (match rules from the CMS: exact or prefix). `EN / CS` is a link to the same route in the other locale, `hreflang` set, label from `toggleLanguageLabel`, accessible name says the target language.
- Mobile (below 768): menu button (44×44) with `aria-expanded`, `aria-controls`, accessible name from `toggleMenuLabel` / `closeMenuLabel`. Open state (`2758:6029`): full-height panel under the nav bar, links in H2 size with hairline separators, "current" marker beside the active page, language segmented control (two links, the active one filled `surface-2`), full-width primary "Start a project", email at the bottom.
- Open menu: focus moves to the first link; Tab cycles inside the panel and the close button; `Esc` closes and returns focus to the menu button; background is `inert` and does not scroll; route change closes the menu. Works without JavaScript as a plain list of links (progressive enhancement with `<details>` or a `:target` fallback is fine).

### 8.2 Links and buttons

Hover, focus and disabled exactly as the Figma variants. Focus ring: 2 px `focus` outline with 2 px offset on every interactive element, never removed. External links show `↗` and get `rel="noopener"`; the `↗` is `aria-hidden` and the accessible name adds the CMS text "(opens LinkedIn)" where the design shows only the arrow. Touch targets at least 44×44 at every width (24×24 minimum is the WCAG floor; the design uses 44).

### 8.3 Contact form

Fields: full name (required), email (required, email), message (required, min 20, max from config), budget (optional radio group of presets), "More information (optional)" disclosure with the V6 advanced fields restyled (company, project type, deadline, hosting and the rest from the CMS), privacy note, "Send brief".

- **Validation timing**: nothing is red before the first submit. On submit, validate all fields with the shared Zod schema. After the first submit, re-validate a field on input and on blur.
- **Error state** (`2758:4940`): an error summary at the top of the card (`role="alert"`, `danger-soft` fill, `danger` border) listing the broken fields as in-page links to each field; focus moves to the summary; each broken field gets the danger border, `aria-invalid="true"` and its message linked with `aria-describedby`. The summary text uses `validation.summaryOne` or `summaryMany`.
- **Sending**: button shows `sendingLabel`, `aria-busy="true"`, disabled; fields stay readable.
- **Success** (`2758:5068`): the form is replaced by the success panel (accent-soft circle with `✓`, title with the first name, body, "Send another brief" secondary button). The card header label changes to "sent" in accent. Focus moves to the success title (`tabindex="-1"`); the panel is in an `aria-live="polite"` region. "Send another brief" restores an empty form and focuses the name field.
- **Server error**: keep the user's input, show `errorMessage` in the summary slot.
- **Budget**: preset chips replace the drag-only slider (WCAG 2.2 SC 2.5.7). The submitted value is the option `key`; the CMS stores it in `budgetRange`.
- **Analytics**: keep the V6 `contact-sent` event; never send field contents.
- Keep the V6 server route, rate limit, honeypot (if any) and Discord notification unchanged.

### 8.4 Testimonials

Quotes longer than `quoteLimit` are cut on a word boundary with `…` followed by the "Read more ↗" link. The full quote is not hidden in the DOM (no hidden text for SEO tricks).

### 8.5 Images and placeholders

`<picture>` with AVIF then WebP, explicit `width` and `height`, `loading="lazy"` except the hero image of each page, `decoding="async"`, `sizes` that match the layout (`(min-width: 1024px) 840px, 100vw` for case galleries). Placeholders render the CMS label and spec; when the owner uploads a real image to that gallery row, the placeholder disappears automatically.

---

## 9. Accessibility

Target WCAG 2.2 AA, checked with axe-core and by hand.

### 9.1 Must hold

- Landmarks: one `header`, `nav` (labelled), `main`, `footer`. Skip link is the first focusable element.
- Headings in order, one `h1` per page. Section headings are `h2`; card titles `h3`.
- Color: the token pairs in 4.1 only. Do not put `mute` or `faint` text on `surface-2`.
- Focus visible on everything (8.2). No focus traps except the open mobile menu.
- Target size 44×44 for links, buttons, chips, the language toggle and the menu button.
- Forms: labels, `aria-invalid`, `aria-describedby`, error summary, no placeholder-as-label, `autocomplete` (`name`, `email`, `organization`).
- Motion: reduced-motion rule; nothing flashes.
- Language: `lang="cs"` on the Czech site; English testimonial quotes inside Czech pages get `lang="en"`.
- Images: meaningful alt from the CMS; decorative backdrops and window chrome `aria-hidden`.
- Diagram: text alternative (7.4).
- Zoom: 200 % zoom and 400 % reflow (320 CSS px) without loss.

### 9.2 Automated

`@axe-core/playwright` on every route at 390 and 1440, EN and CS. Zero serious or critical.

### 9.3 Keyboard walkthrough (scripted in Playwright and checked by the a11y agent)

Home: skip link → nav → hero buttons → each project card → more work links → testimonials read more → CTA buttons → footer. Mobile menu: open with Enter, cycle, Esc closes and focus returns. Contact: submit empty, focus lands on the summary, links jump to fields, fix and submit, focus lands on the success title.

---

## 10. Performance

- LCP element: the home portrait or the case hero image. Preload it; serve AVIF at the rendered size.
- Fonts: two preloaded Latin woff2 files at most; everything else on demand.
- JavaScript: no new runtime dependency over 10 kB gzip without owner approval. The diagram uses plain Vue and SVG (no D3, no diagram library).
- CSS: Tailwind v4 output only; no unused V6 CSS left behind.
- Images: no layout shift (dimensions always set). Gallery images lazy.
- Budgets per route (mobile): HTML + CSS + JS transferred ≤ 170 kB gzip excluding images and fonts; fonts ≤ 120 kB; above-the-fold images ≤ 120 kB.

---

## 11. SEO and metadata

- Titles: `<Page> · Jan Komínek`; home uses the site default title. Descriptions from the CMS (`lede` for projects).
- `hreflang` alternates for every page (`en`, `cs`, `x-default`), canonical URLs from `site.siteUrl`.
- JSON-LD: `Person` on home and résumé (name, `jobTitle` "Fullstack Engineer", `worksFor` omitted, `alumniOf` VŠE and Smíchovská SPŠ, `sameAs` LinkedIn and GitHub, `knowsAbout` from the stack); `CreativeWork` on projects; `BlogPosting` on posts (already there).
- Open Graph image: keep the existing default; per-project OG uses the hero image when there is one.
- Sitemap: include the new project slugs, drop redirected ones. `llms.txt` and `llms-full.txt` come from the CMS; the seed updates them with the V7 summaries.

---

## 12. Security and privacy

- Keep the CSP in `server/middleware/02.headers.ts` as is. Fonts are self-hosted, images are same-origin, so nothing new is needed.
- The production site shows a CSP violation for `static.cloudflareinsights.com/beacon.min.js`. It is injected by Cloudflare Web Analytics, not by this repository, and contradicts the privacy policy (Umami only). **Do not add it to the CSP.** The owner switches Cloudflare Web Analytics off for the zone (section 15).
- No personal data in analytics events. No client internals (3.3).

---

## 13. Verification

Gates are defined in [LOOP.md](LOOP.md). In short:

| Gate        | Checks                                                                                                                                                                         | Tooling                         | Run by                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ---------------------------- |
| G0 Plan     | Task has inputs, Figma ids, copy keys, done checks                                                                                                                             | Reading                         | Lead                         |
| G1 Static   | `pnpm verify`, `pnpm format:check`, no U+2014 em dash, no hard-coded copy                                                                                                      | Bash                            | Implementer, then copy-guard |
| G2 Build    | `pnpm build`; CMS migrations apply on an empty local DB; `seed:v7` runs twice cleanly                                                                                          | Bash, Docker                    | Implementer                  |
| G3 Render   | Route renders in EN and CS at 390, 768, 1440 with no console errors, no 404 assets, no horizontal scroll at the 11 widths in 4.3                                               | Playwright                      | screenshot-runner            |
| G4 Visual   | Side-by-side with Figma section screenshots: layout, spacing, type, color, states match. Tolerances: spacing ±4 px, type size exact, color exact token, line breaks may differ | Playwright screenshots + vision | visual-qa                    |
| G5 Quality  | axe zero serious or critical; keyboard walkthrough; Lighthouse budgets on the four key routes                                                                                  | axe, Playwright, Lighthouse CI  | a11y-auditor                 |
| G6 Critique | Fresh-context review against this spec, the Figma and the rubric in LOOP.md. No blocker or major left                                                                          | Reading, screenshots            | design-critic                |

Visual tests: `apps/web/tests/redesign/visual.spec.ts` captures every route at the three widths in both locales and stores baselines with `toHaveScreenshot` after visual-qa approves them, so later changes are caught by pixel diff. Baselines are generated in the Playwright Docker image for stable font rendering.

---

## 14. Facts the owner has not confirmed yet

Keep these exactly as written in the copy; do not invent stronger claims, do not remove them. They are listed in the PR description for the owner to confirm:

- DeepTrace: "Supports 1000+ nodes", "SHA-256".
- IONT: "ČSOB-certified", "five months" to launch.
- Contact: "on-site Thursdays and Fridays".
- Scorecard appears as a case study although it is not linked from LinkedIn yet.

---

## 15. Owner checklist (cannot be done by agents)

1. Review the PR, screenshots and `STATE.md`. Merge to `main` (this deploys development).
2. Seed production with `docs/runbooks/v7-content-seed.md` (tunnel, production secret, `seed:v7 --dry-run` first).
3. Cloudflare: turn off Web Analytics automatic setup for jankominek.com so the beacon stops loading.
4. Confirm the facts in section 14.
5. Upload real screenshots for the placeholders in the CMS when they exist (shot list: each placeholder's `spec`).
6. Ask a native Czech reader to skim `/cs` once.
7. Deploy production through the usual **Deploy** workflow.
