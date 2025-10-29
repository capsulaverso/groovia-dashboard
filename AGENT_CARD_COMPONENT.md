# 🎴 AGENT CARD - COMPONENTE REUTILIZÁVEL

**Status:** ✅ CRIADO E FUNCIONAL

---

## 📦 COMPONENTE ATUALIZADO

### Interface
```typescript
export interface AgentCardConfig {
  id: number;
  title: string;
  description: string;
  agentType: string;
  internalCode?: string;
  isActive?: boolean;
  behaviorType?: string;
  contextProgress?: number;
  act?: string;
  createdAt?: string;
}

export interface AgentCardProps {
  agent: AgentCardConfig;
  onClick?: () => void;
  showProgress?: boolean;
  showStatus?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}
```

---

## 🎨 VARIANTES DISPONÍVEIS

### 1. Default (Atual)
- Ícone do tipo de agente
- Status (Ativo/Inativo)
- Título e descrição
- Footer com tipo e botão

### 2. Detailed
- Ícone animado
- Três barras verdes pulsantes
- Anel de progresso
- Tags (Ato, Código Interno, Status)

### 3. Compact
- Layout horizontal
- Info essencial
- Ícone pequeno

---

## 🎯 EXEMPLO DE USO

```typescript
import AgentCard, { AgentCardConfig } from '../AgentCard';

const agent: AgentCardConfig = {
  id: 1,
  title: "SCAN CLARITY",
  description: "Consolidar informações...",
  agentType: "Agente de Diagnóstico",
  internalCode: "AGT-SC-001",
  isActive: true,
  contextProgress: 83
};

<AgentCard
  agent={agent}
  onClick={() => handleOpenChat(agent)}
  variant="default"
  showProgress={false}
  showStatus={true}
/>
```

---

## ✅ CAMPOS EXATOS

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id` | number | ✅ | - | ID do agente |
| `title` | string | ✅ | - | Título |
| `description` | string | ✅ | - | Descrição |
| `agentType` | string | ✅ | - | Tipo do agente |
| `internalCode` | string | ❌ | - | Código interno |
| `isActive` | boolean | ❌ | true | Status |
| `behaviorType` | string | ❌ | - | Comportamento |
| `contextProgress` | number | ❌ | 0 | Progresso 0-100 |
| `act` | string | ❌ | - | Fase do workflow |
| `createdAt` | string | ❌ | - | Data criação |

---

## 🔧 PROPS DO COMPONENTE

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `agent` | AgentCardConfig | - | Dados do agente |
| `onClick` | function | - | Callback ao clicar |
| `showProgress` | boolean | true | Mostrar progresso |
| `showStatus` | boolean | true | Mostrar status |
| `variant` | string | 'default' | Variante visual |

---

## 📊 STATUS

✅ **Criado e funcional**  
✅ **Variantes implementadas**  
✅ **Integrado em MyAgentsPage**  
✅ **Propriedades configuraveis**  

---

**Componente reutilizável pronto para uso!**

