import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../hooks/useUser';

const GrooviaLogo: React.FC = () => (
    <h1 className="text-on-surface-light dark:text-on-surface-dark text-2xl font-bold">
        Groovia
    </h1>
);

const ThemeSelector: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
            {theme === 'light' ? (
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">dark_mode</span>
            ) : (
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">light_mode</span>
            )}
        </button>
    );
};

interface MenuItemProps {
    icon: string;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        <span className="material-icons-outlined text-lg">{icon}</span>
        <span className="font-normal text-xs flex-1 text-left">{label}</span>
        {badge && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                {badge}
            </span>
        )}
    </button>
);

interface MenuSectionProps {
    title: string;
    children: React.ReactNode;
    isCollapsible?: boolean;
    defaultCollapsed?: boolean;
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, children, isCollapsible = false, defaultCollapsed = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className="mb-6">
            <div 
                className={`flex items-center justify-between px-4 mb-3 ${isCollapsible ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => isCollapsible && setIsCollapsed(!isCollapsed)}
            >
                <h3 className="text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                    {title}
                </h3>
                {isCollapsible && (
                    <span className="material-icons-outlined text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                        expand_more
                    </span>
                )}
            </div>
            {!isCollapsed && (
                <div className="space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
};

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
    const { isAdmin } = useUser();

    return (
        <aside className="w-80 p-6 hidden lg:block">
            <div className="bg-surface-light dark:bg-surface-dark w-full h-full rounded-2xl flex flex-col p-6 sticky top-6 max-h-[calc(100vh-3rem)]">
                <div className="flex items-center justify-between mb-8">
                    <GrooviaLogo />
                    <ThemeSelector />
                </div>

                <nav className="flex-1 overflow-y-auto">
                    {/* MENU PRINCIPAL - NOVOS ITENS */}
                    <MenuSection title="Navegação">
                        <MenuItem
                            icon="home"
                            label="Início"
                            isActive={activeView === 'home'}
                            onClick={() => onNavigate('home')}
                        />
                        <MenuItem
                            icon="business"
                            label="Empresa"
                            isActive={activeView === 'company'}
                            onClick={() => onNavigate('company')}
                        />
                        <MenuItem
                            icon="flag"
                            label="Estratégia"
                            isActive={activeView === 'strategy'}
                            onClick={() => onNavigate('strategy')}
                        />
                        <MenuItem
                            icon="track_changes"
                            label="Tático"
                            isActive={activeView === 'tactical'}
                            onClick={() => onNavigate('tactical')}
                        />
                        <MenuItem
                            icon="campaign"
                            label="Marketing"
                            isActive={activeView === 'marketing'}
                            onClick={() => onNavigate('marketing')}
                        />
                        <MenuItem
                            icon="shopping_cart"
                            label="Vendas"
                            isActive={activeView === 'sales'}
                            onClick={() => onNavigate('sales')}
                        />
                        <MenuItem
                            icon="support"
                            label="Atendimento"
                            isActive={activeView === 'support'}
                            onClick={() => onNavigate('support')}
                        />
                    </MenuSection>

                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
