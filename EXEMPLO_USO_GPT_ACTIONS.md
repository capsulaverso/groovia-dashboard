# 🎯 EXEMPLO PRÁTICO: Usando o GPT Action Generator

## 📋 PASSO A PASSO COMPLETO

### **1️⃣ Configure sua Chave de API**

**1.1. Criar chave OpenAI:**
```
1. Acesse: https://platform.openai.com/api-keys
2. Clique "Create new secret key"
3. Copie a chave
```

**1.2. Adicionar no .env:**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**1.3. Restart servidor:**
```bash
npm run server:no-telemetry
```

---

### **2️⃣ Gerar Prompts para um Agente**

**Exemplo: Criar prompts para "SCAN Diagnóstico"**

**Request:**
```bash
curl -X POST http://localhost:3001/api/agents/1/generate-rules \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista estruturada para diagnóstico empresarial completo",
    "context": "Foco em empresas B2B com 10-100 funcionários no setor de tecnologia",
    "exampleInput": "Quais são seus principais desafios atuais?",
    "exampleOutput": "Identifico 3 desafios principais: escalabilidade de vendas, processo comercial e gestão de equipe. Vamos aprofundar cada um deles para entender melhor sua situação?"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": 1,
    "agentCode": "AGT-SC-001",
    "agentName": "SCAN Diagnóstico de Negócio Guiado",
    "systemPrompt": "Você é o SCAN Diagnóstico...",
    "fallbackPrompt": "Desculpe, não consegui processar...",
    "rules": [
      {
        "name": "Iniciar Diagnóstico",
        "description": "Captura pedidos de início de diagnóstico",
        "pattern": "^(comecar|iniciar|comecar).*diagn(o|ó)stico",
        "action": "iniciar_fluxo_diagnostico",
        "priority": 1,
        "enabled": true
      },
      {
        "name": "Detectar Desafios",
        "description": "Identifica menções a desafios do negócio",
        "pattern": "desafio|problema|dificuldade|obst(á|a)culo",
        "action": "profundizar_desafios",
        "priority": 2,
        "enabled": true
      },
      {
        "name": "Capturar Objetivos",
        "description": "Identifica objetivos de crescimento ou melhoria",
        "pattern": "objetivo|meta|quero|pretendo|crescer|aumentar",
        "action": "documentar_objetivos",
        "priority": 3,
        "enabled": true
      }
    ],
    "metadata": {
      "version": "1.0",
      "lastUpdate": "2025-01-08T12:30:00.000Z",
      "totalRules": 3,
      "enabledRules": 3
    }
  }
}
```

---

### **3️⃣ Testar Regras Geradas**

**Exemplo: Testar se mensagem "Estou tendo desafios com vendas" ativa regra**

**Request:**
```bash
curl -X POST http://localhost:3001/api/agents/1/test-rules \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Estou tendo desafios com vendas"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Estou tendo desafios com vendas",
    "matched": true,
    "rule": {
      "name": "Detectar Desafios",
      "description": "Identifica menções a desafios do negócio",
      "pattern": "desafio|problema|dificuldade|obst(á|a)culo",
      "action": "profundizar_desafios",
      "priority": 2,
      "enabled": true
    }
  }
}
```

✅ **Regra ativada!** A mensagem contém "desafios" e a regra foi acionada.

---

### **4️⃣ Ver Regras Salvas**

**Request:**
```bash
curl http://localhost:3001/api/agents/1/rules
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": 1,
    "agentCode": "AGT-SC-001",
    "agentName": "SCAN Diagnóstico de Negócio Guiado",
    "rules": [...],
    "systemPrompt": "...",
    "fallbackPrompt": "...",
    "metadata": {...}
  }
}
```

---

### **5️⃣ Gerar Apenas Preview (sem salvar)**

**Exemplo: Ver preview antes de aplicar**

**Request:**
```bash
curl -X POST http://localhost:3001/api/gpt/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Pesquisador de Mercado",
    "agentPurpose": "Realizar pesquisas profundas sobre mercado, tendências e concorrência",
    "context": "Foco em inteligência competitiva para empresas B2B SaaS"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "systemPrompt": "Você é um especialista em pesquisa de mercado...",
    "fallbackPrompt": "Desculpe, não consegui encontrar informações suficientes...",
    "welcomeMessage": "Olá! 👋 Sou seu Pesquisador de Mercado especializado...",
    "rules": [...],
    "metadata": {
      "generatedAt": "2025-01-08T12:35:00.000Z",
      "model": "gpt-4o",
      "tokensUsed": 1847
    }
  }
}
```

