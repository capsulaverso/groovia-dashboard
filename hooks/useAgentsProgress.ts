import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { useApi } from './useApi';

interface AgentProgress {
  agentId: number;
  contextProgress: number;
  act: string;
  updatedAt: string;
}

/**
 * Hook para buscar o progresso do usuário em todos os agentes
 */
export const useAgentsProgress = () => {
  const { user } = useUser();
  const [progressMap, setProgressMap] = useState<Map<number, AgentProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !user?.clientId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        
        // Buscar progresso do usuário
        const response = await fetch(`/api/users/${user.id}/progress?clientId=${user.clientId}`, {
          headers: {
            'x-user-id': String(user.id),
            'x-client-id': String(user.clientId),
            'x-session-token': user.sessionToken || '',
          }
        });

        if (response.ok) {
          const progressList: AgentProgress[] = await response.json();
          
          // Criar mapa de agentId -> progresso
          const map = new Map<number, AgentProgress>();
          progressList.forEach(progress => {
            map.set(progress.agentId, progress);
          });
          
          setProgressMap(map);
        }
      } catch (error) {
        console.error('Erro ao buscar progresso dos agentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, user?.clientId, user?.sessionToken]);

  /**
   * Retorna o progresso de um agente específico
   */
  const getAgentProgress = (agentId: number): number => {
    return progressMap.get(agentId)?.contextProgress || 0;
  };

  /**
   * Atualiza o progresso de um agente
   */
  const updateAgentProgress = async (agentId: number, contextProgress: number): Promise<boolean> => {
    if (!user?.id || !user?.clientId) return false;

    try {
      const response = await fetch(`/api/users/${user.id}/progress/${agentId}?clientId=${user.clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id),
          'x-client-id': String(user.clientId),
          'x-session-token': user.sessionToken || '',
        },
        body: JSON.stringify({ contextProgress })
      });

      if (response.ok) {
        const updated: AgentProgress = await response.json();
        
        // Atualizar mapa local
        setProgressMap(prev => {
          const newMap = new Map(prev);
          newMap.set(agentId, updated);
          return newMap;
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar progresso do agente:', error);
      return false;
    }
  };

  return {
    progressMap,
    loading,
    getAgentProgress,
    updateAgentProgress
  };
};

