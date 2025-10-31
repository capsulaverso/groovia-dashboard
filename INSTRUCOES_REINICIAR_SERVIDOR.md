# 🔄 INSTRUÇÕES: REINICIAR SERVIDOR

## ⚠️ IMPORTANTE: O SERVIDOR PRECISA SER REINICIADO!

O endpoint `/api/gpt/generate-prompts` foi adicionado, mas o servidor precisa ser reiniciado para carregar as mudanças.

---

## 🚀 COMO REINICIAR

### **Opção 1: Manual (Recomendado)**

**1. Pare o servidor atual:**
```
Pressione Ctrl+C no terminal onde o servidor está rodando
```

**2. Reinicie:**
```bash
npm run server:no-telemetry
```

**3. Verifique no log:**
```
🤖 GPT Action Generator configurado: Vercel Gateway
🚀 API rodando na porta 3001
📊 Banco de dados conectado com sucesso!
```

---

### **Opção 2: Matar processo e reiniciar**

**PowerShell:**
```powershell
# Matar todos os processos Node
Get-Process -Name node | Stop-Process -Force

# Reiniciar
npm run server:no-telemetry
```

**Bash/Linux:**
```bash
# Matar todos os processos Node
killall node

# Reiniciar
npm run server:no-telemetry
```

---

## ✅ VERIFICAR SE FUNCIONOU

### **1. Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
```

### **2. Lista de Endpoints:**
Verifique no log do servidor se aparece:
```
🤖 GPT Action Generator configurado: Vercel Gateway
```

### **3. Testar Script:**
```powershell
.\testar-gpt-actions.ps1
```

---

## 🔍 TROUBLESHOOTING

### **Erro: "Cannot POST /api/gpt/generate-prompts"**

**Causa:** Servidor não foi reiniciado após adicionar endpoints

**Solução:** Reinicie o servidor seguindo as instruções acima

---

### **Erro: "Module not found: './actions/gpt-action-generator.js'"**

**Causa:** Pasta `actions` não foi criada ou arquivo não foi criado

**Solução:**
```bash
# Verificar se arquivo existe
ls server/actions/gpt-action-generator.ts

# Se não existir, crie:
# (O arquivo já foi criado automaticamente)
```

---

### **Erro: "Cannot find module 'openai'"**

**Causa:** Pacote OpenAI não instalado

**Solução:**
```bash
npm install openai
```

---

## 📝 CHECKLIST

- [ ] Servidor parou completamente
- [ ] `npm run server:no-telemetry` executado
- [ ] Log mostra "GPT Action Generator configurado"
- [ ] Health check responde OK
- [ ] Script de teste funciona

---

## 🎯 PRÓXIMO PASSO

Após reiniciar:

```powershell
.\testar-gpt-actions.ps1
```

**Deve funcionar!** ✅

