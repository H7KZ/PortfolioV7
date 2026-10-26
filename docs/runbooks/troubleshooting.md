# Troubleshooting

Use this when a workflow fails or the site misbehaves. Find the symptom, read the cause, apply the fix, then verify. For rolling back see [Rollback and recovery](rollback-and-recovery.md).

Useful first commands (**VPS as deploy user**, from the checkout):

```bash
deployment/toolkit doctor                      # read-only host and repository health
docker ps --format 'table {{.Names}}\t{{.Status}}'
docker logs --tail 100 <container>
sudo journalctl -u 'toolkit-portfolio-*' -n 100 --no-pager
```

## Workflow failures

| Symptom                                                                                | Cause                                                                                | Fix                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Toolkit runner is not installed; run on the VPS: sudo deployment/toolkit install ...` | The loader `/usr/local/libexec/toolkit-run-bundle` is missing                        | [Fresh server step 3](fresh-server.md#3-bootstrap-the-toolkit-vps-once-per-server)                                     |
| `SSH_HOST_FINGERPRINT must pin the verified server key`                                | Secret empty or not `SHA256:...`                                                     | `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub -E sha256` on the VPS, store the result                              |
| SSH or SCP step fails to connect                                                       | wrong `SSH_HOST`, `SSH_PORT`, `SSH_USER`, key, or a changed host key after a rebuild | check [Secrets and config](secrets-and-config.md); update the fingerprint after a rebuild                              |
| `Missing <NAME>` in "Prepare archive, manifest and private environment"                | the GitHub Environment lacks that secret or variable                                 | add it to the environment of the target ([Secrets and config](secrets-and-config.md))                                  |
| `Unsupported dotenv characters in <NAME>`                                              | the value has `$`, a quote, a backtick, a backslash or a line break                  | regenerate with `openssl rand -base64 32`                                                                              |
| `PROJECT must be prod` / `dev`                                                         | wrong `PROJECT` variable for the environment                                         | set `PROJECT=prod` in production, `dev` in development                                                                 |
| `Missing existing image: web:<tag>`                                                    | `mode` `existing` and the tag or digest is not in GHCR                               | use `mode` `reuse` or `build`, or pass correct `digests`                                                               |
| `digests requires existing mode` / `Choose digests or image_tag`                       | conflicting inputs                                                                   | use one of them, with `mode` `existing`                                                                                |
| `shared external network missing; provision its owner first`                           | `public-network` does not exist                                                      | shared host: deploy Infrastructure's Traefik first; standalone: run **Deploy Ingress** first                           |
| `external volume not owned by repository`                                              | a volume name without the `portfolio-` prefix                                        | rename it in the Compose files (never rename a populated volume without migrating its data)                            |
| `existing CMS database has no container; recover it before migrating`                  | the Postgres volume exists but its container does not                                | restore the container first (redeploy the previous release) or restore the data deliberately; do not delete the volume |
| `existing CMS database must be running for the migration dump`                         | the CMS Postgres is stopped                                                          | `docker start portfolio-postgres`, then redeploy                                                                       |
| `release ID already exists; use activate or a new attempt`                             | re-running a finished attempt                                                        | re-run the workflow as a new run, or activate the existing release                                                     |
| health check never passes on activation                                                | a public health URL does not route to this server yet                                | stage instead and activate after DNS, or fix routing                                                                   |
| `network public-network was found but has incorrect label`                             | **Deploy Ingress** ran on a host where `public-network` came from Infrastructure     | stop; ingress must never run on a shared host ([Split to own server](split-to-own-server.md))                          |
| `port is already allocated` on 80 or 443                                               | another Traefik is running                                                           | same as above; only one ingress per host                                                                               |

## Site and routing

| Symptom                                       | Cause                                                                                            | Fix                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 404 or "no available server" for a hostname   | the container is not on `public-network`, is unhealthy, or the router `Host` rule does not match | `docker inspect` the container networks and labels; check `DOMAIN`/`CMS_DOMAIN`                                  |
| 403 for every unknown host                    | the catch-all router denying unknown Host headers (expected)                                     | request the right hostname                                                                                       |
| Certificate errors                            | ACME DNS-01 failing (standalone) or Cloudflare SSL mode                                          | `docker logs traefik`; check `CF_DNS_API_TOKEN` scope, set the zone to Full (strict) after the first certificate |
| Edits in the CMS do not appear on the site    | revalidate webhook failed or HTML is cached at the edge                                          | check `REVALIDATE_SECRET` and `REVALIDATE_URLS`; HTML must not be edge-cached                                    |
| Development site shows no content             | it cannot reach the CMS                                                                          | production must be deployed; `portfolio-cms-network` must exist; `CMS_READ_API_KEY` must equal production's      |
| `cms.` or `dev.` or `umami.` rejects everyone | Cloudflare Access policy                                                                         | fix the Access application                                                                                       |
| Tracker missing on the site                   | `UMAMI_WEBSITE_ID` unset in production, or monitoring not deployed                               | set it and redeploy production                                                                                   |
| Traefik dashboard 404                         | `TRAEFIK_DASHBOARD_ALLOWED_IPS` does not contain your real client IP (default denies all)        | set your IP or VPN CIDR, redeploy ingress                                                                        |
| CrowdSec bouncer not registered               | post-deploy hook did not run or failed                                                           | `docker exec crowdsec cscli bouncers list`; redeploy ingress                                                     |

## Host and schedules

| Symptom                                                                        | Cause                                                                                                            | Fix                                                                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `doctor` says the control copy is stale, or a deploy says `host is not synced` | the pin, `toolkit.conf` or a referenced script changed since the last Host Sync, or a declared timer is disabled | run **Host Sync**                                                                                      |
| Host Sync: `X is not set` / fails in `backup setup`                            | a backup or alert secret is missing / the first backup failed                                                    | Toolkit `setup-secrets.py --apply`; `journalctl -u toolkit-portfolio-backup.service -n 200` on the VPS |
| Deploy failed: `rolled back automatically to <id>`                             | the candidate failed its health gate; the previous release runs again                                            | nothing to restore; read the logs and fix forward                                                      |
| Backup Verify fails                                                            | no recent objects, wrong reader key, or age identity                                                             | [Backups](backups.md); `systemctl list-timers 'toolkit-portfolio-*'`; timer off: run Host Sync         |
| Containers missing after reboot                                                | reconcile service never enabled or failed                                                                        | [Rollback and recovery](rollback-and-recovery.md#containers-missing-after-a-reboot)                    |
| Lost SSH after enabling the firewall                                           | firewall rules never touch SSH; a wrong SSH hardening change is the cause                                        | use the provider console                                                                               |

## Verify

After any fix: re-run the failed workflow, confirm `deployment/toolkit doctor` has no `fail`, and load the affected URL through Cloudflare.
