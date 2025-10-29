# 💡 SISTEMA DE TOOLTIPS - GUIA DE USO

**Objetivo:** Alertar sobre etapas incompletas, processos faltantes e validar o progresso do usuário.

---

## 🎯 CONCEITO

O sistema de tooltips emite alertas inteligentes sobre:
1. **Etapas Incompletas** - O que falta fazer
2. **Processos Faltantes** - Dados/documents necessários
3. **Validações Pendentes** - Aprovações obrigatórias
4. **Próxima Ação** - O que fazer agora

---

## 🏗️ ARQUITETURA

### Componentes

**1. `useProcessValidation` Hook**
```typescript
// Valida processo e retorna estado
const validation = useProcessValidation(steps);
// {
//   hasIncompleteSteps: true,
//   incompleteSteps: [...],
//   blockingSteps: [...],
//   nextStep: {...},
//   completionPercentage: 45,
//   canProceed: false
// }
```

**2. `ProcessValidationTooltip` Component**
```typescript
// Tooltip inteligente para cada etapa
<ProcessValidationTooltip
  step={step}
  targetRef={buttonRef}
  isVisible={showTooltip}
  onComplete={(id) => markStepComplete(id)}
  onDismiss={() => hideTooltip()}
  variant="error" // auto-detecta se blocking
/>
```

**3. `ProcessProgressIndicator` Component**
```typescript
// Indicador visual de progresso
<ProcessProgressIndicator
  steps={steps}
  currentStepId="strategic-validation"
  onStepClick={(id) => handleStepClick(id)}
/>
```

---

## 📝 DEFININDO ETAPAS (PROCESS STEP)

### Interface
```typescript
interface ProcessStep {
  id: string;                    // ID único
  title: string;                  // Título da etapa
  description: string;           // Descrição detalhada
  isCompleted: boolean;          // Concluída ou não
  isBlocking: boolean;           // Bloqueia próximas etapas?
  requiredBefore?: string[];     // Pré-requisitos
  category?: 'data' | 'document' | 'approval' | 'analysis';
}
```

### Exemplo: Validação Estratégica
```typescript
{
  id: 'strategic-validation',
  title: 'Validação Estratégica',
  description: 'Garante que todos os elementos do projeto estejam alinhados. Requer aprovação do cliente para seguir.',
  isCompleted: false,
  isBlocking: true,              // ⚠️ BLOQUEIA PROGRESSO
  requiredBefore: ['data-collection'],
  category: 'approval'
}
```

---

## 🚀 IMPLEMENTAÇÃO

### Passo 1: Definir Etapas
```typescript
import { useProcessValidation, getAgentValidationSteps } from '../hooks/useProcessValidation';

// Em seu componente
const [steps, setSteps] = useState<ProcessStep[]>([]);

useEffect(() => {
  // Pegar etapas do agente
  const agentSteps = getAgentValidationSteps('strategic-agent', contextData);
  setSteps(agentSteps);
}, [contextData]);
```

### Passo 2: Validar Processo
```typescript
const validation = useProcessValidation(steps);

// validation tem:
// - hasIncompleteSteps: boolean
// - incompleteSteps: ProcessStep[]
// - blockingSteps: ProcessStep[]
// - nextStep?: ProcessStep
// - completionPercentage: number
// - canProceed: boolean
```

### Passo 3: Mostrar Tooltip
```typescript
// Quando há etapa bloqueante
{validation.blockingSteps.length > 0 && (
  <ProcessValidationTooltip
    step={validation.blockingSteps[0]}
    targetRef={buttonRef}
    isVisible={showBlockingTooltip}
    onComplete={(id) => {
      // Marcar como completa
      setSteps(steps.map(s => 
        s.id === id ? { ...s, isCompleted: true } : s
      ));
    }}
    onDismiss={() => setShowBlockingTooltip(false)}
    variant="error"
  />
)}
```

### Passo 4: Indicador de Progresso
```typescript
// Sidebar mostrando progresso
<ProcessProgressIndicator
  steps={steps}
  currentStepId={validation.nextStep?.id}
  onStepClick={(id) => {
    // Navegar para etapa
    const step = steps.find(s => s.id === id);
    if (step) handleStepNavigation(step);
  }}
/>
```

---

## 🎨 TIPOS DE TOOLTIP

### 1. **Error (Bloqueante)**
**Quando:** Etapa obrigatória não concluída  
**Cor:** Vermelho  
**Botão:** "Resolver Agora"

