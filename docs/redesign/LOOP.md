# The redesign loop

How every task in [TASKS.md](TASKS.md) is planned, built, checked, critiqued and accepted, who does what, on which model, and when to stop. The lead loads this through the `redesign-loop` skill.

## 1. Roles and models

One lead, specialist subagents, and two independent reviewers who never see the implementer's reasoning. Cheap models do mechanical work; the strongest model plans and judges.

| Agent                          | Model    | Effort | Writes code                          | Job                                                                                                                                                                                                        |
| ------------------------------ | -------- | ------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redesign-lead` (main session) | `opus`   | high   | Merges only                          | Owns the plan, `STATE.md`, task order, merges, gates. Delegates all building.                                                                                                                              |
| `figma-reader`                 | `haiku`  | low    | No (writes cache)                    | Pulls `get_design_context`, `get_metadata` and section screenshots for given node ids into `docs/redesign/reference/<node-id>/`. One fetch per node, ever.                                                 |
| `cms-schema`                   | `sonnet` | high   | Yes (`apps/cms`, `packages/content`) | Schema changes, migrations, generated types, `seed-v7.ts`, runbook. Only agent allowed to touch migrations.                                                                                                |
| `ui-builder`                   | `sonnet` | high   | Yes (`apps/web` shared)              | Tokens, fonts, layout shell, shared components (section 5 of SPEC).                                                                                                                                        |
| `page-builder`                 | `sonnet` | medium | Yes (`apps/web` pages)               | One page per run, in its own worktree.                                                                                                                                                                     |
| `screenshot-runner`            | `haiku`  | low    | Tests only                           | Runs Playwright: renders routes at all widths and locales, collects console errors, overflow, screenshots. Flags obvious breakage (blank, overflow, missing image) before anyone spends a big model on it. |
| `visual-qa`                    | `sonnet` | high   | No                                   | Compares implementation screenshots with the Figma cache section by section and writes findings with exact deltas.                                                                                         |
| `a11y-auditor`                 | `sonnet` | medium | Tests only                           | axe, keyboard walkthrough, contrast spot checks, Lighthouse.                                                                                                                                               |
| `copy-guard`                   | `haiku`  | low    | No                                   | Scans the diff: hard-coded strings, em dashes, EN/CS parity, facts that differ from the copy JSON, client-confidential details.                                                                            |
| `design-critic`                | `opus`   | high   | No                                   | Fresh context. Judges the result as a senior product designer would, against SPEC, Figma and the rubric in section 6. Runs at milestones, not per commit.                                                  |

Rules:

- The lead does not write feature code. If it catches itself editing a `.vue` file, it stops and delegates.
- Reviewers (`visual-qa`, `a11y-auditor`, `copy-guard`, `design-critic`) never edit files. They return findings; the lead routes fixes to the builder that owns the file.
- Only `cms-schema` runs `migrate:create`. Two migrations created in parallel branches conflict.
- Up to 3 `page-builder` instances in parallel, each in its own worktree (`isolation: worktree`). Shared components are frozen while pages are built; a page that needs a component change files it as a request in `STATE.md` and the lead gives it to `ui-builder`.
- If a model alias is unavailable, fall back one tier up (haiku → sonnet → opus), never down for reviewers.

## 2. The loop for one task

```
PLAN ──► BUILD ──► VERIFY (G1–G3) ──► REVIEW (G4–G5) ──► FIX ──┐
  ▲                                                             │
  └──────────────── at most 3 rounds, then ESCALATE ◄──────────┘
                              │ all green
                              ▼
                     ACCEPT ─► commit ─► STATE.md ─► next task
```

1. **PLAN (lead, G0).** Write the task card in `STATE.md`: task id, goal in one sentence, Figma node ids per breakpoint, copy keys, files expected to change, done checks copied from TASKS.md. If a Figma node is not in the cache, send `figma-reader` first. A task without node ids and done checks does not start.
2. **BUILD (builder).** Read the task card, the cached Figma context and screenshots, SPEC sections it cites, and the existing code it touches. Implement. Run G1 and G2 locally. Return: files changed, how each done check is met, anything uncertain.
3. **VERIFY (screenshot-runner, G3).** Render the affected routes. Any console error, horizontal scroll, missing asset or blank section fails the round immediately and goes back to the builder with the evidence.
4. **REVIEW (visual-qa G4, a11y-auditor G5, copy-guard G1).** In parallel. Each returns findings in the format of section 5. No finding means "pass".
5. **FIX (builder).** Fix every blocker and major; fix minors unless the lead decides otherwise and logs why. Then back to VERIFY.
6. **ACCEPT (lead).** All gates green: commit with a conventional message, record the gate results and screenshots paths in `STATE.md`, mark the task done, pick the next unblocked task.
7. **ESCALATE.** After 3 FIX rounds on the same task, or if a fix needs a design decision, stop the task, write the question in `STATE.md` under "Needs owner" with screenshots and options, and continue with other tasks. Never invent design to get past a gate.

Milestones (see TASKS.md) end with `design-critic` (G6) over everything built so far. Its blockers and majors become new tasks.

## 3. Gates

| Gate        | Pass condition                                                                                                                                                                                | Evidence stored                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| G0 Plan     | Task card complete                                                                                                                                                                            | `STATE.md`                            |
| G1 Static   | `pnpm verify` and `pnpm format:check` exit 0; `rg -n '\x{2014}' <changed files>` empty; copy-guard pass                                                                                       | command output summary                |
| G2 Build    | `pnpm build` exit 0; for CMS tasks: migrations apply on a fresh local DB, `seed:v7` twice without changes on the second run                                                                   | command output summary                |
| G3 Render   | Affected routes × {en, cs} × {390, 768, 1440} render; zero console errors; `document.scrollingElement.scrollWidth <= innerWidth` at 320, 360, 390, 414, 600, 768, 900, 1024, 1280, 1440, 1920 | `apps/web/tests/redesign/out/<task>/` |
| G4 Visual   | visual-qa finds no blocker or major per section                                                                                                                                               | findings in `STATE.md`                |
| G5 Quality  | axe: 0 serious, 0 critical; keyboard path passes; Lighthouse budgets met on affected key routes                                                                                               | report paths                          |
| G6 Critique | design-critic: no blocker, no major                                                                                                                                                           | findings in `STATE.md`                |

## 4. STATE.md

Created by the lead at the start, updated after every step, committed with each accepted task. It is how the owner, and a lead resuming after a context reset, know where things stand.

```markdown
# V7 redesign state

