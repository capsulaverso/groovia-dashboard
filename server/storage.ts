import { 
  clients, users, agents, documents, conversations, messages, userProgress, integrations, agentConversations, agentMessages,
  type Client, type InsertClient,
  type User, type InsertUser,
  type Agent, type InsertAgent,
  type Document, type InsertDocument,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type UserProgress, type InsertUserProgress,
  type Integration, type InsertIntegration,
  type AgentConversation, type InsertAgentConversation,
  type AgentMessage, type InsertAgentMessage
} from '../shared/schema.js';
import { pool, db } from './db.js';
import { eq, desc, and, inArray } from 'drizzle-orm';

// Interface de armazenamento
export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(insertClient: InsertClient): Promise<Client>;
  updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<void>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByClient(clientId: number): Promise<User[]>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, clientId: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Agents (clientId REQUIRED for multi-tenancy)
  getAgents(clientId: number): Promise<Agent[]>;
  getAgent(id: number, clientId: number): Promise<Agent | undefined>;
  getAgentByCode(code: string, clientId: number): Promise<Agent | undefined>;
  createAgent(insertAgent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, clientId: number, data: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number, clientId: number): Promise<void>;
  
  // Integrations (clientId REQUIRED for multi-tenancy)
  getIntegrations(clientId: number, agentId?: number): Promise<Integration[]>;
  getIntegration(id: number, clientId: number): Promise<Integration | undefined>;
  createIntegration(insertIntegration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, clientId: number, data: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: number, clientId: number): Promise<void>;
  
  // Documents (clientId REQUIRED)
  getUserDocuments(userId: number, clientId: number): Promise<Document[]>;
  getClientDocuments(clientId: number): Promise<Document[]>;
  createDocument(insertDocument: InsertDocument): Promise<Document>;
  deleteDocument(id: number, clientId: number): Promise<void>;
  
  // Conversations (clientId REQUIRED for multi-tenancy)
  getUserConversations(userId: number, clientId: number): Promise<Conversation[]>;
  getClientConversations(clientId: number): Promise<Conversation[]>;
  getConversation(id: number, clientId: number): Promise<Conversation | undefined>;
  createConversation(insertConversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, clientId: number, data: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  // Messages (validation via conversation ownership - clientId REQUIRED)
  getConversationMessages(conversationId: number, clientId: number): Promise<Message[]>;
  createMessage(insertMessage: InsertMessage, clientId: number): Promise<Message>;
  
  // Agent Conversations (clientId REQUIRED)
  getAgentConversations(clientId: number, agentId?: number): Promise<AgentConversation[]>;
  getAgentConversation(id: number, clientId: number): Promise<AgentConversation | undefined>;
  createAgentConversation(insertAgentConversation: InsertAgentConversation): Promise<AgentConversation>;
  updateAgentConversation(id: number, clientId: number, data: Partial<InsertAgentConversation>): Promise<AgentConversation | undefined>;
  
  // Agent Messages (validation via conversation ownership)
  getAgentConversationMessages(agentConversationId: number, clientId: number): Promise<AgentMessage[]>;
  createAgentMessage(insertAgentMessage: InsertAgentMessage): Promise<AgentMessage>;
  
  // User Progress (clientId validation via userId/agentId ownership)
  getUserProgress(userId: number, clientId: number): Promise<UserProgress[]>;
  getUserAgentProgress(userId: number, agentId: number, clientId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, agentId: number, clientId: number, data: Partial<InsertUserProgress>): Promise<UserProgress>;
}

