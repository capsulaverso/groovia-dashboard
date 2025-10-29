import React, { useRef } from 'react';
import FloatingTooltip from './FloatingTooltip';
import type { ProcessStep } from '../hooks/useProcessValidation';
import type { InstructionBoxProps } from '../types';

interface ProcessValidationTooltipProps {
  step: ProcessStep;
  targetRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
  onComplete: (stepId: string) => void;
  onDismiss: () => void;
  variant?: 'info' | 'warning' | 'error';
}

const ProcessValidationTooltip: React.FC<ProcessValidationTooltipProps> = ({
  step,
  targetRef,
  isVisible,
  onComplete,
  onDismiss,
  variant = step.isBlocking ? 'error' : 'warning'
}) => {
  const getVariantConfig = (): Partial<InstructionBoxProps> => {
    if (variant === 'error' || step.isBlocking) {
      return {
        title: `⚠️ ${step.title}`,
        description: step.description,
        primaryButtonText: 'Resolver Agora',
        secondaryButtonText: 'Mais Tarde',
        icon: 'error',
        variant: 'error'
      };
    }

    if (variant === 'warning') {
      return {
        title: `💡 ${step.title}`,
        description: step.description,
        primaryButtonText: 'Entendido',
        secondaryButtonText: 'Pular',
        icon: 'info',
        variant: 'warning'
      };
    }

    return {
      title: step.title,
      description: step.description,
      primaryButtonText: 'Continuar',
      secondaryButtonText: 'Fechar',
      variant: 'info'
    };
  };

  const handlePrimaryAction = () => {
    onComplete(step.id);
  };

  const handleSecondaryAction = () => {
    onDismiss();
  };

  const handleClose = () => {
    onDismiss();
  };

  const config = getVariantConfig();

  return (
    <FloatingTooltip
      targetRef={targetRef}
      isVisible={isVisible}
      preferredPlacement="right"
      title={config.title || step.title}
      description={config.description || step.description}
      primaryButtonText={config.primaryButtonText}
      secondaryButtonText={config.secondaryButtonText}
      onPrimaryAction={handlePrimaryAction}
      onSecondaryAction={handleSecondaryAction}
      onClose={handleClose}
      variant={config.variant}
      icon={config.icon}
      showBackdrop={step.isBlocking}
    />
  );
};

export default ProcessValidationTooltip;

