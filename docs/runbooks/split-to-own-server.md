# Split to own server

Use this to decide where ingress lives and to move this repository between a shared host and a dedicated server. The site deploys from this repository's checkout and secrets alone; the only thing it can share with Infrastructure is the front door.

## Ingress modes

Apps always attach to the external network `public-network` and carry the same Traefik labels, so switching mode needs no app change.

| Mode       | Who runs Traefik                                         | Deploy Ingress | Singletons (`MAINTENANCE_AT`, firewall) |
| ---------- | -------------------------------------------------------- | -------------- | --------------------------------------- |
| Shared     | Infrastructure (project `global`, owns `public-network`) | never          | Infrastructure declares them            |
| Standalone | this repository, `deployment/ingress` (project `global`) | first, once    | this repository declares them (below)   |

**Never run two ingress stacks on one host.** Both bind ports 80 and 443 and both want `public-network`. Compose refuses to adopt a network it did not create ("incorrect label"), so a second ingress usually fails loudly, but do not rely on that. On a shared host leave **Deploy Ingress** alone.

## Dedicated server (the normal split)

Follow [Fresh server](fresh-server.md) in standalone mode, then retire the old host's copy of the site when the new one is verified. The old shared host keeps running Infrastructure; remove only this repository's containers, networks and volumes there.

## Enable the host singletons

Standalone servers are the one place this repository owns host-wide behaviour. In [`deployment/toolkit.conf`](../../deployment/toolkit.conf) uncomment the lines under "Host-wide singletons":

- `MAINTENANCE_AT=...` schedules weekly package updates (`toolkit-maintenance.timer`).
- `RECONCILE_BEFORE=deployment/ingress/cloudflare-firewall.sh` applies the Cloudflare-only origin firewall at every boot before containers are reconciled.
- the `cloudflare-firewall` job lines refresh the Cloudflare ranges weekly; also add `JOBS=cloudflare-firewall`.

Commit and merge the change: **Host Sync** installs and enables the firewall and maintenance timers. Then **VPS as deploy user** `git pull`, and **VPS as root**:

```bash
cd /home/deploy/portfolio-checkout
bash deployment/toolkit verify
bash deployment/ingress/cloudflare-firewall.sh --dry-run          # review the ruleset
deployment/toolkit job cloudflare-firewall                        # apply once, by hand
install -m 0644 -o root -g root /home/deploy/portfolio/versions/ingress/current/ingress/logrotate/traefik /etc/logrotate.d/traefik
```

The firewall touches only ports 80 and 443 (TCP and UDP), so SSH is unaffected. To let an uptime monitor or your own IP reach the origin directly, set the defaults of `EXTRA_ALLOWED_V4` and `EXTRA_ALLOWED_V6` in the script (jobs and the boot step run without extra environment), commit, and let Host Sync reinstall. Declare each singleton in exactly one repository per host: never enable these lines on a host where Infrastructure declares them.

## Shared host to standalone on the same machine

Avoid it. `public-network` is owned by Infrastructure's Traefik; replacing it means removing the network, which needs every container on every stack detached, so every site on the host goes down. If you must: stop all app stacks, deploy a restore point of each, remove Infrastructure's `global` project and `public-network`, run **Deploy Ingress**, then redeploy every stack of every repository. Moving this repository to a new server is simpler and reversible.

## Standalone back to shared

Point DNS at a host that runs Infrastructure, deploy production and development there ([Fresh server](fresh-server.md) skipping the ingress steps; Infrastructure brings the shared monitoring and Umami), and never deploy ingress. Nothing in the apps changes.

## Toolkit lock environment

Toolkit 0.11 has no `ingress` lock environment, so the `ingress` target is declared as `infrastructure:portfolio/versions/ingress` in `toolkit.conf` and `prepare-release.py` writes the matching manifest environment. The lock is per repository (`portfolio`), so it never collides with Infrastructure's. When a toolkit release adds `ingress`, change both and repin.

## Verify

- Shared: `docker ps` shows Infrastructure's `traefik`; `docker inspect traefik --format '{{.Config.Labels}}'` is not from this repository; Deploy Ingress has never run.
- Standalone: `docker ps` shows `traefik`, `crowdsec`, `socket-proxy` from compose project `global`; `ss -ltnp | grep -E ':(80|443)\b'` shows only Traefik; `nft list table inet cloudflare_origin` exists when the firewall is enabled.
