import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../hooks/useApi';
import PremiumChat from '../../../components/PremiumChat';

interface Agent {
  id: number;
  internalCode: string;
  title: string;
  description: string;
  agentType: string;
  act: string;
  isActive: boolean;
  metadata?: {
    order?: number;
    autoStart?: boolean;
    dependsOn?: string | null;
    capabilities?: string[];
    tags?: string[];
  };
}

interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  completedAgents: string[];
  activeAgent: string | null;
}

export const IntelligentWorkflowPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<WorkflowProgress>({
    currentStep: 0,
    totalSteps: 5,
    completedAgents: [],
    activeAgent: null,
  });
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const allAgents = await apiClient.get<Agent[]>('/agents');
      
      // Filtrar apenas os 5 agentes do Ato 1
      const intelligentAgents = allAgents
        .filter((agent) => agent.act === 'Ato 01')
        .sort((a, b) => (a.metadata?.order || 0) - (b.metadata?.order || 0));

      setAgents(intelligentAgents);
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowChat(true);
    setProgress((prev) => ({
      ...prev,
      activeAgent: agent.internalCode,
    }));
  };

  const getAgentIcon = (order: number) => {
    const icons = ['🎯', '🔍', '📊', '👤', '🔮'];
    return icons[order - 1] || '🤖';
  };

  const getStepStatus = (agent: Agent): 'pending' | 'active' | 'completed' => {
    if (progress.completedAgents.includes(agent.internalCode)) {
      return 'completed';
    }
    if (progress.activeAgent === agent.internalCode) {
      return 'active';
    }
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando workflow inteligente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🚀</span>
                <h1 className="text-3xl font-bold text-white">
                  Workflow Inteligente - Ato 1
                </h1>
              </div>
              <p className="text-gray-400">
                Sistema de Diagnóstico Estratégico Guiado por IA
              </p>
              <p className="text-sm text-blue-400 mt-2">
                Powered by Capsula Aeon® • Groovia Intelligence
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progresso</div>
              <div className="text-4xl font-bold text-white">
                {progress.currentStep}/{progress.totalSteps}
              </div>
              <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(progress.currentStep / progress.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {agents.map((agent, index) => {
            const status = getStepStatus(agent);
            const order = agent.metadata?.order || index + 1;
            const icon = getAgentIcon(order);
            const isDisabled = status === 'pending' && agent.metadata?.dependsOn && 
              !progress.completedAgents.includes(agent.metadata.dependsOn);

            return (
              <div
                key={agent.id}
                className={`relative bg-[#2a2a2a] border rounded-2xl overflow-hidden transition-all ${
                  status === 'active'
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : status === 'completed'
                    ? 'border-green-500/50'
                    : 'border-gray-700'
                }`}
              >
                {/* Step Number Badge */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a1a] border-4 border-[#1a1a1a] flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      status === 'completed'
                        ? 'bg-green-500'
                        : status === 'active'
                        ? 'bg-purple-500 animate-pulse'
                        : 'bg-gray-600'
                    }`}
                  >
                    {status === 'completed' ? '✓' : order}
                  </div>
                </div>

                <div className="p-6 pl-12">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">{agent.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                              {agent.agentType}
                            </span>
                            <span className="text-xs text-gray-500">
                              {agent.internalCode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm ml-12">
                        {agent.description}
                      </p>

                      {/* Capabilities */}
                      {agent.metadata?.capabilities && (
                        <div className="flex flex-wrap gap-2 mt-3 ml-12">
                          {agent.metadata.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dependency Info */}
                      {agent.metadata?.dependsOn && (
                        <div className="mt-3 ml-12 text-xs text-gray-500">
                          ⚠️ Requer conclusão de: {agent.metadata.dependsOn}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="ml-4">
                      {status === 'completed' ? (
                        <button
                          onClick={() => handleStartAgent(agent)}
                          className="px-6 py-3 bg-green-500/20 text-green-300 rounded-xl font-medium hover:bg-green-500/30 transition flex items-center gap-2"
                        >
                          <span className="material-icons-outlined text-sm">visibility</span>
                          Ver Resultado
                        </button>
                      ) : status === 'active' ? (
                        <button
                          onClick={() => handleStartAgent(agent)}
                          className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition flex items-center gap-2 animate-pulse"
                        >
                          <span className="material-icons-outlined text-sm">play_arrow</span>
                          Continuar
                        </button>
                      ) : (
                        <button
                          onClick={() => !isDisabled && handleStartAgent(agent)}
                          disabled={isDisabled}
                          className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                            isDisabled
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          <span className="material-icons-outlined text-sm">
                            {isDisabled ? 'lock' : 'play_arrow'}
                          </span>
                          {isDisabled ? 'Bloqueado' : 'Iniciar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Line */}
                {index < agents.length - 1 && (
                  <div className="absolute -bottom-6 left-6 w-0.5 h-6 bg-gray-700" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚡</span>
            <h4 className="text-lg font-semibold text-white">Sequencial</h4>
          </div>
          <p className="text-sm text-gray-400">
            Os agentes trabalham em sequência, cada um utilizando o output do anterior para
            criar análises cada vez mais profundas.
          </p>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🧠</span>
            <h4 className="text-lg font-semibold text-white">IA Avançada</h4>
          </div>
          <p className="text-sm text-gray-400">
            Powered by Capsula Aeon®, utilizando modelos GPT-4 com prompts especializados
            para cada tipo de análise estratégica.
          </p>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📄</span>
            <h4 className="text-lg font-semibold text-white">Documento Final</h4>
          </div>
          <p className="text-sm text-gray-400">
            Ao final, você recebe o Groovia Intelligence Report: documento estratégico
            completo pronto para validação e execução.
          </p>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedAgent && showChat && (
        <PremiumChat
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          agentTitle={selectedAgent.title}
          agentDescription={selectedAgent.description}
          agentType={selectedAgent.agentType}
          internalCode={selectedAgent.internalCode}
          agentId={selectedAgent.id}
        />
      )}
    </div>
  );
};

