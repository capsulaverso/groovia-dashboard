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
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="material-icons-outlined text-green-500 mt-0.5">info</span>
            <div className="flex-1">
                <h4 className="font-medium text-on-surface-light dark:text-on-surface-dark mb-1">{title}</h4>
                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-2">
                    {description}
                </p>
                {progress !== undefined && (
                    <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                            <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
                <button 
                    onClick={onButtonClick}
                    className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors w-full"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

const RightAside: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useUser();
    
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

    return (
        <aside className="w-80 p-6 hidden xl:block">
            <div className="w-full h-full flex flex-col gap-4 sticky top-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                        Tarefas Pendentes
                    </h3>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Recolher painel lateral"
                    >
                        <span className="material-icons-outlined text-gray-600 dark:text-gray-400 text-xl">
                            chevron_right
                        </span>
                    </button>
                </div>

                {progressLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : progressData && progressData.length > 0 ? (
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
                        {progressData
                            .filter(p => p.contextProgress < 100)
                            .slice(0, 4)
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-icons-outlined text-gray-400 dark:text-gray-600 text-5xl mb-3">
                            task_alt
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Nenhuma tarefa pendente
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            Todas as atividades foram concluídas!
                        </p>
                    </div>
                )}

                {!progressLoading && progressData && progressData.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                            {progressData.filter(p => p.contextProgress === 100).length} de {progressData.length} tarefas concluídas
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default RightAside;
