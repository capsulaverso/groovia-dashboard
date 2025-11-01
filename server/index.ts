import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { storage } from './storage.js';
import { comparePassword } from './auth.js';
import { testAIAgent, clearCache, getCacheStats } from './aiService.js';
import { n8nService } from './n8nService.js';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { 
  generateAgentRulesFromGPT, 
  saveAgentRules, 
  getAgentRules, 
  generateAndSaveAgentRules,
  applyRulesToMessage 
} from './actions/gpt-action-generator.js';

// Initialize OpenTelemetry tracing
const tracer = trace.getTracer('groovia-dashboard', '1.0.0');

// Log DATABASE_URL status
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada');

// Para desenvolvimento local sem banco configurado
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost:5432')) {
  console.log('⚠️  Usando modo desenvolvimento com banco em memória');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API conectada ao banco de dados' });
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const users = await storage.getUsers(clientId);
    const usersWithoutPassword = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const user = await storage.createUser({ ...req.body, clientId });
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
    res.status(500).json({ error: message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const userId = parseInt(req.params.id);
    const user = await storage.updateUser(userId, clientId, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.post('/api/users/:id/generate-hash', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const userId = parseInt(req.params.id);
    const { pool } = await import('./db.js');
    
    // Gerar novo hash único
    const crypto = await import('crypto');
    const newHash = `user_${userId}_${crypto.randomBytes(16).toString('hex')}`;
    
    // Atualizar no banco
    const result = await pool.query(
      'UPDATE users SET hash_identifier = $1, updated_at = NOW() WHERE id = $2 AND client_id = $3 RETURNING *',
      [newHash, userId, clientId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ hash: newHash, success: true });
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
    res.status(500).json({ error: 'Erro ao gerar hash' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await storage.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    // Retornar dados do usuário sem senha e com campos corretos
    res.json({
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      avatar: userWithoutPassword.avatar || null,
      createdAt: userWithoutPassword.createdAt?.toISOString() || new Date().toISOString(),
      clientId: userWithoutPassword.clientId || 1,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Agents (multi-tenant secured)
app.get('/api/agents', async (req, res) => {
  const span = tracer.startSpan('GET /api/agents');

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;

      span.setAttribute('app.clientId', clientId);
      console.log('✅ Buscando agentes para clientId:', clientId);

      let agents;
      try {
        agents = await storage.getAgents(clientId);
        console.log('✅ Agentes encontrados:', agents?.length || 0);
      } catch (error) {
        console.error('❌ Erro detalhado ao buscar agentes:', error);
        console.error('❌ Stack:', error?.stack);
        throw error;
      }

      // Retornar todos os campos necessários do agente
      const formattedAgents = (agents || []).map((agent: any) => ({
        id: agent.id,
        title: agent.title,
        description: agent.description,
        agentType: agent.agent_type,
        isActive: agent.is_active,
        internalCode: agent.internal_code,
        behaviorType: agent.behavior_type || 'autonomous',
        capabilities: agent.capabilities || {},
        integrations: agent.integrations || [],
        aiModel: agent.ai_model || 'gpt-4o-mini',
        aiProvider: agent.ai_provider || 'replit',
        systemPrompt: agent.system_prompt || 'Você é um assistente inteligente e prestativo.',
        fallbackPrompt: agent.fallback_prompt || 'Desculpe, houve um erro ao processar sua solicitação.',
        webhookUrl: agent.webhook_url || '',
        webhookEnabled: agent.webhook_enabled || false,
        canCommunicateWithAgents: agent.can_communicate_with_agents || false,
        allowedAgentIds: agent.allowed_agent_ids || [],
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
        act: (agent.capabilities as any)?.act || null,
        clientId: agent.client_id || 1,
        skillsConfig: agent.skills_config || {},
        workflowConfig: agent.workflow_config || {},
        contextConfig: agent.context_config || {},
        uiConfig: agent.ui_config || {},
        knowledgeBase: agent.knowledge_base || null,
        promptUrl: agent.prompt_url || null
      }));

      span.setAttribute('app.agents.count', formattedAgents.length);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      res.json(formattedAgents || []);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Erro' });
      span.end();

      console.error('❌ Erro ao buscar agentes:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar agentes';
      res.status(500).json({ error: message });
    }
  });
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const agent = await storage.getAgent(parseInt(req.params.id), clientId);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }
    
    // Formatar agente para incluir campos do Agent Builder
    const formattedAgent = {
      ...agent,
      id: agent.id,
      title: agent.title,
      description: agent.description,
      agentType: agent.agent_type,
      isActive: agent.is_active,
      internalCode: agent.internal_code,
      behaviorType: agent.behavior_type || 'autonomous',
      capabilities: agent.capabilities || {},
      integrations: agent.integrations || [],
      aiModel: agent.ai_model || 'gpt-4o-mini',
      aiProvider: agent.ai_provider || 'replit',
      systemPrompt: agent.system_prompt || 'Você é um assistente inteligente e prestativo.',
      fallbackPrompt: agent.fallback_prompt || 'Desculpe, houve um erro ao processar sua solicitação.',
      webhookUrl: agent.webhook_url || '',
      webhookEnabled: agent.webhook_enabled || false,
      canCommunicateWithAgents: agent.can_communicate_with_agents || false,
      allowedAgentIds: agent.allowed_agent_ids || [],
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      act: (agent.capabilities as any)?.act || null,
      clientId: agent.client_id || 1,
      skillsConfig: agent.skills_config || {},
      workflowConfig: agent.workflow_config || {},
      contextConfig: agent.context_config || {},
      uiConfig: agent.ui_config || {},
      knowledgeBase: agent.knowledge_base || null,
      promptUrl: agent.prompt_url || null
    };
    
    res.json(formattedAgent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agente' });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    const agent = await storage.createAgent({ ...req.body, clientId });
    res.status(201).json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar agente';
    res.status(500).json({ error: message });
  }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    console.log('✅ Atualizando agente:', req.params.id, 'para clientId:', clientId);
    console.log('📦 Body recebido:', req.body);
    const agent = await storage.updateAgent(parseInt(req.params.id), clientId, req.body);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado ou não pertence ao cliente' });
    }
    
    // Formatar agente para incluir campos do Agent Builder
    const formattedAgent = {
      ...agent,
      id: agent.id,
      title: agent.title,
      description: agent.description,
      agentType: agent.agent_type,
      isActive: agent.is_active,
      internalCode: agent.internal_code,
      behaviorType: agent.behavior_type || 'autonomous',
      capabilities: agent.capabilities || {},
      integrations: agent.integrations || [],
      aiModel: agent.ai_model || 'gpt-4o-mini',
      aiProvider: agent.ai_provider || 'replit',
      systemPrompt: agent.system_prompt || 'Você é um assistente inteligente e prestativo.',
      fallbackPrompt: agent.fallback_prompt || 'Desculpe, houve um erro ao processar sua solicitação.',
      webhookUrl: agent.webhook_url || '',
      webhookEnabled: agent.webhook_enabled || false,
      canCommunicateWithAgents: agent.can_communicate_with_agents || false,
      allowedAgentIds: agent.allowed_agent_ids || [],
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      act: (agent.capabilities as any)?.act || null,
      clientId: agent.client_id || 1,
      skillsConfig: agent.skills_config || {},
      workflowConfig: agent.workflow_config || {},
      contextConfig: agent.context_config || {},
      uiConfig: agent.ui_config || {},
      knowledgeBase: agent.knowledge_base || null,
      promptUrl: agent.prompt_url || null
    };
    
    res.json(formattedAgent);
  } catch (error) {
    console.error('❌ Erro ao atualizar agente:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack');
    const message = error instanceof Error ? error.message : 'Erro ao atualizar agente';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    console.log('✅ Deletando agente:', req.params.id, 'para clientId:', clientId);
    await storage.deleteAgent(parseInt(req.params.id), clientId);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Erro ao deletar agente:', error);
    res.status(500).json({ error: 'Erro ao deletar agente' });
  }
});

// AI Test endpoint
app.post('/api/agents/test', async (req, res) => {
  try {
    const result = await testAIAgent(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao testar agente' 
    });
  }
});

// Cache Management
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas de cache' });
  }
});

