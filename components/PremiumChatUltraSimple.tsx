import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { apiClient } from '../hooks/useApi';

interface PremiumChatUltraSimpleProps {
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
}

const PremiumChatUltraSimple: React.FC<PremiumChatUltraSimpleProps> = ({
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // Logs movidos para dentro do useEffect (não criar efeito colateral a cada render)
    useEffect(() => {
        console.log('🚀 PremiumChatUltraSimple renderizado');
        console.log('📊 Estado:', { conversationId, loading, agentId, userId: user?.id });
    }, [conversationId, loading, agentId, user?.id]);

    // Criar conversa IMEDIATAMENTE ao abrir
    useEffect(() => {
        if (!isOpen || !user || initializedRef.current) return;

        console.log('🎬 Iniciando criação de conversa...');
        initializedRef.current = true;

        const createConversation = async () => {
            try {
                console.log('🌐 Criando conversa na API...');
                
                // 1. Buscar conversas existentes
                const clientId = user.clientId || 1;
                console.log('🔑 clientId:', clientId);
                
                const existingConversations = await apiClient.get<any[]>(
                    `/users/${user.id}/conversations?clientId=${clientId}`
                );
                console.log('📦 Conversas existentes:', existingConversations.length);

                let conversation = existingConversations.find(c => c.agentId === agentId);

                // 2. Se não existe, criar nova
                if (!conversation) {
                    console.log('🆕 Criando nova conversa...');
                    const payload = {
                        userId: user.id,
                        agentId: agentId,
                        clientId: clientId,
                        title: `Conversa com ${agentTitle}`,
                    };
                    console.log('📦 Payload:', payload);
                    
                    try {
                        conversation = await apiClient.post('/conversations', payload);
                        console.log('✅ Conversa criada:', conversation);
                    } catch (createError: any) {
                        console.error('❌ Erro detalhado ao criar conversa:', createError);
                        console.error('📄 Resposta do servidor:', createError.response || createError.message);
                        throw createError;
                    }
                } else {
                    console.log('✅ Conversa existente encontrada:', conversation.id);
                }

                console.log('🔢 conversationId:', conversation.id);
                setConversationId(conversation.id);

                // 3. Buscar mensagens existentes
                console.log('📬 Buscando mensagens...');
                const history = await apiClient.get<any[]>(
                    `/conversations/${conversation.id}/messages`
                );
                console.log('📨 Mensagens encontradas:', history.length);

                const mappedMessages = history.map(m => ({
                    id: String(m.id),
                    sender: m.sender as 'user' | 'agent',
                    content: m.content,
                    timestamp: new Date(m.timestamp || m.createdAt),
                }));

                setMessages(mappedMessages);
                setLoading(false);
                console.log('✅ Conversa pronta!');

                // 4. Enviar mensagem inicial se houver
                if (initialMessage && mappedMessages.length === 0) {
                    console.log('📤 Enviando mensagem inicial:', initialMessage);
                    setTimeout(() => {
                        sendMessageDirect(conversation.id, initialMessage);
                    }, 500);
                }
            } catch (error) {
                console.error('❌ ERRO ao criar conversa:', error);
                setLoading(false);
                alert('Erro ao criar conversa. Verifique o console.');
            }
        };

        createConversation();
    }, [isOpen, user, agentId, agentTitle, initialMessage]);

    const sendMessageDirect = async (convId: number, content: string) => {
        if (!convId || !content.trim()) return;

        console.log('📨 Enviando mensagem:', content);
        setSending(true);

        // Mensagem otimista
        const tempId = `temp-${Date.now()}`;
        const userMsg: Message = {
            id: tempId,
            sender: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);

        try {
            // 1. Salvar mensagem do usuário
            console.log('💾 Salvando mensagem do usuário...');
            await apiClient.post('/messages', {
                conversationId: convId,
                sender: 'user',
                content: content.trim(),
                messageType: 'text',
            });
            console.log('✅ Mensagem salva');

            // 2. Pedir resposta do agente
            console.log('🤖 Solicitando resposta do agente...');
            const response = await apiClient.post(`/agents/${agentId}/respond`, {
                conversationId: convId,
                message: content.trim(),
            });
            console.log('✅ Resposta recebida:', response);

            if (response.success && response.message) {
                const agentMsg: Message = {
                    id: String(response.message.id),
                    sender: 'agent',
                    content: response.message.content,
                    timestamp: new Date(response.message.timestamp || Date.now()),
                };
                setMessages(prev => [...prev, agentMsg]);
            }
        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
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

    return (
        <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                <div>
                    <h2 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                        {agentTitle}
                    </h2>
                    {loading && <p className="text-xs text-gray-500">Preparando conversa...</p>}
                    {conversationId && <p className="text-xs text-green-500">Conversa #{conversationId} pronta</p>}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <span className="material-icons-outlined">close</span>
                </button>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100vh - 144px)' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                Criando conversa...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                    msg.sender === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="h-20 border-t border-gray-200 dark:border-gray-700 px-6 flex items-center gap-4">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={loading ? "Aguarde..." : "Digite sua mensagem..."}
                    disabled={sending || loading || !conversationId}
                    className="flex-1 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || sending || loading || !conversationId}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {sending ? (
                        <>
                            <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-outlined text-sm">send</span>
                            Enviar
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PremiumChatUltraSimple;

