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

## Toolkit installation

`deployment/toolkit.lock` and the corresponding archive/checksum pin the repository toolkit. CI sends them
on every deploy and rollback, then calls the root-installed stable bundle runner. It validates and
executes those exact bytes independently of the active VPS administrator toolkit.

From a trusted checkout, install the CI runner and grant the actual deployment account access:

```bash
bash deployment/verify-toolkit-pin.sh
sudo bash deployment/install-toolkit.sh --ci-only --deploy-user YOUR_DEPLOY_USER
# Optional: omit --ci-only to install the administrator CLI inactive.
# Add --activate only when explicitly selecting a new host default.
```

Manual admin, boot recovery and retention use the independently activated host toolkit
(>=0.8.1, <1.0.0 shared lock/snapshot API). Refresh root-owned boot/retention controls using their
owner installer to remove old pin equality checks. CI never changes `/opt/toolkit/current`.
The deploy account is root-equivalent through Docker and the trusted bundle execution sudo rule.
See [bundle installation](../../deployment/vendor/toolkit/README.md).

Manual `deployment/deploy.sh` and `rollback.sh` wrappers additionally require separately authorized
passwordless sudo for `/usr/local/bin/toolkit release`. Infrastructure bootstrap supplies this for
its deployment account; `--ci-only --deploy-user` grants only bundle runner access. Boot recovery
and installed retention already run as root and do not require deployment-account sudo privileges.

## Immutable releases and rollback

**Deploy App** builds or resolves the selected environment's complete application images. Buildx returns each digest; production records both `portfolio-web` and `portfolio-cms`, development records web. New image tags use `<environment>-<full source commit>` to keep environment builds distinct. Release IDs are `<fullSHA>-<run>-<attempt>`.

`prepare-release.py` packages tracked deployment contents at archive root, rejecting symlinks, special files, hidden/generated paths and dotenv. Manifest v1 identifies repository `portfolio`, environment, Compose project, exact images, Compose files and health URLs. This slug matches the existing `portfolio-*` resources. Analytics uses environment `monitoring`, project `portfolio-analytics`, and only `analytics/{networks,volumes,docker-compose.analytics}.yml`. Toolkit resolves and pins third-party images during staging, including both analytics images and application Postgres.

The reusable environment job provisions its release root as the deploy user, sends private inputs to a unique incoming directory and calls `sudo -n /usr/local/libexec/toolkit-run-bundle ... -- release deploy` with absolute paths, the deploy user and an isolated temporary registry configuration. Toolkit owns release locks, health checks, immutable snapshot metadata, private runtime, and `current`/`previous` under `~/portfolio/versions/<environment>`. No workflow updates pointers or prunes images or snapshots.

The apply SSH command allows 110 minutes inside a 120-minute job, covering separate 30-minute repository and host lock waits plus downloads and health checks. Installed host services allow 90 minutes.

**Restore Release** accepts `current`, `previous` or an existing release ID. Choose `rollback` to restore a snapshot, `activate` for a staged snapshot, or `reconcile` to restart the current snapshot without recreating containers. It restores that complete snapshot's environment, Compose model and pinned images without rendering new secrets or rebuilding. It also handles monitoring. Keep registry digests available for every retained snapshot; package age alone is insufficient evidence for deletion.

Production's prepare hook dumps the running CMS database before new containers start. It retains private migration recovery dumps in `~/portfolio/dumps` without automatic pruning. Delete a dump only after checking retained snapshot and recovery references. An existing stopped database or an orphaned database volume blocks migration; first deployment may skip the dump only when neither database container nor volume exists. CMS still applies Payload migrations on startup. Validate schema changes against a local copy of production content. Image rollback does not undo database migrations; restore an appropriate dump separately when required:

```bash
docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < /absolute/path/to/dump
```

These dumps guard migrations on the same host, not host loss. The optional Discord webhook contains only a company name or email domain and a link to the CMS submission.

## Boot reconciliation and retention

```bash
sudo bash deployment/boot-recovery/install.sh "$USER"
```

The installer copies root-owned control files to `/opt/portfoliov7-deployment`, writes `/etc/portfoliov7-release.conf` with `DEPLOY_USER`, and installs units without enabling or starting anything.

`portfoliov7-reconcile.service` runs as root and invokes generic toolkit reconcile for production (`portfolio`), development (`portfolio-dev`) and monitoring (`portfolio-analytics`), using that account's actual home/current pointers. Missing pointers are no-ops. Legacy or corrupt snapshots fail visibly and require migration. Toolkit uses the recorded resolved model with `up --no-recreate --pull never --no-build`; no global stopped-container start exists.

`portfoliov7-umami-retention.timer` is disabled on installation. Its service acquires the same `portfolio` repository lock as releases before reading current monitoring metadata, validating the sealed inventory, and running that snapshot's SQL against only `portfolio-analytics`. It retains 13 months. There is no GitHub schedule. Enable or manually run these units only through separately authorized host operations.

For legacy migration, preserve the old deployment and database data, install the pinned toolkit, stage a complete release with `toolkit release stage` using the same arguments as deploy, then explicitly activate its ID with `release activate`. Staging runs the CMS dump hook; refresh the dump separately before delayed activation if data changed since staging. Keep the first complete snapshot verified before retiring legacy pointers. After host review, retire the old `docker-boot-recovery.service` and repository runner containers. None of those host changes occur through this repository edit.

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
