# V6 content import

This is a one-time production migration from the sibling `PortfolioV6` checkout. [`apps/cms/scripts/migrate-v6.ts`](../../apps/cms/scripts/migrate-v6.ts) defines what is imported. Run it again only when intentionally replacing imported content.

## Prepare

1. Deploy production with the CMS and confirm its schema is ready.
2. Create the first Payload admin user through `https://cms.jankominek.com/admin`. Keep that hostname behind Cloudflare Access.
3. Keep a local `PortfolioV6` checkout in the location expected by the migration script, or set `V6_DIR` to its path. Use the production database credentials, API keys, and exact production `PAYLOAD_SECRET`. Payload indexes API keys with that secret.
4. Confirm the CMS database is reachable only through the intended SSH tunnel. Run the tunnel from a separate terminal before starting the import.

```bash
ssh -N -L 45433:$(ssh <vps> "docker inspect -f '{{(index .NetworkSettings.Networks \"portfolio-internal-network\").IPAddress}}' portfolio-postgres"):5432 <vps>
```

## Import and verify

From the repo root, with the tunnel open:

```bash
DATABASE_URI=postgres://<user>:<password>@127.0.0.1:45433/<db> PAYLOAD_SECRET=<prod secret> MEDIA_DIR=$PWD/.scratch/media REVALIDATE_URLS=" " PAYLOAD_DISABLE_JOBS=1 CMS_READ_API_KEY=<prod key> CMS_CONTACT_API_KEY=<prod key> pnpm migrate:v6
```

Transfer the generated media to the CMS volume, then restart the production web so it drops cached content:

```bash
scp -r .scratch/media <vps>:~/portfolio/seed-media
ssh <vps> 'docker cp ~/portfolio/seed-media/. portfolio-cms:/data/media && docker exec -u root portfolio-cms chown -R cms:cms /data/media && docker restart portfolio-web-prod'
```

Confirm that the records and media appear in Payload. After deploying development, check representative English and Czech pages, projects, posts, media, old URL redirects, and the CV there. Save an edit in the CMS and confirm the development web refreshes its cache. Repeat the public checks after the apex cutover, following the [deployment sequence](deployment.md#first-deployment).
