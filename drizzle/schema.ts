import { pgTable, serial, integer, text, jsonb, boolean, timestamp, foreignKey, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const integrations = pgTable("integrations", {
	id: serial().notNull(),
	clientId: integer("client_id").notNull(),
	agentId: integer("agent_id"),
	integrationType: text("integration_type").notNull(),
	name: text().notNull(),
	config: jsonb().default({}).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	priority: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const agentMessages = pgTable("agent_messages", {
	id: serial().notNull(),
	agentConversationId: integer("agent_conversation_id").notNull(),
	senderAgentId: integer("sender_agent_id").notNull(),
	receiverAgentId: integer("receiver_agent_id"),
	content: text().notNull(),
	messageType: text("message_type").default('request').notNull(),
	metadata: jsonb().default({}),
	status: text().default('sent').notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
	id: serial().notNull(),
	clientId: integer("client_id"),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
	size: integer().notNull(),
	retentionDays: integer("retention_days").default(365).notNull(),
	isPrivate: boolean("is_private").default(false).notNull(),
	uploadDate: timestamp("upload_date", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	fileUrl: text("file_url"),
});

export const clients = pgTable("clients", {
	id: serial().notNull(),
	name: text().notNull(),
	domain: text(),
	isActive: boolean("is_active").default(true),
	settings: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().notNull(),
	clientId: integer("client_id"),
	name: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	role: text().default('user').notNull(),
	avatar: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "users_client_id_fkey"
		}).onDelete("cascade"),
]);

export const agents = pgTable("agents", {
	id: serial().notNull(),
	clientId: integer("client_id"),
	internalCode: text("internal_code").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	agentType: text("agent_type").notNull(),
	act: text(),
	behaviorType: text("behavior_type").default('autonomous').notNull(),
	canCommunicateWithAgents: boolean("can_communicate_with_agents").default(false).notNull(),
	allowedAgentIds: jsonb("allowed_agent_ids").default([]),
	capabilities: jsonb().default({}),
	integrations: jsonb().default([]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	aiModel: text("ai_model").default('gpt-4o-mini'),
	aiProvider: text("ai_provider").default('replit'),
	systemPrompt: text("system_prompt").default('Você é um assistente inteligente e prestativo.'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "agents_client_id_fkey"
		}).onDelete("cascade"),
]);

export const userProgress = pgTable("user_progress", {
	id: serial().notNull(),
	userId: integer("user_id").notNull(),
	agentId: integer("agent_id").notNull(),
	currentStep: text("current_step").notNull(),
	stepDescription: text("step_description").notNull(),
	act: text().notNull(),
	contextProgress: integer("context_progress").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
	id: serial().notNull(),
	sessionHash: text("session_hash").notNull(),
	clientId: integer("client_id").notNull(),
	userId: integer("user_id").notNull(),
	agentId: integer("agent_id").notNull(),
	conversationId: integer("conversation_id"),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	lastActivityAt: timestamp("last_activity_at", { mode: 'string' }).defaultNow().notNull(),
	messagesCount: integer("messages_count").default(0).notNull(),
	totalTokensUsed: integer("total_tokens_used").default(0).notNull(),
	totalCostUsd: text("total_cost_usd").default('0.00'),
	avgLatencyMs: integer("avg_latency_ms"),
	status: text().default('active').notNull(),
	metadata: jsonb().default({}),
}, (table) => [
	uniqueIndex("chat_sessions_hash_idx").using("btree", table.sessionHash.asc().nullsLast().op("text_ops")),
	uniqueIndex("chat_sessions_user_agent_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.agentId.asc().nullsLast().op("int4_ops")),
]);

export const pages = pgTable("pages", {
	id: serial().notNull(),
	clientId: integer("client_id"),
	pageKey: text("page_key").notNull(),
	name: text().notNull(),
	createdBy: integer("created_by"),
	updatedBy: integer("updated_by"),
	publishedVersionId: integer("published_version_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "pages_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "pages_created_by_fkey"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "pages_updated_by_fkey"
		}),
]);
