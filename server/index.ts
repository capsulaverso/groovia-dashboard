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

// Agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await storage.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agentes' });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const agent = await storage.getAgent(parseInt(req.params.id));
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
    const agent = await storage.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agente' });
  }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const agent = await storage.updateAgent(parseInt(req.params.id), req.body);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agente' });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    await storage.deleteAgent(parseInt(req.params.id));
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

// Documents
app.get('/api/users/:userId/documents', async (req, res) => {
  try {
    const documents = await storage.getUserDocuments(parseInt(req.params.userId));
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const document = await storage.createDocument(req.body);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar documento' });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await storage.deleteDocument(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

// Conversations
app.get('/api/users/:userId/conversations', async (req, res) => {
  try {
    const conversations = await storage.getUserConversations(parseInt(req.params.userId));
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await storage.getConversation(parseInt(req.params.id));
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
    const conversation = await storage.createConversation(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

// Messages
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const messages = await storage.getConversationMessages(parseInt(req.params.conversationId));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = await storage.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// User Progress
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const progress = await storage.getUserProgress(parseInt(req.params.userId));
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
});

app.put('/api/users/:userId/progress/:agentId', async (req, res) => {
  try {
    const progress = await storage.updateUserProgress(
      parseInt(req.params.userId),
      parseInt(req.params.agentId),
      req.body
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📊 Banco de dados conectado com sucesso!`);
});