// Implementação do armazenamento em banco de dados
export class DatabaseStorage implements IStorage {
  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByClient(clientId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.clientId, clientId));
  }

  async getUsers(clientId: number): Promise<User[]> {
    return await this.getUsersByClient(clientId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const client = await this.getClient(insertUser.clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, clientId: number, data: Partial<InsertUser>): Promise<User | undefined> {
    if (data.clientId && data.clientId !== clientId) {
      throw new Error('Cannot change user client');
    }
    
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.clientId, clientId)))
      .returning();
    return user || undefined;
  }

  // Agents
  async getAgents(clientId: number): Promise<Agent[]> {
    const result = await pool.query(
      'SELECT * FROM agents WHERE client_id = $1 ORDER BY id',
      [clientId]
    );
    return result.rows as Agent[];
  }

  async getAgent(id: number, clientId: number): Promise<Agent | undefined> {
    const result = await pool.query(
      'SELECT * FROM agents WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );
    return result.rows[0] as Agent | undefined;
  }

  async getAgentByCode(code: string, clientId: number): Promise<Agent | undefined> {
    const result = await pool.query(
      'SELECT * FROM agents WHERE internal_code = $1 AND client_id = $2',
      [code, clientId]
    );
    return result.rows[0] as Agent | undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const client = await this.getClient(insertAgent.clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    
    if (insertAgent.allowedAgentIds && insertAgent.allowedAgentIds.length > 0) {
      for (const allowedAgentId of insertAgent.allowedAgentIds) {
        const allowedAgent = await this.getAgent(allowedAgentId, insertAgent.clientId);
        if (!allowedAgent) {
          throw new Error(`Allowed agent ${allowedAgentId} not found or does not belong to client`);
        }
      }
    }
    
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAgent(id: number, clientId: number, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(agents.id, id), eq(agents.clientId, clientId)))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: number, clientId: number): Promise<void> {
    await db.delete(agents).where(and(eq(agents.id, id), eq(agents.clientId, clientId)));
  }

  // Integrations
  async getIntegrations(clientId: number, agentId?: number): Promise<Integration[]> {
    if (agentId) {
      return await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.clientId, clientId),
          eq(integrations.agentId, agentId)
        ))
        .orderBy(desc(integrations.priority));
    }
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.clientId, clientId))
      .orderBy(desc(integrations.priority));
  }

  async getIntegration(id: number, clientId: number): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.clientId, clientId)));
    return integration || undefined;
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    if (insertIntegration.agentId) {
      const agent = await this.getAgent(insertIntegration.agentId, insertIntegration.clientId);
      if (!agent) {
        throw new Error('Agent not found or does not belong to client');
      }
    }
    
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateIntegration(id: number, clientId: number, data: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.clientId, clientId)))
      .returning();
    return integration || undefined;
  }

  async deleteIntegration(id: number, clientId: number): Promise<void> {
    await db.delete(integrations).where(and(eq(integrations.id, id), eq(integrations.clientId, clientId)));
  }

  // Documents
  async getUserDocuments(userId: number, clientId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.clientId, clientId)))
      .orderBy(desc(documents.uploadDate));
  }

  async getClientDocuments(clientId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.clientId, clientId))
      .orderBy(desc(documents.uploadDate));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const user = await this.getUser(insertDocument.userId);
    if (!user || user.clientId !== insertDocument.clientId) {
      throw new Error('User does not belong to the specified client');
    }
    
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number, clientId: number): Promise<void> {
    await db.delete(documents).where(and(eq(documents.id, id), eq(documents.clientId, clientId)));
  }

  // Conversations
  async getUserConversations(userId: number, clientId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.clientId, clientId)))
      .orderBy(desc(conversations.updatedAt));
  }

  async getClientConversations(clientId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.clientId, clientId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number, clientId: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.clientId, clientId)));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const user = await this.getUser(insertConversation.userId);
    if (!user || user.clientId !== insertConversation.clientId) {
      throw new Error('User does not belong to the specified client');
    }
    const agent = await this.getAgent(insertConversation.agentId, insertConversation.clientId);
    if (!agent) {
      throw new Error('Agent not found or does not belong to client');
    }
    
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, clientId: number, data: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.clientId, clientId)))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async getConversationMessages(conversationId: number, clientId: number): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId, clientId);
    if (!conversation) {
      return [];
    }
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage, clientId: number): Promise<Message> {
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, insertMessage.conversationId))
      .limit(1);
    
    if (!conversation || conversation.length === 0) {
      throw new Error('Conversation not found');
    }
    
    if (conversation[0].clientId !== clientId) {
      throw new Error('Conversation does not belong to the specified client');
    }
    
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // User Progress
  async getUserProgress(userId: number, clientId: number): Promise<UserProgress[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        // User doesn't exist yet, return empty array
        console.log(`📊 User ${userId} not found, returning empty progress`);
        return [];
      }

      if (user.clientId !== clientId) {
        throw new Error('User does not belong to the specified client');
      }

      return await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));
    } catch (error) {
      // If user doesn't exist, return empty array instead of throwing
      if (error instanceof Error && error.message.includes('not found')) {
        console.log(`📊 User ${userId} not found, returning empty progress`);
        return [];
      }
      throw error;
    }
  }

  async getUserAgentProgress(userId: number, agentId: number, clientId: number): Promise<UserProgress | undefined> {
    const user = await this.getUser(userId);
    if (!user || user.clientId !== clientId) {
      throw new Error('User does not belong to the specified client');
    }
    
    const agent = await this.getAgent(agentId, clientId);
    if (!agent) {
      throw new Error('Agent not found or does not belong to client');
    }
    
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.agentId, agentId)
      ));
    return progress || undefined;
  }

  async updateUserProgress(userId: number, agentId: number, clientId: number, data: Partial<InsertUserProgress>): Promise<UserProgress> {
    const user = await this.getUser(userId);
    if (!user || user.clientId !== clientId) {
      throw new Error('User does not belong to the specified client');
    }
    
    const agent = await this.getAgent(agentId, clientId);
    if (!agent) {
      throw new Error('Agent not found or does not belong to client');
    }
    
    const existing = await this.getUserAgentProgress(userId, agentId, clientId);
    
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

  // Agent Conversations
  async getAgentConversations(clientId: number, agentId?: number): Promise<AgentConversation[]> {
    if (agentId) {
      return await db
        .select()
        .from(agentConversations)
        .where(and(
          eq(agentConversations.clientId, clientId),
          eq(agentConversations.initiatorAgentId, agentId)
        ))
        .orderBy(desc(agentConversations.updatedAt));
    }
    return await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.clientId, clientId))
      .orderBy(desc(agentConversations.updatedAt));
  }

  async getAgentConversation(id: number, clientId: number): Promise<AgentConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(and(eq(agentConversations.id, id), eq(agentConversations.clientId, clientId)));
    return conversation || undefined;
  }

  async createAgentConversation(insertAgentConversation: InsertAgentConversation): Promise<AgentConversation> {
    const initiatorAgent = await this.getAgent(insertAgentConversation.initiatorAgentId, insertAgentConversation.clientId);
    if (!initiatorAgent) {
      throw new Error('Initiator agent not found or does not belong to client');
    }
    
    for (const participantId of insertAgentConversation.participantAgentIds) {
      const participant = await this.getAgent(participantId, insertAgentConversation.clientId);
      if (!participant) {
        throw new Error(`Participant agent ${participantId} not found or does not belong to client`);
      }
    }
    
    const [conversation] = await db
      .insert(agentConversations)
      .values(insertAgentConversation)
      .returning();
    return conversation;
  }

  async updateAgentConversation(id: number, clientId: number, data: Partial<InsertAgentConversation>): Promise<AgentConversation | undefined> {
    const [conversation] = await db
      .update(agentConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(agentConversations.id, id), eq(agentConversations.clientId, clientId)))
      .returning();
    return conversation || undefined;
  }

  // Agent Messages
  async getAgentConversationMessages(agentConversationId: number, clientId: number): Promise<AgentMessage[]> {
    const conversation = await this.getAgentConversation(agentConversationId, clientId);
    if (!conversation) {
      return [];
    }
    return await db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.agentConversationId, agentConversationId))
      .orderBy(agentMessages.timestamp);
  }

  async createAgentMessage(insertAgentMessage: InsertAgentMessage): Promise<AgentMessage> {
    const conversation = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, insertAgentMessage.agentConversationId))
      .limit(1);
    
    if (!conversation || conversation.length === 0) {
      throw new Error('Agent conversation not found');
    }
    
    const senderAgent = await db
      .select()
      .from(agents)
      .where(and(
        eq(agents.id, insertAgentMessage.senderAgentId),
        eq(agents.clientId, conversation[0].clientId)
      ))
      .limit(1);
    
    if (!senderAgent || senderAgent.length === 0) {
      throw new Error('Sender agent not found or does not belong to conversation client');
    }
    
    if (insertAgentMessage.receiverAgentId) {
      const receiverAgent = await db
        .select()
        .from(agents)
        .where(and(
          eq(agents.id, insertAgentMessage.receiverAgentId),
          eq(agents.clientId, conversation[0].clientId)
        ))
        .limit(1);
      
      if (!receiverAgent || receiverAgent.length === 0) {
        throw new Error('Receiver agent not found or does not belong to conversation client');
      }
    }
    
    const [message] = await db
      .insert(agentMessages)
      .values(insertAgentMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
