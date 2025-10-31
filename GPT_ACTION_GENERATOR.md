# 🤖 GPT Action Generator - Sistema de Chave de API

## ✅ IMPLEMENTAÇÃO COMPLETA

Sistema que utiliza **GPT-4 via OpenAI Actions** para gerar automaticamente:
- SystemPrompts personalizados
- Regras de ação (patterns + ações)
- Mensagens de boas-vindas
- Configurações completas de agentes

---

## 🎯 COMO FUNCIONA

### **Fluxo:**
```
1. Você envia descrição do agente
   ↓
2. Sistema chama GPT-4
   ↓
3. GPT retorna JSON estruturado
   ↓
4. Sistema popula nosso formato
   ↓
5. Salva no banco de dados
```

---

## 🔑 CONFIGURAÇÃO

### **1. Configurar Chave de API**

**OPÇÃO 1: Vercel Gateway (Recomendado - já configurado!)**
```env
VERCEL_GATEWAY_API_KEY=vck_xxxxxxxxxxxxx
```

**OPÇÃO 2: OpenAI Direct**
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Obter chaves:**
- **Vercel Gateway:** https://aigateway.dev (já configurado)
- **OpenAI Direct:** https://platform.openai.com/api-keys

**Sistema usa automaticamente:**
1. ✅ Vercel Gateway (se configurado)
2. ✅ OpenAI Direct (fallback)

### **2. Restart do Servidor**

```bash
npm run server:no-telemetry
```

Verifique no log:
```
🤖 GPT Action Generator configurado: Vercel Gateway
```

---

## 📚 ENDPOINTS DA API

### **1. Gerar e Salvar Regras para Agente**

**POST** `/api/agents/:id/generate-rules`

**Body:**
```json
{
  "agentType": "Diagnóstico de Negócio",
  "agentPurpose": "Conduzir entrevista para diagnóstico empresarial completo",
  "context": "Foco em empresas B2B de tecnologia",
  "exampleInput": "Quais são seus principais desafios?",
  "exampleOutput": "Identifico 3 desafios principais..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": 1,
    "agentCode": "AGT-SC-001",
    "agentName": "SCAN Diagnóstico",
    "systemPrompt": "Você é o SCAN Diagnóstico...",
    "fallbackPrompt": "Desculpe, não consegui...",
    "rules": [
      {
        "name": "Detectar Desafios",
        "description": "Identifica quando usuário menciona desafios",
        "pattern": "desafio|problema|dificuldade",
        "action": "extrair_desafios",
        "priority": 1,
        "enabled": true
      }
    ],
    "metadata": {
      "version": "1.0",
      "lastUpdate": "2025-01-08T...",
      "totalRules": 5,
      "enabledRules": 5
    }
  }
}
```

---

### **2. Gerar Prompts (sem salvar)**

**POST** `/api/gpt/generate-prompts`

**Body:** (igual ao anterior)

**Response:**
```json
{
  "success": true,
  "data": {
    "systemPrompt": "...",
    "fallbackPrompt": "...",
    "welcomeMessage": "...",
    "rules": [...],
    "metadata": {
      "generatedAt": "2025-01-08T...",
      "model": "gpt-4o",
      "tokensUsed": 1234
    }
  }
}
```

---

### **3. Buscar Regras de um Agente**

**GET** `/api/agents/:id/rules`

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": 1,
    "agentCode": "AGT-SC-001",
    "agentName": "SCAN Diagnóstico",
    "rules": [...],
    "systemPrompt": "...",
    "fallbackPrompt": "...",
    "metadata": {...}
  }
}
```

---

### **4. Testar Regras em Mensagem**

**POST** `/api/agents/:id/test-rules`

**Body:**
```json
{
  "message": "Olá, preciso de ajuda com diagnóstico"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Olá, preciso de ajuda com diagnóstico",
    "matched": true,
    "rule": {
      "name": "Detectar Pedido de Ajuda",
      "description": "Identifica pedidos de ajuda",
      "pattern": "ajuda|auxílio|suporte",
      "action": "iniciar_diagnostico",
      "priority": 1,
      "enabled": true
    }
  }
}
```

---

## 🧪 EXEMPLOS DE USO

### **Exemplo 1: Gerar Regras para SCAN Diagnóstico**

```bash
curl -X POST http://localhost:3001/api/agents/1/generate-rules \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista estruturada para diagnóstico empresarial completo",
    "context": "Foco em empresas B2B com 10-100 funcionários",
    "exampleInput": "Quais são seus principais desafios?",
    "exampleOutput": "Identifico 3 desafios principais: escalabilidade, processo comercial e gestão de equipe. Vamos aprofundar cada um?"
  }'
```

### **Exemplo 2: Testar Regra**

```bash
curl -X POST http://localhost:3001/api/agents/1/test-rules \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, preciso de ajuda com meu negócio"
  }'
```

### **Exemplo 3: Gerar Prompts (Preview)**

```bash
curl -X POST http://localhost:3001/api/gpt/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Pesquisador de Mercado",
    "agentPurpose": "Realizar pesquisa profunda sobre mercado e concorrência",
    "context": "Foco em inteligência competitiva para B2B"
  }'
