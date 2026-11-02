# Figma match loop

The first build never saw Figma (STATE.md: T02 blocked). This loop brings every page to the Figma frames in `design/frame-map.md`.

## Tools

- Figma MCP (file key `jDa51GQCd58Qv9YBteYeQZ`): `get_metadata` for a frame's children and ids, `get_design_context` for exact layout, sizes, colors, type and spacing, `get_screenshot` for pictures (pass `maxDimension` equal to the frame's height so 1 px = 1 px; download the returned URL with `curl -sfL -o` at once, it expires). `get_variable_defs` for variables.
- Cache everything under `docs/redesign/reference/<node id with - instead of :>/` (`shot.png`, `context.md`). Check the cache before calling Figma. The folder is git-ignored.
- Running servers, shared by everyone: CMS `http://localhost:43000`, web dev with HMR `http://localhost:45173`. Never start, stop or restart them.
- Side by side, Figma left, site right, from `apps/web`:

```bash
MSYS_NO_PATHCONV=1 node tests/redesign/compare.mjs http://localhost:45173 <route> <1440|768|390> ../../docs/redesign/reference/<id>/shot.png tests/redesign/out/compare/<name> [en|cs]
```

Then read the `<name>-cmp-NN.png` chunks. Zoom into a region with a Figma screenshot of the child node plus a crop of `<name>-local.png` when detail matters.

## Rules

- Match the Figma frame at 1440, 768 and 390: layout, sizes, spacing, type styles, colors, borders, radii, icons, states. Use tokens from `app/assets/css/app.css`; Figma variables map to them (`design/tokens.css`).
- Every visible string comes from the CMS (AGENTS.md). Never hard-code copy. When the Figma text differs from what the site shows, do not change it: list it under "Copy deltas" in your report with the field and both texts.
- When Figma needs a field the CMS lacks, list it under "Schema needs" and stop on that item.
- Keep accessibility (SPEC 9: one h1, focus rings, 44 px targets, landmarks, reduced motion) and EN plus CS.
- Edit only the files your card owns. Anything else you need goes under "Requests" in your report.
- No em dashes. No comments that restate code. Do not commit, do not run git commands that change state.
- Before you finish: `pnpm --filter @portfolio/web type-check` and `pnpm --filter @portfolio/web lint` pass, the page renders at 1440, 768 and 390 in EN and CS with no console error, and a final compare shows no visible delta you own.

## Report

Return: files changed; deltas fixed; deltas left with the reason; Copy deltas; Schema needs; Requests.
