#!/usr/bin/env python3
"""Check local links and anchors in the repository's Markdown, and docs/ paths named elsewhere.

Usage: python3 scripts/check-doc-links.py [ROOT]
Checks, for every tracked-style Markdown file under ROOT (node_modules, .git, deployment/vendor
excluded): relative link targets exist, `#anchor` fragments match a heading of the target file
(GitHub slug rules), and `docs/...md` paths mentioned in workflows, scripts and compose files
exist. External http(s) links are not fetched.
Exit codes: 0 all links resolve, 1 broken links found, 2 usage error.
"""

from pathlib import Path
import re
import sys

SKIP_DIRS = {".git", "node_modules", ".nuxt", ".output", ".next", ".turbo", "vendor"}
LINK = re.compile(r"(?<!\!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)|!\[[^\]]*\]\(([^)\s]+)\)")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
DOC_PATH = re.compile(r"(?<![\w/.-])docs/[A-Za-z0-9_./-]+\.md\b")


def slug(text):
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = text.strip().lower()
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def strip_fences(text):
    out, fenced = [], False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            fenced = not fenced
            out.append("")
        else:
            out.append("" if fenced else line)
    return "\n".join(out)


def anchors(path, cache={}):
    if path not in cache:
        found, seen = set(), {}
        for line in strip_fences(path.read_text(encoding="utf-8")).splitlines():
            match = HEADING.match(line)
            if match:
                base = slug(match.group(2))
                count = seen.get(base, 0)
                seen[base] = count + 1
                found.add(base if count == 0 else f"{base}-{count}")
        cache[path] = found
    return cache[path]


def files(root, suffixes):
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix in suffixes and not any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            yield path


def main():
    if len(sys.argv) > 2:
        print(__doc__, file=sys.stderr)
        return 2
    root = Path(sys.argv[1] if len(sys.argv) == 2 else Path(__file__).resolve().parent.parent).resolve()
    problems = []
    for path in files(root, {".md"}):
        text = strip_fences(path.read_text(encoding="utf-8"))
        for number, line in enumerate(text.splitlines(), 1):
            line = re.sub(r"`[^`]*`", "", line)
            for match in LINK.finditer(line):
                target = match.group(1) or match.group(2)
                if re.match(r"^[a-z][a-z0-9+.-]*:", target) or target.startswith("//"):
                    continue
                name, _, fragment = target.partition("#")
                resolved = path if not name else (path.parent / name).resolve()
                where = f"{path.relative_to(root)}:{number}"
                if not resolved.exists():
                    problems.append(f"{where}: missing {target}")
                elif fragment and resolved.suffix == ".md" and fragment.lower() not in anchors(resolved):
                    problems.append(f"{where}: no heading #{fragment} in {resolved.relative_to(root)}")
    for path in files(root, {".yml", ".yaml", ".sh", ".py", ".conf"}):
        if path.name == "check-doc-links.py":
            continue
        for number, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            for match in DOC_PATH.finditer(line):
                if not (root / match.group(0)).exists():
                    problems.append(f"{path.relative_to(root)}:{number}: missing {match.group(0)}")
    for problem in problems:
        print(problem, file=sys.stderr)
    if problems:
        print(f"{len(problems)} broken link(s)", file=sys.stderr)
        return 1
    print("documentation links ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
