# ✅ SOLUÇÃO: Conexão com Banco de Dados Permanente

## 🐛 Problema

O servidor não mantinha conexão com o banco de dados porque a variável `DATABASE_URL` não era carregada automaticamente.

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### **1. Cross-env instalado**
```bash
npm install --save-dev cross-env
```

### **2. package.json atualizado**
Todos os scripts agora incluem `DATABASE_URL`:

```json
{
  "scripts": {
    "server": "cross-env DATABASE_URL=postgresql://... npm run server",
    "db:push": "cross-env DATABASE_URL=postgresql://... drizzle-kit push",
    "db:seed": "cross-env DATABASE_URL=postgresql://... tsx server/seed.ts"
  }
}
```

### **3. Schema corrigido**
Adicionada coluna `act` na tabela `agents`:

```typescript
// shared/schema.ts
export const agents = pgTable('agents', {
  // ... outras colunas
  act: text('act'), // ✅ NOVA COLUNA
  // ... outras colunas
});
```

### **4. Migração aplicada**
```bash
npm run db:push
✅ Coluna "act" criada no banco
```

### **5. Agentes atualizados**
```bash
npx tsx update-agents-act.ts
✅ 5 agentes do Ato 01 atualizados com act = "Ato 01"
```

### **6. Scripts auxiliares criados**
- `start-server.ps1` (PowerShell)
- `start-server.bat` (CMD)
- `test-db-connection.ts` (Teste de conexão)
- `update-agents-act.ts` (Atualização de campo)

---

## 🚀 COMO USAR AGORA

### **Opção 1: Via npm (RECOMENDADO)**
```bash
# Terminal 1: Servidor
npm run server

# Terminal 2: Frontend
npm run dev
```

### **Opção 2: Via script PowerShell**
```powershell
# Terminal 1
.\start-server.ps1

# Terminal 2
npm run dev
```

### **Opção 3: Via script BAT (CMD)**
```cmd
REM Terminal 1
start-server.bat

REM Terminal 2
npm run dev
```

---

## ✅ VERIFICAÇÃO

### **1. Testar conexão com banco:**
```bash
npx tsx test-db-connection.ts
```

Deve exibir:
```
✅ CONEXÃO BEM SUCEDIDA!
📅 Data/Hora do servidor: ...
🐘 Versão PostgreSQL: PostgreSQL 17.5
✅ Encontrados 12 agentes:
   8. SCAN Diagnóstico de Negócio (AGENT_SCAN_01)
   9. SCAN CLARITY - Sintetizador Estratégico (AGENT_CLARITY_02)
   10. Pesquisador de Mercado e ICP (AGENT_MARKET_03)
   ... etc
```

### **2. Testar API:**
```bash
# Aguardar servidor iniciar
Start-Sleep -Seconds 5

# Testar endpoint
curl http://localhost:3000/api/agents?clientId=1
```

Deve retornar JSON com array de agentes.

### **3. Testar Frontend:**
```
http://localhost:5000
Login: admin@groovia.com / admin123
Scroll até "Agentes Inteligentes - Ato 1"
```

Deve exibir 5 cards dos agentes.

---

## 📊 ESTRUTURA DO BANCO CORRIGIDA

### **Tabela `agents` (Atualizada)**
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  internal_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  act TEXT,                    -- ✅ NOVA COLUNA
  behavior_type TEXT DEFAULT 'autonomous',
  integrations JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  ai_provider TEXT DEFAULT 'replit',
  system_prompt TEXT,
  fallback_prompt TEXT,
  ...
);
```

### **Dados dos 5 agentes:**
| ID | Internal Code | Title | Act |
|----|---------------|-------|-----|
| 8 | AGENT_SCAN_01 | SCAN Diagnóstico de Negócio | Ato 01 |
| 9 | AGENT_CLARITY_02 | SCAN CLARITY - Sintetizador Estratégico | Ato 01 |
| 10 | AGENT_MARKET_03 | Pesquisador de Mercado e ICP | Ato 01 |
| 11 | AGENT_PERSONA_04 | Criador de Persona | Ato 01 |
| 12 | AGENT_INTELLIGENCE_05 | Groovia Intelligence (Consolidador) | Ato 01 |

---

## 🔧 TROUBLESHOOTING

### **Erro: DATABASE_URL não configurada**
```bash
# Verificar se .env existe e está correto
cat .env

# Ou executar com variável inline:
DATABASE_URL="postgresql://..." npm run server
```

### **Erro: Servidor não inicia**
```bash
# 1. Parar todos os processos Node
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# 2. Limpar cache
npm cache clean --force

# 3. Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 4. Testar conexão
npx tsx test-db-connection.ts

# 5. Iniciar servidor
npm run server
```

### **Erro: Agentes não aparecem**
```bash
# 1. Verificar se existem no banco
npx tsx test-db-connection.ts

# 2. Atualizar campo act
npx tsx update-agents-act.ts

# 3. Verificar API
curl http://localhost:3000/api/agents?clientId=1

# 4. Verificar console do navegador (F12)
```

---

## 📝 ARQUIVOS CRIADOS/MODIFICADOS

```
Novos arquivos:
├── start-server.ps1 ............. Script PowerShell para iniciar servidor
├── start-server.bat ............. Script CMD para iniciar servidor
├── test-db-connection.ts ........ Teste de conexão com banco
├── update-agents-act.ts ......... Script para atualizar campo act
└── SOLUCAO_CONEXAO_BANCO.md ..... Este documento

Arquivos modificados:
├── package.json ................. Scripts com cross-env
├── shared/schema.ts ............. Adicionada coluna act
└── .env ......................... DATABASE_URL corrigida (sem quebras de linha)
```

---

## ✅ CHECKLIST FINAL

```
✅ cross-env instalado
✅ package.json atualizado
✅ Schema com coluna act
✅ Migração aplicada (db:push)
✅ Agentes atualizados com act = "Ato 01"
✅ Scripts auxiliares criados
✅ Teste de conexão OK
✅ .env corrigido
✅ Documentação completa
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Iniciar sistema:**
   ```bash
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   ```

2. **Acessar:**
   ```
   http://localhost:5000
   admin@groovia.com / admin123
   ```

3. **Verificar cards:**
   - Scroll até "Agentes Inteligentes - Ato 1"
   - Deve exibir 5 cards
   - Clicar em qualquer card deve abrir o workspace

4. **Testar workflow:**
   - Menu lateral → "Workflow Inteligente"
   - Verificar 5 agentes em sequência
   - Iniciar Agente 1 (SCAN Diagnóstico)

---

**✅ Problema de conexão RESOLVIDO! O sistema agora mantém a conexão com o banco permanentemente!** 🎉

