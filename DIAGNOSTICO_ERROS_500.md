# 🔍 Diagnóstico Completo - Erros 500

**Data:** 2025-01-27  
**Erros Identificados:**
- `GET /api/agents?clientId=1` → 500
- `GET /api/users/1/progress` → 500
- `GET /api/agents` → 500

---

## 📊 Status Atual

✅ **Servidor inicia corretamente**  
✅ **Banco de dados conectado**  
✅ **Nenhum erro de importação**  
❓ **Erros 500 ocorrem durante requisições**

---

## 🔍 Próximos Passos para Diagnóstico

### 1. Verificar Logs do Servidor

Quando os erros ocorrerem, me mostre os logs do terminal do servidor que mostrem:
- A linha `❌ Erro detalhado ao buscar agentes:`
- A linha `❌ Stack:`
- Qualquer outro erro que aparecer

### 2. Possíveis Causas

#### Causa 1: Falta de Dados no Banco
- Tabela `agents` vazia
- Tabela `users` vazia
- Cliente com `clientId=1` não existe

#### Causa 2: Erro na Query SQL
- Nomes de colunas incorretos
- Problema com tipos de dados

#### Causa 3: Problema com Drizzle vs SQL Direto
- Conflito entre Drizzle e queries diretas

---

## 🛠️ Testes para Executar

### Teste 1: Verificar Banco de Dados

Execute no psql ou outra ferramenta SQL:

```sql
-- Verificar se existem agentes
SELECT * FROM agents WHERE client_id = 1 LIMIT 5;

-- Verificar se existe cliente
SELECT * FROM clients WHERE id = 1;

-- Verificar se existem usuários
SELECT * FROM users WHERE client_id = 1 LIMIT 5;
```

### Teste 2: Testar Endpoint Diretamente

Abra outro terminal e execute:

```bash
curl http://localhost:3001/api/agents?clientId=1
```

Envie o output completo.

### Teste 3: Verificar .env

Confirme que o `.env` tem:

```
DATABASE_URL=postgresql://...
```

---

## 🔧 Soluções Provisórias

### Solução 1: Resetar Banco de Dados

```bash
npm run db:push
npm run db:seed
```

### Solução 2: Criar Dados Manualmente

```bash
# Conecte no banco e execute
```

```sql
INSERT INTO clients (id, name, is_active) 
VALUES (1, 'Groovia', true) 
ON CONFLICT (id) DO UPDATE SET name = 'Groovia';

INSERT INTO users (id, client_id, name, email, password, role) 
VALUES (1, 1, 'Admin', 'admin@groovia.com', 'hashed_password', 'admin') 
ON CONFLICT (email) DO NOTHING;
```

---

## 📝 Logs Esperados

Quando o servidor estiver rodando e você enviar uma requisição, você deve ver:

```
✅ Buscando agentes para clientId: 1
✅ Agentes encontrados: 0
```

OU

```
✅ Buscando agentes para clientId: 1
❌ Erro detalhado ao buscar agentes: [ERRO AQUI]
❌ Stack: [STACK AQUI]
```

---

## 🎯 Ação Imediata

**Me envie:**
1. Os logs completos do terminal do servidor quando o erro ocorrer
2. O resultado de `SELECT * FROM agents WHERE client_id = 1;`
3. O resultado de `curl http://localhost:3001/api/agents?clientId=1`

Com essas informações, posso identificar exatamente o problema!

---

**Status:** ⏳ **Aguardando logs do servidor para diagnóstico preciso**

