# 🎨 EXEMPLOS DE USO - CARD TEMPLATE

## IMPORTAÇÃO

```typescript
import CardTemplate, { CardData, CardTemplateProps } from '@/components/CardTemplate';
```

---

## EXEMPLO 1: CARD SIMPLES COM DADOS ESTÁTICOS

```typescript
import CardTemplate from '@/components/CardTemplate';

const MyComponent = () => {
  const cardData = {
    id: 1,
    title: 'SCAN CLARITY',
    description: 'Agente de diagnóstico completo de negócio',
    icon: 'insights',
    status: 'active',
    badge: 'Ato 01'
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <CardTemplate 
        data={cardData}
        variant="default"
        onClick={() => console.log('Card clicado!')}
      />
    </div>
  );
};

export default MyComponent;
```

---

## EXEMPLO 2: MÚLTIPLOS CARDS COM ARRAY

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

const MultipleCards = () => {
  const agents: CardData[] = [
    {
      id: 1,
      title: 'SCAN CLARITY',
      description: 'Diagnóstico de negócio',
      icon: 'insights',
      status: 'active',
      badge: 'Ato 01',
      progress: 75
    },
    {
      id: 2,
      title: 'Market Research',
      description: 'Pesquisa de mercado e ICP',
      icon: 'search',
      status: 'pending',
      badge: 'Ato 02',
      progress: 45
    },
    {
      id: 3,
      title: 'Strategy Planner',
      description: 'Planejamento estratégico',
      icon: 'flag',
      status: 'inactive',
      badge: 'Ato 03',
      progress: 0
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {agents.map((agent) => (
        <CardTemplate
          key={agent.id}
          data={agent}
          variant="detailed"
          onClick={() => console.log(`Clicou em: ${agent.title}`)}
        />
      ))}
    </div>
  );
};

export default MultipleCards;
```

---

## EXEMPLO 3: CARDS COM DADOS DA API

```typescript
import { useEffect, useState } from 'react';
import CardTemplate, { CardData } from '@/components/CardTemplate';
import { apiClient } from '@/hooks/useApi';

const CardsFromAPI = () => {
  const [agents, setAgents] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>('/api/agents');
      
      // Mapear dados da API para CardData
      const cardData = response.map((agent) => ({
        id: agent.id,
        title: agent.name,
        description: agent.description,
        icon: getIconForType(agent.type),
        status: agent.status === 'ativo' ? 'active' : 'inactive',
        badge: agent.act,
        progress: agent.progress || 0,
        ...agent // Manter dados extras
      }));
      
      setAgents(cardData);
    } catch (error) {
      console.error('Erro ao buscar agentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      'diagnóstico': 'insights',
      'pesquisa': 'search',
      'estratégia': 'flag',
      'análise': 'analytics',
      'criação': 'auto_awesome'
    };
    return iconMap[type.toLowerCase()] || 'smart_toy';
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {agents.map((agent) => (
        <CardTemplate
          key={agent.id}
          data={agent}
          variant="detailed"
          onClick={() => handleAgentClick(agent)}
        />
      ))}
    </div>
  );

  function handleAgentClick(agent: CardData) {
    console.log('Agente selecionado:', agent);
    // Abrir modal, navegar, etc.
  }
};

export default CardsFromAPI;
```

---

## EXEMPLO 4: CARDS COM VARIANTES DIFERENTES

```typescript
import CardTemplate from '@/components/CardTemplate';

const CardVariants = () => {
  const exampleData = {
    id: 1,
    title: 'Exemplo de Card',
    description: 'Esta é uma descrição de exemplo para o card template',
    icon: 'smart_toy',
    status: 'active',
    badge: 'Exemplo',
    progress: 65
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-bold mb-3">Variante: Default</h3>
        <CardTemplate data={exampleData} variant="default" />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Variante: Compact</h3>
        <CardTemplate data={exampleData} variant="compact" />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Variante: Detailed</h3>
        <CardTemplate data={exampleData} variant="detailed" />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Variante: Minimal</h3>
        <div className="space-y-2">
          <CardTemplate data={exampleData} variant="minimal" />
          <CardTemplate data={exampleData} variant="minimal" />
          <CardTemplate data={exampleData} variant="minimal" />
        </div>
      </div>
    </div>
  );
};

