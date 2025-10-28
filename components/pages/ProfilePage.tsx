import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleSave = () => {
        updateUser(formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Meu Perfil
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Gerencie suas informações pessoais e preferências
                </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                        <img
                            src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
                            alt={user?.name}
                            className="w-24 h-24 rounded-full border-4 border-primary shadow-lg"
                        />
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
                            <span className="material-icons-outlined text-sm">edit</span>
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-1">
                            {user?.name}
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-2">
                            {user?.email}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                            <span className="material-icons-outlined text-sm">
                                {user?.role === 'admin' ? 'admin_panel_settings' : 'person'}
                            </span>
                            {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Nome Completo
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ) : (
                            <p className="text-on-surface-light dark:text-on-surface-dark">{user?.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Email
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ) : (
                            <p className="text-on-surface-light dark:text-on-surface-dark">{user?.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Membro desde
                        </label>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            }) : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-primary/30"
                            >
                                <span className="material-icons-outlined">check</span>
                                <span className="font-medium">Salvar</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ name: user?.name || '', email: user?.email || '' });
                                }}
                                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="material-icons-outlined">close</span>
                                <span className="font-medium">Cancelar</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-primary/30"
                        >
                            <span className="material-icons-outlined">edit</span>
                            <span className="font-medium">Editar Perfil</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                    Segurança
                </h3>
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-primary">lock</span>
                            <div>
                                <div className="font-medium text-on-surface-light dark:text-on-surface-dark">
                                    Alterar Senha
                                </div>
                                <div className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Última alteração há 45 dias
                                </div>
                            </div>
                        </div>
                        <span className="material-icons-outlined text-gray-400">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-primary">verified_user</span>
                            <div>
                                <div className="font-medium text-on-surface-light dark:text-on-surface-dark">
                                    Autenticação em Dois Fatores
                                </div>
                                <div className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Adicione uma camada extra de segurança
                                </div>
                            </div>
                        </div>
                        <span className="material-icons-outlined text-gray-400">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
