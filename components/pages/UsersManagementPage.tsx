import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi, apiClient } from '../../hooks/useApi';
import UserHistoryPage from './UserHistoryPage';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    cpf?: string;
    cnpj?: string;
    isActive: boolean;
    slug: string;
    createdAt: string;
}

interface UsersManagementPageProps {
    onNavigate?: (view: string) => void;
}

const UsersManagementPage: React.FC<UsersManagementPageProps> = ({ onNavigate }) => {
    const { user: currentUser } = useUser();
    const { data: usersRaw, loading } = useApi<any[]>(`/users?clientId=${currentUser?.clientId || 1}`);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingHistory, setViewingHistory] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        cpf: '',
        cnpj: '',
        userType: 'physical',
        isActive: true
    });

    // Carregar e formatar usuários
    useEffect(() => {
        if (usersRaw) {
            const formatted = usersRaw.map((u: any) => ({
                id: u.id,
                name: u.name || 'Sem nome',
                email: u.email,
                role: u.role || 'user',
                phone: u.phone || '-',
                cpf: u.cpf || '-',
                cnpj: u.cnpj || '-',
                isActive: true, // Assumir ativo se não houver flag
                slug: u.slug || generateSlug(u.name, u.id),
                createdAt: u.createdAt || new Date().toISOString()
            }));
            setUsers(formatted);
        }
    }, [usersRaw]);

    const generateSlug = (name: string, id: number): string => {
        const nameSlug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        return `${nameSlug}-${id}`;
    };

    // Filtrar usuários
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && user.isActive) ||
                            (filterStatus === 'inactive' && !user.isActive);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesStatus && matchesRole;
    });

    // Obter roles únicos
    const uniqueRoles = Array.from(new Set(users.map(u => u.role)));

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            cpf: user.cpf || '',
            cnpj: user.cnpj || '',
            userType: user.cnpj ? 'legal' : 'physical',
            isActive: user.isActive
        });
        setShowAddModal(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'user',
            cpf: '',
            cnpj: '',
            userType: 'physical',
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingUser) {
                // Atualizar
                await apiClient.put(`/users/${editingUser.id}?clientId=${currentUser?.clientId || 1}`, formData);
            } else {
                // Criar
                await apiClient.post(`/users?clientId=${currentUser?.clientId || 1}`, formData);
            }
            setShowAddModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert('Erro ao salvar usuário');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await apiClient.delete(`/users/${id}?clientId=${currentUser?.clientId || 1}`);
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário');
            }
        }
    };

    const handleViewHistory = (slug: string) => {
        setViewingHistory(slug);
    };

    const handleCloseHistory = () => {
        setViewingHistory(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00FFB2] mx-auto"></div>
                    <p className="mt-4 text-[#B0B0B0]">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    // Se estiver visualizando histórico, renderizar página de histórico
    if (viewingHistory) {
        return <UserHistoryPage slug={viewingHistory} onClose={handleCloseHistory} />;
    }

    return (
        <>
            <div className="min-h-screen bg-[#0F0F0F] text-white p-4 lg:p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 lg:mb-12">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-medium mb-2">Usuários da Plataforma</h1>
                                <p className="text-sm lg:text-base text-[#B0B0B0]">Gerencie usuários, permissões e histórico de atividades</p>
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="w-full lg:w-auto px-6 py-3 bg-[#00FFB2] text-black rounded-lg font-medium hover:bg-[#00E6A0] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined">add</span>
                                <span className="hidden sm:inline">Adicionar Novo Usuário</span>
                                <span className="sm:hidden">Novo Usuário</span>
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-[#1E1E1E] rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Busca */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Buscar</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nome ou e-mail..."
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm lg:text-base text-white focus:outline-none focus:border-[#00FFB2]"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm lg:text-base text-white focus:outline-none focus:border-[#00FFB2]"
                                >
                                    <option value="all">Todos</option>
                                    <option value="active">Ativos</option>
                                    <option value="inactive">Inativos</option>
                                </select>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Cargo/Função</label>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm lg:text-base text-white focus:outline-none focus:border-[#00FFB2]"
                                >
                                    <option value="all">Todos</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Usuários - Desktop Table */}
                    <div className="hidden lg:block bg-[#1E1E1E] rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#0F0F0F] border-b border-[#2A2A2A]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[#B0B0B0]">Nome Completo</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[#B0B0B0]">E-mail</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[#B0B0B0]">Cargo/Função</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[#B0B0B0]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-[#B0B0B0]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[#B0B0B0]">
                                                Nenhum usuário encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-[#2A2A2A] hover:bg-[#0F0F0F] transition-colors">
                                                <td className="px-6 py-4 text-white">{user.name}</td>
                                                <td className="px-6 py-4 text-[#B0B0B0]">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-[#007BFF] bg-opacity-10 text-[#007BFF] rounded-full text-xs font-medium">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.isActive 
                                                            ? 'bg-[#00FFB2] bg-opacity-10 text-[#00FFB2]' 
                                                            : 'bg-red-500 bg-opacity-10 text-red-500'
                                                    }`}>
                                                        {user.isActive ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="p-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056CC] transition-colors"
                                                            title="Editar"
                                                        >
                                                            <span className="material-icons-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewHistory(user.slug)}
                                                            className="p-2 bg-[#00FFB2] text-black rounded-lg hover:bg-[#00E6A0] transition-colors"
                                                            title="Visualizar Histórico"
                                                        >
                                                            <span className="material-icons-outlined text-lg">history</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-2 bg-[#FF4D4D] text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <span className="material-icons-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Grid de Usuários - Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {filteredUsers.length === 0 ? (
                            <div className="bg-[#1E1E1E] rounded-lg p-12 text-center">
                                <span className="material-icons-outlined text-5xl text-[#B0B0B0] mb-4 block">person_off</span>
                                <p className="text-[#B0B0B0]">Nenhum usuário encontrado</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div key={user.id} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#00FFB2] transition-all">
                                    {/* Nome e Status */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-base font-medium text-white mb-1">{user.name}</h3>
                                            <p className="text-sm text-[#B0B0B0]">{user.email}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            user.isActive 
                                                ? 'bg-[#00FFB2] bg-opacity-10 text-[#00FFB2]' 
                                                : 'bg-red-500 bg-opacity-10 text-red-500'
                                        }`}>
                                            {user.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>

                                    {/* Cargo */}
                                    <div className="mb-4">
                                        <span className="px-3 py-1 bg-[#007BFF] bg-opacity-10 text-[#007BFF] rounded-full text-xs font-medium">
                                            {user.role}
                                        </span>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="flex-1 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056CC] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-lg">edit</span>
                                            <span className="text-sm">Editar</span>
                                        </button>
                                        <button
                                            onClick={() => handleViewHistory(user.slug)}
                                            className="flex-1 py-2 bg-[#00FFB2] text-black rounded-lg hover:bg-[#00E6A0] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-lg">history</span>
                                            <span className="text-sm">Histórico</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="flex-1 py-2 bg-[#FF4D4D] text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-lg">delete</span>
                                            <span className="text-sm">Excluir</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Editar/Criar */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <div
                        className="bg-[#1E1E1E] rounded-lg p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl lg:text-2xl font-medium text-white mb-6">
                            {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                        </h2>

                        <div className="space-y-6">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Nome Completo *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">E-mail *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                    required
                                />
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                />
                            </div>

                            {/* Tipo de Usuário */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Tipo de Usuário</label>
                                <select
                                    value={formData.userType}
                                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                >
                                    <option value="physical">Pessoa Física</option>
                                    <option value="legal">Pessoa Jurídica</option>
                                </select>
                            </div>

                            {/* CPF ou CNPJ */}
                            {formData.userType === 'physical' ? (
                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">CPF</label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-[#B0B0B0] mb-2">CNPJ</label>
                                    <input
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                    />
                                </div>
                            )}

                            {/* Cargo/Função */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Cargo/Função *</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFB2]"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-[#2A2A2A] bg-[#0F0F0F] text-[#00FFB2] focus:ring-0"
                                    />
                                    <span className="text-sm text-[#B0B0B0]">Usuário Ativo</span>
                                </label>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 bg-[#1E1E1E] text-white rounded-lg font-medium hover:bg-[#2A2A2A] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-[#00FFB2] text-black rounded-lg font-medium hover:bg-[#00E6A0] transition-all"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UsersManagementPage;

