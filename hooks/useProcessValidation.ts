import { useState, useEffect } from 'react';

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isBlocking: boolean; // Se true, bloqueia próximas etapas
  requiredBefore?: string[]; // IDs das etapas necessárias antes
  category?: 'data' | 'document' | 'approval' | 'analysis' | 'integration';
}

export interface ProcessValidationResult {
  hasIncompleteSteps: boolean;
  incompleteSteps: ProcessStep[];
  blockingSteps: ProcessStep[];
  nextStep?: ProcessStep;
  completionPercentage: number;
  canProceed: boolean;
}

export const useProcessValidation = (steps: ProcessStep[]): ProcessValidationResult => {
  const [validation, setValidation] = useState<ProcessValidationResult>({
    hasIncompleteSteps: false,
    incompleteSteps: [],
    blockingSteps: [],
    completionPercentage: 0,
    canProceed: false
  });

  useEffect(() => {
    const incompleteSteps = steps.filter(step => !step.isCompleted);
    const blockingSteps = incompleteSteps.filter(step => step.isBlocking);
    
    // Calcular próximo passo
    const findNextStep = (): ProcessStep | undefined => {
      // Se houver etapas bloqueantes, essa é a próxima
      if (blockingSteps.length > 0) {
        return blockingSteps[0];
      }
      
      // Caso contrário, pega a primeira incompleta
      return incompleteSteps[0];
    };

    const completionPercentage = 
      steps.length > 0 
        ? Math.round((steps.filter(s => s.isCompleted).length / steps.length) * 100)
        : 0;

    const canProceed = !blockingSteps.length && incompleteSteps.length === 0;

    setValidation({
      hasIncompleteSteps: incompleteSteps.length > 0,
      incompleteSteps,
      blockingSteps,
      nextStep: findNextStep(),
      completionPercentage,
      canProceed
    });
  }, [steps]);

  return validation;
};

// Validações pré-configuradas para agentes comuns
export const getAgentValidationSteps = (agentType: string, contextData: any): ProcessStep[] => {
  const baseSteps: ProcessStep[] = [
    {
      id: 'data-collection',
      title: 'Coleta de Dados',
      description: 'Verificar se todos os dados necessários foram coletados',
      isCompleted: false,
      isBlocking: true,
      category: 'data'
    },
    {
      id: 'document-review',
      title: 'Revisão de Documentos',
      description: 'Documentos essenciais devem ser revisados',
      isCompleted: false,
      isBlocking: false,
      category: 'document'
    },
    {
      id: 'strategic-validation',
      title: 'Validação Estratégica',
      description: 'Garante que todos os elementos estejam alinhados. Requer aprovação do cliente.',
      isCompleted: false,
      isBlocking: true,
      requiredBefore: ['data-collection'],
      category: 'approval'
    },
    {
      id: 'analysis-complete',
      title: 'Análise Concluída',
      description: 'Análise final deve estar completa',
      isCompleted: false,
      isBlocking: false,
      requiredBefore: ['strategic-validation'],
      category: 'analysis'
    }
  ];

  // Ajustar baseado no contexto real
  if (contextData?.documents?.length > 0) {
    const docStep = baseSteps.find(s => s.id === 'document-review');
    if (docStep) docStep.isCompleted = true;
  }

  if (contextData?.approval?.status === 'approved') {
    const approvalStep = baseSteps.find(s => s.id === 'strategic-validation');
    if (approvalStep) approvalStep.isCompleted = true;
  }

  return baseSteps;
};

