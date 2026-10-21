# GitHub and VPS deployment

Every push to `main` runs **Deploy App** on GitHub-hosted runners: type-check, lint and format-check, then build and deploy development. Failed verification blocks image builds and deployment. Manual **Deploy App** supports both environments from any workflow branch and any source branch, tag or SHA. Production deploys the complete web, CMS and Postgres project; development deploys web only and reads the global production CMS. Production, monitoring and release restoration remain manual.

## Repository and host configuration

1. Infrastructure must provision Docker, Traefik and `public-network`. Toolkit creates missing `portfolio-*` external networks and volumes from the resolved Compose model.
2. Set repository secrets `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`, `SSH_HOST_FINGERPRINT`. Obtain the SHA256 server key fingerprint through a trusted host channel; both SSH and SCP require it.
3. Create GitHub Environments `production`, `development`, `monitoring` with these values. Allow all deployment branches so administrators can target any environment from any workflow ref. Environment secrets and variables still follow the selected target.

| Environment   | Variables                                                                                                | Secrets                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `production`  | `PROJECT=prod`, `DOMAIN=jankominek.com`, `CMS_DOMAIN=cms.jankominek.com`, `UMAMI_WEBSITE_ID` after setup | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`, `CMS_CONTACT_API_KEY`, optional `DISCORD_WEBHOOK_URL` |
| `development` | `PROJECT=dev`, `DOMAIN=dev.jankominek.com`                                                               | `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`                                                                                                                               |
| `monitoring`  | `SITE_DOMAIN=jankominek.com`, `UMAMI_DOMAIN=umami.jankominek.com`                                        | `UMAMI_DB_NAME`, `UMAMI_DB_USER`, `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`                                                                                                               |

Development's preview, revalidation and read keys must match production. Generate secrets with `openssl rand -base64 32`. The renderer rejects dollars, backticks, single quotes, backslashes and line breaks; diagnostics name fields without printing values. Private dotenv travels separately from the source archive and is deleted from incoming storage after use.

## Toolkit

This repository runs only the toolkit release it pins, never one installed on the server. `deployment/toolkit` is the entrypoint; `deployment/toolkit.lock` and `deployment/vendor/toolkit/` are the pin. [`deployment/toolkit.conf`](../../deployment/toolkit.conf) declares everything the toolkit does here: repository `portfolio`, release targets `production`, `development` and `monitoring` (roots `~/portfolio/versions/<target>`), backups, and the `umami-retention` job.

CI ships the deployed revision's `deployment/toolkit`, `toolkit.conf`, `toolkit.lock` and `vendor/toolkit/` with each release and runs the entrypoint on the VPS as the deploy user, so the bytes that deploy are the bytes the pin names. Before SSH the workflow runs `bash deployment/toolkit verify` on the controller and on the shipped copy.

```bash
bash deployment/toolkit verify                       # anywhere, read-only
sudo deployment/toolkit install --deploy-user deploy # VPS, from a trusted checkout, once per pin or script change
deployment/toolkit doctor                            # VPS, read-only health of host and repository
deployment/toolkit release rollback production       # deploy user on the VPS
```

`install` copies the pin and the scripts `toolkit.conf` references to `/opt/toolkit/portfolio/` and writes the units, never enabling them. The deploy account is root-equivalent (Docker group plus the toolkit loader); treat its SSH key that way. Never hand-edit `deployment/toolkit`, `deployment/toolkit.lock` or `deployment/vendor/toolkit/`; repin from the Toolkit repository. Guides: [consumers](https://github.com/H7KZ/Toolkit/tree/main/docs/consumers.md), [host](https://github.com/H7KZ/Toolkit/tree/main/docs/host.md), [commands](https://github.com/H7KZ/Toolkit/tree/main/docs/commands.md).

A source ref older than the 0.11 migration has no `deployment/toolkit` and cannot be deployed or restored through these workflows; restore such snapshots from a checkout of a migrated revision.

## Immutable releases and rollback

**Deploy App** builds or resolves the selected environment's complete application images. Buildx returns each digest; production records both `portfolio-web` and `portfolio-cms`, development records web. New image tags use `<environment>-<full source commit>` to keep environment builds distinct. Release IDs are `<fullSHA>-<run>-<attempt>`.

`prepare-release.py` packages tracked deployment contents at archive root, rejecting symlinks, special files, hidden/generated paths and dotenv. Manifest v1 identifies repository `portfolio`, environment, Compose project, exact images, Compose files and health URLs. This slug matches the existing `portfolio-*` resources. Analytics uses environment `monitoring`, project `portfolio-analytics`, and only `analytics/{networks,volumes,docker-compose.analytics}.yml`. Toolkit resolves and pins third-party images during staging, including both analytics images and application Postgres.

The reusable environment job provisions its release root as the deploy user, sends private inputs and the toolkit packet to a unique incoming directory and runs `bash incoming/deployment/toolkit release deploy <target>` as the deploy user with absolute paths and an isolated temporary registry configuration. Toolkit owns release locks, health checks, immutable snapshot metadata, private runtime, and `current`/`previous` under `~/portfolio/versions/<environment>`. No workflow updates pointers or prunes images or snapshots.

The apply SSH command allows 110 minutes inside a 120-minute job, covering separate 30-minute repository and host lock waits plus downloads and health checks. Installed host services allow 90 minutes.

**Restore Release** accepts `current`, `previous` or an existing release ID. Choose `rollback` to restore a snapshot, `activate` for a staged snapshot, or `reconcile` to restart the current snapshot without recreating containers. It restores that complete snapshot's environment, Compose model and pinned images without rendering new secrets or rebuilding. It also handles monitoring. Keep registry digests available for every retained snapshot; package age alone is insufficient evidence for deletion.

Production's prepare hook dumps the running CMS database before new containers start. It retains private migration recovery dumps in `~/portfolio/dumps` without automatic pruning. Delete a dump only after checking retained snapshot and recovery references. An existing stopped database or an orphaned database volume blocks migration; first deployment may skip the dump only when neither database container nor volume exists. CMS still applies Payload migrations on startup. Validate schema changes against a local copy of production content. Image rollback does not undo database migrations; restore an appropriate dump separately when required:

```bash
docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < /absolute/path/to/dump
```

These dumps guard migrations on the same host, not host loss. The optional Discord webhook contains only a company name or email domain and a link to the CMS submission.

## Boot reconciliation and retention

`sudo deployment/toolkit install --deploy-user deploy` writes, from `toolkit.conf`, and enables nothing:

| Unit                                      | Runs                                                        | When                                                            |
| ----------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `toolkit-portfolio-reconcile.service`     | `reconcile` of production, development and monitoring       | boot (enable it)                                                |
| `toolkit-portfolio-umami-retention.timer` | `deployment/analytics/retention.sh` (job `umami-retention`) | daily 02:17 UTC                                                 |
| `toolkit-portfolio-backup@4h.timer`       | `backup run 4h` (CMS database)                              | `00/4:45 UTC`; see [backups](../../deployment/backup/README.md) |
| `toolkit-portfolio-backup@daily.timer`    | `backup run daily` (Umami database, CMS media)              | 01:45 UTC                                                       |

Reconcile uses each target's current pointer under the deploy user's home. Missing pointers are no-ops; legacy or corrupt snapshots fail visibly and require migration. Toolkit uses the recorded resolved model with `up --no-recreate --pull never --no-build`; no global stopped-container start exists.

The retention job runs as root under the `portfolio` repository lock, the same lock releases take. It reads current monitoring metadata, validates the sealed inventory, and runs that snapshot's SQL against only `portfolio-analytics`, retaining 13 months. There is no GitHub schedule. Enable timers only after a manual run succeeds (`sudo systemctl start toolkit-portfolio-umami-retention.service`), as a separately authorized host operation.

For legacy migration, preserve the old deployment and database data, stage a complete release with `deployment/toolkit release stage` using the same inputs as a deploy, then explicitly activate its ID with `release activate`. Staging runs the CMS dump hook; refresh the dump separately before delayed activation if data changed since staging. Keep the first complete snapshot verified before retiring legacy pointers. After host review, retire the old `docker-boot-recovery.service` and repository runner containers. None of those host changes occur through this repository edit.

## Migrating a VPS to toolkit 0.11

Once, after this revision is pulled in a trusted checkout on the VPS (for example `~/portfolio-checkout`). Earlier revisions installed these legacy files; nothing was ever backed up, so there is no `/etc/toolkit/backup/portfolio.env` to move.

```bash
cd ~/portfolio-checkout && git pull
bash deployment/toolkit verify
deployment/toolkit doctor                       # lists what is legacy
sudo systemctl disable --now portfoliov7-reconcile.service portfoliov7-umami-retention.timer
sudo rm -f /etc/systemd/system/portfoliov7-reconcile.service \
  /etc/systemd/system/portfoliov7-umami-retention.service \
  /etc/systemd/system/portfoliov7-umami-retention.timer
