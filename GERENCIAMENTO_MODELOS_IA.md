# 🤖 GERENCIAMENTO DE MODELOS DE IA

## 📋 RESUMO EXECUTIVO

Todos os 15 agentes estão configurados com:
- **Provider:** `replit` (Vercel Gateway)
- **Modelo:** `gpt-4o-mini`

Atualmente, **NÃO existe interface visual** para alterar o modelo ou provider. Você precisa fazer isso manualmente via banco de dados ou aguardar a implementação da interface.

---

## 🎯 MODELO ATUAL CONFIGURADO

### **Provider: REPLIT (Vercel Gateway)**
```
Provider: replit
Modelo: gpt-4o-mini
Endpoint: https://aigateway.dev/api/proxy
```

### **Configuração no .env**
```env
VERCEL_GATEWAY_API_KEY=your_key_here
```

### **O que é Vercel Gateway?**
- Gateway unificado para múltiplos modelos de IA
- Endpoint único para diferentes provedores
- Gerenciamento centralizado de rate limits
- Fallback automático entre modelos

---

## 🔧 MODELOS DISPONÍVEIS NO SISTEMA

O sistema suporta **4 provedores diferentes**, mas atualmente todos os agentes usam **Replit/Vercel Gateway**:

| Provider | Como Funciona | Vantagens | Quando Usar |
|----------|---------------|-----------|-------------|
| **replit** | Vercel Gateway proxy | Gratuito, rate limits generosos, múltiplos modelos | Desenvolvimento e produção |
| **vercel-gateway** | Vercel Gateway direto | Mesmo que replit | Alternativa |
| **openai** | OpenAI direto via API | Modelos mais recentes, mais preciso | Quando precisar GPT-4/4Turbo |
| **groq** | Groq SDK direto | Ultra rápido, ultra barato | Quando performance importa |

---

## 🗄️ COMO OS MODELOS SÃO ARMAZENADOS

### **Banco de Dados (PostgreSQL)**
```sql
-- Tabela agents
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  ai_provider TEXT DEFAULT 'replit',  -- replit | vercel-gateway | openai | groq
  ai_model TEXT DEFAULT 'gpt-4o-mini',  -- gpt-4o-mini | gpt-4 | claude-sonnet | etc
  ...
);
```

### **Campos Importantes:**
- `ai_provider`: Qual provedor usar
- `ai_model`: Qual modelo específico do provedor

---

## ⚙️ MODELOS POR PROVEDOR

### **1. REPLIT (Vercel Gateway) - ATUAL**
```javascript
Available Models:
- gpt-4o-mini (atual, mais econômico)
- gpt-4o (mais preciso, mais caro)
- gpt-4-turbo (balanço custo/qualidade)
- claude-sonnet (antropic)
- gemini-pro (google)
```

### **2. OPENAI**
```javascript
Available Models:
- gpt-4o-mini
- gpt-4o
- gpt-4-turbo
- gpt-3.5-turbo
```

### **3. GROQ**
```javascript
Available Models:
- llama-3.3-70b-versatile (muito rápido)
- llama-3.1-8b-instant
- mixtral-8x7b-32768
- gemma2-9b-it
```

### **4. VERCEL GATEWAY**
```javascript
Available Models:
- Mesmos do Replit (proxy)
```

---

## 🔄 COMO ALTERAR O MODELO DE UM AGENTE

### **OPÇÃO 1: Via SQL Direto (Recomendado por Enquanto)**

```sql
-- Alterar modelo de um agente específico
UPDATE agents 
SET ai_model = 'gpt-4o', 
    ai_provider = 'openai',
    updated_at = NOW()
WHERE internal_code = 'AGT-GI-006';  -- Groovia Intelligence

-- Alterar todos os agentes estratégicos para GPT-4o
UPDATE agents 
SET ai_model = 'gpt-4o',
    updated_at = NOW()
WHERE id IN (8, 9, 10, 11, 12, 13, 14, 15);
```

### **OPÇÃO 2: Via Script Node.js**

Criar script `update-agents-model.js`:

```javascript
import 'dotenv/config';
import { pool } from './server/db.js';

async function updateModels() {
  // Exemplo: Atualizar Groovia Intelligence para GPT-4o
  await pool.query(`
    UPDATE agents 
    SET ai_model = 'gpt-4o', 
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

### **OPÇÃO 3: Via API (Futuro - Aguardando Implementação)**

```bash
# ATENÇÃO: Esta funcionalidade AINDA NÃO EXISTE no frontend
curl -X PUT http://localhost:3001/api/agents/12 \
  -H "Content-Type: application/json" \
  -d '{
    "aiModel": "gpt-4o",
    "aiProvider": "openai"
  }'
```

