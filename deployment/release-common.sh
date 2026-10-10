#!/usr/bin/env bash

validate_target() {
  case "$1" in production|development|monitoring) ;; *) echo 'Invalid release environment' >&2; exit 2 ;; esac
}

require_toolkit() {
  bash "$SCRIPT_DIR/verify-toolkit-pin.sh" >/dev/null
  local expected actual
  expected="$(awk -F= '$1 == "TOOLKIT_VERSION" {print $2}' "$SCRIPT_DIR/toolkit.lock")"
  [[ -x /usr/local/bin/toolkit ]] || { echo 'Install and explicitly activate the pinned toolkit first.' >&2; exit 1; }
  actual="$(/usr/local/bin/toolkit version)"
  [[ "$actual" == "toolkit_version=$expected" ]] || { echo 'Active toolkit differs from deployment/toolkit.lock.' >&2; exit 1; }
  [[ "$expected" == 0.8.1 ]] || { echo 'Immutable releases require toolkit 0.8.1.' >&2; exit 1; }
}
