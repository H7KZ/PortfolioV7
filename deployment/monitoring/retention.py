#!/usr/bin/env python3
"""Run only the retention SQL belonging to the current analytics snapshot."""

import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys


root = Path(sys.argv[1])
pointer = root / "current"
if not pointer.exists() and not pointer.is_symlink():
    raise SystemExit(0)
root = root.resolve(strict=True)
if not pointer.is_symlink():
    raise SystemExit("Analytics current must be a snapshot symlink; migrate the legacy deployment.")
release = pointer.resolve(strict=True)
if release.parent != root or not release.is_dir():
    raise SystemExit("Analytics current points outside its release root")
metadata = release / ".toolkit-release.json"
inventory = release / ".toolkit-inventory.json"
# Snapshots staged before the analytics directory became monitoring still hold the SQL there.
folder = "monitoring" if (release / "monitoring").is_dir() else "analytics"
sql = release / folder / "umami/retention.sql"
if any(not path.is_file() or path.is_symlink() for path in (metadata, inventory)):
    raise SystemExit("Missing snapshot manifest; stage and activate a toolkit analytics release first.")
manifest = json.loads(metadata.read_text())
if (
    manifest.get("schema_version") != 1
    or manifest.get("repository") != "portfolio"
    or manifest.get("environment") != "monitoring"
    or manifest.get("project") != "portfolio-analytics"
    or manifest.get("release_id") != release.name
    or not re.fullmatch(r"[a-f0-9]{40}-[0-9]+-[0-9]+", release.name)
    or manifest.get("source_commit") != release.name[:40]
    or set(manifest.get("resolved_images", {})) != {"portfolio-umami", "portfolio-umami-postgres"}
    or any(not re.fullmatch(r"[^\s]+@sha256:[a-f0-9]{64}", reference) for reference in manifest["resolved_images"].values())
):
    raise SystemExit("Invalid analytics snapshot metadata")
for path in (release, metadata, inventory):
    if path.stat().st_uid != 0 or path.stat().st_mode & 0o222:
        raise SystemExit("Analytics snapshot is not sealed by toolkit")
records = {}
for path in sorted(release.rglob("*")):
    if path.name == ".toolkit-inventory.json":
        continue
    name = path.relative_to(release).as_posix()
    if path.is_symlink():
        records[name] = {"link": os.readlink(path)}
    elif path.is_file():
        with path.open("rb") as source:
            records[name] = {"sha256": hashlib.file_digest(source, "sha256").hexdigest()}
if records != json.loads(inventory.read_text()):
    raise SystemExit("Analytics snapshot inventory changed")
if any(path.is_symlink() for path in (release / folder, release / folder / "umami", sql)) or not sql.is_file():
    raise SystemExit("Invalid analytics snapshot SQL")
container = "portfolio-umami-postgres"
details = json.loads(subprocess.check_output(["docker", "inspect", container]))[0]
labels = details.get("Config", {}).get("Labels", {})
if labels.get("com.docker.compose.project") != "portfolio-analytics" or labels.get("com.docker.compose.service") != container:
    raise SystemExit("Analytics database belongs to a different Compose project")
with sql.open("rb") as source:
    subprocess.run(
        ["docker", "exec", "-i", container, "sh", "-c", 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'],
        stdin=source,
        check=True,
    )
