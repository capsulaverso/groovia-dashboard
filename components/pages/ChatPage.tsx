import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useApi } from '../../hooks/useApi';
import ProfessionalChat from '../ProfessionalChat';

interface Agent {
    id: number;
    title: string;
    description: string;
    agentType: string;
    internalCode: string;
}

const ChatPage: React.FC = () => {
    const { user } = useUser();
    const { data: agents } = useApi<Agent[]>(`/agents?clientId=${user?.clientId || 1}`);
    
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showChat, setShowChat] = useState(false);

    // Auto-select primeiro agente se disponível
    useEffect(() => {
        if (agents && agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0]);
        }
    }, [agents, selectedAgent]);

    const handleOpenChat = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowChat(true);
    };

    const handleCloseChat = () => {
        setShowChat(false);
    };

    return (
        <>
            <div className="min-h-screen bg-[#0F0F0F] text-white p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-medium mb-2">Centro de Conversação</h1>
                        <p className="text-[#B0B0B0]">Interaja com os agentes estratégicos da plataforma</p>
                    </div>

                    {/* Grid de Agentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agents?.map(agent => (
                            <div
                                key={agent.id}
                                onClick={() => handleOpenChat(agent)}
                                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6 cursor-pointer hover:border-[#00FFB2] transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-white mb-1">{agent.title}</h3>
                                        <span className="text-xs text-[#007BFF] bg-[#007BFF] bg-opacity-10 px-2 py-1 rounded-full">
                                            {agent.internalCode}
                                        </span>
                                    </div>
                                    <div className="p-2 bg-[#0F0F0F] rounded-lg group-hover:bg-[#00FFB2] group-hover:bg-opacity-20 transition-colors">
                                        <span className="material-icons-outlined text-[#00FFB2] text-2xl">chat_bubble_outline</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#B0B0B0] mb-4 line-clamp-2">{agent.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#B0B0B0] capitalize">{agent.agentType}</span>
                                    <button className="text-[#00FFB2] text-sm font-medium hover:text-[#00E6A0] transition-colors">
                                        Conversar →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {(!agents || agents.length === 0) && (
                        <div className="text-center py-20">
                            <div className="inline-block p-4 bg-[#1E1E1E] rounded-full mb-4">
                                <span className="material-icons-outlined text-[#B0B0B0] text-5xl">chat_bubble_outline</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Nenhum agente disponível</h3>
                            <p className="text-[#B0B0B0]">Configure os agentes no painel de administração</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Chat */}
            {selectedAgent && (
                <ProfessionalChat
                    isOpen={showChat}
                    onClose={handleCloseChat}
                    agentTitle={selectedAgent.title}
                    agentId={selectedAgent.id}
                />
            )}
        </>
    );
};

export default ChatPage;

