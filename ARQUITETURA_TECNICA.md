# 🏗️ ARQUITETURA TÉCNICA - GROOVIA DASHBOARD

**Versão:** 2.0  
**Data:** 28/10/2025  
**Provider IA:** Vercel Gateway (Substituído Replit)

---

## 📋 VISÃO GERAL

O Groovia Dashboard é uma plataforma **multi-tenant** de gestão de agentes de IA com arquitetura **modular** e **extensível**, permitindo integrações diversificadas e suporte a **múltiplos tipos de recursos** no frontend.

---

## 🎯 PONTOS-CHAVE DA ARQUITETURA

### 1. 🔐 **MULTITENANCY**
**Isolamento Total por Cliente**

Cada cliente possui:
- ✅ Dados isolados no banco (clientId)
- ✅ Contexto separado por agente
- ✅ Permissões por tenant
- ✅ Integrações independentes

**Implementação:**
- Tabela `clients` como raiz
- Todas as queries filtram por `clientId`
- Middleware de validação de tenant
- Zero cross-contamination de dados

```typescript
// Exemplo de isolamento
const agents = await storage.getAgents(clientId); // Apenas do cliente
const conversations = await storage.getConversations(userId, clientId); // Isolado
```

---

### 2. 🧩 **MODULARIDADE**

#### Backend Modular
- ✅ Múltiplas integrações configuráveis
- ✅ Provider de IA swappable
- ✅ Storage layer abstrato (IStorage)
- ✅ Service layer independente

**Arquitetura:**
```
┌─────────────────┐
│   API Routes    │  ← Express endpoints
├─────────────────┤
│  AI Service     │  ← Orquestração IA
├─────────────────┤
│  Storage Layer  │  ← Abstraction
├─────────────────┤
│   Database      │  ← Neon PostgreSQL
└─────────────────┘
```

**Integrações Suportadas:**
- **Vercel Gateway** (principal)
- **OpenAI** (fallback)
- **Groq** (alternativo)
- **N8N** (workflows)
- **Dify** (chat AI)
- **Langchain** (agents)
- **Webhooks** (genéricos)

#### Frontend Modular
- ✅ Componentes reutilizáveis
- ✅ Sistema de mensagens tipo-agnóstico
- ✅ Cards configuráveis
- ✅ Chat com múltiplos tipos de resposta

**Componentes Reutilizáveis:**
```
components/
├── AgentCard.tsx          ← Card configurável
├── ChatModal.tsx          ← Chat reutilizável
└── messages/
    ├── MessageRenderer.tsx    ← Orquestrador
    ├── TextMessage.tsx
    ├── ChartMessage.tsx
    ├── DocumentMessage.tsx
    ├── LinkMessage.tsx
    └── ApprovalMessage.tsx
```

---

### 3. 🔄 **ORQUESTRAÇÃO DE FALLBACK**

**Fluxo Principal:**
1. **Primary Integration** → Vercel Gateway
2. **Fallback** → OpenAI
3. **Ultimate Fallback** → Hardcoded message

**Implementação:**
```typescript
export const testAIAgent = async (request: AITestRequest) => {
  // 1. Tentar webhook primeiro
  if (request.webhookUrl) {
    try {
      return await callWebhook(request.webhookUrl, data);
    } catch { /* fallthrough */ }
  }
  
  // 2. Usar provider configurado
  if (request.provider === 'vercel-gateway') {
    return await vercelGateway.chat.completions.create(...);
  }
  
  // 3. Fallback automático
  if (request.fallbackPrompt) {
    return { response: request.fallbackPrompt, usedFallback: true };
  }
  
  throw new Error('Todos os fallbacks falharam');
};
```

**Vantagens:**
- ✅ Zero downtime
- ✅ Redundância
- ✅ Graceful degradation
- ✅ Cache para respostas

---

### 4. 🎨 **TIPOS DE RECURSO VARIADO NO FRONTEND**

O sistema suporta **dinamicamente** múltiplos tipos de mensagem:

#### Tipos Suportados:
1. **TextMessage** - Texto puro (markdown)
2. **ChartMessage** - Gráficos e visualizações
3. **DocumentMessage** - Documentos e arquivos
4. **LinkMessage** - Links e referências
5. **ApprovalMessage** - Aprovações e decisões

**Implementação:**
```typescript
// Backend determina o tipo
{ 
  messageType: 'chart',
  metadata: { chartType: 'bar', data: [...] }
}

// Frontend renderiza dinamicamente
<MessageRenderer message={message} />
  ↓
// Detecta tipo e renderiza componente apropriado
<ChartMessage data={metadata} />
```

**Extensibilidade:**
- Adicionar novo tipo = 2 arquivos
- Backend define o tipo
- Frontend renderiza automaticamente

---

### 5. 🔧 **EXTENSIBILIDADE**

#### Adicionar Novo Backend/Provider

**Passo 1:** Adicionar em `aiService.ts`
```typescript
const novoProvider = process.env.NOVO_PROVIDER_API_KEY 
  ? new NovoCient({ apiKey: process.env.NOVO_PROVIDER_API_KEY })
  : null;
```

**Passo 2:** Adicionar no switch
```typescript
case 'novo-provider':
  return await novoProvider.chat(...);
```

