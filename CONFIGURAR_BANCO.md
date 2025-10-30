# 🗄️ Configuração Rápida do Banco de Dados

## Opção 1: Supabase (Recomendado - 2 minutos)

### Passo 1: Criar banco no Supabase
1. Acesse: **https://supabase.com**
2. Clique em "Start your project" e crie uma conta gratuita
3. Crie um novo projeto
4. Nome do projeto: `groovia`
5. Escolha uma senha forte para o banco de dados
6. Clique em "Create new project"

### Passo 2: Copiar Connection String
1. Na página do projeto, vá em **Settings** → **Database**
2. Role até **Connection string** → **URI**
3. Copie a URL que começa com `postgresql://postgres...`

### Passo 3: Configurar .env
```bash
# Abra o arquivo .env no editor
# Cole a URL copiada
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.[PROJETO].supabase.co:5432/postgres
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

**Use Supabase** - é de graça e leva 2 minutos:
1. https://supabase.com → Criar projeto
2. Copiar Connection String do Settings → Database
3. Colar no .env
4. `npm run db:push && npm run db:seed`

Pronto! 🎉

