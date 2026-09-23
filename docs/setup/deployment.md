# GitHub and VPS deployment

The workflows in [`.github/workflows`](../../.github/workflows) are the source for variable names and dispatch inputs. Deploys run only when manually dispatched. Production has the web and CMS; development has only the web and reads the production CMS.

## Runner and repository configuration

1. Ensure the shared VPS infrastructure, Traefik, and Docker networks are running. Deploy this repo's self-hosted runner using [`deployment/github-runner/deploy.sh`](../../deployment/github-runner/deploy.sh) with `GITHUB_REPO_URL` and a suitable `GITHUB_ACCESS_TOKEN`. Confirm the runner is online for this repository.
2. Set repository secrets `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`, `UMAMI_DB_NAME`, `UMAMI_DB_USER`, `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`.
3. Set repository variables `SITE_DOMAIN=jankominek.com` and `UMAMI_DOMAIN=umami.jankominek.com`.
4. Create the `production` and `development` GitHub Environments with the values below. The environment names select the secrets used by the deployment workflow.

| Environment   | Variables                                                                                                      | Secrets                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `production`  | `PROJECT=prod`, `DOMAIN=jankominek.com`, `CMS_DOMAIN=cms.jankominek.com`, `UMAMI_WEBSITE_ID` after Umami setup | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`, `CMS_CONTACT_API_KEY`, `DISCORD_WEBHOOK_URL` if notifications are wanted |
| `development` | `PROJECT=dev`, `DOMAIN=dev.jankominek.com`                                                                     | `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CMS_READ_API_KEY`                                                                                                                                                  |

The development `REVALIDATE_SECRET` and `CMS_READ_API_KEY` must match production because both sites use the same CMS. Generate random secrets with `openssl rand -base64 32`. The deployment workflow rejects `$` and backticks in values written to its Compose `.env` file.

## Discord notifications

Create a Discord webhook in the channel intended for contact alerts and store its URL as the production `DISCORD_WEBHOOK_URL` secret. The CMS notification contains only a company name or email domain and a link to the submission in Payload. The webhook is optional; without a valid URL, the submission is still saved but no alert is sent.

## First deployment

1. Prepare [Cloudflare Access](cloudflare.md) for `umami`, `cms`, and `dev` before creating their public DNS records.
2. Dispatch **Deploy Analytics**. Point its protected dashboard hostname at the VPS, then complete [Umami setup](analytics.md) and set `UMAMI_WEBSITE_ID`.
3. Dispatch **Deploy** for `production`, selecting web and CMS. Confirm the CMS and web are healthy. The CMS creates the schema on startup. Point the protected CMS hostname at the VPS.
4. Create the Payload admin and complete the [V6 content import](content-import.md).
5. Dispatch **Deploy** for `development`, selecting web. Point its protected hostname at the VPS and verify it reads the production CMS and remains unindexed.
6. When ready to move the live apex, follow the [Cloudflare cutover](cloudflare.md#apex-cutover-from-v6).

For later releases, dispatch **Deploy** with the desired environment and services. A CMS deployment takes a database dump before applying migrations. Only the last three dumps are retained on the VPS; this is not a general backup system. Use **Rollback Deployment** with an available eight-character image tag when reverting a version. A schema migration may need separate recovery from the pre-migration dump.
