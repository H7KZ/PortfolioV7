# AGENTS.md

jankominek.com. Read [README.md](README.md) for setup and [docs/README.md](docs/README.md) for the runbooks and decisions.

## Stack

- `apps/web`: Nuxt 4 SSR, Vue 3 `<script setup>`, @nuxtjs/i18n (EN unprefixed, CS under `/cs`), Tailwind v4 via Vite (tokens in `app/assets/css/app.css`, no tailwind config), unplugin-icons (`~icons/<collection>/<name>`).
- `apps/cms`: Payload 3 on Next, Postgres, Lexical. Migrations in `src/migrations`, run on start in production.
- `packages/content`: `payload-types.ts` (generated, never hand-edit) and the contact form schema shared by web and cms.
- pnpm + turbo, TypeScript strict, Zod 4.

## Invariants

- Every string a visitor can read comes from the CMS. No copy in Vue files or locale JSON. New text means a new CMS field.
- The web reads the CMS only on the server (`server/utils/content.ts`, cached by `defineCachedFunction`). Browser code never talks to the CMS.
- CMS saves clear the web cache through `/_internal/revalidate`. Anything new that caches CMS data must be cleared there too.
- Rich text is rendered to HTML in the CMS at save time (`src/rich-text`); the web prints the stored `<field>Html`.
- The visual design matches V6. Change markup or classes only when asked.
- Media URLs are `/media/<file>` on the site, never the CMS host.
- Schema change: edit the collection or global, `generate:types`, `migrate:create`. Commit the migration.

## House rules

- No em dashes in any file, code or copy.
- No tests unless asked. Run `pnpm verify` and `pnpm format:check` before committing.
- No comments that restate the code; comments explain why.
- Conventional commits.
- Pushes to `main` deploy development after verification; manual deploys select any source ref and target environment. Never push or deploy unless asked.
- Deployment changes: read [deployment/AGENTS.md](deployment/AGENTS.md) and the [runbooks](docs/runbooks/). The repository must deploy to a clean server from its own checkout; ingress (`deployment/ingress`) is only for a dedicated server and never runs where Infrastructure's Traefik does ([ADR 0001](docs/adr/0001-repository-standard.md)).
- The repository runs only its pinned toolkit, through `deployment/toolkit`, configured by `deployment/toolkit.conf`. Never call a toolkit installed on the server. Never hand-edit `deployment/toolkit`, `deployment/toolkit.lock` or `deployment/vendor/toolkit/`; repin from the Toolkit repository (`npm run vendor -- ../PortfolioV7` there). Shell scripts source `deployment/vendor/toolkit/log.sh`. Docs: <https://github.com/H7KZ/Toolkit/tree/main/docs>.
