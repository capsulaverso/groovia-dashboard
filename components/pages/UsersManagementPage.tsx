import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import useUsers from '../../hooks/useUsers';
import type { UserRole } from '../../hooks/useUser';

const UsersManagementPage: React.FC = () => {
    const { user } = useUser();
    const clientId = user?.clientId || 1;
    
    const { users, loading, error, updateUser, deleteUser } = useUsers(clientId);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleDeleteUser = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await deleteUser(id);
            } catch (error) {
                alert('Erro ao excluir usuário');
            }
        }
    };

    const handleToggleRole = async (id: number, currentRole: string) => {
        try {
            await updateUser(id, { role: currentRole === 'admin' ? 'user' : 'admin' });
        } catch (error) {
            alert('Erro ao alterar permissões');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Carregando usuários...
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
                    <p className="text-xl font-semibold">Erro ao carregar dados</p>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Gestão de Usuários
                    </h1>
                    <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Gerencie usuários e permissões do sistema
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-body text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="material-icons-outlined absolute left-3 top-3.5 text-gray-400">
                            search
                        </span>
                    </div>

                    {/* Filtro de Role */}
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-body text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Todas as permissões</option>
                            <option value="admin">Administradores</option>
                            <option value="user">Usuários</option>
                        </select>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-4 flex gap-4">
                    <div className="flex-1 bg-primary/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-primary text-2xl">people</span>
                            <div>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Total de Usuários
                                </p>
                                <p className="text-lg font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {users.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-blue-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-blue-500 text-2xl">admin_panel_settings</span>
                            <div>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Administradores
                                </p>
                                <p className="text-lg font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-green-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-green-500 text-2xl">person</span>
                            <div>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Usuários
                                </p>
                                <p className="text-lg font-bold text-on-surface-light dark:text-on-surface-dark">
                                    {users.filter(u => u.role === 'user').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Usuários */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Permissões
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Data de Cadastro
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
                                            person_off
                                        </span>
                                        <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                            Nenhum usuário encontrado
                                        </h3>
                                        <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                            {searchTerm || roleFilter !== 'all'
                                                ? 'Tente ajustar os filtros'
                                                : 'Adicione seu primeiro usuário'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || 'https://i.pravatar.cc/150?img=12'}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-medium text-on-surface-light dark:text-on-surface-dark text-body">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                                <span className="material-icons-outlined text-xs">
                                                    {user.role === 'admin' ? 'admin_panel_settings' : 'person'}
                                                </span>
                                                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleRole(user.id, user.role)}
                                                    className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold flex items-center gap-1"
                                                    title="Alterar permissões"
                                                >
                                                    <span className="material-icons-outlined text-xs">swap_horiz</span>
                                                    Alterar Role
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-semibold flex items-center gap-1"
                                                    title="Excluir usuário"
                                                >
                                                    <span className="material-icons-outlined text-xs">delete</span>
                                                    Excluir
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
        </div>
    );
};

export default UsersManagementPage;