sudo rm -rf /opt/portfoliov7-deployment /etc/portfoliov7-release.conf
sudo systemctl daemon-reload
sudo deployment/toolkit install --deploy-user deploy
sudo systemctl enable toolkit-portfolio-reconcile.service
sudo systemctl enable --now toolkit-portfolio-umami-retention.timer   # after a manual run succeeds
deployment/toolkit doctor
```

Backups stay off until the owner follows [`deployment/backup/README.md`](../../deployment/backup/README.md) and creates `/etc/toolkit/portfolio.env`. When every repository on the host is migrated, remove the host-wide leftovers as described in the [Toolkit host guide](https://github.com/H7KZ/Toolkit/tree/main/docs/host.md#migrating-a-host-from-010-or-older). Until then do not remove them: other repositories may still use them.

## First deployment

1. Prepare [Cloudflare Access](cloudflare.md) for Umami, CMS and development before their public DNS records.
2. Ensure public health URLs already route to the VPS when activating. For a cutover that cannot yet satisfy them, stage first and activate only after routing is ready. Container health checks cover the protected CMS and development site; unauthenticated Access pages are excluded from public health URLs.
3. Dispatch **Deploy Monitoring**. Complete [Umami setup](analytics.md) and set `UMAMI_WEBSITE_ID`.
4. Dispatch **Deploy App** for production. Create the Payload admin and complete [V6 content import](content-import.md).
5. Push to `main` or dispatch **Deploy App** for development. Verify it reads production CMS and remains unindexed and untracked. Automatic development releases need the production CMS and shared networks provisioned first.
6. Manual deploys run from any workflow branch: select `environment` and `ref` independently. Blank `ref` uses the workflow ref. The workflow resolves one full source SHA for verification, builds and release contents. See the manual controls below.
7. Follow [Cloudflare cutover](cloudflare.md#apex-cutover-from-v6), checking public pages and the first-party tracker after routing changes.

## Manual controls

Workflow names are **Deploy App**, **Deploy Monitoring**, **Restore Release**, **Verify Code** and **Cleanup Registry**. The GitHub branch selector chooses the workflow implementation; `ref` chooses the source independently. Manual runs do not impose branch restrictions.

| Deploy App input | Meaning                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `environment`    | `development` (web only) or `production` (web and CMS)                                                                                                                 |
| `ref`            | Branch, tag or full SHA; blank uses workflow ref                                                                                                                       |
| `mode`           | `build` always builds; `reuse` resolves images and builds missing ones; `existing` fails if any image is absent                                                        |
| `image_tag`      | Optional tag for reuse/existing; default `<environment>-<sourceSHA>`. Use an old full-SHA tag for legacy images                                                        |
| `digests`        | Existing-only complete JSON map: development needs `web`, production needs `web` and `cms`; each value is a full `sha256:` digest. Mutually exclusive with `image_tag` |
| `verify`         | Run type-check, lint and format checks on the selected source; default true                                                                                            |
| `no_cache`       | Disable Docker layer reuse for images built by this run                                                                                                                |
| `operation`      | `deploy` activates now; `stage` prepares a complete immutable snapshot without activation                                                                              |

`image_tag` does not rename newly built images. All new builds use the target environment and resolved source SHA. Explicit images may contain different code from the selected source; the operator is responsible for matching image content to source. No secret values are entered in the manual form.

`stage` still runs the prepare hook, including the production CMS dump, but does not switch current/previous or start containers. Activate the reported release ID through **Restore Release**. Staged application releases need their retained image digests available.

**Deploy Monitoring** exposes `ref` and `operation`; its target remains `monitoring`. **Restore Release** exposes the toolkit `ref`, target `environment`, `operation` and `release_id`. Reconcile always uses current and ignores `release_id`; restore operations use the retained snapshot's contents and secrets.

**Verify Code** accepts a source `ref`. **Cleanup Registry** exposes `packages`, `keep_newest` (default 6), `min_age_days` (default 7), `dry_run` (default true) and `protected_digests`. Packages are restricted to this repository's web and CMS images; blank selects both. Scheduled runs always preview. Before deleting, supply every digest required by current, previous, staged and retained rollback snapshots.
