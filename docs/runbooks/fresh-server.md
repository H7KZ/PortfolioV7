# Fresh server

Use this to take a brand-new Ubuntu 26.04 amd64 VPS from empty to a running jankominek.com, either as the only tenant (standalone, this repository deploys its own ingress) or next to Infrastructure (shared, Infrastructure's Traefik owns ports 80/443). It is also the move-to-a-new-VPS path: the last two sections restore data from backup and retire the old server.

Everything after step 4 runs through GitHub Actions; the server only ever receives pinned, immutable releases. Each command says where it runs: **local**, **GitHub**, **VPS as root**, **VPS as deploy user**. Secret and variable names are in [Secrets and config](secrets-and-config.md); values never go in Git or in chat.

## 0. Decide the mode

| Mode       | Choose it when                                                | Ingress                                                    | `public-network`          |
| ---------- | ------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------- |
| Standalone | the server runs only this repository (the usual new-VPS case) | this repository's `deployment/ingress`, via Deploy Ingress | created by Deploy Ingress |
| Shared     | the server already runs Infrastructure                        | Infrastructure's Traefik; never deploy ingress here        | created by Infrastructure |

Never run both ingress stacks on one host: ports 80/443 and the network `public-network` clash. Background: [Split to own server](split-to-own-server.md) and [ADR 0001](../adr/0001-repository-standard.md).

In shared mode skip steps 2 and 3 where the server already has Docker, the deploy user and Infrastructure's checkout, and skip every "standalone only" step.

## 1. Accounts and DNS (before touching the server)

1. **Cloudflare**: the zone for `jankominek.com` is active. Create the records below, all proxied (orange cloud). Point them at the new server's IP only when step 8 says so; until then they stay on the old target.

   | Hostname               | Serves                                  | Access            |
   | ---------------------- | --------------------------------------- | ----------------- |
   | `jankominek.com`       | production web and first-party `/stats` | public            |
   | `dev.jankominek.com`   | development web                         | Cloudflare Access |
   | `cms.jankominek.com`   | Payload admin                           | Cloudflare Access |
   | `umami.jankominek.com` | Umami dashboard                         | Cloudflare Access |

   Create Cloudflare Access applications for `dev`, `cms` and `umami` before their DNS records resolve (Zero Trust, Access, Applications, Add, Self-hosted; one application per hostname; an Allow policy for the e-mail addresses of the people who need it). The Payload and Umami logins stay enabled as a second control. Set the zone's SSL mode to Full (strict) once the first certificate exists. HTML must never be cached at the edge; only `/_nuxt/*`, `/media/*` and fonts may be. If the apex is still bound to an old Cloudflare Worker, remove that binding (Custom Domain and Route need different steps) in step 8, not before.

2. **Cloudflare API token** (standalone only): DNS edit for the zone, nothing else. It becomes `CF_DNS_API_TOKEN`; Traefik uses it for ACME DNS-01.
3. **Backblaze B2, age key, Healthchecks**: follow the Toolkit [backup setup](https://github.com/H7KZ/Toolkit/tree/main/docs/backups.md#set-up-a-repository-owner-once). Reuse the existing bucket, keys and age key when moving servers.
4. **GitHub**: repository admin on `H7KZ/PortfolioV7`. GHCR needs no extra account; the workflows log in with `GITHUB_TOKEN`.

## 2. Prepare the host (VPS as root)

```bash
apt-get update && apt-get -y upgrade
apt-get install -y git python3 curl nftables ca-certificates
adduser --disabled-password --gecos '' deploy               # the name you will store in the SSH_USER variable
install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
echo '<deploy public key>' > /home/deploy/.ssh/authorized_keys
chown deploy: /home/deploy/.ssh/authorized_keys && chmod 0600 /home/deploy/.ssh/authorized_keys
```

Install Docker Engine and Compose from Docker's official apt repository:

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deploy
```

Harden SSH (key-only, no root login) and keep a second session open while you test it. Record the host key fingerprint for the `SSH_HOST_FINGERPRINT` secret:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub -E sha256
```

Host tuning (swap, Docker `live-restore` and bounded logs, held Docker packages) is declared by the host's owner (Infrastructure on a shared host): [Toolkit host guide](https://github.com/H7KZ/Toolkit/tree/main/docs/host.md).

## 3. Bootstrap the toolkit (VPS, once per server)

The server never needs a global toolkit. A checkout of this repository supplies the pinned release that installs the loader, the control copy and the systemd units.

**VPS as deploy user:**

```bash
git clone https://github.com/H7KZ/PortfolioV7.git ~/portfolio-checkout
cd ~/portfolio-checkout && bash deployment/toolkit verify
```

**VPS as root** (or `sudo`), from the same directory:

```bash
cd /home/deploy/portfolio-checkout
deployment/toolkit install --deploy-user deploy
```

This installs `/usr/local/libexec/toolkit-run-bundle` and the deploy user's single sudo rule, which every workflow needs. From then on **Host Sync** owns the host side ([Deploy and release](deploy-and-release.md#host-sync)): `/opt/toolkit/portfolio/`, `/etc/toolkit/portfolio.env` rendered from GitHub secrets, and the units from `deployment/toolkit.conf`, enabled (the backup timer after one successful backup). The deploy key is root-equivalent; protect it accordingly. Mechanics: [Toolkit host guide](https://github.com/H7KZ/Toolkit/tree/main/docs/host.md).

## 4. GitHub secrets, variables, environments (GitHub)

Create the repository secrets and variables (the backup and alert ones come from the Toolkit's `scripts/setup-secrets.py --apply`), then the environments `production`, `development`, `monitoring` and, for standalone, `ingress`, with the values listed in [Secrets and config](secrets-and-config.md). Allow all deployment branches so any target can be deployed from any workflow ref.

When moving servers, change only `SSH_HOST`, `SSH_PORT` and `SSH_HOST_FINGERPRINT` (last, at the cutover in step 8). Every application secret stays the same: the restored databases and the API keys indexed by `PAYLOAD_SECRET` expect the original values.

## 5. Deploy in this order (GitHub)

Run each workflow from the Actions tab and wait for it to finish before the next.

1. **Standalone only: Deploy Ingress** (`ref` blank, `operation` `deploy`). Creates `public-network`, Traefik, socket-proxy and CrowdSec. Verify on the VPS as deploy user:

   ```bash
   docker exec crowdsec cscli bouncers list     # traefik must be valid
   docker network inspect public-network --format '{{.Name}}'
   ```

   Optional hardening: enable the Cloudflare-only origin firewall and the weekly range refresh by following [Split to own server](split-to-own-server.md#enable-the-host-singletons).

   Shared host: Infrastructure's Traefik is already running.

2. **Host Sync** (`host-sync.yml`). Deploy runs it too; alone first, it surfaces missing secrets early.
3. **Deploy Monitoring** (Umami; runs from `main`). Initialize it as in step 7.
4. **Deploy** with `environment` `production`. Builds web and CMS images, dumps any existing CMS database, starts Postgres, CMS and web. First deployment may skip the dump only when neither a database container nor volume exists.
5. **Deploy** with `environment` `development`. Web, CMS and Postgres of its own; fill its database from production as in [Development CMS](development-cms.md).

Public health URLs (`https://jankominek.com/` and `/robots.txt`) must answer when production activates. If DNS cannot route yet, run `operation` `stage` instead and activate through [Rollback](rollback-and-recovery.md#activate-a-staged-release) after step 8.

All `portfolio-*` networks and volumes are created by these deploys from the resolved Compose model, never by hand. Only `public-network` is shared: standalone Deploy Ingress creates it; shared mode needs Infrastructure's Traefik deployed first.

## 6. Restore data (a moved server or a rebuilt one)

On a first-ever install there is nothing to restore; skip to step 7. Otherwise, after step 5 has produced running, empty containers, restore the CMS database, Umami database and media from the encrypted backups: follow [Backups: restore](backups.md#restore). Use the same secrets as before.

## 7. Initialize and enable

1. Create the first Payload admin user at `https://cms.jankominek.com/admin`, or skip it when the database was restored. Import V6 content only on a brand-new empty CMS: [V6 content import](content-import.md).
2. Umami: sign in at `https://umami.jankominek.com` with Umami's default administrator account (user `admin`, password `umami`; Cloudflare Access must already protect the host), change the password immediately, create a website for `jankominek.com`, and store its ID as the `production` environment variable `UMAMI_WEBSITE_ID`. Redeploy production so the web emits the tracker. A restored Umami database already has the website: reuse its ID.
3. Host Sync already enabled boot reconcile and, after one successful backup, the backup timer ([Backups](backups.md#owner-setup-once-for-all-repositories)). Confirm with `deployment/toolkit doctor` (**VPS as deploy user**), then dispatch Backup Verify with `check` `both`.

## 8. Cut over DNS (moves only)

1. Lower the TTL of the records from step 1 a day ahead (proxied records are already short-lived).
2. Stop writers on the old server, capture a final copy there (`sudo deployment/toolkit backup run --pinned`) and restore it to the new one (step 6, `--tier pinned`) so the data is current. Moving every repository of a shared host follows Infrastructure's [migrate-host runbook](https://github.com/H7KZ/Infrastructure/tree/main/docs/runbooks/migrate-host.md).
3. Point the proxied records at the new server's IP. Check the apex, `/cs`, `/media`, `/stats/stats.js`, a contact-form submission, CMS save then page refresh, and the three protected hostnames through Cloudflare. Direct requests to the VPS may be rejected by the origin firewall; test through the proxy.
4. Update `SSH_HOST`, `SSH_PORT`, `SSH_HOST_FINGERPRINT` to the new server if not done yet, and prove the pipeline reaches the new host by running **Rollback** with `environment` `production`, `operation` `reconcile` (see [Rollback and recovery](rollback-and-recovery.md#reconcile)).

## 9. Decommission the old VPS

Wait until the new server has served traffic and one scheduled backup plus the weekly drill have passed, then (**old VPS as root**):

```bash
systemctl list-timers 'toolkit-portfolio-*'
systemctl disable --now toolkit-portfolio-backup.timer
systemctl disable toolkit-portfolio-reconcile.service
docker ps --format '{{.Names}}' | grep '^portfolio-' | xargs -r docker stop
```

1. The commands above stop the schedules and the old containers. Keep the server powered but idle for a few days as a fallback.
2. Revoke what the old host held: its B2 writer key (create a new one for the new host's `/etc/toolkit/portfolio.env`), its deploy key in GitHub if separate, and the Cloudflare token if it was host-specific.
3. Take a final provider-level snapshot if you want one, then delete the server. If it was a shared host, remove only this repository's resources: containers `portfolio-*`, then volumes `portfolio-*-volume` and networks `portfolio-*-network`, after confirming the restore is good. Never prune the host.

## Verify

- Actions: Deploy Ingress (standalone), Host Sync, Deploy production and development all green.
- **VPS as deploy user:** `deployment/toolkit doctor` reports no `fail`; `docker ps` shows `portfolio-web-1`, `portfolio-cms-1`, `portfolio-postgres-1`, `portfolio-dev-web-1`, `portfolio-dev-cms-1`, `portfolio-dev-postgres-1` healthy, plus `traefik`, `crowdsec`, `socket-proxy` when standalone.
- `https://jankominek.com/` loads, `/stats/stats.js` is served, a CMS edit appears on the site after a refresh.
- Backup Verify (freshness, then drill) is green in Actions.
- Reboot rehearsal: `sudo reboot`, then `systemctl status toolkit-portfolio-reconcile.service` is `active (exited)` and all containers are back.