```typescript
variant="error"
// Vermelho, bloqueante, alto contraste
```

### 2. **Warning (Importante)**
**Quando:** Etapa recomendada  
**Cor:** Amarelo  
**Botão:** "Entendido"

```typescript
variant="warning"
// Amarelo, importante, pode pular
```

### 3. **Info (Informativo)**
**Quando:** Dica ou instrução  
**Cor:** Azul  
**Botão:** "Continuar"

```typescript
variant="info"
// Azul, informativo, não bloqueante
```

---

## 📊 EXEMPLO COMPLETO

### Componente de Workflow
```typescript
import { useState } from 'react';
import { useProcessValidation, getAgentValidationSteps, ProcessStep } from '../hooks/useProcessValidation';
import ProcessValidationTooltip from '../components/ProcessValidationTooltip';
import ProcessProgressIndicator from '../components/ProcessProgressIndicator';

const WorkflowComponent = ({ agentType, contextData }) => {
  const [steps, setSteps] = useState<ProcessStep[]>(
    getAgentValidationSteps(agentType, contextData)
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const validation = useProcessValidation(steps);

  // Auto-mostrar tooltip se houver etapa bloqueante
  useEffect(() => {
    if (validation.blockingSteps.length > 0) {
      setShowTooltip(true);
    }
  }, [validation.blockingSteps]);

  const handleComplete = (stepId: string) => {
    setSteps(steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: true } : s
    ));
    setShowTooltip(false);
  };

  return (
    <div className="flex">
      {/* Conteúdo Principal */}
      <div className="flex-1">
        <button ref={buttonRef}>
          Continuar Processo
        </button>

        {validation.nextStep && (
          <ProcessValidationTooltip
            step={validation.nextStep}
            targetRef={buttonRef}
            isVisible={showTooltip}
            onComplete={handleComplete}
            onDismiss={() => setShowTooltip(false)}
          />
        )}
      </div>

      {/* Sidebar de Progresso */}
      <div className="w-80">
        <ProcessProgressIndicator
          steps={steps}
          currentStepId={validation.nextStep?.id}
          onStepClick={(id) => {
            console.log('Navegar para:', id);
          }}
        />
      </div>
    </div>
  );
};
```

---

## 🧩 VALIDAÇÕES PRÉ-CONFIGURADAS

### `getAgentValidationSteps(agentType, contextData)`

Retorna etapas padrão para diferentes tipos de agente:

**Agente de Estratégia:**
- ✅ Coleta de Dados
- ✅ Revisão de Documentos
- ⚠️ Validação Estratégica (BLOQUEANTE)
- ✅ Análise Concluída

**Agente de Análise:**
- ✅ Coleta de Dados
- ⚠️ Documentos Essenciais (BLOQUEANTE)
- ✅ Análise Concluída

---

## ⚙️ CONFIGURAÇÃO AVANÇADA

### Etapa com Pré-requisitos
```typescript
{
  id: 'final-analysis',
  title: 'Análise Final',
  description: 'Só pode iniciar após aprovação',
  isCompleted: false,
  isBlocking: true,
  requiredBefore: ['strategic-validation', 'data-collection']
}
```

### Etapa com Categoria Especial
```typescript
{
  id: 'document-upload',
  title: 'Upload de Documentos',
  description: 'Faça upload dos documentos',
  isCompleted: false,
  isBlocking: true,
  category: 'document' // Especial handling
}
```

---

## 📈 MÉTRICAS

O sistema automaticamente calcula:
- ✅ **Completion Percentage** - % de etapas completas
- ✅ **Blocking Count** - Etapas bloqueantes pendentes
- ✅ **Can Proceed** - Se pode prosseguir
- ✅ **Next Step** - Próxima etapa recomendada

---

## 🎯 RESULTADO

### Para o Usuário:
1. **Vê progresso visual** no indicador
2. **Recebe alertas** sobre etapas faltantes
3. **Entende** o que precisa fazer
4. **Não consegue pular** etapas bloqueantes
5. **Recebe feedback** imediato

### Para o Sistema:
1. **Valida** completude do processo
2. **Controla** fluxo de etapas
3. **Tracks** progresso do usuário
4. **Guarda** histórico de validações
5. **Previne** erros e omissões

---

**Status:** ✅ SISTEMA COMPLETO E FUNCIONAL

