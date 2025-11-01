import { useState, useEffect, RefObject } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipPosition {
    top: number;
    left: number;
    placement: TooltipPlacement;
    arrowPosition: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    };
}

interface UseTooltipPositioningProps {
    targetRef: RefObject<HTMLElement>;
    tooltipRef: RefObject<HTMLElement>;
    preferredPlacement?: TooltipPlacement;
    offset?: number;
}

export const useTooltipPositioning = ({
    targetRef,
    tooltipRef,
    preferredPlacement = 'right',
    offset = 12
}: UseTooltipPositioningProps): TooltipPosition | null => {
    const [position, setPosition] = useState<TooltipPosition | null>(null);

    useEffect(() => {
        const calculatePosition = () => {
            if (!targetRef.current || !tooltipRef.current) return;

            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let finalPlacement = preferredPlacement;
            let top = 0;
            let left = 0;
            const arrowPosition: TooltipPosition['arrowPosition'] = {};

            // Calcular posição baseada no placement
            const positions: Record<TooltipPlacement, () => { top: number; left: number; canFit: boolean }> = {
                top: () => ({
                    top: targetRect.top - tooltipRect.height - offset,
                    left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                    canFit: targetRect.top - tooltipRect.height - offset > 0
                }),
                bottom: () => ({
                    top: targetRect.bottom + offset,
                    left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                    canFit: targetRect.bottom + tooltipRect.height + offset < viewportHeight
                }),
                left: () => ({
                    top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
                    left: targetRect.left - tooltipRect.width - offset,
                    canFit: targetRect.left - tooltipRect.width - offset > 0
                }),
                right: () => ({
                    top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
                    left: targetRect.right + offset,
                    canFit: targetRect.right + tooltipRect.width + offset < viewportWidth
                })
            };

            // Tentar placement preferido
            let result = positions[preferredPlacement]();

            // Auto-flip se não couber
            if (!result.canFit) {
                const fallbackOrder: Record<TooltipPlacement, TooltipPlacement[]> = {
                    top: ['bottom', 'right', 'left'],
                    bottom: ['top', 'right', 'left'],
                    left: ['right', 'top', 'bottom'],
                    right: ['left', 'top', 'bottom']
                };

                for (const fallback of fallbackOrder[preferredPlacement]) {
                    result = positions[fallback]();
                    if (result.canFit) {
                        finalPlacement = fallback;
                        break;
                    }
                }
            }

            top = result.top;
            left = result.left;

            // Ajustar se sair da viewport
            if (left < 0) left = 8;
            if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8;
            if (top < 0) top = 8;
            if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8;

            // Calcular posição da seta
            const arrowSize = 8;
            switch (finalPlacement) {
                case 'top':
                    arrowPosition.bottom = -arrowSize;
                    arrowPosition.left = tooltipRect.width / 2 - arrowSize;
                    break;
                case 'bottom':
                    arrowPosition.top = -arrowSize;
                    arrowPosition.left = tooltipRect.width / 2 - arrowSize;
                    break;
                case 'left':
                    arrowPosition.right = -arrowSize;
                    arrowPosition.top = tooltipRect.height / 2 - arrowSize;
                    break;
                case 'right':
                    arrowPosition.left = -arrowSize;
                    arrowPosition.top = tooltipRect.height / 2 - arrowSize;
                    break;
            }

            setPosition({
                top,
                left,
                placement: finalPlacement,
                arrowPosition
            });
        };

        calculatePosition();

        // Recalcular em scroll/resize
        window.addEventListener('scroll', calculatePosition, true);
        window.addEventListener('resize', calculatePosition);

        return () => {
            window.removeEventListener('scroll', calculatePosition, true);
            window.removeEventListener('resize', calculatePosition);
        };
    }, [targetRef, tooltipRef, preferredPlacement, offset]);

    return position;
};
