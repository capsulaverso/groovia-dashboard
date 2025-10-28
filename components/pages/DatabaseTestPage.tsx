import React from 'react';
import useApi from '../../hooks/useApi';

interface Agent {
  id: number;
  title: string;
  description: string;
  agentType: string;
  isActive: boolean;
}

export const DatabaseTestPage: React.FC = () => {
  const { data: agents, loading, error } = useApi<Agent[]>('/agents');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">Erro ao carregar dados</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Teste de Conexão com Banco de Dados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ✅ Conectado com sucesso ao PostgreSQL!
        </p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Agentes no Banco de Dados ({agents?.length || 0})
        </h2>
        
        <div className="space-y-4">
          {agents?.map((agent) => (
            <div
              key={agent.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {agent.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {agent.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {agent.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <span className="material-icons-outlined text-sm">category</span>
                <span>{agent.agentType}</span>
                <span className="ml-2">ID: {agent.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
          📊 Status da Conexão
        </h3>
        <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
          <li>✅ Banco de dados PostgreSQL conectado</li>
          <li>✅ API REST funcionando na porta 3001</li>
          <li>✅ {agents?.length || 0} agentes carregados do banco</li>
          <li>✅ Frontend conectado à API</li>
        </ul>
      </div>
    </div>
  );
};
