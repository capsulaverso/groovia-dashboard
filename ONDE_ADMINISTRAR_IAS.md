# 🎛️ ONDE ADMINISTRAR MODELOS DE IA

## 📍 LOCALIZAÇÃO

### **Página de Controle de Agentes**
- **URL:** `http://localhost:5000/controle-agentes`
- **Arquivo:** `components/pages/AgentsControlPage.tsx`
- **Rota:** `/controle-agentes`

---

## ✅ O QUE JÁ EXISTE

### **1. Visualização**
- ✅ Ver `aiModel` e `aiProvider` de cada agente
- ✅ Lista completa de agentes com suas configurações
- ✅ Indicador visual do modelo usado

### **2. Edição Básica**
- ✅ Editar nome, descrição, tipo
- ✅ Configurar webhooks
- ✅ Ativar/desativar agentes
- ✅ Configurar sistema de mensagens

### **3. Builder Avançado**
- ✅ Skills (habilidades do agente)
- ✅ Workflow (fluxo lógico)
- ✅ Context & Persistence
- ✅ UI Config (interface)

### **4. Teste**
- ✅ Botão "Testar" em cada agente
- ✅ Resultado com métricas:
  - Provider e modelo usado
  - Latência em ms
  - Tokens consumidos
  - Status de cache
  - Status de fallback

---

## ❌ O QUE NÃO EXISTE (AINDA)

### **Interface Visual para Modelos**
Atualmente **NÃO é possível** alterar via interface:
- ⚠️ Selecionar `aiProvider` (replit, openai, groq)
- ⚠️ Selecionar `aiModel` (gpt-4o-mini, gpt-4o, etc)
- ⚠️ Visualizar custos por modelo
- ⚠️ Comparar performance entre modelos

---

## 🔧 COMO ALTERAR AGORA

### **Opção 1: Via SQL (Recomendado)**
```sql
-- Exemplo: Alterar um agente específico
UPDATE agents 
SET ai_model = 'gpt-4o', 
    ai_provider = 'openai',
    updated_at = NOW()
WHERE internal_code = 'AGT-GI-006';  -- Groovia Intelligence

-- Exemplo: Alterar todos os agentes estratégicos
UPDATE agents 
SET ai_model = 'gpt-4o',
    updated_at = NOW()
WHERE id IN (8, 9, 10, 11, 12, 13, 14, 15);
```

### **Opção 2: Via Script Node.js**
```javascript
// Criar: update-agents-model.js
import 'dotenv/config';
import { pool } from './server/db.js';

async function updateModels() {
  // Exemplo: Atualizar Groovia Intelligence
  await pool.query(`
    UPDATE agents 
    SET ai_model = 'gpt-4o', 
        ai_provider = 'openai',
        updated_at = NOW()
    WHERE internal_code = 'AGT-GI-006'
  `);
  
  console.log('✅ Modelo atualizado!');
  await pool.end();
}

updateModels();
```

Execute:
```bash
npx tsx update-agents-model.js
```

### **Opção 3: Via API**
```bash
# Alterar modelo via PUT request
curl -X PUT http://localhost:3001/api/agents/12 \
  -H "Content-Type: application/json" \
  -d '{
    "aiModel": "gpt-4o",
    "aiProvider": "openai"
  }'
```

---

## 🗂️ ONDE ESTÁ ARMAZENADO

### **Banco de Dados**
**Tabela:** `agents`

**Campos importantes:**
- `ai_provider` (TEXT) - replit, openai, groq, vercel-gateway
- `ai_model` (TEXT) - gpt-4o-mini, gpt-4o, llama-3.3-70b, etc
- `system_prompt` (TEXT) - Instruções completas do agente
- `fallback_prompt` (TEXT) - Mensagem de erro

**SQL para verificar:**
```sql
SELECT 
  id, 
  internal_code, 
  title, 
  ai_provider, 
  ai_model 
FROM agents 
ORDER BY id;
```

---

## 🎯 RECOMENDAÇÕES POR USO

