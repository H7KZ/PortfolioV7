# Manual deploy from any branch and skip-build via image digest

Read-only research. No repo files changed except this note. Scope: Kreditozrouti, Ohlidame, PortfolioV7, Infrastructure.

**TL;DR:** The `ERROR: ***ment requires main` line comes from `_deploy-service.yml:51` in Kreditozrouti and Ohlidame. It is an unconditional `github.ref == refs/heads/main` check, so any non-main dispatch fails there, after the image builds. PortfolioV7 already allows `development` from any branch. Infrastructure is production-only by design and should not be relaxed. Digest-based skip-build is a reversal of an explicit past decision in Kreditozrouti (`skip_build` removed), so it needs an owner decision.

## Root cause

- Kreditozrouti `.github/workflows/_deploy-service.yml:47` sets `WORKFLOW_REF: ${{ github.ref }}`.
- Line 51: `[[ "$WORKFLOW_REF" == refs/heads/main ]] || { echo 'ERROR: deployment requires main'; exit 1; }`
- Same at Ohlidame `.github/workflows/_deploy-service.yml:47,51`.
- The guard applies to every environment (`development`, `monitoring`, `production`), not just production.
- Masked word: source literal is `deployment`. Log shows `***ment`, so the redacted token is `deploy`. GitHub redacts any registered secret value. Some secret value equals `deploy` (guess: `SSH_USER`, a DB user, or similar). Not verifiable from the repo; check the repo/environment secrets. Redaction of substrings is observed behavior; the add-mask doc describes whole words.
- Introduced in: Kreditozrouti commit `3b03975e` ("refactor: deploy complete toolkit snapshots"), Ohlidame commit `1a364ea3` (same title).
- Flow for dispatch `environment=development` from `develop` (Kreditozrouti, Ohlidame):
  1. `validate` passes (dev allowed, `deploy-all.yml:58-62` / `deploy.yml:53-57`).
  2. All 4 (Ohlidame: 4 incl. test-eshop) build jobs run, because `inputs.environment == 'development'` (`deploy-all.yml:152,163,174,185`).
  3. `deploy` calls `_deploy-service.yml`, guard fails at line 51. Images are built and wasted.

## Per repo

### PortfolioV7

- Guard: `deploy.yml:42` `[[ "$TARGET" == development || "$GITHUB_REF" == refs/heads/main ]]`. Same at `_deploy-environment.yml:43`, which also covers rollback and analytics.
- Message differs: `Production releases require main.` / `Production and analytics require main.` No `deployment requires main` string. **Not the source of the reported log line.**
- Dev from any branch: already allowed. Prod and monitoring: main only.
- Inputs: `deploy.yml` `environment` (production|development, default development). `rollback.yml` `environment`, `release_id`. `deploy-analytics.yml` none, job-level `if: github.ref == 'refs/heads/main'` (silent skip).
- Structure: `verify` -> `preflight` -> `build-web` (+`build-cms` prod only) -> `deploy` (`_deploy-environment.yml`, `environment:` at line 26).
- Build: `_build-service.yml:60,85` tag = full `$GITHUB_SHA` only. Digest output `steps.push.outputs.digest` (line 49).
- Skip build possible: no input exists. Would need: input per service, `build-*` `if` add `&& inputs.<svc>_digest == ''`, deploy `if` (`deploy.yml:64-67`) accept skipped build, and digest passed as `web_digest` / `cms_digest` (`deploy.yml:71-72`).
- Docs: `docs/setup/deployment.md:9` says restrict production and monitoring env branches to main; development unrestricted.

### Kreditozrouti

- Failing guard: `_deploy-service.yml:51` (above).
- Other main guards: `rollback.yml:39` (`refs/heads/main`, intentional per commit `78212217` "require main for Kreditozrouti rollback"); `deploy-monitoring.yml:12` `if: github.ref == 'refs/heads/main'` (silent skip); `deploy-all.yml:78-79` production promotion must come from main (correct).
- Inputs: `environment` (production|development), `development_run_id`. No `image_tag`, no `skip_build`. Both were removed in `3b03975e` / `672a4c13`.
- Structure: `verify` (`_verify.yml`) -> `validate` (outputs `api_digest`, `web_digest`, `scraper_digest`, `mcp_digest`, `qualified_commit`, manifest) -> `build-api|web|scraper|mcp` (`_build-service.yml`) -> `deploy` (`_deploy-service.yml`, `deploy-all.yml:192-213`) -> `publish-qualified-development-release` (needs all builds success).
- Build tags (`_build-service.yml:91-94`): `:<8-char sha>`, `:<full sha>`, `:dev-latest`. Digest `steps.build-image.outputs.digest` (line 58).
- Skip build possible: partially ready. Deploy already reads `needs.validate.outputs.<svc>_digest || needs.build-<svc>.outputs.image_digest` (`deploy-all.yml:209-212`), so a validate-provided digest path exists. Blockers: deploy `if` (line 201-202) requires `build-*.result == 'success'` for non-production; `source_commit` falls back to `github.sha` (line 206), i.e. branch HEAD, not the commit that built the image. Fix: derive from image label `org.opencontainers.image.revision` (set at `_build-service.yml:99`) or add a `source_commit` input. `publish-qualified-development-release` should not run for digest-only deploys unless intended.
- Docs drift: `docs/deployment/DOCKER.md:26` says "development-only manual tag deploys remain tag-based" (stale). `docs/runbooks/how-to-deploy-and-release.md:7-8` says "Subsets/tag-only deploys and `skip_build` inputs are removed." `docs/engineering/CONTRIBUTING.md:3,7` says branch from and PR to `develop`, but deploy triggers are main-only.

