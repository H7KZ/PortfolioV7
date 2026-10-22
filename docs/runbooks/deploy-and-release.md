# Deploy and release

Use this to ship code or configuration: what each workflow does, its inputs, and how a release moves from build to live. Everything runs on GitHub-hosted runners; the server only receives immutable toolkit releases over SSH. For a server that does not exist yet use [Fresh server](fresh-server.md).

## Targets

| Target        | Workflow          | What it runs                                      | Compose project       | Files                     |
| ------------- | ----------------- | ------------------------------------------------- | --------------------- | ------------------------- |
| `production`  | Deploy            | web, CMS, Postgres                                | `portfolio`           | `deployment/production/`  |
| `development` | Deploy            | web only, reads the production CMS, noindex       | `portfolio-dev`       | `deployment/development/` |
| `monitoring`  | Deploy Monitoring | self-hosted Umami and its Postgres                | `portfolio-analytics` | `deployment/monitoring/`  |
| `ingress`     | Deploy Ingress    | Traefik, socket-proxy, CrowdSec (standalone only) | `global`              | `deployment/ingress/`     |

Images go to `ghcr.io/h7kz/portfoliov7/{web,cms}`. The `ingress` target exists for a dedicated server; on a host that runs Infrastructure's Traefik it is never deployed ([Split to own server](split-to-own-server.md)).

## Workflows

| Workflow          | File                                        | Trigger                      | Purpose                                                                                  |
| ----------------- | ------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Verify Code       | `verify.yml`                                | pull request, manual, called | toolkit pin, type-check, lint, format check                                              |
| Deploy            | `deploy.yml`                                | push to `main`, manual       | verify, build or reuse images, deploy development or production                          |
| Deploy Monitoring | `deploy-monitoring.yml`                     | manual                       | deploy or stage the Umami stack                                                          |
| Deploy Ingress    | `deploy-ingress.yml`                        | manual                       | deploy, stage or roll back this repository's own Traefik (standalone servers only)       |
| Rollback          | `rollback.yml`                              | manual                       | restore, activate or reconcile an existing release ([runbook](rollback-and-recovery.md)) |
| Backup Verify     | `backup-verify.yml`                         | daily and weekly, manual     | freshness check and restore drill ([runbook](backups.md))                                |
| Cleanup Registry  | `registry-cleanup.yml`                      | weekly preview, manual       | prune old GHCR image versions                                                            |
| reusable          | `_resolve.yml`, `_build.yml`, `_deploy.yml` | called                       | resolve a ref to one SHA, build one image, apply one release                             |

A push to `main` runs Deploy for development. Everything else is manual. The GitHub branch selector picks the workflow implementation; `ref` picks the source independently, so any branch, tag or SHA can be deployed to any target.

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

**Deploy Monitoring**: `ref`, `operation` (`deploy`, `stage`). **Deploy Ingress**: `ref`, `operation` (`deploy`, `stage`, `rollback`; rollback restores the `previous` ingress release).

**Rollback**: `environment` (`production`, `development`, `monitoring`; default `production`; ingress is rolled back with Deploy Ingress), `ref`, `operation` (`rollback`, `activate`, `reconcile`; default `rollback`), `release_id` (default `previous`).

**Backup Verify**: `ref`, `check` (`freshness`, `drill`, `both`; default `both`). **Cleanup Registry**: `keep_newest` (6), `min_age_days` (7), `packages`, `dry_run` (true), `protected_digests`. **Verify Code**: `ref`.

## What a deploy does

1. Resolve `ref` to one full SHA; every later job uses it.
2. Verify Code (unless `verify` is off): toolkit pin, type-check, lint, format.
3. Resolve images: digests from `digests`, or `<environment>-<SHA>` (or `image_tag`) in GHCR; build the ones that are missing, or all with `mode` `build`. New builds always carry `<environment>-<full SHA>`.
4. `_deploy.yml` verifies the toolkit pin on the controller and on the shipped copy, runs `deployment/prepare-release.py` to render the private dotenv, manifest and archive of tracked `deployment/` files, uploads them to `~/portfolio/incoming/<release-id>`, and runs `bash incoming/deployment/toolkit release <operation> <target>` as the deploy user.
5. Toolkit takes the repository lock, extracts the immutable snapshot `~/portfolio/versions/<target>/<release-id>/`, pins every image to a digest, creates missing `portfolio-*` networks and volumes, applies Compose, waits for health, and only then moves `current` and `previous`.

Release IDs are `<fullSHA>-<run>-<attempt>`. Mechanics, locks, hooks and failure behaviour: the [Toolkit deployment contract](https://github.com/H7KZ/Toolkit/tree/main/toolkit/contracts/deployment-release-v1.md).

Production's prepare hook (`deployment/scripts/pre-migrate-dump.sh`) dumps the running CMS database into `~/portfolio/dumps/` before new containers start. Dumps are never pruned automatically. The CMS applies Payload migrations when it starts, and an image rollback does not undo them ([restore a dump](rollback-and-recovery.md#restore-a-cms-migration-dump)).

## Stage, then activate

`operation` `stage` runs everything except starting containers and moving pointers (the production dump still runs). It prints the release ID. Activate it later with **Rollback**, `operation` `activate`, `release_id` that ID. Use it when public health URLs cannot answer yet, for example before a DNS cutover.

## Practical recipes

- **Deploy development from a branch**: Deploy, `environment` `development`, `ref` the branch.
- **Ship to production**: Deploy, `environment` `production`, `ref` the commit that development already ran, `mode` `reuse` (no rebuild when the images exist).
- **Redeploy exact images**: `mode` `existing` with `digests` from the earlier run's summary.
- **Change the Umami or ingress config**: Deploy Monitoring or Deploy Ingress. Third-party images (Umami, Postgres, Traefik, CrowdSec) are pinned to digests when staged.

A source ref older than the toolkit 0.11 migration has no `deployment/toolkit` and cannot be deployed or restored through these workflows.

## Host units

`sudo deployment/toolkit install --deploy-user deploy` generates, from [`deployment/toolkit.conf`](../../deployment/toolkit.conf), and enables nothing:

| Unit                                      | Runs                                                         | When                        |
| ----------------------------------------- | ------------------------------------------------------------ | --------------------------- |
| `toolkit-portfolio-reconcile.service`     | `reconcile` of every target that has a `current` release     | boot (enable it)            |
| `toolkit-portfolio-umami-retention.timer` | `deployment/monitoring/retention.sh` (job `umami-retention`) | daily 03:17 Europe/Prague   |
| `toolkit-portfolio-backup@4h.timer`       | `backup run 4h` (CMS database)                               | every four hours at :45 UTC |
| `toolkit-portfolio-backup@daily.timer`    | `backup run daily` (Umami database, CMS media)               | 01:45 UTC                   |

The retention job runs as root under the `portfolio` repository lock, takes the SQL from the current monitoring snapshot and keeps 13 months of Umami data. Snapshots staged before the `analytics` to `monitoring` directory rename are still read correctly.

## Verify

- The run is green and its summary names the release ID.
- **VPS as deploy user:** `ls -l ~/portfolio/versions/<target>/current` points to that ID, and `deployment/toolkit doctor` has no `fail`.
- `docker ps` shows the target's containers healthy; the public URL answers.
