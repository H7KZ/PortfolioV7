#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
source "$SCRIPT_DIR/release-common.sh"
[[ "$EUID" == 0 ]] || { echo 'Run reconcile as root.' >&2; exit 1; }
: "${DEPLOY_USER:?Set DEPLOY_USER in /etc/portfoliov7-release.conf}"
record="$(getent passwd "$DEPLOY_USER")"
IFS=: read -r account _ uid _ _ deploy_home _ <<< "$record"
[[ "$account" == "$DEPLOY_USER" && "$uid" != 0 && "$deploy_home" == /* ]] || exit 1
require_toolkit
failures=0
for environment in production development monitoring; do
  current="$deploy_home/portfolio/versions/$environment/current"
  if [[ ! -e "$current" && ! -L "$current" ]]; then
    printf '%s: no current release; skipped\n' "$environment"
    continue
  fi
  # Toolkit checks each current pointer and its recorded project and immutable metadata.
  /usr/local/bin/toolkit reconcile --repository portfolio --environment "$environment" \
    --root "$deploy_home/portfolio/versions/$environment" --user "$DEPLOY_USER" || failures=1
done
exit "$failures"
