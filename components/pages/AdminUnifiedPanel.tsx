import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AdminDashboard from '../AdminDashboard';
import UsersManagementPage from './UsersManagementPage';
import AgentsControlPage from './AgentsControlPage';
import ReportsPage from './ReportsPage';
import AgentLaboratoryPage from './AgentLaboratoryPage';
import InspectorAgentPage from './InspectorAgentPage';

type AdminPanelView = 'overview' | 'agents' | 'users' | 'reports' | 'laboratory' | 'inspector';

const AdminUnifiedPanel: React.FC = () => {
    const { user, isAdmin } = useUser();
    const [activeView, setActiveView] = useState<AdminPanelView>('overview');

    // Verificar se usuário é admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
                <Card className="border-[#FF4D4D]">
                    <div className="text-center p-8">
                        <span className="material-icons-outlined text-6xl text-[#FF4D4D] mb-4 block">lock</span>
                        <h2 className="text-2xl font-medium text-white mb-2">Acesso Negado</h2>
                        <p className="text-[#B0B0B0]">Você não tem permissão para acessar o painel administrativo.</p>
                    </div>
                </Card>
            </div>
        );
    }

    const menuItems: Array<{ id: AdminPanelView; label: string; icon: string; description: string }> = [
        { id: 'overview', label: 'Visão Geral', icon: 'dashboard', description: 'Estatísticas e resumo do sistema' },
        { id: 'agents', label: 'Controle de Agentes', icon: 'smart_toy', description: 'Gerenciar agentes de IA' },
        { id: 'users', label: 'Usuários', icon: 'people', description: 'Gestão de usuários e permissões' },
        { id: 'laboratory', label: 'Laboratório', icon: 'science', description: 'Configurar e testar agentes' },
        { id: 'inspector', label: 'Inspetor', icon: 'verified_user', description: 'Auditoria e integrações' },
        { id: 'reports', label: 'Relatórios', icon: 'assessment', description: 'Métricas e analytics' }
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex h-screen">
                {/* Sidebar do Admin */}
                <aside className="w-80 bg-[#1E1E1E] border-r border-[#2A2A2A] overflow-y-auto">
                    <div className="p-6 border-b border-[#2A2A2A]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-[#00FFB2] bg-opacity-20 rounded-lg flex items-center justify-center">
                                <span className="material-icons-outlined text-[#00FFB2] text-2xl">admin_panel_settings</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-medium text-white">Admin Panel</h1>
                                <p className="text-xs text-[#B0B0B0]">{user?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu de Navegação */}
                    <nav className="p-4 space-y-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
                                    activeView === item.id
                                        ? 'bg-[#00FFB2] bg-opacity-20 border border-[#00FFB2]'
                                        : 'bg-transparent border border-[#2A2A2A] hover:border-[#00FFB2]'
                                }`}
                            >
                                <span className={`material-icons-outlined text-2xl ${activeView === item.id ? 'text-[#00FFB2]' : 'text-[#B0B0B0]'}`}>
                                    {item.icon}
                                </span>
                                <div className="flex-1">
                                    <h3 className={`font-medium mb-1 ${activeView === item.id ? 'text-white' : 'text-[#B0B0B0]'}`}>
                                        {item.label}
                                    </h3>
                                    <p className="text-xs text-[#B0B0B0]">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Stats Rápidos */}
                    <div className="p-4 border-t border-[#2A2A2A]">
                        <h3 className="text-xs font-semibold text-[#00FFB2] uppercase mb-3">Status Rápido</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg">
                                <span className="text-sm text-[#B0B0B0]">Usuários Ativos</span>
                                <Badge variant="success" size="sm">0</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg">
                                <span className="text-sm text-[#B0B0B0]">Agentes</span>
                                <Badge variant="info" size="sm">0</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg">
                                <span className="text-sm text-[#B0B0B0]">Documentos</span>
                                <Badge variant="neutral" size="sm">0</Badge>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Área de Conteúdo */}
                <main className="flex-1 overflow-y-auto">
                    {activeView === 'overview' && (
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-3xl font-medium mb-2">Visão Geral do Sistema</h1>
                                <p className="text-[#B0B0B0]">Monitore estatísticas e atividades</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="border border-[#00FFB2]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#B0B0B0] mb-2">Total de Usuários</p>
                                            <p className="text-3xl font-medium text-[#00FFB2]">0</p>
                                        </div>
                                        <span className="material-icons-outlined text-4xl text-[#00FFB2] opacity-20">people</span>
                                    </div>
                                </Card>

                                <Card className="border border-[#007BFF]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#B0B0B0] mb-2">Agentes Ativos</p>
                                            <p className="text-3xl font-medium text-white">0</p>
                                        </div>
                                        <span className="material-icons-outlined text-4xl text-[#007BFF] opacity-20">smart_toy</span>
                                    </div>
                                </Card>

                                <Card className="border border-[#FFB200]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#B0B0B0] mb-2">Documentos</p>
                                            <p className="text-3xl font-medium text-[#FFB200]">0</p>
                                        </div>
                                        <span className="material-icons-outlined text-4xl text-[#FFB200] opacity-20">description</span>
                                    </div>
                                </Card>
                            </div>

                            <Card>
                                <h2 className="text-xl font-medium text-white mb-4">Ações Rápidas</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <Button
                                        variant="primary"
                                        icon="add"
                                        fullWidth
                                        onClick={() => setActiveView('agents')}
                                    >
                                        Criar Agente
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon="people"
                                        fullWidth
                                        onClick={() => setActiveView('users')}
                                    >
                                        Gerenciar Usuários
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        icon="science"
                                        fullWidth
                                        onClick={() => setActiveView('laboratory')}
                                    >
                                        Abrir Laboratório
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeView === 'agents' && <AgentsControlPage />}
                    {activeView === 'users' && <UsersManagementPage />}
                    {activeView === 'reports' && <ReportsPage />}
                    {activeView === 'laboratory' && <AgentLaboratoryPage />}
                    {activeView === 'inspector' && <InspectorAgentPage />}
                </main>
            </div>
        </div>
    );
};

export default AdminUnifiedPanel;

