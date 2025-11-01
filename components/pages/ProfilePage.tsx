import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import { useAgentsProgress } from '../../hooks/useAgentsProgress';
import { apiClient } from '../../hooks/useApi';

interface AgentIntegrationStatus {
    agentId: number;
    agentName: string;
    currentStep: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    progress: number;
}

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useUser();
    const { getAgentProgress } = useAgentsProgress();
    const { data: agentsRaw } = useApi<any[]>(user?.clientId ? `/agents?clientId=${user.clientId}` : '');
    const { data: userProgress } = useApi<any[]>(user?.id && user?.clientId ? `/users/${user.id}/progress?clientId=${user.clientId}` : '');

    // Estado do formulário
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        cpf: '',
        legalName: '',
        cnpj: '',
        fiscalAddress: '',
        companyType: '',
        hashIdentifier: ''
    });

    // Carregar dados completos do usuário
    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.id) return;
            
            try {
                const fullUserData = await apiClient.get(`/users/${user.id}?clientId=${user.clientId || 1}`);
                setFormData({
                    name: fullUserData.name || '',
                    email: fullUserData.email || '',
                    phone: fullUserData.phone || '',
                    cpf: fullUserData.cpf || '',
                    legalName: fullUserData.legalName || '',
                    cnpj: fullUserData.cnpj || '',
                    fiscalAddress: fullUserData.fiscalAddress || '',
                    companyType: fullUserData.companyType || '',
                    hashIdentifier: fullUserData.hashIdentifier || ''
                });
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        };

        loadUserData();
    }, [user?.id, user?.clientId]);

    // Combinar agentes com progresso
    const agentIntegrations = useMemo(() => {
        const integrations: AgentIntegrationStatus[] = [];
        
        const getStatusFromProgress = (progress: number): 'pending' | 'in_progress' | 'completed' | 'blocked' => {
            if (progress === 0) return 'pending';
            if (progress === 100) return 'completed';
            return 'in_progress';
        };
        
        agentsRaw?.forEach(agent => {
            const progress = userProgress?.find(p => p.agentId === agent.id) || {};
            integrations.push({
                agentId: agent.id,
                agentName: agent.title,
                currentStep: progress.currentStep || 'Não iniciado',
                status: getStatusFromProgress(progress.contextProgress || 0),
                progress: progress.contextProgress || 0
            });
        });
        
        return integrations;
    }, [agentsRaw, userProgress]);

    const handleSave = async () => {
        await updateUser(formData);
        setIsEditing(false);
    };

    const handleGenerateHash = async () => {
        try {
            const newHash = await apiClient.post(`/users/${user?.id}/generate-hash?clientId=${user?.clientId || 1}`, {});
            setFormData({ ...formData, hashIdentifier: newHash.hash });
            alert('✅ Novo hash gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar hash:', error);
            alert('❌ Erro ao gerar hash');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#00FFB2';
            case 'in_progress': return '#007BFF';
            case 'blocked': return '#FF4444';
            default: return '#B0B0B0';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'in_progress': return 'Em Andamento';
            case 'blocked': return 'Bloqueado';
            default: return 'Pendente';
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-medium mb-2">Meu Perfil</h1>
                    <p className="text-[#B0B0B0]">Gerencie suas informações profissionais e dados corporativos</p>
                </div>

                {/* Grid Principal - 3 Colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Coluna 1: Avatar e Identificador Hash */}
                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="bg-[#1E1E1E] rounded-lg p-6 flex flex-col items-center">
                            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#00FFB2] mb-4">
                                <img
                                    src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-lg font-medium mb-4">{user?.name}</h2>
                            
                            {/* Identificador Hash */}
                            <div className="w-full">
                                <label className="block text-sm text-[#B0B0B0] mb-2">Identificador Hash</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.hashIdentifier}
                                        readOnly
                                        className="flex-1 bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-2 text-sm font-mono text-[#00FFB2]"
                                    />
                                    <button
                                        onClick={handleGenerateHash}
                                        className="px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0066CC] transition-colors text-sm"
                                    >
                                        <span className="material-icons-outlined text-xl">refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="w-full bg-[#00FFB2] text-black py-3 rounded-lg hover:shadow-[0_0_15px_rgba(0,255,178,0.3)] transition-all font-medium"
                            >
                                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                            </button>
                            <button
                                className="w-full bg-[#007BFF] text-white py-3 rounded-lg hover:shadow-[0_0_15px_rgba(0,123,255,0.3)] transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined">attach_file</span>
                                Vincular Documentos ao Cofre
                            </button>
                        </div>
                    </div>

                    {/* Coluna 2: Dados Pessoais */}
                    <div className="space-y-6">
                        {/* Dados Pessoais */}
                        <div className="bg-[#1E1E1E] rounded-lg p-6">
                            <h2 className="text-lg font-medium mb-6 border-b border-[#1E1E1E] pb-3">Dados Pessoais</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">Telefone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">CPF</label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 3: Dados Jurídicos */}
                    <div className="space-y-6">
                        {/* Dados Jurídicos */}
                        <div className="bg-[#1E1E1E] rounded-lg p-6">
                            <h2 className="text-lg font-medium mb-6 border-b border-[#1E1E1E] pb-3">Dados Jurídicos</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">Razão Social</label>
                                    <input
                                        type="text"
                                        value={formData.legalName}
                                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">CNPJ</label>
                                    <input
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">Tipo de Empresa</label>
                                    <select
                                        value={formData.companyType}
                                        onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)]"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="LTDA">LTDA</option>
                                        <option value="SA">S.A.</option>
                                        <option value="MEI">MEI</option>
                                        <option value="EIRELI">EIRELI</option>
                                        <option value="Individual">Individual</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">Endereço Fiscal</label>
                                    <textarea
                                        value={formData.fiscalAddress}
                                        onChange={(e) => setFormData({ ...formData, fiscalAddress: e.target.value })}
                                        disabled={!isEditing}
                                        rows={3}
                                        className="w-full bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white disabled:text-[#B0B0B0] focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)] resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status de Integração com Agentes - Full Width */}
                <div className="mt-12">
                    <div className="bg-[#1E1E1E] rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-6 border-b border-[#1E1E1E] pb-3">
                            Status de Integração com Agentes
                        </h2>

                        <div className="space-y-3">
                            {agentIntegrations.map((integration) => (
                                <div
                                    key={integration.agentId}
                                    className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#00FFB2] transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-base font-medium mb-1">{integration.agentName}</h3>
                                                <p className="text-sm text-[#B0B0B0]">{integration.currentStep}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: getStatusColor(integration.status) + '20',
                                                        color: getStatusColor(integration.status)
                                                    }}
                                                >
                                                    {getStatusLabel(integration.status)}
                                                </span>
                                                <div className="w-24">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-[#B0B0B0]">Progresso</span>
                                                        <span className="text-xs font-medium" style={{ color: getStatusColor(integration.status) }}>
                                                            {integration.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-[#1E1E1E] rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full transition-all duration-500"
                                                            style={{
                                                                width: `${integration.progress}%`,
                                                                backgroundColor: getStatusColor(integration.status)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botão Salvar (se editando) */}
                {isEditing && (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-8 py-3 bg-[#00FFB2] text-black rounded-lg hover:shadow-[0_0_20px_rgba(0,255,178,0.4)] transition-all font-medium"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
