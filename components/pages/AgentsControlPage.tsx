import React, { useState } from 'react';
import { useApi, apiClient } from '../../hooks/useApi';

interface Agent {
  id: number;
  internalCode: string;
  title: string;
  description: string;
  agentType: string;
  integrations: string[];
  isActive: boolean;
  aiModel: string;
  aiProvider: string;
  systemPrompt: string;
  fallbackPrompt: string;
  webhookUrl?: string;
  webhookEnabled: boolean;
}

interface TestResult {
  success: boolean;
  response?: string;
  error?: string;
  usedFallback?: boolean;
  cachedResponse?: boolean;
  provider: string;
  model: string;
  tokensUsed?: number;
  latencyMs: number;
}

const AgentsControlPage: React.FC = () => {
  const { data: agents, loading, refetch } = useApi<Agent[]>('/agents');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [testingAgent, setTestingAgent] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testMessage, setTestMessage] = useState('Olá! Por favor, me explique brevemente o que você faz.');

  const handleEdit = (agent: Agent) => {
    setEditingAgent({ ...agent });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAgent({
      id: 0,
      internalCode: '',
      title: '',
      description: '',
      agentType: 'Agente de Análise',
      integrations: [],
      isActive: true,
      aiModel: 'gpt-4o-mini',
      aiProvider: 'replit',
      systemPrompt: 'Você é um assistente inteligente e prestativo.',
      fallbackPrompt: 'Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.',
      webhookEnabled: false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingAgent) return;

    try {
      if (editingAgent.id === 0) {
        await apiClient.post('/agents', editingAgent);
      } else {
        await apiClient.put(`/agents/${editingAgent.id}`, editingAgent);
      }
      refetch();
      setShowModal(false);
      setEditingAgent(null);
    } catch (error) {
      alert('Erro ao salvar agente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este agente?')) return;

    try {
      await apiClient.delete(`/agents/${id}`);
      refetch();
    } catch (error) {
      alert('Erro ao deletar agente');
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      await apiClient.put(`/agents/${agent.id}`, { ...agent, isActive: !agent.isActive });
      refetch();
    } catch (error) {
      alert('Erro ao atualizar agente');
    }
  };

  const handleTest = async (agent: Agent) => {
    setTestingAgent(agent.id);
    setTestResult(null);

    try {
      const result = await apiClient.post<TestResult>('/agents/test', {
        provider: agent.aiProvider,
        model: agent.aiModel,
        systemPrompt: agent.systemPrompt,
        testMessage: testMessage,
        fallbackPrompt: agent.fallbackPrompt,
        webhookUrl: agent.webhookEnabled ? agent.webhookUrl : undefined
      });

      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Erro ao testar agente',
        provider: agent.aiProvider,
        model: agent.aiModel,
        latencyMs: 0
      });
    } finally {
      setTestingAgent(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administração de Agentes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie agentes de IA com integração OpenAI, Groq e WebHooks
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span className="material-icons-outlined">add</span>
          Criar Agente
        </button>
      </div>

      <div className="grid gap-4">
        {agents?.map((agent) => (
          <div
            key={agent.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{agent.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      agent.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {agent.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {agent.aiProvider === 'replit' ? 'Replit AI' : agent.aiProvider.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {agent.aiModel}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{agent.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                  <span className="material-icons-outlined text-lg">code</span>
                  <span>{agent.internalCode}</span>
                  {agent.webhookEnabled && agent.webhookUrl && (
                    <>
                      <span className="ml-4 material-icons-outlined text-lg">webhook</span>
                      <span>WebHook Ativo</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTest(agent)}
                  disabled={testingAgent === agent.id}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Testar Agente"
                >
                  {testingAgent === agent.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-lg">play_arrow</span>
                      Testar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleToggleActive(agent)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    agent.isActive
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {agent.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleEdit(agent)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResult && (
        <div className={`mt-6 p-6 rounded-lg border-2 ${
          testResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons-outlined">
                {testResult.success ? 'check_circle' : 'error'}
              </span>
              Resultado do Teste
            </h3>
            <button
              onClick={() => setTestResult(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Provider:</span>
              <span className="text-gray-600 dark:text-gray-400">{testResult.provider}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Modelo:</span>
              <span className="text-gray-600 dark:text-gray-400">{testResult.model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Latência:</span>
              <span className="text-gray-600 dark:text-gray-400">{testResult.latencyMs}ms</span>
            </div>
            {testResult.tokensUsed && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Tokens Usados:</span>
                <span className="text-gray-600 dark:text-gray-400">{testResult.tokensUsed}</span>
              </div>
            )}
            {testResult.cachedResponse && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="material-icons-outlined text-lg">cached</span>
                <span>Resposta do Cache</span>
              </div>
            )}
            {testResult.usedFallback && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <span className="material-icons-outlined text-lg">warning</span>
                <span>Usado Fallback (erro na comunicação)</span>
              </div>
            )}
          </div>

          {testResult.response && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{testResult.response}</p>
            </div>
          )}

          {testResult.error && (
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border border-red-300 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300 font-semibold">Erro: {testResult.error}</p>
            </div>
          )}
        </div>
      )}

      {showModal && editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAgent.id === 0 ? 'Criar' : 'Editar'} Agente
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Interno
                </label>
                <input
                  type="text"
                  value={editingAgent.internalCode}
                  onChange={(e) => setEditingAgent({ ...editingAgent, internalCode: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: SCAN_CLARITY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={editingAgent.title}
                  onChange={(e) => setEditingAgent({ ...editingAgent, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editingAgent.description}
                  onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider de IA
                  </label>
                  <select
                    value={editingAgent.aiProvider}
                    onChange={(e) => setEditingAgent({ ...editingAgent, aiProvider: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="replit">Replit AI (sem API key)</option>
                    <option value="openai">OpenAI (requer API key)</option>
                    <option value="groq">Groq (requer API key)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modelo de IA
                  </label>
                  <input
                    type="text"
                    value={editingAgent.aiModel}
                    onChange={(e) => setEditingAgent({ ...editingAgent, aiModel: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ex: gpt-4o-mini, llama-3.3-70b-versatile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt de Sistema
                </label>
                <textarea
                  value={editingAgent.systemPrompt}
                  onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Define o comportamento do agente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt de Fallback (em caso de erro)
                </label>
                <textarea
                  value={editingAgent.fallbackPrompt}
                  onChange={(e) => setEditingAgent({ ...editingAgent, fallbackPrompt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="webhookEnabled"
                    checked={editingAgent.webhookEnabled}
                    onChange={(e) => setEditingAgent({ ...editingAgent, webhookEnabled: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                  />
                  <label htmlFor="webhookEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ativar WebHook (opcional, tentado antes da IA)
                  </label>
                </div>

                {editingAgent.webhookEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL do WebHook
                    </label>
                    <input
                      type="url"
                      value={editingAgent.webhookUrl || ''}
                      onChange={(e) => setEditingAgent({ ...editingAgent, webhookUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://seu-webhook.com/endpoint"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem de Teste
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Mensagem para testar o agente"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAgent(null);
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsControlPage;
