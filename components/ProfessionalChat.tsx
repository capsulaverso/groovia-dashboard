import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { apiClient } from '../hooks/useApi';

interface ProfessionalChatProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentId: number;
    initialMessage?: string;
}

interface Message {
    id: string;
    sender: 'user' | 'agent';
    content: string;
    timestamp: Date;
    agentName?: string;
    blocks?: any[];
}

interface ConversationItem {
    id: number;
    title: string;
    agentName: string;
    agentType: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

const ProfessionalChat: React.FC<ProfessionalChatProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentId,
    initialMessage,
}) => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Sidebar state
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [filterAgent, setFilterAgent] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // Carregar conversas do usuário
    useEffect(() => {
        if (!user?.id) return;
        
        const loadConversations = async () => {
            try {
                const response = await apiClient.get(`/conversations?userId=${user.id}&clientId=${user.clientId || 1}`);
                setConversations(response);
            } catch (error) {
                console.error('Erro ao carregar conversas:', error);
            }
        };

        loadConversations();
    }, [user?.id, user?.clientId]);

    // Inicializar conversa
    useEffect(() => {
        if (!isOpen || initializedRef.current) return;
        
        const initializeConversation = async () => {
            try {
                setLoading(true);
                
                // Buscar ou criar conversa
                const response = await apiClient.post(`/conversations?clientId=${user?.clientId || 1}&userId=${user?.id}`, {
                    agentId,
                    title: agentTitle,
                    userId: user?.id,
                });
                
                setConversationId(response.id);
                initializedRef.current = true;
                
                // Carregar mensagens existentes
                if (response.id) {
                    const messagesResponse = await apiClient.get(
                        `/conversations/${response.id}/messages?clientId=${user?.clientId || 1}`
                    );
                    setMessages(messagesResponse.map((msg: any) => ({
                        id: msg.id.toString(),
                        sender: msg.sender,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                        agentName: msg.agentName,
                        blocks: msg.metadata?.blocks,
                    })));
                }
            } catch (error) {
                console.error('Erro ao inicializar conversa:', error);
                alert('Erro ao carregar conversa. Verifique o console.');
            } finally {
                setLoading(false);
            }
        };

        initializeConversation();
    }, [isOpen, agentId, agentTitle, user?.clientId]);

    // Enviar mensagem
    const sendMessageDirect = async (convId: number, messageText: string) => {
        try {
            setSending(true);
            
            // Adicionar mensagem do usuário
            const userMessage: Message = {
                id: `user_${Date.now()}`,
                sender: 'user',
                content: messageText,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMessage]);
            
            // Criar mensagem no backend
            await apiClient.post(`/conversations/${convId}/messages?clientId=${user?.clientId || 1}`, {
                sender: 'user',
                content: messageText,
            });
            
            // Obter resposta do agente
            const agentResponse = await apiClient.post(
                `/agents/${agentId}/respond?clientId=${user?.clientId || 1}`,
                {
                    conversationId: convId,
                    message: messageText,
                }
            );
            
            // Adicionar resposta do agente
            if (agentResponse.message) {
                const agentMessage: Message = {
                    id: `agent_${Date.now()}`,
                    sender: 'agent',
                    content: agentResponse.message.content,
                    timestamp: new Date(),
                    agentName: agentTitle,
                    blocks: agentResponse.message.metadata?.blocks,
                };
                setMessages(prev => [...prev, agentMessage]);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem. Verifique o console.');
        } finally {
            setSending(false);
        }
    };

    const handleSend = () => {
        if (!conversationId || !inputMessage.trim() || sending) return;
        sendMessageDirect(conversationId, inputMessage.trim());
        setInputMessage('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    // Filtrar conversas
    const filteredConversations = conversations.filter(conv => {
        const agentMatch = filterAgent === 'all' || conv.agentName === filterAgent;
        const typeMatch = filterType === 'all' || conv.agentType === filterType;
        return agentMatch && typeMatch;
    });

    // Obter agentes únicos para filtro
    const uniqueAgents = Array.from(new Set(conversations.map(c => c.agentName)));

    return (
        <div className="fixed inset-0 z-50 bg-[#0F0F0F] text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex h-full">
                
                {/* Sidebar - Histórico de Conversas */}
                <div className="w-80 bg-[#1E1E1E] border-r border-[#2A2A2A] flex flex-col">
                    {/* Header Sidebar */}
                    <div className="p-6 border-b border-[#2A2A2A]">
                        <h2 className="text-lg font-medium mb-4">Histórico de Interações</h2>
                        
                        {/* Filtros */}
                        <div className="space-y-3">
                            {/* Filtro por Agente */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Agente</label>
                                <select
                                    value={filterAgent}
                                    onChange={(e) => setFilterAgent(e.target.value)}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FFB2]"
                                >
                                    <option value="all">Todos os Agentes</option>
                                    {uniqueAgents.map(agent => (
                                        <option key={agent} value={agent}>{agent}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Filtro por Tipo */}
                            <div>
                                <label className="block text-sm text-[#B0B0B0] mb-2">Tipo</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FFB2]"
                                >
                                    <option value="all">Todos os Tipos</option>
                                    <option value="estrategica">Estratégica</option>
                                    <option value="tatica">Tática</option>
                                    <option value="tecnica">Técnica</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lista de Conversas */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-6 text-center text-[#B0B0B0]">
                                <p>Nenhuma conversa encontrada</p>
                            </div>
                        ) : (
                            <div className="space-y-2 p-2">
                                {filteredConversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                                            selectedConversation === conv.id
                                                ? 'bg-[#0F0F0F] border border-[#00FFB2]'
                                                : 'bg-transparent hover:bg-[#0F0F0F]'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-sm font-medium text-white">{conv.agentName}</span>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-[#00FFB2] text-black text-xs px-2 py-0.5 rounded-full font-medium">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#B0B0B0] line-clamp-2 mb-2">{conv.lastMessage}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#007BFF]">{conv.agentType}</span>
                                            <span className="text-xs text-[#B0B0B0]">{new Date(conv.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Área Principal do Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Header do Chat */}
                    <div className="h-16 border-b border-[#2A2A2A] flex items-center justify-between px-6">
                        <div>
                            <h2 className="text-lg font-medium text-white">{agentTitle}</h2>
                            {loading && <p className="text-xs text-[#B0B0B0]">Preparando conversa...</p>}
                            {conversationId && <p className="text-xs text-[#00FFB2]">Conversa #{conversationId}</p>}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        >
                            <span className="material-icons-outlined text-white">close</span>
                        </button>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-3 max-w-3xl mx-auto">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-lg ${
                                        msg.sender === 'user'
                                            ? 'bg-[#007BFF] text-white ml-auto max-w-[70%]'
                                            : 'bg-[#1E1E1E] text-[#B0B0B0] max-w-[70%]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        {msg.sender === 'agent' && msg.agentName && (
                                            <span className="text-sm font-medium text-white">{msg.agentName}</span>
                                        )}
                                        {msg.sender === 'user' && (
                                            <span className="text-sm font-medium text-white">Você</span>
                                        )}
                                        <span className="text-xs text-[#B0B0B0]">
                                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-base leading-relaxed">{msg.content}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Campo de Digitação */}
                    <div className="border-t border-[#2A2A2A] p-6">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Digite sua mensagem..."
                                        rows={1}
                                        className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white text-base resize-none focus:outline-none focus:border-[#00FFB2] transition-colors"
                                        style={{ minHeight: '48px', maxHeight: '120px' }}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!inputMessage.trim() || sending || !conversationId}
                                    className="px-6 py-3 bg-[#00FFB2] text-black rounded-lg font-medium hover:bg-[#00E6A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-outlined">send</span>
                                            <span>Enviar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-[#B0B0B0] mt-2">
                                Pressione Enter para enviar, Shift+Enter para nova linha
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalChat;