### Ohlidame

- Failing guard: `_deploy-service.yml:51` (identical).
- Other: `rollback.yml:39` (main only); `deploy-monitoring.yml:12` (silent skip); `deploy.yml:73-74` production promotion from main (correct).
- Inputs: `environment`, `development_run_id`. No digest/skip inputs.
- Structure: `verify` (`verify.yml`) -> `validate` (outputs `api_digest`, `web_digest`, `scraper_digest`, manifest; no test-eshop digest) -> `build-api|web|scraper|test-eshop` -> `deploy` (`deploy.yml:185-206`) -> `indexnow` (prod), `publish-qualified-development-release`.
- Build: `_build-service.yml:92-95` tags as Kreditozrouti; digest line 59; Trivy scan report-only (line 106-108).
- Skip build: same blockers as Kreditozrouti. Test-eshop digest not in `validate` outputs (needs adding). Deploy `source_commit` fallback at `deploy.yml:199`.

### Infrastructure

- No image build. Deploys `git archive HEAD` of the checked-out commit as a toolkit snapshot (`_deploy.yml:101`) to **production only** (`_deploy.yml:188`, `--environment production`). No development environment exists.
- Guards: `deploy.yml:50` `production deploys must be dispatched from main`; `_deploy.yml:28` and `rollback.yml:20` `if: github.ref == 'refs/heads/main' && github.actor == github.repository_owner` (silent skip). Owner-only actor check.
- Inputs: `stack`, `release_id`, `jirikominek_readiness`. No digest input (images not built here).
- Recommendation: do not relax. Relaxing means non-main code goes to production. Add a development environment and stack first.

## Recommended design (Kreditozrouti and Ohlidame; PortfolioV7 needs only the digest part)

1. Branch rule: change `_deploy-service.yml:51` to an environment-aware check:
   - `production` requires `refs/heads/main` (keep).
   - `development` and `monitoring`: allow any ref, or keep monitoring main-only to match `deploy-monitoring.yml`.
   - Keep `deploy-all.yml:78` and `rollback.yml:39` as-is unless the owner wants otherwise.
2. Dispatch inputs (`deploy-all.yml`, `deploy.yml`): optional `image_digest_api|web|scraper|mcp` (Ohlidame: `api|web|scraper|test_eshop`), default `''`.
3. Validate step, when any digest is given (dev only, reject for production):
   - Format `^sha256:[a-f0-9]{64}$`.
   - Existence and identity: `docker buildx imagetools inspect ghcr.io/<prefix>/<svc>@<digest>` (or `docker manifest inspect`). Confirm the returned digest equals the input.
   - Read `org.opencontainers.image.revision` label from the image config and use it as `source_commit`, so the bundle and image match. Fail if missing.
   - Requires `packages: read` (caller already has `packages: write`).
4. Build jobs: `if` add `&& inputs.image_digest_<svc> == ''`.
5. Deploy job: `if` accept `needs.build-*.result == 'skipped'` when the corresponding digest input is set. Keep `needs.validate.outputs.<svc>_digest || needs.build-*.outputs.image_digest` as already written.
6. `publish-qualified-development-release`: skip for digest-supplied runs, so an unverified or non-main image is never published as a qualified release.
7. Production promotion path (`development_run_id`) unchanged.

Caveat: `_deploy-service.yml` checks out `bundle` at `source_commit`. Mismatch between `source_commit` and the image is the main correctness risk; the label check removes it.

## Primary sources

- Dispatch ref selection and default-branch requirement: https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow ("your workflow must be in the default branch"; ref via branch dropdown, `--ref`, or API `ref`).
- Reusable workflow env: https://docs.github.com/en/actions/sharing-automations/reusing-workflows ("The job that calls the reusable workflow can't use the `environment` keyword.").
- `github.ref` = triggering ref: https://docs.github.com/en/actions/reference/workflows-and-actions/contexts ("The fully-formed ref of the branch or tag that triggered the workflow run."). The page does not explicitly address reusable workflows. The caller-ref behavior is inferred from the observed failure.
- Environment deployment branches: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment ("specify what branches and tags can deploy to this environment").
- Masking: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands ("Masking a value prevents a string or variable from being printed in the log.").
- Image inspect: https://docs.docker.com/reference/cli/docker/buildx/imagetools/inspect/ (`--format` fields `.Name`, `.Manifest`, `.Image`). Page does not confirm `image@sha256:` input. Test it in a dry run.
- Build digest output: https://github.com/docker/build-push-action (outputs table lists `digest`).
- `needs` / `if` / skip semantics: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax . Not verified verbatim (fetch truncated). Standard behavior: a dependent job is skipped when a needed job is skipped unless `if: always()` is used. Verify before relying on it.

## Open questions for the owner

1. Reverse the `skip_build` / tag-only removal (`docs/runbooks/how-to-deploy-and-release.md:7-8`, commits `3b03975e`, `672a4c13`)? Kreditozrouti and Ohlidame deliberately dropped it.
2. Allow non-main to `development` only (recommended), or also `production`? Production currently requires main and a qualified dev run.
3. Infrastructure: keep main-only. Add a dev environment first?
4. Check GitHub Settings > Environments for `development` deployment branch rules in Kreditozrouti and Ohlidame. Not visible in repo. PortfolioV7 docs say development is unrestricted.
5. Which secret equals `deploy` (causes the `***ment` masking)? Not a code issue, but it affects log readability.
6. Dispatch button appears only after the workflow file is on `main`. Changes must merge to `main` before manual use from `develop` works in the UI.
7. Doc drift to fix: `DOCKER.md:26` vs runbook; `CONTRIBUTING.md` develop flow vs main-only deploys.
