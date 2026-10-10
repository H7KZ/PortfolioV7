#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
source "$SCRIPT_DIR/release-common.sh"
(($# == 2)) || { echo 'usage: rollback.sh <environment> <previous|release-id>' >&2; exit 2; }
validate_target "$1"
[[ "$2" == previous || "$2" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]] || { echo 'Invalid release ID' >&2; exit 2; }
require_toolkit
args=(release rollback --repository portfolio --environment "$1"
  --root "$HOME/portfolio/versions/$1" --user "$(id -un)" --release-id "$2")
[[ -z "${DOCKER_CONFIG:-}" ]] || args+=(--registry-config "$DOCKER_CONFIG")
exec sudo -n /usr/local/bin/toolkit "${args[@]}"
