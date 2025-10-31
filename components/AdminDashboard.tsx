import React, { useState } from 'react';
import AgentConfigModal from './AgentConfigModal';
import AgentBuilderModal from './AgentBuilderModal';
import type { AgentConfiguration } from '../types';

const AdminDashboard: React.FC = () => {
    const [agents, setAgents] = useState<AgentConfiguration[]>([
        {
            id: 'agent-1',
            name: 'SCAN CLARITY',
            description: 'Agente de diagnóstico completo de negócio',
            type: 'Agente de Diagnóstico',
            act: 'Ato 01',
            status: 'active',
            integration: {
                type: 'webhook',
                webhookUrl: 'https://your-webhook.com/scan-clarity',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_TOKEN',
                    'Content-Type': 'application/json'
                }
            },
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-10-20')
        },
        {
            id: 'agent-2',
            name: 'Market Research',
            description: 'Agente de pesquisa de mercado e ICP',
            type: 'Agente de Pesquisa',
            act: 'Ato 02',
            status: 'active',
            integration: {
                type: 'n8n',
                n8nUrl: 'https://n8n.example.com/webhook/market-research',
                workflowId: 'wf-12345'
            },
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-10-22')
        },
        {
            id: 'agent-3',
            name: 'Strategy Planner',
            description: 'Agente estratégico para planejamento',
            type: 'Agente Estratégico',
            act: 'Ato 03',
            status: 'disabled',
            integration: {
                type: 'langchain',
                apiUrl: 'https://langchain-api.example.com/agent',
                apiKey: 'lc_api_key_xxxxx',
                agentId: 'strategy-agent-001'
            },
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date('2024-09-15')
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AgentConfiguration | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');

    const handleCreateAgent = () => {
        setEditingAgent(null);
        setIsModalOpen(true);
    };

    const handleEditAgent = (agent: AgentConfiguration) => {
        setEditingAgent(agent);
        setIsModalOpen(true);
    };

    const handleOpenBuilder = (agent: AgentConfiguration) => {
        setEditingAgent(agent);
        setIsBuilderOpen(true);
    };

    const handleSaveAgent = (agent: AgentConfiguration) => {
        if (editingAgent) {
            // Editar agente existente
            setAgents(agents.map(a => a.id === agent.id ? { ...agent, updatedAt: new Date() } : a));
        } else {
            // Criar novo agente
            const newAgent = {
                ...agent,
                id: `agent-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setAgents([...agents, newAgent]);
        }
        setIsModalOpen(false);
    };

    const handleSaveBuilder = (agentData: any) => {
        if (editingAgent) {
            setAgents(agents.map(a => a.id === agentData.id ? { ...agentData, updatedAt: new Date() } : a));
        }
        setIsBuilderOpen(false);
    };

    const handleToggleStatus = (agentId: string) => {
        setAgents(agents.map(agent => 
            agent.id === agentId 
                ? { 
                    ...agent, 
                    status: agent.status === 'active' ? 'disabled' : 'active',
                    updatedAt: new Date()
                  } 
                : agent
        ));
    };

    const handleDeleteAgent = (agentId: string) => {
        if (confirm('Deseja realmente excluir este agente?')) {
            setAgents(agents.filter(agent => agent.id !== agentId));
        }
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             agent.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getIntegrationBadge = (type: string) => {
        const badges = {
            webhook: { color: 'bg-blue-500', label: 'WebHook' },
            n8n: { color: 'bg-orange-500', label: 'N8N' },
            langchain: { color: 'bg-purple-500', label: 'LangChain' }
        };
        const badge = badges[type as keyof typeof badges] || { color: 'bg-gray-500', label: type };
        return (
            <span className={`${badge.color} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
                {badge.label}
            </span>
        );
    };

    const stats = {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        disabled: agents.filter(a => a.status === 'disabled').length
    };

    return (
        <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark">
                            Administração de Agentes
                        </h1>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mt-1">
                            Configure, crie e gerencie agentes de IA com integração WebHook, N8N ou LangChain
                        </p>
                    </div>
                    <button
                        onClick={handleCreateAgent}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons-outlined">add</span>
                        Criar Novo Agente
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-icons-outlined text-primary">smart_toy</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {stats.total}
                                </p>
                                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Total de Agentes
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                <span className="material-icons-outlined text-green-500">check_circle</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {stats.active}
                                </p>
                                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Agentes Ativos
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                <span className="material-icons-outlined text-red-500">cancel</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {stats.disabled}
                                </p>
                                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Agentes Desabilitados
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar agentes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'disabled')}
                    className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
                >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="disabled">Desabilitados</option>
                </select>
            </div>

            {/* Agents List */}
            <div className="space-y-4">
                {filteredAgents.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                            search_off
                        </span>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Nenhum agente encontrado
                        </p>
                    </div>
                ) : (
                    filteredAgents.map((agent) => (
                        <div
                            key={agent.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-on-surface-light dark:text-on-surface-dark">
                                            {agent.name}
                                        </h3>
                                        <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-surface-light dark:bg-surface-dark px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                                            {agent.act}
                                        </span>
                                        {getIntegrationBadge(agent.integration.type)}
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            agent.status === 'active' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {agent.status === 'active' ? 'Ativo' : 'Desabilitado'}
                                        </span>
                                    </div>
                                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-3">
                                        {agent.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-outlined text-xs">category</span>
                                            {agent.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-outlined text-xs">schedule</span>
                                            Atualizado: {agent.updatedAt.toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleOpenBuilder(agent)}
                                        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                                        title="Agent Builder (Skills & Workflow)"
                                    >
                                        <span className="material-icons-outlined">extension</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(agent.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            agent.status === 'active'
                                                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600'
                                                : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'
                                        }`}
                                        title={agent.status === 'active' ? 'Desabilitar' : 'Ativar'}
                                    >
                                        <span className="material-icons-outlined">
                                            {agent.status === 'active' ? 'toggle_on' : 'toggle_off'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleEditAgent(agent)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-primary"
                                        title="Editar"
                                    >
                                        <span className="material-icons-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAgent(agent.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600"
                                        title="Excluir"
                                    >
                                        <span className="material-icons-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {isModalOpen && (
                <AgentConfigModal
                    agent={editingAgent}
                    onSave={handleSaveAgent}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {isBuilderOpen && (
                <AgentBuilderModal
                    agent={editingAgent}
                    onSave={handleSaveBuilder}
                    onClose={() => setIsBuilderOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
