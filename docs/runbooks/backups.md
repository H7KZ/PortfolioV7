# Backups

Use this to set up, verify or restore backups. Encrypted dumps of the stateful data are written by the pinned toolkit: `producer | zstd | age | rclone` to Backblaze B2 with Object Lock. The VPS holds only the age public key and a write-only B2 key. Restores and drills need the age private key and a reader key, kept in GitHub secrets and the owner's password manager. Nothing is enabled until the owner does the setup below.

Toolkit mechanics: <https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md>.

## What is backed up

Declared in [`deployment/backup/components.sh`](../../deployment/backup/components.sh); schedules and the list path in [`deployment/toolkit.conf`](../../deployment/toolkit.conf).

| Component        | What                                                                 | Cadence              | Drill                                              |
| ---------------- | -------------------------------------------------------------------- | -------------------- | -------------------------------------------------- |
| `cms-postgres`   | `pg_dump -Fc` of the Payload database (`portfolio-postgres`)         | every 4h (`00/4:45`) | `postgres`, image from the production Compose file |
| `umami-postgres` | `pg_dump -Fc` of Umami (`portfolio-umami-postgres`)                  | daily (01:45 UTC)    | `postgres`, image from the monitoring Compose file |
| `cms-uploads`    | tar of `/data/media` in `portfolio-cms` (`portfolio-uploads-volume`) | daily (01:45 UTC)    | `archive`                                          |

The daily run also captures the 4h component, so database and media are taken together. Size floors (`BACKUP_MIN_BYTES`) are first guesses; tune them after the first real run if `backup check` reports a false alarm. The drill also asserts that the Payload (`payload_migrations`) and Umami (`website`) tables exist. Backups are staggered at :45 (Infrastructure :55, Ohlidame :15, Kreditozrouti :35).

Not backed up: Traefik certificates (re-issued by ACME on a standalone server), container images (in GHCR), and the pre-migration dumps in `~/portfolio/dumps` (a separate, unpruned safety net for bad migrations).

Accepted risk: until the owner enables the timers, a lost disk or deleted volume loses all CMS content, media and contact submissions. There is one CMS for both environments, so schema changes cannot be tried on development; they go from local testing to production guarded only by the pre-migration dump.

## Owner setup (once)

1. Follow [Set up a repository](https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md#set-up-a-repository-owner-once): a B2 Object Lock bucket with a writer key and a reader key, an age key pair (private key off the VPS), and Healthchecks checks `4h`, `daily`, `freshness` and `drill`.
2. **VPS as root:** create `/etc/toolkit/portfolio.env` (0600) with `BACKUP_BUCKET`, `BACKUP_B2_KEY_ID`, `BACKUP_B2_KEY` (writer), `BACKUP_AGE_RECIPIENT`, `BACKUP_HC_4H_URL`, `BACKUP_HC_DAILY_URL`.
3. **VPS as root,** from the checkout: install, run once by hand, then enable.

   ```bash
   deployment/toolkit install --deploy-user deploy
   deployment/toolkit backup run daily
   deployment/toolkit backup list
   systemctl enable --now toolkit-portfolio-backup@4h.timer toolkit-portfolio-backup@daily.timer
   deployment/toolkit doctor
   ```

4. **GitHub:** repository variable `BACKUP_BUCKET`; secrets `BACKUP_B2_READER_KEY_ID`, `BACKUP_B2_READER_KEY`, `BACKUP_AGE_IDENTITY` (private key contents), `BACKUP_HC_FRESHNESS_URL`, `BACKUP_HC_DRILL_URL`. [Backup Verify](../../.github/workflows/backup-verify.yml) then checks freshness daily and runs the restore drill weekly on a GitHub runner, never on the VPS. Run it by hand with `check` `freshness`, `drill` or `both`.

## Restore

From a machine with the age private key and a reader key (not the VPS by default), in a checkout of this repository. The machine needs `age`, `rclone` and `zstd` on the PATH (on the VPS `sudo deployment/toolkit backup install-tools` installs pinned ones):

```bash
export TOOLKIT_DIRECT=1 BACKUP_BUCKET=<bucket> BACKUP_B2_KEY_ID=<reader id> BACKUP_B2_KEY=<reader key>
deployment/toolkit backup list cms-postgres
deployment/toolkit backup fetch cms-postgres -o cms.pgdump --identity ~/age.key
# older: --tier weekly --at 2026-10-18T03:00:00Z, or --version-at TIME
```

Copy the plaintext to the VPS, then restore. Stop the dependent application first and start it afterwards. On a fresh host, deploy production (and monitoring) first so the containers and volumes exist.

**VPS as deploy user:**

- **`cms-postgres`**:

  ```bash
  docker stop portfolio-cms
  docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < cms.pgdump
  docker start portfolio-cms
  ```

  The CMS applies pending Payload migrations on start.

- **`umami-postgres`**: `docker stop portfolio-umami`, the same `pg_restore` against `portfolio-umami-postgres`, then `docker start portfolio-umami`.
- **`cms-uploads`**: `docker exec -i portfolio-cms tar -C /data/media -xf - < cms-uploads.tar`. Files are written alongside existing ones; no restart needed.

Rehearse with `deployment/toolkit backup drill` (needs Docker and `BACKUP_AGE_IDENTITY` as a file path) before you need it.

## Verify

- `deployment/toolkit backup list` shows recent objects for all three components; Healthchecks shows the pings.
- Backup Verify is green (freshness daily, drill weekly).
- After a restore: sign in to the CMS, open a project with media, check Umami shows the historical data.
