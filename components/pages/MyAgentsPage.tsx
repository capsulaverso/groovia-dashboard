import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import ChatModal from '../ChatModal';
import AgentCard, { AgentCardConfig } from '../AgentCard';

interface Agent {
    id: number;
    title: string;
    description: string;
    agentType: string;
    isActive: boolean;
    internalCode?: string;
    behaviorType?: string;
    capabilities?: any;
    aiProvider?: string;
    aiModel?: string;
    systemPrompt?: string;
}

const MyAgentsPage: React.FC = () => {
    const { user } = useUser();
    const clientId = user?.clientId || 1;
    
    // Debug: verificar se temos clientId
    console.log('MyAgentsPage - clientId:', clientId);
    
    const { data: agents, loading, error } = useApi<Agent[]>(`/agents?clientId=${clientId}`);
    
    console.log('MyAgentsPage - agents:', agents);
    console.log('MyAgentsPage - loading:', loading);
    console.log('MyAgentsPage - error:', error);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showChat, setShowChat] = useState(false);

    const filteredAgents = agents?.filter(agent => {
        const matchesSearch = agent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.agentType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && agent.isActive) ||
                             (filterStatus === 'completed' && !agent.isActive);
        
        return matchesSearch && matchesStatus;
    }) || [];

    const handleOpenChat = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowChat(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Carregando agentes...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-500">
                    <span className="material-icons-outlined text-6xl mb-4">error</span>
                    <p className="text-title font-semibold">Erro ao carregar agentes</p>
                    <p className="text-body mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Meus Agentes
                </h1>
                <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Acesse e gerencie todos os agentes de IA disponíveis para você
                </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-1">
                                Total de Agentes
                            </p>
                            <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                {agents?.length || 0}
                            </p>
                        </div>
                        <span className="material-icons-outlined text-3xl text-primary">smart_toy</span>
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-1">
                                Agentes Ativos
                            </p>
                            <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                {agents?.filter(a => a.isActive).length || 0}
                            </p>
                        </div>
                        <span className="material-icons-outlined text-3xl text-green-500">check_circle</span>
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-1">
                                Agentes Disponíveis
                            </p>
                            <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                {agents?.length || 0}
                            </p>
                        </div>
                        <span className="material-icons-outlined text-3xl text-blue-500">auto_awesome</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar agentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'active'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Em Uso
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'completed'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Concluídos
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                    if (!agent) return null;
                    return (
                        <AgentCard
                            key={agent.id}
                            agent={{
                                ...agent,
                                contextProgress: 45, // Exemplo: 45% do contexto preenchido
                                contextSaved: 2, // Contexto salvo 2 vezes
                                connectionProgress: 75, // Círculo roxo 75% completo
                                act: "Ato 01", // Exemplo
                                function: "Diagnóstico", // Função do agente
                                controlCode: agent.internalCode // Código de controle
                            } as AgentCardConfig}
                            onClick={() => handleOpenChat(agent)}
                            variant="detailed"
                            showProgress={true}
                            showStatus={true}
                        />
                    );
                })}
            </div>

            {filteredAgents.length === 0 && (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                    <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Nenhum agente encontrado
                    </h3>
                    <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Tente ajustar os filtros ou o termo de busca
                    </p>
                </div>
            )}

            {/* Chat Modal */}
            {selectedAgent && showChat && (
                <ChatModal
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    agentTitle={selectedAgent.title}
                    agentDescription={selectedAgent.description}
                    agentType={selectedAgent.agentType}
                    internalCode={selectedAgent.internalCode || `AGT-${selectedAgent.id}`}
                    agentId={selectedAgent.id}
                    aiProvider={selectedAgent.aiProvider || 'replit'}
                    aiModel={selectedAgent.aiModel || 'gpt-4o-mini'}
                    systemPrompt={selectedAgent.systemPrompt || 'Você é um assistente inteligente e prestativo.'}
                />
            )}
        </div>
    );
};

export default MyAgentsPage;
