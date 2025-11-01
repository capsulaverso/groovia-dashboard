import React, { useRef, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTooltipPositioning, TooltipPlacement } from '../hooks/useTooltipPositioning';
import { InstructionBoxProps } from '../types';

interface FloatingTooltipProps extends InstructionBoxProps {
    targetRef: RefObject<HTMLElement>;
    isVisible: boolean;
    preferredPlacement?: TooltipPlacement;
    offset?: number;
    showBackdrop?: boolean;
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
    targetRef,
    isVisible,
    preferredPlacement = 'right' as TooltipPlacement,
    offset = 12,
    showBackdrop = false,
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
    const tooltipRef = useRef<HTMLDivElement>(null);
    const position = useTooltipPositioning({
        targetRef,
        tooltipRef,
        preferredPlacement,
        offset
    });

    // Fechar com ESC
    useEffect(() => {
        if (!isVisible) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isVisible, onClose]);

    // Fechar clicando fora
    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) && onClose) {
                onClose();
            }
        };

        // Delay para não fechar imediatamente ao abrir
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;
    
    // Renderizar offscreen inicialmente para permitir medição
    const isPositioned = position !== null;

    const variantStyles = {
        info: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
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

    const tooltipContent = (
        <>
            {showBackdrop && (
                <div className="fixed inset-0 bg-black/20 z-40 animate-fadeIn" />
            )}
            <div
                ref={tooltipRef}
                className={`fixed ${variantStyles[variant]} p-4 rounded-xl w-80 border shadow-2xl z-50 transition-all duration-200 ${
                    isPositioned ? 'animate-scaleIn' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                    top: isPositioned ? `${position.top}px` : '-9999px',
                    left: isPositioned ? `${position.left}px` : '-9999px',
                }}
            >
                {/* Seta */}
                {isPositioned && (
                    <div
                        className={`absolute w-0 h-0 border-8 ${
                            position.placement === 'top' || position.placement === 'bottom'
                                ? 'border-l-transparent border-r-transparent'
                                : 'border-t-transparent border-b-transparent'
                        } ${
                            position.placement === 'top'
                                ? 'border-t-white dark:border-t-gray-800'
                                : position.placement === 'bottom'
                                ? 'border-b-white dark:border-b-gray-800'
                                : position.placement === 'left'
                                ? 'border-l-white dark:border-l-gray-800'
                                : 'border-r-white dark:border-r-gray-800'
                        }`}
                        style={position.arrowPosition}
                    />
                )}

                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-on-surface-secondary-light dark:text-on-surface-secondary-dark transition-colors z-10"
                        aria-label="Fechar"
                    />
                )}

                {icon && (
                    <div className="mb-3">
                        <span className="material-icons-outlined text-primary">{icon}</span>
                    </div>
                )}

                <h4 className="font-semibold text-sm mb-1 text-on-surface-light dark:text-on-surface-dark pr-6">
                    {title}
                </h4>
                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-3 leading-relaxed">
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
        </>
    );

    return createPortal(tooltipContent, document.body);
};

export default FloatingTooltip;
