# 🚀 COMO USAR OS 5 AGENTES INTELIGENTES

## Guia Prático de Uso - Passo a Passo

---

## 📋 ANTES DE COMEÇAR

### **1. Iniciar o Sistema**

```bash
# Terminal 1: Backend
cd C:\server\grooviafull\groovia-dashboard
npm run server

# Terminal 2: Frontend
npm run dev
```

### **2. Fazer Login**
- Abrir: `http://localhost:5000`
- Login: `admin@groovia.com`
- Senha: `admin123`

---

## 🎯 PASSO A PASSO

### **Passo 1: Acessar o Workflow**

1. No menu lateral, clique em **"Workflow Inteligente"**
2. Você verá os 5 agentes em sequência
3. Apenas o Agente 1 estará disponível inicialmente

---

### **Passo 2: Agente 1 - SCAN Diagnóstico 🎯**

**O que ele faz:**
Conduz uma entrevista estratégica para entender seu negócio.

**Como usar:**
1. Clique em **"Iniciar"** no Agente 1
2. Chat será aberto
3. O agente fará perguntas sobre:
   - Contexto da empresa
   - Desafios atuais
   - Objetivos
   - Recursos disponíveis
   - Mercado
   - Proposta de valor

**Dica:**
- Responda de forma detalhada
- Seja honesto sobre desafios
- Inclua números quando possível (faturamento, tamanho da equipe, etc.)

**Tempo estimado:** 20-30 minutos

**Exemplo de conversa:**

```
Agente: "Olá! Sou o SCAN Diagnóstico. Vamos começar entendendo o contexto
da sua empresa. Qual é o nome e qual setor vocês atuam?"

Você: "Somos a Tech Solutions, uma software house focada em automação
para pequenas empresas do setor de varejo."

Agente: "Ótimo! E há quanto tempo a Tech Solutions existe? Quantas pessoas
compõem a equipe hoje?"

Você: "Existe há 3 anos, temos 12 pessoas atualmente."

[... continua a entrevista ...]
```

---

### **Passo 3: Agente 2 - SCAN CLARITY 🔍**

**O que ele faz:**
Analisa o diagnóstico e cria:
- Matriz DE-PARA (Atual → Desejado)
- 5 Diretrizes Estratégicas

**Como usar:**
1. Após concluir o Agente 1, o Agente 2 será **desbloqueado**
2. Clique em **"Iniciar"**
3. O agente pedirá confirmação das informações
4. Gerará automaticamente a análise

**Você vai receber:**
- Tabela comparativa (onde está → onde quer chegar)
- 5 diretrizes estratégicas com KPIs e prazos

**Tempo estimado:** 10-15 minutos

**Exemplo de output:**

```markdown
## 📊 ANÁLISE DE-PARA

| Aspecto | ATUAL | DESEJADO | GAP |
|---------|-------|----------|-----|
| Faturamento | R$ 1.5M/ano | R$ 5M/ano | +233% |
| Ticket Médio | R$ 3k | R$ 15k | +400% |
| Posicionamento | Generalista | Especialista Premium | Reposicionamento |

## 🎯 CINCO DIRETRIZES ESTRATÉGICAS

**DIRETRIZ 1: REPOSICIONAMENTO PREMIUM NO NICHO DE VAREJO**
- Objetivo: Migrar de generalista para especialista reconhecido
- KPI: Ticket médio R$ 15k em 12 meses
- Prazo: Médio (9 meses)
- Risco: Perda de clientes na transição
```

---

### **Passo 4: Agente 3 - Pesquisador de Mercado 📊**

**O que ele faz:**
Pesquisa profunda do mercado e cria o ICP (Ideal Customer Profile).

**Como usar:**
1. Após concluir Agente 2, clique em **"Iniciar"** no Agente 3
2. O agente trabalhará de forma **autônoma** (não precisa responder)
3. Ele simula pesquisa de mercado baseada no contexto

**Você vai receber:**
- Tamanho de mercado (TAM/SAM/SOM)
- Top 3 tendências do setor
- Análise de 5 concorrentes
- ICP completo (perfil do cliente ideal)

**Tempo estimado:** 5-10 minutos (automático)

**Exemplo de output:**

```markdown
## 📈 ANÁLISE DE MERCADO

### Tamanho e Crescimento
- TAM: R$ 15 bilhões
- SAM: R$ 2.5 bilhões
- SOM: R$ 150 milhões
- CAGR: 18% (próximos 5 anos)

## 🎯 ICP - PERFIL DO CLIENTE IDEAL

### Demográfico (B2B)
- Setor: Varejo (físico + digital)
- Faturamento: R$ 5M - R$ 50M/ano
- Funcionários: 50-200
- Localização: Sudeste Brasil

### Dores Principais
1. Processos manuais e ineficientes
2. Falta de visibilidade sobre estoque
3. Dificuldade de integração entre sistemas
```

---

### **Passo 5: Agente 4 - Criador de Persona 👤**

**O que ele faz:**
Cria 2-3 personas detalhadas baseadas no ICP.

**Como usar:**
1. Após Agente 3, clique em **"Iniciar"** no Agente 4
2. Agente criará personas humanizadas
3. Você pode pedir ajustes ou mais detalhes

**Você vai receber:**
- 2-3 personas com nome, cargo, dores, jornada de compra
- Como se comunicar com cada persona
- Palavras-chave de busca que ela usa

**Tempo estimado:** 10 minutos

**Exemplo de persona:**

