---
name: redesign-loop
description: 'The build, verify, critique, fix loop for the jankominek.com V7 redesign. Load when leading or resuming the redesign, or when running any task from docs/redesign/TASKS.md.'
---

# Redesign loop

Full rules: `docs/redesign/LOOP.md`. Contract: `docs/redesign/SPEC.md`. Work list: `docs/redesign/TASKS.md`. Progress: `docs/redesign/STATE.md`.

## Every session

1. Read `STATE.md` (create it from LOOP.md section 4 if missing). Print the board in five lines.
2. Pick the next unblocked task in TASKS.md order. Milestone boundaries run `design-critic` first.
3. Make sure the Figma cache has every node the task needs (`docs/redesign/reference/INDEX.md`); if not, run `figma-reader` with the missing ids.

## Every task

- [ ] **PLAN (G0)**: task card in STATE.md with goal, Figma ids per breakpoint, cache paths, copy keys, SPEC sections, files in scope, done checks.
- [ ] **BUILD**: delegate to the owner agent from TASKS.md with a self-contained brief. Pages run in parallel worktrees, max 3.
- [ ] **VERIFY (G1 to G3)**: builder ran `pnpm verify`, `pnpm format:check`, `pnpm build`; `copy-guard` on the diff; `screenshot-runner` on the affected routes (EN, CS × 390, 768, 1440; overflow at 11 widths).
- [ ] **REVIEW (G4, G5)**: `visual-qa` and `a11y-auditor` in parallel.
- [ ] **FIX**: route each blocker and major to the builder that owns the file. Round counter +1. Max 3 rounds, then ESCALATE to "Needs owner".
- [ ] **ACCEPT**: merge the worktree, re-run G1 and G2, conventional commit naming the task id, update STATE.md (gates, screenshots, decisions).

## Never

Push to `main`. Deploy. Seed production. Edit `deployment/toolkit*` or `deployment/vendor/`. Hard-code visible copy. Write an em dash. Invent design to pass a gate. Let a reviewer edit code. Restart an accepted task after a context reset.
