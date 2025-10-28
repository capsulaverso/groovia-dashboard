import React, { useState } from 'react';
import { AGENT_CARDS_DATA } from '../../constants';

const MyAgentsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    const filteredAgents = AGENT_CARDS_DATA.filter(agent => {
        const matchesSearch = agent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.agentType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && agent.contextProgress > 0) ||
                             (filterStatus === 'completed' && agent.contextProgress === 100);
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Meus Agentes
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Acesse e gerencie todos os agentes de IA disponíveis para você
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar agentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'active'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Em Uso
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                            filterStatus === 'completed'
                                ? 'bg-primary text-white'
                                : 'bg-surface-light dark:bg-surface-dark text-on-surface-secondary-light dark:text-on-surface-secondary-dark border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        Concluídos
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, index) => (
                    <div
                        key={index}
                        className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-primary transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                                <span className="material-icons-outlined text-primary group-hover:text-white text-2xl">
                                    smart_toy
                                </span>
                            </div>
                            <span className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                {agent.act}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                            {agent.title}
                        </h3>
                        <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4 line-clamp-3">
                            {agent.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                <span className="material-icons-outlined text-sm">schedule</span>
                                <span>Última sessão: há 2 dias</span>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-icons-outlined text-primary">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                    <h3 className="text-xl font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Nenhum agente encontrado
                    </h3>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Tente ajustar os filtros ou o termo de busca
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyAgentsPage;
