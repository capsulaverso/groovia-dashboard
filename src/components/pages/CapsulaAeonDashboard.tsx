import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../hooks/useApi';

interface CapsulaStatus {
  version: string;
  author: string;
  license: string;
  copyright: string;
  isActive: boolean;
  usageCount: number;
  components: string[];
}

interface Metrics {
  overview: {
    total_operations: number;
    total_compute_ms: number;
    total_energy_mj: number;
  };
  byComponent: Array<{
    component_name: string;
    operation_type: string;
    total_operations: number;
    avg_latency_ms: number;
    total_energy_mj: number;
  }>;
}

export const CapsulaAeonDashboard: React.FC = () => {
  const [status, setStatus] = useState<CapsulaStatus | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusData, metricsData] = await Promise.all([
        apiClient.get<{ capsula: CapsulaStatus }>('/capsula-aeon/status'),
        apiClient.get<Metrics>(`/capsula-aeon/metrics`),
      ]);
      setStatus(statusData.capsula);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar dados da Capsula Aeon®:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando Capsula Aeon®...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🔮</span>
                <h1 className="text-3xl font-bold text-white">
                  Capsula Aeon® Dashboard
                </h1>
              </div>
              <p className="text-gray-400">
                Sistema de Inteligência Neuromórfica Adaptativa
              </p>
              <p className="text-sm text-purple-400 mt-2">
                {status?.copyright}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Active</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                v{status?.version}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Total de Operações</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {metrics?.overview.total_operations.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Últimos {period === '1d' ? '24h' : period === '7d' ? '7 dias' : '30 dias'}
            </p>
          </div>

          <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Tempo de Computação</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {((metrics?.overview.total_compute_ms || 0) / 1000).toFixed(2)}s
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Acumulado no período
            </p>
          </div>

          <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Energia Utilizada</h3>
              <span className="text-2xl">🔋</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {(metrics?.overview.total_energy_mj || 0).toFixed(2)} mJ
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Eficiência otimizada
            </p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2">
          {['1d', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]'
              }`}
            >
              {p === '1d' ? '24 horas' : p === '7d' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              Componentes Ativos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {[
              { name: 'Neuromorphic', icon: '🧠', description: 'Spike-timing Dependent Plasticity' },
              { name: 'Reinforcement', icon: '🎯', description: 'Deep Reinforcement Learning (PPO)' },
              { name: 'AutoML', icon: '🔬', description: 'Hyperparameter Optimization' },
              { name: 'Behavior', icon: '📊', description: 'Internet of Behaviors (IoB)' },
              { name: 'Knowledge', icon: '🌐', description: 'Semantic Knowledge Graph' },
              { name: 'Dynamic Templates', icon: '📝', description: 'Adaptive Content Generation' },
            ].map((comp) => (
              <div
                key={comp.name}
                className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{comp.icon}</span>
                  <h3 className="text-lg font-semibold text-white">{comp.name}</h3>
                </div>
                <p className="text-sm text-gray-400">{comp.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* License Footer */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            🔐 Sistema licenciado exclusivamente para
          </p>
          <p className="text-white font-bold text-lg mb-1">
            Groovia Dashboard
          </p>
          <p className="text-purple-400 text-xs">
            {status?.license} • {status?.copyright}
          </p>
        </div>
      </div>
    </div>
  );
};

