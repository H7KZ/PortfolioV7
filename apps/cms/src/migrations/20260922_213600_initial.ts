import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_projects_layout" AS ENUM('caseStudy', 'simple');
  CREATE TYPE "public"."enum_projects_card_size" AS ENUM('featured', 'wide', 'narrow', 'default');
  CREATE TYPE "public"."enum_projects_card_cta" AS ENUM('viewProject', 'readCaseStudy');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_layout" AS ENUM('caseStudy', 'simple');
  CREATE TYPE "public"."enum__projects_v_version_card_size" AS ENUM('featured', 'wide', 'narrow', 'default');
  CREATE TYPE "public"."enum__projects_v_version_card_cta" AS ENUM('viewProject', 'readCaseStudy');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_experience_kind" AS ENUM('work', 'ownProduct', 'leadership', 'education');
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
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'reader', 'contact');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'purgeContactSubmissions');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'purgeContactSubmissions');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_resume_impact_style" AS ENUM('number', 'text', 'accent');
  CREATE TYPE "public"."enum_resume_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_v_version_impact_style" AS ENUM('number', 'text', 'accent');
  CREATE TYPE "public"."enum__resume_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_privacy_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_terms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_published_locale" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum_navigation_items_match" AS ENUM('exact', 'prefix');
  CREATE TYPE "public"."enum__navigation_v_version_items_match" AS ENUM('exact', 'prefix');
  CREATE TABLE "projects_impact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_impact_locales" (
  	"label" varchar,
  	"value" varchar,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_contributions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"num" varchar
  );
  
  CREATE TABLE "projects_contributions_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"order" numeric DEFAULT 99,
  	"layout" "enum_projects_layout" DEFAULT 'caseStudy',
  	"thumbnail_id" integer,
  	"card_show" boolean DEFAULT true,
  	"card_size" "enum_projects_card_size" DEFAULT 'default',
  	"card_cta" "enum_projects_card_cta" DEFAULT 'viewProject',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"lede" varchar,
  	"client" varchar,
  	"role" varchar,
  	"team" varchar,
  	"timeline" varchar,
  	"sector" varchar,
  	"content" jsonb,
  	"content_html" varchar,
  	"card_company" varchar,
  	"card_role" varchar,
  	"card_badge" varchar,
  	"card_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_projects_v_version_impact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_impact_locales" (
  	"label" varchar,
  	"value" varchar,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_contributions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"num" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_contributions_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_order" numeric DEFAULT 99,
  	"version_layout" "enum__projects_v_version_layout" DEFAULT 'caseStudy',
  	"version_thumbnail_id" integer,
  	"version_card_show" boolean DEFAULT true,
  	"version_card_size" "enum__projects_v_version_card_size" DEFAULT 'default',
  	"version_card_cta" "enum__projects_v_version_card_cta" DEFAULT 'viewProject',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_lede" varchar,
  	"version_client" varchar,
  	"version_role" varchar,
  	"version_team" varchar,
  	"version_timeline" varchar,
  	"version_sector" varchar,
  	"version_content" jsonb,
  	"version_content_html" varchar,
  	"version_card_company" varchar,
  	"version_card_role" varchar,
  	"version_card_badge" varchar,
  	"version_card_description" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"author" varchar DEFAULT 'Jan Komínek',
  	"reading_time" numeric,
  	"thumbnail_id" integer,
  	"legacy_markdown" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"content_html" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_author" varchar DEFAULT 'Jan Komínek',
  	"version_reading_time" numeric,
  	"version_thumbnail_id" integer,
  	"version_legacy_markdown" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_content_html" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experience_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "experience_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "experience_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"accent" boolean
  );
  
  CREATE TABLE "experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_experience_kind" DEFAULT 'work',
  	"order" numeric DEFAULT 99,
  	"current" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experience_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "experience_locales" (
  	"dates" varchar,
  	"duration" varchar,
  	"role" varchar,
  	"organization" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
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
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 99,
  	"name" varchar,
  	"initials" varchar,
  	"linkedin_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "testimonials_locales" (
  	"role" varchar,
  	"quote" varchar,
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
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 99,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"number" varchar,
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"budget" numeric,
  	"message" varchar NOT NULL,
  	"details" jsonb,
  	"deadline" timestamp(3) with time zone,
  	"locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"permanent" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"posts_id" integer,
  	"experience_id" integer,
  	"testimonials_id" integer,
  	"services_id" integer,
  	"media_id" integer,
  	"contact_submissions_id" integer,
  	"redirects_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_taglines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_taglines_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_stats_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"portrait_id" integer,
  	"quote_limit" numeric DEFAULT 450,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"first_name" varchar,
  	"last_name" varchar,
  	"value_prop" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"availability_status" varchar,
  	"availability_detail" varchar,
  	"geo_summary" varchar,
  	"now_label" varchar,
  	"now_title" varchar,
  	"now_description" varchar,
  	"now_date" varchar,
  	"now_meta" varchar,
  	"work_label" varchar,
  	"work_heading" varchar,
  	"work_sub" varchar,
  	"view_project_label" varchar,
  	"read_case_study_label" varchar,
  	"services_label" varchar,
  	"services_heading" varchar,
  	"services_sub" varchar,
  	"testimonials_label" varchar,
  	"testimonials_heading" varchar,
  	"testimonials_sub" varchar,
  	"read_more_label" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v_version_taglines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_taglines_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_stats_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_primary_cta_href" varchar,
  	"version_secondary_cta_href" varchar,
  	"version_portrait_id" integer,
  	"version_quote_limit" numeric DEFAULT 450,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__home_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_home_v_locales" (
  	"version_first_name" varchar,
  	"version_last_name" varchar,
  	"version_value_prop" varchar,
  	"version_primary_cta_label" varchar,
  	"version_secondary_cta_label" varchar,
  	"version_availability_status" varchar,
  	"version_availability_detail" varchar,
  	"version_geo_summary" varchar,
  	"version_now_label" varchar,
  	"version_now_title" varchar,
  	"version_now_description" varchar,
  	"version_now_date" varchar,
  	"version_now_meta" varchar,
  	"version_work_label" varchar,
  	"version_work_heading" varchar,
  	"version_work_sub" varchar,
  	"version_view_project_label" varchar,
  	"version_read_case_study_label" varchar,
  	"version_services_label" varchar,
  	"version_services_heading" varchar,
  	"version_services_sub" varchar,
  	"version_testimonials_label" varchar,
  	"version_testimonials_heading" varchar,
  	"version_testimonials_sub" varchar,
  	"version_read_more_label" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "resume_impact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_resume_impact_style" DEFAULT 'number'
  );
  
  CREATE TABLE "resume_impact_locales" (
  	"label" varchar,
  	"value" varchar,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "resume_skill_groups_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"primary" boolean
  );
  
  CREATE TABLE "resume_skill_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "resume_skill_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "resume" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portrait_id" integer,
  	"cv_id" integer,
  	"hire_cta_href" varchar,
  	"_status" "enum_resume_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "resume_locales" (
  	"label" varchar,
  	"name" varchar,
  	"subtitle" varchar,
  	"bio" varchar,
  	"download_label" varchar,
  	"hire_cta_label" varchar,
  	"experience_label" varchar,
  	"experience_heading" varchar,
  	"experience_sub" varchar,
  	"own_product_label" varchar,
  	"own_product_heading" varchar,
  	"own_product_sub" varchar,
  	"leadership_label" varchar,
  	"leadership_heading" varchar,
  	"leadership_sub" varchar,
  	"education_label" varchar,
  	"education_heading" varchar,
  	"skills_label" varchar,
  	"skills_heading" varchar,
  	"skills_sub" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_resume_v_version_impact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__resume_v_version_impact_style" DEFAULT 'number',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resume_v_version_impact_locales" (
  	"label" varchar,
  	"value" varchar,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_resume_v_version_skill_groups_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"primary" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resume_v_version_skill_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resume_v_version_skill_groups_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_resume_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_portrait_id" integer,
  	"version_cv_id" integer,
  	"version_hire_cta_href" varchar,
  	"version__status" "enum__resume_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_resume_v_locales" (
  	"version_label" varchar,
  	"version_name" varchar,
  	"version_subtitle" varchar,
  	"version_bio" varchar,
  	"version_download_label" varchar,
  	"version_hire_cta_label" varchar,
  	"version_experience_label" varchar,
  	"version_experience_heading" varchar,
  	"version_experience_sub" varchar,
  	"version_own_product_label" varchar,
  	"version_own_product_heading" varchar,
  	"version_own_product_sub" varchar,
  	"version_leadership_label" varchar,
  	"version_leadership_heading" varchar,
  	"version_leadership_sub" varchar,
  	"version_education_label" varchar,
  	"version_education_heading" varchar,
  	"version_skills_label" varchar,
  	"version_skills_heading" varchar,
  	"version_skills_sub" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "blog" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "blog_locales" (
  	"label" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"minutes_short" varchar NOT NULL,
  	"minutes_long" varchar NOT NULL,
  	"share_label" varchar NOT NULL,
  	"share_text" varchar NOT NULL,
  	"share_on_x_label" varchar NOT NULL,
  	"rss_label" varchar NOT NULL,
  	"feed_title" varchar NOT NULL,
  	"feed_description" varchar NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_blog_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_blog_v_locales" (
  	"version_label" varchar NOT NULL,
  	"version_heading" varchar NOT NULL,
  	"version_minutes_short" varchar NOT NULL,
  	"version_minutes_long" varchar NOT NULL,
  	"version_share_label" varchar NOT NULL,
  	"version_share_text" varchar NOT NULL,
  	"version_share_on_x_label" varchar NOT NULL,
  	"version_rss_label" varchar NOT NULL,
  	"version_feed_title" varchar NOT NULL,
  	"version_feed_description" varchar NOT NULL,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_locales" (
  	"label" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"email_label" varchar NOT NULL,
  	"linkedin_label" varchar NOT NULL,
  	"linkedin_sub" varchar,
  	"book_call_label" varchar NOT NULL,
  	"book_call_sub" varchar,
  	"include_label" varchar NOT NULL,
  	"include_text" varchar NOT NULL,
  	"brief_title" varchar NOT NULL,
  	"brief_step" varchar,
  	"skip_form_label" varchar NOT NULL,
  	"skip_form_text" varchar NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_contact_v_locales" (
  	"version_label" varchar NOT NULL,
  	"version_heading" varchar NOT NULL,
  	"version_intro" varchar NOT NULL,
  	"version_email_label" varchar NOT NULL,
  	"version_linkedin_label" varchar NOT NULL,
  	"version_linkedin_sub" varchar,
  	"version_book_call_label" varchar NOT NULL,
  	"version_book_call_sub" varchar,
  	"version_include_label" varchar NOT NULL,
  	"version_include_text" varchar NOT NULL,
  	"version_brief_title" varchar NOT NULL,
  	"version_brief_step" varchar,
  	"version_skip_form_label" varchar NOT NULL,
  	"version_skip_form_text" varchar NOT NULL,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "project_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "project_page_locales" (
  	"back_label" varchar NOT NULL,
  	"case_study_label" varchar NOT NULL,
  	"role_label" varchar NOT NULL,
  	"team_label" varchar NOT NULL,
  	"timeline_label" varchar NOT NULL,
  	"sector_label" varchar NOT NULL,
  	"challenge_label" varchar NOT NULL,
  	"contributions_label" varchar NOT NULL,
  	"stack_label" varchar NOT NULL,
  	"meta_suffix" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_project_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_project_page_v_locales" (
  	"version_back_label" varchar NOT NULL,
  	"version_case_study_label" varchar NOT NULL,
  	"version_role_label" varchar NOT NULL,
  	"version_team_label" varchar NOT NULL,
  	"version_timeline_label" varchar NOT NULL,
  	"version_sector_label" varchar NOT NULL,
  	"version_challenge_label" varchar NOT NULL,
  	"version_contributions_label" varchar NOT NULL,
  	"version_stack_label" varchar NOT NULL,
  	"version_meta_suffix" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "privacy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"_status" "enum_privacy_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "privacy_locales" (
  	"label" varchar,
  	"title" varchar,
  	"updated_label" varchar,
  	"binding_note" varchar,
  	"content" jsonb,
  	"content_html" varchar,
  	"opt_out_title" varchar,
  	"opt_out_active" varchar,
  	"opt_out_inactive" varchar,
  	"opt_out_button" varchar,
  	"opt_in_button" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_privacy_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version__status" "enum__privacy_v_version_status" DEFAULT 'draft',
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__privacy_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_privacy_v_locales" (
  	"version_label" varchar,
  	"version_title" varchar,
  	"version_updated_label" varchar,
  	"version_binding_note" varchar,
  	"version_content" jsonb,
  	"version_content_html" varchar,
  	"version_opt_out_title" varchar,
  	"version_opt_out_active" varchar,
  	"version_opt_out_inactive" varchar,
  	"version_opt_out_button" varchar,
  	"version_opt_in_button" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "terms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"_status" "enum_terms_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "terms_locales" (
  	"label" varchar,
  	"title" varchar,
  	"updated_label" varchar,
  	"binding_note" varchar,
  	"content" jsonb,
  	"content_html" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_terms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version__status" "enum__terms_v_version_status" DEFAULT 'draft',
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__terms_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_terms_v_locales" (
  	"version_label" varchar,
  	"version_title" varchar,
  	"version_updated_label" varchar,
  	"version_binding_note" varchar,
  	"version_content" jsonb,
  	"version_content_html" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "errors_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" numeric NOT NULL
  );
  
  CREATE TABLE "errors_messages_locales" (
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "errors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "errors_locales" (
  	"back_label" varchar NOT NULL,
  	"fallback_message" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_errors_v_version_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" numeric NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_errors_v_version_messages_locales" (
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_errors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_errors_v_locales" (
  	"version_back_label" varchar NOT NULL,
  	"version_fallback_message" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"match" "enum_navigation_items_match" DEFAULT 'exact',
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"monogram" varchar DEFAULT 'J' NOT NULL,
  	"hire_href" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"home_label" varchar NOT NULL,
  	"hire_label" varchar NOT NULL,
  	"toggle_language_label" varchar NOT NULL,
  	"toggle_menu_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"match" "enum__navigation_v_version_items_match" DEFAULT 'exact',
  	"visible" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_monogram" varchar DEFAULT 'J' NOT NULL,
  	"version_hire_href" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_navigation_v_locales" (
  	"version_home_label" varchar NOT NULL,
  	"version_hire_label" varchar NOT NULL,
  	"version_toggle_language_label" varchar NOT NULL,
  	"version_toggle_menu_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"arrow" boolean DEFAULT true
  );
  
  CREATE TABLE "footer_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar DEFAULT '/contact' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"label" varchar NOT NULL,
  	"heading_before" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"heading_after" varchar,
  	"privacy_label" varchar NOT NULL,
  	"terms_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"arrow" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_cta_href" varchar DEFAULT '/contact' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_footer_v_locales" (
  	"version_label" varchar NOT NULL,
  	"version_heading_before" varchar NOT NULL,
  	"version_cta_label" varchar NOT NULL,
  	"version_heading_after" varchar,
  	"version_privacy_label" varchar NOT NULL,
  	"version_terms_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_alumni_of" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"alternate_name" varchar
  );
  
  CREATE TABLE "site_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_services_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"alternate_name" varchar,
  	"site_url" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"linkedin_url" varchar NOT NULL,
  	"cal_link" varchar NOT NULL,
  	"keywords" varchar,
  	"image_id" integer,
  	"twitter_handle" varchar,
  	"portrait_id" integer,
  	"locality" varchar,
  	"country" varchar,
  	"occupation_skills" varchar,
  	"humans_txt" varchar,
  	"llms_txt" varchar,
  	"llms_full_txt" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_locales" (
  	"skip_to_content" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_alt" varchar,
  	"job_title" varchar NOT NULL,
  	"person_description" varchar NOT NULL,
  	"profile_description" varchar,
  	"offer_catalog_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_site_v_version_alumni_of" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"alternate_name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v_version_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v_version_services_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_name" varchar NOT NULL,
  	"version_alternate_name" varchar,
  	"version_site_url" varchar NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_linkedin_url" varchar NOT NULL,
  	"version_cal_link" varchar NOT NULL,
  	"version_keywords" varchar,
  	"version_image_id" integer,
  	"version_twitter_handle" varchar,
  	"version_portrait_id" integer,
  	"version_locality" varchar,
  	"version_country" varchar,
  	"version_occupation_skills" varchar,
  	"version_humans_txt" varchar,
  	"version_llms_txt" varchar,
  	"version_llms_full_txt" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_v_locales" (
  	"version_skip_to_content" varchar NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_image_alt" varchar,
  	"version_job_title" varchar NOT NULL,
  	"version_person_description" varchar NOT NULL,
  	"version_profile_description" varchar,
  	"version_offer_catalog_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "contact_form_project_type_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_project_type_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_features_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_features_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_technologies_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_technologies_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_assets_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_assets_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_audiences_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_audiences_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_hosting_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_hosting_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_support_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_support_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_legals_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_legals_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_priority_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_priority_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"budget_currency" varchar DEFAULT '€' NOT NULL,
  	"budget_min" numeric DEFAULT 1000 NOT NULL,
  	"budget_max" numeric DEFAULT 25000 NOT NULL,
  	"budget_step" numeric DEFAULT 250 NOT NULL,
  	"budget_default" numeric DEFAULT 2500 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_form_locales" (
  	"full_name_label" varchar NOT NULL,
  	"full_name_placeholder" varchar,
  	"email_label" varchar NOT NULL,
  	"email_placeholder" varchar,
  	"message_label" varchar NOT NULL,
  	"message_placeholder" varchar,
  	"budget_label" varchar NOT NULL,
  	"advanced_label" varchar NOT NULL,
  	"company_label" varchar NOT NULL,
  	"company_placeholder" varchar,
  	"project_type_label" varchar NOT NULL,
  	"project_type_empty_option" varchar NOT NULL,
  	"features_label" varchar NOT NULL,
  	"features_placeholder" varchar,
  	"technologies_label" varchar NOT NULL,
  	"technologies_placeholder" varchar,
  	"assets_label" varchar NOT NULL,
  	"assets_placeholder" varchar,
  	"audiences_label" varchar NOT NULL,
  	"audiences_placeholder" varchar,
  	"hosting_label" varchar NOT NULL,
  	"hosting_empty_option" varchar NOT NULL,
  	"support_label" varchar NOT NULL,
  	"support_empty_option" varchar NOT NULL,
  	"legals_label" varchar NOT NULL,
  	"legals_placeholder" varchar,
  	"deadline_label" varchar NOT NULL,
  	"priority_label" varchar NOT NULL,
  	"priority_empty_option" varchar NOT NULL,
  	"send_label" varchar NOT NULL,
  	"sending_label" varchar NOT NULL,
  	"success_message" varchar NOT NULL,
  	"error_message" varchar NOT NULL,
  	"validation_required" varchar NOT NULL,
  	"validation_invalid_email" varchar NOT NULL,
  	"validation_too_long" varchar NOT NULL,
  	"validation_invalid_option" varchar NOT NULL,
  	"validation_invalid_date" varchar NOT NULL,
  	"validation_budget_range" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_project_type_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_project_type_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_features_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_features_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_technologies_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_technologies_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_assets_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_assets_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_audiences_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_audiences_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_hosting_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_hosting_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_support_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_support_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_legals_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_legals_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_priority_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_priority_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_form_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_budget_currency" varchar DEFAULT '€' NOT NULL,
  	"version_budget_min" numeric DEFAULT 1000 NOT NULL,
  	"version_budget_max" numeric DEFAULT 25000 NOT NULL,
  	"version_budget_step" numeric DEFAULT 250 NOT NULL,
  	"version_budget_default" numeric DEFAULT 2500 NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_locales" (
  	"version_full_name_label" varchar NOT NULL,
  	"version_full_name_placeholder" varchar,
  	"version_email_label" varchar NOT NULL,
  	"version_email_placeholder" varchar,
  	"version_message_label" varchar NOT NULL,
  	"version_message_placeholder" varchar,
  	"version_budget_label" varchar NOT NULL,
  	"version_advanced_label" varchar NOT NULL,
  	"version_company_label" varchar NOT NULL,
  	"version_company_placeholder" varchar,
  	"version_project_type_label" varchar NOT NULL,
  	"version_project_type_empty_option" varchar NOT NULL,
  	"version_features_label" varchar NOT NULL,
  	"version_features_placeholder" varchar,
  	"version_technologies_label" varchar NOT NULL,
  	"version_technologies_placeholder" varchar,
  	"version_assets_label" varchar NOT NULL,
  	"version_assets_placeholder" varchar,
  	"version_audiences_label" varchar NOT NULL,
  	"version_audiences_placeholder" varchar,
  	"version_hosting_label" varchar NOT NULL,
  	"version_hosting_empty_option" varchar NOT NULL,
  	"version_support_label" varchar NOT NULL,
  	"version_support_empty_option" varchar NOT NULL,
  	"version_legals_label" varchar NOT NULL,
  	"version_legals_placeholder" varchar,
  	"version_deadline_label" varchar NOT NULL,
  	"version_priority_label" varchar NOT NULL,
  	"version_priority_empty_option" varchar NOT NULL,
  	"version_send_label" varchar NOT NULL,
  	"version_sending_label" varchar NOT NULL,
  	"version_success_message" varchar NOT NULL,
  	"version_error_message" varchar NOT NULL,
  	"version_validation_required" varchar NOT NULL,
  	"version_validation_invalid_email" varchar NOT NULL,
  	"version_validation_too_long" varchar NOT NULL,
  	"version_validation_invalid_option" varchar NOT NULL,
  	"version_validation_invalid_date" varchar NOT NULL,
  	"version_validation_budget_range" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects_impact" ADD CONSTRAINT "projects_impact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_impact_locales" ADD CONSTRAINT "projects_impact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_impact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_contributions" ADD CONSTRAINT "projects_contributions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_contributions_locales" ADD CONSTRAINT "projects_contributions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_contributions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_impact" ADD CONSTRAINT "_projects_v_version_impact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_impact_locales" ADD CONSTRAINT "_projects_v_version_impact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_impact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_contributions" ADD CONSTRAINT "_projects_v_version_contributions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_contributions_locales" ADD CONSTRAINT "_projects_v_version_contributions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_contributions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_texts" ADD CONSTRAINT "_projects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_highlights" ADD CONSTRAINT "experience_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_highlights_locales" ADD CONSTRAINT "experience_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_chips" ADD CONSTRAINT "experience_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_locales" ADD CONSTRAINT "experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_highlights" ADD CONSTRAINT "_experience_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_highlights_locales" ADD CONSTRAINT "_experience_v_version_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v_version_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_chips" ADD CONSTRAINT "_experience_v_version_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_parent_id_experience_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v_locales" ADD CONSTRAINT "_experience_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_texts" ADD CONSTRAINT "services_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_texts" ADD CONSTRAINT "_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_taglines" ADD CONSTRAINT "home_taglines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_taglines_locales" ADD CONSTRAINT "home_taglines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_taglines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats_locales" ADD CONSTRAINT "home_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_taglines" ADD CONSTRAINT "_home_v_version_taglines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_taglines_locales" ADD CONSTRAINT "_home_v_version_taglines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_taglines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats" ADD CONSTRAINT "_home_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats_locales" ADD CONSTRAINT "_home_v_version_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_impact" ADD CONSTRAINT "resume_impact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_impact_locales" ADD CONSTRAINT "resume_impact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_impact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_skill_groups_skills" ADD CONSTRAINT "resume_skill_groups_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_skill_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_skill_groups" ADD CONSTRAINT "resume_skill_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_skill_groups_locales" ADD CONSTRAINT "resume_skill_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_skill_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume" ADD CONSTRAINT "resume_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resume" ADD CONSTRAINT "resume_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resume_locales" ADD CONSTRAINT "resume_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resume_locales" ADD CONSTRAINT "resume_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_impact" ADD CONSTRAINT "_resume_v_version_impact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_impact_locales" ADD CONSTRAINT "_resume_v_version_impact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v_version_impact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_skill_groups_skills" ADD CONSTRAINT "_resume_v_version_skill_groups_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v_version_skill_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_skill_groups" ADD CONSTRAINT "_resume_v_version_skill_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_skill_groups_locales" ADD CONSTRAINT "_resume_v_version_skill_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v_version_skill_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v" ADD CONSTRAINT "_resume_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resume_v" ADD CONSTRAINT "_resume_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resume_v_locales" ADD CONSTRAINT "_resume_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resume_v_locales" ADD CONSTRAINT "_resume_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_locales" ADD CONSTRAINT "blog_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_locales" ADD CONSTRAINT "blog_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_v_locales" ADD CONSTRAINT "_blog_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_v_locales" ADD CONSTRAINT "_blog_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v_locales" ADD CONSTRAINT "_contact_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v_locales" ADD CONSTRAINT "_contact_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_page_locales" ADD CONSTRAINT "project_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_project_page_v_locales" ADD CONSTRAINT "_project_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_project_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_locales" ADD CONSTRAINT "privacy_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_locales" ADD CONSTRAINT "privacy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_v_locales" ADD CONSTRAINT "_privacy_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_v_locales" ADD CONSTRAINT "_privacy_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_locales" ADD CONSTRAINT "terms_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_locales" ADD CONSTRAINT "terms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_locales" ADD CONSTRAINT "_terms_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_v_locales" ADD CONSTRAINT "_terms_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "errors_messages" ADD CONSTRAINT "errors_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."errors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "errors_messages_locales" ADD CONSTRAINT "errors_messages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."errors_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "errors_locales" ADD CONSTRAINT "errors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."errors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_errors_v_version_messages" ADD CONSTRAINT "_errors_v_version_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_errors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_errors_v_version_messages_locales" ADD CONSTRAINT "_errors_v_version_messages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_errors_v_version_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_errors_v_locales" ADD CONSTRAINT "_errors_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_errors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_items" ADD CONSTRAINT "_navigation_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_items_locales" ADD CONSTRAINT "_navigation_v_version_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_locales" ADD CONSTRAINT "_navigation_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links_locales" ADD CONSTRAINT "footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_links" ADD CONSTRAINT "_footer_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_links_locales" ADD CONSTRAINT "_footer_v_version_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_locales" ADD CONSTRAINT "_footer_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_alumni_of" ADD CONSTRAINT "site_alumni_of_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_services" ADD CONSTRAINT "site_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_services_locales" ADD CONSTRAINT "site_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_locales" ADD CONSTRAINT "site_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_texts" ADD CONSTRAINT "site_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_alumni_of" ADD CONSTRAINT "_site_v_version_alumni_of_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_services" ADD CONSTRAINT "_site_v_version_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_services_locales" ADD CONSTRAINT "_site_v_version_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v_version_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v" ADD CONSTRAINT "_site_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_v" ADD CONSTRAINT "_site_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_v_locales" ADD CONSTRAINT "_site_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_texts" ADD CONSTRAINT "_site_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_project_type_options" ADD CONSTRAINT "contact_form_project_type_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_project_type_options_locales" ADD CONSTRAINT "contact_form_project_type_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_project_type_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_features_options" ADD CONSTRAINT "contact_form_features_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_features_options_locales" ADD CONSTRAINT "contact_form_features_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_features_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_technologies_options" ADD CONSTRAINT "contact_form_technologies_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_technologies_options_locales" ADD CONSTRAINT "contact_form_technologies_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_technologies_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_assets_options" ADD CONSTRAINT "contact_form_assets_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_assets_options_locales" ADD CONSTRAINT "contact_form_assets_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_assets_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_audiences_options" ADD CONSTRAINT "contact_form_audiences_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_audiences_options_locales" ADD CONSTRAINT "contact_form_audiences_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_audiences_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_hosting_options" ADD CONSTRAINT "contact_form_hosting_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_hosting_options_locales" ADD CONSTRAINT "contact_form_hosting_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_hosting_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_support_options" ADD CONSTRAINT "contact_form_support_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_support_options_locales" ADD CONSTRAINT "contact_form_support_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_support_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_legals_options" ADD CONSTRAINT "contact_form_legals_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_legals_options_locales" ADD CONSTRAINT "contact_form_legals_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_legals_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_priority_options" ADD CONSTRAINT "contact_form_priority_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_priority_options_locales" ADD CONSTRAINT "contact_form_priority_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_priority_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_locales" ADD CONSTRAINT "contact_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_project_type_options" ADD CONSTRAINT "_contact_form_v_version_project_type_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_project_type_options_locales" ADD CONSTRAINT "_contact_form_v_version_project_type_options_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_project_type_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_features_options" ADD CONSTRAINT "_contact_form_v_version_features_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_features_options_locales" ADD CONSTRAINT "_contact_form_v_version_features_options_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_features_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_technologies_options" ADD CONSTRAINT "_contact_form_v_version_technologies_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_technologies_options_locales" ADD CONSTRAINT "_contact_form_v_version_technologies_options_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_technologies_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_assets_options" ADD CONSTRAINT "_contact_form_v_version_assets_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_assets_options_locales" ADD CONSTRAINT "_contact_form_v_version_assets_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_assets_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_audiences_options" ADD CONSTRAINT "_contact_form_v_version_audiences_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_audiences_options_locales" ADD CONSTRAINT "_contact_form_v_version_audiences_options_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_audiences_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_hosting_options" ADD CONSTRAINT "_contact_form_v_version_hosting_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_hosting_options_locales" ADD CONSTRAINT "_contact_form_v_version_hosting_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_hosting_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_support_options" ADD CONSTRAINT "_contact_form_v_version_support_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_support_options_locales" ADD CONSTRAINT "_contact_form_v_version_support_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_support_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_legals_options" ADD CONSTRAINT "_contact_form_v_version_legals_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_legals_options_locales" ADD CONSTRAINT "_contact_form_v_version_legals_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_legals_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_priority_options" ADD CONSTRAINT "_contact_form_v_version_priority_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_priority_options_locales" ADD CONSTRAINT "_contact_form_v_version_priority_options_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_priority_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_locales" ADD CONSTRAINT "_contact_form_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_impact_order_idx" ON "projects_impact" USING btree ("_order");
  CREATE INDEX "projects_impact_parent_id_idx" ON "projects_impact" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_impact_locales_locale_parent_id_unique" ON "projects_impact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_contributions_order_idx" ON "projects_contributions" USING btree ("_order");
  CREATE INDEX "projects_contributions_parent_id_idx" ON "projects_contributions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_contributions_locales_locale_parent_id_unique" ON "projects_contributions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_thumbnail_idx" ON "projects" USING btree ("thumbnail_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "projects_texts_locale_parent" ON "projects_texts" USING btree ("locale","parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_version_impact_order_idx" ON "_projects_v_version_impact" USING btree ("_order");
  CREATE INDEX "_projects_v_version_impact_parent_id_idx" ON "_projects_v_version_impact" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_impact_locales_locale_parent_id_unique" ON "_projects_v_version_impact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_contributions_order_idx" ON "_projects_v_version_contributions" USING btree ("_order");
  CREATE INDEX "_projects_v_version_contributions_parent_id_idx" ON "_projects_v_version_contributions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_contributions_locales_locale_parent_id_u" ON "_projects_v_version_contributions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_thumbnail_idx" ON "_projects_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_texts_order_parent" ON "_projects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_projects_v_texts_locale_parent" ON "_projects_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_thumbnail_idx" ON "posts" USING btree ("thumbnail_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_thumbnail_idx" ON "_posts_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "experience_highlights_order_idx" ON "experience_highlights" USING btree ("_order");
  CREATE INDEX "experience_highlights_parent_id_idx" ON "experience_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "experience_highlights_locales_locale_parent_id_unique" ON "experience_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experience_chips_order_idx" ON "experience_chips" USING btree ("_order");
  CREATE INDEX "experience_chips_parent_id_idx" ON "experience_chips" USING btree ("_parent_id");
  CREATE INDEX "experience_updated_at_idx" ON "experience" USING btree ("updated_at");
  CREATE INDEX "experience_created_at_idx" ON "experience" USING btree ("created_at");
  CREATE INDEX "experience__status_idx" ON "experience" USING btree ("_status");
  CREATE UNIQUE INDEX "experience_locales_locale_parent_id_unique" ON "experience_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_texts_order_parent" ON "services_texts" USING btree ("order","parent_id");
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
  CREATE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_experience_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_taglines_order_idx" ON "home_taglines" USING btree ("_order");
  CREATE INDEX "home_taglines_parent_id_idx" ON "home_taglines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_taglines_locales_locale_parent_id_unique" ON "home_taglines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_stats_locales_locale_parent_id_unique" ON "home_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_portrait_idx" ON "home" USING btree ("portrait_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_meta_meta_image_idx" ON "home_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_taglines_order_idx" ON "_home_v_version_taglines" USING btree ("_order");
  CREATE INDEX "_home_v_version_taglines_parent_id_idx" ON "_home_v_version_taglines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_v_version_taglines_locales_locale_parent_id_unique" ON "_home_v_version_taglines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_stats_order_idx" ON "_home_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_stats_parent_id_idx" ON "_home_v_version_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_v_version_stats_locales_locale_parent_id_unique" ON "_home_v_version_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_version_portrait_idx" ON "_home_v" USING btree ("version_portrait_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_snapshot_idx" ON "_home_v" USING btree ("snapshot");
  CREATE INDEX "_home_v_published_locale_idx" ON "_home_v" USING btree ("published_locale");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_version_meta_version_meta_image_idx" ON "_home_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_home_v_locales_locale_parent_id_unique" ON "_home_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resume_impact_order_idx" ON "resume_impact" USING btree ("_order");
  CREATE INDEX "resume_impact_parent_id_idx" ON "resume_impact" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "resume_impact_locales_locale_parent_id_unique" ON "resume_impact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resume_skill_groups_skills_order_idx" ON "resume_skill_groups_skills" USING btree ("_order");
  CREATE INDEX "resume_skill_groups_skills_parent_id_idx" ON "resume_skill_groups_skills" USING btree ("_parent_id");
  CREATE INDEX "resume_skill_groups_order_idx" ON "resume_skill_groups" USING btree ("_order");
  CREATE INDEX "resume_skill_groups_parent_id_idx" ON "resume_skill_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "resume_skill_groups_locales_locale_parent_id_unique" ON "resume_skill_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resume_portrait_idx" ON "resume" USING btree ("portrait_id");
  CREATE INDEX "resume_cv_idx" ON "resume" USING btree ("cv_id");
  CREATE INDEX "resume__status_idx" ON "resume" USING btree ("_status");
  CREATE INDEX "resume_meta_meta_image_idx" ON "resume_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "resume_locales_locale_parent_id_unique" ON "resume_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_resume_v_version_impact_order_idx" ON "_resume_v_version_impact" USING btree ("_order");
  CREATE INDEX "_resume_v_version_impact_parent_id_idx" ON "_resume_v_version_impact" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_resume_v_version_impact_locales_locale_parent_id_unique" ON "_resume_v_version_impact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_resume_v_version_skill_groups_skills_order_idx" ON "_resume_v_version_skill_groups_skills" USING btree ("_order");
  CREATE INDEX "_resume_v_version_skill_groups_skills_parent_id_idx" ON "_resume_v_version_skill_groups_skills" USING btree ("_parent_id");
  CREATE INDEX "_resume_v_version_skill_groups_order_idx" ON "_resume_v_version_skill_groups" USING btree ("_order");
  CREATE INDEX "_resume_v_version_skill_groups_parent_id_idx" ON "_resume_v_version_skill_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_resume_v_version_skill_groups_locales_locale_parent_id_uniq" ON "_resume_v_version_skill_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_resume_v_version_version_portrait_idx" ON "_resume_v" USING btree ("version_portrait_id");
  CREATE INDEX "_resume_v_version_version_cv_idx" ON "_resume_v" USING btree ("version_cv_id");
  CREATE INDEX "_resume_v_version_version__status_idx" ON "_resume_v" USING btree ("version__status");
  CREATE INDEX "_resume_v_created_at_idx" ON "_resume_v" USING btree ("created_at");
  CREATE INDEX "_resume_v_updated_at_idx" ON "_resume_v" USING btree ("updated_at");
  CREATE INDEX "_resume_v_snapshot_idx" ON "_resume_v" USING btree ("snapshot");
  CREATE INDEX "_resume_v_published_locale_idx" ON "_resume_v" USING btree ("published_locale");
  CREATE INDEX "_resume_v_latest_idx" ON "_resume_v" USING btree ("latest");
  CREATE INDEX "_resume_v_version_meta_version_meta_image_idx" ON "_resume_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_resume_v_locales_locale_parent_id_unique" ON "_resume_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blog_meta_meta_image_idx" ON "blog_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "blog_locales_locale_parent_id_unique" ON "blog_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_blog_v_created_at_idx" ON "_blog_v" USING btree ("created_at");
  CREATE INDEX "_blog_v_updated_at_idx" ON "_blog_v" USING btree ("updated_at");
  CREATE INDEX "_blog_v_version_meta_version_meta_image_idx" ON "_blog_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_blog_v_locales_locale_parent_id_unique" ON "_blog_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_meta_meta_image_idx" ON "contact_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "contact_locales_locale_parent_id_unique" ON "contact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_v_created_at_idx" ON "_contact_v" USING btree ("created_at");
  CREATE INDEX "_contact_v_updated_at_idx" ON "_contact_v" USING btree ("updated_at");
  CREATE INDEX "_contact_v_version_meta_version_meta_image_idx" ON "_contact_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_contact_v_locales_locale_parent_id_unique" ON "_contact_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "project_page_locales_locale_parent_id_unique" ON "project_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_project_page_v_created_at_idx" ON "_project_page_v" USING btree ("created_at");
  CREATE INDEX "_project_page_v_updated_at_idx" ON "_project_page_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_project_page_v_locales_locale_parent_id_unique" ON "_project_page_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacy__status_idx" ON "privacy" USING btree ("_status");
  CREATE INDEX "privacy_meta_meta_image_idx" ON "privacy_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "privacy_locales_locale_parent_id_unique" ON "privacy_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_privacy_v_version_version__status_idx" ON "_privacy_v" USING btree ("version__status");
  CREATE INDEX "_privacy_v_created_at_idx" ON "_privacy_v" USING btree ("created_at");
  CREATE INDEX "_privacy_v_updated_at_idx" ON "_privacy_v" USING btree ("updated_at");
  CREATE INDEX "_privacy_v_snapshot_idx" ON "_privacy_v" USING btree ("snapshot");
  CREATE INDEX "_privacy_v_published_locale_idx" ON "_privacy_v" USING btree ("published_locale");
  CREATE INDEX "_privacy_v_latest_idx" ON "_privacy_v" USING btree ("latest");
  CREATE INDEX "_privacy_v_version_meta_version_meta_image_idx" ON "_privacy_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_privacy_v_locales_locale_parent_id_unique" ON "_privacy_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms__status_idx" ON "terms" USING btree ("_status");
  CREATE INDEX "terms_meta_meta_image_idx" ON "terms_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "terms_locales_locale_parent_id_unique" ON "terms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_version_version__status_idx" ON "_terms_v" USING btree ("version__status");
  CREATE INDEX "_terms_v_created_at_idx" ON "_terms_v" USING btree ("created_at");
  CREATE INDEX "_terms_v_updated_at_idx" ON "_terms_v" USING btree ("updated_at");
  CREATE INDEX "_terms_v_snapshot_idx" ON "_terms_v" USING btree ("snapshot");
  CREATE INDEX "_terms_v_published_locale_idx" ON "_terms_v" USING btree ("published_locale");
  CREATE INDEX "_terms_v_latest_idx" ON "_terms_v" USING btree ("latest");
  CREATE INDEX "_terms_v_version_meta_version_meta_image_idx" ON "_terms_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_terms_v_locales_locale_parent_id_unique" ON "_terms_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "errors_messages_order_idx" ON "errors_messages" USING btree ("_order");
  CREATE INDEX "errors_messages_parent_id_idx" ON "errors_messages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "errors_messages_locales_locale_parent_id_unique" ON "errors_messages_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "errors_locales_locale_parent_id_unique" ON "errors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_errors_v_version_messages_order_idx" ON "_errors_v_version_messages" USING btree ("_order");
  CREATE INDEX "_errors_v_version_messages_parent_id_idx" ON "_errors_v_version_messages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_errors_v_version_messages_locales_locale_parent_id_unique" ON "_errors_v_version_messages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_errors_v_created_at_idx" ON "_errors_v" USING btree ("created_at");
  CREATE INDEX "_errors_v_updated_at_idx" ON "_errors_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_errors_v_locales_locale_parent_id_unique" ON "_errors_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_items_order_idx" ON "_navigation_v_version_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_items_parent_id_idx" ON "_navigation_v_version_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_items_locales_locale_parent_id_unique" ON "_navigation_v_version_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_navigation_v_locales_locale_parent_id_unique" ON "_navigation_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_links_order_idx" ON "footer_links" USING btree ("_order");
  CREATE INDEX "footer_links_parent_id_idx" ON "footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_links_locales_locale_parent_id_unique" ON "footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_links_order_idx" ON "_footer_v_version_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_links_parent_id_idx" ON "_footer_v_version_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_links_locales_locale_parent_id_unique" ON "_footer_v_version_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_footer_v_locales_locale_parent_id_unique" ON "_footer_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_alumni_of_order_idx" ON "site_alumni_of" USING btree ("_order");
  CREATE INDEX "site_alumni_of_parent_id_idx" ON "site_alumni_of" USING btree ("_parent_id");
  CREATE INDEX "site_services_order_idx" ON "site_services" USING btree ("_order");
  CREATE INDEX "site_services_parent_id_idx" ON "site_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_services_locales_locale_parent_id_unique" ON "site_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_image_idx" ON "site" USING btree ("image_id");
  CREATE INDEX "site_portrait_idx" ON "site" USING btree ("portrait_id");
  CREATE UNIQUE INDEX "site_locales_locale_parent_id_unique" ON "site_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_texts_order_parent" ON "site_texts" USING btree ("order","parent_id");
  CREATE INDEX "_site_v_version_alumni_of_order_idx" ON "_site_v_version_alumni_of" USING btree ("_order");
  CREATE INDEX "_site_v_version_alumni_of_parent_id_idx" ON "_site_v_version_alumni_of" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_services_order_idx" ON "_site_v_version_services" USING btree ("_order");
  CREATE INDEX "_site_v_version_services_parent_id_idx" ON "_site_v_version_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_v_version_services_locales_locale_parent_id_unique" ON "_site_v_version_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_v_version_version_image_idx" ON "_site_v" USING btree ("version_image_id");
  CREATE INDEX "_site_v_version_version_portrait_idx" ON "_site_v" USING btree ("version_portrait_id");
  CREATE INDEX "_site_v_created_at_idx" ON "_site_v" USING btree ("created_at");
  CREATE INDEX "_site_v_updated_at_idx" ON "_site_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_site_v_locales_locale_parent_id_unique" ON "_site_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_v_texts_order_parent" ON "_site_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "contact_form_project_type_options_order_idx" ON "contact_form_project_type_options" USING btree ("_order");
  CREATE INDEX "contact_form_project_type_options_parent_id_idx" ON "contact_form_project_type_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_project_type_options_locales_locale_parent_id_u" ON "contact_form_project_type_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_features_options_order_idx" ON "contact_form_features_options" USING btree ("_order");
  CREATE INDEX "contact_form_features_options_parent_id_idx" ON "contact_form_features_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_features_options_locales_locale_parent_id_uniqu" ON "contact_form_features_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_technologies_options_order_idx" ON "contact_form_technologies_options" USING btree ("_order");
  CREATE INDEX "contact_form_technologies_options_parent_id_idx" ON "contact_form_technologies_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_technologies_options_locales_locale_parent_id_u" ON "contact_form_technologies_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_assets_options_order_idx" ON "contact_form_assets_options" USING btree ("_order");
  CREATE INDEX "contact_form_assets_options_parent_id_idx" ON "contact_form_assets_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_assets_options_locales_locale_parent_id_unique" ON "contact_form_assets_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_audiences_options_order_idx" ON "contact_form_audiences_options" USING btree ("_order");
  CREATE INDEX "contact_form_audiences_options_parent_id_idx" ON "contact_form_audiences_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_audiences_options_locales_locale_parent_id_uniq" ON "contact_form_audiences_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_hosting_options_order_idx" ON "contact_form_hosting_options" USING btree ("_order");
  CREATE INDEX "contact_form_hosting_options_parent_id_idx" ON "contact_form_hosting_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_hosting_options_locales_locale_parent_id_unique" ON "contact_form_hosting_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_support_options_order_idx" ON "contact_form_support_options" USING btree ("_order");
  CREATE INDEX "contact_form_support_options_parent_id_idx" ON "contact_form_support_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_support_options_locales_locale_parent_id_unique" ON "contact_form_support_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_legals_options_order_idx" ON "contact_form_legals_options" USING btree ("_order");
  CREATE INDEX "contact_form_legals_options_parent_id_idx" ON "contact_form_legals_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_legals_options_locales_locale_parent_id_unique" ON "contact_form_legals_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_priority_options_order_idx" ON "contact_form_priority_options" USING btree ("_order");
  CREATE INDEX "contact_form_priority_options_parent_id_idx" ON "contact_form_priority_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_priority_options_locales_locale_parent_id_uniqu" ON "contact_form_priority_options_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_form_locales_locale_parent_id_unique" ON "contact_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_project_type_options_order_idx" ON "_contact_form_v_version_project_type_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_project_type_options_parent_id_idx" ON "_contact_form_v_version_project_type_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_project_type_options_locales_locale_" ON "_contact_form_v_version_project_type_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_features_options_order_idx" ON "_contact_form_v_version_features_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_features_options_parent_id_idx" ON "_contact_form_v_version_features_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_features_options_locales_locale_pare" ON "_contact_form_v_version_features_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_technologies_options_order_idx" ON "_contact_form_v_version_technologies_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_technologies_options_parent_id_idx" ON "_contact_form_v_version_technologies_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_technologies_options_locales_locale_" ON "_contact_form_v_version_technologies_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_assets_options_order_idx" ON "_contact_form_v_version_assets_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_assets_options_parent_id_idx" ON "_contact_form_v_version_assets_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_assets_options_locales_locale_parent" ON "_contact_form_v_version_assets_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_audiences_options_order_idx" ON "_contact_form_v_version_audiences_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_audiences_options_parent_id_idx" ON "_contact_form_v_version_audiences_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_audiences_options_locales_locale_par" ON "_contact_form_v_version_audiences_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_hosting_options_order_idx" ON "_contact_form_v_version_hosting_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_hosting_options_parent_id_idx" ON "_contact_form_v_version_hosting_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_hosting_options_locales_locale_paren" ON "_contact_form_v_version_hosting_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_support_options_order_idx" ON "_contact_form_v_version_support_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_support_options_parent_id_idx" ON "_contact_form_v_version_support_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_support_options_locales_locale_paren" ON "_contact_form_v_version_support_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_legals_options_order_idx" ON "_contact_form_v_version_legals_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_legals_options_parent_id_idx" ON "_contact_form_v_version_legals_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_legals_options_locales_locale_parent" ON "_contact_form_v_version_legals_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_priority_options_order_idx" ON "_contact_form_v_version_priority_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_priority_options_parent_id_idx" ON "_contact_form_v_version_priority_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_priority_options_locales_locale_pare" ON "_contact_form_v_version_priority_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_created_at_idx" ON "_contact_form_v" USING btree ("created_at");
  CREATE INDEX "_contact_form_v_updated_at_idx" ON "_contact_form_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_contact_form_v_locales_locale_parent_id_unique" ON "_contact_form_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_impact" CASCADE;
  DROP TABLE "projects_impact_locales" CASCADE;
  DROP TABLE "projects_contributions" CASCADE;
  DROP TABLE "projects_contributions_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_impact" CASCADE;
  DROP TABLE "_projects_v_version_impact_locales" CASCADE;
  DROP TABLE "_projects_v_version_contributions" CASCADE;
  DROP TABLE "_projects_v_version_contributions_locales" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_texts" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  DROP TABLE "experience_highlights" CASCADE;
  DROP TABLE "experience_highlights_locales" CASCADE;
  DROP TABLE "experience_chips" CASCADE;
  DROP TABLE "experience" CASCADE;
  DROP TABLE "experience_locales" CASCADE;
  DROP TABLE "_experience_v_version_highlights" CASCADE;
  DROP TABLE "_experience_v_version_highlights_locales" CASCADE;
  DROP TABLE "_experience_v_version_chips" CASCADE;
  DROP TABLE "_experience_v" CASCADE;
  DROP TABLE "_experience_v_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_texts" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_taglines" CASCADE;
  DROP TABLE "home_taglines_locales" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home_stats_locales" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "_home_v_version_taglines" CASCADE;
  DROP TABLE "_home_v_version_taglines_locales" CASCADE;
  DROP TABLE "_home_v_version_stats" CASCADE;
  DROP TABLE "_home_v_version_stats_locales" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_locales" CASCADE;
  DROP TABLE "resume_impact" CASCADE;
  DROP TABLE "resume_impact_locales" CASCADE;
  DROP TABLE "resume_skill_groups_skills" CASCADE;
  DROP TABLE "resume_skill_groups" CASCADE;
  DROP TABLE "resume_skill_groups_locales" CASCADE;
  DROP TABLE "resume" CASCADE;
  DROP TABLE "resume_locales" CASCADE;
  DROP TABLE "_resume_v_version_impact" CASCADE;
  DROP TABLE "_resume_v_version_impact_locales" CASCADE;
  DROP TABLE "_resume_v_version_skill_groups_skills" CASCADE;
  DROP TABLE "_resume_v_version_skill_groups" CASCADE;
  DROP TABLE "_resume_v_version_skill_groups_locales" CASCADE;
  DROP TABLE "_resume_v" CASCADE;
  DROP TABLE "_resume_v_locales" CASCADE;
  DROP TABLE "blog" CASCADE;
  DROP TABLE "blog_locales" CASCADE;
  DROP TABLE "_blog_v" CASCADE;
  DROP TABLE "_blog_v_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "contact_locales" CASCADE;
  DROP TABLE "_contact_v" CASCADE;
  DROP TABLE "_contact_v_locales" CASCADE;
  DROP TABLE "project_page" CASCADE;
  DROP TABLE "project_page_locales" CASCADE;
  DROP TABLE "_project_page_v" CASCADE;
  DROP TABLE "_project_page_v_locales" CASCADE;
  DROP TABLE "privacy" CASCADE;
  DROP TABLE "privacy_locales" CASCADE;
  DROP TABLE "_privacy_v" CASCADE;
  DROP TABLE "_privacy_v_locales" CASCADE;
  DROP TABLE "terms" CASCADE;
  DROP TABLE "terms_locales" CASCADE;
  DROP TABLE "_terms_v" CASCADE;
  DROP TABLE "_terms_v_locales" CASCADE;
  DROP TABLE "errors_messages" CASCADE;
  DROP TABLE "errors_messages_locales" CASCADE;
  DROP TABLE "errors" CASCADE;
  DROP TABLE "errors_locales" CASCADE;
  DROP TABLE "_errors_v_version_messages" CASCADE;
  DROP TABLE "_errors_v_version_messages_locales" CASCADE;
  DROP TABLE "_errors_v" CASCADE;
  DROP TABLE "_errors_v_locales" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "_navigation_v_version_items" CASCADE;
  DROP TABLE "_navigation_v_version_items_locales" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_navigation_v_locales" CASCADE;
  DROP TABLE "footer_links" CASCADE;
  DROP TABLE "footer_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "_footer_v_version_links" CASCADE;
  DROP TABLE "_footer_v_version_links_locales" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_footer_v_locales" CASCADE;
  DROP TABLE "site_alumni_of" CASCADE;
  DROP TABLE "site_services" CASCADE;
  DROP TABLE "site_services_locales" CASCADE;
  DROP TABLE "site" CASCADE;
  DROP TABLE "site_locales" CASCADE;
  DROP TABLE "site_texts" CASCADE;
  DROP TABLE "_site_v_version_alumni_of" CASCADE;
  DROP TABLE "_site_v_version_services" CASCADE;
  DROP TABLE "_site_v_version_services_locales" CASCADE;
  DROP TABLE "_site_v" CASCADE;
  DROP TABLE "_site_v_locales" CASCADE;
  DROP TABLE "_site_v_texts" CASCADE;
  DROP TABLE "contact_form_project_type_options" CASCADE;
  DROP TABLE "contact_form_project_type_options_locales" CASCADE;
  DROP TABLE "contact_form_features_options" CASCADE;
  DROP TABLE "contact_form_features_options_locales" CASCADE;
  DROP TABLE "contact_form_technologies_options" CASCADE;
  DROP TABLE "contact_form_technologies_options_locales" CASCADE;
  DROP TABLE "contact_form_assets_options" CASCADE;
  DROP TABLE "contact_form_assets_options_locales" CASCADE;
  DROP TABLE "contact_form_audiences_options" CASCADE;
  DROP TABLE "contact_form_audiences_options_locales" CASCADE;
  DROP TABLE "contact_form_hosting_options" CASCADE;
  DROP TABLE "contact_form_hosting_options_locales" CASCADE;
  DROP TABLE "contact_form_support_options" CASCADE;
  DROP TABLE "contact_form_support_options_locales" CASCADE;
  DROP TABLE "contact_form_legals_options" CASCADE;
  DROP TABLE "contact_form_legals_options_locales" CASCADE;
  DROP TABLE "contact_form_priority_options" CASCADE;
  DROP TABLE "contact_form_priority_options_locales" CASCADE;
  DROP TABLE "contact_form" CASCADE;
  DROP TABLE "contact_form_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_project_type_options" CASCADE;
  DROP TABLE "_contact_form_v_version_project_type_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_features_options" CASCADE;
  DROP TABLE "_contact_form_v_version_features_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_technologies_options" CASCADE;
  DROP TABLE "_contact_form_v_version_technologies_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_assets_options" CASCADE;
  DROP TABLE "_contact_form_v_version_assets_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_audiences_options" CASCADE;
  DROP TABLE "_contact_form_v_version_audiences_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_hosting_options" CASCADE;
  DROP TABLE "_contact_form_v_version_hosting_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_support_options" CASCADE;
  DROP TABLE "_contact_form_v_version_support_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_legals_options" CASCADE;
  DROP TABLE "_contact_form_v_version_legals_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_priority_options" CASCADE;
  DROP TABLE "_contact_form_v_version_priority_options_locales" CASCADE;
  DROP TABLE "_contact_form_v" CASCADE;
  DROP TABLE "_contact_form_v_locales" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_layout";
  DROP TYPE "public"."enum_projects_card_size";
  DROP TYPE "public"."enum_projects_card_cta";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_layout";
  DROP TYPE "public"."enum__projects_v_version_card_size";
  DROP TYPE "public"."enum__projects_v_version_card_cta";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_experience_kind";
  DROP TYPE "public"."enum_experience_status";
  DROP TYPE "public"."enum__experience_v_version_kind";
  DROP TYPE "public"."enum__experience_v_version_status";
  DROP TYPE "public"."enum__experience_v_published_locale";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum__home_v_published_locale";
  DROP TYPE "public"."enum_resume_impact_style";
  DROP TYPE "public"."enum_resume_status";
  DROP TYPE "public"."enum__resume_v_version_impact_style";
  DROP TYPE "public"."enum__resume_v_version_status";
  DROP TYPE "public"."enum__resume_v_published_locale";
  DROP TYPE "public"."enum_privacy_status";
  DROP TYPE "public"."enum__privacy_v_version_status";
  DROP TYPE "public"."enum__privacy_v_published_locale";
  DROP TYPE "public"."enum_terms_status";
  DROP TYPE "public"."enum__terms_v_version_status";
  DROP TYPE "public"."enum__terms_v_published_locale";
  DROP TYPE "public"."enum_navigation_items_match";
  DROP TYPE "public"."enum__navigation_v_version_items_match";`)
}
