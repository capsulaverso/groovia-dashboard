# 🔧 CORREÇÃO - ERRO DE AUTENTICAÇÃO NO BANCO

**Erro:** `password authentication failed for user 'authenticated'`

---

## 🐛 PROBLEMA

A `DATABASE_URL` no `.env` não está correta ou está faltando a senha.

---

## ✅ SOLUÇÕES

### Opção 1: Atualizar DATABASE_URL no .env

1. Acesse o [Neon Console](https://console.neon.tech)
2. Vá em seu projeto
3. Clique em "Connection String"
4. Copie a URL completa com a senha
5. Cole no `.env`

```env
DATABASE_URL=postgresql://usuario:senha@host/dbname?sslmode=require
```

### Opção 2: Usar Modo Local Temporário

Se não conseguir conectar ao Neon, podemos usar modo em memória temporário.

---

## 📋 FORMATO CORRETO DA URL

```env
# Formato correto
DATABASE_URL=postgresql://usuario:senha@ep-xxx-xxx.us-east-1.aws.neon.tech/nomedb?sslmode=require

# IMPORTANTE: Deve incluir usuario E senha!
```

---

## 🎯 PRÓXIMOS PASSOS

1. Verificar URL no Neon Console
2. Copiar URL completa com senha
3. Colar no `.env`
4. Executar `npm run db:seed` novamente

---

**Status:** Aguardando DATABASE_URL correta