export default CardVariants;
```

---

## EXEMPLO 5: CARDS COM AÇÕES CUSTOMIZADAS

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

const CardsWithActions = () => {
  const cardData: CardData = {
    id: 1,
    title: 'SCAN CLARITY',
    description: 'Agente de diagnóstico',
    icon: 'insights',
    status: 'active',
    badge: 'Ato 01'
  };

  const handleEdit = () => {
    console.log('Editar card');
  };

  const handleDelete = () => {
    console.log('Deletar card');
  };

  const actions = (
    <div className="flex gap-2">
      <button
        onClick={handleEdit}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
      >
        <span className="material-icons-outlined text-sm">edit</span>
      </button>
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600"
      >
        <span className="material-icons-outlined text-sm">delete</span>
      </button>
    </div>
  );

  return (
    <CardTemplate
      data={cardData}
      variant="default"
      actions={actions}
    />
  );
};

export default CardsWithActions;
```

---

## EXEMPLO 6: GRID RESPONSIVO DE CARDS

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

const ResponsiveGrid = () => {
  const agents: CardData[] = [
    // ... sua lista de agentes
  ];

  return (
    <div className="grid 
      grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-4 p-6">
      {agents.map((agent) => (
        <CardTemplate
          key={agent.id}
          data={agent}
          variant="default"
        />
      ))}
    </div>
  );
};

export default ResponsiveGrid;
```

---

## EXEMPLO 7: FILTRO E BUSCA DE CARDS

```typescript
import { useState, useMemo } from 'react';
import CardTemplate, { CardData } from '@/components/CardTemplate';

