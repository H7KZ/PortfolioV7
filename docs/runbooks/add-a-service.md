# Add a service or environment

Use this to put one more container in an existing target, or to add a new deployable target. Read [Deploy and release](deploy-and-release.md) first for how releases move.

## Rules a service must follow

- **Prebuilt images only.** The repository builds web and CMS in CI (`apps/<service>/Dockerfile`); everything else is a pinned third-party image. Toolkit pins every service to a digest when it stages.
- **Names carry data.** Container, network and volume names are prefixed `portfolio-`. Toolkit creates missing external networks and volumes **only** when the name starts with `portfolio-` (it refuses anything else with "shared external network missing" or "external volume not owned by repository"). Never rename a populated volume; migrate its data first.
- **Everything is created by the deploy.** Declare networks in `networks.yml` and volumes in `volumes.yml` of the target as `external: true` with a fixed `name:`. A runbook step "create network X by hand" is a bug. The one exception is `public-network`: Infrastructure's Traefik owns it in shared mode, and `deployment/ingress` creates it in standalone mode.
- **Ingress contract.** Attach the service to `public-network` and label it for Traefik exactly like the existing services: `traefik.enable=true`, `traefik.docker.network=public-network`, router `portfolio-<name>`, `entrypoints=websecure`, `tls=true`, `tls.certresolver=letsencrypt`, `loadbalancer.server.port`. The same labels work in shared and standalone mode.
- **Health.** Give the container a `healthcheck`; Toolkit waits for it. Add `health_urls` in `prepare-release.py` only for public HTTPS endpoints that really answer on activation.
- **Resources and logs.** Set `deploy.resources.limits` and `json-file` log rotation like the existing services.

## Add a service to an existing target

1. Add the service to `deployment/<target>/docker-compose.<target>.yml`, and its networks and volumes to the target's `networks.yml` and `volumes.yml`.
2. Any new setting: add it to `prepare-release.py` (required or optional, in the target's branch), pass it through in `.github/workflows/_deploy.yml` (`Prepare archive, manifest and private environment`), create it in GitHub, and list it in [Secrets and config](secrets-and-config.md).
3. A built image: add the service to `_build.yml` callers in `deploy.yml` and to `registry-cleanup.yml`; extend `resolve-images`, `prepare-release.py` (`<SERVICE>_DIGEST`) and the digest inputs.
4. Stateful data: add a component to `deployment/backup/components.sh` and document it in [Backups](backups.md).
5. Check locally: `docker compose --project-directory deployment -f deployment/<t>/networks.yml -f deployment/<t>/volumes.yml -f deployment/<t>/docker-compose.<t>.yml config -q` with a dummy env file.
6. Deploy the target; verify as in [Deploy and release](deploy-and-release.md#verify).

## Add a new environment (target)

Toolkit 0.11 accepts the lock environments `development`, `production`, `infrastructure`, `monitoring` and `analytics` only; `ingress` therefore uses `infrastructure` (see [ADR 0001](../adr/0001-repository-standard.md)). A new target needs:

1. A directory `deployment/<name>/` with `networks.yml`, `volumes.yml`, `docker-compose.<name>.yml`.
2. `deployment/toolkit.conf`: add `<environment>:portfolio/versions/<name>` to `RELEASE_TARGETS`. The target name is the last path segment.
3. `prepare-release.py`: add the project name to `projects` and its settings branch.
4. `_deploy.yml`: add the name to the three `case "$TARGET"` lists and the preflight list; `rollback.yml`: add it to `environment` options.
5. A deploy workflow (`deploy-<name>.yml`, name `Deploy <Name>`) copied from `deploy-ingress.yml`, and a GitHub Environment with its secrets.
6. Update [Deploy and release](deploy-and-release.md), [Secrets and config](secrets-and-config.md) and this repository's `deployment/README.md`.

## Scheduled work

A recurring task is a **job** (or backup, or maintenance) in `deployment/toolkit.conf`, never a hand-written unit or cron entry. Scripts source `deployment/vendor/toolkit/log.sh`. See the [Toolkit consumer guide](https://github.com/H7KZ/Toolkit/tree/main/docs/consumers.md) and [conventions](https://github.com/H7KZ/Toolkit/tree/main/docs/conventions.md). After adding one, run `sudo deployment/toolkit install --deploy-user deploy` on the server, run it once by hand, then enable the printed timer.

## Verify

- `bash deployment/toolkit verify` and the Compose check pass; `actionlint` is clean for workflow edits.
- A Deploy for the target succeeds and `deployment/toolkit doctor` shows no `fail`.
