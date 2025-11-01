import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface AgentData {
    id: number;
    title: string;
    description: string;
    agentType: string;
    internalCode: string;
    status: 'active' | 'inactive' | 'testing';
    lastTest?: string;
    metrics?: {
        accuracy?: number;
        latency?: number;
        usage?: number;
    };
}

const AgentLaboratoryPage: React.FC = () => {
    const { user } = useUser();
    const { data: agentsRaw } = useApi<any[]>(`/agents?clientId=${user?.clientId || 1}`);
    const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formatar agentes com dados mockados para métricas
    const agents: AgentData[] = (agentsRaw || []).map(agent => ({
        id: agent.id,
        title: agent.title,
        description: agent.description,
        agentType: agent.agentType || agent.agent_type,
        internalCode: agent.internalCode || agent.internal_code,
        status: agent.isActive ? 'active' : 'inactive',
        metrics: {
            accuracy: Math.floor(Math.random() * 20) + 80,
            latency: Math.floor(Math.random() * 500) + 100,
            usage: Math.floor(Math.random() * 50) + 10
        }
    }));

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'neutral';
            case 'testing': return 'warning';
            default: return 'default';
        }
    };

    const handleAgentClick = (agent: AgentData) => {
        setSelectedAgent(agent);
        setIsModalOpen(true);
    };

    const getAgentIcon = (agentType: string) => {
        const iconMap: { [key: string]: string } = {
            'Estratégia': 'flag',
            'Tático': 'track_changes',
            'Marketing': 'campaign',
            'Vendas': 'shopping_cart',
            'Atendimento': 'support',
            'Análise': 'analytics',
            'Default': 'smart_toy'
        };
        return iconMap[agentType] || iconMap['Default'];
    };

    const getAgentColor = (agentType: string) => {
        const colorMap: { [key: string]: string } = {
            'Estratégia': '#FFB200',
            'Tático': '#00FFB2',
            'Marketing': '#007BFF',
            'Vendas': '#FF4D4D',
            'Atendimento': '#38FF81',
            'Análise': '#9D4EDD',
            'Default': '#B0B0B0'
        };
        return colorMap[agentType] || colorMap['Default'];
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-4 lg:p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-medium mb-2">Laboratório de Agentes</h1>
                            <p className="text-[#B0B0B0] text-sm lg:text-base">
                                Configure, teste e evolua agentes com profundidade e controle total
                            </p>
                        </div>
                        <Button variant="primary" size="md" icon="add">
                            Criar Novo Agente
                        </Button>
                    </div>
                </div>

                {/* Grid de Ícones Limpos */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 lg:gap-4">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => handleAgentClick(agent)}
                            className="group cursor-pointer"
                        >
                            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 hover:border-[#00FFB2] transition-all flex flex-col items-center relative">
                                {/* Badge de Status (pequeno) */}
                                <div className="absolute top-2 right-2">
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            agent.status === 'active' ? 'bg-[#00FFB2]' :
                                            agent.status === 'testing' ? 'bg-[#FFB200]' :
                                            'bg-[#B0B0B0]'
                                        }`}
                                    />
                                </div>

                                {/* Ícone Principal */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: getAgentColor(agent.agentType) + '20' }}
                                >
                                    <span
                                        className="material-icons-outlined text-2xl"
                                        style={{ color: getAgentColor(agent.agentType) }}
                                    >
                                        {getAgentIcon(agent.agentType)}
                                    </span>
                                </div>

                                {/* Nome do Agente */}
                                <h3 className="text-xs font-medium text-white text-center line-clamp-2 leading-tight px-1">
                                    {agent.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {agents.length === 0 && (
                    <Card className="border-2 border-dashed border-[#2A2A2A] text-center py-12">
                        <span className="material-icons-outlined text-6xl text-[#B0B0B0] mb-4 block">science</span>
                        <h3 className="text-xl font-medium text-white mb-2">Nenhum agente configurado</h3>
                        <p className="text-[#B0B0B0] mb-6">Crie seu primeiro agente para começar</p>
                        <Button variant="primary" icon="add">
                            Criar Primeiro Agente
                        </Button>
                    </Card>
                )}
            </div>

            {/* Modal de Detalhes do Agente */}
            {isModalOpen && selectedAgent && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#1E1E1E] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header do Modal */}
                        <div className="sticky top-0 bg-[#1E1E1E] border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: getAgentColor(selectedAgent.agentType) + '20' }}
                                >
                                    <span
                                        className="material-icons-outlined text-4xl"
                                        style={{ color: getAgentColor(selectedAgent.agentType) }}
                                    >
                                        {getAgentIcon(selectedAgent.agentType)}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-medium text-white">{selectedAgent.title}</h2>
                                    <p className="text-sm text-[#007BFF]">{selectedAgent.internalCode}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#B0B0B0] hover:text-white transition-colors"
                            >
                                <span className="material-icons-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 space-y-6">
                            {/* Status e Tipo */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant={getStatusVariant(selectedAgent.status)} size="md">
                                    {selectedAgent.status === 'active' ? '✓ Ativo' : selectedAgent.status === 'testing' ? '⏳ Testando' : '○ Inativo'}
                                </Badge>
                                <Badge variant="info" size="md">
                                    {selectedAgent.agentType}
                                </Badge>
                            </div>

                            {/* Descrição */}
                            <div>
                                <h3 className="text-base font-medium text-white mb-2">Descrição</h3>
                                <p className="text-sm text-[#B0B0B0] leading-relaxed">{selectedAgent.description}</p>
                            </div>

                            {/* Métricas */}
                            {selectedAgent.metrics && (
                                <div>
                                    <h3 className="text-base font-medium text-white mb-4">Métricas de Performance</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-outlined text-[#00FFB2] text-xl">check_circle</span>
                                                <p className="text-xs text-[#B0B0B0]">Precisão</p>
                                            </div>
                                            <p className="text-2xl font-medium text-[#00FFB2]">{selectedAgent.metrics.accuracy}%</p>
                                        </div>
                                        <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-outlined text-white text-xl">speed</span>
                                                <p className="text-xs text-[#B0B0B0]">Latência</p>
                                            </div>
                                            <p className="text-2xl font-medium text-white">{selectedAgent.metrics.latency}ms</p>
                                        </div>
                                        <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-outlined text-[#FFB200] text-xl">trending_up</span>
                                                <p className="text-xs text-[#B0B0B0]">Uso</p>
                                            </div>
                                            <p className="text-2xl font-medium text-[#FFB200]">{selectedAgent.metrics.usage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ações */}
                            <div className="flex items-center gap-3 pt-4 border-t border-[#2A2A2A]">
                                <Button variant="primary" icon="play_arrow" className="flex-1">
                                    Testar Agente
                                </Button>
                                <Button variant="secondary" icon="settings" className="flex-1">
                                    Configurar
                                </Button>
                                <Button variant="ghost" icon="analytics" className="flex-1">
                                    Métricas
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentLaboratoryPage;

