# V7 content seed

Use this once per environment after the V7 redesign is merged, to write the V7 copy and images into the CMS. [`apps/cms/scripts/seed-v7.ts`](../../apps/cms/scripts/seed-v7.ts) reads `docs/redesign/content/copy.{en,cs}.json` and `docs/redesign/assets/`, compares every document with what is stored and writes only the differences, so it is safe to rerun. It renames `corac_sith` to `deeptrace` and `iont_info` to `iont_platform`, creates `intedat`, hides every other project card, and adds the 301 redirects from the old project URLs.

The deploy applies the V7 schema migration when the CMS starts. Until the seed runs, V7 pages render with the V6 text in the fields that already existed and leave the new ones empty, so seed right after the deploy.

## Prepare

1. Deploy the environment from `main` and confirm the CMS started (its migrations ran).
2. Use the production database credentials and the exact production `PAYLOAD_SECRET`, as in the [V6 content import](content-import.md#prepare).
3. Open the database tunnel from a separate terminal:

```bash
ssh -N -L 45433:$(ssh <vps> "docker inspect -f '{{(index .NetworkSettings.Networks \"portfolio-internal-network\").IPAddress}}' portfolio-postgres"):5432 <vps>
```

## Dry run, then seed (local, with the tunnel open)

The script refuses any database other than the local Docker one unless `SEED_V7_ALLOW_REMOTE=1` is set. From the repo root:

```bash
SEED_V7_ALLOW_REMOTE=1 DATABASE_URI=postgres://<user>:<password>@127.0.0.1:45433/<db> PAYLOAD_SECRET=<prod secret> MEDIA_DIR=$PWD/.scratch/media REVALIDATE_URLS=" " PAYLOAD_DISABLE_JOBS=1 pnpm --filter @portfolio/cms run seed:v7 -- --dry-run
```

Read the printed differences. When they look right, run the same command without `-- --dry-run`, then run it once more: the second run must end with `0 changed`.

Transfer the uploaded images to the CMS volume and restart the web so it drops cached content:

```bash
scp -r .scratch/media <vps>:~/portfolio/seed-media
ssh <vps> 'docker cp ~/portfolio/seed-media/. portfolio-cms:/data/media && docker exec -u root portfolio-cms chown -R cms:cms /data/media && docker restart portfolio-web-prod'
```

## Verify

Home, a case study, the résumé and contact render the V7 copy in English and under `/cs`. `/projects/corac_sith`, `/projects/iont_info`, `/projects/iont_charge` and `/projects/iont_admin` answer 301 to their new pages, also under `/cs`. The images show on the home cards and case studies, and the CMS admin shows their alt text in both languages.
