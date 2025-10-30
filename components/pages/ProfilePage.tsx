import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import type { AgentCardData } from '../../types';

interface Conversation {
    id: number;
    title: string;
    agentId: number;
    agentName: string;
    messageCount: number;
    updatedAt: string;
}

interface Document {
    id: number;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    isVisible: boolean;
    retentionDays: number;
}

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState<'profile' | 'agents' | 'history' | 'vault' | 'settings'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: '',
        role: '',
        phone: '',
        address: ''
    });

    // Buscar dados
    const { data: conversations } = useApi<Conversation[]>(`/conversations?userId=${user?.id}&clientId=${user?.clientId || 1}`);
    const { data: agents } = useApi<AgentCardData[]>(`/agents?clientId=${user?.clientId || 1}`);
    const { data: documents } = useApi<Document[]>(`/documents?userId=${user?.id}&clientId=${user?.clientId || 1}`);

    const handleSave = () => {
        updateUser(formData);
        setIsEditing(false);
    };

    const completedAgents = agents?.filter(a => a.contextProgress === 100) || [];
    const availableAgents = agents?.filter(a => a.contextProgress < 100) || [];

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: 'person' },
        { id: 'agents', label: 'Agentes', icon: 'smart_toy' },
        { id: 'history', label: 'Histórico', icon: 'history' },
        { id: 'vault', label: 'Cofre', icon: 'lock' },
        { id: 'settings', label: 'Configurações', icon: 'settings' }
    ];

    // Função para compartilhar dados no tab Cofre
    const handleNavigateFromVault = (tab: 'profile' | 'agents' | 'history' | 'vault' | 'settings') => {
        setActiveTab(tab);
    };

    return (
        <div className="space-y-8 max-w-7xl">
            {/* Header Premium */}
            <div className="relative overflow-hidden bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8">
                {/* Decoração de fundo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#38ff81]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#38ff81]/5 rounded-full blur-3xl"></div>
                
                <div className="relative flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-4xl font-bold text-white">
                                Meu Perfil
                            </h1>
                            <span className="px-3 py-1 bg-[#38ff81]/20 text-[#38ff81] rounded-full text-xs font-semibold">Premium</span>
                        </div>
                        <p className="text-neutral-400 text-lg">
                            Gerencie suas informações profissionais e dados corporativos
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-white font-semibold text-lg">{user?.name}</p>
                            <p className="text-sm text-[#38ff81]">{user?.email}</p>
                        </div>
                        <div className="relative">
                            <img
                                src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
                                alt={user?.name}
                                className="w-20 h-20 rounded-full border-4 border-[#38ff81] ring-4 ring-[#38ff81]/20"
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#38ff81] rounded-full border-4 border-black"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Premium */}
            <div className="bg-black rounded-2xl border border-neutral-800 p-1.5 shadow-lg">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl transition-all font-medium ${
                                activeTab === tab.id
                                    ? 'bg-[#38ff81] text-black shadow-lg shadow-[#38ff81]/30'
                                    : 'text-neutral-400 hover:text-[#38ff81] hover:bg-neutral-900'
                            }`}
                        >
                            <span className="material-icons-outlined text-lg">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Tab: Perfil */}
                {activeTab === 'profile' && (
                    <div className="bg-black rounded-2xl border border-neutral-800 p-8">
                        <h2 className="text-xl font-semibold text-[#38ff81] mb-6">Informações Pessoais</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Endereço</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-[#38ff81] mt-8 mb-6">Informações Corporativas</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Empresa</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                className="bg-[#38ff81] text-black px-6 py-3 rounded-xl hover:bg-[#38ff81]/80 transition-colors font-medium"
                            >
                                Salvar Alterações
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-neutral-800 text-white px-6 py-3 rounded-xl hover:bg-neutral-700 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab: Agentes */}
                {activeTab === 'agents' && (
                    <div className="space-y-6">
                        {/* Agentes Disponíveis */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Agentes Disponíveis</h2>
                                <span className="px-3 py-1 bg-[#38ff81]/20 text-[#38ff81] rounded-full text-xs font-semibold">
                                    {availableAgents.length} ativos
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableAgents.map(agent => (
                                    <div key={agent.id} className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6 hover:border-[#38ff81] hover:shadow-[0_0_30px_rgba(56,255,129,0.2)] transition-all duration-300 group">
                                        {/* Badge de status */}
                                        <div className="absolute top-4 right-4">
                                            <span className="px-3 py-1 bg-[#38ff81]/20 text-[#38ff81] text-xs font-semibold rounded-full border border-[#38ff81]/30">
                                                Ativo
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h3 className="font-bold text-white text-lg mb-2">{agent.title}</h3>
                                            <p className="text-sm text-neutral-400 leading-relaxed">{agent.description}</p>
                                        </div>
                                        
                                        {/* Progress bar premium */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-neutral-400">Progresso</span>
                                                <span className="text-sm font-semibold text-[#38ff81]">{agent.contextProgress || 0}%</span>
                                            </div>
                                            <div className="relative bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#38ff81] to-[#38ff81]/70 rounded-full shadow-lg shadow-[#38ff81]/50 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(56,255,129,0.8)]" 
                                                    style={{ width: `${agent.contextProgress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agentes Concluídos */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Agentes Concluídos</h2>
                                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                                    {completedAgents.length} finalizados
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {completedAgents.map(agent => (
                                    <div key={agent.id} className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="material-icons-outlined text-green-500 text-xl">check_circle</span>
                                                    <h3 className="font-bold text-white text-lg">{agent.title}</h3>
                                                </div>
                                                <p className="text-sm text-neutral-400">{agent.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Histórico */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                        {/* Filtros e Busca */}
                        <div className="bg-black rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar conversas..."
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#38ff81]"
                                    />
                                </div>
                                <select className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]">
                                    <option>Todos os agentes</option>
                                    <option>SCAN Diagnóstico</option>
                                    <option>Pesquisador de Mercado</option>
                                </select>
                                <select className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#38ff81]">
                                    <option>Ordenar por data</option>
                                    <option>Mais recente</option>
                                    <option>Mais antigo</option>
                                    <option>Mais mensagens</option>
                                </select>
                            </div>
                        </div>

                        {/* Lista de conversas */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Histórico de Conversas</h2>
                                <span className="px-3 py-1 bg-[#38ff81]/20 text-[#38ff81] rounded-full text-xs font-semibold">
                                    {conversations?.length || 0} conversas
                                </span>
                            </div>
                            <div className="space-y-3">
                                {conversations?.map(conv => (
                                    <div key={conv.id} className="group relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-5 hover:border-[#38ff81] hover:shadow-[0_0_30px_rgba(56,255,129,0.15)] transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-[#38ff81]/20 flex items-center justify-center">
                                                        <span className="material-icons-outlined text-[#38ff81]">chat_bubble</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-lg">{conv.title}</h3>
                                                        <p className="text-sm text-neutral-400">{conv.agentName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 ml-13">
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                        <span className="material-icons-outlined text-xs">access_time</span>
                                                        {new Date(conv.updatedAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="text-xs text-[#38ff81] flex items-center gap-1">
                                                        <span className="material-icons-outlined text-xs">message</span>
                                                        {conv.messageCount} mensagens
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#38ff81]/10 rounded-lg">
                                                <span className="material-icons-outlined text-[#38ff81]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Cofre */}
                {activeTab === 'vault' && (
                    <div className="space-y-6">
                        {/* Estatísticas do Cofre */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-[#38ff81]/20 flex items-center justify-center">
                                        <span className="material-icons-outlined text-[#38ff81] text-2xl">folder</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{documents?.length || 0}</p>
                                        <p className="text-xs text-neutral-400">Documentos</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <span className="material-icons-outlined text-blue-500 text-2xl">cloud_upload</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {documents?.reduce((acc, doc) => acc + doc.size, 0) / (1024 * 1024) || 0} MB
                                        </p>
                                        <p className="text-xs text-neutral-400">Armazenamento</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <span className="material-icons-outlined text-green-500 text-2xl">lock</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {documents?.filter(doc => !doc.isVisible).length || 0}
                                        </p>
                                        <p className="text-xs text-neutral-400">Ocultos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ações rápidas */}
                        <div className="bg-black rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-4">
                                <button className="flex-1 bg-[#38ff81] text-black px-6 py-4 rounded-xl hover:bg-[#38ff81]/80 transition-colors font-semibold flex items-center justify-center gap-2">
                                    <span className="material-icons-outlined">add</span>
                                    Novo Documento
                                </button>
                                <button className="px-6 py-4 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors flex items-center gap-2">
                                    <span className="material-icons-outlined">upload_file</span>
                                    Upload em Lote
                                </button>
                                <button className="px-6 py-4 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors flex items-center gap-2">
                                    <span className="material-icons-outlined">folder_shared</span>
                                    Compartilhar
                                </button>
                            </div>
                        </div>

                        {/* Lista de documentos premium */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Meus Documentos</h2>
                                <div className="flex items-center gap-3">
                                    <select className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm">
                                        <option>Exibir: Todos</option>
                                        <option>Visíveis</option>
                                        <option>Ocultos</option>
                                    </select>
                                    <select className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm">
                                        <option>Ordenar: Data</option>
                                        <option>Nome</option>
                                        <option>Tamanho</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {documents?.map(doc => (
                                    <div key={doc.id} className="group relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-5 hover:border-[#38ff81] hover:shadow-[0_0_30px_rgba(56,255,129,0.15)] transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-xl bg-[#38ff81]/20 flex items-center justify-center group-hover:bg-[#38ff81]/30 transition-colors">
                                                    <span className="material-icons-outlined text-[#38ff81] text-2xl">description</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-white text-lg mb-1">{doc.name}</h3>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-neutral-400">{doc.type.toUpperCase()}</span>
                                                        <span className="text-xs text-neutral-400">{(doc.size / 1024).toFixed(2)} KB</span>
                                                        <span className="text-xs text-neutral-400">
                                                            {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                                                    doc.isVisible 
                                                        ? 'bg-[#38ff81]/10 text-[#38ff81] border border-[#38ff81]/30' 
                                                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                                                }`}>
                                                    {doc.isVisible ? 'Visível' : 'Oculto'}
                                                </span>
                                                <span className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/30">
                                                    {doc.retentionDays} dias
                                                </span>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#38ff81]/10 rounded-lg">
                                                    <span className="material-icons-outlined text-[#38ff81]">more_vert</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Configurações */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Retenção de Dados */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-[#38ff81]/20 flex items-center justify-center">
                                    <span className="material-icons-outlined text-[#38ff81] text-2xl">schedule</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Retenção de Dados</h2>
                                    <p className="text-sm text-neutral-400">Configure o tempo de permanência dos seus dados</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { label: '7 dias', value: 7, icon: 'today' },
                                    { label: '30 dias', value: 30, icon: 'calendar_month' },
                                    { label: '90 dias', value: 90, icon: 'event' },
                                    { label: '1 ano', value: 365, icon: 'event_note' },
                                    { label: 'Ilimitado', value: -1, icon: 'all_inclusive' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-[#38ff81] hover:bg-[#38ff81]/5 transition-all duration-300"
                                    >
                                        <span className="material-icons-outlined text-[#38ff81] text-2xl">{option.icon}</span>
                                        <span className="text-sm font-medium text-white">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gerenciar Dados */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <span className="material-icons-outlined text-red-500 text-2xl">settings</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Gerenciar Dados</h2>
                                    <p className="text-sm text-neutral-400">Ações avançadas sobre seus dados</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button className="group w-full bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl hover:from-red-500/20 hover:to-red-500/10 hover:border-red-500/50 transition-all duration-300 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-xl">delete_forever</span>
                                        <span className="font-semibold">Apagar Todas as Conversas</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity material-icons-outlined">arrow_forward</span>
                                </button>
                                <button className="group w-full bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/30 text-orange-500 px-6 py-4 rounded-xl hover:from-orange-500/20 hover:to-orange-500/10 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-xl">visibility_off</span>
                                        <span className="font-semibold">Ocultar Todos os Documentos</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity material-icons-outlined">arrow_forward</span>
                                </button>
                                <button className="group w-full bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 text-blue-500 px-6 py-4 rounded-xl hover:from-blue-500/20 hover:to-blue-500/10 hover:border-blue-500/50 transition-all duration-300 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-xl">download</span>
                                        <span className="font-semibold">Exportar Dados (GDPR)</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity material-icons-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Privacidade e Segurança */}
                        <div className="bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <span className="material-icons-outlined text-green-500 text-2xl">lock</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Privacidade e Segurança</h2>
                                    <p className="text-sm text-neutral-400">Controle total sobre seus dados</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Compartilhar dados com agentes', description: 'Permite que agentes acessem seus dados', defaultChecked: true },
                                    { label: 'Análise de uso anônimo', description: 'Ajuda a melhorar o serviço', defaultChecked: true },
                                    { label: 'Notificações por email', description: 'Receba atualizações importantes', defaultChecked: true },
                                    { label: 'Download automático de backups', description: 'Backups periódicos dos seus dados', defaultChecked: false }
                                ].map((setting, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-[#38ff81]/50 transition-all duration-300">
                                        <div>
                                            <span className="font-medium text-white">{setting.label}</span>
                                            <p className="text-xs text-neutral-400 mt-1">{setting.description}</p>
                                        </div>
                                        <label className="relative inline-block w-12 h-6 cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={setting.defaultChecked} />
                                            <div className="w-12 h-6 bg-neutral-700 peer-checked:bg-[#38ff81] rounded-full transition-colors duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
