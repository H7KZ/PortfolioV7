# V7 redesign checks

Playwright specs for the gates in [docs/redesign/LOOP.md](../../../../docs/redesign/LOOP.md). They run against a site that is already up (`pnpm dev`, or a production build) and are not part of the deploy workflow.

```bash
pnpm --filter @portfolio/web exec playwright install chromium   # once
pnpm --filter @portfolio/web test:redesign                       # G3 render and G5 accessibility
REDESIGN_VISUAL=1 pnpm --filter @portfolio/web test:redesign     # also G4 screenshots
```

- `render.spec.ts`: every route in EN and CS answers, has one `h1`, logs no console error, requests nothing that fails, and never scrolls sideways at the 11 widths of SPEC 4.3. Old project URLs answer 301.
- `a11y.spec.ts`: axe at 390 and 1440 px in both locales (no serious or critical finding), 44 px targets, and the keyboard paths of SPEC 9.3. The contact test sends a real brief to the local CMS.
- `visual.spec.ts`: full-page screenshots per route, width and locale. Write baselines with `-- --update-snapshots` only after visual-qa approves them.
- `lighthouserc.json`: Lighthouse budgets for the four key routes (SPEC 1.1 item 5), run against a production build with `npx @lhci/cli autorun --config=tests/redesign/lighthouserc.json`.

The specs default to a production build on port 3000 (`.claude/launch.json` has `web-prod`; its env file sets `PORT=3000` and `NUXT_PUBLIC_SITE_URL=http://localhost:3000`). Against a CMS started with `next dev`, request every route once before the run: the first fetch of each page and image compiles a route and can outlast the 60 s test timeout. Set `REDESIGN_BASE_URL` to test another host. Reports land in `out/`, which git ignores.