app.delete('/api/cache', async (req, res) => {
  try {
    const pattern = req.query.pattern as string | undefined;
    const clearedCount = clearCache(pattern);
    res.json({ success: true, clearedCount });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar cache' });
  }
});

// Documents (multi-tenant secured)
app.get('/api/users/:userId/documents', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const documents = await storage.getUserDocuments(parseInt(req.params.userId), clientId);
    res.json(documents);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar documentos';
    res.status(500).json({ error: message });
  }
});

// Alias para compatibilidade com ProfilePage
app.get('/api/documents', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (userId) {
      const documents = await storage.getUserDocuments(userId, clientId);
      
      // Formatar documentos para ProfilePage
      const formattedDocuments = documents.map((doc: any) => ({
        ...doc,
        uploadedAt: doc.uploadDate || doc.uploadedAt,
        isVisible: !doc.isPrivate
      }));
      
      res.json(formattedDocuments);
    } else {
      res.status(400).json({ error: 'userId is required' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar documentos';
    res.status(500).json({ error: message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    const document = await storage.createDocument({ ...req.body, clientId });
    res.status(201).json(document);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar documento';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    await storage.deleteDocument(parseInt(req.params.id), clientId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

// Conversations (multi-tenant secured)
app.get('/api/users/:userId/conversations', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const conversations = await storage.getUserConversations(parseInt(req.params.userId), clientId);
    res.json(conversations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar conversas';
    res.status(500).json({ error: message });
  }
});

// Alias para compatibilidade com ProfilePage
app.get('/api/conversations', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (userId) {
      const conversations = await storage.getUserConversations(userId, clientId);
      
      // Formatar conversas para incluir nome do agente
      const formattedConversations = await Promise.all(conversations.map(async (conv: any) => {
        if (conv.agentId) {
          const agent = await storage.getAgent(conv.agentId, clientId);
          return {
            ...conv,
            agentName: agent?.title || 'Agente Desconhecido'
          };
        }
        return conv;
      }));
      
      res.json(formattedConversations);
    } else {
      res.status(400).json({ error: 'userId is required' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar conversas';
    res.status(500).json({ error: message });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const conversation = await storage.getConversation(parseInt(req.params.id), clientId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    const userId = parseInt(req.headers['x-user-id'] as string) || parseInt(req.query.userId as string) || req.body.userId;
    
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    
    const conversation = await storage.createConversation({ 
      ...req.body, 
      clientId, 
      userId,
      messageCount: 0
    });
    res.status(201).json(conversation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar conversa';
    console.error('❌ Erro ao criar conversa:', error);
    res.status(500).json({ error: message });
  }
});

// Messages (multi-tenant secured)
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const messages = await storage.getConversationMessages(parseInt(req.params.conversationId), clientId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const message = await storage.createMessage(req.body, clientId);
    res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar mensagem';
    res.status(500).json({ error: message });
  }
});

// User Progress (multi-tenant secured)
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    const userId = parseInt(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`📊 Buscando progresso do usuário ${userId} para clientId ${clientId}`);
    const progress = await storage.getUserProgress(userId, clientId);
    res.json(progress || []);
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar progresso';
    res.status(500).json({ error: message });
  }
});

// Calendar Events (mock para MVP)
app.get('/api/calendar/events', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Mock data para MVP - eventos baseados em agentes e conversas
    try {
      const agents = await storage.getAgents(clientId);
      const conversations = await storage.getUserConversations(userId, clientId);
      
      const today = new Date();
      const events = conversations.slice(0, 5).map((conv: any, index: number) => {
        const agent = agents.find((a: any) => a.id === conv.agentId);
        const eventDate = new Date(today);
        eventDate.setDate(eventDate.getDate() + index);
        
        return {
          id: conv.id,
          title: `Entrega: ${conv.title}`,
          agentName: agent?.title || 'Agente Desconhecido',
          agentInternalCode: `AGT-${String(conv.agentId).padStart(3, '0')}`,
          date: eventDate.toISOString().split('T')[0],
          time: `${14 + index}:00`,
          status: index === 0 ? 'confirmed' : index === 1 ? 'pending' : 'late',
          type: 'delivery' as const,
          link: `/documents`
        };
      });
      
      res.json(events);
    } catch (dbError) {
      // Fallback para mock estático se houver erro no banco
      const today = new Date();
      res.json([
        {
          id: 1,
          title: 'Dossiê Estratégico v1',
          agentName: 'SCAN: O Decodificador',
          agentInternalCode: 'AGT-SC-001',
          date: today.toISOString().split('T')[0],
          time: '14:00',
          status: 'confirmed',
          type: 'delivery',
          link: '/documents'
        }
      ]);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar eventos do calendário:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar eventos';
    res.status(500).json({ error: message });
  }
});

// Decisions History (mock para MVP)
app.get('/api/decisions', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Mock data para MVP - decisões baseadas em conversas e agentes
    try {
      const agents = await storage.getAgents(clientId);
      const conversations = await storage.getUserConversations(userId, clientId);
      
      const decisions = conversations.slice(0, 3).map((conv: any, index: number) => {
        const agent = agents.find((a: any) => a.id === conv.agentId);
        const decisionDate = new Date();
        decisionDate.setHours(decisionDate.getHours() - (index + 1) * 2);
        
        return {
          id: conv.id,
          date: decisionDate.toISOString(),
          agentName: agent?.title || 'Agente Desconhecido',
          agentInternalCode: `AGT-${String(conv.agentId).padStart(3, '0')}`,
          decision: conv.title || 'Decisão estratégica',
          justification: `Baseado na análise do agente ${agent?.title || 'Desconhecido'}`,
          status: index === 0 ? 'approved' : index === 1 ? 'pending' : 'rejected',
          relatedDocuments: conv.messageCount > 0 ? [`Conversa-${conv.id}.txt`] : [],
          impact: index === 0 ? 'high' : index === 1 ? 'medium' : 'low' as const
        };
      });
      
      res.json(decisions);
    } catch (dbError) {
      // Fallback para mock estático se houver erro no banco
      const decisionDate = new Date(Date.now() - 1000 * 60 * 60 * 2);
      res.json([
        {
          id: 1,
          date: decisionDate.toISOString(),
          agentName: 'SCAN: O Decodificador',
          agentInternalCode: 'AGT-SC-001',
          decision: 'Aprovar estratégia de posicionamento no mercado premium',
          justification: 'Análise detalhada do mercado e concorrência indicam oportunidade clara no segmento premium.',
          status: 'approved',
          relatedDocuments: ['Dossiê Estratégico v1.pdf'],
          impact: 'high'
        }
      ]);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar decisões:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar decisões';
    res.status(500).json({ error: message });
  }
});

// Notifications (mock para MVP)
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string);

    if (!userId || !clientId) {
      return res.status(400).json({ error: 'userId and clientId are required' });
    }

    // Mock data para MVP
    const mockNotifications = [
      {
        id: 1,
        type: 'agent',
        title: 'Agente SCAN concluiu diagnósticos',
        description: 'O agente SCAN finalizou a análise inicial do negócio.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'new',
        actionUrl: '/profile'
      },
      {
        id: 2,
        type: 'document',
        title: 'Novo dossiê disponível',
        description: 'O dossiê estratégico foi gerado e está pronto para visualização.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'new',
        actionUrl: '/documents'
      }
    ];

    res.json(mockNotifications);
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar notificações';
    res.status(500).json({ error: message });
  }
});

