# Umami analytics

The analytics stack is defined in [`deployment/analytics`](../../deployment/analytics) and deployed by the manual **Deploy Analytics** workflow. Its dashboard uses `umami.jankominek.com` behind Cloudflare Access; the public tracker runs first-party under `jankominek.com/stats`.

1. Configure the monitoring GitHub Environment's Umami secrets and domain variables in the [deployment guide](deployment.md#repository-and-host-configuration).
2. Protect the dashboard hostname with [Cloudflare Access](cloudflare.md). Deploy analytics, confirm the service is healthy, then make the protected hostname resolve to the VPS.
3. Sign in with Umami's initial administrator account, replace its initial password, and create a website for `jankominek.com`. Limit access to the people who need the dashboard.
4. Store that website's ID as the production GitHub Environment variable `UMAMI_WEBSITE_ID`. The next production web deploy consumes it and emits the configured tracker.
5. After the apex cutover, verify that the V7 production site loads `/stats/stats.js` and records a visit in the intended Umami website. Confirm the development site remains untracked.

The analytics database is a separate volume. The repo's pre-migration CMS dump does not back it up; see the [accepted risks](../PLAN.md#accepted-risks).

Analytics uses toolkit's monitoring snapshots and the `portfolio-analytics` Compose project. Both Umami and Postgres are pinned to digests at staging. Roll back through **Rollback Deployment**, selecting monitoring and an existing snapshot ID. Retention SQL comes from that current snapshot under the toolkit repository lock; the host timer is installed disabled, with no GitHub schedule. See [host units](deployment.md#boot-reconciliation-and-retention).