Branch: feat/v7-redesign · Last update: <ISO time> · Milestone: M2

## Board

| Task          | Status | Owner          | Round | Gates               | Notes                             |
| ------------- | ------ | -------------- | ----- | ------------------- | --------------------------------- |
| T07 Home page | review | page-builder#2 | 2/3   | G1✓ G2✓ G3✓ G4✗ G5✓ | hero portrait 12px too low at 768 |

## Current task card

...

## Findings log

<newest first, section 5 format>

## Conflicts (source precedence applied)

## Needs owner

## Decisions
```

Resume rule: a new lead session reads `STATE.md` first and continues from the board; it never restarts accepted tasks.

## 5. Finding format (all reviewers)

```
[F-<task>-<n>] <blocker|major|minor> · <route> · <width> · <locale> · <Figma node id>
What: <observable difference or failure, one sentence>
Expected: <value from Figma/spec, e.g. "gap 24px, H3 22/27 ink">
Actual: <measured value, e.g. "gap 16px, 20/25 ink-soft">
Evidence: <screenshot path or command output line>
Fix hint: <file and likely change, optional>
```

Severity:

- **blocker**: broken function, content missing or wrong, accessibility failure (axe serious/critical, keyboard trap, unreadable contrast), layout broken at any width, confidentiality leak, em dash in copy.
- **major**: visible deviation from Figma a visitor would notice (wrong component, wrong type style, spacing off by more than 8 px, wrong color token, missing state), performance budget missed.
- **minor**: spacing off by 4 to 8 px, line-break differences that change rhythm, polish.

## 6. Critique rubric (design-critic)

Score each 1 to 5 with one-line evidence; anything below 4 is a major finding with a concrete fix.

1. **Ten-second test.** On `/` at 1440 and 390: is it obvious who Jan is, what he does, and what to do next?
2. **Hierarchy.** One clear focal point per screen; headings, leads and meta separate cleanly; nothing competes with the primary CTA.
3. **Fidelity.** Type styles, spacing rhythm, colors and states match Figma; nothing was "improved" without a reason logged.
4. **Consistency.** Same component, same look and behaviour on every page and breakpoint.
5. **Craft.** Alignment to the grid, optical balance of cards, image cropping, no orphans in headings, no ragged gaps.
6. **Generic tells.** None of: centered-everything hero, gradient text, glassmorphism, emoji bullets, all-caps micro labels, labels above every heading, numbered section badges, stat strips of weak numbers, arrows on every button, decorative grids repeated down the page, em dashes.
7. **Accessibility in practice.** Focus visible and logical, targets comfortable on a phone, error recovery humane.
8. **Credibility.** Copy and facts match the copy JSON; claims are not inflated; client work shows nothing confidential.
9. **Czech.** `/cs` reads naturally, no overflow from longer words, no untranslated UI.

## 7. Stop conditions

- Definition of done in SPEC 1.1 holds: the lead writes the PR description and stops.
- A blocker needs the owner: escalate, finish everything else, then stop with a summary.
- Figma unavailable for more than 30 minutes of work: continue from cache; if a task has no cache, park it.
- Budget guard: if a task has consumed 3 fix rounds and 2 critique rounds without converging, park it and report. Do not loop forever.

## 8. Commands cheat sheet

```bash
pnpm install
docker compose -f docker-compose.local.yml up -d
pnpm --filter @portfolio/cms run migrate
pnpm --filter @portfolio/cms run seed:v7          # after T03
pnpm dev                                           # web :45173, cms :43000
pnpm verify && pnpm format:check && pnpm build
pnpm --filter @portfolio/web test:redesign         # after T05
pnpm --filter @portfolio/web test:redesign -- --update-snapshots   # only after visual-qa approves
rg -n '\x{2014}' apps packages docs                 # no em dashes: must print nothing
```
