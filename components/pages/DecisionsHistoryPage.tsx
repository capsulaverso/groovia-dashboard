import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { apiClient } from '../../hooks/useApi';

interface Decision {
    id: number;
    date: string;
    agentName: string;
    agentInternalCode: string;
    decision: string;
    justification: string;
    status: 'approved' | 'pending' | 'rejected';
    relatedDocuments?: string[];
    impact: 'high' | 'medium' | 'low';
}

const DecisionsHistoryPage: React.FC = () => {
    const { user } = useUser();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [filterAgent, setFilterAgent] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Carregar decisões
    useEffect(() => {
        const loadDecisions = async () => {
            try {
                const response = await apiClient.get(`/decisions?userId=${user?.id}&clientId=${user?.clientId || 1}`);
                setDecisions(response);
            } catch (error) {
                console.error('Erro ao carregar decisões:', error);
                // Mock data para demonstração
                setDecisions([
                    {
                        id: 1,
                        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                        agentName: 'SCAN: O Decodificador',
                        agentInternalCode: 'AGT-SC-001',
                        decision: 'Aprovar estratégia de posicionamento no mercado premium',
                        justification: 'Análise detalhada do mercado e concorrência indicam oportunidade clara no segmento premium.',
                        status: 'approved',
                        relatedDocuments: ['Dossiê Estratégico v1.pdf'],
                        impact: 'high'
                    },
                    {
                        id: 2,
                        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                        agentName: 'O Criador de Personas',
                        agentInternalCode: 'AGT-AM-003',
                        decision: 'Priorizar persona "Executivo Consciente"',
                        justification: 'Esta persona representa 60% do potencial de receita e apresenta alta propensão à compra.',
                        status: 'approved',
                        impact: 'high'
                    },
                    {
                        id: 3,
                        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                        agentName: 'Groovia Intelligence',
                        agentInternalCode: 'AGT-AM-005',
                        decision: 'Adotar modelo de precificação dinâmica',
                        justification: 'Recomendação requer aprovação da diretoria para implementação.',
                        status: 'pending',
                        impact: 'medium'
                    },
                ]);
            }
        };

        if (user?.id) {
            loadDecisions();
        }
    }, [user?.id, user?.clientId]);

    // Filtrar decisões
    const filteredDecisions = decisions.filter(d => {
        const agentMatch = filterAgent === 'all' || d.agentInternalCode === filterAgent;
        const statusMatch = filterStatus === 'all' || d.status === filterStatus;
        return agentMatch && statusMatch;
    });

    // Obter agentes únicos
    const uniqueAgents = Array.from(new Set(decisions.map(d => d.agentInternalCode)));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#007BFF';
            case 'pending': return '#FFB200';
            case 'rejected': return '#FF4D4D';
            default: return '#B0B0B0';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Aprovada';
            case 'pending': return 'Pendente';
            case 'rejected': return 'Rejeitada';
            default: return status;
        }
    };

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'high': return 'priority_high';
            case 'medium': return 'remove';
            case 'low': return 'keyboard_arrow_down';
            default: return 'circle';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-medium mb-2">Histórico de Decisões</h1>
                    <p className="text-[#B0B0B0]">Registro estratégico de decisões tomadas ao longo do projeto</p>
                </div>

                {/* Filtros */}
                <div className="bg-[#1E1E1E] rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-[#B0B0B0] mb-2">Agente</label>
                            <select
                                value={filterAgent}
                                onChange={(e) => setFilterAgent(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#00FFB2]"
                            >
                                <option value="all">Todos os Agentes</option>
                                {uniqueAgents.map(agent => (
                                    <option key={agent} value={agent}>{agent}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-[#B0B0B0] mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#00FFB2]"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="approved">Aprovadas</option>
                                <option value="pending">Pendentes</option>
                                <option value="rejected">Rejeitadas</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button className="w-full bg-[#00FFB2] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#00E6A0] transition-colors flex items-center justify-center gap-2">
                                <span className="material-icons-outlined text-lg">download</span>
                                Exportar Dossiê
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    {filteredDecisions.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block p-4 bg-[#1E1E1E] rounded-full mb-4">
                                <span className="material-icons-outlined text-[#B0B0B0] text-5xl">history</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Nenhuma decisão registrada</h3>
                            <p className="text-[#B0B0B0]">As decisões dos agentes serão registradas aqui</p>
                        </div>
                    ) : (
                        filteredDecisions.map((decision, index) => (
                            <div key={decision.id} className="relative">
                                {/* Linha da Timeline */}
                                {index < filteredDecisions.length - 1 && (
                                    <div className="absolute left-8 top-20 w-0.5 h-full bg-[#2A2A2A]" style={{ height: 'calc(100% + 1.5rem)' }} />
                                )}

                                {/* Card de Decisão */}
                                <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 hover:border-[#00FFB2] transition-all">
                                    <div className="flex items-start gap-4">
                                        {/* Ícone */}
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: getStatusColor(decision.status) + '20' }}
                                        >
                                            <span
                                                className="material-icons-outlined text-2xl"
                                                style={{ color: getStatusColor(decision.status) }}
                                            >
                                                {getImpactIcon(decision.impact)}
                                            </span>
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-medium text-white">{decision.agentName}</h3>
                                                        <span className="text-xs text-[#007BFF] bg-[#007BFF] bg-opacity-10 px-2 py-1 rounded-full">
                                                            {decision.agentInternalCode}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#B0B0B0]">{formatDate(decision.date)}</p>
                                                </div>
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: getStatusColor(decision.status) + '20',
                                                        color: getStatusColor(decision.status)
                                                    }}
                                                >
                                                    {getStatusLabel(decision.status)}
                                                </span>
                                            </div>

                                            {/* Decisão */}
                                            <div className="mb-4">
                                                <h4 className="text-base font-medium text-white mb-2">Decisão:</h4>
                                                <p className="text-base text-[#FFFFFF] leading-relaxed">{decision.decision}</p>
                                            </div>

                                            {/* Justificativa */}
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-[#B0B0B0] mb-2">Justificativa:</h4>
                                                <p className="text-sm text-[#B0B0B0] leading-relaxed">{decision.justification}</p>
                                            </div>

                                            {/* Documentos Relacionados */}
                                            {decision.relatedDocuments && decision.relatedDocuments.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons-outlined text-[#B0B0B0] text-lg">description</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {decision.relatedDocuments.map((doc, idx) => (
                                                            <button
                                                                key={idx}
                                                                className="text-xs text-[#007BFF] hover:text-[#0056CC] transition-colors"
                                                            >
                                                                {doc}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DecisionsHistoryPage;

