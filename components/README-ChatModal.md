# ChatModal Component

## Descrição
Componente de modal de chat interativo que permite conversa com agentes de IA. Apresenta interface moderna com mensagens, indicador de digitação, auto-scroll e reset de estado a cada abertura.

## Funcionalidades
- ✅ **Interface de chat completa** - Mensagens do usuário e agente
- ✅ **Mensagem de boas-vindas** - Automática ao abrir o modal
- ✅ **Indicador de digitação** - Animação de 3 pontos enquanto o agente "digita"
- ✅ **Auto-scroll** - Rola automaticamente para última mensagem
- ✅ **Reset de estado** - Limpa conversas ao fechar e reabrir
- ✅ **Envio por Enter** - Envia mensagem ao pressionar Enter
- ✅ **Tags de informação** - Código interno e tipo do agente
- ✅ **Fechar por overlay** - Clique fora do modal para fechar
- ✅ **Tema claro/escuro** - Totalmente responsivo

## Como Usar

### Exemplo Básico
```tsx
import { useState } from 'react';
import ChatModal from './components/ChatModal';

function App() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                Abrir Chat
            </button>

            <ChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                agentTitle="SCAN CLARITY"
                agentDescription="Agente de diagnóstico inteligente"
                agentType="Agente de Diagnóstico"
                internalCode="AGT-SC-001"
            />
        </>
    );
}
```

### Exemplo Integrado com AgentCard
```tsx
// O AgentCard já gerencia automaticamente o ChatModal
<AgentCard
    title="SCAN CLARITY"
    description="Agente de diagnóstico..."
    contextProgress={83}
    act="Ato 01"
    internalCode="AGT-SC-001"
    agentType="Agente de Diagnóstico"
/>
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `isOpen` | `boolean` | ✅ | Controla se o modal está visível |
| `onClose` | `() => void` | ✅ | Callback quando o modal é fechado |
| `agentTitle` | `string` | ✅ | Título do agente |
| `agentDescription` | `string` | ✅ | Descrição do agente |
| `agentType` | `string` | ✅ | Tipo do agente |
| `internalCode` | `string` | ✅ | Código interno do agente |

## Estrutura do Modal

### Header
- **Título do agente** - Grande e destacado
- **Descrição** - Texto secundário
- **Tags**:
  - Código Interno (roxa, monoespaçada)
  - Tipo do Agente (cinza)
- **Botão X** - Fechar modal

### Área de Mensagens
- **Scroll automático** - Sempre na última mensagem
- **Mensagens do usuário** - Alinhadas à direita, fundo roxo
- **Mensagens do agente** - Alinhadas à esquerda, fundo cinza
- **Timestamp** - Hora de envio em cada mensagem
- **Indicador de digitação** - 3 pontos animados

### Input de Mensagem
- **Campo de texto** - Placeholder "Digite sua mensagem..."
- **Botão Enviar** - Com ícone e texto
- **Enter para enviar** - Shift+Enter para nova linha

## Interface ChatMessage

```typescript
interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: Date;
}
```

## Comportamento

### Ao Abrir o Modal
1. Reseta todas as mensagens anteriores
2. Limpa o campo de input
3. Desativa indicador de digitação
4. Adiciona mensagem de boas-vindas personalizada
5. Auto-scroll para o topo

### Ao Enviar Mensagem
1. Captura texto do input
2. Adiciona mensagem do usuário
3. Limpa campo de input
4. Ativa indicador de digitação
5. Simula resposta do agente após 1.5s
6. Adiciona mensagem do agente
7. Desativa indicador de digitação
8. Auto-scroll para última mensagem

### Ao Fechar o Modal
- Estado é preservado até próxima abertura
- Na próxima abertura, tudo é resetado

## Integração com API

### Exemplo com Gemini API
```tsx
const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: userText,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userText,
                agentType: agentType,
                internalCode: internalCode
            })
        });

        const data = await response.json();

        const agentMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            message: data.response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    } finally {
        setIsTyping(false);
    }
};
```

## Estilos das Mensagens

### Mensagem do Usuário
```tsx
className="bg-primary text-white rounded-2xl px-4 py-3"
```

### Mensagem do Agente
```tsx
className="bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark rounded-2xl px-4 py-3"
```

## Animações

### Indicador de Digitação
```tsx
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
     style={{ animationDelay: '0ms' }} />
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
     style={{ animationDelay: '150ms' }} />
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
     style={{ animationDelay: '300ms' }} />
```

### Auto-scroll
```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
    scrollToBottom();
}, [messages]);
```

## Acessibilidade

- ✅ Botão X com ícone Material Icons
- ✅ Placeholder descritivo no input
- ✅ Botão desabilitado quando input está vazio
- ✅ Feedback visual de estado (digitando)
- ✅ Contraste adequado em ambos os temas

## Exemplo Completo

```tsx
import { useState } from 'react';
import ChatModal from './components/ChatModal';

function AgentDashboard() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const openChat = (agent) => {
        setSelectedAgent(agent);
        setModalOpen(true);
    };

    return (
        <>
            <button onClick={() => openChat({
                title: "SCAN CLARITY",
                description: "Agente de diagnóstico",
                type: "Diagnóstico",
                code: "AGT-SC-001"
            })}>
                Falar com SCAN CLARITY
            </button>

            {selectedAgent && (
                <ChatModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    agentTitle={selectedAgent.title}
                    agentDescription={selectedAgent.description}
                    agentType={selectedAgent.type}
                    internalCode={selectedAgent.code}
                />
            )}
        </>
    );
}
```