app.put('/api/users/:userId/progress/:agentId', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const progress = await storage.updateUserProgress(
      parseInt(req.params.userId),
      parseInt(req.params.agentId),
      clientId,
      req.body
    );
    res.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar progresso';
    res.status(500).json({ error: message });
  }
});

// Clients Management
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await storage.getClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await storage.getClient(parseInt(req.params.id));
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = await storage.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar cliente';
    res.status(500).json({ error: message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const client = await storage.updateClient(parseInt(req.params.id), req.body);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar cliente';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await storage.deleteClient(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Integrations Management (multi-tenant secured)
app.get('/api/integrations', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
    const integrations = await storage.getIntegrations(clientId, agentId);
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar integrações' });
  }
});

app.get('/api/integrations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const integration = await storage.getIntegration(parseInt(req.params.id), clientId);
    if (!integration) {
      return res.status(404).json({ error: 'Integração não encontrada' });
    }
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar integração' });
  }
});

app.post('/api/integrations', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    const integration = await storage.createIntegration({ ...req.body, clientId });
    res.status(201).json(integration);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar integração';
    res.status(500).json({ error: message });
  }
});

app.put('/api/integrations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const integration = await storage.updateIntegration(parseInt(req.params.id), clientId, req.body);
    if (!integration) {
      return res.status(404).json({ error: 'Integração não encontrada ou não pertence ao cliente' });
    }
    res.json(integration);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar integração';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/integrations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    await storage.deleteIntegration(parseInt(req.params.id), clientId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar integração' });
  }
});

