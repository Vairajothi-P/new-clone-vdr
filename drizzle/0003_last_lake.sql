CREATE TABLE "dms_deal_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teaser_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"status" text DEFAULT 'pending',
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"proposal_id" uuid,
	"workspace_id" uuid,
	"nda_status" text DEFAULT 'pending',
	"status" text DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dms_teasers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"deal_name" text NOT NULL,
	"sector" text,
	"geography" text,
	"company_overview" text,
	"revenue" text,
	"ebitda" text,
	"yoy_growth" text,
	"employees" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dms_teasers_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "job_title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "investor_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "investment_range" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dms_role" text;--> statement-breakpoint
ALTER TABLE "dms_deal_proposals" ADD CONSTRAINT "dms_deal_proposals_teaser_id_dms_teasers_id_fk" FOREIGN KEY ("teaser_id") REFERENCES "public"."dms_teasers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_deal_proposals" ADD CONSTRAINT "dms_deal_proposals_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_deals" ADD CONSTRAINT "dms_deals_project_id_dms_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."dms_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_deals" ADD CONSTRAINT "dms_deals_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_deals" ADD CONSTRAINT "dms_deals_proposal_id_dms_deal_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."dms_deal_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_deals" ADD CONSTRAINT "dms_deals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_projects" ADD CONSTRAINT "dms_projects_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dms_teasers" ADD CONSTRAINT "dms_teasers_project_id_dms_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."dms_projects"("id") ON DELETE no action ON UPDATE no action;