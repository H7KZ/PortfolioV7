import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_architecture_edges_kind" AS ENUM('request', 'sync', 'async');
  CREATE TYPE "public"."enum__projects_v_version_architecture_edges_kind" AS ENUM('request', 'sync', 'async');
  CREATE TYPE "public"."enum_testimonials_quote_language" AS ENUM('en', 'cs');
  CREATE TYPE "public"."enum__testimonials_v_version_quote_language" AS ENUM('en', 'cs');
  CREATE TABLE "projects_screens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"path" varchar
  );
  
  CREATE TABLE "projects_screens_locales" (
  	"placeholder_label" varchar,
  	"placeholder_spec" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_architecture_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"external" boolean
  );
  
  CREATE TABLE "projects_architecture_nodes_locales" (
  	"name" varchar,
  	"tech" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_architecture_edges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar,
  	"kind" "enum_projects_architecture_edges_kind" DEFAULT 'sync',
  	"bidirectional" boolean
  );
  
  CREATE TABLE "projects_architecture_edges_locales" (
  	"label" varchar,
  	"label_short" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_screens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"path" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_screens_locales" (
  	"placeholder_label" varchar,
  	"placeholder_spec" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_architecture_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"external" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_architecture_nodes_locales" (
  	"name" varchar,
  	"tech" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_architecture_edges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar,
  	"kind" "enum__projects_v_version_architecture_edges_kind" DEFAULT 'sync',
  	"bidirectional" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_architecture_edges_locales" (
  	"label" varchar,
  	"label_short" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_now_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_now_items_locales" (
  	"key" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_more_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"external" boolean
  );
  
  CREATE TABLE "home_more_items_locales" (
  	"meta" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_home_v_version_now_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_now_items_locales" (
  	"key" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v_version_more_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"external" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_more_items_locales" (
  	"meta" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "resume_skill_groups_skills_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_resume_v_version_skill_groups_skills_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "errors_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "errors_suggestions_locales" (
  	"label" varchar NOT NULL,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_errors_v_version_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_errors_v_version_suggestions_locales" (
  	"label" varchar NOT NULL,
  	"sub" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_mobile_menu_extra_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_mobile_menu_extra_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_navigation_v_version_mobile_menu_extra_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_mobile_menu_extra_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_cta_terminal_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"href" varchar,
  	"live" boolean
  );
  
  CREATE TABLE "footer_cta_terminal_rows_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_cta_terminal_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"href" varchar,
  	"live" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_cta_terminal_rows_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_form_budget_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "contact_form_budget_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_contact_form_v_version_budget_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_form_v_version_budget_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "projects" ADD COLUMN "hero_path" varchar;
  ALTER TABLE "projects" ADD COLUMN "card_year" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "kicker" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "hero_placeholder_label" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "hero_placeholder_spec" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_legend_request" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_legend_sync" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_legend_async" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_observability" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_caption" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "architecture_text_alternative" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "card_meta" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_hero_path" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_card_year" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_kicker" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_hero_placeholder_label" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_hero_placeholder_spec" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_legend_request" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_legend_sync" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_legend_async" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_observability" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_caption" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_architecture_text_alternative" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_card_meta" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "show" boolean DEFAULT true;
  ALTER TABLE "testimonials" ADD COLUMN "quote_language" "enum_testimonials_quote_language" DEFAULT 'en';
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_show" boolean DEFAULT true;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_quote_language" "enum__testimonials_v_version_quote_language" DEFAULT 'en';
  ALTER TABLE "services_locales" ADD COLUMN "label" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_label" varchar;
  ALTER TABLE "media" ADD COLUMN "formats" jsonb;
  ALTER TABLE "contact_submissions" ADD COLUMN "budget_range" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "eyebrow_command" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "headline" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portrait_caption_user" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portrait_caption_path" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portrait_caption_note" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "more_heading" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "more_sub" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_eyebrow_command" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_headline" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portrait_caption_user" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portrait_caption_path" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portrait_caption_note" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_more_heading" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_more_sub" varchar;
  ALTER TABLE "resume_locales" ADD COLUMN "primary_skill_label" varchar;
  ALTER TABLE "_resume_v_locales" ADD COLUMN "version_primary_skill_label" varchar;
  ALTER TABLE "blog_locales" ADD COLUMN "lead" varchar;
  ALTER TABLE "blog_locales" ADD COLUMN "read_label" varchar;
  ALTER TABLE "blog_locales" ADD COLUMN "drafting_label" varchar;
  ALTER TABLE "blog_locales" ADD COLUMN "next_up_text" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_lead" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_read_label" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_drafting_label" varchar;
  ALTER TABLE "_blog_v_locales" ADD COLUMN "version_next_up_text" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "email_sub" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "brief_sent_label" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "skip_form_cta" varchar;
  ALTER TABLE "_contact_v_locales" ADD COLUMN "version_email_sub" varchar;
  ALTER TABLE "_contact_v_locales" ADD COLUMN "version_brief_sent_label" varchar;
  ALTER TABLE "_contact_v_locales" ADD COLUMN "version_skip_form_cta" varchar;
  ALTER TABLE "project_page_locales" ADD COLUMN "architecture_label" varchar;
  ALTER TABLE "project_page_locales" ADD COLUMN "next_label" varchar;
  ALTER TABLE "project_page_locales" ADD COLUMN "placeholder_label" varchar;
  ALTER TABLE "_project_page_v_locales" ADD COLUMN "version_architecture_label" varchar;
  ALTER TABLE "_project_page_v_locales" ADD COLUMN "version_next_label" varchar;
  ALTER TABLE "_project_page_v_locales" ADD COLUMN "version_placeholder_label" varchar;
  ALTER TABLE "errors_locales" ADD COLUMN "code_label" varchar;
  ALTER TABLE "_errors_v_locales" ADD COLUMN "version_code_label" varchar;
  ALTER TABLE "navigation" ADD COLUMN "wordmark" varchar;
  ALTER TABLE "navigation" ADD COLUMN "mobile_menu_primary_cta_href" varchar;
  ALTER TABLE "navigation" ADD COLUMN "mobile_menu_email" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "nav_label" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "close_menu_label" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "current_label" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "language_names_en" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "language_names_cs" varchar;
  ALTER TABLE "navigation_locales" ADD COLUMN "mobile_menu_primary_cta_label" varchar;
  ALTER TABLE "_navigation_v" ADD COLUMN "version_wordmark" varchar;
  ALTER TABLE "_navigation_v" ADD COLUMN "version_mobile_menu_primary_cta_href" varchar;
  ALTER TABLE "_navigation_v" ADD COLUMN "version_mobile_menu_email" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_nav_label" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_close_menu_label" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_current_label" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_language_names_en" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_language_names_cs" varchar;
  ALTER TABLE "_navigation_v_locales" ADD COLUMN "version_mobile_menu_primary_cta_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_primary_cta_href" varchar;
  ALTER TABLE "footer" ADD COLUMN "cta_terminal_prompt" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "cta_title_accent" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "cta_body" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "cta_primary_cta_label" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "cta_secondary_cta_label" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "copyright" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_primary_cta_href" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_terminal_prompt" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_cta_title" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_cta_title_accent" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_cta_body" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_cta_primary_cta_label" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_cta_secondary_cta_label" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_copyright" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "new_tab_label" varchar;
  ALTER TABLE "_site_v_locales" ADD COLUMN "version_new_tab_label" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "message_placeholder_short" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "budget_hint" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "advanced_hint" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "privacy_note" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "success_title" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "success_title_no_name" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "success_body" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "success_send_another_label" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "validation_summary_one" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "validation_summary_many" varchar;
  ALTER TABLE "contact_form_locales" ADD COLUMN "validation_too_short" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_message_placeholder_short" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_budget_hint" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_advanced_hint" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_privacy_note" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_success_title" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_success_title_no_name" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_success_body" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_success_send_another_label" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_validation_summary_one" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_validation_summary_many" varchar;
  ALTER TABLE "_contact_form_v_locales" ADD COLUMN "version_validation_too_short" varchar;
  ALTER TABLE "projects_screens" ADD CONSTRAINT "projects_screens_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_screens" ADD CONSTRAINT "projects_screens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_screens_locales" ADD CONSTRAINT "projects_screens_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_screens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_architecture_nodes" ADD CONSTRAINT "projects_architecture_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_architecture_nodes_locales" ADD CONSTRAINT "projects_architecture_nodes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_architecture_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_architecture_edges" ADD CONSTRAINT "projects_architecture_edges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_architecture_edges_locales" ADD CONSTRAINT "projects_architecture_edges_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_architecture_edges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_screens" ADD CONSTRAINT "_projects_v_version_screens_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_screens" ADD CONSTRAINT "_projects_v_version_screens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_screens_locales" ADD CONSTRAINT "_projects_v_version_screens_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_screens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_architecture_nodes" ADD CONSTRAINT "_projects_v_version_architecture_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_architecture_nodes_locales" ADD CONSTRAINT "_projects_v_version_architecture_nodes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_architecture_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_architecture_edges" ADD CONSTRAINT "_projects_v_version_architecture_edges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_architecture_edges_locales" ADD CONSTRAINT "_projects_v_version_architecture_edges_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_architecture_edges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_now_items" ADD CONSTRAINT "home_now_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_now_items_locales" ADD CONSTRAINT "home_now_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_now_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_more_items" ADD CONSTRAINT "home_more_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_more_items_locales" ADD CONSTRAINT "home_more_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_more_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_now_items" ADD CONSTRAINT "_home_v_version_now_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_now_items_locales" ADD CONSTRAINT "_home_v_version_now_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_now_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_more_items" ADD CONSTRAINT "_home_v_version_more_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_more_items_locales" ADD CONSTRAINT "_home_v_version_more_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_more_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resume_skill_groups_skills_locales" ADD CONSTRAINT "resume_skill_groups_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_skill_groups_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resume_v_version_skill_groups_skills_locales" ADD CONSTRAINT "_resume_v_version_skill_groups_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_v_version_skill_groups_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "errors_suggestions" ADD CONSTRAINT "errors_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."errors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "errors_suggestions_locales" ADD CONSTRAINT "errors_suggestions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."errors_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_errors_v_version_suggestions" ADD CONSTRAINT "_errors_v_version_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_errors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_errors_v_version_suggestions_locales" ADD CONSTRAINT "_errors_v_version_suggestions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_errors_v_version_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile_menu_extra_items" ADD CONSTRAINT "navigation_mobile_menu_extra_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile_menu_extra_items_locales" ADD CONSTRAINT "navigation_mobile_menu_extra_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_mobile_menu_extra_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile_menu_extra_items" ADD CONSTRAINT "_navigation_v_version_mobile_menu_extra_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile_menu_extra_items_locales" ADD CONSTRAINT "_navigation_v_version_mobile_menu_extra_items_locales_par_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_mobile_menu_extra_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_cta_terminal_rows" ADD CONSTRAINT "footer_cta_terminal_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_cta_terminal_rows_locales" ADD CONSTRAINT "footer_cta_terminal_rows_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_cta_terminal_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_cta_terminal_rows" ADD CONSTRAINT "_footer_v_version_cta_terminal_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_cta_terminal_rows_locales" ADD CONSTRAINT "_footer_v_version_cta_terminal_rows_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_cta_terminal_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_budget_options" ADD CONSTRAINT "contact_form_budget_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_form_budget_options_locales" ADD CONSTRAINT "contact_form_budget_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_form_budget_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_budget_options" ADD CONSTRAINT "_contact_form_v_version_budget_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_form_v_version_budget_options_locales" ADD CONSTRAINT "_contact_form_v_version_budget_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_form_v_version_budget_options"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_screens_order_idx" ON "projects_screens" USING btree ("_order");
  CREATE INDEX "projects_screens_parent_id_idx" ON "projects_screens" USING btree ("_parent_id");
  CREATE INDEX "projects_screens_image_idx" ON "projects_screens" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_screens_locales_locale_parent_id_unique" ON "projects_screens_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_architecture_nodes_order_idx" ON "projects_architecture_nodes" USING btree ("_order");
  CREATE INDEX "projects_architecture_nodes_parent_id_idx" ON "projects_architecture_nodes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_architecture_nodes_locales_locale_parent_id_unique" ON "projects_architecture_nodes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_architecture_edges_order_idx" ON "projects_architecture_edges" USING btree ("_order");
  CREATE INDEX "projects_architecture_edges_parent_id_idx" ON "projects_architecture_edges" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_architecture_edges_locales_locale_parent_id_unique" ON "projects_architecture_edges_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_screens_order_idx" ON "_projects_v_version_screens" USING btree ("_order");
  CREATE INDEX "_projects_v_version_screens_parent_id_idx" ON "_projects_v_version_screens" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_screens_image_idx" ON "_projects_v_version_screens" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_version_screens_locales_locale_parent_id_unique" ON "_projects_v_version_screens_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_architecture_nodes_order_idx" ON "_projects_v_version_architecture_nodes" USING btree ("_order");
  CREATE INDEX "_projects_v_version_architecture_nodes_parent_id_idx" ON "_projects_v_version_architecture_nodes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_architecture_nodes_locales_locale_parent" ON "_projects_v_version_architecture_nodes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_architecture_edges_order_idx" ON "_projects_v_version_architecture_edges" USING btree ("_order");
  CREATE INDEX "_projects_v_version_architecture_edges_parent_id_idx" ON "_projects_v_version_architecture_edges" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_architecture_edges_locales_locale_parent" ON "_projects_v_version_architecture_edges_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_now_items_order_idx" ON "home_now_items" USING btree ("_order");
  CREATE INDEX "home_now_items_parent_id_idx" ON "home_now_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_now_items_locales_locale_parent_id_unique" ON "home_now_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_more_items_order_idx" ON "home_more_items" USING btree ("_order");
  CREATE INDEX "home_more_items_parent_id_idx" ON "home_more_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_more_items_locales_locale_parent_id_unique" ON "home_more_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_now_items_order_idx" ON "_home_v_version_now_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_now_items_parent_id_idx" ON "_home_v_version_now_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_v_version_now_items_locales_locale_parent_id_unique" ON "_home_v_version_now_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_more_items_order_idx" ON "_home_v_version_more_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_more_items_parent_id_idx" ON "_home_v_version_more_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_v_version_more_items_locales_locale_parent_id_unique" ON "_home_v_version_more_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "resume_skill_groups_skills_locales_locale_parent_id_unique" ON "resume_skill_groups_skills_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_resume_v_version_skill_groups_skills_locales_locale_parent_" ON "_resume_v_version_skill_groups_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "errors_suggestions_order_idx" ON "errors_suggestions" USING btree ("_order");
  CREATE INDEX "errors_suggestions_parent_id_idx" ON "errors_suggestions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "errors_suggestions_locales_locale_parent_id_unique" ON "errors_suggestions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_errors_v_version_suggestions_order_idx" ON "_errors_v_version_suggestions" USING btree ("_order");
  CREATE INDEX "_errors_v_version_suggestions_parent_id_idx" ON "_errors_v_version_suggestions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_errors_v_version_suggestions_locales_locale_parent_id_uniqu" ON "_errors_v_version_suggestions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_mobile_menu_extra_items_order_idx" ON "navigation_mobile_menu_extra_items" USING btree ("_order");
  CREATE INDEX "navigation_mobile_menu_extra_items_parent_id_idx" ON "navigation_mobile_menu_extra_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_mobile_menu_extra_items_locales_locale_parent_id_" ON "navigation_mobile_menu_extra_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_mobile_menu_extra_items_order_idx" ON "_navigation_v_version_mobile_menu_extra_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_mobile_menu_extra_items_parent_id_idx" ON "_navigation_v_version_mobile_menu_extra_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_mobile_menu_extra_items_locales_locale" ON "_navigation_v_version_mobile_menu_extra_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_cta_terminal_rows_order_idx" ON "footer_cta_terminal_rows" USING btree ("_order");
  CREATE INDEX "footer_cta_terminal_rows_parent_id_idx" ON "footer_cta_terminal_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_cta_terminal_rows_locales_locale_parent_id_unique" ON "footer_cta_terminal_rows_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_cta_terminal_rows_order_idx" ON "_footer_v_version_cta_terminal_rows" USING btree ("_order");
  CREATE INDEX "_footer_v_version_cta_terminal_rows_parent_id_idx" ON "_footer_v_version_cta_terminal_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_cta_terminal_rows_locales_locale_parent_id" ON "_footer_v_version_cta_terminal_rows_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_form_budget_options_order_idx" ON "contact_form_budget_options" USING btree ("_order");
  CREATE INDEX "contact_form_budget_options_parent_id_idx" ON "contact_form_budget_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_form_budget_options_locales_locale_parent_id_unique" ON "contact_form_budget_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_form_v_version_budget_options_order_idx" ON "_contact_form_v_version_budget_options" USING btree ("_order");
  CREATE INDEX "_contact_form_v_version_budget_options_parent_id_idx" ON "_contact_form_v_version_budget_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_form_v_version_budget_options_locales_locale_parent" ON "_contact_form_v_version_budget_options_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "resume_skill_groups_skills" DROP COLUMN "name";
  ALTER TABLE "_resume_v_version_skill_groups_skills" DROP COLUMN "name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_screens" CASCADE;
  DROP TABLE "projects_screens_locales" CASCADE;
  DROP TABLE "projects_architecture_nodes" CASCADE;
  DROP TABLE "projects_architecture_nodes_locales" CASCADE;
  DROP TABLE "projects_architecture_edges" CASCADE;
  DROP TABLE "projects_architecture_edges_locales" CASCADE;
  DROP TABLE "_projects_v_version_screens" CASCADE;
  DROP TABLE "_projects_v_version_screens_locales" CASCADE;
  DROP TABLE "_projects_v_version_architecture_nodes" CASCADE;
  DROP TABLE "_projects_v_version_architecture_nodes_locales" CASCADE;
  DROP TABLE "_projects_v_version_architecture_edges" CASCADE;
  DROP TABLE "_projects_v_version_architecture_edges_locales" CASCADE;
  DROP TABLE "home_now_items" CASCADE;
  DROP TABLE "home_now_items_locales" CASCADE;
  DROP TABLE "home_more_items" CASCADE;
  DROP TABLE "home_more_items_locales" CASCADE;
  DROP TABLE "_home_v_version_now_items" CASCADE;
  DROP TABLE "_home_v_version_now_items_locales" CASCADE;
  DROP TABLE "_home_v_version_more_items" CASCADE;
  DROP TABLE "_home_v_version_more_items_locales" CASCADE;
  DROP TABLE "resume_skill_groups_skills_locales" CASCADE;
  DROP TABLE "_resume_v_version_skill_groups_skills_locales" CASCADE;
  DROP TABLE "errors_suggestions" CASCADE;
  DROP TABLE "errors_suggestions_locales" CASCADE;
  DROP TABLE "_errors_v_version_suggestions" CASCADE;
  DROP TABLE "_errors_v_version_suggestions_locales" CASCADE;
  DROP TABLE "navigation_mobile_menu_extra_items" CASCADE;
  DROP TABLE "navigation_mobile_menu_extra_items_locales" CASCADE;
  DROP TABLE "_navigation_v_version_mobile_menu_extra_items" CASCADE;
  DROP TABLE "_navigation_v_version_mobile_menu_extra_items_locales" CASCADE;
  DROP TABLE "footer_cta_terminal_rows" CASCADE;
  DROP TABLE "footer_cta_terminal_rows_locales" CASCADE;
  DROP TABLE "_footer_v_version_cta_terminal_rows" CASCADE;
  DROP TABLE "_footer_v_version_cta_terminal_rows_locales" CASCADE;
  DROP TABLE "contact_form_budget_options" CASCADE;
  DROP TABLE "contact_form_budget_options_locales" CASCADE;
  DROP TABLE "_contact_form_v_version_budget_options" CASCADE;
  DROP TABLE "_contact_form_v_version_budget_options_locales" CASCADE;
  ALTER TABLE "resume_skill_groups_skills" ADD COLUMN "name" varchar;
  ALTER TABLE "_resume_v_version_skill_groups_skills" ADD COLUMN "name" varchar;
  ALTER TABLE "projects" DROP COLUMN "hero_path";
  ALTER TABLE "projects" DROP COLUMN "card_year";
  ALTER TABLE "projects_locales" DROP COLUMN "kicker";
  ALTER TABLE "projects_locales" DROP COLUMN "hero_placeholder_label";
  ALTER TABLE "projects_locales" DROP COLUMN "hero_placeholder_spec";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_legend_request";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_legend_sync";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_legend_async";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_observability";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_caption";
  ALTER TABLE "projects_locales" DROP COLUMN "architecture_text_alternative";
  ALTER TABLE "projects_locales" DROP COLUMN "card_meta";
  ALTER TABLE "_projects_v" DROP COLUMN "version_hero_path";
  ALTER TABLE "_projects_v" DROP COLUMN "version_card_year";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_kicker";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_hero_placeholder_label";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_hero_placeholder_spec";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_legend_request";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_legend_sync";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_legend_async";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_observability";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_caption";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_architecture_text_alternative";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_card_meta";
  ALTER TABLE "testimonials" DROP COLUMN "show";
  ALTER TABLE "testimonials" DROP COLUMN "quote_language";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_show";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_quote_language";
  ALTER TABLE "services_locales" DROP COLUMN "label";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_label";
  ALTER TABLE "media" DROP COLUMN "formats";
  ALTER TABLE "contact_submissions" DROP COLUMN "budget_range";
  ALTER TABLE "home_locales" DROP COLUMN "eyebrow_command";
  ALTER TABLE "home_locales" DROP COLUMN "headline";
  ALTER TABLE "home_locales" DROP COLUMN "portrait_caption_user";
  ALTER TABLE "home_locales" DROP COLUMN "portrait_caption_path";
  ALTER TABLE "home_locales" DROP COLUMN "portrait_caption_note";
  ALTER TABLE "home_locales" DROP COLUMN "more_heading";
  ALTER TABLE "home_locales" DROP COLUMN "more_sub";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_eyebrow_command";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_headline";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portrait_caption_user";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portrait_caption_path";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portrait_caption_note";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_more_heading";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_more_sub";
  ALTER TABLE "resume_locales" DROP COLUMN "primary_skill_label";
  ALTER TABLE "_resume_v_locales" DROP COLUMN "version_primary_skill_label";
  ALTER TABLE "blog_locales" DROP COLUMN "lead";
  ALTER TABLE "blog_locales" DROP COLUMN "read_label";
  ALTER TABLE "blog_locales" DROP COLUMN "drafting_label";
  ALTER TABLE "blog_locales" DROP COLUMN "next_up_text";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_lead";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_read_label";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_drafting_label";
  ALTER TABLE "_blog_v_locales" DROP COLUMN "version_next_up_text";
  ALTER TABLE "contact_locales" DROP COLUMN "email_sub";
  ALTER TABLE "contact_locales" DROP COLUMN "brief_sent_label";
  ALTER TABLE "contact_locales" DROP COLUMN "skip_form_cta";
  ALTER TABLE "_contact_v_locales" DROP COLUMN "version_email_sub";
  ALTER TABLE "_contact_v_locales" DROP COLUMN "version_brief_sent_label";
  ALTER TABLE "_contact_v_locales" DROP COLUMN "version_skip_form_cta";
  ALTER TABLE "project_page_locales" DROP COLUMN "architecture_label";
  ALTER TABLE "project_page_locales" DROP COLUMN "next_label";
  ALTER TABLE "project_page_locales" DROP COLUMN "placeholder_label";
  ALTER TABLE "_project_page_v_locales" DROP COLUMN "version_architecture_label";
  ALTER TABLE "_project_page_v_locales" DROP COLUMN "version_next_label";
  ALTER TABLE "_project_page_v_locales" DROP COLUMN "version_placeholder_label";
  ALTER TABLE "errors_locales" DROP COLUMN "code_label";
  ALTER TABLE "_errors_v_locales" DROP COLUMN "version_code_label";
  ALTER TABLE "navigation" DROP COLUMN "wordmark";
  ALTER TABLE "navigation" DROP COLUMN "mobile_menu_primary_cta_href";
  ALTER TABLE "navigation" DROP COLUMN "mobile_menu_email";
  ALTER TABLE "navigation_locales" DROP COLUMN "nav_label";
  ALTER TABLE "navigation_locales" DROP COLUMN "close_menu_label";
  ALTER TABLE "navigation_locales" DROP COLUMN "current_label";
  ALTER TABLE "navigation_locales" DROP COLUMN "language_names_en";
  ALTER TABLE "navigation_locales" DROP COLUMN "language_names_cs";
  ALTER TABLE "navigation_locales" DROP COLUMN "mobile_menu_primary_cta_label";
  ALTER TABLE "_navigation_v" DROP COLUMN "version_wordmark";
  ALTER TABLE "_navigation_v" DROP COLUMN "version_mobile_menu_primary_cta_href";
  ALTER TABLE "_navigation_v" DROP COLUMN "version_mobile_menu_email";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_nav_label";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_close_menu_label";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_current_label";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_language_names_en";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_language_names_cs";
  ALTER TABLE "_navigation_v_locales" DROP COLUMN "version_mobile_menu_primary_cta_label";
  ALTER TABLE "footer" DROP COLUMN "cta_primary_cta_href";
  ALTER TABLE "footer" DROP COLUMN "cta_terminal_prompt";
  ALTER TABLE "footer_locales" DROP COLUMN "cta_title";
  ALTER TABLE "footer_locales" DROP COLUMN "cta_title_accent";
  ALTER TABLE "footer_locales" DROP COLUMN "cta_body";
  ALTER TABLE "footer_locales" DROP COLUMN "cta_primary_cta_label";
  ALTER TABLE "footer_locales" DROP COLUMN "cta_secondary_cta_label";
  ALTER TABLE "footer_locales" DROP COLUMN "copyright";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_primary_cta_href";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_terminal_prompt";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_cta_title";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_cta_title_accent";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_cta_body";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_cta_primary_cta_label";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_cta_secondary_cta_label";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_copyright";
  ALTER TABLE "site_locales" DROP COLUMN "new_tab_label";
  ALTER TABLE "_site_v_locales" DROP COLUMN "version_new_tab_label";
  ALTER TABLE "contact_form_locales" DROP COLUMN "message_placeholder_short";
  ALTER TABLE "contact_form_locales" DROP COLUMN "budget_hint";
  ALTER TABLE "contact_form_locales" DROP COLUMN "advanced_hint";
  ALTER TABLE "contact_form_locales" DROP COLUMN "privacy_note";
  ALTER TABLE "contact_form_locales" DROP COLUMN "success_title";
  ALTER TABLE "contact_form_locales" DROP COLUMN "success_title_no_name";
  ALTER TABLE "contact_form_locales" DROP COLUMN "success_body";
  ALTER TABLE "contact_form_locales" DROP COLUMN "success_send_another_label";
  ALTER TABLE "contact_form_locales" DROP COLUMN "validation_summary_one";
  ALTER TABLE "contact_form_locales" DROP COLUMN "validation_summary_many";
  ALTER TABLE "contact_form_locales" DROP COLUMN "validation_too_short";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_message_placeholder_short";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_budget_hint";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_advanced_hint";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_privacy_note";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_success_title";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_success_title_no_name";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_success_body";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_success_send_another_label";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_validation_summary_one";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_validation_summary_many";
  ALTER TABLE "_contact_form_v_locales" DROP COLUMN "version_validation_too_short";
  DROP TYPE "public"."enum_projects_architecture_edges_kind";
  DROP TYPE "public"."enum__projects_v_version_architecture_edges_kind";
  DROP TYPE "public"."enum_testimonials_quote_language";
  DROP TYPE "public"."enum__testimonials_v_version_quote_language";`)
}