---

## 🎛️ ONDE GERENCIAR (ATUALMENTE)

### ❌ **NÃO EXISTE INTERFACE VISUAL AINDA**

O campo `aiModel` e `aiProvider` **NÃO estão expostos** no `AgentConfigModal` do `AgentsControlPage`.

### ✅ **O QUE EXISTE:**
1. **AgentsControlPage** (`http://localhost:5000/controle-agentes`)
   - Editar nome, descrição, tipo
   - Configurar webhooks
   - Testar agente (usa o modelo configurado no banco)
   - Abrir Builder (skills, workflow, context, UI)

2. **Banco de Dados**
   - Campos `ai_provider` e `ai_model` existem e funcionam
   - Podem ser alterados via SQL

3. **Test API**
   - `POST /api/agents/test` aceita `provider` e `model`
   - Usado para testar diferentes combinações

---

## 🚀 RECOMENDAÇÕES POR USO

### **Desenvolvimento/Testes**
```
Provider: replit
Modelo: gpt-4o-mini
Custo: Muito baixo
Qualidade: Boa para desenvolvimento
```

### **Produção - Balanceado**
```
Provider: openai
Modelo: gpt-4o
Custo: Médio-alto
Qualidade: Excelente
```

### **Produção - Máxima Performance**
```
Provider: groq
Modelo: llama-3.3-70b-versatile
Custo: Baixo
Velocidade: Ultra rápida
Qualidade: Muito boa
```

### **Para Agent de Intelligence (Groovia)**
```
Provider: openai
Modelo: gpt-4o
Motivo: Maior contexto, melhor raciocínio, síntese superior
```

---

## 📊 VERIFICAR MODELOS ATUAIS

### **Via SQL:**
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

### **Via API:**
```bash
curl http://localhost:3001/api/agents?clientId=1 | jq '.[] | {id, title, aiModel, aiProvider}'
```

### **Via Script:**
```bash
npx tsx check-agents-models.js
```

---

## 🔧 CONFIGURAÇÃO DO .ENV

Para usar diferentes provedores, configure as chaves no `.env`:

```env
# Vercel Gateway (Replit) - Padrão atual
VERCEL_GATEWAY_API_KEY=sk_xxxxx

# OpenAI - Para usar GPT-4o
OPENAI_API_KEY=sk-proj-xxxxx

# Groq - Para velocidade máxima
GROQ_API_KEY=gsk_xxxxx
```

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

### **1. Implementar Interface de Seleção**
Adicionar ao `AgentConfigModal.tsx`:

```typescript
<select 
  value={aiProvider} 
  onChange={(e) => setAiProvider(e.target.value)}
>
  <option value="replit">Replit (Vercel Gateway)</option>
  <option value="openai">OpenAI</option>
  <option value="groq">Groq</option>
</select>

<select 
  value={aiModel} 
  onChange={(e) => setAiModel(e.target.value)}
>
  <option value="gpt-4o-mini">GPT-4o Mini (Economia)</option>
  <option value="gpt-4o">GPT-4o (Precisão)</option>
  <option value="llama-3.3-70b">Llama 3.3 70B (Velocidade)</option>
</select>
```

### **2. Criar AgentLab Dashboard**
Painel dedicado para gerenciar:
- Comparação de custos entre modelos
- Métricas de latência por modelo
- Seleção automática baseada em uso
- A/B testing entre modelos

### **3. Implementar Fallback Automático**
Sistema que troca automaticamente de modelo se:
- Rate limit atingido
- Erro de API
- Custos muito altos
- Latência acima do threshold

---

## ✅ CONCLUSÃO

**Atualmente:**
- ✅ Sistema suporta 4 provedores diferentes
- ✅ Todos os agentes usam `replit` + `gpt-4o-mini`
- ✅ Modelos funcionam e estão testados
- ✅ Pode alterar via SQL ou script
- ❌ **NÃO existe interface visual para gerenciar**
- ⏳ **Aguardando implementação de UI de seleção**

**Para testar diferentes modelos AGORA:**
1. Execute o SQL UPDATE mostrado acima
2. Reinicie o servidor
3. Teste o agente via interface
4. Monitore custos e performance

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `server/aiService.ts` - Implementação dos provedores
- `VERCEL_GATEWAY_CONFIGURADO.md` - Configuração do Vercel Gateway
- `AGENTES_ESTRATEGICOS_IMPLEMENTADOS.md` - Detalhes dos agentes
- `AGENTES_CHAT_IMPLEMENTADOS.md` - Prompts e personalidades

