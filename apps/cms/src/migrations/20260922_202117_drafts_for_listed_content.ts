import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_experience_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experience_v_version_kind" AS ENUM('work', 'ownProduct', 'leadership', 'education');
  CREATE TYPE "public"."enum__experience_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experience_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('en', 'cs');
  CREATE TABLE "_experience_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_experience_v_version_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"accent" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_kind" "enum__experience_v_version_kind" DEFAULT 'work',
  	"version_order" numeric DEFAULT 99,
  	"version_current" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experience_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__experience_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_experience_v_locales" (
  	"version_dates" varchar,
  	"version_duration" varchar,
  	"version_role" varchar,
  	"version_organization" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_order" numeric DEFAULT 99,
  	"version_name" varchar,
  	"version_initials" varchar,
  	"version_linkedin_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_role" varchar,
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_order" numeric DEFAULT 99,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_number" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "experience_highlights_locales" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "experience_chips" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "kind" DROP NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "dates" DROP NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "organization" DROP NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "initials" DROP NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "quote" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "number" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "experience" ADD COLUMN "_status" "enum_experience_status" DEFAULT 'draft';
  ALTER TABLE "testimonials" ADD COLUMN "_status" "enum_testimonials_status" DEFAULT 'draft';
  ALTER TABLE "services" ADD COLUMN "_status" "enum_services_status" DEFAULT 'draft';
  UPDATE "experience" SET "_status" = 'published';
  UPDATE "testimonials" SET "_status" = 'published';
  UPDATE "services" SET "_status" = 'published';
  ALTER TABLE "_experience_v_version_highlights" ADD CONSTRAINT "_experience_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_highlights_locales" ADD CONSTRAINT "_experience_v_version_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v_version_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_chips" ADD CONSTRAINT "_experience_v_version_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_parent_id_experience_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v_locales" ADD CONSTRAINT "_experience_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_texts" ADD CONSTRAINT "_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_experience_v_version_highlights_order_idx" ON "_experience_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_experience_v_version_highlights_parent_id_idx" ON "_experience_v_version_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_experience_v_version_highlights_locales_locale_parent_id_un" ON "_experience_v_version_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_experience_v_version_chips_order_idx" ON "_experience_v_version_chips" USING btree ("_order");
  CREATE INDEX "_experience_v_version_chips_parent_id_idx" ON "_experience_v_version_chips" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_parent_idx" ON "_experience_v" USING btree ("parent_id");
  CREATE INDEX "_experience_v_version_version_updated_at_idx" ON "_experience_v" USING btree ("version_updated_at");
  CREATE INDEX "_experience_v_version_version_created_at_idx" ON "_experience_v" USING btree ("version_created_at");
  CREATE INDEX "_experience_v_version_version__status_idx" ON "_experience_v" USING btree ("version__status");
  CREATE INDEX "_experience_v_created_at_idx" ON "_experience_v" USING btree ("created_at");
  CREATE INDEX "_experience_v_updated_at_idx" ON "_experience_v" USING btree ("updated_at");
  CREATE INDEX "_experience_v_snapshot_idx" ON "_experience_v" USING btree ("snapshot");
  CREATE INDEX "_experience_v_published_locale_idx" ON "_experience_v" USING btree ("published_locale");
  CREATE INDEX "_experience_v_latest_idx" ON "_experience_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_experience_v_locales_locale_parent_id_unique" ON "_experience_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_texts_order_parent" ON "_services_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "experience__status_idx" ON "experience" USING btree ("_status");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_experience_v_version_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_version_highlights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_version_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_experience_v_version_highlights" CASCADE;
  DROP TABLE "_experience_v_version_highlights_locales" CASCADE;
  DROP TABLE "_experience_v_version_chips" CASCADE;
  DROP TABLE "_experience_v" CASCADE;
  DROP TABLE "_experience_v_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_texts" CASCADE;
  DROP INDEX "experience__status_idx";
  DROP INDEX "testimonials__status_idx";
  DROP INDEX "services__status_idx";
  ALTER TABLE "experience_highlights_locales" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "experience_chips" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "kind" SET NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "dates" SET NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "experience_locales" ALTER COLUMN "organization" SET NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "initials" SET NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "quote" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "number" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "experience" DROP COLUMN "_status";
  ALTER TABLE "testimonials" DROP COLUMN "_status";
  ALTER TABLE "services" DROP COLUMN "_status";
  DROP TYPE "public"."enum_experience_status";
  DROP TYPE "public"."enum__experience_v_version_kind";
  DROP TYPE "public"."enum__experience_v_version_status";
  DROP TYPE "public"."enum__experience_v_published_locale";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";`)
}
