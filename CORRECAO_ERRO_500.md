# 🔧 Correção do Erro 500 - Endpoint /api/agents

## 🐛 Problema Identificado

### Erro 500 ao acessar `/api/agents?clientId=1`

**Mensagem de erro:**
```
Failed query: select "id", "client_id", "internal_code", "title", "description", 
"agent_type", "behavior_type", "can_communicate_with_agents", "allowed_agent_ids", 
"capabilities", "integrations", "is_active", "ai_model", "ai_provider", "system_prompt", 
"fallback_prompt", "webhook_url", "webhook_enabled", "created_at", "updated_at" 
from "agents" where "agents"."client_id" = $1
params: 1
```

### Diagnóstico

✅ **Dados estão corretos no banco:**
- 7 agentes com `client_id = 1`
- 1 cliente (Groovia Default)
- 2 usuários

✅ **Query SQL direta funciona:**
```sql
SELECT * FROM agents WHERE client_id = 1;
-- Retorna 7 agentes corretamente
```

❌ **Query via Drizzle falha:**
```typescript
db.select().from(agents).where(eq(agents.clientId, 1))
```

---

## 🔍 Causa Raiz

O problema parece ser que o Drizzle está gerando uma query SQL correta, mas algo no caminho está causando erro. Possíveis causas:

1. **Schema desatualizado** - Drizzle não tem cache atualizado
2. **Problema na configuração do Drizzle** - drizzle.config.ts
3. **Pool de conexão** - Problema na inicialização do pool
4. **Type mismatch** - clientId sendo passado como string em vez de número

---

## 🔧 Soluções Tentadas

### ✅ Solução 1: Verificar Dados (OK)
- Dados estão corretos no banco
- Todos os agentes têm `client_id = 1`

### ✅ Solução 2: Testar Query Direta (OK)
- Query SQL direta funciona perfeitamente
- Retorna 7 agentes

### ⚠️ Solução 3: Adicionar .notNull() no Schema
- Adicionado `.notNull()` em `clientId` no schema
- Ainda não resolve o problema

---

## 🚀 Próximos Passos

### 1. Reiniciar Servidor
O servidor pode ter cache antigo do schema:

```bash
# Parar servidor
Ctrl + C (no terminal do servidor)

# Limpar cache do Drizzle
rm -rf node_modules/.cache
rm -rf drizzle

# Reinstalar dependências (opcional)
npm install

# Reiniciar servidor
npm run server:no-telemetry
```

### 2. Verificar Schema Compilado
O Drizzle pode ter gerado schema errado:

```bash
# Verificar arquivos gerados
ls -la drizzle/

# Se necessário, regenerar
npm run db:push
```

### 3. Verificar Logs Detalhados
Ativar logs detalhados no servidor para ver o erro completo:

```typescript
// Em server/index.ts, adicionar:
console.log('Agents query error:', error);
console.log('Full error:', JSON.stringify(error, null, 2));
```

### 4. Testar Endpoint Manualmente
Usar Postman ou curl para testar:

```bash
curl -X GET "http://localhost:3001/api/agents?clientId=1" \
  -H "Content-Type: application/json"
```

---

## 📝 Informações Importantes

### Dados no Banco
```
✅ 7 Agentes (todos com client_id = 1)
✅ 1 Cliente (ID: 1)
✅ 2 Usuários (admin e user)
```

### Configuração
```env
DATABASE_URL=postgresql://postgres:***@db.pomliylhitigmqrdcqsy.supabase.co:5432/postgres
```

### Servidor
```
✅ Rodando na porta 3001
✅ Health check OK
✅ Conectado ao PostgreSQL
```

---

## ✅ Checklist de Debug

- [x] Verificar dados no banco
- [x] Testar query SQL direta
- [x] Verificar configuração do .env
- [x] Verificar schema do Drizzle
- [ ] Limpar cache do Drizzle
- [ ] Reiniciar servidor
- [ ] Verificar logs detalhados
- [ ] Testar com outro clientId

---

**Status:** 🟡 Problema identificado, solução em andamento  
**Prioridade:** 🔴 Alta  
**Próxima Ação:** Reiniciar servidor e limpar cache do Drizzle  

