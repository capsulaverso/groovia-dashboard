# 🔍 ANÁLISE COMPLETA DAS AUTOMAÇÕES DO PERFIL

## 🎯 OBJETIVO

Revisar de ponta a ponta as automações do perfil e descobrir por que não funcionam.

---

## 🔎 PROBLEMAS IDENTIFICADOS

### **1. ENDPOINTS FALTANDO**

#### **❌ Problema:**
O `ProfilePage` chama endpoints que não existiam no backend:
- `GET /api/conversations?userId=X&clientId=Y`
- `GET /api/documents?userId=X&clientId=Y`

#### **✅ Solução:**
Criados endpoints de compatibilidade no backend:

**1. GET /api/conversations** (linha 425-475)
```typescript
app.get('/api/conversations', async (req, res) => {
  // ... código ...
  const conversations = await storage.getUserConversations(userId, clientId);
  
  // Formatar para incluir nome do agente
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
});
```

**2. GET /api/documents** (linha 380-405)
```typescript
app.get('/api/documents', async (req, res) => {
  // ... código ...
  const documents = await storage.getUserDocuments(userId, clientId);
  
  // Formatar para ProfilePage
  const formattedDocuments = documents.map((doc: any) => ({
    ...doc,
    uploadedAt: doc.uploadDate || doc.uploadedAt,
    isVisible: !doc.isPrivate
  }));
  
  res.json(formattedDocuments);
});
```

---

### **2. CONTEXTPROGRESS NÃO CARREGADO**

#### **❌ Problema:**
O `ProfilePage` espera `contextProgress` nos agentes, mas o endpoint não retorna esse campo.

#### **✅ Solução:**
Integrado o hook `useAgentsProgress` no `ProfilePage`:

```typescript
const { getAgentProgress } = useAgentsProgress();

// Combinar agentes com progresso
const agents = useMemo(() => {
    return agentsRaw?.map(agent => ({
        ...agent,
        id: String(agent.id),
        contextProgress: getAgentProgress(Number(agent.id)),
        act: agent.act || 'Ato 01'
    })) || [];
}, [agentsRaw, getAgentProgress]);
```

---

## 📊 ESTRUTURA DE DADOS

### **Conversations esperado pelo ProfilePage:**
```typescript
interface Conversation {
    id: number;
    title: string;
    agentId: number;
    agentName: string;      // ← Campo adicionado
    messageCount: number;
    updatedAt: string;
}
```

### **Documents esperado pelo ProfilePage:**
```typescript
interface Document {
    id: number;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;     // ← Campo mapeado
    isVisible: boolean;     // ← Campo mapeado (!isPrivate)
    retentionDays: number;
}
```

### **Agents esperado pelo ProfilePage:**
```typescript
interface AgentCardData {
    id: string;
    title: string;
    description: string;
    contextProgress: number; // ← Campo adicionado
    act: string;
    internalCode: string;
    agentType: string;
    integrations?: Integration[];
}
```

---

## 🔧 CORREÇÕES APLICADAS

### **Backend (server/index.ts):**

1. **✅ Endpoint GET /api/conversations**
   - Busca conversas do usuário
   - Formata para incluir `agentName`
   - Compatível com ProfilePage

2. **✅ Endpoint GET /api/documents**
   - Busca documentos do usuário
   - Formata campos (`uploadedAt`, `isVisible`)
   - Compatível com ProfilePage

### **Frontend (components/pages/ProfilePage.tsx):**

1. **✅ Import useAgentsProgress**
   ```typescript
   import { useAgentsProgress } from '../../hooks/useAgentsProgress';
   ```

2. **✅ Integração com hook**
   ```typescript
   const { getAgentProgress } = useAgentsProgress();
   const agents = useMemo(() => {
       // Combina agentes com progresso
   }, [agentsRaw, getAgentProgress]);
   ```

3. **✅ Type fix**
   ```typescript
   const { data: agentsRaw } = useApi<any[]>(`/agents?...`);
   ```

---

## 🧪 COMO TESTAR

### **1. Verificar Endpoints:**
```bash
# Health check
curl http://localhost:3001/api/health

# Conversas do usuário
curl "http://localhost:3001/api/conversations?userId=1&clientId=1"

# Documentos do usuário
curl "http://localhost:3001/api/documents?userId=1&clientId=1"

# Agentes
curl "http://localhost:3001/api/agents?clientId=1"
```

### **2. Testar Frontend:**
1. Acesse: `http://localhost:5000`
2. Faça login
3. Acesse perfil
4. Navegue pelas tabs:
   - **Agentes**: Ver lista de agentes disponíveis e concluídos
   - **Histórico**: Ver conversas
   - **Cofre**: Ver documentos
   - **Configurações**: Ver settings

---

## ⚠️ PROBLEMAS RESTANTES

### **1. updateUser não persiste no backend**

**Arquivo:** `hooks/useUser.ts`
```typescript
const updateUser = (userData: Partial<User>) => {
    // ... apenas atualiza localStorage ...
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
};
```

**Problema:** Dados não são salvos no banco!

**Solução necessária:**
- Criar endpoint `PUT /api/users/:id`
- Chamar endpoint no `updateUser`

---

### **2. Configurações não persistem**

**Arquivo:** `components/pages/ProfilePage.tsx` (linha 550-567)
```typescript
<input type="checkbox" className="sr-only peer" defaultChecked={setting.defaultChecked} />
```

**Problema:** Checkboxes só têm `defaultChecked`, sem `onChange`!

**Solução necessária:**
- Adicionar state para cada checkbox
- Criar endpoint para salvar configurações
- Persistir no banco

---

### **3. Retenção de Dados não funcional**

