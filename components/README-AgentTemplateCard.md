# AgentTemplateCard

Componente que combina o `CardTemplate` com a abertura direta do chat de agente. Ideal para destacar um agente de IA no front-end e permitir que o usuário entre em contato imediatamente.

## Funcionalidades

- Usa qualquer variante do `CardTemplate` (`default`, `compact`, `detailed`, `minimal`).
- Abre o `PremiumChat` completo (ou o `ChatModal` simples) com um clique.
- Permite personalizar o rótulo do botão de ação e reagir aos eventos de abrir/fechar.

## Uso Básico

```tsx
import AgentTemplateCard from '@/components/AgentTemplateCard';

const agent = {
  id: 7,
  title: 'Groovia Navigator',
  description: 'Planeja a jornada do cliente e sugere próximos passos.',
  agentType: 'Agente Estratégico',
  internalCode: 'AGT-GRV-007',
  act: 'Ato 01',
  progress: 72,
};

export default function Example() {
  return (
    <AgentTemplateCard
      agent={agent}
      variant="detailed"
      initialMessage="Quero revisar o funil desta semana."
    />
  );
}
```

## Modo Modal Simples

Caso queira apenas o chat leve (`ChatModal`), ajuste a propriedade `mode`:

```tsx
<AgentTemplateCard
  agent={agent}
  mode="modal"
  actionsLabel="Abrir chat básico"
/>;
```

## Eventos

```tsx
<AgentTemplateCard
  agent={agent}
  onChatOpen={(info) => console.log('Chat aberto', info)}
  onChatClose={(info) => console.log('Chat fechado', info)}
/>;
```

## Propriedades

| Propriedade | Tipo | Default | Descrição |
|-------------|------|---------|-----------|
| `agent` | `AgentTemplateCardAgent` | — | Dados do agente (id, título, descrição, tipo, código interno etc.) |
| `variant` | `'default' \\| 'compact' \\| 'detailed' \\| 'minimal'` | `'default'` | Variante visual do card |
| `mode` | `'premium' \\| 'modal'` | `'premium'` | Seleciona entre `PremiumChat` e `ChatModal` |
| `initialMessage` | `string` | — | Mensagem enviada automaticamente ao abrir o chat premium |
| `cardClassName` | `string` | — | Classe extra para estilizar o card |
| `actionsLabel` | `string` | `'Conversar'` | Texto do botão dentro do card (somente variante `default`) |
| `onChatOpen` | `(agent) => void` | — | Executado ao abrir o chat |
| `onChatClose` | `(agent) => void` | — | Executado ao fechar o chat |