```markdown
## 👤 PERSONA 1: RICARDO OLIVEIRA

### Resumo
- Cargo: Diretor de Operações
- Idade: 42 anos
- Setor: Rede de varejo (15 lojas)

### Dores Principais
- "Gasto 70% do meu tempo apagando incêndios operacionais"
- "Não consigo tomar decisões estratégicas por falta de dados"
- "Meus sistemas não conversam entre si"

### Jornada de Compra
**Fase 1: Reconhecimento**
- Percebe que está perdendo vendas por falta de controle
- Trigger: Auditoria revela R$ 300k em perda de estoque

**Fase 2: Consideração**
- Busca: "ERP para varejo", "automação de estoque"
- Avalia: ROI, facilidade de implementação, suporte

**Fase 3: Decisão**
- Decisores: Ele + CFO + CTO
- Objeções: Custo, tempo de implementação
- Fecha: Cases de sucesso + garantia de ROI em 6 meses
```

---

### **Passo 6: Agente 5 - Groovia Intelligence 🔮**

**O que ele faz:**
Consolida TUDO em um documento estratégico executivo final.

**Como usar:**
1. Após Agente 4, clique em **"Iniciar"** no Agente 5
2. Agente gerará o **Groovia Intelligence Report**
3. Documento completo pronto para apresentação

**Você vai receber:**
- Sumário executivo
- Análise DE-PARA
- 5 Diretrizes estratégicas
- Inteligência de mercado
- ICP + Personas
- Próximos passos (curto/médio/longo prazo)
- KPIs de sucesso
- Riscos e mitigações

**Tempo estimado:** 10-15 minutos

**Este é o documento final que você apresentará ao cliente para validação!**

---

## 💡 DICAS IMPORTANTES

### **Para o Agente 1 (Diagnóstico)**
- ✅ **Seja específico:** "Faturamos R$ 1.5M/ano" em vez de "Faturamos pouco"
- ✅ **Inclua números:** Tamanho da equipe, ticket médio, metas
- ✅ **Seja honesto:** Revelar desafios reais gera análises melhores
- ❌ **Evite:** Respostas vagas como "queremos crescer"

### **Para o Agente 2 (Síntese)**
- ✅ **Valide os dados:** Revise a matriz DE-PARA
- ✅ **Questione:** Se algo não fizer sentido, pergunte
- ✅ **Priorize:** Confirme quais diretrizes são mais urgentes

### **Para o Agente 3 (Mercado)**
- ✅ **Complemente:** Adicione informações que a IA não tem
- ✅ **Corrija:** Se conhecer dados mais precisos do mercado

### **Para o Agente 4 (Persona)**
- ✅ **Humanize:** Confirme se as personas fazem sentido
- ✅ **Ajuste:** Peça mais detalhes sobre dores ou jornada

### **Para o Agente 5 (Consolidador)**
- ✅ **Revise tudo:** É o documento final!
- ✅ **Exporte:** Copie o markdown para PDF/apresentação
- ✅ **Valide:** Apresente ao cliente/time

---

## 🔁 REFAZER UM AGENTE

Se quiser refazer alguma etapa:
1. Clique no agente já completo
2. Escolha **"Ver Resultado"**
3. Continue a conversa ou peça para refazer
4. O agente atualizará a análise

---

## 📤 EXPORTAR O RESULTADO FINAL

**Opção 1: Copiar Markdown**
1. No chat do Agente 5, copie todo o conteúdo
2. Cole em um editor markdown
3. Exporte para PDF (Typora, VSCode, etc.)

**Opção 2: Salvar como Documento**
1. Copie o conteúdo
2. Cole no Google Docs / Word
3. Formate e compartilhe

---

## ⏱️ TEMPO TOTAL ESTIMADO

| Agente | Tempo |
|--------|-------|
| 1. SCAN Diagnóstico | 20-30 min |
| 2. SCAN CLARITY | 10-15 min |
| 3. Pesquisador | 5-10 min (auto) |
| 4. Criador de Persona | 10 min |
| 5. Groovia Intelligence | 10-15 min |
| **TOTAL** | **~1h a 1h20** |

---

## 🆘 TROUBLESHOOTING

### **Agente não responde**
- Verificar se servidor está rodando (porta 3000)
- Verificar console do navegador (F12)
- Recarregar a página

### **Agente bloqueado**
- Precisa concluir o agente anterior primeiro
- Cada agente depende do output do anterior

### **Perdi o histórico**
- Histórico fica salvo no banco de dados
- Reabra o chat do agente para ver mensagens anteriores

### **Quero recomeçar do zero**
- Cada conversa é independente
- Basta iniciar um novo workflow

---

## 📞 SUPORTE

Para dúvidas:
- Ver: `AGENTES_INTELIGENTES_IMPLEMENTADOS.md`
- Documentação técnica completa

---

## 🎉 PRÓXIMOS PASSOS APÓS O ATO 1

Após receber o **Groovia Intelligence Report**:

1. **Validação com Cliente**
   - Apresentar o documento
   - Coletar feedback
   - Ajustar se necessário

2. **Priorização**
   - Definir quais das 5 diretrizes atacar primeiro
   - Estabelecer cronograma

3. **Ato 2 (Futuro)**
   - Planejamento tático detalhado
   - Criação de OKRs
   - Cronograma de execução

---

**🚀 Agora você está pronto para usar os 5 Agentes Inteligentes!**

**Boa sorte no diagnóstico estratégico!** 🎯

