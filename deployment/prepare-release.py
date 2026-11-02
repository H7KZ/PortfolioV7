#!/usr/bin/env python3
"""Render private dotenv and package tracked deployment contents for toolkit."""

import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile


def fail(message):
    raise SystemExit(message)


def value(name, required=True, allow=""):
    result = os.environ.get(name, "")
    if required and not result:
        fail(f"Missing {name}")
    if any(character in result for character in "\r\n\0$`'\\" if character not in allow):
        fail(f"Unsupported dotenv characters in {name}")
    return result


def main():
    if len(sys.argv) != 3:
        fail("usage: prepare-release.py <environment> <output-directory>")
    environment = sys.argv[1]
    projects = {"production": "portfolio", "development": "portfolio-dev", "monitoring": "portfolio-monitoring", "ingress": "global"}
    # Toolkit 0.11 accepts only fixed lock environments; the ingress target uses `infrastructure`.
    toolkit_environments = {"ingress": "infrastructure"}
    if environment not in projects:
        fail("Invalid environment")
    commit = os.environ.get("SOURCE_SHA") or value("GITHUB_SHA")
    if not re.fullmatch(r"[a-f0-9]{40}", commit):
        fail("Invalid source commit")
    # CalVer (YYYY.MM.DD-<run number>): image tag shown by `docker ps`, APP_VERSION and release ID.
    version = value("RELEASE_VERSION")
    release_id = value("RELEASE_ID")
    if not re.fullmatch(r"\d{4}\.\d{2}\.\d{2}-[1-9][0-9]*", version) or not re.fullmatch(re.escape(version) + r"(\.[1-9][0-9]*)?", release_id):
        fail("Invalid release version or ID")
    config = {}
    images = {}
    variables = {}
    health_urls = []
    folder = environment
    prepare_script = None
    post_deploy_script = None
    runtime_directories = []
    if environment == "ingress":
        for name in ("TRAEFIK_DOMAIN", "TRAEFIK_DASHBOARD_ALLOWED_IPS", "ACME_EMAIL", "CF_DNS_API_TOKEN"):
            config[name] = value(name)
        # A bcrypt hash holds dollars; the dotenv is single-quoted, so they stay literal.
        config["TRAEFIK_HTPASSWD"] = value("TRAEFIK_HTPASSWD", allow="$")
        config["CROWDSEC_ENROLL_KEY"] = value("CROWDSEC_ENROLL_KEY", required=False)
        prepare_script = "ingress/scripts/prepare.sh"
        post_deploy_script = "ingress/scripts/post-deploy.sh"
        runtime_directories = ["ingress/.rendered"]
    elif environment == "monitoring":
        for name in ("SITE_DOMAIN", "UMAMI_DOMAIN", "UMAMI_DB_NAME", "UMAMI_DB_USER", "UMAMI_DB_PASSWORD", "UMAMI_APP_SECRET"):
            config[name] = value(name)
        health_urls = [f"https://{config['SITE_DOMAIN']}/stats/stats.js"]
    else:
        for name in ("PROJECT", "DOMAIN", "CMS_DOMAIN", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "PAYLOAD_SECRET", "PREVIEW_SECRET", "REVALIDATE_SECRET", "CMS_READ_API_KEY", "CMS_CONTACT_API_KEY"):
            config[name] = value(name)
        expected_project = "prod" if environment == "production" else "dev"
        if config["PROJECT"] != expected_project:
            fail(f"PROJECT must be {expected_project}")
        if environment == "production":
            for name in ("UMAMI_WEBSITE_ID", "DISCORD_WEBHOOK_URL"):
                config[name] = value(name, required=False)
            health_urls = [f"https://{config['DOMAIN']}/", f"https://{config['DOMAIN']}/robots.txt"]
        prefix = value("GITHUB_REPOSITORY").lower()
        if prefix != "h7kz/portfoliov7":
            fail("Unexpected image repository")
        variables.update(IMAGE_REGISTRY="ghcr.io", IMAGE_PREFIX=prefix)
        for service in ("web", "cms"):
            digest = value(f"{service.upper()}_DIGEST")
            if not re.fullmatch(r"sha256:[a-f0-9]{64}", digest):
                fail(f"Invalid {service} image digest")
            # The tag is for people (`docker ps`); Docker resolves the digest.
            reference = f"ghcr.io/{prefix}/{service}:{version}@{digest}"
            images[service] = reference
            variables[f"{service.upper()}_IMAGE_REFERENCE"] = reference
            variables[f"{service.upper()}_IMAGE_TAG"] = version
        config.update(variables)
    for name in ("DOMAIN", "CMS_DOMAIN", "SITE_DOMAIN", "UMAMI_DOMAIN", "TRAEFIK_DOMAIN"):
        if name in config and not re.fullmatch(r"[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?", config[name]):
            fail(f"Invalid hostname in {name}")
    manifest = {
        "schema_version": 1,
        "repository": "portfolio",
        "environment": toolkit_environments.get(environment, environment),
        "release_id": release_id,
        "source_commit": commit,
        "project": projects[environment],
        "compose_files": [f"{folder}/networks.yml", f"{folder}/volumes.yml", f"{folder}/docker-compose.{folder}.yml"],
        "images": images,
        "health_urls": health_urls,
        "environment_variables": variables,
    }
    if environment == "production":
        prepare_script = "scripts/pre-migrate-dump.sh"
    if prepare_script:
        manifest["prepare_script"] = prepare_script
    if post_deploy_script:
        manifest["post_deploy_script"] = post_deploy_script
    if runtime_directories:
        manifest["runtime_directories"] = runtime_directories
    output = Path(sys.argv[2]).resolve()
    output.mkdir(mode=0o700, parents=True, exist_ok=False)
    os.umask(0o077)
    (output / "release.env").write_text("".join(f"{name}='{setting}'\n" for name, setting in config.items()))
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    root = Path(os.environ.get("SOURCE_ROOT", str(Path(__file__).resolve().parent.parent))).resolve() / "deployment"
    tracked = subprocess.check_output(["git", "ls-files", "-z", "deployment/"], cwd=root.parent).decode().split("\0")
    with tarfile.open(output / "release.tar.gz", "w:gz", format=tarfile.USTAR_FORMAT) as archive:
        for entry in sorted(filter(None, tracked)):
            relative = Path(entry).relative_to("deployment")
            if any(part.startswith(".") or not re.fullmatch(r"[A-Za-z0-9_-][A-Za-z0-9._-]*", part) for part in relative.parts):
                fail("Unsafe deployment archive path")
            path = root / relative
            if path.is_symlink() or not path.is_file():
                fail("Deployment archive requires regular files")
            info = tarfile.TarInfo(relative.as_posix())
            info.size = path.stat().st_size
            info.mode = 0o755 if path.suffix == ".sh" else 0o644
            with path.open("rb") as source:
                archive.addfile(info, source)
    with (output / "release.tar.gz").open("rb") as source:
        digest = hashlib.file_digest(source, "sha256").hexdigest()
    (output / "release.tar.gz.sha256").write_text(f"{digest}  release.tar.gz\n")
    print(f"Prepared {environment} release {release_id}")


if __name__ == "__main__":
    main()
