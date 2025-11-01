import { pgTable, serial, text, integer, timestamp, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Clientes (Multi-tenancy)
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain'),
  isActive: boolean('is_active').notNull().default(true),
  settings: jsonb('settings').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  avatar: text('avatar'),
  // Dados Pessoais
  phone: text('phone'),
  cpf: text('cpf'),
  hashIdentifier: text('hash_identifier').unique(),
  slug: text('slug').unique(),
  // Dados Jurídicos
  legalName: text('legal_name'),
  cnpj: text('cnpj'),
  fiscalAddress: text('fiscal_address'),
  companyType: text('company_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Agentes
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  internalCode: text('internal_code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  agentType: text('agent_type').notNull(),
  behaviorType: text('behavior_type').notNull().default('autonomous'),
  canCommunicateWithAgents: boolean('can_communicate_with_agents').notNull().default(false),
  allowedAgentIds: jsonb('allowed_agent_ids').default('[]'),
  capabilities: jsonb('capabilities').default('{}'),
  integrations: jsonb('integrations').notNull().default('[]'),
  skillsConfig: jsonb('skills_config').default('{}'), // configuração de skills do Agent Builder
  workflowConfig: jsonb('workflow_config').default('{}'), // configuração de fluxo lógico
  contextConfig: jsonb('context_config').default('{}'), // configuração de contexto e persistência
  uiConfig: jsonb('ui_config').default('{}'), // configuração de interface (card/chat/modal)
  isActive: boolean('is_active').notNull().default(true),
  aiModel: text('ai_model').default('gpt-4o-mini'),
  aiProvider: text('ai_provider').default('replit'),
  systemPrompt: text('system_prompt').default('Você é um assistente inteligente e prestativo.'),
  fallbackPrompt: text('fallback_prompt').default('Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.'),
  knowledgeBase: text('knowledge_base'), // link/base de conhecimento do agente
  promptUrl: text('prompt_url'), // URL do prompt específico do agente
  webhookUrl: text('webhook_url'),
  webhookEnabled: boolean('webhook_enabled').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Documentos
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  retentionDays: integer('retention_days').notNull().default(365),
  isPrivate: boolean('is_private').notNull().default(false),
  uploadDate: timestamp('upload_date').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  fileUrl: text('file_url'),
});

// Tabela de Conversas
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  lastMessage: text('last_message'),
  messageCount: integer('message_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Mensagens (com tipos de resposta)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  messageType: text('message_type').notNull().default('text'),
  metadata: jsonb('metadata').default('{}'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Tabela de Progresso do Usuário
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  currentStep: text('current_step').notNull(),
  stepDescription: text('step_description').notNull(),
  act: text('act').notNull(),
  contextProgress: integer('context_progress').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Integrações (N8N, Dify, Langchain, etc)
export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  integrationType: text('integration_type').notNull(),
  name: text('name').notNull(),
  config: jsonb('config').notNull().default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  priority: integer('priority').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Conversas entre Agentes
export const agentConversations = pgTable('agent_conversations', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  initiatorAgentId: integer('initiator_agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  participantAgentIds: jsonb('participant_agent_ids').notNull().default('[]'),
  purpose: text('purpose'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Mensagens entre Agentes
export const agentMessages = pgTable('agent_messages', {
  id: serial('id').primaryKey(),
  agentConversationId: integer('agent_conversation_id').notNull().references(() => agentConversations.id, { onDelete: 'cascade' }),
  senderAgentId: integer('sender_agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  receiverAgentId: integer('receiver_agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').notNull().default('request'),
  metadata: jsonb('metadata').default('{}'),
  status: text('status').notNull().default('sent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Tabela de Sessões de Chat
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  sessionHash: text('session_hash').notNull(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
  messagesCount: integer('messages_count').notNull().default(0),
  totalTokensUsed: integer('total_tokens_used').notNull().default(0),
  totalCostUsd: text('total_cost_usd').notNull().default('0.00'),
  avgLatencyMs: integer('avg_latency_ms'),
  status: text('status').notNull().default('active'),
  metadata: jsonb('metadata').default('{}'),
}, (table) => ({
  sessionHashUnique: unique().on(table.sessionHash),
  userAgentUnique: unique().on(table.userId, table.agentId),
}));

// Relações
export const clientsRelations = relations(clients, ({ many }) => ({
  users: many(users),
  agents: many(agents),
  documents: many(documents),
  conversations: many(conversations),
  integrations: many(integrations),
  agentConversations: many(agentConversations),
  chatSessions: many(chatSessions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.clientId],
    references: [clients.id],
  }),
  documents: many(documents),
  conversations: many(conversations),
  progress: many(userProgress),
  chatSessions: many(chatSessions),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  client: one(clients, {
    fields: [agents.clientId],
    references: [clients.id],
  }),
  conversations: many(conversations),
  progress: many(userProgress),
  integrations: many(integrations),
  initiatedConversations: many(agentConversations),
  sentMessages: many(agentMessages),
  chatSessions: many(chatSessions),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  client: one(clients, {
    fields: [conversations.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
  chatSessions: many(chatSessions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [userProgress.agentId],
    references: [agents.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  client: one(clients, {
    fields: [integrations.clientId],
    references: [clients.id],
  }),
  agent: one(agents, {
    fields: [integrations.agentId],
    references: [agents.id],
  }),
}));

export const agentConversationsRelations = relations(agentConversations, ({ one, many }) => ({
  client: one(clients, {
    fields: [agentConversations.clientId],
    references: [clients.id],
  }),
  initiatorAgent: one(agents, {
    fields: [agentConversations.initiatorAgentId],
    references: [agents.id],
  }),
  messages: many(agentMessages),
}));

export const agentMessagesRelations = relations(agentMessages, ({ one }) => ({
  conversation: one(agentConversations, {
    fields: [agentMessages.agentConversationId],
    references: [agentConversations.id],
  }),
  senderAgent: one(agents, {
    fields: [agentMessages.senderAgentId],
    references: [agents.id],
  }),
  receiverAgent: one(agents, {
    fields: [agentMessages.receiverAgentId],
    references: [agents.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  client: one(clients, {
    fields: [chatSessions.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [chatSessions.agentId],
    references: [agents.id],
  }),
  conversation: one(conversations, {
    fields: [chatSessions.conversationId],
    references: [conversations.id],
  }),
}));

// Tabela de Páginas (Page Builder)
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  pageKey: text('page_key').notNull(), // slug da página
  name: text('name').notNull(),
  description: text('description'),
  publishedVersionId: integer('published_version_id'), // FK para page_versions
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pageKeyUnique: unique().on(table.clientId, table.pageKey), // slug único por cliente
}));

// Tabela de Versões de Páginas
export const pageVersions = pgTable('page_versions', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  version: integer('version').notNull(),
  status: text('status').notNull().default('draft'), // 'draft' | 'published'
  note: text('note'),
  content: jsonb('content'), // JSON do GrapesJS (projectData)
  html: text('html'),
  css: text('css'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
});

export const pagesRelations = relations(pages, ({ one, many }) => ({
  client: one(clients, {
    fields: [pages.clientId],
    references: [clients.id],
  }),
  createdByUser: one(users, {
    fields: [pages.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [pages.updatedBy],
    references: [users.id],
  }),
  publishedVersion: one(pageVersions, {
    fields: [pages.publishedVersionId],
    references: [pageVersions.id],
  }),
  versions: many(pageVersions),
}));

export const pageVersionsRelations = relations(pageVersions, ({ one }) => ({
  page: one(pages, {
    fields: [pageVersions.pageId],
    references: [pages.id],
  }),
  client: one(clients, {
    fields: [pageVersions.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [pageVersions.userId],
    references: [users.id],
  }),
}));

// Tipos TypeScript
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

export type AgentConversation = typeof agentConversations.$inferSelect;
export type InsertAgentConversation = typeof agentConversations.$inferInsert;

export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = typeof agentMessages.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

export type PageVersion = typeof pageVersions.$inferSelect;
export type InsertPageVersion = typeof pageVersions.$inferInsert;
