#!/usr/bin/env bash
# Release post-deploy hook: register this snapshot's CrowdSec bouncer key, then require healthy
# containers. Toolkit runs it inside the host window, after Compose is healthy and before the
# current/previous pointers move, so a failure here leaves the previous release current.
# Usage: run through `deployment/toolkit release deploy ingress`. Exit codes: 0 success, 1 failure.
set -Eeuo pipefail

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=../../vendor/toolkit/log.sh
source "$here/../../vendor/toolkit/log.sh"

key="${CROWDSEC_BOUNCER_API_KEY:?run through deployment/toolkit release deploy ingress}"
[[ "$key" =~ ^[A-Za-z0-9_-]+$ ]] || die 'invalid snapshot bouncer key'

# LAPI's persisted bouncer registry must match the selected runtime snapshot. Pipe the key over
# stdin so it does not appear in process arguments.
log_step 'Register the CrowdSec bouncer'
{
  printf "key='%s'\n" "$key"
  cat <<'REGISTER'
set -eu
cscli bouncers delete traefik >/dev/null 2>&1 || true
cscli bouncers add traefik --key "$key" >/dev/null
REGISTER
} | docker exec -i crowdsec sh -s

check_health() {
  local service="$1" container status elapsed=0
  container="$(docker ps -q --filter label=com.docker.compose.project=global --filter "label=com.docker.compose.service=$service")"
  [[ -n "$container" ]] || die "$service is not running"
  while ((elapsed < 120)); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || printf unknown)"
    case "$status" in
    healthy)
      log_ok "$service healthy"
      return 0
      ;;
    unhealthy) die "$service is unhealthy" ;;
    esac
    sleep 5
    ((elapsed += 5))
  done
  die "$service did not become healthy in 120 seconds"
}

log_step 'Check container health'
check_health crowdsec
check_health traefik
docker exec crowdsec cscli bouncers list 2>/dev/null | grep -q traefik || die "CrowdSec bouncer 'traefik' is not registered"
log_ok "CrowdSec bouncer 'traefik' registered"
