# 🗄️ Configuração Rápida do Banco de Dados

## Opção 1: Neon Database (Recomendado - 2 minutos)

### Passo 1: Criar banco no Neon
1. Acesse: **https://console.neon.tech**
2. Clique em "Sign Up" e crie uma conta gratuita
3. Clique em "Create a project"
4. Nome do projeto: `groovia`
5. Clique em "Create project"

### Passo 2: Copiar URL
1. Na página do projeto, clique no botão **"Connection Details"**
2. Na seção **"Connection string"**, copie o texto que começa com `postgresql://...`

### Passo 3: Configurar .env
```bash
# Abra o arquivo .env no editor
# Cole a URL copiada
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host/groovia...
```

### Passo 4: Executar
```bash
npm run db:push
npm run db:seed
```

---

## Opção 2: Docker Desktop

Se você tem Docker Desktop:

### Passo 1: Iniciar Docker Desktop
1. Abra o Docker Desktop
2. Aguarde até aparecer "Docker Desktop is running" na bandeja

### Passo 2: Configurar
```bash
# Edite o arquivo .env
DATABASE_URL=postgresql://groovia:groovia123@localhost:5432/groovia

# Inicie o PostgreSQL
docker-compose up -d
```

### Passo 3: Executar
```bash
npm run db:push
npm run db:seed
```

---

## Opção 3: PostgreSQL Local

Se você tem PostgreSQL instalado localmente:

```bash
# Edite o arquivo .env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/groovia

# Crie o banco de dados
createdb groovia

# Execute
npm run db:push
npm run db:seed
```

---

## ✅ Após Configurar o Banco

### Iniciar Sistema
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### Acessar
- **Frontend**: http://localhost:5000
- **Backend**: http://localhost:3001

### Credenciais
- Email: `admin@groovia.com`
- Senha: `admin123`

---

## ⚡ Solução Mais Rápida

**Use Neon Database** - é de graça e leva 2 minutos:
1. https://console.neon.tech → Criar projeto
2. Copiar DATABASE_URL
3. Colar no .env
4. `npm run db:push && npm run db:seed`

Pronto! 🎉

