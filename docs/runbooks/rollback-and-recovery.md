# Rollback and recovery

Use this when a release misbehaves, a staged release must go live, containers did not come back after a reboot, or data must be restored. For a lost server use [Fresh server](fresh-server.md) and [Backups](backups.md).

A release is an immutable snapshot under `~/portfolio/versions/<target>/<release-id>/` on the VPS, with `current` and `previous` pointers. Rollback switches pointers and containers to a stored snapshot; it never rebuilds, never renders new secrets and never touches data. It restores that snapshot's Compose model, pinned image digests and private environment exactly as they were.

## Roll back a release (GitHub)

Run **Rollback**:

| Input         | Value                                                                             |
| ------------- | --------------------------------------------------------------------------------- |
| `environment` | `production` (default), `development` or `monitoring`                             |
| `ref`         | a revision with the 0.11 toolkit; blank = workflow ref                            |
| `operation`   | `rollback`                                                                        |
| `release_id`  | `previous` (default), `current`, or an ID from `ls ~/portfolio/versions/<target>` |

The whole target's snapshot is restored, including the web and CMS together in production. Keep the registry digests of every retained snapshot: pass them in `protected_digests` when running Cleanup Registry for real.

### Roll back ingress (standalone server only)

Run **Deploy Ingress** with `operation` `rollback`: it restores the `previous` ingress release. For another release ID use the VPS commands below.

### Activate a staged release

A **Deploy** or **Deploy Monitoring** with `operation` `stage` printed a release ID. Run Rollback with `operation` `activate` and that ID.

### Reconcile

`operation` `reconcile` restarts the containers of the current snapshot without recreating existing ones and ignores `release_id`. Use it after a host reboot problem or a manually stopped container.

## The same from the VPS (VPS as deploy user)

Use this when GitHub is unavailable. From a trusted checkout of this repository (for example `~/portfolio-checkout`, after `git pull`):

```bash
bash deployment/toolkit verify
deployment/toolkit release rollback production           # to previous
deployment/toolkit release rollback production --release-id <id>
deployment/toolkit release activate production --release-id <id>
deployment/toolkit reconcile production
deployment/toolkit doctor
```

Replace `production` with `development`, `monitoring` or `ingress`; the Rollback workflow does not list `ingress` (a standalone-only target); use Deploy Ingress `rollback` for `previous`, or these commands for a specific `--release-id`. The toolkit takes its locks itself; never wrap these commands in another lock.

## Restore a CMS migration dump

Every production deploy dumps the CMS database first. An image rollback does not undo schema migrations; if a migration damaged data, restore a dump after the rollback (**VPS as deploy user**):

```bash
ls -1t ~/portfolio/dumps | head
docker stop portfolio-cms
docker exec -i portfolio-postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < ~/portfolio/dumps/<file>.dump
docker start portfolio-cms
```

These dumps protect against a bad migration on the same host, not against host loss; use [Backups](backups.md) for that. Delete a dump only after checking that no retained snapshot or recovery plan needs it.

## Containers missing after a reboot

`toolkit-portfolio-reconcile.service` starts the declared containers of each current snapshot at boot. If it was never enabled or failed:

```bash
systemctl status toolkit-portfolio-reconcile.service           # VPS as root
journalctl -u toolkit-portfolio-reconcile.service -n 100 --no-pager
deployment/toolkit reconcile production development monitoring  # VPS as deploy user, from the checkout
```

A missing `current` pointer is skipped; a corrupt or legacy pointer fails visibly and needs a fresh `deploy` or `stage` + `activate`. On a standalone server the same service also runs the Cloudflare firewall first when `RECONCILE_BEFORE` is enabled.

## Restore from backup

Database or media loss, a wrong delete, or a rebuilt server: [Backups: restore](backups.md#restore). Total server loss: [Fresh server](fresh-server.md), then its restore step.

## Verify

- `ls -l ~/portfolio/versions/<target>/current` points to the intended release ID.
- `docker ps` shows the target's containers healthy; the public URL and a CMS save-and-refresh work.
- `deployment/toolkit doctor` has no `fail`.
