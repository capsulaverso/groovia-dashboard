import React from 'react';

const ReportsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Relatórios
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Análises e métricas da plataforma
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-icons-outlined text-4xl">trending_up</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">1.234</div>
                    <div className="text-sm opacity-90">Conversas Totais</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-icons-outlined text-4xl">smart_toy</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+8%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">47</div>
                    <div className="text-sm opacity-90">Agentes Ativos</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-icons-outlined text-4xl">group</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+24%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">156</div>
                    <div className="text-sm opacity-90">Usuários Ativos</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <span className="material-icons-outlined text-4xl">folder</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+31%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">3.8 GB</div>
                    <div className="text-sm opacity-90">Documentos Armazenados</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-6">
                        Agentes Mais Utilizados
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'SCAN CLARITY', usage: 234, percent: 85 },
                            { name: 'Market Research', usage: 189, percent: 68 },
                            { name: 'Persona Creation', usage: 156, percent: 56 },
                            { name: 'Brand Strategy', usage: 123, percent: 44 },
                            { name: 'Innovation Strategy', usage: 98, percent: 35 },
                        ].map((agent, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                                        {agent.name}
                                    </span>
                                    <span className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {agent.usage} sessões
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${agent.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-6">
                        Atividade por Hora
                    </h3>
                    <div className="space-y-3">
                        {[
                            { hour: '00:00 - 06:00', activity: 12, color: 'bg-blue-200 dark:bg-blue-800' },
                            { hour: '06:00 - 12:00', activity: 45, color: 'bg-green-200 dark:bg-green-800' },
                            { hour: '12:00 - 18:00', activity: 78, color: 'bg-purple-200 dark:bg-purple-800' },
                            { hour: '18:00 - 24:00', activity: 56, color: 'bg-orange-200 dark:bg-orange-800' },
                        ].map((period, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-32 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    {period.hour}
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden flex items-center">
                                    <div
                                        className={`${period.color} h-full flex items-center justify-end pr-3 transition-all duration-500`}
                                        style={{ width: `${period.activity}%` }}
                                    >
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {period.activity}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark">
                        Sessões Recentes
                    </h3>
                    <button className="flex items-center gap-2 text-primary hover:text-purple-700 font-medium text-sm">
                        <span>Exportar CSV</span>
                        <span className="material-icons-outlined text-sm">download</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Usuário
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Agente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Duração
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                    Data
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[
                                { user: 'Maria Santos', agent: 'SCAN CLARITY', duration: '45 min', date: 'Há 2 horas' },
                                { user: 'Pedro Oliveira', agent: 'Market Research', duration: '32 min', date: 'Há 4 horas' },
                                { user: 'Ana Costa', agent: 'Persona Creation', duration: '28 min', date: 'Há 6 horas' },
                                { user: 'Carlos Lima', agent: 'Brand Strategy', duration: '51 min', date: 'Há 8 horas' },
                            ].map((session, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-4 text-sm text-on-surface-light dark:text-on-surface-dark">
                                        {session.user}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {session.agent}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {session.duration}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {session.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
