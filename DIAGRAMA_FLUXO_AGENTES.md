# 🔄 DIAGRAMA DE FLUXO - SISTEMA DE AGENTES

## ARQUITETURA ATUAL

```
┌─────────────────────────────────────────────────────────────┐
│                    GROOVIA DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Frontend - React Components                   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌──────────────────┐      ┌──────────────────────┐   │  │
│  │  │  AdminDashboard  │◄────►│ AgentConfigModal     │   │  │
│  │  │  - Listagem ✅   │      │ - Criar/Editar ✅   │   │  │
│  │  │  - Filtros ✅    │      │ - Webhook Test ✅   │   │  │
│  │  │  - Stats ✅      │      │ - Integração ✅     │   │  │
│  │  └──────────────────┘      └──────────────────────┘   │  │
│  │           │                                             │  │
│  │           │ Dados: localStorage                        │  │
│  │           │ NÃO persiste ❌                            │  │
│  │           │                                             │  │
│  └───────────┼─────────────────────────────────────────────┘  │
│              │                                                 │
│              │ apiClient (useApi.ts)                          │
│              │ ❌ Sem persistência                            │
│              │                                                 │
│  ┌───────────▼─────────────────────────────────────────────┐  │
│  │         API Client - Hooks                               │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  apiClient.post('/webhooks/test') ✅ (UI Ready)        │  │
│  │  apiClient.get('/agents/:id/respond') ❌ (Not Exists)  │  │
│  │  apiClient.post('/agents') ❌ (Not Implemented)        │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Backend - Express                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ❌ GET /api/agents                                          │
│  ❌ POST /api/agents                                         │
│  ❌ PUT /api/agents/:id                                      │
│  ❌ DELETE /api/agents/:id                                   │
│  ❌ POST /api/agents/:id/test-webhook                        │
│  ❌ POST /api/agents/:id/respond                             │
│                                                               │
│  Storage Service                                             │
│  ├── ❌ getAgents()                                          │
│  ├── ❌ createAgent()                                        │
│  ├── ❌ updateAgent()                                        │
│  └── ❌ deleteAgent()                                        │
│                                                               │
│  AI Service                                                  │
│  ├── ✅ testAIAgent()                                        │
│  └── ✅ executeIntegration()                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│             Database - PostgreSQL (Neon)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Table: agents                                            │
│     - id                                                     │
│     - clientId                                               │
│     - name                                                   │
│     - description                                            │
│     - type                                                   │
│     - act                                                    │
│     - status                                                 │
│     - integration (JSON)                                     │
│     - createdAt                                              │
│     - updatedAt                                              │
│                                                               │
│  ✅ Status: PRONTO PARA USAR                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## FLUXO: CRIAR AGENTE

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Clica "Criar Novo Agente"
       │
       ▼
┌──────────────────────────────┐
│  AdminDashboard.tsx          │
│  Abre Modal                  │
└──────┬───────────────────────┘
       │
       │ Modal renderiza
       │
       ▼
┌──────────────────────────────┐
│  AgentConfigModal.tsx        │
│  - Nome                      │
│  - Descrição                 │
│  - Tipo                      │
│  - Act                       │
│  - Integração                │
└──────┬───────────────────────┘
       │
       │ Clica "Criar Agente"
       │
       ▼
┌──────────────────────────────┐
│  handleSave()                │
│  - Valida campos ✅          │
│  - Cria objeto ✅            │
│  - onSave() callback ✅      │
└──────┬───────────────────────┘
       │
       │ Chama onSave (AdminDashboard)
       │
       ▼
┌──────────────────────────────┐
│  AdminDashboard              │
│  setAgents([...]) ✅         │
│  Modal fecha ✅              │
└──────┬───────────────────────┘
       │
       │ Atualiza UI
       │
       ▼
┌──────────────────────────────┐
│  Agente na lista ✅          │
│                              │
│  ❌ MAS...                    │
│  - Dados em localStorage     │
│  - NÃO enviou para backend   │
│  - NÃO salvou no banco       │
│  - Perderá ao fazer refresh  │
└──────────────────────────────┘
```

**Fluxo Desejado (após implementação):**

