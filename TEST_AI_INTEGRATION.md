# 🤖 Sistema de Teste de Agentes IA - Groovia Dashboard

## ✅ Sistema Implementado e Funcional

### 🎯 Funcionalidades Implementadas

#### 1. **Backend Completo** (`server/aiService.ts`)
- ✅ Suporte para 3 providers de IA:
  - **Replit AI** (sem necessidade de API key)
  - **OpenAI** (requer `OPENAI_API_KEY`)
  - **Groq** (requer `GROQ_API_KEY`)
- ✅ Sistema de cache inteligente (TTL: 1 hora)
- ✅ Fallback automático em caso de erro
- ✅ Suporte a WebHooks com fallback para IA
- ✅ Métricas de performance (latência, tokens usados)

#### 2. **API Endpoints** (`server/index.ts`)
```
POST /api/agents/test - Testar agente
GET  /api/cache/stats - Estatísticas do cache
DELETE /api/cache - Limpar cache
```

#### 3. **Database Schema** (`shared/schema.ts`)
Campos adicionados na tabela `agents`:
- `ai_model` - Modelo de IA (ex: gpt-4o-mini, llama-3.3-70b-versatile)
- `ai_provider` - Provider (replit, openai, groq)
- `system_prompt` - Prompt de sistema para definir comportamento
- `fallback_prompt` - Mensagem em caso de erro
- `webhook_url` - URL do webhook (opcional)
- `webhook_enabled` - Habilita/desabilita webhook

#### 4. **Interface de Administração** (`components/pages/AgentsControlPage.tsx`)
- ✅ Listagem completa de agentes com status
- ✅ Criação e edição de agentes com todos os campos de IA
- ✅ **Botão "Testar"** funcional em cada agente
- ✅ Painel de resultados detalhado:
  - Resposta da IA
  - Provider e modelo usado
  - Latência em milissegundos
  - Tokens consumidos
  - Indicador de cache
  - Indicador de fallback

#### 5. **Sistema de Cache** (node-cache)
- Cache automático de respostas
- TTL configurável (1 hora padrão)
- Endpoints para estatísticas e limpeza

---

## 🧪 Como Testar

### Opção 1: Via Interface (Recomendado)

1. **Faça login no sistema:**
   - Acesse: http://localhost:5000
   - Use: `admin@groovia.com` / `admin123`

2. **Acesse Administração de Agentes:**
   - Clique no menu lateral: `ADMINISTRAÇÃO > Administração de Agentes`

3. **Teste um agente existente:**
   - Clique no botão verde **"Testar"** em qualquer agente
   - Aguarde a resposta (2-5 segundos)
   - Veja o resultado detalhado no painel

4. **Crie/Edite um agente:**
   - Clique em **"Criar Agente"** ou **"Editar"**
   - Configure:
     - Provider: Replit AI (sem API key necessária)
     - Modelo: gpt-4o-mini
     - System Prompt: personalizado
     - Fallback Prompt: mensagem de erro
     - WebHook: (opcional) URL externa

### Opção 2: Via API (cURL)

```bash
# Testar agente com Replit AI
curl -X POST http://localhost:3001/api/agents/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "replit",
    "model": "gpt-4o-mini",
    "systemPrompt": "Você é um assistente de negócios especializado em estratégia corporativa.",
    "testMessage": "Olá! Explique brevemente o que você faz.",
    "fallbackPrompt": "Desculpe, serviço temporariamente indisponível."
  }'

# Verificar estatísticas de cache
curl http://localhost:3001/api/cache/stats

# Limpar cache
curl -X DELETE http://localhost:3001/api/cache
```

### Opção 3: Teste com Groq (se você tiver API key)

```bash
# 1. Adicionar API key Groq
export GROQ_API_KEY="gsk_..."

# 2. Reiniciar API Server

# 3. Testar com Groq
curl -X POST http://localhost:3001/api/agents/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "systemPrompt": "Você é um especialista em marketing digital.",
    "testMessage": "Crie 3 ideias de posts para Instagram sobre sustentabilidade."
  }'
```

---

## 📊 Modelos Disponíveis

### Replit AI (Sem API Key)
- `gpt-5` (mais recente, lançado em ago/2025)
- `gpt-5-mini`
- `gpt-4o`
- `gpt-4o-mini` ✅ Recomendado
- `gpt-4.1`
- `o3`, `o3-mini`, `o4-mini`

### OpenAI (Requer OPENAI_API_KEY)
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Groq (Requer GROQ_API_KEY)
- `llama-3.3-70b-versatile` ✅ Recomendado
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

---

## 🔄 Fluxo de Funcionamento

```
┌─────────────────┐
│  Usuário clica  │
│  "Testar"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebHook ativo? │
└────┬───────┬────┘
     │ Sim   │ Não
     ▼       ▼
┌─────────┐ ┌──────────┐
│ Tenta   │ │ Consulta │
│ WebHook │ │ Cache    │
└────┬────┘ └────┬─────┘
     │           │
     │ Falhou    │ Cache miss
     ▼           ▼
┌─────────────────┐
│  Chama Provider │
│  (Replit/      │
│   OpenAI/Groq) │
└────────┬────────┘
         │ Sucesso
         ▼
┌─────────────────┐
│  Retorna        │
│  Resposta +     │
│  Métricas       │
└─────────────────┘
         │ Erro
         ▼
┌─────────────────┐
│  Usa Fallback   │
│  Prompt         │
└─────────────────┘
```

---

## 🎨 Interface de Teste

O painel de teste exibe:

```
┌──────────────────────────────────────┐
│ ✅ Resultado do Teste                │
├──────────────────────────────────────┤
│ Provider: replit                     │
│ Modelo: gpt-4o-mini                  │
│ Latência: 1247ms                     │
│ Tokens Usados: 156                   │
│ 💾 Resposta do Cache (se aplicável)  │
│ ⚠️ Usado Fallback (se aplicável)     │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ Resposta completa da IA aqui  │   │
│ │ ...                            │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

## 🔐 Configuração de API Keys (Opcional)

Para usar OpenAI ou Groq com suas próprias chaves:

1. **Via Replit Secrets:**
   - Abra a aba "Secrets" no painel lateral
   - Adicione: `OPENAI_API_KEY` ou `GROQ_API_KEY`

2. **Via Terminal:**
   ```bash
   export OPENAI_API_KEY="sk-..."
   export GROQ_API_KEY="gsk_..."
   ```

3. **Reinicie o API Server:**
   - O sistema detectará automaticamente as novas chaves

---

## 📈 Benefícios do Sistema

1. **Multi-Provider**: Flexibilidade para escolher o melhor provider
2. **Cache Inteligente**: Reduz custos e latência
3. **Fallback Robusto**: Garantia de resposta mesmo com falhas
4. **WebHook Integration**: Suporte para sistemas externos
5. **Métricas Detalhadas**: Monitoramento de performance
6. **Interface Amigável**: Teste visual sem necessidade de código

---

## 🚀 Status da Implementação

✅ Schema do banco atualizado
✅ Integração Replit AI instalada
✅ Serviço de IA implementado (OpenAI + Groq + Cache)
✅ Endpoints de API criados
✅ Interface de administração completa
✅ Botão de teste funcional
✅ Sistema de cache operacional
✅ Todos os agentes atualizados com valores padrão

**Sistema 100% funcional e pronto para uso!** 🎉
