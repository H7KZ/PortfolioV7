import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ADD COLUMN "all_recommendations_url" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_all_recommendations_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP COLUMN "all_recommendations_url";
  ALTER TABLE "_home_v" DROP COLUMN "version_all_recommendations_url";`)
}
