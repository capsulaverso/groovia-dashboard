import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, AgentFunction } from '../types';
import { MessageRenderer } from './messages';

interface WorkspaceChatAreaProps {
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
    functions: AgentFunction[];
    activeConversationId: string | null;
}

const WorkspaceChatArea: React.FC<WorkspaceChatAreaProps> = ({
    agentTitle,
    agentDescription,
    agentType,
    internalCode,
    functions,
    activeConversationId
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showFunctions, setShowFunctions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleApprovalAction = (requestId: string, optionId: string, optionValue: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.metadata?.approvalRequest?.requestId === requestId) {
                const normalizedValue = optionValue.trim().toLowerCase().replace(/[_-\s]+/g, '');
                const approvalValues = ['approve', 'approved', 'yes', 'allow', 'accept', 'confirm', 'ok', 'sim', 'autorizar', 'aceitar'];
                const newStatus = approvalValues.includes(normalizedValue) ? 'approved' : 'rejected';
                return {
                    ...msg,
                    metadata: {
                        ...msg.metadata,
                        approvalRequest: {
                            ...msg.metadata.approvalRequest!,
                            status: newStatus
                        }
                    }
                };
            }
            return msg;
        }));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Resetar mensagens quando trocar de conversa ou iniciar
    useEffect(() => {
        if (activeConversationId) {
            // Carregar mensagens da conversa específica do localStorage ou backend
            const storedConversation = localStorage.getItem(`conversation_${activeConversationId}`);
            if (storedConversation) {
                try {
                    const parsed = JSON.parse(storedConversation);
                    // Converter timestamps de string para Date
                    const messagesWithDates = parsed.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    setMessages(messagesWithDates);
                } catch (e) {
                    console.error('Erro ao carregar conversa:', e);
                    setMessages([]);
                }
            } else {
                // Conversa vazia - apenas mensagem de boas-vindas
                setMessages([
                    {
                        id: '1',
                        sender: 'agent',
                        message: `Esta conversa está vazia. Vamos começar?`,
                        timestamp: new Date()
                    }
                ]);
            }
        } else {
            // Nova conversa - mensagem de boas-vindas
            setMessages([
                {
                    id: '1',
                    sender: 'agent',
                    message: `Olá! Sou o **${agentTitle}**. ${agentDescription}\n\nVocê pode usar as funções abaixo ou conversar diretamente comigo. Como posso ajudar?`,
                    timestamp: new Date()
                }
            ]);
        }
    }, [activeConversationId, agentTitle, agentDescription]);

    // Salvar mensagens no localStorage quando mudam
    useEffect(() => {
        if (activeConversationId && messages.length > 0) {
            localStorage.setItem(`conversation_${activeConversationId}`, JSON.stringify(messages));
        }
    }, [messages, activeConversationId]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const userText = inputMessage;
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: userText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simula resposta do agente
        setTimeout(() => {
            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: `Recebi sua mensagem: "${userText}". Processando usando **${agentType}**.\n\n*[${internalCode}]*`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Funções do Agente */}
            {functions.length > 0 && showFunctions && (
                <div className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark flex items-center gap-2">
                            <span className="material-icons-outlined text-primary text-lg">functions</span>
                            Funções do Agente
                        </h3>
                        <button
                            onClick={() => setShowFunctions(false)}
                            className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:text-on-surface-light dark:hover:text-on-surface-dark"
                        >
                            <span className="material-icons-outlined text-sm">close</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {functions.map((func) => (
                            <button
                                key={func.id}
                                onClick={func.action}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-icons-outlined text-primary text-lg group-hover:scale-110 transition-transform">
                                        {func.icon}
                                    </span>
                                    <span className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
                                        {func.name}
                                    </span>
                                </div>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    {func.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!showFunctions && functions.length > 0 && (
                <div className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <button
                        onClick={() => setShowFunctions(true)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-icons-outlined text-sm">expand_more</span>
                        Mostrar funções do agente
                    </button>
                </div>
            )}

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                msg.sender === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-light dark:bg-surface-dark text-on-surface-light dark:text-on-surface-dark border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="text-sm">
                                <MessageRenderer message={msg} onApprovalAction={handleApprovalAction} />
                            </div>
                            <span className={`text-xs mt-1 block ${
                                msg.sender === 'user' ? 'text-purple-200' : 'text-on-surface-secondary-light dark:text-on-surface-secondary-dark'
                            }`}>
                                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-surface-light dark:bg-surface-dark">
                <div className="flex gap-3">
                    <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-icons-outlined text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            attach_file
                        </span>
                    </button>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-icons-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceChatArea;
