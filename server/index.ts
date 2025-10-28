import express from 'express';
import cors from 'cors';
import { storage } from './storage.js';
import { comparePassword } from './auth.js';
import { testAIAgent, clearCache, getCacheStats } from './aiService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API conectada ao banco de dados' });
});

// Users
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
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Agents (multi-tenant secured)
app.get('/api/agents', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const agents = await storage.getAgents(clientId);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agentes' });
  }
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
    res.json(agent);
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
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const agent = await storage.updateAgent(parseInt(req.params.id), clientId, req.body);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado ou não pertence ao cliente' });
    }
    res.json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar agente';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    await storage.deleteAgent(parseInt(req.params.id), clientId);
    res.status(204).send();
  } catch (error) {
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
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    if (req.body.clientId && req.body.clientId !== clientId) {
      return res.status(400).json({ error: 'clientId mismatch' });
    }
    const conversation = await storage.createConversation({ ...req.body, clientId });
    res.status(201).json(conversation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar conversa';
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
    const clientId = parseInt(req.query.clientId as string) || parseInt(req.headers['x-client-id'] as string);
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const progress = await storage.getUserProgress(parseInt(req.params.userId), clientId);
    res.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar progresso';
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

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📊 Banco de dados conectado com sucesso!`);
});
