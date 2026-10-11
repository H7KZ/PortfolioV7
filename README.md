# PortfolioV7

jankominek.com. Nuxt 4 (SSR) site, Payload 3 CMS, self-hosted Umami. Everything a visitor reads lives in the CMS; editing content never needs a deploy.

| Host                   | What                                         | Access            |
| ---------------------- | -------------------------------------------- | ----------------- |
| `jankominek.com`       | `apps/web` production                        | public            |
| `dev.jankominek.com`   | `apps/web` development, reads the prod CMS   | Cloudflare Access |
| `cms.jankominek.com`   | `apps/cms` Payload admin + API (one, global) | Cloudflare Access |
| `umami.jankominek.com` | Umami dashboard (tracker at `/stats`)        | Cloudflare Access |

Start with the [documentation index](docs/README.md). The [migration plan](docs/PLAN.md) records the design and decisions.

## Layout

```
apps/web          Nuxt site (port 45173)
apps/cms          Payload CMS on Next (port 43000), migrations, V6 import script
packages/content  generated Payload types + contact form schema shared by both
deployment/       compose stacks, toolkit release adapters, boot reconcile, disabled retention timer
.github/workflows verify, deploy, rollback, deploy-analytics
```

## Local development

```bash
pnpm install
docker compose -f docker-compose.local.yml up -d
pnpm --filter @portfolio/cms run migrate
PAYLOAD_DISABLE_JOBS=1 CMS_READ_API_KEY=local-reader-key-0000000000000000 CMS_CONTACT_API_KEY=local-contact-key-000000000000000 pnpm migrate:v6
cp apps/web/.env.example apps/web/.env
pnpm dev
```

- Site: http://localhost:45173, CMS: http://localhost:43000/admin (create the first admin user there).
- `migrate:v6` imports content from `../PortfolioV6` and is safe to rerun (it replaces what it imported).
- Schema change: edit a collection or global, then `pnpm --filter @portfolio/cms run generate:types` and `pnpm --filter @portfolio/cms run migrate:create <name>`. Production applies pending migrations when the cms starts.
- Checks: `pnpm verify` (type-check + lint) and `pnpm format:check`.

## Content flow

- Saving in the CMS POSTs to `/_internal/revalidate` on every web (`REVALIDATE_URLS`), which drops the Nitro content cache. The next request renders fresh content.
- Drafts: the Preview button signs a one-hour link to `/_preview` on the site; that browser then sees drafts until "Exit preview".
- Media is served by the site at `/media/<file>`, the CV at `/cv.pdf` (from the Resume global).
- Contact form: browser -> `POST /api/contact` (web validates with the CMS-configured schema) -> CMS `contact-submissions` with a create-only key -> Discord gets a link, no personal data. Submissions older than 12 months are deleted nightly.

## Deploy

Every push to `main` runs verification, builds the web image and deploys development through **Deploy** on GitHub-hosted runners. Manual **Deploy** also supports development or production; production is main-only and deploys one complete web+CMS snapshot through the repository's pinned toolkit. **Rollback Deployment** restores an existing immutable snapshot; **Deploy Analytics** remains manual. Images go to `ghcr.io/h7kz/portfoliov7/{web,cms}`. A CMS deploy takes a pre-migration database dump on the VPS; there are no other backups. Analytics retention uses an initially disabled host timer.

For first deployment and later changes, use the [setup guides](docs/README.md#setup): Cloudflare, GitHub and VPS, analytics, and the one-time V6 content import.
