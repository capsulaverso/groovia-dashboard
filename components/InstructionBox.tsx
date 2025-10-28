import React, { useState } from 'react';
import { InstructionBoxProps } from '../types';

const InstructionBox: React.FC<InstructionBoxProps> = ({
    title,
    description,
    primaryButtonText = 'Começar',
    secondaryButtonText = 'Mais tarde',
    onPrimaryAction,
    onSecondaryAction,
    onClose,
    showCloseButton = true,
    variant = 'info',
    icon
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };

    const handlePrimaryAction = () => {
        if (onPrimaryAction) {
            onPrimaryAction();
        }
    };

    const handleSecondaryAction = () => {
        if (onSecondaryAction) {
            onSecondaryAction();
        }
    };

    if (!isVisible) {
        return null;
    }

    const variantStyles = {
        info: 'bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-gray-700',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
    };

    return (
        <div className={`${variantStyles[variant]} p-4 rounded-2xl w-full md:w-auto border relative z-0`}>
            {showCloseButton && (
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-on-surface-secondary-light dark:text-on-surface-secondary-dark"
                    aria-label="Fechar"
                >
                    <span className="material-icons-outlined text-base">close</span>
                </button>
            )}

            {icon && (
                <div className="mb-3">
                    <span className="material-icons-outlined text-primary">{icon}</span>
                </div>
            )}

            <h4 className="font-semibold text-sm mb-1 text-on-surface-light dark:text-on-surface-dark pr-6">
                {title}
            </h4>
            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-3">
                {description}
            </p>

            <div className="flex items-center gap-2">
                {primaryButtonText && (
                    <button
                        onClick={handlePrimaryAction}
                        className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {primaryButtonText}
                    </button>
                )}
                {secondaryButtonText && (
                    <button
                        onClick={handleSecondaryAction}
                        className="text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {secondaryButtonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InstructionBox;