### **Desenvolvimento/Testes**
```sql
UPDATE agents SET ai_model = 'gpt-4o-mini', ai_provider = 'replit';
```
- ✅ Muito econômico
- ✅ Boa qualidade
- ✅ Rate limits generosos

### **Produção - Balanceado**
```sql
UPDATE agents SET ai_model = 'gpt-4o', ai_provider = 'openai';
```
- ✅ Excelente qualidade
- ✅ Custo médio-alto
- ⚠️ Requer `OPENAI_API_KEY`

### **Produção - Performance**
```sql
UPDATE agents SET ai_model = 'llama-3.3-70b-versatile', ai_provider = 'groq';
```
- ✅ Ultra rápido
- ✅ Baixo custo
- ⚠️ Requer `GROQ_API_KEY`

### **Groovia Intelligence (Agente Crítico)**
```sql
UPDATE agents 
SET ai_model = 'gpt-4o', ai_provider = 'openai'
WHERE internal_code = 'AGT-GI-006';
```
- ✅ Máxima qualidade
- ✅ Melhor raciocínio
- ✅ Contexto amplo

---

## 🚀 PRÓXIMO PASSO: IMPLEMENTAR UI

### **Onde Implementar**
**Arquivo:** `components/AdminDashboard.tsx` ou `AgentConfigModal.tsx`

**Campos a adicionar:**
```tsx
<div className="flex gap-4">
  {/* Provider Selection */}
  <select 
    value={aiProvider} 
    onChange={(e) => setAiProvider(e.target.value)}
    className="..."
  >
    <option value="replit">Replit (Vercel Gateway)</option>
    <option value="openai">OpenAI</option>
    <option value="groq">Groq</option>
  </select>

  {/* Model Selection */}
  <select 
    value={aiModel} 
    onChange={(e) => setAiModel(e.target.value)}
    className="..."
  >
    {aiProvider === 'replit' && (
      <>
        <option value="gpt-4o-mini">GPT-4o Mini (Econômico)</option>
        <option value="gpt-4o">GPT-4o (Precisão)</option>
        <option value="gpt-4-turbo">GPT-4 Turbo (Balanço)</option>
      </>
    )}
    {aiProvider === 'openai' && (
      <>
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="gpt-4o">GPT-4o</option>
        <option value="gpt-4-turbo">GPT-4 Turbo</option>
      </>
    )}
    {aiProvider === 'groq' && (
      <>
        <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Rápido)</option>
        <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instantâneo)</option>
        <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
      </>
    )}
  </select>
</div>
```

---

## 📊 VERIFICAR MODELOS ATUAIS

### **Via API**
```bash
curl http://localhost:3001/api/agents?clientId=1 | jq '.[] | {id, internalCode, title, aiModel, aiProvider}'
```

### **Via SQL**
```sql
SELECT id, internal_code, title, ai_provider, ai_model FROM agents ORDER BY id;
```

### **Via Script**
```bash
npx tsx check-agents-models.js
```

---

## ✅ CHECKLIST DE ADMINISTRAÇÃO

- [ ] Acessar `http://localhost:5000/controle-agentes`
- [ ] Ver lista de agentes e modelos atuais
- [ ] Decidir qual modelo usar (desenvolvimento vs produção)
- [ ] Executar SQL UPDATE ou script para alterar
- [ ] Testar agente após alteração
- [ ] Monitorar custos e performance
- [ ] **FUTURO:** Usar interface visual (quando implementada)

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `GERENCIAMENTO_MODELOS_IA.md` - Detalhes técnicos completos
- `AGENTES_ESTRATEGICOS_IMPLEMENTADOS.md` - Lista de agentes
- `AGENTES_CHAT_IMPLEMENTADOS.md` - Prompts e personalidades
- `server/aiService.ts` - Implementação dos provedores

---

## 🎉 RESUMO

**Atualmente você administra modelos de IA:**
1. ✅ Via página **Controle de Agentes** (`/controle-agentes`)
2. ✅ **Visualizando** e **testando**
3. ⚠️ **Alterando via SQL** ou script
4. ❌ **Interface visual** para alterar ainda **não existe**

**Próximo passo:** Implementar UI de seleção no modal de configuração! 🚀

