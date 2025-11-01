import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import { useUser } from '../hooks/useUser';

interface UserProgressData {
  id: number;
  userId: number;
  agentId: number;
  currentStep: string;
  stepDescription: string;
  act: string;
  contextProgress: number;
}

interface AgentData {
  id: number;
  title: string;
  agentType: string;
}

const InfoItem: React.FC<{ 
  title: string; 
  description: string; 
  buttonText: string;
  progress?: number;
  onButtonClick?: () => void;
}> = ({ title, description, buttonText, progress, onButtonClick }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-surface-light to-surface-light/50 dark:from-surface-dark dark:to-surface-dark/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-all group">
            {/* Mini ícone com status */}
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-icons-outlined text-primary text-lg">pending</span>
                </div>
                {progress !== undefined && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-gray-800">
                        {progress}%
                    </div>
                )}
            </div>
            
            {/* Conteúdo compacto */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark truncate mb-0.5">
                    {title}
                </h4>
                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark truncate">
                    {description}
                </p>
            </div>
            
            {/* Botão minimalista */}
            <button 
                onClick={onButtonClick}
                className="flex-shrink-0 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold group-hover:scale-105"
            >
                {buttonText}
            </button>
        </div>
    );
};

interface RightAsideProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const RightAside: React.FC<RightAsideProps> = ({ activeView, onNavigate }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, isAdmin } = useUser();
    
    // Apenas busca dados se houver usuário logado
    const shouldFetch = user !== null;
    const { data: progressData, loading: progressLoading } = useApi<UserProgressData[]>(
        shouldFetch ? `/users/${user.id}/progress` : ''
    );
    const { data: agents } = useApi<AgentData[]>(shouldFetch ? '/agents' : '');

    const getAgentInfo = (agentId: number) => {
        return agents?.find(a => a.id === agentId);
    };

    const handleContinue = (progressItem: UserProgressData) => {
        console.log('Continuar com:', progressItem);
    };

    if (isCollapsed) {
        return (
            <aside className="w-16 p-3 hidden xl:flex items-start justify-center">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                    title="Expandir painel lateral"
                >
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400">
                        chevron_left
                    </span>
                </button>
            </aside>
        );
    }

    const MenuItem: React.FC<{ icon: string; label: string; isActive?: boolean; badge?: string; onClick?: () => void }> = ({ icon, label, isActive, badge, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${
                isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
            <span className="material-icons-outlined text-lg">{icon}</span>
            <span className="font-normal text-base flex-1">{label}</span>
            {badge && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    {badge}
                </span>
            )}
        </button>
    );

    const MenuSection: React.FC<{ title: string; children: React.ReactNode; badge?: string }> = ({ title, children, badge }) => (
        <div className="mb-4">
            <div className="flex items-center gap-2 px-4 mb-2">
                <h3 className="text-xs font-bold text-[#38ff81] dark:text-[#38ff81] uppercase tracking-wider">
                {title}
            </h3>
                {badge && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        {badge}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    return (
        <aside className="w-80 p-6 hidden xl:block">
            <div className="w-full h-full flex flex-col gap-6 sticky top-6 overflow-y-auto max-h-[calc(100vh-3rem)]">
                {progressLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : progressData && progressData.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {progressData
                            .filter(p => p.contextProgress < 100)
                            .slice(0, 3)
                            .map((progress) => {
                                const agent = getAgentInfo(progress.agentId);
                                return (
                                    <InfoItem
                                        key={progress.id}
                                        title={agent?.title || progress.currentStep}
                                        description={progress.stepDescription}
                                        buttonText={progress.contextProgress === 0 ? "Começar Agora" : "Continuar"}
                                        progress={progress.contextProgress}
                                        onButtonClick={() => handleContinue(progress)}
                                    />
                                );
                            })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 bg-black dark:bg-neutral-900 rounded-xl border border-neutral-800 dark:border-neutral-700">
                        {/* Avatar Profissional */}
                        <div className="relative mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#38ff81] to-[#38ff81]/50 flex items-center justify-center border-2 border-[#38ff81] shadow-lg shadow-[#38ff81]/30">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name || 'User'} 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="material-icons-outlined text-white text-4xl">
                                        person
                                    </span>
                                )}
                            </div>
                            {/* Badge de status online */}
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#38ff81] rounded-full border-2 border-black dark:border-neutral-900 shadow-lg">
                                <div className="w-full h-full bg-[#38ff81] rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        
                        {/* Informações do usuário */}
                        <div className="text-center">
                            <h4 className="text-white dark:text-neutral-100 font-semibold text-sm mb-1">
                                {user?.name || 'Usuário'}
                            </h4>
                            <p className="text-[#38ff81] dark:text-[#38ff81] text-xs font-medium mb-2">
                                {user?.email || 'user@groovia.com'}
                            </p>
                            <div className="inline-flex items-center gap-1 text-xs text-neutral-400">
                                <div className="w-2 h-2 bg-[#38ff81] rounded-full animate-pulse"></div>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu: Ferramentas, Administração, Sistema */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <nav className="space-y-4">
                        {/* Ferramentas */}
                        <MenuSection title="Ferramentas">
                            <MenuItem
                                icon="folder"
                                label="Meus Documentos"
                                isActive={activeView === 'documents'}
                                onClick={() => onNavigate('documents')}
                            />
                            <MenuItem
                                icon="person"
                                label="Meu Perfil"
                                isActive={activeView === 'profile'}
                                onClick={() => onNavigate('profile')}
                            />
                        </MenuSection>

                        {/* Administração */}
                        {isAdmin && (
                            <MenuSection title="Administração" badge="Admin">
                                <MenuItem
                                    icon="group"
                                    label="Usuários"
                                    isActive={activeView === 'users'}
                                    onClick={() => onNavigate('users')}
                                />
                                <MenuItem
                                    icon="settings"
                                    label="Controle de Agentes"
                                    isActive={activeView === 'agents-control'}
                                    onClick={() => onNavigate('agents-control')}
                                />
                                <MenuItem
                                    icon="assessment"
                                    label="Relatórios"
                                    isActive={activeView === 'reports'}
                                    onClick={() => onNavigate('reports')}
                                />
                            </MenuSection>
                        )}

                        {/* Sistema */}
                        <MenuSection title="Sistema">
                            <MenuItem
                                icon="description"
                                label="Documentação"
                                isActive={activeView === 'docs'}
                                onClick={() => onNavigate('docs')}
                            />
                            <MenuItem
                                icon="policy"
                                label="Privacidade"
                                isActive={activeView === 'privacy'}
                                onClick={() => onNavigate('privacy')}
                            />
                            <MenuItem
                                icon="gavel"
                                label="EULA"
                                isActive={activeView === 'eula'}
                                onClick={() => onNavigate('eula')}
                            />
                            <MenuItem
                                icon="storage"
                                label="Teste do Banco"
                                isActive={activeView === 'db-test'}
                                onClick={() => onNavigate('db-test')}
                            />
                        </MenuSection>
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default RightAside;
