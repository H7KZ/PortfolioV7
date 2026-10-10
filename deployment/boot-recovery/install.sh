#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
source "$SCRIPT_DIR/release-common.sh"
[[ "$EUID" == 0 && $# == 1 ]] || { echo 'usage: sudo bash boot-recovery/install.sh <deploy-user>' >&2; exit 2; }
record="$(getent passwd "$1")"
IFS=: read -r account _ uid _ _ deploy_home _ <<< "$record"
[[ "$account" == "$1" && "$uid" != 0 && "$deploy_home" == /* ]] || exit 1
require_toolkit
destination=/opt/portfoliov7-deployment
[[ "$SCRIPT_DIR" != "$destination" && ! -L "$destination" ]] || { echo 'Install from a separate trusted checkout.' >&2; exit 1; }
install -d -m 0755 "$destination"
# The root service executes only installed control files, never a mutable current script.
for file in release-common.sh verify-toolkit-pin.sh boot-recovery/reconcile.sh analytics/retention.sh analytics/retention.py vendor/toolkit/validate-lock.sh; do
  [[ -f "$SCRIPT_DIR/$file" && ! -L "$SCRIPT_DIR/$file" ]] || exit 1
  install -D -o root -g root -m 0755 "$SCRIPT_DIR/$file" "$destination/$file"
done
version="$(awk -F= '$1 == "TOOLKIT_VERSION" {print $2}' "$SCRIPT_DIR/toolkit.lock")"
for file in toolkit.lock "vendor/toolkit/toolkit-$version.tar.gz" "vendor/toolkit/toolkit-$version.tar.gz.sha256"; do
  install -D -o root -g root -m 0644 "$SCRIPT_DIR/$file" "$destination/$file"
done
if [[ ! -e /etc/portfoliov7-release.conf ]]; then
  printf 'DEPLOY_USER=%s\n' "$account" > /etc/portfoliov7-release.conf
  chmod 600 /etc/portfoliov7-release.conf
else
  grep -Fx "DEPLOY_USER=$account" /etc/portfoliov7-release.conf >/dev/null || {
    echo 'Existing release config uses a different deploy user.' >&2; exit 1;
  }
fi
install -m 0644 "$SCRIPT_DIR/boot-recovery/portfoliov7-reconcile.service" /etc/systemd/system/
install -m 0644 "$SCRIPT_DIR/analytics/portfoliov7-umami-retention.service" /etc/systemd/system/
install -m 0644 "$SCRIPT_DIR/analytics/portfoliov7-umami-retention.timer" /etc/systemd/system/
systemctl daemon-reload
echo 'Units installed. No services or timers started or enabled.'
