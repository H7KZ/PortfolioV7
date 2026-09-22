# PortfolioV7

jankominek.com. Nuxt 4 (SSR) site, Payload 3 CMS, self-hosted Umami. Everything a visitor reads lives in the CMS; editing content never needs a deploy.

| Host                   | What                                         | Access            |
| ---------------------- | -------------------------------------------- | ----------------- |
| `jankominek.com`       | `apps/web` production                        | public            |
| `dev.jankominek.com`   | `apps/web` development, reads the prod CMS   | Cloudflare Access |
| `cms.jankominek.com`   | `apps/cms` Payload admin + API (one, global) | Cloudflare Access |
| `umami.jankominek.com` | Umami dashboard (tracker at `/stats`)        | Cloudflare Access |

Full design and decision log: [docs/PLAN.md](docs/PLAN.md).

## Layout

```
apps/web          Nuxt site (port 45173)
apps/cms          Payload CMS on Next (port 43000), migrations, V6 import script
packages/content  generated Payload types + contact form schema shared by both
deployment/       compose stacks, deploy scripts (production, development, analytics, runner)
.github/workflows verify, deploy, rollback, deploy-analytics, umami-retention
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

Manual only: Actions -> **Deploy** (pick environment and services), **Rollback**, **Deploy Analytics**. Images go to `ghcr.io/h7kz/portfoliov7/{web,cms}`; the self-hosted runner deploys into `~/portfolio/versions/<env>/<sha>` on the VPS. Before every cms deploy the database is dumped to `~/portfolio/dumps` (last 3 kept). There are no other backups.

### One-time setup

1. Cloudflare DNS (proxied) for `jankominek.com`, `dev`, `cms`, `umami`. Cloudflare Access policies on `dev`, `cms`, `umami`.
2. Runner on the VPS: `GITHUB_REPO_URL=https://github.com/H7KZ/PortfolioV7 GITHUB_ACCESS_TOKEN=... bash deployment/github-runner/deploy.sh`.
3. Repository secrets: `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`, `UMAMI_DB_NAME`, `UMAMI_DB_USER`, `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`. Repository variables: `SITE_DOMAIN=jankominek.com`, `UMAMI_DOMAIN=umami.jankominek.com`.
4. GitHub Environment `production`: variables `PROJECT=prod`, `DOMAIN=jankominek.com`, `CMS_DOMAIN=cms.jankominek.com`, `UMAMI_WEBSITE_ID`; secrets `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`, `CMS_CONTACT_API_KEY`, `DISCORD_WEBHOOK_URL`.
5. GitHub Environment `development`: variables `PROJECT=dev`, `DOMAIN=dev.jankominek.com`; secrets `PREVIEW_SECRET`, `REVALIDATE_SECRET` (same value as production), `CMS_READ_API_KEY` (same as production).
6. Generate every secret with `openssl rand -base64 32` (a `$` or backtick cannot pass through the deploy `.env`).
7. Deploy analytics, create the admin password and website in Umami, set `UMAMI_WEBSITE_ID`.
8. Deploy production (it creates the schema), then create the admin user at `cms.jankominek.com/admin`.
9. Import the V6 content into production once, from your machine, through an SSH tunnel to the database:

   ```bash
   ssh -N -L 45433:$(ssh <vps> "docker inspect -f '{{(index .NetworkSettings.Networks \"portfolio-internal-network\").IPAddress}}' portfolio-postgres"):5432 <vps>
   ```

   ```bash
   DATABASE_URI=postgres://<user>:<password>@127.0.0.1:45433/<db> PAYLOAD_SECRET=<prod secret> MEDIA_DIR=$PWD/.scratch/media REVALIDATE_URLS=" " PAYLOAD_DISABLE_JOBS=1 CMS_READ_API_KEY=<prod key> CMS_CONTACT_API_KEY=<prod key> pnpm migrate:v6
   ```

   The same `PAYLOAD_SECRET` matters: Payload indexes API keys with it. Then copy the media into the volume and let the web drop its cache:

   ```bash
   scp -r .scratch/media <vps>:~/portfolio/seed-media
   ssh <vps> 'docker cp ~/portfolio/seed-media/. portfolio-cms:/data/media && docker exec -u root portfolio-cms chown -R cms:cms /data/media && docker restart portfolio-web-prod'
   ```

10. Deploy development.
