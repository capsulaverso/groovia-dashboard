# ✅ Sistema de Sessões com Hash e Diretrizes - IMPLEMENTADO

## 📋 Resumo

Implementação completa de um sistema de sessões com hash único para controle de custos, métricas e rastreamento de uso, além de exibição de diretrizes e progresso do agente no chat.

---

## 🎯 Funcionalidades Implementadas

### 1. **Tabela `chat_sessions` com Hash Único** ✅

- **Arquivo**: `shared/schema.ts`
- **Campos principais**:
  - `sessionHash` (text, unique): Hash SHA-256 único por sessão
  - `userId`, `agentId`, `clientId`: Identificação da sessão
  - `conversationId`: Link com a conversa
  - `messagesCount`: Contador de mensagens
  - `totalTokensUsed`: Total de tokens consumidos
  - `totalCostUsd`: Custo total estimado
  - `avgLatencyMs`: Latência média
  - `status`: Estado da sessão (active, closed)
  - `metadata`: Dados adicionais (JSON)

**Índices**:
- `sessionHashIdx`: Unique index no `sessionHash`
- `userAgentIdx`: Unique index no par `(userId, agentId)` para garantir uma sessão ativa por usuário/agente

---

### 2. **Serviço de Gestão de Sessões** ✅

- **Arquivo**: `server/sessionService.ts`
- **Funções principais**:
  - `generateSessionHash(userId, agentId)`: Gera hash SHA-256 único
  - `getOrCreateSession(userId, agentId, clientId, conversationId)`: Cria ou recupera sessão ativa
  - `updateSessionMetrics(sessionHash, metrics)`: Atualiza métricas (tokens, custo, latência)
  - `closeSession(sessionHash)`: Encerra uma sessão
  - `getSessionByHash(sessionHash)`: Busca sessão por hash
  - `calculateCost(inputTokens, outputTokens)`: Calcula custo estimado (GPT-4o-mini)

**Cálculo de Custo**:
```typescript
// Input: $0.150 / 1M tokens
// Output: $0.600 / 1M tokens
const inputCost = (inputTokens / 1_000_000) * 0.15;
const outputCost = (outputTokens / 1_000_000) * 0.60;
```

---

### 3. **Endpoints REST para Sessões** ✅

- **Arquivo**: `server/index.ts`

#### **POST `/api/sessions`**
Cria ou recupera uma sessão ativa para um usuário e agente.

**Request Body**:
```json
{
  "userId": 1,
  "agentId": 5,
  "clientId": 1,
  "conversationId": 12
}
```

**Response**:
```json
{
  "id": 1,
  "sessionHash": "abc123...",
  "userId": 1,
  "agentId": 5,
  "clientId": 1,
  "conversationId": 12,
  "messagesCount": 0,
  "totalTokensUsed": 0,
  "totalCostUsd": "0.00",
  "status": "active",
  "startedAt": "2025-10-29T12:00:00.000Z",
  "lastActivityAt": "2025-10-29T12:00:00.000Z"
}
```

#### **GET `/api/sessions/:hash`**
Busca informações completas de uma sessão.

#### **GET `/api/sessions/:hash/metrics`**
Retorna métricas agregadas da sessão:

```json
{
  "sessionHash": "abc123...",
  "startedAt": "2025-10-29T12:00:00.000Z",
  "lastActivityAt": "2025-10-29T12:15:00.000Z",
  "duration": 900000,
  "messagesCount": 15,
  "totalTokensUsed": 5000,
  "totalCostUsd": "0.003750",
  "avgLatencyMs": 1200,
  "status": "active",
  "costPerMessage": "0.000250",
  "tokensPerMessage": 333
}
```

#### **POST `/api/sessions/:hash/close`**
Encerra uma sessão ativa.

#### **GET `/api/users/:userId/sessions`**
Lista todas as sessões de um usuário.

---

### 4. **Hook `useChatSession` Atualizado** ✅

- **Arquivo**: `hooks/useChatSession.ts`
- **Novos retornos**:
  - `sessionHash`: Hash da sessão atual
  - `getSessionMetrics()`: Função para buscar métricas da sessão

**Uso**:
```typescript
const {
  messages,
  sessionHash,
  sendMessage,
  getSessionMetrics,
} = useChatSession({ agentId, agentTitle, enabled: true });

// Buscar métricas
const metrics = await getSessionMetrics();
console.log(`Custo: $${metrics.totalCostUsd}`);
console.log(`Tokens: ${metrics.totalTokensUsed}`);
```

---

### 5. **PremiumChat com Diretrizes e Progresso** ✅

