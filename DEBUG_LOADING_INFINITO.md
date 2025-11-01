# 🔍 Debug: Loading Infinito

## Problema

O chat fica "carregando infinitamente" após abrir.

## Possíveis causas

### 1. `ensureConversation` não está sendo chamado
- `enabled = false`
- `agentId` não existe
- `user.id` não existe
- `user.clientId` não existe

### 2. `ensureConversation` falha silenciosamente
- Erro na API ao buscar conversas
- Erro ao criar conversa
- Erro ao criar sessão
- Erro ao buscar mensagens

### 3. `loading` nunca é setado para `false`
- `setLoading(false)` não está sendo chamado no `finally`

## Logs para verificar

### No console, você DEVE ver:

```
🎬 useChatSession INICIALIZADO
📊 Options: { agentId: 9, agentTitle: "...", enabled: true }
👤 User: { id: 1, clientId: 1 }

🔄 [useEffect] Verificando se deve chamar ensureConversation
📊 Estado: { enabled: true, agentId: 9, userId: 1 }
✅ Chamando ensureConversation...

🔍 [ensureConversation] Iniciando...
📊 Verificando condições: { enabled: true, agentId: 9, userId: 1, clientId: 1 }
✅ Todas condições OK! Criando/buscando conversa...
🌐 Buscando conversas do usuário...
```

### Se você NÃO vê estes logs:

#### Se para em "useChatSession INICIALIZADO":
- O `useEffect` não está executando
- Problema com as dependências do `useEffect`

#### Se para em "Verificando se deve chamar":
- Uma das condições está falhando (`enabled`, `agentId`, `user.id`)

#### Se para em "Chamando ensureConversation":
- O `ensureConversation` está travando ou falhando

#### Se para em "Verificando condições":
- `user.clientId` está faltando
- Uma das condições não está sendo atendida

#### Se para em "Buscando conversas do usuário":
- A API `/users/${userId}/conversations` está falhando
- Problemas de rede ou backend

## Correção aplicada

Adicionei um log de aviso que aparece enquanto está carregando:

```
⏳ CARREGANDO HÁ MUITO TEMPO!
🔍 Estado atual: { loading, conversationId, agentId, userId }
```

## Próximos passos

1. **Abra o console (F12)**
2. **Recarregue a página (F5)**
3. **Clique no card verde**
4. **Digite "oi" e clique em "Continuar"**
5. **Veja QUAL É O ÚLTIMO LOG que aparece**
6. **Me envie esse último log**

Isso vai me dizer EXATAMENTE onde está travando!

## Checklist de verificação

- [ ] Vejo "🎬 useChatSession INICIALIZADO"?
- [ ] Vejo "🔄 [useEffect] Verificando..."?
- [ ] Vejo "✅ Chamando ensureConversation..."?
- [ ] Vejo "🔍 [ensureConversation] Iniciando..."?
- [ ] Vejo "🌐 Buscando conversas do usuário..."?
- [ ] Vejo "🔢 Setando conversationId: X"?
- [ ] Vejo "🏁 ensureConversation CONCLUÍDO!"?

**O último item marcado indica onde o processo está travando!**

