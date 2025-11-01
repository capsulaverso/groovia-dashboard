import React, { useCallback, useMemo, useState } from 'react';
import EnhancedChatModal from './EnhancedChatModal';
import { useUser } from '../hooks/useUser';
import { apiClient } from '../hooks/useApi';

interface AgentActionFabProps {
    defaultAgentCode?: string; // Ex.: 'SCAN01'
    defaultTitle?: string;
    defaultDescription?: string;
}

interface AgentItem {
    id: number;
    internalCode: string;
    title: string;
    description: string;
    agentType: string;
}

const AgentActionFab: React.FC<AgentActionFabProps> = ({
    defaultAgentCode = 'SCAN01',
    defaultTitle = 'SCAN Diagnóstico',
    defaultDescription = 'Entrevista guiada para diagnóstico do negócio',
}) => {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [agent, setAgent] = useState<AgentItem | null>(null);

    const clientId = useMemo(() => user?.clientId || 1, [user?.clientId]);

    const toggle = useCallback(() => setOpen((v) => !v), []);

    const startAgent = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Buscar agentes e escolher o SCAN (ou o primeiro da lista)
            const agents = await apiClient.get<AgentItem[]>(`/agents?clientId=${clientId}`);
            let selected = agents.find((a) => a.internalCode?.toUpperCase() === defaultAgentCode.toUpperCase())
                || agents[0]
                || null;

            // Fallback local se não houver backend
            if (!selected) {
                selected = {
                    id: 0,
                    internalCode: defaultAgentCode,
                    title: defaultTitle,
                    description: defaultDescription,
                    agentType: 'scan',
                } as AgentItem;
            }

            setAgent(selected);
            setChatOpen(true);
            setOpen(false);
        } catch (err) {
            // Fallback: abrir com dados padrão
            setAgent({
                id: 0,
                internalCode: defaultAgentCode,
                title: defaultTitle,
                description: defaultDescription,
                agentType: 'scan',
            } as AgentItem);
            setChatOpen(true);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }, [clientId, defaultAgentCode, defaultDescription, defaultTitle, user]);

    return (
        <>
            {/* Botão Flutuante */}
            <div className="fixed bottom-6 right-6 z-[9800]">
                <div className="relative">
                    {/* Painel */}
                    {open && (
                        <div className="absolute bottom-16 right-0 w-[280px] rounded-2xl border border-white/10 bg-[#151515] shadow-2xl p-4 animate-[fadeIn_.15s_ease-out]">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-icons-outlined text-primary">auto_awesome</span>
                                <div>
                                    <p className="text-sm text-white font-semibold">Atalhos de Ação</p>
                                    <p className="text-xs text-white/60">Dispare o agente com um clique</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={startAgent}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-[#02281a] px-4 py-2.5 text-sm font-semibold hover:bg-primary/80 disabled:opacity-60"
                            >
                                <span className="material-icons-outlined">play_circle</span>
                                {loading ? 'Iniciando...' : 'Iniciar Agente SCAN'}
                            </button>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={startAgent}
                                    disabled={loading}
                                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-white/80 hover:bg-white/10"
                                >
                                    <span className="material-icons-outlined text-sm">quiz</span>
                                    <div>Entrevista</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={startAgent}
                                    disabled={loading}
                                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-white/80 hover:bg-white/10"
                                >
                                    <span className="material-icons-outlined text-sm">bolt</span>
                                    <div>Rápido</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={startAgent}
                                    disabled={loading}
                                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-white/80 hover:bg-white/10"
                                >
                                    <span className="material-icons-outlined text-sm">support_agent</span>
                                    <div>Assistir</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FAB */}
                    <button
                        type="button"
                        onClick={toggle}
                        className={`rounded-full p-4 shadow-2xl transition-all ${
                            open
                                ? 'bg-red-500 hover:bg-red-600 text-white rotate-45'
                                : 'bg-primary hover:bg-primary/90 text-[#02281a] hover:scale-105'
                        }`}
                        title={open ? 'Fechar ações' : 'Abrir ações do agente'}
                        style={{ boxShadow: '0 14px 45px rgba(0,0,0,0.35)' }}
                    >
                        <span className="material-icons-outlined text-2xl">add</span>
                    </button>
                </div>
            </div>

            {/* Chat Modal */}
            {agent && (
                <EnhancedChatModal
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    agentTitle={agent.title || defaultTitle}
                    agentDescription={agent.description || defaultDescription}
                    agentType={agent.agentType || 'scan'}
                    internalCode={agent.internalCode || defaultAgentCode}
                />
            )}
        </>
    );
};

export default AgentActionFab;
