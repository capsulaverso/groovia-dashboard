# ⚡ QUICK START - CARD TEMPLATE

## Instalação (já incluído!)

```bash
# O componente já está em components/CardTemplate.tsx
# Apenas importe e use!
```

---

## Import

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';
```

---

## Uso Básico (1 minuto)

### Exemplo Mínimo

```typescript
const MyComponent = () => {
  const cardData = {
    title: 'Meu Agente',
    description: 'Uma descrição interessante',
    icon: 'smart_toy',
    status: 'active'
  };

  return <CardTemplate data={cardData} />;
};
```

---

## 4 Variantes

### 1. Default (Padrão Completo)
```typescript
<CardTemplate 
  data={cardData} 
  variant="default"
/>
```
**Usa para:** Cards principais, dashboards

---

### 2. Compact (Minimalista)
```typescript
<CardTemplate 
  data={cardData} 
  variant="compact"
/>
```
**Usa para:** Listas, sidebars, tabelas

---

### 3. Detailed (Com Progresso)
```typescript
<CardTemplate 
  data={cardData} 
  variant="detailed"
/>
```
**Usa para:** Cards com métricas e progresso

---

### 4. Minimal (Super Compacto)
```typescript
<CardTemplate 
  data={cardData} 
  variant="minimal"
/>
```
**Usa para:** Indicadores, badges

---

## Estrutura de Dados

```typescript
interface CardData {
  // Obrigatório
  title: string;

  // Recomendado
  description?: string;
  icon?: string;           // Material Icons
  status?: 'active' | 'inactive' | 'pending';
  badge?: string;
  
  // Opcional
  id?: string | number;
  progress?: number;       // 0-100
  backgroundColor?: string;
  createdAt?: string;
  
  // Customize à vontade
  [key: string]: any;
}
```

---

## Exemplos Rápidos

### Com Status

```typescript
const card = {
  title: 'Agente Ativo',
  description: 'Status automático',
  status: 'active',      // ✅ Ativo (verde)
  icon: 'check_circle'
};

<CardTemplate data={card} />
```

### Com Badge

```typescript
const card = {
  title: 'Novo Agente',
  description: 'Com badge de identificação',
  badge: 'Ato 01',       // Badge customizado
  icon: 'star'
};

<CardTemplate data={card} />
```

### Com Progresso

```typescript
const card = {
  title: 'Agente em Progresso',
  description: 'Acompanhando progresso',
  progress: 65,          // 65% completo
  status: 'active'
};

<CardTemplate data={card} variant="detailed" />
```

### Com Clique

```typescript
const handleClick = () => alert('Card clicado!');

<CardTemplate 
  data={card}
  onClick={handleClick}
/>
```

---

## Popular com Array

```typescript
const agents = [
  { title: 'Agent 1', icon: 'insights', status: 'active' },
  { title: 'Agent 2', icon: 'search', status: 'pending' },
  { title: 'Agent 3', icon: 'flag', status: 'inactive' }
];

return (
  <div className="grid grid-cols-3 gap-4">
    {agents.map(agent => (
      <CardTemplate key={agent.title} data={agent} />
    ))}
  </div>
);
```

---

## Popular com API

```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '@/hooks/useApi';

const Component = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    apiClient.get('/api/agents')
      .then(data => setCards(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(item => (
        <CardTemplate 
          key={item.id}
          data={{
            id: item.id,
            title: item.name,
            description: item.description,
            icon: 'smart_toy',
            status: item.active ? 'active' : 'inactive',
            badge: item.tag
          }}
        />
      ))}
    </div>
  );
};
```

---

## Status Disponíveis

```typescript
// Verde (Ativo)
status: 'active'

// Cinza (Inativo)
status: 'inactive'

// Amarelo (Pendente)
status: 'pending'
```

---

## Ícones (Material Icons Outlined)

```typescript
// Exemplos populares
icon: 'smart_toy'         // Robô
icon: 'insights'          // Gráfico
icon: 'search'            // Lupa
icon: 'flag'              // Bandeira
icon: 'analytics'         // Análise
icon: 'auto_awesome'      // Estrela mágica
icon: 'check_circle'      // Check
icon: 'star'              // Estrela
icon: 'settings'          // Engrenagem
icon: 'speed'             // Velocidade