const FilterableCards = () => {
  const allAgents: CardData[] = [
    // ... seus dados
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredAgents = useMemo(() => {
    return allAgents.filter((agent) => {
      const matchesSearch = agent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <CardTemplate
            key={agent.id}
            data={agent}
            variant="default"
          />
        ))}
      </div>
    </div>
  );
};

export default FilterableCards;
```

---

## EXEMPLO 8: CARDS COM ESTADO LOCAL

```typescript
import { useState } from 'react';
import CardTemplate, { CardData } from '@/components/CardTemplate';

const StatefulCards = () => {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: 1,
      title: 'Card 1',
      description: 'Descrição 1',
      icon: 'insights',
      status: 'active',
      progress: 50
    },
    {
      id: 2,
      title: 'Card 2',
      description: 'Descrição 2',
      icon: 'search',
      status: 'active',
      progress: 75
    }
  ]);

  const handleProgressUpdate = (id: number, newProgress: number) => {
    setCards(cards.map(card => 
      card.id === id 
        ? { ...card, progress: newProgress }
        : card
    ));
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {cards.map((card) => (
        <div key={card.id}>
          <CardTemplate
            data={card}
            variant="detailed"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={card.progress || 0}
            onChange={(e) => handleProgressUpdate(card.id as number, parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      ))}
    </div>
  );
};

export default StatefulCards;
```

---

## EXEMPLO 9: CARD COM DADOS COMPLEXOS

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

interface ExtendedCardData extends CardData {
  customField?: string;
  metrics?: {
    views: number;
    interactions: number;
    score: number;
  };
  tags?: string[];
}

const ComplexCard = () => {
  const complexData: ExtendedCardData = {
    id: 1,
    title: 'SCAN CLARITY',
    description: 'Diagnóstico de negócio',
    icon: 'insights',
    status: 'active',
    badge: 'Ato 01',
    progress: 85,
    customField: 'Valor customizado',
    metrics: {
      views: 1250,
      interactions: 342,
      score: 9.2
    },
    tags: ['diagnóstico', 'estratégia', 'análise'],
    createdAt: new Date().toISOString()
  };

  return (
    <CardTemplate
      data={complexData}
      variant="detailed"
      onClick={() => console.log('Dados complexos:', complexData)}
    />
  );
};

export default ComplexCard;
```

---

## EXEMPLO 10: CARD BUILDER / FACTORY

```typescript
import CardTemplate, { CardData } from '@/components/CardTemplate';

// Factory para criar CardData consistente
const createCardData = (override?: Partial<CardData>): CardData => {
  return {
    id: Date.now(),
    title: 'Novo Card',
    description: 'Descrição padrão',
    icon: 'smart_toy',
    status: 'pending',
    badge: 'NEW',
    progress: 0,
    ...override
  };
};

const CardFactory = () => {
  const cards = [
    createCardData({ title: 'Card 1', status: 'active' }),
    createCardData({ title: 'Card 2', status: 'inactive' }),
    createCardData({ title: 'Card 3', status: 'pending' }),
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {cards.map((card) => (
        <CardTemplate key={card.id} data={card} variant="default" />
      ))}
    </div>
  );
};

export default CardFactory;
```

---

## TIPOS DE DADOS SUPORTADOS

```typescript
interface CardData {
  // Obrigatório
  title: string;

  // Opcional
  id?: string | number;
  description?: string;
  icon?: string;                    // Material Icons Outlined
  status?: 'active' | 'inactive' | 'pending';
  badge?: string;
  backgroundColor?: string;
  progress?: number;                // 0-100
  createdAt?: string;
  
  // Customizável - qualquer outro campo
  [key: string]: any;
}
```

---

## VARIANTES DISPONÍVEIS

| Variante | Uso | Características |
|----------|-----|-----------------|
| **default** | Padrão completo | Ícone grande, status, badge, descrição |
| **compact** | Listas e sidebars | Ícone pequeno, horizontal, compacto |
| **detailed** | Dashboards | Progress bar, informações extras, datas |
| **minimal** | Indicadores | Super compacto, apenas essencial |

---

## PROPRIEDADES DO COMPONENTE

```typescript
interface CardTemplateProps {
  data: CardData;                           // Dados obrigatórios
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  onClick?: () => void;                    // Função de clique
  actions?: React.ReactNode;               // Ações customizadas
  showStatus?: boolean;                    // Mostrar status badge
  className?: string;                      // Classes Tailwind extras
  children?: ReactNode;                    // Conteúdo adicional
}
```

---

## DICAS E BOAS PRÁTICAS

### ✅ FAZER

```typescript
// ✅ Use data bem estruturada
const cardData: CardData = {
  id: 1,
  title: 'Título claro',
  description: 'Descrição relevante',
  icon: 'valid_material_icon',
  status: 'active'
};

// ✅ Reutilize com map
{items.map(item => (
  <CardTemplate key={item.id} data={item} />
))}

// ✅ Combine com hooks
const [cards, setCards] = useState<CardData[]>([]);
```

### ❌ NÃO FAZER

```typescript
// ❌ Dados inválidos
const badData = {
  title: '', // Vazio
  icon: 'icon_invalido' // Não existe no Material Icons
};

// ❌ Sem key em listas
{items.map((item, index) => (
  <CardTemplate key={index} data={item} /> // Evite index como key
))}
```

---

## INTEGRAÇÃO COM APIs

```typescript
// Exemplo completo com API, filtros e paginação
import { useEffect, useState } from 'react';
import CardTemplate, { CardData } from '@/components/CardTemplate';
import { apiClient } from '@/hooks/useApi';

const AdvancedCardSystem = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, [page]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/agents?page=${page}`);
      setCards(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 p-6">
        {cards.map(card => (
          <CardTemplate key={card.id} data={card} variant="detailed" />
        ))}
      </div>
      <div className="flex justify-between p-6">
        <button onClick={() => setPage(p => p - 1)}>Anterior</button>
        <span>Página {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Próxima</button>
      </div>
    </div>
  );
};

export default AdvancedCardSystem;
```

---

## CONCLUSÃO

O **CardTemplate** é um componente altamente reutilizável que:
- ✅ Suporta múltiplas variantes
- ✅ Aceita dados customizados
- ✅ Funciona com APIs
- ✅ Integra-se facilmente
- ✅ Responsivo e acessível
- ✅ Dark mode pronto
