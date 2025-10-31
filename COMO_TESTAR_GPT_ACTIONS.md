# 🧪 COMO TESTAR O GPT ACTION GENERATOR

## 🚀 FORMA MAIS FÁCIL: USAR OS SCRIPTS

### **No PowerShell (Windows):**
```powershell
.\testar-gpt-actions.ps1
```

### **No Bash/Linux/Mac:**
```bash
chmod +x testar-gpt-actions.sh
./testar-gpt-actions.sh
```

---

## 📋 PASSOS MANUAIS

### **1️⃣ Configure a Chave OpenAI**

**No arquivo `.env`:**
```env
OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

**Obter chave:**
- Acesse: https://platform.openai.com/api-keys
- Clique em "Create new secret key"
- Copie a chave

---

### **2️⃣ Reinicie o Servidor**

```bash
npm run server:no-telemetry
```

Verifique se aparece:
```
🚀 API rodando na porta 3001
📊 Banco de dados conectado com sucesso!
```

---

### **3️⃣ Teste os Endpoints**

#### **A) Health Check**

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
```

**Curl (Bash):**
```bash
curl http://localhost:3001/api/health
```

---

#### **B) Gerar Prompts (Preview)**

**PowerShell:**
```powershell
$body = @{
    agentType = "Diagnóstico Guiado"
    agentPurpose = "Conduzir entrevista de diagnóstico empresarial"
    context = "Empresas B2B tecnologia"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/gpt/generate-prompts" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Curl:**
```bash
curl -X POST http://localhost:3001/api/gpt/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista de diagnóstico empresarial",
    "context": "Empresas B2B tecnologia"
  }'
```

---

#### **C) Gerar e Salvar Regras para um Agente**

**PowerShell:**
```powershell
$body = @{
    agentType = "Diagnóstico Guiado"
    agentPurpose = "Conduzir entrevista de diagnóstico empresarial"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/agents/1/generate-rules" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Curl:**
```bash
curl -X POST http://localhost:3001/api/agents/1/generate-rules \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista de diagnóstico empresarial"
  }'
```

---

#### **D) Buscar Regras de um Agente**

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/agents/1/rules" -Method Get
```

**Curl:**
```bash
curl http://localhost:3001/api/agents/1/rules
```

---

#### **E) Testar Regras**

**PowerShell:**
```powershell
$body = @{
    message = "Olá, preciso de ajuda"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/agents/1/test-rules" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Curl:**
```bash
curl -X POST http://localhost:3001/api/agents/1/test-rules \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, preciso de ajuda"}'
```

---

## 🔍 INTERPRETAR RESULTADOS

### **✅ Sucesso:**
```json
{
  "success": true,
  "data": {
    "systemPrompt": "...",
    "rules": [...]
  }
}
```

### **❌ Erro: API Key não configurada**
```json
{
  "success": false,
  "error": "OPENAI_API_KEY não configurada no .env"
}
```
**Solução:** Adicione a chave no `.env` e reinicie

### **❌ Erro: Agente não encontrado**
```json
{
  "success": false,
  "error": "Agente não encontrado"
}
```
**Solução:** Use um ID de agente válido (veja em `/api/agents`)

---

## 🎯 EXEMPLO COMPLETO

### **1. Ver agentes disponíveis**
```bash
curl http://localhost:3001/api/agents
```

### **2. Gerar regras para o primeiro agente**
```bash
curl -X POST http://localhost:3001/api/agents/1/generate-rules \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista de diagnóstico empresarial"
  }'
```

### **3. Ver regras geradas**
```bash
curl http://localhost:3001/api/agents/1/rules
```

### **4. Testar regras**
```bash
curl -X POST http://localhost:3001/api/agents/1/test-rules \
  -H "Content-Type: application/json" \
  -d '{"message": "Estou tendo desafios com vendas"}'
```

---

## 🎨 USAR NO FRONTEND

### **Componente React:**
```typescript
import { apiClient } from '../hooks/useApi';

// Gerar regras
const response = await apiClient.post('/agents/1/generate-rules', {
  agentType: 'Diagnóstico Guiado',
  agentPurpose: 'Conduzir entrevista de diagnóstico'
});

// Testar regras
const testResponse = await apiClient.post('/agents/1/test-rules', {
  message: 'Preciso de ajuda'
});

if (testResponse.data.matched) {
  console.log('Regra ativada:', testResponse.data.rule);
}
```

---

## ⚡ DICAS

✅ **Configure `OPENAI_API_KEY` primeiro**  
✅ **Sempre reinicie o servidor após mudar .env**  
✅ **Teste health check antes de outros endpoints**  
✅ **Use IDs de agentes existentes**  
✅ **Revise prompts gerados antes de aplicar**  

---

## 🔧 TROUBLESHOOTING

### **Problema: Script não executa**
```powershell
# Habilitar execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Problema: Erro de sintaxe JSON**
- Verifique aspas corretas no PowerShell
- Use `ConvertTo-Json` para objetos PowerShell
- Use aspas simples no curl/bash

### **Problema: Porta ocupada**
```bash
# Verificar porta
netstat -an | findstr 3001

# Matar processo
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

---

**Teste e divirta-se!** 🚀

