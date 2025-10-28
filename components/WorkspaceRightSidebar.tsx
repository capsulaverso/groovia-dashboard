import React, { useState } from 'react';
import type { DocumentItem, TooltipConfig } from '../types';

interface WorkspaceRightSidebarProps {
    documents: DocumentItem[];
    helpMessages: string[];
    tooltips: TooltipConfig[];
}

const WorkspaceRightSidebar: React.FC<WorkspaceRightSidebarProps> = ({
    documents,
    helpMessages,
    tooltips
}) => {
    const [activeTab, setActiveTab] = useState<'documents' | 'help'>('documents');
    const [expandedHelp, setExpandedHelp] = useState<number | null>(null);

    const getDocumentIcon = (type: DocumentItem['type']) => {
        const icons = {
            pdf: 'picture_as_pdf',
            doc: 'description',
            sheet: 'table_chart',
            slide: 'slideshow',
            text: 'article',
            image: 'image'
        };
        return icons[type] || 'insert_drive_file';
    };

    const getDocumentColor = (type: DocumentItem['type']) => {
        const colors = {
            pdf: 'text-red-500',
            doc: 'text-blue-500',
            sheet: 'text-green-500',
            slide: 'text-orange-500',
            text: 'text-gray-500',
            image: 'text-purple-500'
        };
        return colors[type] || 'text-gray-500';
    };

    const formatFileSize = (size: string) => {
        return size;
    };

    const formatUploadDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="w-96 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'documents'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:text-on-surface-light dark:hover:text-on-surface-dark'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-icons-outlined text-lg">folder_open</span>
                        Documentos
                        {documents.length > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                                {documents.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('help')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'help'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:text-on-surface-light dark:hover:text-on-surface-dark'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-icons-outlined text-lg">help_outline</span>
                        Ajuda
                    </div>
                </button>
            </div>

            {/* Conteúdo - Documentos */}
            {activeTab === 'documents' && (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Documentos do Cliente
                        </h2>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-icons-outlined text-primary text-lg">upload_file</span>
                        </button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-5xl mb-3">
                                folder_open
                            </span>
                            <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                Nenhum documento carregado
                            </p>
                            <button className="mt-4 text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                                <span className="material-icons-outlined text-sm">add</span>
                                Adicionar documento
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`material-icons-outlined ${getDocumentColor(doc.type)} text-2xl`}>
                                            {getDocumentIcon(doc.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark truncate group-hover:text-primary">
                                                {doc.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                <span>{formatFileSize(doc.size)}</span>
                                                <span>•</span>
                                                <span>{formatUploadDate(doc.uploadedAt)}</span>
                                            </div>
                                        </div>
                                        <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons-outlined text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm">
                                                more_vert
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Conteúdo - Ajuda */}
            {activeTab === 'help' && (
                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-4 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary text-lg">lightbulb</span>
                        Dicas e Orientações
                    </h2>

                    {helpMessages.length === 0 ? (
                        <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-center py-8">
                            Nenhuma dica disponível
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {helpMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedHelp(expandedHelp === index ? null : index)}
                                        className="w-full p-3 text-left flex items-start gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    >
                                        <span className="material-icons-outlined text-primary text-lg flex-shrink-0">
                                            {expandedHelp === index ? 'expand_less' : 'expand_more'}
                                        </span>
                                        <span className="text-sm text-on-surface-light dark:text-on-surface-dark flex-1">
                                            {message.split('\n')[0]}
                                        </span>
                                    </button>
                                    {expandedHelp === index && (
                                        <div className="px-3 pb-3 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark whitespace-pre-wrap">
                                            {message}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tooltips e Recursos Interativos */}
                    {tooltips.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-3 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary text-lg">info</span>
                                Recursos Interativos
                            </h3>
                            <div className="space-y-2">
                                {tooltips.map((tooltip) => (
                                    <div
                                        key={tooltip.id}
                                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-help"
                                        title={`Posição: ${tooltip.position}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="material-icons-outlined text-blue-500 dark:text-blue-400 text-lg flex-shrink-0 mt-0.5">
                                                tips_and_updates
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                                    {tooltip.title}
                                                </h4>
                                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                    {tooltip.content}
                                                </p>
                                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                    📍 Alvo: {tooltip.target}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkspaceRightSidebar;
