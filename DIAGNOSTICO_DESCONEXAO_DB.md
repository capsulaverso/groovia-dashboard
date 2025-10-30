# 🔍 DIAGNÓSTICO - DESCONEXÃO DO BANCO DE DADOS

## PROBLEMA RELATADO
❌ Desconectando do banco de dados repetidamente

---

## 🎯 POSSÍVEIS CAUSAS

### 1. **DATABASE_URL não configurada ou inválida**
```bash
# ❌ Problema
DATABASE_URL não está definida ou expirou

# ✅ Solução
Verificar se a variável está no .env
```

### 2. **Timeout de Conexão**
```
Neon (serverless) fecha conexões inativas após ~5 minutos
```

### 3. **Pool de Conexões Esgotado**
```
Muitas conexões abertas simultaneamente
```

### 4. **WebSocket não configurado**
```
Falta configuração de ws (websocket) no Neon
```

---

## ✅ CHECKLIST DE DIAGNÓSTICO

### Passo 1: Verificar DATABASE_URL

```bash
# Windows
echo %DATABASE_URL%

# Mac/Linux
echo $DATABASE_URL

# Deve retornar algo como:
# postgresql://user:password@host/dbname?sslmode=require
```

**Se vazio:**
```bash
# Configurar .env com:
DATABASE_URL="postgresql://seu_user:sua_senha@seu_host/seu_db?sslmode=require"
```

### Passo 2: Verificar Arquivo .env

```bash
# Ir para a pasta raiz do projeto
cat .env

# Procurar por:
DATABASE_URL=postgresql://...
```

**Se não existir:**
```bash
# Criar .env
touch .env
echo 'DATABASE_URL=seu_valor_aqui' >> .env
```

### Passo 3: Verificar Conexão

```bash
# Testar conexão com psql
psql "postgresql://user:password@host/db?sslmode=require"

# Se conectar, a URL está correta
```

---

## 🔧 SOLUÇÕES

### Solução 1: Reconfigurar DATABASE_URL

```bash
# 1. Obter nova conexão do Neon
# Dashboard Neon → Connection string → Copy

# 2. Atualizar .env
DATABASE_URL="postgresql://seu_novo_string"

# 3. Reiniciar servidor
npm run server
```

### Solução 2: Melhorar Pool de Conexões

**Arquivo:** `server/db.ts`

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// ✅ Adicionar configuração de pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada');
}

// Melhorar configuração do pool
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,                    // Máximo de conexões
  idleTimeoutMillis: 30000,  // 30 segundos de inatividade
  connectionTimeoutMillis: 10000, // 10 segundos para conectar
  statement_timeout: 30000,  // Timeout de query
});

// Tratamento de erros
pool.on('error', (err) => {
  console.error('Erro no pool de conexão:', err);
});

pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados');
});

pool.on('remove', () => {
  console.log('⚠️ Conexão removida do pool');
});

export const db = drizzle({ client: pool, schema });
```

### Solução 3: Implementar Retry com Exponential Backoff

**Arquivo:** `server/index.ts` (adicionar ao início)

```typescript
// ============================================================================
// DATABASE RECONNECTION WITH EXPONENTIAL BACKOFF
// ============================================================================

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1 segundo

async function testDatabaseConnection(attempt = 1): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT 1`);
    console.log('✅ Conexão com banco de dados OK');
    return true;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      console.error('❌ Falha ao conectar ao banco após', MAX_RETRIES, 'tentativas');
      return false;
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    console.warn(`⚠️ Tentativa ${attempt}/${MAX_RETRIES} falhou. Retentando em ${delay}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return testDatabaseConnection(attempt + 1);
  }
}

// Testar conexão ao iniciar servidor
testDatabaseConnection();

// Verificar conexão periodicamente
setInterval(async () => {
  try {
    await db.execute(sql`SELECT 1`);
  } catch (error) {
    console.error('⚠️ Perda de conexão com banco:', error);
    // Tentar reconectar
    testDatabaseConnection();
  }
}, 60000); // A cada 60 segundos
```

### Solução 4: Middleware de Reconexão

```typescript
// ============================================================================
// DATABASE HEALTH CHECK MIDDLEWARE
// ============================================================================

let isConnected = true;

