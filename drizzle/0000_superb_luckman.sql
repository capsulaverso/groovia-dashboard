-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "integrations" (
	"id" serial NOT NULL,
	"client_id" integer NOT NULL,
	"agent_id" integer,
	"integration_type" text NOT NULL,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_messages" (
	"id" serial NOT NULL,
	"agent_conversation_id" integer NOT NULL,
	"sender_agent_id" integer NOT NULL,
	"receiver_agent_id" integer,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'request' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'sent' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial NOT NULL,
	"client_id" integer,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"retention_days" integer DEFAULT 365 NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial NOT NULL,
	"client_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" serial NOT NULL,
	"client_id" integer,
	"internal_code" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"agent_type" text NOT NULL,
	"act" text,
	"behavior_type" text DEFAULT 'autonomous' NOT NULL,
	"can_communicate_with_agents" boolean DEFAULT false NOT NULL,
	"allowed_agent_ids" jsonb DEFAULT '[]'::jsonb,
	"capabilities" jsonb DEFAULT '{}'::jsonb,
	"integrations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"ai_model" text DEFAULT 'gpt-4o-mini',
	"ai_provider" text DEFAULT 'replit',
	"system_prompt" text DEFAULT 'Você é um assistente inteligente e prestativo.',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"current_step" text NOT NULL,
	"step_description" text NOT NULL,
	"act" text NOT NULL,
	"context_progress" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial NOT NULL,
	"session_hash" text NOT NULL,
	"client_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"conversation_id" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"total_tokens_used" integer DEFAULT 0 NOT NULL,
	"total_cost_usd" text DEFAULT '0.00',
	"avg_latency_ms" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial NOT NULL,
	"client_id" integer,
	"page_key" text NOT NULL,
	"name" text NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	"published_version_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chat_sessions_hash_idx" ON "chat_sessions" USING btree ("session_hash" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "chat_sessions_user_agent_idx" ON "chat_sessions" USING btree ("user_id" int4_ops,"agent_id" int4_ops);
*/