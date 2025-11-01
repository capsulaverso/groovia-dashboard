# 🚀 Groovia Dashboard - Guia de Inicialização

## ✅ Status da Revisão

- **Banco de Dados**: ✅ Conectado (Neon PostgreSQL)
- **Tabelas**: ✅ Criadas
- **Dados Iniciais**: ✅ Cliente, 2 usuários, 7 agentes
- **Arquivos Duplicados**: ✅ Nenhum encontrado
- **Configuração**: ✅ `.env` corrigido

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm instalado
- Conexão com internet (para acessar Neon Database)

---

## 🎯 Como Iniciar o Sistema

### Opção 1: Scripts Automáticos (Recomendado)

#### 1. Iniciar Backend
```bash
# Duplo clique ou execute no terminal:
start-server.bat
```

#### 2. Iniciar Frontend (em outro terminal)
```bash
# Duplo clique ou execute no terminal:
start-frontend.bat
```

### Opção 2: Manual (PowerShell)

#### Terminal 1 - Backend
```powershell
cd C:\server\grooviafull\groovia-dashboard
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
npm run server
```

#### Terminal 2 - Frontend
```powershell
cd C:\server\grooviafull\groovia-dashboard
npm run dev
```

---

## 🔐 Credenciais de Acesso

### Administrador
- **Email**: admin@groovia.com
- **Senha**: admin123

### Usuário Normal
- **Email**: user@groovia.com
- **Senha**: user123

---

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

---

## 🔧 Comandos Úteis

```powershell
# Verificar tabelas do banco
npm run db:studio

# Recriar dados iniciais
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
npm run db:seed

# Atualizar schema do banco
npm run db:push

# Build de produção
npm run build
```

---

## 🐛 Solução de Problemas

### ⚠️ IMPORTANTE: Problema com Telemetria
**O OpenTelemetry está causando travamento no servidor.**

✅ **Solução**: O arquivo `start-server.bat` já foi corrigido para iniciar sem telemetria.

Se precisar iniciar manualmente:
```powershell
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
npx tsx server/index.ts
```

### Erro: "DATABASE_URL não configurada"
**Solução**: Use os scripts `.bat` ou defina manualmente:
```powershell
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
```

### Erro: "Internal Server Error" ao carregar agentes
**Causas possíveis**:
1. Backend não está rodando
2. Dados não foram criados no banco

**Solução**:
```powershell
# 1. Verificar se backend está rodando
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing

# 2. Se não estiver, iniciar com start-server.bat ou:
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
npx tsx server/index.ts

# 3. Verificar se há dados (em outro terminal):
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"
npm run db:seed
```

### Testar rota de agentes manualmente
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/agents?clientId=1" -UseBasicParsing
# Deve retornar 7 agentes
```

### Porta 3001 ou 5000 em uso
**Solução**: Identifique e encerre o processo:
```powershell
# Ver processos na porta
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Encerrar processo (substitua PID pelo número encontrado)
Stop-Process -Id PID -Force
```

---

## 📊 Estrutura do Sistema

```
groovia-dashboard/
├── server/              # Backend Express + PostgreSQL
│   ├── index.ts        # API REST
│   ├── db.ts           # Conexão Neon
│   ├── storage.ts      # Queries Drizzle
│   └── seed.ts         # Dados iniciais
├── components/          # React Components
├── hooks/              # Custom React Hooks
├── shared/             # Schema Drizzle
├── start-server.bat    # Inicia backend
├── start-frontend.bat  # Inicia frontend
└── .env                # Variáveis de ambiente
```

---

## ✨ Funcionalidades Disponíveis

- ✅ Login e autenticação
- ✅ Dashboard com métricas
- ✅ Gestão de agentes IA
- ✅ Upload de documentos
- ✅ Chat com agentes
- ✅ Relatórios e OpenTelemetry
- ✅ Gestão de usuários (admin)
- ✅ Sistema de páginas dinâmicas

---

## 📝 Notas Importantes

1. **Segurança**: As credenciais do `.env` são sensíveis. Não compartilhe publicamente.
2. **Produção**: Antes de subir para produção, gere novas senhas e tokens.
3. **Backups**: O Neon faz backups automáticos, mas considere backups adicionais.
4. **Monitoramento**: OpenTelemetry já está configurado para rastreamento.

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do backend (terminal onde rodou `start-server.bat`)
2. Verifique os logs do frontend (terminal onde rodou `start-frontend.bat`)
3. Consulte o console do navegador (F12)
4. Verifique a conexão com o Neon Database

---

**Sistema revisado e pronto para uso! 🎉**

