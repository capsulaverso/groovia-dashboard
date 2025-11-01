import { useState, useEffect } from 'react';

export interface UserProgress {
    currentAgent: string;
    description: string;
    act: string;
    contextProgress: number;
    internalCode: string;
    agentType: string;
    lastUpdated: Date;
}

const STORAGE_KEY = 'groovia_user_progress';

const DEFAULT_PROGRESS: UserProgress = {
    currentAgent: 'Groovia Intelligence',
    description: 'Criar uma robusta e completa estratégia corporativa que seja o ponto de partida para planejamento Tático e Operacional se guiarem. Aqui é interessante o Agente trabalhar em conjunto com o cliente em uma conversa fluída.',
    act: 'Ato 02',
    contextProgress: 67,
    internalCode: 'AGT-EC-004',
    agentType: 'Agente Estratégico',
    lastUpdated: new Date()
};

export const useUserProgress = () => {
    const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar do localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setProgress({
                    ...parsed,
                    lastUpdated: new Date(parsed.lastUpdated)
                });
            }
        } catch (error) {
            console.error('Erro ao carregar progresso do usuário:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Salvar no localStorage quando mudar
    const updateProgress = (newProgress: Partial<UserProgress>) => {
        const updated = {
            ...progress,
            ...newProgress,
            lastUpdated: new Date()
        };
        setProgress(updated);
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Erro ao salvar progresso do usuário:', error);
        }
    };

    const resetProgress = () => {
        setProgress(DEFAULT_PROGRESS);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        progress,
        updateProgress,
        resetProgress,
        isLoading
    };
};
