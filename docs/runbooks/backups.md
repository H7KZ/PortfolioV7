# Backups

Use this to set up, verify or restore backups. Encrypted dumps of the stateful data are written by the pinned toolkit: `producer | zstd | age | rclone` to Backblaze B2 with Object Lock. Objects go to the host's bucket (variable `BACKUP_BUCKET`, shared by every repository on the host) under `portfolio/`. The VPS holds only the age public key and a write-only B2 key. Restores and drills need the age private key and a reader key, kept in GitHub secrets and the owner's password manager.

Toolkit mechanics: <https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md>.

## What is backed up

Declared in [`deployment/backup/components.sh`](../../deployment/backup/components.sh); the schedule (`BACKUP_AT`) and the list path in [`deployment/toolkit.conf`](../../deployment/toolkit.conf).

| Component      | What                                                                 | Drill                                              |
| -------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| `cms-postgres` | `pg_dump -Fc` of the Payload database (`portfolio-postgres`)         | `postgres`, image from the production Compose file |
| `cms-uploads`  | tar of `/data/media` in `portfolio-cms` (`portfolio-uploads-volume`) | `archive`                                          |

Every run captures both components (every 4 h at :45 UTC, `00/4:45`) into `daily/`, so database and media are taken together; the first run of each UTC Sunday also writes `weekly/`. Size floors (`BACKUP_MIN_BYTES`) are first guesses; tune them after the first real run if `backup check` reports a false alarm. The drill also asserts that the Payload `payload_migrations` table exists. Backups are staggered at :45 (Infrastructure :55, Ohlidame :15, Kreditozrouti :35). Umami (site analytics) is Infrastructure's shared instance and is backed up there.

Not backed up: Traefik certificates (re-issued by ACME on a standalone server), container images (in GHCR), and the pre-migration dumps in `~/portfolio/dumps` (a separate, unpruned safety net for bad migrations).

There is one CMS for both environments, so schema changes cannot be tried on development; they go from local testing to production guarded only by the pre-migration dump.

## Owner setup (once for all repositories)

1. **Laptop:** the host's bucket and keys (Infrastructure's `deployment/backup/provision-b2.sh setup`), an age key pair (private key off the VPS) and a Healthchecks project, then the Toolkit's `python3 scripts/setup-secrets.py --apply`: it sets this repository's backup and alert secrets ([Secrets and config](secrets-and-config.md)) and creates the checks `portfolio-backup`, `portfolio-backup-freshness` and `portfolio-backup-drill`. Steps: [Toolkit backups guide](https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md#set-up-owner-once-for-all-repositories).
2. **Nothing by hand on the VPS.** **Host Sync** (`host-sync.yml`, also the first job of every deploy) renders `/etc/toolkit/portfolio.env`, installs the units and runs `backup setup`: one full backup, then `toolkit-portfolio-backup.timer` is enabled. A failing first backup fails Host Sync and blocks deploys until fixed.
3. [Backup Verify](../../.github/workflows/backup-verify.yml) checks freshness daily and runs the restore drill weekly on a GitHub runner, never on the VPS. Run it by hand with `check` `freshness`, `drill` or `both`.

## Restore

From a machine with the age private key and a reader key (not the VPS by default), in a checkout of this repository. The machine needs `age`, `rclone` and `zstd` on the PATH (on the VPS `sudo deployment/toolkit backup install-tools` installs pinned ones):

```bash
export TOOLKIT_DIRECT=1 BACKUP_BUCKET=<the host's bucket> BACKUP_B2_KEY_ID=<reader id> BACKUP_B2_KEY=<reader key>   # reads portfolio/
deployment/toolkit backup list cms-postgres
deployment/toolkit backup fetch cms-postgres -o cms.pgdump --identity ~/age.key
# older: --tier weekly --at 2026-10-18T03:00:00Z, or --version-at TIME; a migration capture: --tier pinned
```

Copy the plaintext to the VPS, then restore. Stop the dependent application first and start it afterwards. On a fresh host, deploy production first so the containers and volumes exist.

**VPS as deploy user:**

- **`cms-postgres`**:

  ```bash
  docker stop portfolio-cms
  docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < cms.pgdump
  docker start portfolio-cms
  ```

  The CMS applies pending Payload migrations on start.

- **`cms-uploads`**: `docker exec -i portfolio-cms tar -C /data/media -xf - < cms-uploads.tar`. Files are written alongside existing ones; no restart needed.

Rehearse with `deployment/toolkit backup drill` (needs Docker and `BACKUP_AGE_IDENTITY` as a file path) before you need it.

Moving to another host: capture a final copy on the old one (`sudo deployment/toolkit backup run --pinned`) and restore it with `--tier pinned`; the whole-host sequence is Infrastructure's [migrate-host runbook](https://github.com/H7KZ/Infrastructure/tree/main/docs/runbooks/migrate-host.md).

## Verify

- `deployment/toolkit backup list` shows recent objects for both components; `systemctl list-timers 'toolkit-portfolio-*'` lists the backup timer; Healthchecks shows the `portfolio-backup*` pings.
- Backup Verify is green (freshness daily, drill weekly).
- After a restore: sign in to the CMS and open a project with media.
