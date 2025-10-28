import React from 'react';
import type { ConversationHistory, ContextData } from '../types';

interface WorkspaceLeftSidebarProps {
    conversationHistory: ConversationHistory[];
    contextData: ContextData[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
}

const WorkspaceLeftSidebar: React.FC<WorkspaceLeftSidebarProps> = ({
    conversationHistory,
    contextData,
    activeConversationId,
    onSelectConversation
}) => {
    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        if (days < 7) return `${days} dias atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    const formatValue = (data: ContextData) => {
        switch (data.type) {
            case 'percentage':
                return `${data.value}%`;
            case 'count':
                return data.value.toLocaleString('pt-BR');
            case 'date':
                return new Date(data.value).toLocaleDateString('pt-BR');
            default:
                return data.value;
        }
    };

    return (
        <div className="w-80 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Dados de Contexto */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-3 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary text-lg">insights</span>
                    Dados de Contexto
                </h2>
                <div className="space-y-2">
                    {contextData.map((data) => (
                        <div
                            key={data.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {data.icon && (
                                    <span className="material-icons-outlined text-primary text-sm">{data.icon}</span>
                                )}
                                <span className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    {data.label}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">
                                {formatValue(data)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Histórico de Conversas */}
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-3 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary text-lg">history</span>
                    Histórico de Conversas
                </h2>
                <div className="space-y-2">
                    {conversationHistory.length === 0 ? (
                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-center py-8">
                            Nenhuma conversa anterior
                        </p>
                    ) : (
                        conversationHistory.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    activeConversationId === conversation.id
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <h3 className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1 truncate">
                                    {conversation.title}
                                </h3>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark truncate mb-2">
                                    {conversation.lastMessage}
                                </p>
                                <div className="flex items-center justify-between text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    <span>{formatDate(conversation.timestamp)}</span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-icons-outlined text-xs">chat_bubble_outline</span>
                                        {conversation.messageCount}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Nova Conversa */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full bg-primary text-white rounded-lg py-2.5 px-4 font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <span className="material-icons-outlined">add</span>
                    Nova Conversa
                </button>
            </div>
        </div>
    );
};

export default WorkspaceLeftSidebar;
