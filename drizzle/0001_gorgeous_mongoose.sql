CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid,
	"version_number" integer NOT NULL,
	"name" text NOT NULL,
	"file_path" text NOT NULL,
	"original_file_path" text NOT NULL,
	"storage_bucket" text,
	"mime_type" text,
	"file_size_bytes" bigint,
	"workspace_id" text,
	"company_id" text,
	"folder_id" text,
	"dek_ref" text NOT NULL,
	"security" text,
	"creator_revoked" boolean DEFAULT false,
	"is_redacted" boolean DEFAULT false,
	"index" text,
	"file_data" jsonb,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"upload_comment" text,
	"restored_at" timestamp with time zone,
	"restored_by" uuid
);
--> statement-breakpoint
CREATE TABLE "qna_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"workspace_id" uuid,
	"thread_id" uuid,
	"user_id" uuid,
	"user_name" varchar,
	"action_type" varchar NOT NULL,
	"details" jsonb DEFAULT '{}',
	"ip_address" varchar,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "qna_threads" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "businessowners_users" ADD COLUMN "global_storage_limit_gb" integer DEFAULT 1000;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "upload_comment" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "can_access_qa" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "can_ask_qa" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "can_answer_qa" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "can_access_nda" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "sender_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "sender_role" varchar;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "message_type" varchar DEFAULT 'internal_suggestion';--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "is_official" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "attachment_path" text;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "attachment_name" text;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "folder_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "creator_group_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "document_owner_id" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "attachment_path" text;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "attachment_name" text;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "official_answer" text;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "official_answered_by" uuid;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "official_answered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_activity_logs" ADD CONSTRAINT "qna_activity_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_activity_logs" ADD CONSTRAINT "qna_activity_logs_thread_id_qna_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."qna_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_activity_logs" ADD CONSTRAINT "qna_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_messages" ADD CONSTRAINT "qna_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_creator_group_id_groups_id_fk" FOREIGN KEY ("creator_group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_document_owner_id_users_id_fk" FOREIGN KEY ("document_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qna_threads" ADD CONSTRAINT "qna_threads_official_answered_by_users_id_fk" FOREIGN KEY ("official_answered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;