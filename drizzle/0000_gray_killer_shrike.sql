CREATE TYPE "public"."company_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('group', 'document', 'folder', 'workspace');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'expired', 'cancelled', 'trial');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'internal_user', 'external_user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('invited', 'active', 'suspended', 'revoked');--> statement-breakpoint
CREATE TABLE "businessowners_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'business_owner',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "businessowners_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" "company_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nda_text" text,
	"phone_number" text,
	CONSTRAINT "companies_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "document_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone,
	"duration_seconds" integer,
	"duration_formatted" text
);
--> statement-breakpoint
CREATE TABLE "document_edit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"metadata" jsonb,
	"changed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_redactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"visibility_mode" text NOT NULL,
	"page_ranges" jsonb DEFAULT '[]' NOT NULL,
	"total_pages" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"boxes" jsonb DEFAULT '[]',
	CONSTRAINT "document_redactions_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "document_text_redactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"selected_text" text,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"width" double precision NOT NULL,
	"height" double precision NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"folder_id" uuid,
	"uploaded_by" uuid,
	"name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dek_ref" text,
	"index" text,
	"security" text,
	"is_bookmarked" boolean,
	"is_downloaded" boolean,
	"file_data" text,
	"original_file_path" text,
	"deleted_by" uuid,
	"is_redacted" boolean DEFAULT false,
	"storage_bucket" text DEFAULT 'original-files',
	"creator_revoked" boolean DEFAULT false,
	"workspace_id" uuid
);
--> statement-breakpoint
CREATE TABLE "email_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"parent_folder_id" uuid,
	"name" text NOT NULL,
	"index_number" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"creator_revoked" boolean DEFAULT false,
	"version" integer DEFAULT 1,
	"workspace_id" uuid
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text,
	"workspace_id" uuid
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"description" text,
	"invited_by" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone DEFAULT now() + interval '7 days',
	"requires_nda" boolean DEFAULT false,
	"workspace_id" uuid,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"action" text DEFAULT 'LOGIN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"group_id" uuid,
	"document_id" uuid,
	"folder_id" uuid,
	"scope" "permission_scope" NOT NULL,
	"can_view" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"can_add_members" boolean DEFAULT false NOT NULL,
	"can_remove_members" boolean DEFAULT false NOT NULL,
	"can_create_group" boolean DEFAULT false NOT NULL,
	"can_delete_group" boolean DEFAULT false NOT NULL,
	"can_upload" boolean DEFAULT false,
	"can_download_secure" boolean DEFAULT false,
	"can_download_original" boolean DEFAULT false,
	"can_access_groups" boolean,
	"can_access_settings" boolean,
	"can_create_folder" boolean DEFAULT false,
	"can_merge_folder" boolean DEFAULT false,
	"can_delete_folder" boolean DEFAULT false,
	"can_access_branding" boolean DEFAULT false,
	"can_access_watermarks" boolean DEFAULT false,
	"can_access_documents" boolean DEFAULT false,
	"can_access_edit_permissions" boolean,
	"can_redaction" boolean DEFAULT false,
	"can_redact" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"price" text NOT NULL,
	"storage_limit_mb" integer NOT NULL,
	"users_limit" integer NOT NULL,
	"description" text,
	"features" jsonb DEFAULT '[]',
	"status" text DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qna_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender" text NOT NULL,
	"text" text NOT NULL,
	"is_user" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qna_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid,
	"subject" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"status" text DEFAULT 'Open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redacted_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"redacted_path" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "redacted_documents_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"storage_limit_mb" integer NOT NULL,
	"max_users" integer NOT NULL,
	"start_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"plan_status" "plan_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_groups" (
	"user_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "user_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'external_user' NOT NULL,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"phone_number" text,
	"company_name" text,
	"two_fa_enabled" boolean DEFAULT false,
	"nda_status" text DEFAULT 'not_required',
	"nda_accepted_at" timestamp with time zone,
	"request_status" text DEFAULT 'approved',
	"workspace_id" uuid,
	"nda_signature_path" text,
	"nda_signature_url" text,
	"nda_signature_type" varchar,
	"nda_ip_address" text,
	"nda_user_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vdr_user_overrides" (
	"user_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"is_revoked" boolean DEFAULT false,
	CONSTRAINT "vdr_user_overrides_user_id_document_id_pk" PRIMARY KEY("user_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "watermark_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"watermark_type" varchar,
	"custom_text" varchar,
	"font_size" integer,
	"text_color" varchar,
	"text_opacity" integer,
	"rotation" integer,
	"attributes" jsonb,
	"positions" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_address" varchar
);
--> statement-breakpoint
CREATE TABLE "watermark_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"watermark_type" text DEFAULT 'dynamic',
	"custom_text" text DEFAULT 'Confidential',
	"font_size" integer DEFAULT 14,
	"text_color" text DEFAULT '#64748B',
	"text_opacity" integer DEFAULT 25,
	"rotation" integer DEFAULT -30,
	"attributes" jsonb,
	"positions" jsonb,
	"logo_path" text,
	"logo_opacity" double precision DEFAULT 0.2,
	"logo_position" text DEFAULT 'middle-center',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"present" varchar,
	"email_address" varchar
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_role" text DEFAULT 'member',
	"added_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "workspace_members_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "workspace_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"company_id" uuid,
	"company_name" text NOT NULL,
	"phone" text,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"workspace_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"super_admin_name" varchar,
	"super_admin_email" varchar,
	"plan_name" varchar
);
--> statement-breakpoint
CREATE TABLE "workspace_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"brand_name" varchar,
	"logo_url" text,
	"active_theme" integer,
	"admin_name" varchar,
	"admin_email" varchar,
	"admin_phone" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_redactions" ADD CONSTRAINT "document_redactions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_text_redactions" ADD CONSTRAINT "document_text_redactions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD CONSTRAINT "qna_messages_thread_id_qna_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."qna_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redacted_documents" ADD CONSTRAINT "redacted_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_requests" ADD CONSTRAINT "workspace_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_requests" ADD CONSTRAINT "workspace_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_requests" ADD CONSTRAINT "workspace_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;