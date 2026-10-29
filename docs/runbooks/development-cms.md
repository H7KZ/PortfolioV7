# Development CMS

Development (`portfolio-dev`) runs its own web, CMS (`cms-dev.jankominek.com`) and Postgres. The V7 schema migration drops V6 fields and the V7 seed rewrites shared copy and project slugs, so V7 work happens on a copy of production while `jankominek.com` and `cms.jankominek.com` keep running V6 untouched. The development database is not backed up: production stays the source of truth until V7 launches, and launch writes V7 into production with the [V7 content seed](v7-content-seed.md), so copy edits made only in the development CMS must also land in `docs/redesign/content/copy.{en,cs}.json`.

## Owner setup (once)

1. Cloudflare DNS: `cms-dev` proxied, pointing where `cms` points.
2. Cloudflare Access: an application for `cms-dev.jankominek.com` with the same policy as `cms.jankominek.com`.
3. GitHub Environment `development` ([Secrets and config](secrets-and-config.md#environments)): variable `CMS_DOMAIN=cms-dev.jankominek.com`; secrets `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (new values), and `PAYLOAD_SECRET` and `CMS_READ_API_KEY` with the production values. The copied database holds the production API key users, whose key index is hashed with `PAYLOAD_SECRET`; a different secret locks the development web out.

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

## Seed V7 (local, against the development database)

Follow [V7 content seed](v7-content-seed.md#dry-run-then-seed-local-with-the-tunnel-open) with these changes:

- Tunnel to the development database instead of production:

```bash
ssh -N -L 45433:$(ssh <vps> "docker inspect -f '{{(index .NetworkSettings.Networks \"portfolio-dev-internal-network\").IPAddress}}' \$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=postgres)"):5432 <vps>
```

- `DATABASE_URI` uses the development `POSTGRES_*` values; `PAYLOAD_SECRET` is the shared production value.
- Copy the uploaded images into the development CMS and restart the development web:

```bash
scp -r .scratch/media <vps>:~/portfolio/seed-media-dev
ssh <vps> 'cms=$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=cms); web=$(docker ps -q --filter label=com.docker.compose.project=portfolio-dev --filter label=com.docker.compose.service=web); docker cp ~/portfolio/seed-media-dev/. "$cms:/data/media" && docker exec -u root "$cms" chown -R cms:cms /data/media && docker restart $web'
```

Verify as in the seed runbook, on `dev.jankominek.com`. `jankominek.com` must still show V6.
