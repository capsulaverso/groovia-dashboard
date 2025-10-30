import React, { useEffect, useMemo, useState } from 'react';
import type { Integration } from '../types';
import { apiClient } from '../hooks/useApi';

interface GovernanceStatus {
    audits: number;
    alerts: number;
    logs: number;
}

interface RiskIndicators {
    openVulnerabilities: number;
    recentIncidents: number;
    slaBreaches: number;
}

type SecurityBadge = 'verified' | 'alert' | 'critical';

interface GovernanceOverview {
    securityPolicies: string[];
    governanceStatus: GovernanceStatus;
    riskIndicators: RiskIndicators;
    securityBadge: SecurityBadge;
    updatedAt: string;
}

interface GovernanceSecurityPanelProps {
    clientId: number;
    integrations?: Integration[];
    onAdminClick?: () => void;
}

const BADGE_STYLES: Record<SecurityBadge, { label: string; className: string; icon: string }> = {
    verified: {
        label: 'Verificado',
        className: 'bg-[#00FF7F]/15 text-[#00FF7F] border border-[#00FF7F]/40',
        icon: 'verified_user',
    },
    alert: {
        label: 'Alerta',
        className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
        icon: 'warning_amber',
    },
    critical: {
        label: 'Crítico',
        className: 'bg-red-500/15 text-red-400 border border-red-500/30',
        icon: 'dangerous',
    },
};

const REFRESH_INTERVAL = 15000; // 15 segundos

const GovernanceSecurityPanel: React.FC<GovernanceSecurityPanelProps> = ({ clientId, integrations = [], onAdminClick }) => {
    const [data, setData] = useState<GovernanceOverview | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDetail, setActiveDetail] = useState<'policies' | 'governance' | 'risk' | null>(null);

    useEffect(() => {
        if (!clientId) {
            return;
        }

        let isMounted = true;

        const fetchOverview = async () => {
            try {
                const response = await apiClient.get<GovernanceOverview>(`/security/overview?clientId=${clientId}`);
                if (isMounted) {
                    setData(response);
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                if (!isMounted) return;
                const message = err instanceof Error ? err.message : 'Não foi possível carregar os dados de governança.';
                setError(message);
                setLoading(false);
            }
        };

        fetchOverview();
        const interval = window.setInterval(fetchOverview, REFRESH_INTERVAL);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, [clientId]);

    const detailContent = useMemo(() => {
        if (!data || !activeDetail) {
            return null;
        }

        switch (activeDetail) {
            case 'policies':
                return (
                    <ul className="space-y-1 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        {data.securityPolicies.map((policy, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="material-icons-outlined text-xs mt-0.5 text-[#00FF7F]">task_alt</span>
                                <span>{policy}</span>
                            </li>
                        ))}
                    </ul>
                );
            case 'governance':
                return (
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Auditorias realizadas</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.audits}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Alertas ativos</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.alerts}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Logs nas últimas 24h</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.logs}</p>
                        </div>
                    </div>
                );
            case 'risk':
                return (
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Vulnerabilidades abertas</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.openVulnerabilities}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Incidentes recentes</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.recentIncidents}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">SLA de segurança</p>
                            <p className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.slaBreaches}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }, [activeDetail, data]);

    if (loading && !data) {
        return (
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {[0, 1, 2].map((skeleton) => (
                        <div key={skeleton} className="flex-1 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
                {error}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const badge = BADGE_STYLES[data.securityBadge];

    return (
        <section className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
                <article
                    className="relative flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-5 transition-all duration-200 hover:border-[#00FF7F]/40 hover:shadow-md"
                    onMouseEnter={() => setActiveDetail('policies')}
                    onMouseLeave={() => setActiveDetail(null)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">Políticas de segurança</h3>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Configurações aplicadas ao tenant</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full ${badge.className}`}>
                            <span className="material-icons-outlined text-xs">{badge.icon}</span>
                            {badge.label}
                        </span>
                    </div>
                    <ul className="mt-4 space-y-1.5">
                        {data.securityPolicies.slice(0, 3).map((policy, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                <span className="material-icons-outlined text-[14px] text-[#00FF7F]">shield</span>
                                <span>{policy}</span>
                            </li>
                        ))}
                    </ul>
                </article>

                <article
                    className="relative flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-5 transition-all duration-200 hover:border-[#00FF7F]/40 hover:shadow-md"
                    onMouseEnter={() => setActiveDetail('governance')}
                    onMouseLeave={() => setActiveDetail(null)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">Governança</h3>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Resultado das auditorias e monitoramento</p>
                        </div>
                        <button
                            type="button"
                            onClick={onAdminClick}
                            className="text-[11px] font-semibold text-[#00FF7F] hover:text-[#00cc63]"
                        >
                            Ver detalhes
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <div>
                            <p className="uppercase tracking-wide text-[10px]">Auditorias</p>
                            <p className="mt-1 text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.audits}</p>
                        </div>
                        <div>
                            <p className="uppercase tracking-wide text-[10px]">Alertas</p>
                            <p className="mt-1 text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.alerts}</p>
                        </div>
                        <div>
                            <p className="uppercase tracking-wide text-[10px]">Logs 24h</p>
                            <p className="mt-1 text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">{data.governanceStatus.logs}</p>
                        </div>
                    </div>
                </article>

                <article
                    className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-5 transition-all duration-200 hover:border-[#00FF7F]/40 hover:shadow-md"
                    onMouseEnter={() => setActiveDetail('risk')}
                    onMouseLeave={() => setActiveDetail(null)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">Indicadores de risco</h3>
                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Monitoramento contínuo de incidentes</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-3 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="material-icons-outlined text-[14px] text-red-400">bug_report</span>
                                Vulnerabilidades abertas
                            </span>
                            <span className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.openVulnerabilities}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="material-icons-outlined text-[14px] text-yellow-400">report</span>
                                Incidentes recentes
                            </span>
                            <span className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.recentIncidents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="material-icons-outlined text-[14px] text-[#00FF7F]">speed</span>
                                SLA de segurança
                            </span>
                            <span className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">{data.riskIndicators.slaBreaches}</span>
                        </div>
                    </div>
                </article>
            </div>

            {detailContent && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-5">
                    {detailContent}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                <span>Atualizado em {new Date(data.updatedAt).toLocaleString('pt-BR')}</span>
                {integrations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="uppercase tracking-wide text-[10px] text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Integrado com</span>
                        {integrations.slice(0, 4).map((integration) => (
                            <span
                                key={integration.id}
                                className="rounded-full border border-[#00FF7F]/40 bg-[#00FF7F]/10 px-3 py-1 text-[11px] font-semibold text-[#00FF7F]"
                            >
                                {integration.name}
                            </span>
                        ))}
                        {integrations.length > 4 && (
                            <span className="text-[11px] text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                +{integrations.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default GovernanceSecurityPanel;