// Agent Conversations (multi-tenant secured)
app.get('/api/agent-conversations', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
    const conversations = await storage.getAgentConversations(clientId, agentId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas de agentes' });
  }
});

app.get('/api/agent-conversations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const conversation = await storage.getAgentConversation(parseInt(req.params.id), clientId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa de agentes não encontrada' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversa de agentes' });
  }
});

app.post('/api/agent-conversations', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    const conversation = await storage.createAgentConversation({ ...req.body, clientId });
    res.status(201).json(conversation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar conversa de agentes';
    res.status(500).json({ error: message });
  }
});

app.put('/api/agent-conversations/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const conversation = await storage.updateAgentConversation(parseInt(req.params.id), clientId, req.body);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa de agentes não encontrada ou não pertence ao cliente' });
    }
    res.json(conversation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar conversa de agentes';
    res.status(500).json({ error: message });
  }
});

// Agent Messages (multi-tenant secured)
app.get('/api/agent-conversations/:conversationId/messages', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const messages = await storage.getAgentConversationMessages(parseInt(req.params.conversationId), clientId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens de agentes' });
  }
});

app.post('/api/agent-messages', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const conversationId = req.body.agentConversationId;
    if (!conversationId) {
      return res.status(400).json({ error: 'agentConversationId is required' });
    }
    const conversation = await storage.getAgentConversation(conversationId, clientId);
    if (!conversation) {
      return res.status(404).json({ error: 'Agent conversation not found or does not belong to client' });
    }
    const message = await storage.createAgentMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar mensagem de agente';
    res.status(500).json({ error: message });
  }
});

