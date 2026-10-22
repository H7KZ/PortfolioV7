#!/usr/bin/env python3
"""Render Traefik's static config, dashboard credentials and the CrowdSec bouncer key.

Runs as the toolkit prepare hook. Toolkit exports the private release dotenv and
TOOLKIT_RUNTIME_DIR; ingress/.rendered is a link into that private runtime directory.
Writes ingress/.rendered/{traefik.yml,traefik.htpasswd,crowdsec-lapi-key} and
$TOOLKIT_RUNTIME_DIR/extra.env (the paths and the bouncer key the Compose file reads).
"""

import os
from pathlib import Path
import secrets
import sys

root = Path(__file__).resolve().parents[2]


def dotenv(values):
    lines = []
    for name, value in values.items():
        if any(character in value for character in "'\r\n\0"):
            raise ValueError(f"{name} contains an unsupported character")
        lines.append(f"{name}='{value}'\n")
    return "".join(lines)


def prepare():
    runtime = Path(os.environ["TOOLKIT_RUNTIME_DIR"])
    if not runtime.is_absolute() or runtime.is_symlink() or not runtime.is_dir():
        raise ValueError("TOOLKIT_RUNTIME_DIR must be a private absolute directory")
    if not Path(os.environ["TOOLKIT_ENV_FILE"]).is_file():
        raise ValueError("toolkit snapshot dotenv is missing")
    rendered = root / "ingress" / ".rendered"
    if not rendered.is_symlink() or not rendered.resolve().is_relative_to(runtime.resolve()):
        raise ValueError("ingress/.rendered must link into this release's private runtime")
    render_dir = rendered.resolve()
    render_dir.mkdir(parents=True, exist_ok=True)
    email = os.environ["ACME_EMAIL"]
    if any(character in email for character in "\r\n\"'\\") or "@" not in email:
        raise ValueError("invalid ACME_EMAIL")
    config = (root / "ingress/config/traefik.yml").read_text()
    config = config.replace("${ACME_EMAIL}", email).replace("${CERT_RESOLVER}", "letsencrypt")
    if "${" in config:
        raise ValueError("unsubstituted Traefik static configuration")
    (render_dir / "traefik.yml").write_text(config)
    credentials = os.environ["TRAEFIK_HTPASSWD"]
    if ":$2" not in credentials or any(character in credentials for character in "\r\n\0"):
        raise ValueError("TRAEFIK_HTPASSWD must be a bcrypt user:hash line")
    (render_dir / "traefik.htpasswd").write_text(credentials + "\n")
    # Each snapshot owns its bouncer key; the post-deploy hook registers it, including on rollback.
    key = secrets.token_urlsafe(33)
    (render_dir / "crowdsec-lapi-key").write_text(key)
    for name in ("traefik.yml", "traefik.htpasswd", "crowdsec-lapi-key"):
        # Containers run with cap_drop: ALL and need read access; the runtime parent stays private.
        (render_dir / name).chmod(0o644)
    extra = {
        "TRAEFIK_CREDENTIALS_PATH": str(render_dir / "traefik.htpasswd"),
        "CROWDSEC_LAPI_KEY_PATH": str(render_dir / "crowdsec-lapi-key"),
        "CROWDSEC_BOUNCER_API_KEY": key,
    }
    path = runtime / "extra.env"
    with path.open("x", encoding="utf-8") as handle:
        path.chmod(0o600)
        handle.write(dotenv(extra))


try:
    prepare()
except (OSError, ValueError, KeyError) as error:
    print(f"ingress preparation error: {error}", file=sys.stderr)
    sys.exit(1)
