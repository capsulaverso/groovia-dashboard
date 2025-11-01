import React, { useState, useEffect, useRef } from 'react';
import { useProcessValidation, getAgentValidationSteps, ProcessStep } from '../hooks/useProcessValidation';
import ProcessValidationTooltip from '../components/ProcessValidationTooltip';
import ProcessProgressIndicator from '../components/ProcessProgressIndicator';

/**
 * EXEMPLO COMPLETO: Workflow com Validação Estratégica
 * 
 * Este componente demonstra como usar o sistema de tooltips
 * para validar etapas e alertar sobre processos incompletos.
 */
const WorkflowComValidacao: React.FC<{ agentType: string }> = ({ agentType }) => {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const [contextData, setContextData] = useState<any>({});

  // Inicializar etapas
  useEffect(() => {
    const initialSteps = getAgentValidationSteps(agentType, contextData);
    setSteps(initialSteps);
  }, [agentType, contextData]);

  // Validação automática
  const validation = useProcessValidation(steps);

  // Auto-mostrar tooltip se houver etapa bloqueante
  useEffect(() => {
    if (validation.blockingSteps.length > 0) {
      setShowTooltip(true);
    }
  }, [validation.blockingSteps.length]);

  // Simular dados de contexto (normalmente vem do backend)
  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setContextData({
        documents: [], // Simular ausência de documentos
        approval: { status: 'pending' },
        dataCollection: true
      });
    }, 1000);
  }, []);

  // Atualizar etapas quando contexto muda
  useEffect(() => {
    const updatedSteps = steps.map(step => {
      if (step.id === 'data-collection' && contextData.dataCollection) {
        return { ...step, isCompleted: true };
      }
      if (step.id === 'document-review' && contextData.documents?.length > 0) {
        return { ...step, isCompleted: true };
      }
      if (step.id === 'strategic-validation' && contextData.approval?.status === 'approved') {
        return { ...step, isCompleted: true };
      }
      return step;
    });
    setSteps(updatedSteps);
  }, [contextData]);

  const handleComplete = (stepId: string) => {
    console.log('Etapa completada:', stepId);
    
    // Marcar como completa
    setSteps(steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: true } : s
    ));

    // Fechar tooltip
    setShowTooltip(false);

    // Se for validação estratégica, mostrar modal de aprovação
    if (stepId === 'strategic-validation') {
      // Simular aprovação
      setTimeout(() => {
        setContextData(prev => ({
          ...prev,
          approval: { status: 'approved' }
        }));
      }, 500);
    }
  };

  const handleDismiss = () => {
    setShowTooltip(false);
    console.log('Tooltip dismissado - usuário optou por resolver depois');
  };

  const handleContinue = () => {
    if (validation.canProceed) {
      console.log('✅ Pode prosseguir!');
    } else {
      console.log('⚠️ Etapas bloqueantes pendentes');
      setShowTooltip(true);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* Conteúdo Principal */}
      <div className="col-span-8">
        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl">
          <h2 className="text-title mb-4">Fluxo de Trabalho</h2>

          {/* Botão de Continuar */}
          <div className="flex justify-end">
            <button
              ref={continueButtonRef}
              onClick={handleContinue}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                validation.canProceed
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!validation.canProceed}
            >
              {validation.canProceed ? 'Continuar' : 'Etapas Pendentes'}
            </button>

            {/* Tooltip de Validação */}
            {validation.nextStep && (
              <ProcessValidationTooltip
                step={validation.nextStep}
                targetRef={continueButtonRef}
                isVisible={showTooltip}
                onComplete={handleComplete}
                onDismiss={handleDismiss}
              />
            )}
          </div>

          {/* Status */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="text-body font-semibold mb-2">Status do Processo</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                  Progresso
                </span>
                <span className="text-body font-bold text-primary">
                  {validation.completionPercentage}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                  Etapas Pendentes
                </span>
                <span className="text-body font-bold text-red-500">
                  {validation.incompleteSteps.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                  Pode Prosseguir
                </span>
                <span className={`text-body font-bold ${
                  validation.canProceed ? 'text-green-500' : 'text-red-500'
                }`}>
                  {validation.canProceed ? '✅ Sim' : '❌ Não'}
                </span>
              </div>
              {validation.nextStep && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                  <p className="text-body font-semibold text-yellow-800 dark:text-yellow-200">
                    Próxima Etapa: {validation.nextStep.title}
                  </p>
                  <p className="text-body text-yellow-700 dark:text-yellow-300 mt-1">
                    {validation.nextStep.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de Progresso */}
      <div className="col-span-4">
        <ProcessProgressIndicator
          steps={steps}
          currentStepId={validation.nextStep?.id}
          onStepClick={(stepId) => {
            console.log('Clicou em etapa:', stepId);
            setShowTooltip(true);
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowComValidacao;

