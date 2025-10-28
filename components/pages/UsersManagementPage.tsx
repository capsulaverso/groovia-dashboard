import React, { useState } from 'react';
import type { User, UserRole } from '../../hooks/useUser';

const UsersManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            name: 'João Silva',
            email: 'joao.silva@groovia.com',
            role: 'admin',
            avatar: 'https://i.pravatar.cc/150?img=12',
            createdAt: '2025-01-15',
        },
        {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com',
            role: 'user',
            avatar: 'https://i.pravatar.cc/150?img=5',
            createdAt: '2025-02-20',
        },
        {
            id: '3',
            name: 'Pedro Oliveira',
            email: 'pedro.oliveira@startup.com',
            role: 'user',
            avatar: 'https://i.pravatar.cc/150?img=8',
            createdAt: '2025-03-10',
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleDeleteUser = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            setUsers(users => users.filter(u => u.id !== id));
        }
    };

    const handleToggleRole = (id: string) => {
        setUsers(users => users.map(u => 
            u.id === id ? { ...u, role: u.role === 'admin' ? 'user' as UserRole : 'admin' as UserRole } : u
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Gerenciamento de Usuários
                    </h1>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Gerencie permissões e acesso dos usuários
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-primary/30">
                    <span className="material-icons-outlined">person_add</span>
                    <span className="font-medium">Novo Usuário</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm">
                            Total de Usuários
                        </span>
                        <span className="material-icons-outlined text-primary">group</span>
                    </div>
                    <div className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark">
                        {users.length}
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm">
                            Administradores
                        </span>
                        <span className="material-icons-outlined text-purple-600">admin_panel_settings</span>
                    </div>
                    <div className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark">
                        {users.filter(u => u.role === 'admin').length}
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-sm">
                            Usuários Padrão
                        </span>
                        <span className="material-icons-outlined text-blue-600">person</span>
                    </div>
                    <div className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark">
                        {users.filter(u => u.role === 'user').length}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setRoleFilter('all')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            roleFilter === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setRoleFilter('admin')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            roleFilter === 'admin'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Admins
                    </button>
                    <button
                        onClick={() => setRoleFilter('user')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            roleFilter === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Usuários
                    </button>
                </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Perfil
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Membro desde
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full border-2 border-primary"
                                            />
                                            <div className="font-medium text-on-surface-light dark:text-on-surface-dark">
                                                {user.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleRole(user.id)}
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            }`}
                                        >
                                            <span className="material-icons-outlined text-sm">
                                                {user.role === 'admin' ? 'admin_panel_settings' : 'person'}
                                            </span>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Excluir"
                                            >
                                                <span className="material-icons-outlined text-red-600 dark:text-red-400">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersManagementPage;
