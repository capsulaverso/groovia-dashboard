import React from 'react';
import type { ProcessStep } from '../hooks/useProcessValidation';

interface ProcessProgressIndicatorProps {
  steps: ProcessStep[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
}

const ProcessProgressIndicator: React.FC<ProcessProgressIndicatorProps> = ({
  steps,
  currentStepId,
  onStepClick
}) => {
  const getStepIcon = (step: ProcessStep): string => {
    if (step.isCompleted) return 'check_circle';
    if (step.id === currentStepId) return 'radio_button_checked';
    if (step.isBlocking) return 'error';
    return 'radio_button_unchecked';
  };

  const getStepColor = (step: ProcessStep): string => {
    if (step.isCompleted) return 'text-green-500';
    if (step.id === currentStepId) return 'text-primary';
    if (step.isBlocking) return 'text-red-500';
    return 'text-gray-400';
  };

  const completionPercentage = Math.round(
    (steps.filter(s => s.isCompleted).length / steps.length) * 100
  );

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">
            Progresso do Processo
          </h3>
          <span className="text-xs font-semibold text-primary">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isPast = steps.findIndex(s => s.id === currentStepId) > index;
          
          return (
            <div
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                isCurrent ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-icons-outlined ${getStepColor(step)} text-lg`}>
                {getStepIcon(step)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-on-surface-light dark:text-on-surface-dark">
                    {step.title}
                  </p>
                  {step.isBlocking && !step.isCompleted && (
                    <span className="text-xs text-red-500 font-semibold">BLOQUEANTE</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessProgressIndicator;

