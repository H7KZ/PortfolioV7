# Deployment instructions

Read the [deployment README](README.md) and the [runbooks](../docs/runbooks/) before changing anything here.

- Never hand-edit `toolkit`, `toolkit.lock` or `vendor/toolkit/`; repin from the Toolkit repository (`npm run vendor -- ../PortfolioV7`). `bash deployment/toolkit verify` rejects edited copies. Never call a toolkit installed on the server. `toolkit.conf` is ours.
- Releases, boot reconcile, backups and jobs run only through the pinned `deployment/toolkit`. Scheduled work is a job, backup or maintenance entry in `toolkit.conf`, never a hand-written unit or cron entry. Scripts source `vendor/toolkit/log.sh`.
- Docker project, container, network and volume names carry data: do not rename them. Networks and volumes the stacks need are external, named `portfolio-*` (the only prefix toolkit creates), and created by the deploy, never by hand. `public-network` is shared: Infrastructure's Traefik owns it, or `ingress/` does on a standalone server.
- `ingress/` is only for a dedicated server. Never deploy it where Infrastructure's Traefik runs. `MAINTENANCE_AT` and the Cloudflare firewall stay commented out in `toolkit.conf` unless this repository owns the host.
- Environment `ingress` is deployed under the `infrastructure` toolkit lock environment (toolkit 0.11 has no `ingress`); keep `toolkit.conf` and `prepare-release.py` in step.
- `monitoring/` is this repository's own Umami + Postgres (project `portfolio-monitoring`), independent of the other repositories on the host; deploy it from `main` before production. The `umami-retention` job runs `monitoring/umami/retain.sh`; keep `toolkit.conf`, `prepare-release.py` and the `monitoring` regexes in `_deploy.yml` and `rollback.yml` in step.
- Production deploys one complete web, CMS and Postgres snapshot. Images are referenced by digest; third-party images are pinned by toolkit at staging. The CMS dump hook runs before every production migration.
- `prepare-release.py` packages tracked files of `deployment/` only (no symlinks, no hidden paths). Secrets reach the server only through the private release dotenv.
- Workflow changes follow the [repository standard](https://github.com/H7KZ/Toolkit/tree/main/docs/standard.md): names, inputs, SHA-pinned actions with `# vX.Y.Z`, least-privilege permissions, `timeout-minutes`. Run actionlint before committing.
- Never push or deploy unless asked.