// Ver mais em: https://fonts.google.com/icons
```

---

## Grid Responsivo

```typescript
<div className="grid 
  grid-cols-1       // 1 coluna no mobile
  md:grid-cols-2    // 2 colunas em tablet
  lg:grid-cols-3    // 3 colunas em desktop
  xl:grid-cols-4    // 4 colunas em 4K
  gap-4 p-6">
  
  {cards.map(card => (
    <CardTemplate key={card.id} data={card} />
  ))}
</div>
```

---

## Customização com className

```typescript
<CardTemplate 
  data={card}
  className="!rounded-lg !p-3 !shadow-none"
/>
```

---

## Com Ações

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

const card: CardData = {
  id: 1,
  title: 'Card com Ações',
  description: 'Tem botões de editar e deletar',
  status: 'active'
};

const actions = (
  <div className="flex gap-2">
    <button className="p-2 hover:bg-blue-100 rounded">
      <span className="material-icons-outlined">edit</span>
    </button>
    <button className="p-2 hover:bg-red-100 rounded text-red-600">
      <span className="material-icons-outlined">delete</span>
    </button>
  </div>
);

<CardTemplate 
  data={card}
  variant="default"
  actions={actions}
/>
```

---

## Dicas Profissionais

### ✅ Bom

```typescript
// Dados estruturados
const card = {
  id: 123,
  title: 'Título Claro',
  description: 'Descrição significativa',
  icon: 'valid_icon',
  status: 'active'
};

// Usar com map e key
{items.map(item => (
  <CardTemplate key={item.id} data={item} />
))}

// Combinar com useState
const [cards, setCards] = useState([]);
```

### ❌ Evitar

```typescript
// Título vazio
const badCard = { title: '' };

// Ícone inválido
const badCard = { icon: 'icone_inexistente' };

// Sem key em listas
{items.map((item, i) => (
  <CardTemplate key={i} data={item} />  // ❌
))}

// Strings vazias
const card = { description: '' };
```

---

## Variantes Lado a Lado

```typescript
const card = {
  title: 'Exemplo',
  description: 'Mesmos dados, 4 aparências'
};

return (
  <div className="space-y-4">
    <div>DEFAULT: <CardTemplate data={card} /></div>
    <div>COMPACT: <CardTemplate data={card} variant="compact" /></div>
    <div>DETAILED: <CardTemplate data={card} variant="detailed" /></div>
    <div>MINIMAL: <CardTemplate data={card} variant="minimal" /></div>
  </div>
);
```

---

## Dark Mode (Automático)

O componente detecta automaticamente:

```html
<!-- Light Mode (padrão) -->
<html>

<!-- Dark Mode -->
<html class="dark">
```

**Sem código extra necessário!** 🌓

---

## Propriedades Completas

```typescript
interface CardTemplateProps {
  data: CardData;                    // Obrigatório
  variant?: 'default' | 'compact'    // Tipo de card
           | 'detailed' | 'minimal';
  onClick?: () => void;              // Função de clique
  actions?: React.ReactNode;         // Botões customizados
  showStatus?: boolean;              // Mostrar status badge
  className?: string;                // Classes extras
  children?: ReactNode;              // Conteúdo extra
}
```

---

## Checklist de Uso

- [ ] Importou `CardTemplate` e `CardData`
- [ ] Criou interface `CardData` com dados
- [ ] Escolheu variante (default/compact/detailed/minimal)
- [ ] Passou `data` como prop
- [ ] Renderizou no JSX

**Pronto! 🎉**

---

## Suporte

### Documentação Completa
👉 `EXEMPLOS_CARD_TEMPLATE.md` - 10 exemplos detalhados

### Código Fonte
👉 `components/CardTemplate.tsx` - 388 linhas bem documentadas

### Tipos
👉 `CardData` e `CardTemplateProps` exportados e tipados

---

## Resumo

```typescript
// Tudo que você precisa:
import CardTemplate from '@/components/CardTemplate';

// Dados simples
const data = {
  title: 'Agente',
  description: 'Descrição',
  icon: 'smart_toy',
  status: 'active'
};

// Renderizar
<CardTemplate data={data} variant="default" />

// Repetir quantas vezes quiser ♻️
```

---

**Criado por:** AI Coding Assistant  
**Data:** 2025-10-29  
**Versão:** 1.0  
**Status:** ✅ Pronto para Produção
