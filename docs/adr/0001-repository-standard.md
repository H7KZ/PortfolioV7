# 0001. Repository standard and ingress modes

Status: accepted, 2026-10-22.

## Context

Four repositories (Infrastructure, Ohlidame, Kreditozrouti, PortfolioV7) deploy to a VPS with the same pinned toolkit, but they grew apart: different workflow names and inputs, mixed action pinning, hand-made host state, and a hidden dependency of every app repository on Infrastructure's Traefik. A fresh server could not be built from this repository alone, and the migration notes and plans for the V7 rebuild had piled up next to the runbooks.

## Decision

PortfolioV7 follows the [repository standard](https://github.com/H7KZ/Toolkit/tree/main/docs/standard.md):

1. **Independent.** It deploys to a clean server from its own checkout and secrets. The host holds only Docker, the deploy user, `/opt/toolkit/portfolio`, `/etc/toolkit/portfolio.env`, systemd units and the shared loader. The pinned toolkit runs from `deployment/toolkit`; no global toolkit is needed.
2. **Ingress is a role.** `deployment/ingress/` is a copy of Infrastructure's Traefik, socket-proxy and CrowdSec stack (compose project `global`, network `public-network`, same label contract), deployed by **Deploy Ingress** as the release target `ingress`. Two modes:
   - _shared_ (default today): Infrastructure's Traefik owns `public-network`; Deploy Ingress is never run.
   - _standalone_: this repository deploys ingress first, then the app targets.
     Apps attach to the external `public-network` with identical labels in both modes, so switching needs no app change. Two ingress stacks must never share a host (ports 80/443, the network).
3. **Resources come from the deploy.** All `portfolio-*` networks and volumes are created by the toolkit from the resolved Compose model, which only accepts names prefixed with the repository slug. The ingress stack therefore uses `portfolio-ingress-*` networks and volumes, and creates `public-network` through Compose itself. No runbook step creates resources by hand.
4. **Host singletons are opt-in.** `MAINTENANCE_AT` and the Cloudflare origin firewall (`RECONCILE_BEFORE` plus a weekly job) are declared in exactly one repository per host. Here they are present but commented out in `deployment/toolkit.conf`.
5. **Workflows and docs share one shape**: file and display names, dispatch input names, order and defaults, SHA-pinned actions with dependabot, least-privilege permissions, the `docs/runbooks/` set and this ADR directory. `deploy-analytics.yml` became `deploy-monitoring.yml` and `deployment/analytics` became `deployment/monitoring`; Docker project, container, network and volume names were not changed because they carry data.
6. Superseded plans, research and handoff notes about deployment are deleted; git keeps the history.

## Consequences

- A new VPS needs only [Fresh server](../runbooks/fresh-server.md); moving between modes is [Split to own server](../runbooks/split-to-own-server.md).
- Toolkit 0.11 accepts a fixed set of lock environments, none called `ingress`. The ingress target is declared as `infrastructure:portfolio/versions/ingress` and `prepare-release.py` writes that environment into the manifest. The lock is scoped to the `portfolio` repository, so it cannot collide with Infrastructure's. This is revisited when a toolkit release adds `ingress`.
- The ingress stack is a maintained copy. Changes to Infrastructure's Traefik configuration must be mirrored by hand; the shared contract is only the network name and the labels.
- Rollback now defaults to `production`, and Backup Verify takes `check` instead of `operation`, like the other repositories.
- The qualified-development promotion flow (`promote`, `run_id`) of other repositories is not offered: this repository has no development manifest to promote.
