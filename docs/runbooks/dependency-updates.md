# Dependency updates

Use this to understand, review and operate Dependabot in this repository: what it opens, how to
review each kind of PR, and what to do with a major version. Configuration:
[`.github/dependabot.yml`](../../.github/dependabot.yml).

## What it is and when it starts

Dependabot opens version-update PRs once a month at 06:00 Europe/Prague and security-update PRs
whenever an advisory matches. GitHub reads `.github/dependabot.yml` from the **default branch
(`main`) only**: an edit on any other branch has no effect until it is merged to `main`.

## How it is configured

Every entry is monthly (06:00 Europe/Prague) with a `cooldown`: a release must be 7 days old before a
version-update PR opens (npm majors 14). The cooldown is supply-chain protection against a bad or hijacked release; it does not delay security updates.
Minor and patch updates are grouped; npm has one group for production and development together, because separate npm PRs all rewrite `pnpm-lock.yaml` and conflict once one merges. Open-PR limits: npm and actions 3, docker and compose 5. **A major update is never grouped**: it is one PR, reviewed on its own.
Commit prefixes follow the repository's Conventional Commits.

| Ecosystem            | Directories                                                    | Groups                                                                        | Ignored                                       | Commit prefix                     |
| -------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| github-actions       | `/`                                                            | `actions-minor-patch`                                                         | none                                          | `ci(deps)`                        |
| npm (pnpm workspace) | `/` (covers `apps/`, `packages/`)                              | `npm-minor-patch` (production and development)                                | `@types/node`, `typescript`, `graphql`: major | `build(deps)` / `build(deps-dev)` |
| docker (Dockerfiles) | `/apps/*`                                                      | `images-minor-patch`                                                          | `node`: major                                 | `build(deps)`                     |
| docker-compose       | `/`, `/deployment/{development,ingress,monitoring,production}` | `images-minor-patch` (not Traefik, CrowdSec, socket proxy, Umami or postgres) | postgres: all versions                        | `chore(deps)`                     |

### Target branch

All version-update entries use `target-branch: develop`. `develop` is where this repository integrates
and releases from (PR `develop` to `main`); it is far ahead of `main`, so a bump opened against `main` would read stale
manifests and lockfile. `verify.yml` (Verify Code) runs on pull requests to `main` **and** `develop`, so Dependabot PRs
are checked before merge and then reach `main` through the normal release PR. Security-update PRs always target the
default branch (`main`); merge or cherry-pick them to `develop` as well so the two do not diverge.

### Why these are ignored

An `ignore` entry blocks only the listed update type; minor and patch updates of the same dependency still arrive. Each has a comment in the YAML.

