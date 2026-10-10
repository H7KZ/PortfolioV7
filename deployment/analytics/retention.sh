#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
source "$SCRIPT_DIR/release-common.sh"
[[ "$EUID" == 0 ]] || { echo 'Run the retention service as root.' >&2; exit 1; }
: "${DEPLOY_USER:?Set DEPLOY_USER in /etc/portfoliov7-release.conf}"
record="$(getent passwd "$DEPLOY_USER")"
IFS=: read -r account _ uid _ _ deploy_home _ <<< "$record"
[[ "$account" == "$DEPLOY_USER" && "$uid" != 0 && "$deploy_home" == /* ]] || exit 1
require_toolkit
exec /usr/local/bin/toolkit with-lock --repository portfolio --environment monitoring \
  --action maintenance -- runuser -u "$DEPLOY_USER" -- \
  python3 "$SCRIPT_DIR/analytics/retention.py" "$deploy_home/portfolio/versions/monitoring"
