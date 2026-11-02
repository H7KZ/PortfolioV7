import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_page_locales" ADD COLUMN "placeholder_suffix" varchar;
  ALTER TABLE "_project_page_v_locales" ADD COLUMN "version_placeholder_suffix" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "project_page_locales" DROP COLUMN "placeholder_suffix";
  ALTER TABLE "_project_page_v_locales" DROP COLUMN "version_placeholder_suffix";`)
}
