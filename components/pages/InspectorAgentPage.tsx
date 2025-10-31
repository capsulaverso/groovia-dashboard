import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface IntegrationCheck {
    id: string;
    name: string;
    type: 'api' | 'webhook' | 'database' | 'agent';
    status: 'connected' | 'disconnected' | 'error' | 'unknown';
    lastCheck: string;
    issues?: string[];
}

interface AuditResult {
    id: string;
    agentName: string;
    consistency: number;
    issues: number;
    recommendations: string[];
}

const InspectorAgentPage: React.FC = () => {
    const { user } = useUser();
    const [isRunning, setIsRunning] = useState(false);
    const [inspections, setInspections] = useState<IntegrationCheck[]>([]);
    const [audits, setAudits] = useState<AuditResult[]>([]);

    // Mock data
    const mockIntegrations: IntegrationCheck[] = [
        {
            id: '1',
            name: 'N8N Webhook',
            type: 'webhook',
            status: 'connected',
            lastCheck: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
            id: '2',
            name: 'Supabase Database',
            type: 'database',
            status: 'connected',
            lastCheck: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        },
        {
            id: '3',
            name: 'OpenAI API',
            type: 'api',
            status: 'connected',
            lastCheck: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
            id: '4',
            name: 'Slack Integration',
            type: 'api',
            status: 'disconnected',
            lastCheck: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            issues: ['Token expirado', 'Credenciais inválidas']
        }
    ];

    const mockAudits: AuditResult[] = [
        {
            id: '1',
            agentName: 'SCAN: O Decodificador',
            consistency: 95,
            issues: 1,
            recommendations: ['Atualizar contexto de negócio']
        },
        {
            id: '2',
            agentName: 'O Criador de Personas',
            consistency: 88,
            issues: 3,
            recommendations: ['Revisar dados de mercado', 'Atualizar ICP', 'Validar conclusões']
        },
        {
            id: '3',
            agentName: 'Groovia Intelligence',
            consistency: 92,
            issues: 0,
            recommendations: []
        }
    ];

    const handleStartInspection = async () => {
        setIsRunning(true);
        
        // Simular processo de inspeção
        setTimeout(() => {
            setInspections(mockIntegrations);
            setAudits(mockAudits);
            setIsRunning(false);
        }, 3000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return 'check_circle';
            case 'disconnected': return 'cancel';
            case 'error': return 'error';
            default: return 'help_outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return '#00FFB2';
            case 'disconnected': return '#FF4D4D';
            case 'error': return '#FF4D4D';
            default: return '#B0B0B0';
        }
    };

    const formatLastCheck = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
        
        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    const getConsistencyColor = (consistency: number) => {
        if (consistency >= 90) return '#00FFB2';
        if (consistency >= 70) return '#FFB200';
        return '#FF4D4D';
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-4 lg:p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-16 h-16 rounded-full bg-[#007BFF] bg-opacity-20 flex items-center justify-center">
                                    <span className="material-icons-outlined text-[#007BFF] text-3xl">verified_user</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-medium">O Inspetor Estratégico</h1>
                                    <p className="text-sm text-[#007BFF]">Inspeção de Profundidade</p>
                                </div>
                            </div>
                            <p className="text-[#B0B0B0] text-sm lg:text-base mt-2">
                                Inspeciona cada elo da cadeia estratégica, garantindo que tudo esteja conectado e funcionando com precisão.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            icon="play_arrow"
                            onClick={handleStartInspection}
                            disabled={isRunning}
                        >
                            {isRunning ? 'Inspecionando...' : 'Iniciar Inspeção'}
                        </Button>
                    </div>
                </div>

                {/* Status Geral */}
                {inspections.length > 0 && (
                    <Card className="mb-8 bg-gradient-to-br from-[#007BFF] to-[#0056CC] bg-opacity-10 border border-[#007BFF]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-2">Status Geral do Sistema</h3>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm text-[#B0B0B0]">Integrações</p>
                                        <p className="text-2xl font-medium text-white">
                                            {inspections.filter(i => i.status === 'connected').length} / {inspections.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#B0B0B0]">Agentes Auditados</p>
                                        <p className="text-2xl font-medium text-white">{audits.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#B0B0B0]">Média de Consistência</p>
                                        <p className="text-2xl font-medium text-[#00FFB2]">
                                            {audits.length > 0 ? Math.floor(audits.reduce((acc, a) => acc + a.consistency, 0) / audits.length) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Integrações - Grid Limpo */}
                {inspections.length > 0 && (
                    <Card className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-icons-outlined text-[#00FFB2] text-xl">device_hub</span>
                            <h2 className="text-base font-medium text-white">Integrações</h2>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {inspections.map(integration => (
                                <div
                                    key={integration.id}
                                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 hover:border-[#00FFB2] transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: getStatusColor(integration.status) + '20' }}
                                        >
                                            <span className="material-icons-outlined text-2xl" style={{ color: getStatusColor(integration.status) }}>
                                                {getStatusIcon(integration.status)}
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-medium text-white line-clamp-2 px-1">{integration.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Auditoria de Agentes - Grid Limpo */}
                {audits.length > 0 && (
                    <Card className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-icons-outlined text-[#FFB200] text-xl">fact_check</span>
                            <h2 className="text-base font-medium text-white">Auditoria de Agentes</h2>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {audits.map(audit => (
                                <div
                                    key={audit.id}
                                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 hover:border-[#00FFB2] transition-all cursor-pointer group relative"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        {audit.issues > 0 && (
                                            <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D4D] rounded-full" />
                                        )}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: getConsistencyColor(audit.consistency) + '20' }}
                                        >
                                            <span className="material-icons-outlined text-2xl" style={{ color: getConsistencyColor(audit.consistency) }}>
                                                {audit.issues === 0 ? 'check_circle' : 'warning'}
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-medium text-white mb-1 line-clamp-2 px-1">{audit.agentName}</h3>
                                        <span className="text-sm font-medium" style={{ color: getConsistencyColor(audit.consistency) }}>
                                            {audit.consistency}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Relatório de Impacto Estratégico */}
                {inspections.length > 0 && audits.length > 0 && (
                    <Card className="border border-[#007BFF]">
                        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-3">
                            <span className="material-icons-outlined text-[#007BFF] text-2xl">assessment</span>
                            Relatório de Impacto Estratégico
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-[#0F0F0F] rounded-lg p-4">
                                <h3 className="text-base font-medium text-white mb-3">Resumo Executivo</h3>
                                <p className="text-sm text-[#B0B0B0] leading-relaxed">
                                    A auditoria identificou {audits.reduce((acc, a) => acc + a.issues, 0)} problemas distribuídos entre {audits.length} agentes analisados. 
                                    A taxa média de consistência é de {Math.floor(audits.reduce((acc, a) => acc + a.consistency, 0) / audits.length)}%, 
                                    indicando um bom alinhamento geral. Recomenda-se ações corretivas priorizadas para os agentes com maior número de inconsistências.
                                </p>
                            </div>
                            <Button variant="primary" icon="download" fullWidth>
                                Exportar Relatório Completo
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default InspectorAgentPage;

