import React, { useState } from 'react';
import WorkspaceLeftSidebar from './WorkspaceLeftSidebar';
import WorkspaceChatArea from './WorkspaceChatArea';
import WorkspaceRightSidebar from './WorkspaceRightSidebar';
import type { AgentWorkspaceConfig } from '../types';

interface AgentWorkspaceProps {
    config: AgentWorkspaceConfig;
    onClose: () => void;
}

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ config, onClose }) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
            {/* Header da Workspace */}
            <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:text-on-surface-light dark:hover:text-on-surface-dark transition-colors"
                    >
                        <span className="material-icons-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-on-surface-light dark:text-on-surface-dark">
                            {config.agentTitle}
                        </h1>
                        <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            {config.agentType}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-primary bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                        {config.internalCode}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {config.act}
                    </span>
                    
                    {/* Toggle Sidebars */}
                    <button
                        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle histórico"
                    >
                        <span className="material-icons-outlined text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            {showLeftSidebar ? 'menu_open' : 'menu'}
                        </span>
                    </button>
                    <button
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle documentos"
                    >
                        <span className="material-icons-outlined text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            {showRightSidebar ? 'chrome_reader_mode' : 'description'}
                        </span>
                    </button>
                </div>
            </header>

            {/* Layout de 3 Colunas */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Esquerdo - Histórico e Dados */}
                {showLeftSidebar && (
                    <WorkspaceLeftSidebar
                        conversationHistory={config.conversationHistory}
                        contextData={config.contextData}
                        activeConversationId={activeConversationId}
                        onSelectConversation={setActiveConversationId}
                    />
                )}

                {/* Área Central - Chat */}
                <WorkspaceChatArea
                    agentTitle={config.agentTitle}
                    agentDescription={config.agentDescription}
                    agentType={config.agentType}
                    internalCode={config.internalCode}
                    functions={config.functions}
                    activeConversationId={activeConversationId}
                />

                {/* Sidebar Direito - Documentos e Ajuda */}
                {showRightSidebar && (
                    <WorkspaceRightSidebar
                        documents={config.documents}
                        helpMessages={config.helpMessages}
                        tooltips={config.tooltips}
                    />
                )}
            </div>
        </div>
    );
};

export default AgentWorkspace;