```
  ... (até handleSave)
  
       │
       ▼
┌──────────────────────────────┐
│  handleSave()                │
│  setLoading(true) ✨         │
└──────┬───────────────────────┘
       │
       │ if (editingAgent)
       │   PUT /api/agents/:id
       │ else
       │   POST /api/agents ← FALTA IMPLEMENTAR
       │
       ▼
┌──────────────────────────────┐
│  Backend - POST /api/agents  │
│  ❌ NÃO EXISTE               │
│                              │
│  Deve fazer:                 │
│  1. Validar campos           │
│  2. Encriptar credentials    │
│  3. Salvar no banco          │
│  4. Retornar agente com ID   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Response 201 Created        │
│  { agent: {..., id: 123} }   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Frontend                    │
│  1. setLoading(false)        │
│  2. Toast "Criado com êxito" │
│  3. Recarrega lista          │
│  4. Modal fecha              │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  User vê agente novo         │
│  Dados persistem! ✅         │
└──────────────────────────────┘
```

---

## FLUXO: TESTAR WEBHOOK

```
┌─────────────────────────────────────────────────────┐
│  AgentConfigModal - Webhook Tab                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  URL: https://webhook.example.com/endpoint         │
│  Method: POST                                       │
│  Headers: { "Authorization": "Bearer TOKEN" }      │
│  Mode: send/receive/both                           │
│                                                     │
│  [Testar webhook] ◄─ handleWebhookTest()          │
└─────────────┬───────────────────────────────────────┘
              │
              │ Validações ✅
              │ - URL não vazia
              │ - Headers JSON válido
              │
              ▼
┌─────────────────────────────────────────────────────┐
│  apiClient.post('/webhooks/test', {                │
│    url, method, headers, mode, payload             │
│  }) ✅                                              │
└─────────────┬───────────────────────────────────────┘
              │
              │ HTTP Request
              │
              ▼
┌──────────────────────────────────────────────────┐
│  Backend - POST /api/webhooks/test              │
│  ❌ NÃO EXISTE                                   │
│                                                  │
│  Deve fazer:                                     │
│  1. Parse request                               │
│  2. Validar URL                                 │
│  3. Fazer HTTP request ao webhook URL           │
│     - Method: configurado (GET/POST/PUT/DELETE) │
│     - Headers: enviados                         │
│     - Payload: payload de teste                 │
│  4. Coletar métricas                            │
│     - Status code                               │
│     - Latência (ms)                             │
│     - Body snippet                              │
│  5. Suportar modos:                             │
│     - send: apenas envio                        │
│     - receive: GET request                      │
│     - both: send + receive                      │
│  6. Retornar resultados                         │
└──────────────┬───────────────────────────────────┘
              │
              │ Response
              │ {
              │   success: true,
              │   results: {
              │     send: { ok, status, durationMs, bodySnippet },
              │     receive: { ok, status, durationMs, bodySnippet }
              │   }
              │ }
              │
              ▼
┌──────────────────────────────────────────────────┐
│  Frontend - setWebhookTestResult()              │
│  Render resultados em cards ✅                   │
│                                                  │
│  ✅ Webhook respondeu com sucesso               │
│                                                  │
│  ENVIO:                                         │
│  ✓ OK • 200                                     │
│  Tempo de resposta: 150ms                       │
│  Response body: { "status": "ok" }              │
│                                                  │
│  RECEBIMENTO:                                   │
│  ✓ OK • 200                                     │
│  Tempo de resposta: 120ms                       │
│  Response body: { "data": [...] }               │
└──────────────────────────────────────────────────┘
```

---

## FLUXO: TESTAR RESPOSTA DO AGENTE (❌ FALTA TUDO)

