#!/usr/bin/env bash
# Restricts ports 80 and 443 to Cloudflare's edge ranges using nftables.
#
# Why this matters more than any Traefik setting: if the origin IP is reachable directly, an
# attacker skips Cloudflare entirely: no WAF, no DDoS absorption, no bot management, and rate
# limits key off a spoofable header. Origin IPs leak constantly (old DNS records, mail headers,
# certificate transparency logs, a misconfigured subdomain). This drops those packets in the
# kernel, before Traefik allocates a connection; it is strictly stronger than the
# cloudflare-only@file middleware.
#
# Usage:  cloudflare-firewall.sh [--dry-run]     (-h|--help prints this and exits 0)
#   sudo bash deployment/ingress/cloudflare-firewall.sh --dry-run   # print the ruleset only
#   sudo deployment/toolkit with-lock --repository portfolio --environment infrastructure #     --host-window --action maintenance -- bash deployment/ingress/cloudflare-firewall.sh
# Environment: EXTRA_ALLOWED_V4, EXTRA_ALLOWED_V6 (space-separated CIDRs allowed to reach 80/443
# directly: uptime monitors, a bastion, your own IP).
# Exit codes: 0 success, 1 failure, 2 usage error.
#
# Owned by exactly one repository per host. It is OFF in this repository: the lines that run it at
# boot (RECONCILE_BEFORE) and weekly (job) are commented out in deployment/toolkit.conf. Enable
# them only on a standalone server (docs/runbooks/split-to-own-server.md). Only ports 80 and 443
# are touched, so SSH is unaffected; add monitoring probes to EXTRA_ALLOWED_* first.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=../vendor/toolkit/log.sh
source "$here/../vendor/toolkit/log.sh"

readonly TABLE="inet cloudflare_origin"
readonly V4_URL="https://www.cloudflare.com/ips-v4"
readonly V6_URL="https://www.cloudflare.com/ips-v6"

# Extra sources allowed to hit 80/443 directly: uptime monitors, a bastion,
# your own IP for debugging. Space separated CIDRs.
EXTRA_ALLOWED_V4="${EXTRA_ALLOWED_V4:-}"
EXTRA_ALLOWED_V6="${EXTRA_ALLOWED_V6:-}"

DRY_RUN=0
case "${1:-}" in
'') ;;
--dry-run) DRY_RUN=1 ;;
-h | --help)
  sed -n '2,/^set -Eeuo/p' "${BASH_SOURCE[0]}" | sed '$d; s/^# \{0,1\}//'
  exit 0
  ;;
*) die 2 'usage: cloudflare-firewall.sh [--dry-run]' ;;
esac
(($# <= 1)) || die 2 'usage: cloudflare-firewall.sh [--dry-run]'

command -v nft >/dev/null 2>&1 || die 'nftables (nft) is not installed'
command -v curl >/dev/null 2>&1 || die 'curl is not installed'
command -v python3 >/dev/null 2>&1 || die 'python3 is not installed'

fetch() {
  curl -fsSL --max-time 15 --retry 3 "$1" | grep -E '^[0-9a-fA-F:.]+/[0-9]+$'
}

v4="$(fetch "$V4_URL")" || die "Failed to fetch Cloudflare IPv4 ranges"
v6="$(fetch "$V6_URL")" || die "Failed to fetch Cloudflare IPv6 ranges"

# Sanity check before we lock ourselves out of our own web ports.
[[ $(wc -l <<<"$v4") -ge 10 ]] || die "Suspiciously few IPv4 ranges; aborting"
[[ $(wc -l <<<"$v6") -ge 5 ]] || die "Suspiciously few IPv6 ranges; aborting"

cidr_list() {
  python3 -c 'import ipaddress,sys
family=int(sys.argv[1]); networks=set()
for token in sys.stdin.read().split():
    network=ipaddress.ip_network(token, strict=False)
    if network.version != family: raise ValueError("CIDR address family mismatch")
    networks.add(network)
print(",".join(str(network) for network in ipaddress.collapse_addresses(networks)))' "$1"
}
v4_list="$(printf '%s\n%s\n' "$v4" "$EXTRA_ALLOWED_V4" | cidr_list 4)"
v6_list="$(printf '%s\n%s\n' "$v6" "$EXTRA_ALLOWED_V6" | cidr_list 6)"

# Filter locally addressed ingress BEFORE Docker DNAT (priority -100).
# INPUT alone misses published bridge ports: they traverse FORWARD instead.
read -r -d '' RULES <<EOF || true
table ${TABLE} {
    set cf_v4 {
        type ipv4_addr
        flags interval
        elements = { ${v4_list} }
    }
    set cf_v6 {
        type ipv6_addr
        flags interval
        elements = { ${v6_list} }
    }
    chain prerouting {
        type filter hook prerouting priority -110; policy accept;

        # Never interfere with established traffic or loopback.
        ct state established,related accept
        iif lo accept

        # Docker's own bridges must keep working.
        iifname "docker0" accept
        iifname "br-*" accept

        # Do not constrain ordinary routed traffic or container egress.
        fib daddr type != local accept

        # HTTP/HTTPS, TCP and QUIC over UDP.
        tcp dport { 80, 443 } ip  saddr @cf_v4 accept
        tcp dport { 80, 443 } ip6 saddr @cf_v6 accept
        udp dport 443         ip  saddr @cf_v4 accept
        udp dport 443         ip6 saddr @cf_v6 accept

        # Anything else aimed at the web ports is dropped silently. DROP, not
        # REJECT: a scanner learns nothing from a timeout.
        tcp dport { 80, 443 } drop
        udp dport 443 drop
    }
}
EOF

if [[ $DRY_RUN -eq 1 ]]; then
  printf '%s\n' "$RULES"
  exit 0
fi

# Validate and replace in ONE transaction. A rejected update leaves the old
# protection intact, including when another process changes it after the check.
rules_file="$(mktemp)"
trap 'rm -f -- "$rules_file"' EXIT
tables="$(nft list tables)"
if grep -Fxq "table $TABLE" <<<"$tables"; then
  printf 'delete table %s\n' "$TABLE" >"$rules_file"
fi
printf '%s\n' "$RULES" >>"$rules_file"
nft --check --file "$rules_file"
nft --file "$rules_file"

log_ok "Applied: $(wc -l <<<"$v4") IPv4 and $(wc -l <<<"$v6") IPv6 Cloudflare ranges; ports 80/443 accept Cloudflare only"
log_info 'Persist across reboots by enabling RECONCILE_BEFORE in deployment/toolkit.conf (re-applies at boot and weekly).'
