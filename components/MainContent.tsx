
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SCAN_CARDS_DATA, ANALYSIS_CARDS_DATA, AGENT_CARDS_DATA } from '../constants';
import ScanCard from './ScanCard';
import InstructionBox from './InstructionBox';
import FloatingTooltip from './FloatingTooltip';
import AgentCard, { AgentCardConfig } from './AgentCard';
import AgentWorkspace from './AgentWorkspace';
import AdminDashboard from './AdminDashboard';
import UserMenu from './UserMenu';
import { generateWorkspaceConfig } from '../utils/agentWorkspaceConfig';
import { populateExampleConversations } from '../utils/populateConversations';
import { useUserProgress } from '../hooks/useUserProgress';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import type { AgentCardData, AgentWorkspaceConfig, Integration } from '../types';

interface HeaderProps {
    onAdminClick: () => void;
    activeIntegrations: Integration[];
}

const getColorClasses = (color: string): string => {
    const colorMap: Record<string, string> = {
        purple: 'bg-primary text-white',
        green: 'bg-green-500 text-white',
        gray: 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700',
        blue: 'bg-blue-500 text-white',
        red: 'bg-red-500 text-white',
        yellow: 'bg-yellow-500 text-white',
    };
    return colorMap[color] || 'bg-gray-500 text-white';
};

// Dados dos logos para o carrossel
const LOGOS_DATA = [
    { id: 1, name: 'OpenAI', icon: '🤖', bgColor: 'bg-green-500' },
    { id: 2, name: 'Groq', icon: '⚡', bgColor: 'bg-orange-500' },
    { id: 3, name: 'Anthropic', icon: '🧠', bgColor: 'bg-blue-500' },
    { id: 4, name: 'Google AI', icon: '🔍', bgColor: 'bg-red-500' },
    { id: 5, name: 'Microsoft', icon: '💼', bgColor: 'bg-purple-500' },
    { id: 6, name: 'LangChain', icon: '🔗', bgColor: 'bg-teal-500' },
    { id: 7, name: 'Dify', icon: '🎯', bgColor: 'bg-pink-500' },
    { id: 8, name: 'N8N', icon: '⚙️', bgColor: 'bg-indigo-500' },
    { id: 9, name: 'Capsula', icon: '☄️', bgColor: 'bg-cyan-500' },
    { id: 10, name: 'Aeon', icon: '🌌', bgColor: 'bg-violet-500' },
];