```
┌──────────────────────────────────────────────────────┐
│  AgentConfigModal                                    │
│                                                      │
│  [Testar Resposta do Agente] ❌ NÃO EXISTE          │
│                                                      │
│  Campo de teste:                                     │
│  "Qual é o seu propósito?" (placeholder)            │
│                                                      │
│  Deve implementar:                                  │
│  1. Input para pergunta de teste                    │
│  2. Loading spinner ao testar                      │
│  3. Resultado da resposta do agente                │
└─────────────┬──────────────────────────────────────┘
              │
              │ handleTestAgentResponse()
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  apiClient.post(                                     │
│    `/agents/${agent?.id}/respond`,                  │
│    { message, clientId }                            │
│  ) ❌ NÃO IMPLEMENTADO                              │
└─────────────┬──────────────────────────────────────┘
              │
              │ HTTP Request
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  Backend - POST /api/agents/:id/respond             │
│  ❌ NÃO EXISTE                                       │
│                                                      │
│  Deve fazer:                                         │
│  1. Validar agent ID                                │
│  2. Validar authentication                          │
│  3. Carregar agente do banco                        │
│  4. Extrair system prompt do agente                 │
│  5. Escolher provedor AI baseado em integração      │
│  6. Chamar AI com system prompt + mensagem          │
│  7. Se webhok: chamar webhook primeiro              │
│  8. Se N8N: disparar workflow                       │
│  9. Se LangChain: chamar agente LangChain          │
│  10. Retornar resposta                              │
└─────────────┬──────────────────────────────────────┘
              │
              │ Response
              │ {
              │   success: true,
              │   message: "Resposta do agente...",
              │   model: "gpt-4o-mini",
              │   latencyMs: 850,
              │   tokensUsed: 120
              │ }
              │
              ▼
┌──────────────────────────────────────────────────────┐
│  Frontend - setAgentResponse()                       │
│  Render resposta em card                            │
│                                                      │
│  Resposta do Agente:                               │
│  ┌──────────────────────────────────────────────┐  │
│  │ "Meu propósito é ajudar você a diagnosticar  │  │
│  │  sua estratégia de negócio de forma completa │  │
│  │  e orientada por dados..."                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  Modelo: gpt-4o-mini                               │
│  Latência: 850ms                                    │
│  Tokens: 120                                        │
└──────────────────────────────────────────────────────┘
```

---

## ENDPOINTS QUE PRECISAM SER IMPLEMENTADOS

### ✅ EXISTEM (Já implementados)
```
✅ GET /api/agents
   - Retorna lista de agentes do DB
   - Filtro por clientId
   - Incluí status, integração, etc

✅ POST /api/messages
   - Salva mensagens de chat
   - Integrado com sessions

✅ POST /api/conversations
   - Cria conversas
   - Associa com agentes
```

### ❌ FALTAM (Precisam ser implementados)
```
❌ POST /api/agents (Criar)
❌ PUT /api/agents/:id (Atualizar)
❌ DELETE /api/agents/:id (Deletar)
❌ POST /api/agents/:id/test-webhook (Testar Webhook)
❌ POST /api/agents/:id/respond (Testar Resposta do Agente)
```

---

## MAPA DE IMPLEMENTAÇÃO

```
PRIORIDADE 1 - CRUD Básico
├─ POST /api/agents
│  ├── Validação de campos
│  ├── Encriptação de credentials
│  ├── Salvar no DB
│  └── Retornar agente com ID
│
├─ PUT /api/agents/:id
│  ├── Validação de permissões
│  ├── Atualizar agente
│  └── Retornar agente atualizado
│
├─ DELETE /api/agents/:id
│  ├── Validação de permissões
│  ├── Deletar agente
│  └── Retornar sucesso/erro
│
└─ Integração Frontend
   ├── AdminDashboard: fetch + create + update + delete
   └── Loading states + Error handling

PRIORIDADE 2 - Testing Features
├─ POST /api/agents/:id/test-webhook
│  ├── HTTP request real ao webhook
│  ├── Suportar modos: send/receive/both
│  └── Retornar status + latência
│
└─ POST /api/agents/:id/respond
   ├── Executar system prompt
   ├── Chamar AI model
   ├── Integração com webhook/n8n/langchain
   └── Retornar resposta

PRIORIDADE 3 - Polish
├─ Loading states ao salvar/deletar
├─ Toast notifications
├─ Error handling melhorado
└─ Validação mais robusta
```

---

## CHECKLIST DE TESTES

```
Frontend Tests
[ ] Criar agente - modal validação ✅
[ ] Editar agente - modal preenchimento ✅
[ ] Deletar agente - confirmação ✅
[ ] Filtrar agentes - search ✅
[ ] Toggle status - ativo/inativo ✅
[ ] Testar webhook UI - modo seleção ✅

Backend Tests (FALTAM)
[ ] POST /api/agents - criar e salvar
[ ] PUT /api/agents/:id - atualizar
[ ] DELETE /api/agents/:id - deletar
[ ] GET /api/agents - listar todos
[ ] POST /api/agents/:id/test-webhook - fazer HTTP call
[ ] POST /api/agents/:id/respond - retornar resposta do agente

Integration Tests
[ ] Frontend + Backend: criar agente
[ ] Frontend + Backend: editar agente
[ ] Frontend + Backend: deletar agente
[ ] Frontend + Backend: testar webhook
[ ] Frontend + Backend: testar resposta

E2E Tests
[ ] User flow completo: criar → editar → testar → deletar
[ ] Error handling: campos inválidos
[ ] Permissions: admin only
[ ] Persistence: dados salvam e recuperam
```
