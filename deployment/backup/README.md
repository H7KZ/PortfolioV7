# Backups

Encrypted dumps of the stateful data, written by the pinned toolkit: `producer | zstd | age | rclone` to Backblaze B2 with Object Lock. The VPS holds only the age public key and a write-only B2 key. Restores and drills need the age private key and a reader key, kept in GitHub secrets and the owner's password manager. Nothing is enabled until the owner does the setup below.

Full guide: <https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md>.

## Components

Declared in [`components.sh`](components.sh); schedules and the list path in [`../toolkit.conf`](../toolkit.conf).

| Component        | What                                                                 | Cadence              | Drill                                              |
| ---------------- | -------------------------------------------------------------------- | -------------------- | -------------------------------------------------- |
| `cms-postgres`   | `pg_dump -Fc` of the Payload database (`portfolio-postgres`)         | every 4h (`00/4:45`) | `postgres`, image from the production Compose file |
| `umami-postgres` | `pg_dump -Fc` of Umami (`portfolio-umami-postgres`)                  | daily (`01:45 UTC`)  | `postgres`, image from the monitoring Compose file |
| `cms-uploads`    | tar of `/data/media` in `portfolio-cms` (`portfolio-uploads-volume`) | daily (`01:45 UTC`)  | `archive`                                          |

The daily run also captures the 4h component, so database and media are taken together. The size floors (`BACKUP_MIN_BYTES`) are first guesses; tune them after the first real run if `backup check` reports a false alarm. The drill also asserts the Payload (`payload_migrations`) and Umami (`website`) tables exist.

The migration dumps taken before each CMS deploy (`~/portfolio/dumps`) remain separate and are not pruned.

## Owner setup (once)

1. Follow [Set up a repository](https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md#set-up-a-repository-owner-once): a B2 Object Lock bucket with a writer key and a reader key, an age key pair (private key off the VPS), and Healthchecks checks `4h`, `daily`, `freshness` and `drill`.
2. On the VPS create `/etc/toolkit/portfolio.env` (root, 0600) with `BACKUP_BUCKET`, `BACKUP_B2_KEY_ID`, `BACKUP_B2_KEY` (writer), `BACKUP_AGE_RECIPIENT`, `BACKUP_HC_4H_URL`, `BACKUP_HC_DAILY_URL`.
3. Install, run once by hand, then enable:

   ```bash
   sudo deployment/toolkit install --deploy-user deploy
   sudo deployment/toolkit backup run daily
   sudo deployment/toolkit backup list
   sudo systemctl enable --now toolkit-portfolio-backup@4h.timer toolkit-portfolio-backup@daily.timer
   deployment/toolkit doctor
   ```

4. GitHub: repository variable `BACKUP_BUCKET`; secrets `BACKUP_B2_READER_KEY_ID`, `BACKUP_B2_READER_KEY`, `BACKUP_AGE_IDENTITY` (private key contents), `BACKUP_HC_FRESHNESS_URL`, `BACKUP_HC_DRILL_URL`. [**Backup Verify**](../../.github/workflows/backup-verify.yml) then checks freshness daily and runs the restore drill weekly on a GitHub runner, never on the VPS.

Backups are staggered at :45 (Infrastructure :55, Ohlidame :15, Kreditozrouti :35).

## Restore

From a machine with the age private key and a reader key (not the VPS by default), in a checkout of this repository:

```bash
export TOOLKIT_DIRECT=1 BACKUP_BUCKET=… BACKUP_B2_KEY_ID=<reader id> BACKUP_B2_KEY=<reader key>
deployment/toolkit backup list cms-postgres
deployment/toolkit backup fetch cms-postgres -o cms.pgdump --identity ~/age.key
# older: --tier weekly --at 2026-10-18T03:00:00Z, or --version-at TIME
```

Copy the plaintext to the VPS, then restore. Stop the dependent application first and start it afterwards.

- **`cms-postgres`**: `docker stop portfolio-cms`, then

  ```bash
  docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < cms.pgdump
  docker start portfolio-cms
  ```

  The CMS applies pending Payload migrations on start. On a fresh host, deploy production first, then restore.

- **`umami-postgres`**: `docker stop portfolio-umami`, then the same `pg_restore` against `portfolio-umami-postgres`, then `docker start portfolio-umami`.
- **`cms-uploads`**: `docker exec -i portfolio-cms tar -C /data/media -xf - < cms-uploads.tar`. Files are written alongside existing ones; no restart needed.

Rehearse with `deployment/toolkit backup drill` (needs Docker and `BACKUP_AGE_IDENTITY` as a file path) before you need it.

## Legacy

This repository had no backup units before toolkit 0.11, so there is no `/etc/toolkit/backup/portfolio.env` to move and no legacy backup unit to remove. Reconcile and retention units from earlier revisions are listed in [Migrating a VPS to toolkit 0.11](../../docs/setup/deployment.md#migrating-a-vps-to-toolkit-011).
