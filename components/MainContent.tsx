
import React, { useState, useEffect, useRef } from 'react';
import { SCAN_CARDS_DATA, ANALYSIS_CARDS_DATA, AGENT_CARDS_DATA } from '../constants';
import ScanCard from './ScanCard';
import InstructionBox from './InstructionBox';
import FloatingTooltip from './FloatingTooltip';
import AgentCard from './AgentCard';
import AgentWorkspace from './AgentWorkspace';
import AdminDashboard from './AdminDashboard';
import UserMenu from './UserMenu';
import { generateWorkspaceConfig } from '../utils/agentWorkspaceConfig';
import { populateExampleConversations } from '../utils/populateConversations';
import { useUserProgress } from '../hooks/useUserProgress';
import type { AgentCardData, AgentWorkspaceConfig } from '../types';

interface HeaderProps {
    onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <h1 className="text-on-surface-light dark:text-on-surface-dark text-lg font-medium">Plugins</h1>
            <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">GPT 5</span>
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">DRIVE</span>
            <span className="bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-xs font-semibold px-3 py-1 rounded-full">SLIDE</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">search</span>
                <input className="w-full bg-surface-light dark:bg-surface-dark border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Buscar" type="text" />
            </div>
            <UserMenu 
                userName="João Silva"
                userEmail="joao.silva@groovia.com"
                onAdminClick={onAdminClick}
            />
        </div>
    </header>
);

const MainContent: React.FC = () => {
    const [activeWorkspace, setActiveWorkspace] = useState<AgentWorkspaceConfig | null>(null);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const continueRef = useRef<HTMLDivElement>(null);
    
    const { progress, isLoading } = useUserProgress();

    // Popular conversas de exemplo na primeira vez que o componente carregar
    useEffect(() => {
        const hasPopulated = localStorage.getItem('conversations_populated');
        if (!hasPopulated) {
            populateExampleConversations();
            localStorage.setItem('conversations_populated', 'true');
        }
    }, []);

    const handleOpenWorkspace = (agent: AgentCardData) => {
        const config = generateWorkspaceConfig(agent);
        setActiveWorkspace(config);
    };

    const handleCloseWorkspace = () => {
        setActiveWorkspace(null);
    };

    const handleOpenAdmin = () => {
        setShowAdmin(true);
    };

    const handleCloseAdmin = () => {
        setShowAdmin(false);
    };

    if (activeWorkspace) {
        return <AgentWorkspace config={activeWorkspace} onClose={handleCloseWorkspace} />;
    }

    if (showAdmin) {
        return (
            <div className="flex flex-col h-screen">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-outlined text-primary text-2xl">admin_panel_settings</span>
                        <h1 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark">
                            Painel Administrativo
                        </h1>
                    </div>
                    <button
                        onClick={handleCloseAdmin}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <span className="material-icons-outlined">arrow_back</span>
                        <span className="text-sm font-medium">Voltar ao Dashboard</span>
                    </button>
                </div>
                <AdminDashboard />
            </div>
        );
    }

    return (
        <main className="flex-1 p-6">
            <Header onAdminClick={handleOpenAdmin} />

            <div className="mb-6">
                <InstructionBox
                    title="Bem-vindo ao Groovia Dashboard!"
                    description="Configure seus agentes de IA e inicie o diagnóstico inteligente para seu projeto. Este é um componente reutilizável que pode ser usado em todo o sistema."
                    primaryButtonText="Iniciar Tour"
                    secondaryButtonText="Pular"
                    onPrimaryAction={() => alert('Tour iniciado!')}
                    onSecondaryAction={() => console.log('Tour pulado')}
                    variant="info"
                    icon="info"
                />
            </div>

            <section className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">O Diagnóstico Inteligente (SCAN)</h2>
                    <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Ato 01</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {SCAN_CARDS_DATA.map(card => (
                        <ScanCard key={card.id} title={card.title} description={card.description} progress={card.progress} />
                    ))}
                </div>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-on-surface-light dark:text-on-surface-dark">Histórico de Chat</h2>
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl">
                    <h3 className="font-semibold text-on-surface-light dark:text-on-surface-dark">Dados de Sessão</h3>
                    <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">O histórico das conversas, para que um utilizador possa continuar de onde parou.</p>
                    <div className="flex items-center justify-end gap-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                            <span className="material-icons-outlined text-base">content_copy</span>
                        </button>
                        <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                            <span className="material-icons-outlined text-base">share</span>
                        </button>
                        <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                            <span className="material-icons-outlined text-base">download</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">Continue de onde parou</h2>
                    {!isLoading && (
                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                            {progress.act}
                        </span>
                    )}
                </div>
                
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-pulse text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Carregando progresso...
                        </div>
                    </div>
                ) : (
                    <div ref={continueRef} className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shrink-0">
                            <div className="flex items-center justify-end mb-4">
                                <div className="relative inline-flex items-center justify-center bg-primary rounded-full w-7 h-7">
                                    <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-white"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3.5 bg-green-400 rounded-full w-24 animate-pulse" style={{ animationDelay: '0ms', animationDuration: '2000ms' }}></div>
                                <div className="h-3.5 bg-green-400 rounded-full w-24 animate-pulse" style={{ animationDelay: '200ms', animationDuration: '2000ms' }}></div>
                                <div className="h-3.5 bg-green-400 rounded-full w-24 animate-pulse" style={{ animationDelay: '400ms', animationDuration: '2000ms' }}></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {progress.currentAgent}
                                </h3>
                                <span className="text-xs font-mono text-primary bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                                    {progress.internalCode}
                                </span>
                            </div>
                            <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm mb-2">
                                {progress.agentType}
                            </p>
                            <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm leading-relaxed mb-4">
                                {progress.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Progresso do contexto:
                                </span>
                                <span className="font-semibold text-primary">{progress.contextProgress}%</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-primary h-full transition-all duration-500" 
                                        style={{ width: `${progress.contextProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Tooltip Flutuante */}
                <FloatingTooltip
                    targetRef={continueRef}
                    isVisible={showTooltip && !isLoading}
                    preferredPlacement="right"
                    title="Validação Estratégica"
                    description="Garante que todos os elementos do projeto estejam alinhados. Requer aprovação do cliente para seguir."
                    primaryButtonText="Começar"
                    secondaryButtonText="Mais tarde"
                    onPrimaryAction={() => {
                        console.log('Começar ação');
                        setShowTooltip(false);
                    }}
                    onSecondaryAction={() => {
                        console.log('Mais tarde ação');
                        setShowTooltip(false);
                    }}
                    onClose={() => setShowTooltip(false)}
                    showCloseButton={true}
                    variant="info"
                    icon="info"
                />
            </section>

            <section className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">Agentes Interativos</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Chat AI</span>
                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Gemini</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {AGENT_CARDS_DATA.map(agent => (
                        <AgentCard 
                            key={agent.id}
                            title={agent.title}
                            description={agent.description}
                            contextProgress={agent.contextProgress}
                            act={agent.act}
                            internalCode={agent.internalCode}
                            agentType={agent.agentType}
                            onClick={() => handleOpenWorkspace(agent)}
                        />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">Análise à Estratégia</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Groov Intelligence</span>
                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Strategy Flow</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {ANALYSIS_CARDS_DATA.map(card => (
                        <ScanCard key={card.id} title={card.title} description={card.description} progress={card.progress} />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default MainContent;
