# Cloudflare DNS and Access

This guide describes the required result for `jankominek.com`. The [cutover research](../research/dns-cutover-workers-to-vps.md) records the evidence and edge cases.

## Before exposing a hostname

- Confirm the VPS Traefik stack and the intended service are healthy. Its router must accept the hostname in the table below.
- Protect `dev`, `cms`, and `umami` with Cloudflare Access policies for the intended users before their public DNS records resolve. Keep the Payload and Umami logins enabled as separate controls.
- Use Cloudflare's proxied records for each hostname. Confirm the zone uses Full (strict) TLS to the Traefik origin and that its origin certificate is valid.

| Hostname               | Origin                                          | Expected access                     |
| ---------------------- | ----------------------------------------------- | ----------------------------------- |
| `jankominek.com`       | Production web and first-party `/stats` tracker | Public                              |
| `dev.jankominek.com`   | Development web                                 | Cloudflare Access                   |
| `cms.jankominek.com`   | Payload admin                                   | Cloudflare Access and Payload login |
| `umami.jankominek.com` | Umami dashboard                                 | Cloudflare Access and Umami login   |

## Apex cutover from V6

1. Deploy the new services. Verify CMS and development pages through their protected hostnames, including representative content and media. Check the production web container's health separately: its router accepts only the apex, which still serves V6 until cutover. The development site cannot create contact submissions.
2. Check the existing V6 Worker binding for `jankominek.com`. A Worker Custom Domain and a Worker Route need different removal steps; identify which is present before changing DNS.
3. Check existing Cloudflare cache and redirect rules for behavior that would keep serving V6 HTML or interfere with the new routes. The web's CMS cache is invalidated by Payload, so HTML must reach the origin rather than remain in an edge cache.
4. Remove the V6 binding and point the proxied apex record at the VPS. Keep the Worker deployed but unbound for the planned rollback window.
5. Verify the apex and `/cs`, `/media`, `/stats/stats.js`, a production contact submission, CMS revalidation, and HTTPS from the public route. If the cutover fails, restore the previous DNS target and Worker binding.

The [migration plan](../PLAN.md#10-phases) records the intended two-week V6 rollback window. Do not treat a direct request to the VPS as a substitute for the proxied check: the VPS firewall may reject non-Cloudflare traffic.