```

---

## 📊 ESTRUTURA DE DADOS

### **AgentRule**
```typescript
{
  name: string;           // Nome descritivo
  description: string;    // O que faz
  pattern: string;        // Regex pattern
  action: string;         // Ação executada
  priority: number;       // 1-10 (menor = maior prioridade)
  enabled: boolean;       // Ativa/desativa
}
```

### **Exemplos de Regras Geradas:**
```json
[
  {
    "name": "Detectar Pedido de Ajuda",
    "description": "Identifica quando usuário pede ajuda genérica",
    "pattern": "ajuda|auxílio|suporte|preciso",
    "action": "iniciar_fluxo_principal",
    "priority": 1
  },
  {
    "name": "Detectar Desafios",
    "description": "Identifica menções a desafios ou problemas",
    "pattern": "desafio|problema|dificuldade|obstáculo",
    "action": "aprofundar_desafios",
    "priority": 2
  },
  {
    "name": "Detectar Perguntas",
    "description": "Captura perguntas diretas",
    "pattern": "\\?|qual|como|quando|onde|por que",
    "action": "responder_pergunta",
    "priority": 5
  }
]
```

---

## 🔧 INTEGRAÇÃO NO CÓDIGO

### **No Frontend:**

```typescript
import { apiClient } from '../hooks/useApi';

// Gerar regras para agente
async function generateRulesForAgent(agentId: number) {
  const response = await apiClient.post(
    `/agents/${agentId}/generate-rules`,
    {
      agentType: 'Diagnóstico Guiado',
      agentPurpose: 'Conduzir entrevista de diagnóstico',
      context: 'Empresas B2B tecnologia'
    }
  );
  
  console.log('Regras geradas:', response.data);
}

// Testar mensagem
async function testRules(agentId: number, message: string) {
  const response = await apiClient.post(
    `/agents/${agentId}/test-rules`,
    { message }
  );
  
  if (response.data.matched) {
    console.log('Regra ativada:', response.data.rule);
  }
}
```

---

## 📈 COMO O GPT GERA AS REGRAS

### **Prompt enviado ao GPT:**
```
Você é um especialista em criação de prompts e regras para agentes de IA.

Sua tarefa é gerar:
1. Um systemPrompt completo e detalhado para o agente
2. Um fallbackPrompt caso o agente não consiga responder
3. Uma lista de regras de ação (regex patterns + ações)
4. Uma mensagem de boas-vindas personalizada

TIPO: Diagnóstico de Negócio
PROPÓSITO: Conduzir entrevista para diagnóstico empresarial completo
CONTEXTO: Foco em empresas B2B de tecnologia
```

### **GPT retorna:**
- SystemPrompt completo com metodologia
- FallbackPrompt empático
- Regras com patterns válidos
- WelcomeMessage personalizada

---

## 💰 CUSTOS

### **Estimativa de Uso:**
- **Por chamada:** ~1.500-2.000 tokens
- **Custo GPT-4o:** ~$0.01-0.02 por chamada
- **100 agentes:** ~$1-2

### **Cache:**
- Respostas podem ser cacheadas (implementar se necessário)
- Re-uso de prompts similares

---

## 🎯 CASOS DE USO

### **1. Criação Rápida de Agentes**
```
1. Descreva o agente
2. Clique "Gerar Regras"
3. GPT cria tudo automaticamente
4. Revise e ajuste
```

### **2. Atualização de Prompts**
```
1. Agente já existe
2. Gere nova versão
3. Compare com anterior
4. Aplique se melhor
```

### **3. Teste de Regras**
```
1. Digite mensagem de teste
2. Veja qual regra ativa
3. Ajuste patterns se necessário
4. Teste novamente
```

---

## ⚠️ LIMITAÇÕES

### **Atuais:**
- Requer `VERCEL_GATEWAY_API_KEY` ou `OPENAI_API_KEY` configurada
- Custo por chamada GPT
- Regras podem precisar ajuste manual
- Patterns podem não cobrir todos os casos

### **Melhorias Futuras:**
- [ ] Cache de prompts similares
- [ ] UI para edição de regras
- [ ] Teste de regras em batch
- [ ] Métricas de eficácia
- [ ] A/B testing de prompts

---

## 🔐 SEGURANÇA

### **Chaves de API:**
- ❌ **NUNCA** commitar `.env` no Git
- ✅ Usar variáveis de ambiente
- ✅ Rotacionar chaves periodicamente
- ✅ Limitar uso por quota
- ✅ **Vercel Gateway** já configurado no sistema

### **Validação:**
- Todos os inputs são validados
- SQL injection protegido (prepared statements)
- Regex patterns sanitizados
- Erros genéricos (não expor detalhes)

---

## 📝 CHECKLIST

- [x] Implementar `gpt-action-generator.ts`
- [x] Criar endpoints da API
- [x] Integrar com banco de dados
- [x] Adicionar validação
- [x] Documentação completa
- [ ] Frontend UI (futuro)
- [ ] Testes automatizados (futuro)
- [ ] Cache de prompts (futuro)

---

## 🚀 PRÓXIMOS PASSOS

### **Para Você:**
1. ✅ Configure `OPENAI_API_KEY` no `.env`
2. ✅ Restart servidor
3. ✅ Teste endpoint `/api/gpt/generate-prompts`
4. ✅ Gere regras para um agente
5. ✅ Teste regras

### **Futuro:**
- UI visual para geração
- Editor de regras interativo
- Biblioteca de templates
- Import/export de configurações

---

## 🎉 CONCLUSÃO

**Sistema completo de geração de prompts via GPT!**

✅ Chave de API configurável  
✅ 4 endpoints funcionais  
✅ Integração com banco  
✅ Regras estruturadas  
✅ Documentação completa  

**Teste agora:** Configure `OPENAI_API_KEY` e comece a gerar! 🚀

