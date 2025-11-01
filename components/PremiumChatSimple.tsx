import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { useChatSession } from '../hooks/useChatSession';

interface PremiumChatProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
    agentId: number;
    initialMessage?: string;
}

const PremiumChatSimple: React.FC<PremiumChatProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentId,
    initialMessage,
}) => {
    console.log('🚀 🚀 🚀 PremiumChatSimple RENDERIZADO! 🚀 🚀 🚀');
    console.log('📊 Props recebidas:', { 
        isOpen, 
        agentId, 
        agentTitle, 
        initialMessage,
        tipoAgentId: typeof agentId,
        tipoInitialMessage: typeof initialMessage
    });

    const { user } = useUser();
    const [inputMessage, setInputMessage] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    console.log('📞 Chamando useChatSession com:', { 
        agentId, 
        agentTitle, 
        enabled: isOpen,
        user: user?.id 
    });
    
    const {
        messages,
        loading,
        conversationId,
        sendMessage,
        isSending,
        isAgentTyping,
    } = useChatSession({ agentId, agentTitle, enabled: isOpen });
    
    console.log('📊 useChatSession retornou:', {
        messagesCount: messages?.length || 0,
        loading,
        conversationId,
        isSending,
        isAgentTyping
    });
    
    // Debug: mostrar no console se está travado
    useEffect(() => {
        if (loading) {
            console.warn('⏳ CARREGANDO HÁ MUITO TEMPO!');
            console.log('🔍 Estado atual:', { loading, conversationId, agentId, userId: user?.id });
        }
    }, [loading, conversationId, agentId, user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Enviar mensagem inicial APENAS quando conversationId estiver pronto
    useEffect(() => {
        console.log('🔄 [initialMessage useEffect] Verificando...');
        console.log('📨 initialMessage:', initialMessage);
        console.log('🔧 hasInitialized:', hasInitialized);
        console.log('⏳ loading:', loading);
        console.log('💬 conversationId:', conversationId);
        console.log('🎯 isOpen:', isOpen);

        // Aguardar até que a conversa esteja criada (conversationId) e não esteja carregando
        if (initialMessage && !hasInitialized && conversationId && !loading && isOpen) {
            console.log('✅ TODAS CONDIÇÕES ATENDIDAS! Enviando mensagem inicial...');
            setHasInitialized(true);
            
            setTimeout(() => {
                console.log('📤 Executando sendMessage...');
                sendMessage(initialMessage);
                console.log('✅ sendMessage executado!');
            }, 500);
        } else {
            console.log('⏸️ Aguardando condições:', {
                temInitialMessage: !!initialMessage,
                naoInicializado: !hasInitialized,
                temConversationId: !!conversationId,
                naoCarregando: !loading,
                estaAberto: isOpen
            });
        }
    }, [initialMessage, hasInitialized, conversationId, loading, sendMessage, isOpen]);

    const handleSend = () => {
        console.log('📤 handleSend chamado');
        console.log('📝 inputMessage:', inputMessage);
        console.log('💬 conversationId:', conversationId);
        console.log('⏳ loading:', loading);
        
        if (!conversationId) {
            console.error('❌ Conversa ainda não criada! Aguarde...');
            alert('Aguarde a conversa carregar antes de enviar mensagens.');
            return;
        }
        
        if (inputMessage.trim() && !isSending) {
            console.log('✅ Enviando mensagem...');
            sendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    if (!isOpen) return null;

    if (!user) {
        console.error('❌ Usuário não encontrado');
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                <div>
                    <h2 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark">
                        {agentTitle}
                    </h2>
                    {loading && (
                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Carregando conversa...
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <span className="material-icons-outlined">close</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100vh - 144px)' }}>
                {!conversationId || loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                {loading ? 'Preparando conversa...' : 'Aguarde...'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                        msg.sender === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isAgentTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
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
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={loading ? "Aguarde..." : conversationId ? "Digite sua mensagem..." : "Preparando conversa..."}
                    disabled={isSending || loading || !conversationId}
                    className="flex-1 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isSending || loading || !conversationId}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSending ? (
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

export default PremiumChatSimple;

