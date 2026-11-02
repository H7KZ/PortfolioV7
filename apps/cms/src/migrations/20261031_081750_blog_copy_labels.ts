import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_locales" ADD COLUMN "copy_label" varchar;
  ALTER TABLE "blog_locales" ADD COLUMN "copied_label" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_copy_label" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_copied_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_locales" DROP COLUMN "copy_label";
  ALTER TABLE "blog_locales" DROP COLUMN "copied_label";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_copy_label";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_copied_label";`)
}
