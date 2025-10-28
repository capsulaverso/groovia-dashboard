import { 
  users, agents, documents, conversations, messages, userProgress,
  type User, type InsertUser,
  type Agent, type InsertAgent,
  type Document, type InsertDocument,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type UserProgress, type InsertUserProgress
} from '../shared/schema.js';
import { db } from './db.js';
import { eq, desc, and } from 'drizzle-orm';

// Interface de armazenamento
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByCode(code: string): Promise<Agent | undefined>;
  createAgent(insertAgent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<void>;
  
  // Documents
  getUserDocuments(userId: number): Promise<Document[]>;
  createDocument(insertDocument: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Conversations
  getUserConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(insertConversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  // Messages
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  
  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserAgentProgress(userId: number, agentId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, agentId: number, data: Partial<InsertUserProgress>): Promise<UserProgress>;
}

// Implementação do armazenamento em banco de dados
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAgentByCode(code: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.internalCode, code));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: number): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Documents
  async getUserDocuments(userId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.uploadDate));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Conversations
  async getUserConversations(userId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserAgentProgress(userId: number, agentId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.agentId, agentId)
      ));
    return progress || undefined;
  }

  async updateUserProgress(userId: number, agentId: number, data: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = await this.getUserAgentProgress(userId, agentId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({ ...data, updatedAt: new Date() })
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.agentId, agentId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          agentId,
          currentStep: data.currentStep || '',
          stepDescription: data.stepDescription || '',
          act: data.act || '',
          contextProgress: data.contextProgress || 0,
          ...data
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
