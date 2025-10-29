# 🚀 Configuração do Sistema Groovia Dashboard

## 📋 Análise do Sistema

O sistema **Groovia Dashboard** é uma plataforma multi-tenant completa com:

### Arquitetura
- **Frontend**: React 19 + TypeScript + Vite (porta 5000)
- **Backend**: Express API REST (porta 3001)
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **IA Integrations**: OpenAI, Groq, Gemini

### Funcionalidades
✅ Autenticação de usuários com hash de senha  
✅ Sistema multi-tenant (clients)  
✅ Agentes de IA configuráveis  
✅ Conversas e mensagens  
✅ Documentos do usuário  
✅ Integrações (N8N, Dify, Langchain, Webhooks)  
✅ Progresso de usuário por agente  
✅ Cache de respostas de IA  

---

## ⚙️ Configuração Necessária

### **PASSO 1: Configurar Banco de Dados**

O sistema precisa de uma URL de conexão PostgreSQL válida. Você tem **duas opções**:

#### **Opção A: Neon Database (Recomendado - Gratuito)**
1. Acesse: https://console.neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a `DATABASE_URL` (formato: `postgresql://user:pass@host:5432/dbname`)
5. Edite o arquivo `.env` e substitua a `DATABASE_URL`

#### **Opção B: PostgreSQL Local**
Se você tem PostgreSQL instalado localmente, edite o arquivo `.env`:

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/groovia?sslmode=require
```

### **PASSO 2: Executar Comandos**

Após configurar a `DATABASE_URL` no arquivo `.env`, execute:

```bash
# 1. Criar tabelas no banco de dados
npm run db:push

# 2. Popular banco com dados iniciais (usuários e agentes)
npm run db:seed
```

### **PASSO 3: Iniciar Sistema**

Você precisará de **2 terminais**:

#### **Terminal 1 - Backend**
```bash
npm run server
```

#### **Terminal 2 - Frontend**
```bash
npm run dev
```

---

## 🔐 Credenciais Padrão

Após executar `npm run db:seed`, você terá os seguintes usuários:

| Email | Senha | Role |
|-------|-------|------|
| admin@groovia.com | admin123 | admin |
| usuario@groovia.com | user123 | user |

---

## 🌐 Acessos

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 📊 Estrutura do Banco de Dados

O sistema cria automaticamente as seguintes tabelas:

- `clients` - Clientes multi-tenant
- `users` - Usuários do sistema
- `agents` - Agentes de IA configuráveis
- `documents` - Documentos dos usuários
- `conversations` - Conversas entre usuários e agentes
- `messages` - Mensagens das conversas
- `user_progress` - Progresso do usuário por agente
- `integrations` - Integrações externas (N8N, Dify, etc)
- `agent_conversations` - Conversas entre agentes
- `agent_messages` - Mensagens entre agentes

---

## 🔑 Variáveis de Ambiente

Edite o arquivo `.env` com suas chaves de API:

```env
# Obrigatório
DATABASE_URL=postgresql://...

# Opcional - Para funcionalidades de IA
OPENAI_API_KEY=sk-...
GROQ_API_KEY=...
GEMINI_API_KEY=...
AI_INTEGRATIONS_OPENAI_API_KEY=...
```

---

## 🐛 Solução de Problemas

### Erro: "DATABASE_URL must be set"
- Verifique se o arquivo `.env` existe
- Confirme que a `DATABASE_URL` está configurada corretamente

### Erro: "ECONNREFUSED"
- O banco de dados não está acessível
- Verifique se a URL está correta
- Teste a conexão com o banco de dados

### Erro: "Usuário admin já existe"
- Normal! Significa que o seed já foi executado
- Pode pular este passo

---

## 📝 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia frontend (porta 5000)
npm run server       # Inicia backend (porta 3001)

# Banco de dados
npm run db:push      # Cria/atualiza tabelas
npm run db:studio    # Abre Drizzle Studio (interface visual)
npm run db:seed      # Popula banco com dados iniciais

# Build
npm run build        # Build de produção
npm run preview      # Preview do build
```

---

## ✅ Status Atual

- [x] Dependências instaladas
- [x] Arquivo .env criado
- [x] Estrutura do código analisada
- [ ] Database URL configurada (você precisa fazer isso)
- [ ] Tabelas criadas (execute `npm run db:push`)
- [ ] Seed executado (execute `npm run db:seed`)
- [ ] Sistema rodando

---

**Próximos Passos**: Configure a `DATABASE_URL` no arquivo `.env` e execute os comandos listados acima! 🚀