**Uso:** Revise os prompts gerados, ajuste se necessário, depois aplique ao agente.

---

## 🎨 EXEMPLOS DE AGENTES

### **1. SCAN Diagnóstico**
```json
{
  "agentType": "Diagnóstico Guiado",
  "agentPurpose": "Conduzir entrevista estruturada para diagnóstico empresarial completo"
}
```

**Regras esperadas:**
- Iniciar diagnóstico
- Detectar desafios
- Capturar objetivos
- Identificar recursos

---

### **2. Pesquisador de Mercado**
```json
{
  "agentType": "Pesquisa Autônoma",
  "agentPurpose": "Realizar pesquisas profundas sobre mercado, tendências e concorrência"
}
```

**Regras esperadas:**
- Iniciar pesquisa
- Solicitar segmento
- Retornar dados de mercado
- Sugerir próximos passos

---

### **3. Criador de Persona**
```json
{
  "agentType": "Criação de Persona",
  "agentPurpose": "Criar perfis detalhados de personas baseados em ICP e dados"
}
```

**Regras esperadas:**
- Solicitar dados do ICP
- Gerar persona detalhada
- Criar múltiplas personas
- Exportar em formato estruturado

---

## 🔧 INTEGRAÇÃO NO FRONTEND

### **Componente React:**

```typescript
import { useState } from 'react';
import { apiClient } from '../hooks/useApi';

function AgentRuleGenerator({ agentId }: { agentId: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateRules = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        `/agents/${agentId}/generate-rules`,
        {
          agentType: 'Diagnóstico Guiado',
          agentPurpose: 'Conduzir entrevista de diagnóstico empresarial',
          context: 'Empresas B2B tecnologia'
        }
      );
      setResult(response.data);
      alert('✅ Regras geradas com sucesso!');
    } catch (error) {
      alert('❌ Erro ao gerar regras');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generateRules} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar Regras via GPT'}
      </button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## 📊 FLUXO COMPLETO DE CRIAÇÃO

```
1. ✅ Configure OPENAI_API_KEY
2. ✅ Crie agente básico no banco
3. ✅ Gere prompts via /api/agents/:id/generate-rules
4. ✅ Revise systemPrompt e regras
5. ✅ Teste regras via /api/agents/:id/test-rules
6. ✅ Ajuste patterns se necessário
7. ✅ Use agente no chat!
```

---

## 🎯 DICAS DE SUCESSO

### **Para gerar bons prompts:**

✅ **Seja específico** no `agentPurpose`  
✅ **Forneça contexto** relevante  
✅ **Dê exemplos** claros de input/output  
✅ **Revise** os prompts gerados  
✅ **Teste** as regras antes de usar  

### **Para criar boas regras:**

✅ **Patterns** devem ser regex válidos  
✅ **Prioridades** bem definidas (1 = mais importante)  
✅ **Ações** descritivas e claras  
✅ **Teste** em múltiplas mensagens  

---

## 💰 CUSTO POR OPERAÇÃO

- **Gerar prompts:** ~$0.01-0.02
- **Token médio:** ~1.500-2.000 tokens
- **100 agentes:** ~$1-2

**Barato o suficiente para iterar rapidamente!**

---

## 🔍 DEBUGGING

### **Problema: "OPENAI_API_KEY não configurada"**

**Solução:**
```bash
# Verificar .env
cat .env | grep OPENAI

# Se não estiver, adicionar:
echo "OPENAI_API_KEY=sk-..." >> .env

# Restart servidor
npm run server:no-telemetry
```

### **Problema: "Agente não encontrado"**

**Solução:**
```bash
# Verificar agente existe
curl http://localhost:3001/api/agents/1

# Se não existir, criar via POST /api/agents
```

### **Problema: "Regra não ativa"**

**Solução:**
```json
{
  "name": "Teste",
  "pattern": "^teste$",  // ← Muito específico
  "action": "...",
  "priority": 1,
  "enabled": true  // ← Verificar se está true
}
```

---

## 📚 PRÓXIMOS PASSOS

1. ✅ Configure `OPENAI_API_KEY`
2. ✅ Teste `/api/gpt/generate-prompts`
3. ✅ Gere regras para 1 agente
4. ✅ Teste no chat
5. 🔄 Itere e melhore

**Divirta-se criando agentes inteligentes!** 🚀

