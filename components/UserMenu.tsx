import React, { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
    userName?: string;
    userEmail?: string;
    avatarUrl?: string;
    onAdminClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
    userName = 'Usuário',
    userEmail = 'usuario@groovia.com',
    avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHehMaLwX5FDrppcqyfR8_WZ2Nh2sVdULdI2FxynCOHtkFjBCyNyqmKL77GMdcwtwovu7pGDDrvazKcqQY7LDSZRLGAr1fZzOckKhk0vHc3uSdVv3ENWda0G02NwtxD_0HlT0cklB0TOypj8Y8XMxiGNjUFgj-VnVxdpMRK4dQ1Qu1Nah36Qn5uCs4748X1evhK_jvpHUcb7ap4R2EdfN92zKp2p_PPRIJ2A5npIg7nGwkjAl80YD0iEc0J62Jvvz597HjREDWqDHZ',
    onAdminClick
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMenuItemClick = (action: string) => {
        console.log(`Ação: ${action}`);
        setIsOpen(false);
        
        switch (action) {
            case 'admin':
                if (onAdminClick) {
                    onAdminClick();
                }
                break;
            case 'documentos':
                alert('Abrindo Documentos...');
                break;
            case 'configuracao':
                alert('Abrindo Configurações...');
                break;
            case 'sair':
                if (confirm('Deseja realmente sair?')) {
                    alert('Saindo...');
                }
                break;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar - Botão */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all hover:ring-2 hover:ring-primary/30"
            >
                <img
                    alt="Avatar do usuário"
                    className="w-10 h-10 rounded-full cursor-pointer"
                    src={avatarUrl}
                />
                {/* Indicador de menu aberto */}
                {isOpen && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white dark:border-gray-900 rounded-full" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
                    {/* Header do Menu com Info do Usuário */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-purple-600/10 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <img
                                alt="Avatar"
                                className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800"
                                src={avatarUrl}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark truncate">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* Administração (Admin Only) */}
                        {onAdminClick && (
                            <>
                                <button
                                    onClick={() => handleMenuItemClick('admin')}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                                >
                                    <span className="material-icons-outlined text-primary text-xl">admin_panel_settings</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                                            Administração
                                        </p>
                                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                            Gerenciar agentes e integrações
                                        </p>
                                    </div>
                                    <span className="material-icons-outlined text-gray-400 text-sm">
                                        chevron_right
                                    </span>
                                </button>
                                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                            </>
                        )}

                        {/* Documentos */}
                        <button
                            onClick={() => handleMenuItemClick('documentos')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <span className="material-icons-outlined text-primary text-xl">folder_open</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                                    Documentos
                                </p>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Gerencie seus arquivos
                                </p>
                            </div>
                            <span className="material-icons-outlined text-gray-400 text-sm">
                                chevron_right
                            </span>
                        </button>

                        {/* Configuração */}
                        <button
                            onClick={() => handleMenuItemClick('configuracao')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <span className="material-icons-outlined text-primary text-xl">settings</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                                    Configuração
                                </p>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Preferências e conta
                                </p>
                            </div>
                            <span className="material-icons-outlined text-gray-400 text-sm">
                                chevron_right
                            </span>
                        </button>

                        {/* Separador */}
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                        {/* Sair */}
                        <button
                            onClick={() => handleMenuItemClick('sair')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
                        >
                            <span className="material-icons-outlined text-red-600 text-xl">logout</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-600 dark:text-red-500">
                                    Sair
                                </p>
                                <p className="text-xs text-red-500/70">
                                    Encerrar sessão
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