const Header: React.FC<HeaderProps> = ({ onAdminClick, activeIntegrations }) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    
    return (
        <header className="mb-8">
            {/* Carrossel de Logos */}
            <div className="relative group overflow-hidden mb-4">
                {/* Gradiente esquerda */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none" />
                
                {/* Gradiente direita */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none" />
                
                {/* Carrossel Container */}
                <div 
                    ref={carouselRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-2"
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {LOGOS_DATA.map((logo) => (
                        <div
                            key={logo.id}
                            className={`flex-shrink-0 w-20 h-20 ${logo.bgColor} rounded-xl flex flex-col items-center justify-center gap-1 transition-transform duration-300 hover:scale-110 hover:shadow-lg cursor-pointer group/logo`}
                        >
                            <span className="text-3xl">{logo.icon}</span>
                            <span className="text-xs font-semibold text-white opacity-0 group-hover/logo:opacity-100 transition-opacity">
                                {logo.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Barra de busca e menu */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-on-surface-light dark:text-on-surface-dark text-lg font-medium">Plugins</h1>
                    {activeIntegrations.map((integration) => (
                        <span 
                            key={integration.id}
                            className={`${getColorClasses(integration.color)} text-xs font-semibold px-3 py-1 rounded-full`}
                        >
                            {integration.name}
                        </span>
                    ))}
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
            </div>
        </header>
    );
};

interface Agent {
    id: number;
    internalCode: string;
    title: string;
    description: string;
    agentType: string;
    integrations: Integration[];
    isActive: boolean;
    aiModel: string;
    aiProvider: string;
    behaviorType?: string;
    act?: string;
    function?: string;
    controlCode?: string;
}

interface MainContentProps {
    onNavigate?: (view: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ onNavigate }) => {
    const [activeWorkspace, setActiveWorkspace] = useState<AgentWorkspaceConfig | null>(null);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(4);
    const continueRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentDateTime, setCurrentDateTime] = useState<string>('');
    
    const { progress, isLoading } = useUserProgress();
    const { user } = useUser();
    const clientId = user?.clientId || 1;
    const { data: agents, loading: agentsLoading } = useApi<Agent[]>(`/agents?clientId=${clientId}`);
    
    // Função para obter progresso do agente
    const getAgentProgress = (agentId: number): number => {
        // Usar progresso do usuário ou valor aleatório baseado no ID para consistência
        const seed = agentId % 100;
        return Math.floor(seed * 0.5) + 20; // Valor entre 20 e 70
    };
    
    // Atualizar data e hora
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long',
                year: 'numeric' 
            });
            const timeStr = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            setCurrentDateTime(`${dateStr} • ${timeStr}`);
        };
        
        updateDateTime();
        const interval = setInterval(updateDateTime, 60000); // Atualiza a cada minuto
        
        return () => clearInterval(interval);
    }, []);

    // Memorizar agentes ativos
    const activeAgents = useMemo(() => {
        const filtered = agents?.filter(agent => agent.isActive) || [];
        console.log('🔍 Active Agents:', filtered.length, filtered);
        return filtered;
    }, [agents]);

    // Separar agentes por categoria
    const diagnosticAgents = useMemo(() => {
        const filtered = activeAgents
            .filter(agent => {
                const type = agent.agentType?.toLowerCase() || '';
                return type.includes('diagnóstico') || 
                       type.includes('diagnostico') ||
                       agent.title?.toLowerCase().includes('scan') ||
                       agent.title?.toLowerCase().includes('diagnóstico') ||
                       agent.internalCode?.includes('SC');
            })
            .map(agent => ({
                ...agent,
                contextProgress: Math.floor(Math.random() * 40) + 10,
                contextSaved: Math.floor(Math.random() * 5),
                connectionProgress: Math.floor(Math.random() * 50) + 50,
                act: agent.act || "Ato 01",
                function: agent.function || agent.agentType,
                controlCode: agent.internalCode
            } as AgentCardConfig));
        
        console.log('🔍 Diagnostic Agents:', filtered.length, filtered);
        return filtered;
    }, [activeAgents]);

    const interactiveAgents = useMemo(() => {
        return activeAgents
            .filter(agent => agent.behaviorType === 'interactive' || 
                           agent.agentType?.toLowerCase().includes('interativo') ||
                           agent.agentType?.toLowerCase().includes('chat'))
            .map(agent => ({
                ...agent,
                contextProgress: Math.floor(Math.random() * 40) + 10,
                contextSaved: Math.floor(Math.random() * 5),
                connectionProgress: Math.floor(Math.random() * 50) + 50,
                act: agent.act || "Interativo",
                function: agent.function || agent.agentType,
                controlCode: agent.internalCode
            } as AgentCardConfig));
    }, [activeAgents]);

    const strategyAgents = useMemo(() => {
        return activeAgents
            .filter(agent => agent.agentType?.toLowerCase().includes('estratégia') ||
                           agent.agentType?.toLowerCase().includes('estrategia') ||
                           agent.agentType?.toLowerCase().includes('análise') ||
                           agent.agentType?.toLowerCase().includes('analise'))
            .map(agent => ({
                ...agent,
                contextProgress: Math.floor(Math.random() * 40) + 10,
                contextSaved: Math.floor(Math.random() * 5),
                connectionProgress: Math.floor(Math.random() * 50) + 50,
                act: agent.act || "Estratégia",
                function: agent.function || agent.agentType,
                controlCode: agent.internalCode
            } as AgentCardConfig));
    }, [activeAgents]);

    // Calcular total de páginas
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(activeAgents.length / cardsPerPage));
    }, [activeAgents.length, cardsPerPage]);

    // Extrair integrações únicas dos agentes ativos (contextProgress > 0)
    const activeIntegrations = useMemo(() => {
        const integrationsMap = new Map<string, Integration>();
        
        AGENT_CARDS_DATA.forEach(agent => {
            // Considera agente ativo se tem algum progresso
            if (agent.contextProgress > 0 && agent.integrations) {
                agent.integrations.forEach(integration => {
                    if (!integrationsMap.has(integration.id)) {
                        integrationsMap.set(integration.id, integration);
                    }
                });
            }
        });
        
        return Array.from(integrationsMap.values());
    }, []);

    // Detectar tamanho da tela e ajustar número de cards
    useEffect(() => {
        const updateCardsPerPage = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setCardsPerPage(1);
            } else if (width < 768) {
                setCardsPerPage(2);
            } else if (width < 1024) {
                setCardsPerPage(3);
            } else if (width < 1536) {
                setCardsPerPage(4);
            } else {
                setCardsPerPage(6);
            }
        };

        updateCardsPerPage();
        window.addEventListener('resize', updateCardsPerPage);
        return () => window.removeEventListener('resize', updateCardsPerPage);
    }, []);

    // Clampar currentPage quando cardsPerPage ou activeAgents mudam
    useEffect(() => {
        const newTotalPages = Math.max(1, Math.ceil(activeAgents.length / cardsPerPage));
        setCurrentPage(prev => Math.min(prev, newTotalPages));
    }, [cardsPerPage, activeAgents.length]);

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

    // 4 Gatilhos Inteligentes
    const smartShortcuts = [
        { icon: 'description', label: 'Inserir Documentos', color: 'bg-blue-500', action: 'documents' },
        { icon: 'person', label: 'Completar Perfil', color: 'bg-green-500', action: 'profile' },
        { icon: 'lock', label: 'Acessar Cofre Pessoal', color: 'bg-purple-500', action: 'profile' }, // Irá para a aba Cofre no perfil
        { icon: 'assessment', label: 'Ver Diagnóstico', color: 'bg-orange-500', action: 'my-agents' }
    ];

    // Groovia Flow - Dados dos Agentes
    const grooviaFlowItems = [
        { text: 'Groovia Flow - Um quadro visual da sua estratégia em alto nível', action: 'strategy' },
        { text: 'Groove Board - Um plano detalhado no Notion com cada área do seu negócio, incluindo funis, tarefas e automações', action: 'tactical' },
        { text: 'DRE projetado com metas realistas', action: 'sales' },
        { text: 'Plano de Execução da Campanha', action: 'marketing' }
    ];

    return (
        <main className="flex-1 p-6">
            {/* Header Principal Premium */}
            <div className="flex flex-col gap-8 mb-12">
                {/* Linha 1: Título e Saudação Premium */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                Groovia Flow
                            </h1>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Sistema inteligente de diagnóstico e estratégia
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                            Seja bem vindo de volta
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-4 py-2 rounded-full border border-primary/20">
                            <span className="material-icons-outlined text-sm">access_time</span>
                            <span>{currentDateTime || 'Carregando...'}</span>
                        </div>
                    </div>
                </div>

                {/* Linha 2: 4 Gatilhos Inteligentes Premium (Estilo Premium Black & Green) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {smartShortcuts.map((shortcut, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (onNavigate && shortcut.action) {
                                    onNavigate(shortcut.action);
                                }
                            }}
                            className="relative overflow-hidden bg-black dark:bg-neutral-900 rounded-2xl border border-neutral-800 dark:border-neutral-700 p-6 hover:border-[#38ff81] hover:shadow-[0_0_30px_rgba(56,255,129,0.3)] hover:scale-[1.02] transition-all duration-300 group font-['Poppins'] cursor-pointer"
                            style={{ fontWeight: 300 }}
                        >
                            {/* Efeito de brilho no hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#38ff81]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="flex flex-col items-start gap-4 relative z-10">
                                <div className="relative w-14 h-14 bg-gradient-to-br from-[#38ff81]/20 to-[#38ff81]/10 rounded-xl flex items-center justify-center group-hover:from-[#38ff81]/30 group-hover:to-[#38ff81]/20 transition-all duration-300 border border-[#38ff81]/20 group-hover:border-[#38ff81]/40">
                                    <span className="material-icons-outlined text-[#38ff81] text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(56,255,129,0.6)]">
                                        {shortcut.icon}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[14px] text-white dark:text-neutral-100 leading-tight text-left font-light">
                                        {shortcut.label}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Decoração angular premium */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#38ff81]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            
                            {/* Linha brilhante no hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38ff81] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    ))}
                </div>

                {/* Linha 3: Groovia Flow - Lista de Agentes Premium */}
                <div className="bg-gradient-to-br from-surface-light to-surface-light/50 dark:from-surface-dark dark:to-surface-dark/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <h3 className="text-base font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Seus Agentes
                        </h3>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            Outros 12 +
                        </span>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {grooviaFlowItems.map((item, index) => (
                            <div 
                                key={index}
                                onClick={() => {
                                    if (onNavigate && item.action) {
                                        onNavigate(item.action);
                                    }
                                }}
                                className="flex items-start gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform flex-shrink-0"></div>
                                <span className="text-sm leading-tight text-on-surface-secondary-light dark:text-on-surface-secondary-dark group-hover:text-on-surface-light dark:group-hover:text-on-surface-dark transition-colors flex-1">
                                    {item.text}
                                </span>
                                <span className="material-icons-outlined text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                                    arrow_forward_ios
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

            {/* Agentes Inteligentes - Ato 1 */}
            <section className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Agentes Inteligentes - Ato 1
                        </h2>
                        <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            5 agentes especializados em diagnóstico estratégico empresarial powered by Capsula Aeon®
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#00FF7F] bg-[#00FF7F]/10 px-3 py-1 rounded-full border border-[#00FF7F]/30">
                        <span className="material-icons-outlined text-sm">psychology</span>
                        {activeAgents.filter(a => a.act === 'Ato 01' || !a.act).length} agentes ativos
                    </span>
                </div>

                {agentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeAgents
                            .filter(agent => {
                                // Mostrar agentes do Ato 01, ou todos se não houver filtro
                                return agent.act === 'Ato 01' || !agent.act || agent.act === null;
                            })
                            .slice(0, 6) // Limitar a 6 agentes
                            .sort((a, b) => {
                                const orderA = (a as any).metadata?.order || 0;
                                const orderB = (b as any).metadata?.order || 0;
                                return orderA - orderB;
                            })
                            .map(agent => {
                                const contextProgress = getAgentProgress(agent.id);
                                
                                return (
                                    <AgentCard
                                        key={agent.id}
                                        agent={{
                                            id: String(agent.id),
                                            title: agent.title,
                                            description: agent.description,
                                            agentType: agent.agentType,
                                            internalCode: agent.internalCode,
                                            contextProgress,
                                            contextSaved: Math.floor(contextProgress * 0.8),
                                            connectionProgress: agent.isActive ? 100 : 0,
                                            act: agent.act || 'Ato 01',
                                            function: agent.agentType,
                                            controlCode: agent.internalCode,
                                            isActive: agent.isActive,
                                            integrations: agent.integrations || [],
                                        }}
                                        onClick={() => {
                                            const agentData: AgentCardData = {
                                                id: String(agent.id),
                                                title: agent.title,
                                                description: agent.description,
                                                agentType: agent.agentType,
                                                internalCode: agent.internalCode,
                                                integrations: agent.integrations || [],
                                                contextProgress,
                                            };
                                            handleOpenWorkspace(agentData);
                                        }}
                                        showProgress={true}
                                        showStatus={true}
                                        variant="detailed"
                                    />
                                );
                            })}
                    </div>
                )}
                
                {!agentsLoading && activeAgents.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AGENT_CARDS_DATA.slice(0, 6).map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onClick={() => {
                                    const agentData: AgentCardData = agent;
                                    handleOpenWorkspace(agentData);
                                }}
                                showProgress={true}
                                showStatus={true}
                                variant="detailed"
                            />
                        ))}
                    </div>
                )}
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

            {/* O Diagnóstico Inteligente - Slider Moderno com UX Premium */}
            {diagnosticAgents.length > 0 && (
                <section className="mb-12">
                    {/* Header com Tags Dinâmicas */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                    O Diagnóstico Inteligente
                                </h2>
                                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Processo sequencial de análise e consulta
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {diagnosticAgents.slice(0, 4).flatMap(agent => 
                                    agent.integrations?.map(integration => (
                                        <span 
                                            key={`${agent.id}-${integration.id}`}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${getColorClasses(integration.color)}`}
                                        >
                                            {integration.name}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Slider Container */}
                    <div className="relative group">
                        {/* Botão Esquerda */}
                        <button
                            onClick={() => {
                                if (carouselRef.current) {
                                    carouselRef.current.scrollBy({ left: -1300, behavior: 'smooth' });
                                }
                            }}
                            className="absolute left-0 top-0 bottom-0 z-20 w-14 h-full bg-gradient-to-r from-background-light dark:from-background-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-start pl-2"
                        >
                            <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white hover:scale-110 transition-all flex items-center justify-center">
                                <span className="material-icons-outlined">chevron_left</span>
                            </div>
                        </button>
                        
                        {/* Cards Slider */}
                        <div 
                            ref={carouselRef}
                            className="flex items-stretch gap-8 overflow-x-auto scroll-smooth pb-4 scrollbar-hide px-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {diagnosticAgents.map((agent, index) => (
                                <React.Fragment key={agent.id}>
                                    <div 
                                        className="flex-shrink-0 w-80 transform transition-all duration-500 hover:scale-105"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <AgentCard
                                            agent={agent}
                                            onClick={() => {
                                                const fullAgent = agents?.find(a => a.id === agent.id);
                                                if (fullAgent) handleOpenWorkspace(fullAgent as any);
                                            }}
                                            variant="detailed"
                                            showProgress={true}
                                            showStatus={true}
                                        />
                                    </div>
                                    
                                    {/* Conector Visual entre Cards */}
                                    {index < diagnosticAgents.length - 1 && (
                                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-8 py-4">
                                            {/* Linha Tracejada Vertical */}
                                            <svg className="w-0.5 h-full" viewBox="0 0 2 100" preserveAspectRatio="none">
                                                <line 
                                                    x1="1" y1="0" 
                                                    x2="1" y2="100" 
                                                    stroke="currentColor" 
                                                    strokeDasharray="5,5" 
                                                    className="text-gray-300 dark:text-gray-600"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        
                        {/* Botão Direita */}
                        <button
                            onClick={() => {
                                if (carouselRef.current) {
                                    carouselRef.current.scrollBy({ left: 1300, behavior: 'smooth' });
                                }
                            }}
                            className="absolute right-0 top-0 bottom-0 z-20 w-14 h-full bg-gradient-to-l from-background-light dark:from-background-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-end pr-2"
                        >
                            <div className="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white hover:scale-110 transition-all flex items-center justify-center">
                                <span className="material-icons-outlined">chevron_right</span>
                            </div>
                        </button>
                    </div>
                    
                    {/* Indicadores de Paginação */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {Array.from({ length: Math.ceil(diagnosticAgents.length / 4) }).map((_, pageIndex) => (
                            <button
                                key={pageIndex}
                                onClick={() => {
                                    if (carouselRef.current) {
                                        carouselRef.current.scrollTo({ left: pageIndex * 1300, behavior: 'smooth' });
                                    }
                                }}
                                className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-primary transition-all"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Agentes Interativos */}
            {interactiveAgents.length > 0 && (
                <section className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">Interativos</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Chat AI</span>
                            <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Gemini</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {interactiveAgents.map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onClick={() => {
                                    const fullAgent = agents?.find(a => a.id === agent.id);
                                    if (fullAgent) handleOpenWorkspace(fullAgent as any);
                                }}
                                variant="default"
                                showProgress={false}
                                showStatus={true}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Agentes de Estratégia */}
            {strategyAgents.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark">Estratégia</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Groov Intelligence</span>
                            <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Strategy Flow</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {strategyAgents.map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onClick={() => {
                                    const fullAgent = agents?.find(a => a.id === agent.id);
                                    if (fullAgent) handleOpenWorkspace(fullAgent as any);
                                }}
                                variant="default"
                                showProgress={false}
                                showStatus={true}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default MainContent;