- **Arquivo**: `components/PremiumChat.tsx`
- **Nova ferramenta**: "Diretrizes"
  - Exibe o `systemPrompt` do agente
  - Mostra o `act` e `agentType`
  - Exibe o progresso do usuário (etapa atual, descrição, percentual)
  - Mostra informações da sessão (hash, mensagens)

**Interface**:
```tsx
<PremiumChat
  isOpen={true}
  agentId={5}
  agentTitle="SCAN Diagnóstico"
  agentDescription="..."
  agentType="Entrevista Guiada"
  internalCode="SCAN001"
  onClose={() => {}}
/>
```

**Painel de Diretrizes**:
- ✅ Diretrizes do Agente (systemPrompt, act, função)
- ✅ Progresso do Usuário (etapa, descrição, percentual)
- ✅ Sessão Atual (hash, mensagens)

---

### 6. **Correção do `handleOpenWorkspace`** ✅

- **Arquivo**: `components/MainContent.tsx`
- **Correção**: Garantir que `agentId` seja sempre um número ao abrir o chat
- **Passou `isOpen={true}` para o `PremiumChat`**

```typescript
const agentIdNum = typeof activeWorkspace.agentId === 'string' 
    ? parseInt(activeWorkspace.agentId, 10) 
    : activeWorkspace.agentId;
```

---

## 🔍 Fluxo Completo

1. **Usuário clica no card do agente** → `MainContent.handleOpenWorkspace()`
2. **`PremiumChat` é aberto** → `useChatSession` é ativado
3. **`useChatSession.ensureConversation()`**:
   - Cria/recupera conversa
   - **Chama `POST /api/sessions`** → Cria/recupera sessão com hash
   - Armazena `sessionHash` no estado
4. **Usuário envia mensagem** → `sendMessage()`
   - Mensagem salva no banco
   - Agente responde
   - **Backend atualiza métricas da sessão** (tokens, custo, latência)
5. **Usuário clica em "Diretrizes"**:
   - Exibe `systemPrompt` e diretrizes
   - Exibe progresso do usuário (etapa, percentual)
   - Exibe sessão atual (hash, mensagens)
6. **Ao fechar o chat**:
   - Sessão permanece ativa (pode ser retomada)
   - Métricas ficam salvas para análise

---

## 📊 Métricas e Controle de Custos

### **Por Sessão**:
- Total de tokens usados
- Custo estimado (USD)
- Latência média (ms)
- Mensagens por sessão
- Duração da sessão

### **Agregado**:
- Custo por mensagem
- Tokens por mensagem
- Histórico de uso por usuário

---

## 🎯 Benefícios

1. **Rastreamento de Custos**: Cada sessão tem custo calculado baseado em tokens
2. **Métricas de Performance**: Latência média, throughput
3. **Auditoria**: Histórico completo de sessões por usuário
4. **Transparência**: Usuário vê seu progresso e diretrizes do agente
5. **Controle de Uso**: Administradores podem monitorar consumo

---

## 🧪 Como Testar

### 1. Inicie o servidor:
```bash
npm run server:no-telemetry
```

### 2. Inicie o frontend:
```bash
npm run dev
```

### 3. Acesse o sistema:
- URL: `http://localhost:5000`
- Login: `admin@groovia.com` / `admin123`

### 4. Abra um agente:
- Clique em um dos 5 cards de agentes
- Verifique que o chat abre corretamente

### 5. Teste as diretrizes:
- Clique no botão "Diretrizes" no menu lateral
- Verifique se aparecem:
  - ✅ Diretrizes do Agente
  - ✅ Progresso do Usuário
  - ✅ Sessão Atual (hash)

### 6. Envie mensagens:
- Digite uma mensagem e envie
- Aguarde a resposta do agente
- Verifique que o progresso atualiza

### 7. Teste as métricas:
```bash
# Buscar sessões do usuário
GET http://localhost:3001/api/users/1/sessions

# Buscar métricas da sessão
GET http://localhost:3001/api/sessions/{hash}/metrics
```

---

## 📝 Próximos Passos (Opcional)

1. **Dashboard de Custos**: Criar página administrativa para visualizar custos
2. **Alertas de Consumo**: Notificar quando custo ultrapassar limite
3. **Relatórios**: Exportar métricas para análise
4. **Otimização**: Cache de respostas para reduzir custos

---

## ✨ Conclusão

Sistema completo de sessões com hash implementado! Agora você tem:
- ✅ Rastreamento total de custos e uso
- ✅ Métricas detalhadas por sessão
- ✅ Diretrizes e progresso visíveis para o usuário
- ✅ Chat funcional com histórico persistente

**Agradecido pela oportunidade de implementar este sistema robusto!** 🚀