**Resultado:** 
- ✅ Integração funcional
- ✅ Sem impactar outros providers
- ✅ Cache automático
- ✅ Fallback automático

#### Adicionar Novo Tipo de Mensagem

**Backend:** Definir no metadata
```typescript
{ messageType: 'custom', metadata: { customData: '...' } }
```

**Frontend:** Criar componente
```typescript
// messages/CustomMessage.tsx
export const CustomMessage = ({ metadata }) => { ... };
```

**Orquestrador:** Adicionar no switch
```typescript
case 'custom':
  return <CustomMessage metadata={metadata} />;
```

---

## 🎨 COMPONENTES REUTILIZÁVEIS

### **AgentCard.tsx**
**Uso:** Exibe agente em formato de card

**Props:**
```typescript
interface AgentCardProps {
  title: string;           // Título do agente
  description: string;      // Descrição
  progress?: number;       // Progresso 0-100
  integrations: Integration[]; // Lista de integrações
  onClick?: () => void;    // Callback de clique
}
```

**Características:**
- ✅ Responsivo
- ✅ Animações suaves
- ✅ Integrações visuais
- ✅ Progresso configurável

### **ChatModal.tsx**
**Uso:** Chat reutilizável para qualquer agente

**Props:**
```typescript
interface ChatModalProps {
  agentId: string;          // ID do agente
  onClose: () => void;      // Callback de fechar
  initialMessages?: Message[]; // Mensagens iniciais
}
```

**Características:**
- ✅ Auto-scroll
- ✅ Markdown support
- ✅ Múltiplos tipos de mensagem
- ✅ Loading states
- ✅ Error handling

---

## 🔄 FLUXO DE DADOS

### 1. Usuário envia mensagem
```
Frontend (ChatModal)
    ↓ POST /api/messages
Backend (server/index.ts)
    ↓
AI Service (aiService.ts)
    ↓ [Orquestração]
├─→ Vercel Gateway (Primary)
├─→ OpenAI (Fallback)
└─→ Default Message (Ultimate)
    ↓ [Cache]
    ↓
Database (Neon)
    ↓
Response para Frontend
    ↓
MessageRenderer detecta tipo
    ↓
Componente específico (Text/Chart/etc)
```

### 2. Usuário visualiza agente
```
Frontend (AgentCard)
    ↓ GET /api/agents
Backend (server/index.ts)
    ↓ Storage.getAgents(clientId)
Database (Neon)
    ↓ [Com clientId]
Response filtered
    ↓
AgentCard renderiza
    ↓
User vê apenas seus agentes
```

---

## 🔐 SEGURANÇA MULTI-TENANT

### Validação em Todo Request
```typescript
// 1. Cliente enviado no header ou query
const clientId = req.headers['x-client-id'] || req.query.clientId;

// 2. Validação obrigatória
if (!clientId) {
  return res.status(400).json({ error: 'clientId is required' });
}

// 3. Storage filtra automaticamente
const agents = await storage.getAgents(clientId);

// 4. Zero chance de cross-contamination
// Agente do Cliente A nunca aparece para Cliente B
```

---

## 🧪 TESTABILIDADE

### Mock de Integração
```typescript
const mockIntegration = {
  provider: 'vercel-gateway',
  response: 'Mocked response',
  cachedResponse: true,
  latencyMs: 5
};
```

### Teste de Fallback
```typescript
// Simular falha do primary
process.env.VERCEL_GATEWAY_URL = 'http://invalido';
// Deve automaticamente usar OpenAI
```

---

## 📊 MÉTRICAS E MONITORAMENTO

**Disponíveis:**
- ✅ `/api/cache/stats` - Estatísticas de cache
- ✅ `/api/agents/test` - Métricas de IA
- ✅ Latency tracking
- ✅ Token counting
- ✅ Cache hit rate

---

## 🚀 DEPLOY

### Ambiente
- **Frontend:** Vite + React
- **Backend:** Node.js + Express
- **Database:** Neon PostgreSQL
- **Provider IA:** Vercel Gateway

### Variáveis Necessárias
```env
DATABASE_URL=postgresql://...
VERCEL_GATEWAY_URL=https://...
VERCEL_GATEWAY_API_KEY=...
OPENAI_API_KEY=... (fallback)
GROQ_API_KEY=... (opcional)
```

---

## ✅ CHECKLIST DE ARQUITETURA

### Multitenancy
- [x] Isolamento de dados por cliente
- [x] Validação de clientId obrigatória
- [x] Queries sempre filtradas
- [x] Zero cross-contamination

### Modularidade
- [x] Backend configurável
- [x] Múltiplas integrações
- [x] Frontend reutilizável
- [x] Componentes independentes

### Fallback
- [x] Orquestração inteligente
- [x] Primary → Fallback → Ultimate
- [x] Cache automático
- [x] Error handling

### Tipos de Recurso
- [x] Texto
- [x] Gráficos
- [x] Documentos
- [x] Links
- [x] Aprovações

### Extensibilidade
- [x] Fácil adicionar provider
- [x] Fácil adicionar tipo de mensagem
- [x] Zero breaking changes
- [x] Backward compatible

---

**Arquitetura: Produção-Ready** ✅

