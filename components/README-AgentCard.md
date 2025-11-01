# AgentCard Component

## Descrição
Componente reutilizável de card de agente interativo que exibe informações do agente e abre um modal de chat quando clicado. Apresenta animações visuais, progresso circular e tags de identificação para controle de recursos.

## Funcionalidades
- ✅ **Três barras verdes animadas** - Efeito de pulsação com delays escalonados
- ✅ **Progresso circular** - Mostra porcentagem de contexto/preenchimento
- ✅ **Título e descrição** - Informações do agente
- ✅ **Tags de identificação**:
  - **Ato**: Fase do workflow (ex: "Ato 01", "Ato 02")
  - **Código Interno**: Identificador único para controle de recursos/tokens
- ✅ **Interação clicável** - Abre modal de chat ao clicar
- ✅ **Efeito hover** - Sombra ao passar o mouse
- ✅ **Tema claro/escuro** - Totalmente responsivo ao tema do sistema

## Como Usar

### Exemplo Básico
```tsx
<AgentCard
    title="SCAN CLARITY"
    description="Tem como objetivo consolidar informações do cliente..."
    contextProgress={83}
    act="Ato 01"
    internalCode="AGT-SC-001"
    agentType="Agente de Diagnóstico"
/>
```

### Exemplo com Callback
```tsx
<AgentCard
    title="Pesquisador de Mercado"
    description="Agente autônomo para pesquisa de mercado..."
    contextProgress={67}
    act="Ato 02"
    internalCode="AGT-PM-002"
    agentType="Agente de Pesquisa"
    onClick={() => console.log('Card clicado!')}
/>
```

### Exemplo com Dados de Array
```tsx
const agents = [
    {
        id: "agent-001",
        title: "SCAN CLARITY",
        description: "Consolidar informações do cliente...",
        contextProgress: 83,
        act: "Ato 01",
        internalCode: "AGT-SC-001",
        agentType: "Agente de Diagnóstico"
    },
    // ... mais agentes
];

{agents.map(agent => (
    <AgentCard 
        key={agent.id}
        title={agent.title}
        description={agent.description}
        contextProgress={agent.contextProgress}
        act={agent.act}
        internalCode={agent.internalCode}
        agentType={agent.agentType}
    />
))}
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `title` | `string` | ✅ | Título do agente |
| `description` | `string` | ✅ | Descrição do agente |
| `contextProgress` | `number` | ✅ | Porcentagem de contexto (0-100) |
| `act` | `string` | ✅ | Fase do workflow (ex: "Ato 01") |
| `internalCode` | `string` | ✅ | Código interno do agente (ex: "AGT-SC-001") |
| `agentType` | `string` | ✅ | Tipo do agente (ex: "Agente de Diagnóstico") |
| `onClick` | `() => void` | ❌ | Callback opcional quando o card é clicado |

## Estrutura Visual

### 1. Ícone do Agente
- Círculo roxo com indicador branco no canto superior direito
- Posicionado no topo do card

### 2. Três Barras Verdes Animadas
- Altura: 3.5 (14px)
- Cor: verde-400 (#4ade80)
- Animação: pulsação com delays de 0ms, 200ms, 400ms
- Duração: 2000ms

### 3. Progresso de Contexto
- Texto: "SCAN {contextProgress}%"
- Anel circular de progresso verde
- Tamanho: 8x8 (32px)

### 4. Título e Descrição
- Título: semibold, tamanho base
- Descrição: texto pequeno, cor secundária

### 5. Tags
- **Tag Ato**: Cinza com borda
- **Tag Código Interno**: Roxa com fonte monoespaçada

## Animações

### Barras de Progresso
```tsx
animate-pulse com delays escalonados:
- Barra 1: delay 0ms
- Barra 2: delay 200ms
- Barra 3: delay 400ms
- Duração: 2000ms
```

### Hover Effect
```tsx
hover:shadow-lg transition-shadow duration-300
```

## Integração com ChatModal

O AgentCard automaticamente:
1. Gerencia o estado de abertura do modal (`isModalOpen`)
2. Passa as props necessárias para o ChatModal
3. Fecha o modal quando o usuário clica no botão X ou fora do modal

## Códigos Internos Sugeridos

- **AGT-SC-XXX**: Agentes de Scan/Diagnóstico
- **AGT-PM-XXX**: Agentes de Pesquisa de Mercado
- **AGT-CP-XXX**: Agentes de Criação de Persona
- **AGT-EC-XXX**: Agentes de Estratégia Corporativa
- **AGT-DRE-XXX**: Agentes Financeiros
- **AGT-OKR-XXX**: Agentes de Planejamento
- **AGT-BR-XXX**: Agentes de Branding/Marketing

## Controle de Recursos

Use o `internalCode` para:
- Rastrear qual agente está consumindo mais tokens
- Monitorar custos por agente
- Gerar relatórios de uso
- Implementar limites de quota
- Debugar problemas específicos de agentes

## Exemplo Completo

```tsx
import AgentCard from './components/AgentCard';

function Dashboard() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AgentCard
                title="SCAN CLARITY"
                description="Tem como objetivo consolidar informações do cliente que preencheu o Scan Clarity, criando o DE-PARA e até 5 diretrizes estratégicas"
                contextProgress={83}
                act="Ato 01"
                internalCode="AGT-SC-001"
                agentType="Agente de Diagnóstico"
                onClick={() => {
                    console.log('Agente SCAN CLARITY clicado');
                    // Analytics, tracking, etc.
                }}
            />
        </div>
    );
}
```
