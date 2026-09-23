# Documentation

Start at the root [README](../README.md) for the project overview and local development.

| Need                                              | Read                           |
| ------------------------------------------------- | ------------------------------ |
| Architecture, migration decisions, accepted risks | [Migration plan](PLAN.md)      |
| Existing investigation and source citations       | [Research](research/README.md) |
| Manual infrastructure and service setup           | [Setup](#setup)                |

## Setup

The guides name the required state and checks. Use the provider's current interface to reach that state.

1. [Cloudflare DNS and Access](setup/cloudflare.md): protect the dashboards, route the hostnames, and cut over the apex.
2. [GitHub and VPS deployment](setup/deployment.md): runner, variables, secrets, Discord notifications, deploys, and rollback.
3. [Umami analytics](setup/analytics.md): initialize the dashboard and connect the production tracker.
4. [V6 content import](setup/content-import.md): create the CMS admin, import content, and transfer media once.

For a first deployment, follow the sequence in the [deployment guide](setup/deployment.md#first-deployment).
