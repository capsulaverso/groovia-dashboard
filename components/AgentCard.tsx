import React from 'react';
import ProgressRing from './ProgressRing';

export interface AgentCardConfig {
    id: number | string;
    title: string;
    description: string;
    agentType: string;
    internalCode?: string;
    isActive?: boolean;
    behaviorType?: string;
    contextProgress?: number;
    contextSaved?: number; // Quantidade de vezes que o contexto foi salvo
    connectionProgress?: number; // Progresso do círculo roxo (0-100)
    act?: string; // ATO
    function?: string; // FUNÇÃO
    controlCode?: string; // CÓDIGO DE CONTROLE
    createdAt?: string;
    [key: string]: any; // Permitir propriedades extras
}

export interface AgentCardProps {
    agent: AgentCardConfig | null | undefined;
    onClick?: () => void;
    showProgress?: boolean;
    showStatus?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
}

const AgentCard: React.FC<AgentCardProps> = ({ 
    agent,
    onClick,
    showProgress = true,
    showStatus = true,
    variant = 'default'
}) => {
    // Validar se agent existe
    if (!agent) {
        return null;
    }

    // Extrair props do agent com valores padrão seguros
    const id = agent?.id;
    const title = agent?.title || '';
    const description = agent?.description || '';
    const agentType = agent?.agentType || '';
    const internalCode = agent?.internalCode;
    const isActive = agent?.isActive ?? true;
    const contextProgress = agent?.contextProgress ?? 0;
    const contextSaved = agent?.contextSaved ?? 0;
    const connectionProgress = agent?.connectionProgress ?? 0;
    const act = agent?.act;
    const functionName = agent?.function;
    const controlCode = agent?.controlCode;

    const handleCardClick = () => {
        onClick?.();
    };

    const getTypeIcon = () => {
        switch (agentType?.toLowerCase()) {
            case 'diagnóstico': return 'insights';
            case 'pesquisa': return 'search';
            case 'criação': return 'auto_awesome';
            case 'análise': return 'analytics';
            case 'estratégia': return 'flag';
            default: return 'smart_toy';
        }
    };

    const getStatusColor = () => {
        return isActive 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    };

    // Variant: default
    if (variant === 'default') {
        return (
            <div 
                onClick={handleCardClick}
                className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-primary transition-all cursor-pointer group"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                        <span className="material-icons-outlined text-primary group-hover:text-white text-2xl">
                            {getTypeIcon()}
                        </span>
                    </div>
                    {showStatus && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                            {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    )}
                </div>
                <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                    {title}
                </h3>
                <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4 line-clamp-3">
                    {description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <span className="material-icons-outlined text-sm">category</span>
                        <span>{agentType}</span>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-icons-outlined text-primary">arrow_forward</span>
                    </button>
                </div>
            </div>
        );
    }

    // Variant: detailed (original com progresso)
    if (variant === 'detailed') {
        return (
            <div 
                className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow duration-300 relative z-10 overflow-hidden"
                onClick={handleCardClick}
            >
                {/* Círculo Roxo com Progresso de Conexão no Topo */}
                <div className="flex items-center justify-end mb-4 relative">
                    <div className="relative w-14 h-14">
                        {/* Background circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - connectionProgress / 100)}`}
                                className="text-primary transition-all duration-500"
                            />
                        </svg>
                        {/* Ícone no centro */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-icons-outlined text-primary text-lg">
                                {getTypeIcon()}
                            </span>
                        </div>
                        {/* Indicador de conexão */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full border-2 border-primary"></div>
                    </div>
                </div>
                
                {showProgress && (
                    <>
                        {/* Três Barras Verdes com Animação de Luz */}
                        <div className="space-y-2 mb-4 relative">
                            {/* Efeito de brilho */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-shimmer"></div>
                            <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse shadow-lg shadow-green-400/50" style={{ animationDelay: '0ms', animationDuration: '2000ms' }}></div>
                            <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse shadow-lg shadow-green-400/50" style={{ animationDelay: '200ms', animationDuration: '2000ms' }}></div>
                            <div className="h-3.5 bg-green-400 rounded-full w-full animate-pulse shadow-lg shadow-green-400/50" style={{ animationDelay: '400ms', animationDuration: '2000ms' }}></div>
                        </div>

                        {/* Gerenciador de Contexto */}
                        <div className="mb-4 p-3 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-on-surface-light dark:text-on-surface-dark">CONTEXTO</span>
                                <span className="text-xs font-bold text-primary">{contextProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
                                <div 
                                    className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all duration-500 relative overflow-hidden"
                                    style={{ width: `${contextProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                            </div>
                            {contextSaved > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    <span className="material-icons-outlined text-sm">save</span>
                                    <span>Salvo {contextSaved} {contextSaved === 1 ? 'vez' : 'vezes'}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Título e Descrição */}
                <div className="mb-4">
                    <h3 className="font-semibold text-base mb-2 text-on-surface-light dark:text-on-surface-dark">{title}</h3>
                    <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark leading-relaxed">{description}</p>
                </div>

                {/* Tags: ATO | FUNÇÃO | CÓDIGO DE CONTROLE */}
                <div className="flex items-center gap-2 flex-wrap">
                    {act && (
                        <span className="text-xs font-semibold text-on-surface-light dark:text-on-surface-dark bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/30">
                            ATO: {act}
                        </span>
                    )}
                    {functionName && (
                        <span className="text-xs font-semibold text-on-surface-light dark:text-on-surface-dark bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                            {functionName}
                        </span>
                    )}
                    {controlCode && (
                        <span className="text-xs font-mono text-on-surface-light dark:text-on-surface-dark bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                            {controlCode}
                        </span>
                    )}
                    {showStatus && (
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor()}`}>
                            {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Variant: compact
    return (
        <div 
            onClick={handleCardClick}
            className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-icons-outlined text-primary">
                        {getTypeIcon()}
                    </span>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm text-on-surface-light dark:text-on-surface-dark">{title}</h3>
                    <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark line-clamp-1">{description}</p>
                </div>
                {showStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                        {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AgentCard;
