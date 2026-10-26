# Deployment

Everything that ships this repository to a server: Compose stacks per target, the pinned toolkit and its integration, hooks, backups and the optional ingress. Operating procedures are in the [runbooks](../docs/runbooks/); this page maps the files.

## Layout

| Path                                         | What                                                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `toolkit`, `toolkit.lock`, `vendor/toolkit/` | managed copy of the pinned toolkit release; never edit, repin from the Toolkit repository             |
| `toolkit.conf`                               | this repository's integration: slug `portfolio`, release targets, backups, jobs, host singletons      |
| `production/`                                | web, CMS, Postgres (project `portfolio`)                                                              |
| `development/`                               | web only, reads the production CMS (project `portfolio-dev`)                                          |
| `monitoring/`                                | self-hosted Umami and its Postgres (project `portfolio-monitoring`), `umami/retain.sh` and its SQL    |
| `ingress/`                                   | Traefik, socket-proxy, CrowdSec (project `global`) for standalone servers; Cloudflare origin firewall |
| `backup/`                                    | `components.sh`: what to back up and how to drill it ([runbook](../docs/runbooks/backups.md))         |
| `scripts/pre-migrate-dump.sh`                | production prepare hook: dumps the CMS database before a migration                                    |
| `prepare-release.py`                         | renders the private dotenv, manifest and archive for a target (called by `_deploy.yml`)               |
| `release-notes.py`                           | GitHub Release notes from Conventional Commits (called by `deploy.yml` job `release`)                 |

Each target directory holds `networks.yml`, `volumes.yml` and `docker-compose.<target>.yml`; toolkit merges them.

## Targets

| Target        | Toolkit environment | Compose project        | Root on the VPS                    | Workflow          |
| ------------- | ------------------- | ---------------------- | ---------------------------------- | ----------------- |
| `production`  | `production`        | `portfolio`            | `~/portfolio/versions/production`  | Deploy            |
| `development` | `development`       | `portfolio-dev`        | `~/portfolio/versions/development` | Deploy            |
| `monitoring`  | `monitoring`        | `portfolio-monitoring` | `~/portfolio/versions/monitoring`  | Deploy Monitoring |
| `ingress`     | `infrastructure`    | `global`               | `~/portfolio/versions/ingress`     | Deploy Ingress    |

The `ingress` target is for a dedicated server only; never deploy it where Infrastructure's Traefik runs. It uses the `infrastructure` lock environment because toolkit 0.11 has no `ingress` one ([ADR 0001](../docs/adr/0001-repository-standard.md)).

## Networks and volumes

All networks and volumes are external with fixed names and are created by the toolkit during the deploy that first needs them. Toolkit creates only names starting with the slug `portfolio-`: `portfolio-cms-network`, `portfolio-internal-network`, `portfolio-monitoring-internal-network`, `portfolio-ingress-*`, `portfolio-postgres-volume`, `portfolio-uploads-volume`, `portfolio-umami-postgres-volume`. `public-network` is the one shared name: Infrastructure's Traefik creates it in shared mode, `ingress/` in standalone mode. Renaming a populated volume orphans its data.

## Host singletons

`MAINTENANCE_AT` and the Cloudflare origin firewall (`RECONCILE_BEFORE=deployment/ingress/cloudflare-firewall.sh`, plus a weekly job) belong to exactly one repository per host. Here they are commented out in `toolkit.conf`; enable them only on a standalone server ([Split to own server](../docs/runbooks/split-to-own-server.md#enable-the-host-singletons)).

## Local checks

```bash
bash deployment/toolkit verify                       # pinned toolkit intact
python3 scripts/check-doc-links.py                   # documentation links
bash -n deployment/ingress/scripts/*.sh             # syntax; CI uses shellcheck
docker compose --project-directory deployment --env-file <dummy.env> \
  -f deployment/<target>/networks.yml -f deployment/<target>/volumes.yml \
  -f deployment/<target>/docker-compose.<target>.yml config -q
```

The origin firewall has a namespace test: `sudo python3 deployment/ingress/tests/test_cloudflare_firewall.py` (needs root, nftables, iproute2).

Docs: [documentation index](../docs/README.md). Toolkit docs: <https://github.com/H7KZ/Toolkit/tree/main/docs>.
