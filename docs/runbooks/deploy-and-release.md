# Deploy and release

Use this to ship code or configuration: what each workflow does, its inputs, and how a release moves from build to live. Everything runs on GitHub-hosted runners; the server only receives immutable toolkit releases over SSH. For a server that does not exist yet use [Fresh server](fresh-server.md).

## Targets

| Target        | Workflow       | What it runs                                      | Compose project | Files                     |
| ------------- | -------------- | ------------------------------------------------- | --------------- | ------------------------- |
| `production`  | Deploy         | web, CMS, Postgres                                | `portfolio`     | `deployment/production/`  |
| `development` | Deploy         | web only, reads the production CMS, noindex       | `portfolio-dev` | `deployment/development/` |
| `ingress`     | Deploy Ingress | Traefik, socket-proxy, CrowdSec (standalone only) | `global`        | `deployment/ingress/`     |

Images go to `ghcr.io/h7kz/portfoliov7/{web,cms}`. Analytics (Umami) and monitoring are the host's shared stack, deployed from Infrastructure; the site's `/stats` route is served by it. The `ingress` target exists for a dedicated server; on a host that runs Infrastructure's Traefik it is never deployed ([Split to own server](split-to-own-server.md)).

## Workflows

| Workflow         | File                                        | Trigger                                        | Purpose                                                                                             |
| ---------------- | ------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Verify Code      | `verify.yml`                                | pull request, manual, called                   | toolkit pin, type-check, lint, format check                                                         |
| Deploy           | `deploy.yml`                                | push to `main`, manual                         | verify, build or reuse images, Host Sync, deploy development or production                          |
| Host Sync        | `host-sync.yml`                             | push to `main` (toolkit files), manual, called | install the pinned toolkit, units and `/etc/toolkit/portfolio.env` on the VPS ([below](#host-sync)) |
| Deploy Ingress   | `deploy-ingress.yml`                        | manual                                         | deploy, stage or roll back this repository's own Traefik (standalone servers only)                  |
| Rollback         | `rollback.yml`                              | manual                                         | restore, activate or reconcile an existing release ([runbook](rollback-and-recovery.md))            |
| Backup Verify    | `backup-verify.yml`                         | daily and weekly, manual                       | freshness check and restore drill ([runbook](backups.md))                                           |
| Cleanup Registry | `registry-cleanup.yml`                      | weekly, manual (preview)                       | prune old GHCR image versions; digests retained on the VPS are protected                            |
| reusable         | `_resolve.yml`, `_build.yml`, `_deploy.yml` | called                                         | resolve a ref to one SHA, build one image, apply one release                                        |

A push to `main` runs Deploy for development. Everything else is manual. Deploy, Host Sync and Rollback post to `ALERT_DISCORD_WEBHOOK_URL` when they fail. The GitHub branch selector picks the workflow implementation; `ref` picks the source independently, so any branch, tag or SHA can be deployed to any target.

## Inputs

Same names, order and defaults as the other repositories (see the [repository standard](https://github.com/H7KZ/Toolkit/tree/main/docs/standard.md)).

**Deploy**

| Input         | Values (default first)              | Meaning                                                                                                                                                                    |
| ------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `environment` | `development`, `production`         | target; production includes the CMS                                                                                                                                        |
| `ref`         | blank = workflow ref                | branch, tag or full SHA to build and release                                                                                                                               |
| `operation`   | `deploy`, `stage`                   | activate now, or prepare a complete snapshot for later activation                                                                                                          |
| `mode`        | `reuse`, `build`, `existing`        | reuse images and build missing ones; always build; require existing images (`promote` and `run_id` are not offered: no qualified-development promotion in this repository) |
| `image_tag`   | blank = `<environment>-<sourceSHA>` | existing tag for `reuse`/`existing`; does not rename new builds                                                                                                            |
| `digests`     | blank                               | `existing` only: JSON `{"web":"sha256:...","cms":"sha256:..."}` (development needs `web` only); exclusive with `image_tag`                                                 |
| `verify`      | `true`                              | run Verify Code on the selected source first                                                                                                                               |
| `no_cache`    | `false`                             | build without the Docker layer cache                                                                                                                                       |

**Host Sync**: `ref`. **Deploy Ingress**: `ref`, `operation` (`deploy`, `stage`, `rollback`; rollback restores the `previous` ingress release).

**Rollback**: `environment` (`production`, `development`; default `production`; ingress is rolled back with Deploy Ingress), `ref`, `operation` (`rollback`, `activate`, `reconcile`; default `rollback`), `release_id` (default `previous`; `current`, or a release version such as `2026.10.25-31`).

**Backup Verify**: `ref`, `check` (`freshness`, `drill`, `both`; default `both`). **Cleanup Registry**: `keep_newest` (6), `min_age_days` (7), `packages`, `dry_run` (true), `protected_digests`. **Verify Code**: `ref`.

## What a deploy does

1. Resolve `ref` to one full SHA; every later job uses it.
2. Verify Code (unless `verify` is off): toolkit pin, type-check, lint, format.
3. Host Sync brings the VPS in line with the pin and `toolkit.conf` ([below](#host-sync)).
4. Resolve images: digests from `digests`, or `<environment>-<SHA>` (or `image_tag`) in GHCR; build the ones that are missing, or all with `mode` `build`. New builds carry `<environment>-<full SHA>` and the release version.
5. `_deploy.yml` verifies the toolkit pin on the controller and on the shipped copy, runs `deployment/prepare-release.py` to render the private dotenv, manifest and archive of tracked `deployment/` files, uploads them to `~/portfolio/incoming/<release-id>`, and runs `bash incoming/deployment/toolkit release <operation> <target>` as the deploy user.
6. Toolkit takes the repository lock, extracts the immutable snapshot `~/portfolio/versions/<target>/<release-id>/`, uses images already on the host (pulls only missing digests), creates missing `portfolio-*` networks and volumes, applies Compose, waits for health through the host's own Traefik (`127.0.0.1:443` with the real hostname), and only then moves `current` and `previous`. A failed gate re-applies `current` and fails the run (`rolled back automatically`). Images of the newest three snapshots plus `current` and `previous` stay on the host.

Release IDs are the release version (CalVer `YYYY.MM.DD-<run number>` of the Deploy run; a rerun attempt appends `.<attempt>`). Images are tagged with it and deployed as `name:version@sha256:digest`, so `docker ps` shows the version. After a successful production `deploy`, job `release` tags the source commit `v<version>` and publishes a GitHub Release whose notes `deployment/release-notes.py` groups from the Conventional Commits since the previous `v*` tag (only that job has `contents: write`). A staged release activated later through Rollback gets no tag. Mechanics, locks, hooks and failure behaviour: the [Toolkit deployment contract](https://github.com/H7KZ/Toolkit/tree/main/toolkit/contracts/deployment-release-v1.md).

Production's prepare hook (`deployment/scripts/pre-migrate-dump.sh`) dumps the running CMS database into `~/portfolio/dumps/` before new containers start. Dumps are never pruned automatically. The CMS applies Payload migrations when it starts, and an image rollback does not undo them ([restore a dump](rollback-and-recovery.md#restore-a-cms-migration-dump)).

## Stage, then activate

`operation` `stage` runs everything except starting containers and moving pointers (the production dump still runs). It prints the release ID. Activate it later with **Rollback**, `operation` `activate`, `release_id` that ID. Use it when public health URLs cannot answer yet, for example before a DNS cutover.

## Practical recipes

- **Deploy development from a branch**: Deploy, `environment` `development`, `ref` the branch.
- **Ship to production**: Deploy, `environment` `production`, `ref` the commit that development already ran, `mode` `reuse` (no rebuild when the images exist).
- **Redeploy exact images**: `mode` `existing` with `digests` from the earlier run's summary.
- **Change the ingress config**: Deploy Ingress. Third-party images (Postgres, Traefik, CrowdSec) are pinned to digests when staged. Umami is Infrastructure's.

A source ref older than the toolkit 0.11 migration has no `deployment/toolkit` and cannot be deployed or restored through these workflows.

## Host Sync

`host-sync.yml` packs the pinned toolkit, `toolkit.conf` and `deployment/backup/`, renders `/etc/toolkit/portfolio.env` from GitHub secrets (`BACKUP_BUCKET` variable, `BACKUP_B2_KEY_ID`, `BACKUP_B2_KEY`, `BACKUP_AGE_RECIPIENT`, `HC_PING_KEY`, `ALERT_DISCORD_WEBHOOK_URL`) and runs `deployment/toolkit install --env-file` on the host, then `doctor`. It runs before every Deploy, on every push to `main` that touches the pin, `toolkit.conf` or `deployment/backup/`, and by hand. The toolkit refuses deploys on an unsynced host (`host is not synced`); rollback never needs it. Install generates and enables, from [`deployment/toolkit.conf`](../../deployment/toolkit.conf):

| Unit                                  | Runs                                                     | When                                                  |
| ------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `toolkit-portfolio-reconcile.service` | `reconcile` of every target that has a `current` release | boot                                                  |
| `toolkit-portfolio-backup.timer`      | `backup run` (CMS database and media)                    | every four hours at :45 UTC, after one successful run |
| `toolkit-portfolio-notify@.service`   | posts a failed unit to `ALERT_DISCORD_WEBHOOK_URL`       | `OnFailure` of the units above                        |

## Verify

- The run is green and its summary names the release ID.
- **VPS as deploy user:** `ls -l ~/portfolio/versions/<target>/current` points to that ID, and `deployment/toolkit doctor` has no `fail`.
- `docker ps` shows the target's containers healthy; the public URL answers.
