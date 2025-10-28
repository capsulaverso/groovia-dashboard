import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Agentes
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  internalCode: text('internal_code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  agentType: text('agent_type').notNull(),
  integrations: jsonb('integrations').notNull().default('[]'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Documentos
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
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
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  lastMessage: text('last_message'),
  messageCount: integer('message_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de Mensagens
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
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

// Relações
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  conversations: many(conversations),
  progress: many(userProgress),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  conversations: many(conversations),
  progress: many(userProgress),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
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

// Tipos TypeScript
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
