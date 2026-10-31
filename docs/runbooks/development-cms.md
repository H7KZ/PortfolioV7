# Development CMS

Development (`portfolio-dev`) runs its own web, CMS (`cms-dev.jankominek.com`) and Postgres. The V7 schema migration drops V6 fields and the V7 seed rewrites shared copy and project slugs, so V7 work happens on a copy of production while `jankominek.com` and `cms.jankominek.com` keep running V6 untouched. The development database is not backed up: production stays the source of truth until V7 launches, and launch writes V7 into production with the [V7 content seed](v7-content-seed.md), so copy edits made only in the development CMS must also land in `docs/redesign/content/copy.{en,cs}.json`.

## Owner setup (once)

1. Cloudflare DNS: `cms-dev` proxied, pointing where `cms` points.
2. Cloudflare Access: an application for `cms-dev.jankominek.com` with the same policy as `cms.jankominek.com`.
3. GitHub Environment `development` ([Secrets and config](secrets-and-config.md#environments)): variable `CMS_DOMAIN=cms-dev.jankominek.com`; secrets `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PAYLOAD_SECRET` (signs sessions and indexes API keys; password hashes do not depend on it, so copied logins work with any value), and `CMS_READ_API_KEY` and `CMS_CONTACT_API_KEY` with development's own keys. A copy from production brings production's keys, so set development's again after every copy (below).

## Deploy

A push to `develop` deploys development; by hand, run **Deploy** with `environment` `development` and `ref` `develop`. The first deploy starts the CMS on an empty database and runs every migration on it. Fill it from production next.

## Fill or refresh from production (on the VPS, as the deploy user)

This replaces the whole development database and media with production's, then lets the V7 migration run on that copy.

```bash
find() { docker ps -aq --filter label=com.docker.compose.project="$1" --filter label=com.docker.compose.service="$2"; }
prod_db=$(find portfolio postgres); prod_cms=$(find portfolio cms)
dev_db=$(find portfolio-dev postgres); dev_cms=$(find portfolio-dev cms)
docker stop "$dev_cms"
docker exec "$dev_db" sh -c 'dropdb -U "$POSTGRES_USER" --force "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker exec "$prod_db" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' |
  docker exec -i "$dev_db" sh -c 'psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
# Visitor inquiries stay in production only.
docker exec "$dev_db" sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "TRUNCATE contact_submissions CASCADE"'
docker cp "$prod_cms:/data/media" - | docker cp - "$dev_cms:/data"
docker start "$dev_cms"
docker exec -u root "$dev_cms" chown -R cms:cms /data/media
docker logs -f "$dev_cms"
```

The CMS log shows the V7 migration running, then the server listening. `cms-dev.jankominek.com/admin` accepts the production admin login.

Then, with the tunnel below open, give the copied users development's keys:

```bash
API_KEYS='{"reader@jankominek.com":"<dev CMS_READ_API_KEY>","contact@jankominek.com":"<dev CMS_CONTACT_API_KEY>"}' DATABASE_URI=postgres://<dev user>:<dev password>@127.0.0.1:45433/<dev db> PAYLOAD_SECRET=<secret> REVALIDATE_URLS=" " PAYLOAD_DISABLE_JOBS=1 pnpm --filter @portfolio/cms run api-keys:set
```

## Seed V7 (local, against the development database)

Follow [V7 content seed](v7-content-seed.md#dry-run-then-seed-local-with-the-tunnel-open) with these changes:

- Tunnel to the development database instead of production:

```bash
ssh -N -L 45433:$(ssh <vps> "docker inspect -f '{{(index .NetworkSettings.Networks \"portfolio-dev-internal-network\").IPAddress}}' \$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=postgres)"):5432 <vps>
```

- `DATABASE_URI` uses the development `POSTGRES_*` values (`docker exec <dev postgres> printenv POSTGRES_PASSWORD`); `PAYLOAD_SECRET` is the development value (`docker exec <dev cms> printenv PAYLOAD_SECRET`).
- Copy the uploaded images into the development CMS and restart the development web:

```bash
scp -r .scratch/media <vps>:~/portfolio/seed-media-dev
ssh <vps> 'cms=$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=cms); web=$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=web); docker cp ~/portfolio/seed-media-dev/. "$cms:/data/media" && docker exec -u root "$cms" chown -R cms:cms /data/media && docker restart $web'
```

Verify as in the seed runbook, on `dev.jankominek.com`. `jankominek.com` must still show V6.

## Reset an admin password

The CMS has no email adapter, so "Forgot password" sends nothing. Five wrong passwords lock the user for 15 minutes. With the tunnel open, generate a password and set it through Payload, which also clears the lockout:

```bash
USER_EMAIL=<email> USER_PASSWORD=<password> DATABASE_URI=postgres://<dev user>:<dev password>@127.0.0.1:45433/<dev db> PAYLOAD_SECRET=<dev secret> REVALIDATE_URLS=" " PAYLOAD_DISABLE_JOBS=1 pnpm --filter @portfolio/cms run password:set
```