- **postgres, every version**: the pinned toolkit refuses a changed stable data image ("perform an explicit data upgrade first"), so any bumped tag would fail at deploy; a major also changes the on-disk format. Change the tag by hand after a backup and restore proof. See [A major update](#a-major-update).
- **node major**: Node moves by hand to the next LTS (even) major, together with `engines`, the Dockerfiles, `@types/node` and the CI Node version.
- **@types/node major**: tracks the Node major above; bumped in the same change.
- **Not grouped, own PR**: Traefik, CrowdSec, the socket proxy and Umami (it migrates its schema on start).
- **Skipped by nature**: images tagged by `${VAR}` (the app images built from this repository, pinned by digest at deploy time) cannot be resolved by Dependabot.

## Reviewing a PR

1. Read the PR body: version range, release notes, the cooldown age. Take the repository's own rules into account (`AGENTS.md`).
2. Check CI. `Verify Code` runs type-check, lint, the format check, the docs link check and the toolkit pin check (there are no tests yet).
   It does **not** build the Docker images, start the Compose stack or exercise a database against a new engine version.
3. A merged bump changes nothing on a server until a deploy runs it: merging to `main` triggers the workflows described in
   [Deploy and release](deploy-and-release.md); infrastructure images in `deployment/ingress` and `deployment/monitoring` move only through
   **Deploy Ingress** and **Deploy Monitoring**, run by hand.
4. For an image PR read the upstream release notes for a changed default, a removed environment variable or a migration. For a patch or
   minor bump of a database engine, check that a recent backup exists ([Backups](backups.md)).
5. npm and github-actions minor/patch group PRs merge themselves, see [Auto-merge](#auto-merge). Merge every other PR by hand once green. A PR that fails CI: `@dependabot rebase` once, then fix by hand on its branch or close it with
   `@dependabot ignore this dependency` and a reason.

## A major update

Majors are never grouped, so each is one PR with its own notes.

1. Read the upstream migration guide. Decide whether it is worth doing now; closing the PR with `@dependabot ignore this major version` is a valid answer.
2. Do it on its branch, with the changes the guide requires; do not merge a bare version bump of anything stateful.
3. **postgres, mysql, mariadb, redis majors are migrations, not bumps.** They are ignored on purpose, so there is no PR: plan the change (take a fresh
   backup and prove a restore with [Backups](backups.md), dump and restore or the engine's upgrade tool on a scratch copy, a rollback path,
   a maintenance window), then edit the image tag by hand in a normal PR.
4. Node: change `engines`, every Dockerfile, the CI Node version and `@types/node` in one PR.

## Auto-merge

`.github/workflows/dependabot-auto-merge.yml` squash-merges **only** the `npm-minor-patch` and `actions-minor-patch` group PRs.
It runs after `Verify Code` completes successfully on a pull request, and merges only when all of these hold: the run's actor is
`dependabot[bot]` and its head repository is this one; exactly one open same-repo Dependabot PR has the run's head commit and a
group title; every other check on the PR is finished and none failed (skipped is fine). The merge uses
`--match-head-commit`, so a new push after the check is never merged unseen. It is gated in the workflow, not by a required-status-check
rule, so direct pushes stay possible; GitHub's "Allow auto-merge" is not used.

Never auto-merged, by design: majors, docker and compose PRs (CI does not build images or start the stack), Traefik, CrowdSec, Umami,
the toolkit pin. Like `dependabot.yml`, a `workflow_run` workflow is read from `main` only, so it is inert until released to `main`.

## The toolkit pin is not Dependabot's

`deployment/toolkit`, `deployment/toolkit.lock` and `deployment/vendor/**` are managed files.
No Dependabot entry covers them, and nothing may edit them by hand. A new toolkit release reaches
this repository only through the Toolkit repository:

```bash
# local, in a Toolkit checkout next to this repository
npm run repin
```

Review and commit the result here. See [Toolkit releasing](https://github.com/H7KZ/Toolkit/tree/main/docs/releasing.md).

## GitHub settings that must be on

Repository **Settings > Advanced Security** (or **Code security**), set by the owner on GitHub
(not in Git):

| Setting                     | State                                         |
| --------------------------- | --------------------------------------------- |
| Dependency graph            | enabled                                       |
| Dependabot alerts           | enabled                                       |
| Dependabot security updates | enabled                                       |
| Dependabot version updates  | enabled (this is what reads `dependabot.yml`) |

Labels: Dependabot only applies labels that exist. `dependencies`, `github_actions`, `javascript`
and `docker` are Dependabot's own defaults and are created for you; a label you rename or delete is
silently skipped.

## Trigger and inspect

- **Run now**: GitHub, **Insights > Dependency graph > Dependabot**, pick the ecosystem, **Check for updates**.
  The same page shows the last run, its log and any error (an unreachable directory, an unparseable file).
- **Re-run after a config change**: merge to `main`; Dependabot re-evaluates on its own within minutes.
- **One PR, ad hoc commands** (comment on the PR): `@dependabot rebase`, `@dependabot recreate`,
  `@dependabot ignore this major version`, `@dependabot ignore this dependency`. Prefer a durable
  `ignore` entry in `dependabot.yml` (with a comment) over a PR comment: it survives and is reviewed.
- **Security alerts**: **Security > Dependabot**. Security PRs ignore the cooldown, the schedule and
  `target-branch`; they open against `main`.

## Verify

- **Insights > Dependency graph > Dependabot** lists every ecosystem in `dependabot.yml` with a recent successful run and no error.
- The next monthly run brings grouped PRs titled with the prefixes above; a major arrives alone.
- `python3 ../Toolkit/scripts/check-consumers.py <this repository>` (local, Toolkit checkout beside this one) reports no `dependabot` finding.
