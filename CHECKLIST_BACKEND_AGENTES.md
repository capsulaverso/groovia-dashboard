# ✅ CHECKLIST - IMPLEMENTAR BACKEND DE AGENTES

## ENDPOINTS A IMPLEMENTAR

### 1. POST /api/agents (Criar Agente)
- [ ] Adicionar rota em `server/index.ts`
- [ ] Validar autenticação (requireAuth)
- [ ] Validar campos obrigatórios
- [ ] Encriptar credentials se necessário
- [ ] Chamar `storage.createAgent()`
- [ ] Retornar agente criado com ID
- [ ] Testar com Postman/Thunder Client

### 2. PUT /api/agents/:id (Atualizar Agente)
- [ ] Adicionar rota em `server/index.ts`
- [ ] Validar autenticação (requireAuth)
- [ ] Validar ID do agente
- [ ] Validar permissões (owner ou admin)
- [ ] Validar campos
- [ ] Encriptar credentials se necessário
- [ ] Chamar `storage.updateAgent()`
- [ ] Retornar agente atualizado
- [ ] Testar com Postman

### 3. DELETE /api/agents/:id (Deletar Agente)
- [ ] Adicionar rota em `server/index.ts`
- [ ] Validar autenticação (requireAuth)
- [ ] Validar ID do agente
- [ ] Validar permissões (owner ou admin)
- [ ] Chamar `storage.deleteAgent()`
- [ ] Retornar sucesso
- [ ] Testar com Postman

### 4. POST /api/webhooks/test (Testar Webhook)
- [ ] Adicionar rota em `server/index.ts`
- [ ] Validar URL (não deixar vazia)
- [ ] Validar headers JSON
- [ ] Fazer HTTP request real ao webhook
  - [ ] Método GET/POST/PUT/DELETE
  - [ ] Headers personalizados
  - [ ] Payload customizado
- [ ] Coletar métricas
  - [ ] Status code
  - [ ] Latência (ms)
  - [ ] Response body snippet
- [ ] Suportar 3 modos
  - [ ] send: apenas envio
  - [ ] receive: GET request
  - [ ] both: ambos
- [ ] Retornar resultados estruturados
- [ ] Testar com Postman

### 5. POST /api/agents/:id/respond (Testar Resposta)
- [ ] Adicionar rota em `server/index.ts`
- [ ] Validar autenticação (requireAuth)
- [ ] Validar ID do agente
- [ ] Carregar agente do banco
- [ ] Extrair system prompt do agente
- [ ] Escolher provider baseado em integração
  - [ ] WebHook: fazer HTTP request
  - [ ] N8N: disparar workflow
  - [ ] LangChain: chamar agente
- [ ] Chamar AI model com system prompt + mensagem
- [ ] Coletar métricas
  - [ ] Latência
  - [ ] Tokens usados
  - [ ] Modelo utilizado
- [ ] Retornar resposta estruturada
- [ ] Testar com Postman

---

## STORAGE METHODS A ADICIONAR

### File: `server/storage.ts`

```typescript
// 1. CREATE
async createAgent(clientId: number, agentData: any): Promise<Agent> {
  // INSERT INTO agents
  // RETURN agent com ID
}

// 2. UPDATE
async updateAgent(agentId: number, agentData: any): Promise<Agent> {
  // UPDATE agents SET ...
  // RETURN agent updated
}

// 3. DELETE
async deleteAgent(agentId: number): Promise<void> {
  // DELETE FROM agents
}

// 4. GET BY ID (se não existir)
async getAgentById(agentId: number): Promise<Agent | null> {
  // SELECT * FROM agents WHERE id = ?
  // RETURN agent or null
}

// 5. GET BY CLIENT (se não existir)
async getAgentsByClient(clientId: number): Promise<Agent[]> {
  // SELECT * FROM agents WHERE clientId = ?
  // RETURN agents array
}
```

---

## INTEGRAÇÃO FRONTEND

### File: `components/AdminDashboard.tsx`

- [ ] Remover todas as references a localStorage
- [ ] Adicionar `useEffect` para buscar agentes
- [ ] Modificar `handleSaveAgent` para chamar API
  - [ ] POST /api/agents se novo
  - [ ] PUT /api/agents/:id se existente
