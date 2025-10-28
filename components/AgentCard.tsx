import React from 'react';
import ProgressRing from './ProgressRing';
import type { AgentCardData } from '../types';

interface AgentCardProps extends Omit<AgentCardData, 'id'> {
    onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
    title, 
    description, 
    contextProgress, 
    act, 
    internalCode,
    agentType,
    onClick 
}) => {
    const handleCardClick = () => {
        onClick?.();
    };

    return (
        <div 
            className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={handleCardClick}
        >
                <div>
                    {/* Ícone do Agente */}
                    <div className="flex items-center justify-end mb-4">
                        <div className="relative inline-flex items-center justify-center bg-primary rounded-full w-10 h-10">
                            <div className="absolute right-0 top-0 h-3 w-3 rounded-full bg-white"></div>
                        </div>
                    </div>
                    
                    {/* Três Barras Verdes Animadas */}
                    <div className="space-y-2 mb-4">
                        <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '2000ms' }}></div>
                        <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '2000ms' }}></div>
                        <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '2000ms' }}></div>
                    </div>

                    {/* Progresso de Contexto com Anel Circular */}
                    <div className="flex items-center justify-between text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                        <span className="font-medium">SCAN {contextProgress}%</span>
                        <div className="w-8 h-8">
                            <ProgressRing progress={contextProgress} />
                        </div>
                    </div>
                </div>

                {/* Título e Descrição */}
                <div className="mb-4">
                    <h3 className="font-semibold text-base mb-2 text-on-surface-light dark:text-on-surface-dark">{title}</h3>
                    <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark leading-relaxed">{description}</p>
                </div>

                {/* Tags: Ato e Código Interno */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                        {act}
                    </span>
                    <span className="text-xs font-mono text-primary bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                        {internalCode}
                    </span>
                </div>
            </div>
    );
};

export default AgentCard;
