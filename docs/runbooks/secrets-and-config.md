# Secrets and config

Use this to create, rotate or audit anything the workflows and the server need. Names only; values never go in Git, in chat or in a workflow log. Generate random values with `openssl rand -base64 32` (**local**). The release renderer rejects dollars, backticks, single quotes, backslashes and line breaks in every value except `TRAEFIK_HTPASSWD`, where bcrypt dollars are expected.

Repository-level secrets and variables are visible to every environment. Environment-level ones exist only for the selected target; create the GitHub Environments `production`, `development`, `monitoring` and `ingress` and allow all deployment branches, so any target can be deployed from any workflow ref.

## Repository (GitHub, Settings, Secrets and variables)

| Name                                              | Kind     | Used for                                                                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `SSH_HOST`                                        | secret   | VPS address                                                                                |
| `SSH_PORT`                                        | secret   | VPS SSH port                                                                               |
| `SSH_PRIVATE_KEY`                                 | secret   | key of the deploy user (root-equivalent: treat accordingly)                                |
| `SSH_HOST_FINGERPRINT`                            | secret   | `SHA256:` server key fingerprint from a trusted channel; SSH and SCP refuse any other host |
| `SSH_USER`                                        | variable | the deploy user name                                                                       |
| `BACKUP_BUCKET`                                   | variable | the host's B2 bucket, shared by every repository (objects under `portfolio/`)              |
| `BACKUP_B2_KEY_ID`, `BACKUP_B2_KEY`               | secret   | writer B2 key, rendered onto the VPS by Host Sync only                                     |
| `BACKUP_B2_READER_KEY_ID`, `BACKUP_B2_READER_KEY` | secret   | read-only B2 key for Backup Verify                                                         |
| `BACKUP_AGE_RECIPIENT`                            | secret   | age public key (`age1...`); the VPS encrypts with it                                       |
| `BACKUP_AGE_IDENTITY`                             | secret   | age private key (contents) for the restore drill; never on the VPS                         |
| `HC_PING_KEY`                                     | secret   | Healthchecks ping key: `portfolio-backup`, `-backup-freshness`, `-backup-drill`            |
| `ALERT_DISCORD_WEBHOOK_URL`                       | secret   | failed deploys, rollbacks, Host Sync and failed toolkit units on the VPS                   |

The `BACKUP_*`, `HC_PING_KEY` and `ALERT_DISCORD_WEBHOOK_URL` values are set for every repository at once by the Toolkit's `python3 scripts/setup-secrets.py --apply`; never by hand.

`GITHUB_TOKEN` is automatic: it pushes images to GHCR and logs the VPS into the registry for one deploy.

## Environments

| Environment                 | Variables                                                                                                                                  | Secrets                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `production`                | `PROJECT=prod`, `DOMAIN=jankominek.com`, `CMS_DOMAIN=cms.jankominek.com`, `UMAMI_WEBSITE_ID` (after Umami is set up)                       | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`, `CMS_CONTACT_API_KEY`, optional `DISCORD_WEBHOOK_URL` |
| `development`               | `PROJECT=dev`, `DOMAIN=dev.jankominek.com`, `CMS_DOMAIN=cms-dev.jankominek.com`                                                            | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (own values), `PAYLOAD_SECRET` and `CMS_READ_API_KEY` (production values), `PREVIEW_SECRET`, `REVALIDATE_SECRET`                    |
| `monitoring`                | `SITE_DOMAIN=jankominek.com`, `UMAMI_DOMAIN=umami.jankominek.com`                                                                          | `UMAMI_DB_NAME`, `UMAMI_DB_USER`, `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`                                                                                                               |
| `ingress` (standalone only) | `TRAEFIK_DOMAIN` (dashboard host), `ACME_EMAIL`, `TRAEFIK_DASHBOARD_ALLOWED_IPS` (your client IP or VPN CIDR; the default denies everyone) | `TRAEFIK_HTPASSWD` (`htpasswd -nbB admin '<password>'`), `CF_DNS_API_TOKEN` (zone DNS edit only), optional `CROWDSEC_ENROLL_KEY`                                                        |

Development's `PREVIEW_SECRET`, `REVALIDATE_SECRET` and `CMS_READ_API_KEY` must equal production's, because both sites talk to the one production CMS. When restoring or moving a server keep every value identical: Payload indexes API keys with `PAYLOAD_SECRET`, and the restored databases use the original passwords.

The mapping from names to the private release dotenv is in [`deployment/prepare-release.py`](../../deployment/prepare-release.py); the pass-through list is in [`.github/workflows/_deploy.yml`](../../.github/workflows/_deploy.yml). A new setting needs both ([Add a service](add-a-service.md)).

## Server (VPS)

| Path                         | Contents                                                                                                                                                                  | Written by                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/etc/toolkit/portfolio.env` | backup and alert settings: `BACKUP_BUCKET`, `BACKUP_B2_KEY_ID`, `BACKUP_B2_KEY` (writer), `BACKUP_AGE_RECIPIENT`, `HC_PING_KEY`, `ALERT_DISCORD_WEBHOOK_URL` (root, 0600) | Host Sync, from the repository secrets             |
| `/opt/toolkit/portfolio/`    | root-owned control copy of the pinned toolkit and referenced scripts                                                                                                      | Host Sync (`deployment/toolkit install`)           |
| `/home/<deploy>/portfolio/`  | `versions/<target>/` snapshots, `incoming/` (deleted after use), `dumps/`                                                                                                 | deploys                                            |
| `/etc/toolkit/host.conf`     | swap, Docker daemon settings                                                                                                                                              | the host's owner (Infrastructure on a shared host) |

Application runtime secrets live only in the GitHub Environments and in the private, root-owned runtime directory of each snapshot. The apps' local development settings are in `apps/web/.env.example` and `apps/cms/.env.example`.

## Rotate a secret

1. Change it in GitHub (backup and alert values: rerun the Toolkit's `setup-secrets.py --apply`, then Host Sync). 2. Run **Deploy** (or Deploy Ingress) for the target, `mode` `reuse`, so a new snapshot with the new dotenv goes live. 3. Rolling back restores the old snapshot with its old secrets until you deploy again.

Database passwords (`POSTGRES_*`, `UMAMI_DB_*`) are used at first database creation; changing them later also needs `ALTER USER` inside the database, otherwise the app cannot connect.

## Verify

- A Deploy of each target gets past "Prepare archive, manifest and private environment" without a `Missing <NAME>` error.
- `deployment/toolkit doctor` (**VPS as deploy user**) reports the backup env file with correct permissions and keys.