- [ ] Modificar `handleDeleteAgent` para chamar API
  - [ ] DELETE /api/agents/:id
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Adicionar toast notifications (opcional)
- [ ] Recarregar lista após operação

---

## TESTES MANUAIS

### 1. Criar Agente
```bash
POST /api/agents
Content-Type: application/json
x-session-token: <token>
x-user-id: 1
x-client-id: 1

{
  "name": "Test Agent",
  "description": "Test Description",
  "type": "Agente de Diagnóstico",
  "act": "Ato 01",
  "status": "active",
  "integration": {
    "type": "webhook",
    "webhookUrl": "https://example.com/webhook",
    "method": "POST",
    "headers": {"Authorization": "Bearer token"}
  }
}

Expected: 201 Created
{
  "agent": {
    "id": 123,
    "clientId": 1,
    "name": "Test Agent",
    ...
  }
}
```

### 2. Atualizar Agente
```bash
PUT /api/agents/123
Content-Type: application/json
x-session-token: <token>
x-user-id: 1
x-client-id: 1

{
  "name": "Updated Agent",
  "description": "Updated Description",
  ...
}

Expected: 200 OK
{
  "agent": { ... }
}
```

### 3. Deletar Agente
```bash
DELETE /api/agents/123
x-session-token: <token>
x-user-id: 1
x-client-id: 1

Expected: 200 OK
{
  "success": true
}
```

### 4. Testar Webhook
```bash
POST /api/webhooks/test
Content-Type: application/json

{
  "url": "https://webhook.site/your-id",
  "method": "POST",
  "headers": {"Authorization": "Bearer test"},
  "mode": "send",
  "payload": {
    "test": true,
    "message": "Hello Webhook"
  }
}

Expected: 200 OK
{
  "success": true,
  "results": {
    "send": {
      "ok": true,
      "status": 200,
      "durationMs": 150,
      "bodySnippet": "OK"
    }
  }
}
```

### 5. Testar Resposta Agente
```bash
POST /api/agents/123/respond
Content-Type: application/json
x-session-token: <token>
x-user-id: 1
x-client-id: 1

{
  "message": "Qual é o seu propósito?",
  "clientId": 1
}

Expected: 200 OK
{
  "success": true,
  "message": "Meu propósito é ajudar...",
  "model": "gpt-4o-mini",
  "latencyMs": 850,
  "tokensUsed": 120
}
```

---

## VALIDAÇÕES IMPORTANTES

- [ ] Admin only: DELETE, PUT, POST devem verificar role
- [ ] Client isolation: cada cliente vê apenas seus agentes
- [ ] Field validation: nome/descrição obrigatórios
- [ ] Integration validation: URL válida, headers JSON válido
- [ ] Error handling: retornar erros estruturados
- [ ] Logging: logar todas as operações

---

## PERFORMANCE

- [ ] Índice em agents(clientId) para queries rápidas
- [ ] Índice em agents(status) para filtros
- [ ] Pagination se houver muitos agentes
- [ ] Cache de agentes em Redis (opcional)

---

## SEGURANÇA

- [ ] Encriptar API keys / tokens em credentials
- [ ] Não retornar credentials em GET
- [ ] Validar origem de webhook tests
- [ ] Rate limiting para webhooks test
- [ ] Audit log de modificações

---

## STATUS DE IMPLEMENTAÇÃO

| Endpoint | Status | Prioridade |
|----------|--------|-----------|
| POST /api/agents | ❌ | 1 |
| PUT /api/agents/:id | ❌ | 2 |
| DELETE /api/agents/:id | ❌ | 3 |
| POST /api/webhooks/test | ❌ | 4 |
| POST /api/agents/:id/respond | ❌ | 5 |

---

## PRÓXIMOS PASSOS

1. Implementar endpoints na ordem acima
2. Testar cada um com Postman
3. Integrar frontend com API
4. Fazer testes E2E
5. Deploy

**Tempo Total Estimado:** 3-4 horas

---

**Última atualização:** $(Get-Date)**
**Responsável:** Backend Team