// Middleware para verificar conexão
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await db.execute(sql`SELECT 1`);
      isConnected = true;
      console.log('✅ Reconectado ao banco de dados');
    } catch (error) {
      console.error('❌ Banco de dados indisponível');
      return res.status(503).json({
        error: 'Banco de dados indisponível',
        message: 'Por favor, tente novamente em alguns instantes'
      });
    }
  }
  next();
});
```

### Solução 5: Health Check Endpoint

```typescript
// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT 1 as status`);
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

// Testar no browser
// http://localhost:3001/api/health
```

---

## 📋 CÓDIGO COMPLETO MELHORADO - db.ts

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL não configurada. Defina a variável de ambiente.',
  );
}

// ✅ Configuração melhorada do pool
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ✅ Event handlers
pool.on('error', (err) => {
  console.error('❌ Erro crítico no pool:', err);
});

pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida');
});

pool.on('remove', () => {
  console.log('⚠️ Conexão remov ida do pool');
});

// ✅ Teste de conexão ao iniciar
pool.query('SELECT 1')
  .then(() => console.log('✅ Pool conectado com sucesso'))
  .catch(err => console.error('❌ Erro ao inicializar pool:', err));

export const db = drizzle({ client: pool, schema });
```

---

## 📋 CÓDIGO COMPLETO MELHORADO - index.ts (início)

```typescript
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { sql } from 'drizzle-orm';
import { db, pool } from './db.js';

const app = express();

// ============================================================================
// DATABASE HEALTH CHECK
// ============================================================================

let dbHealthy = true;

async function checkDatabaseHealth() {
  try {
    await db.execute(sql`SELECT 1`);
    dbHealthy = true;
  } catch (error) {
    dbHealthy = false;
    console.error('❌ Banco de dados offline:', error);
  }
}

// Verificar saúde do banco a cada 30 segundos
setInterval(checkDatabaseHealth, 30000);

// Verificação inicial
checkDatabaseHealth();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());

// Middleware para verificar conexão com banco
app.use(async (req, res, next) => {
  if (!dbHealthy) {
    try {
      await db.execute(sql`SELECT 1`);
      dbHealthy = true;
      console.log('✅ Reconectado ao banco');
    } catch (error) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Por favor, tente novamente em alguns instantes'
      });
    }
  }
  next();
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      databaseTime: result.rows[0].current_time
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ... resto do código
```

---

## 🚀 PASSO A PASSO PARA RESOLVER

### 1. Verificar DATABASE_URL
```bash
echo %DATABASE_URL%
```

### 2. Se estiver vazio, obter nova URL
- Ir em https://console.neon.tech
- Copiar connection string
- Adicionar ao .env

### 3. Criar/atualizar .env
```bash
# Na raiz do projeto
echo DATABASE_URL="seu_valor" > .env
```

### 4. Reinstalar dependências
```bash
npm install
```

### 5. Atualizar db.ts com código melhorado
Copiar solução 2 ou 5 acima

### 6. Reiniciar servidor
```bash
npm run server
```

### 7. Verificar health check
```bash
curl http://localhost:3001/api/health
```

---

## 🔍 MONITORAMENTO

### Verificar logs
```bash
# Terminal deve mostrar:
✅ Pool conectado com sucesso
✅ Conexão com banco de dados OK
✅ Nova conexão estabelecida
```

### Se ver erros
```
❌ Erro no pool
❌ Banco de dados offline
❌ Falha ao conectar
```

**Significa que a DATABASE_URL está inválida ou o banco está offline**

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Verificar DATABASE_URL
2. ✅ Atualizar db.ts
3. ✅ Adicionar health check
4. ✅ Reiniciar servidor
5. ✅ Testar /api/health
6. ✅ Monitorar logs

---

## 🎯 RESUMO DAS SOLUÇÕES

| Problema | Solução |
|----------|---------|
| DATABASE_URL inválida | Atualizar com URL do Neon |
| Timeout | Aumentar idleTimeoutMillis |
| Pool esgotado | Aumentar max connections |
| Sem reconexão automática | Implementar retry com backoff |
| Sem monitoramento | Adicionar health check |

---

**Arquivo gerado:** `DIAGNOSTICO_DESCONEXAO_DB.md`  
**Status:** ✅ Pronto para aplicar soluções