// Document Upload endpoint
app.post('/api/documents/upload', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const { userId, fileName, mimeType, fileHash, extractedText, metadata, driveFileId } = req.body;
    
    if (!userId || !fileName || !mimeType || !fileHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Criar documento no banco
    const document = await storage.createDocument({
      clientId,
      userId,
      name: fileName,
      type: mimeType,
      size: 0, // Será calculado no frontend
      retentionDays: 365,
      isPrivate: false,
      fileUrl: driveFileId || null,
    });

    // Armazenar conteúdo extraído se disponível
    if (extractedText) {
      // Em produção, salvar em tabela separada de conteúdo
      console.log('Conteúdo extraído para hash:', fileHash);
    }

    res.status(201).json({ 
      ...document, 
      contentHash: fileHash,
      extractedText: extractedText || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer upload';
    res.status(500).json({ error: message });
  }
});

// Get document by hash (para agentes consultarem)
app.get('/api/documents/hash/:hash', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const { hash } = req.params;
    
    // Buscar documento pelo hash
    // Em produção, implementar busca em tabela de conteúdo
    const document = await storage.getUserDocuments(0, clientId); // Placeholder
    
    if (!document || document.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Em produção, retornar conteúdo extraído
    res.json({ 
      hash, 
      textContent: '[Conteúdo será implementado com conversores completos]' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar documento' });
  }
});

// Google Drive integration
app.get('/api/drive/files', async (req, res) => {
  try {
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // Em produção, usar googleDriveService
    res.json({ 
      files: [],
      message: 'Google Drive não configurado. Configure GOOGLE_DRIVE_CLIENT_ID no .env'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar arquivos do Drive' });
  }
});

// Agent Response - Integração com N8N
app.post('/api/agents/:id/respond', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { conversationId, message } = req.body;
    const clientId = parseInt(req.headers['x-client-id'] as string) || parseInt(req.query.clientId as string) || 1;
    const userId = parseInt(req.headers['x-user-id'] as string) || 1;

    console.log(`🤖 Processando resposta do agente ${agentId}`);
    console.log(`📨 Mensagem:`, message);
    console.log(`🔑 clientId:`, clientId);

    // Verificar se o agente existe
    const agent = await storage.getAgent(agentId, clientId);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    // Buscar informações do cliente
    const client = await storage.getClient(clientId);
    if (!client) {
      console.warn('⚠️ Cliente não encontrado para clientId:', clientId);
    }

    // Preparar dados para N8N
    const agentName = agent.title;
    const clientName = client?.name || 'Cliente Desconhecido';

    console.log('📋 Dados completos:', {
      agentName,
      clientName,
      message,
      userId,
      agentId,
      conversationId
    });

    // USAR APENAS AI DIRETA - SEM N8N
    let n8nResult;
    let processedByN8N = false;
    
    console.log('🤖 Usando apenas AI direta (N8N desabilitado)');
    
    // AI direta usando system prompt do agente
    const { testAIAgent } = await import('./aiService.js');
    
    // agent vem do banco em snake_case
    const aiProvider = agent.ai_provider || 'replit';
    const aiModel = agent.ai_model || 'gpt-4o-mini';
    const systemPrompt = agent.system_prompt || 'Você é um assistente inteligente e prestativo.';
    const fallbackPrompt = agent.fallback_prompt || 'Desculpe, não consegui processar sua solicitação.';
    
    console.log('🤖 Configuração AI:', { aiProvider, aiModel });
    console.log('📋 System Prompt:', systemPrompt.substring(0, 100) + '...');
    
    const aiResponse = await testAIAgent({
      provider: aiProvider as any,
      model: aiModel,
      systemPrompt,
      testMessage: message,
      fallbackPrompt,
    });
    
    n8nResult = {
      text: aiResponse.response || fallbackPrompt,
      blocks: undefined,
      raw: { aiDirect: true, latency: aiResponse.latencyMs },
    };
    
    console.log('✅ AI direta processou com sucesso');
    console.log('📝 Resposta:', n8nResult.text.substring(0, 100) + '...');

    // Criar mensagem do agente no banco
    const agentMessage = await storage.createMessage({
      conversationId,
      sender: 'agent',
      content: n8nResult.text,
      messageType: n8nResult.blocks && n8nResult.blocks.length > 0 ? 'blocks' : 'text',
      metadata: {
        agentId,
        processedByN8N,
        timestamp: new Date().toISOString(),
        blocks: n8nResult.blocks,
      },
    }, clientId);

    console.log('✅ Resposta do N8N processada com sucesso');

    res.json({
      success: true,
      message: agentMessage,
      n8nResponse: n8nResult,
    });
  } catch (error) {
    console.error('❌ Erro ao processar resposta do agente:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar resposta';
    res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// =============================================
// 🤖 GPT Action Generator Endpoints
// =============================================

// Gerar prompts e regras via GPT para um agente
app.post('/api/agents/:id/generate-rules', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { agentType, agentPurpose, context, exampleInput, exampleOutput } = req.body;

    if (!agentType || !agentPurpose) {
      return res.status(400).json({ 
        error: 'agentType e agentPurpose são obrigatórios' 
      });
    }

    console.log(`🤖 Gerando regras para agente ${agentId}...`);
    
    const rulesStructure = await generateAndSaveAgentRules(agentId, {
      agentType,
      agentPurpose,
      context,
      exampleInput,
      exampleOutput
    });

    res.json({
      success: true,
      data: rulesStructure
    });
  } catch (error) {
    console.error('❌ Erro ao gerar regras:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Buscar regras de um agente
app.get('/api/agents/:id/rules', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const rules = await getAgentRules(agentId);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Agente não encontrado' 
      });
    }

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('❌ Erro ao buscar regras:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Testar regras em uma mensagem
app.post('/api/agents/:id/test-rules', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'message é obrigatório' 
      });
    }

    const rules = await getAgentRules(agentId);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Agente não encontrado' 
      });
    }

    const matchedRule = applyRulesToMessage(message, rules.rules);

    res.json({
      success: true,
      data: {
        message,
        matched: matchedRule !== null,
        rule: matchedRule
      }
    });
  } catch (error) {
    console.error('❌ Erro ao testar regras:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Gerar apenas prompts (sem salvar)
app.post('/api/gpt/generate-prompts', async (req, res) => {
  try {
    const { agentType, agentPurpose, context, exampleInput, exampleOutput } = req.body;

    if (!agentType || !agentPurpose) {
      return res.status(400).json({ 
        error: 'agentType e agentPurpose são obrigatórios' 
      });
    }

    console.log('🤖 Gerando prompts via GPT...');
    
    const response = await generateAgentRulesFromGPT({
      agentType,
      agentPurpose,
      context,
      exampleInput,
      exampleOutput
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('❌ Erro ao gerar prompts:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Se for erro de API key não configurada, retornar erro específico
    if (message.includes('API key') || message.includes('Nenhuma API key')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Configure VERCEL_GATEWAY_API_KEY ou OPENAI_API_KEY no .env' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// =============================================
// 📄 Pages Management Endpoints (Editor Visual)
// =============================================

// Listar páginas (admin apenas)
app.get('/api/pages', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string) || parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const pagesList = await storage.getPages(clientId);
    
    // Buscar informações de versões publicadas
    const pagesWithVersions = await Promise.all(
      pagesList.map(async (page) => {
        const publishedVersion = await storage.getLatestPageVersion(page.id, clientId, 'published');
        return {
          id: page.id,
          name: page.name,
          pageKey: page.pageKey,
          description: page.description,
          publishedVersion: publishedVersion?.version || null,
          publishedAt: publishedVersion?.publishedAt?.toISOString() || null,
          updatedAt: page.updatedAt?.toISOString() || null,
        };
      })
    );

    res.json({ pages: pagesWithVersions });
  } catch (error) {
    console.error('Erro ao listar páginas:', error);
    res.status(500).json({ error: 'Erro ao listar páginas' });
  }
});

// Buscar página por pageKey (admin ou público se publicado)
app.get('/api/pages/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;
    const userId = parseInt(req.headers['x-user-id'] as string) || parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    const status = req.query.status as 'published' | 'draft' | undefined;

    const page = await storage.getPage(pageKey, clientId);
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    // Se solicitando versão publicada, não precisa ser admin
    const isPublic = status === 'published';
    
    if (!isPublic) {
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }
    }

    const versions = await storage.getPageVersions(page.id, clientId);
    const latestVersion = await storage.getLatestPageVersion(
      page.id,
      clientId,
      status || (isPublic ? 'published' : undefined)
    );

    res.json({
      page: {
        id: page.id,
        name: page.name,
        pageKey: page.pageKey,
        description: page.description,
        publishedVersionId: page.publishedVersionId,
        createdAt: page.createdAt?.toISOString(),
        updatedAt: page.updatedAt?.toISOString(),
      },
      latestVersion: latestVersion ? {
        id: latestVersion.id,
        version: latestVersion.version,
        status: latestVersion.status,
        note: latestVersion.note,
        content: latestVersion.content,
        html: latestVersion.html,
        css: latestVersion.css,
        createdAt: latestVersion.createdAt?.toISOString(),
        publishedAt: latestVersion.publishedAt?.toISOString(),
      } : null,
      versions: versions.map(v => ({
        id: v.id,
        version: v.version,
        status: v.status,
        note: v.note,
        createdAt: v.createdAt?.toISOString(),
        publishedAt: v.publishedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    res.status(500).json({ error: 'Erro ao buscar página' });
  }
});

// Criar nova página (admin apenas)
app.post('/api/pages', async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string) || parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const { name, pageKey, description } = req.body;

    if (!name || !pageKey) {
      return res.status(400).json({ error: 'name e pageKey são obrigatórios' });
    }

    // Validar slug (apenas letras, números e hífens)
    if (!/^[a-z0-9-]+$/.test(pageKey)) {
      return res.status(400).json({ error: 'pageKey inválido. Use apenas letras minúsculas, números e hífens.' });
    }

    // Verificar se já existe
    const existing = await storage.getPage(pageKey, clientId);
    if (existing) {
      return res.status(409).json({ error: 'Já existe uma página com este pageKey' });
    }

    const page = await storage.createPage({
      clientId,
      pageKey,
      name,
      description,
      createdBy: userId,
      updatedBy: userId,
    });

    res.status(201).json({
      pages: [{
        id: page.id,
        name: page.name,
        pageKey: page.pageKey,
        description: page.description,
        publishedVersion: null,
        publishedAt: null,
        updatedAt: page.updatedAt?.toISOString() || null,
      }],
    });
  } catch (error) {
    console.error('Erro ao criar página:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar página';
    res.status(500).json({ error: message });
  }
});

// Salvar versão de página (admin apenas)
app.post('/api/pages/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;
    const userId = parseInt(req.headers['x-user-id'] as string) || parseInt(req.query.userId as string);
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string) || 1;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    const page = await storage.getPage(pageKey, clientId);
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    const { status, note, content, html, css } = req.body;

    if (status !== 'draft' && status !== 'published') {
      return res.status(400).json({ error: 'status deve ser "draft" ou "published"' });
    }

    const version = await storage.createPageVersion({
      pageId: page.id,
      clientId,
      userId,
      status,
      note,
      content,
      html,
      css,
    });

    // Atualizar updatedBy na página
    await storage.updatePage(page.id, clientId, { updatedBy: userId });

    // Buscar versões atualizadas
    const versions = await storage.getPageVersions(page.id, clientId);

    res.json({
      page: {
        id: page.id,
        name: page.name,
        pageKey: page.pageKey,
        description: page.description,
        publishedVersionId: page.publishedVersionId,
        createdAt: page.createdAt?.toISOString(),
        updatedAt: page.updatedAt?.toISOString(),
      },
      versions: versions.map(v => ({
        id: v.id,
        version: v.version,
        status: v.status,
        note: v.note,
        createdAt: v.createdAt?.toISOString(),
        publishedAt: v.publishedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao salvar versão:', error);
    const message = error instanceof Error ? error.message : 'Erro ao salvar versão';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📊 Banco de dados conectado com sucesso!`);
});