**Arquivo:** `components/pages/ProfilePage.tsx` (linha 483-499)
```typescript
<button className="flex flex-col items-center...">
    <span className="material-icons-outlined">{option.icon}</span>
    <span className="text-sm">{option.label}</span>
</button>
```

**Problema:** Botões não têm `onClick`!

**Solução necessária:**
- Adicionar handler
- Salvar preferência
- Criar endpoint se necessário

---

### **4. Ações de Gerenciamento sem funcionalidade**

**Arquivo:** `components/pages/ProfilePage.tsx` (linha 514-534)
- "Apagar Todas as Conversas" - sem implementação
- "Ocultar Todos os Documentos" - sem implementação
- "Exportar Dados (GDPR)" - sem implementação

**Solução necessária:**
- Implementar cada ação
- Criar endpoints no backend
- Adicionar confirmações

---

### **5. Upload de Documentos**

**Arquivo:** `components/pages/ProfilePage.tsx` (linha 395-406)
```typescript
<button className="flex-1 bg-[#38ff81]...">
    <span>Novo Documento</span>
</button>
```

**Problema:** Botões sem implementação!

**Solução necessária:**
- Criar modal de upload
- Integrar com endpoint existente `POST /api/documents/upload`
- Atualizar lista após upload

---

## 📋 CHECKLIST DE AUTOMAÇÕES

| Automação | Status | Endpoint | Descrição |
|-----------|--------|----------|-----------|
| Buscar conversas | ✅ Funcionando | `GET /api/conversations` | Lista conversas com nome do agente |
| Buscar documentos | ✅ Funcionando | `GET /api/documents` | Lista documentos formatados |
| Buscar agentes | ✅ Funcionando | `GET /api/agents` | Lista agentes com progresso |
| Progresso por agente | ✅ Funcionando | `GET /api/users/:id/progress` | Hook integrado |
| Salvar perfil | ❌ Falhando | `PUT /api/users/:id` | Não existe |
| Configurações privacidade | ❌ Falhando | - | Sem persistência |
| Retenção de dados | ❌ Falhando | - | Sem handler |
| Apagar conversas | ❌ Falhando | `DELETE /api/conversations` | Sem implementação |
| Ocultar documentos | ❌ Falhando | `PUT /api/documents/:id` | Sem implementação |
| Export GDPR | ❌ Falhando | - | Sem implementação |
| Upload documento | ❌ Falhando | `POST /api/documents/upload` | Sem modal |

---

## 🎯 PRÓXIMOS PASSOS

### **Prioridade Alta:**
1. ✅ Endpoints `/api/conversations` e `/api/documents` (FEITO)
2. ✅ Integração `useAgentsProgress` (FEITO)
3. ❌ Criar `PUT /api/users/:id` para salvar perfil
4. ❌ Implementar salvamento de configurações

### **Prioridade Média:**
5. ❌ Implementar ações de gerenciamento (apagar, ocultar, exportar)
6. ❌ Criar modal de upload de documentos
7. ❌ Implementar retenção de dados

### **Prioridade Baixa:**
8. ❌ Adicionar validações nos formulários
9. ❌ Implementar feedback visual (toasts)
10. ❌ Adicionar loading states

---

## 📊 ANÁLISE DO CÓDIGO

### **Endpoints Necessários:**

```typescript
// ✅ JÁ EXISTEM
GET  /api/conversations?userId=X&clientId=Y
GET  /api/documents?userId=X&clientId=Y
GET  /api/agents?clientId=Y
GET  /api/users/:userId/progress?clientId=Y
PUT  /api/users/:userId/progress/:agentId?clientId=Y
POST /api/documents/upload

// ❌ FALTANDO
PUT  /api/users/:id
DELETE /api/conversations (bulk delete)
PUT  /api/documents/:id (ocultar)
GET  /api/users/:id/export (GDPR)
POST /api/users/:id/settings
```

---

## 🔍 TABELAS DO BANCO

### **Tabelas Usadas:**

| Tabela | Uso no Perfil |
|--------|---------------|
| `users` | Dados do usuário |
| `agents` | Lista de agentes |
| `conversations` | Histórico de conversas |
| `messages` | Mensagens das conversas |
| `documents` | Documentos do usuário |
| `user_progress` | Progresso por agente |
| `user_settings` | ❌ NÃO EXISTE (precisa criar) |

**Nova tabela sugerida:**
```sql
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ CONCLUSÃO

### **O que funciona:**
✅ Visualização de agentes com progresso  
✅ Visualização de conversas  
✅ Visualização de documentos  

### **O que não funciona:**
❌ Salvar alterações do perfil  
❌ Configurações de privacidade  
❌ Retenção de dados  
❌ Ações de gerenciamento  
❌ Upload de documentos  

### **Principais causas:**
1. Endpoints faltando (corrigido parcialmente)
2. Falta de integração backend para ações
3. Campos não mapeados corretamente
4. Falta de handlers para eventos

---

## 🚀 COMO TESTAR AGORA

```bash
# 1. Reiniciar servidor
npm run server:no-telemetry

# 2. Acessar perfil
http://localhost:5000 → Login → Perfil

# 3. Navegar tabs
- Agentes: Deve mostrar lista
- Histórico: Deve mostrar conversas
- Cofre: Deve mostrar documentos
- Configurações: ❌ Não persiste mudanças
```

**Teste específico:**
```bash
# Ver conversas
curl "http://localhost:3001/api/conversations?userId=1&clientId=1"

# Ver documentos
curl "http://localhost:3001/api/documents?userId=1&clientId=1"
```

---

**Próximo passo:** Implementar `PUT /api/users/:id` para salvar perfil! 🚀

