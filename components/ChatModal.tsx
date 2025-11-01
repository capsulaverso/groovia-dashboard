import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatModalProps, ChatMessage } from '../types';
import { MessageRenderer } from './messages';

const ChatModal: React.FC<ChatModalProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentDescription,
    agentType,
    internalCode,
    agentId,
    aiProvider = 'replit',
    aiModel = 'gpt-4o-mini',
    systemPrompt = 'Você é um assistente inteligente e prestativo.',
    fallbackPrompt = 'Olá! Como posso ajudar você hoje?'
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isTypingAnimationRef = useRef(false);
    const initializedRef = useRef(false);

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

    // Auto scroll para a última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Função para animar digitação
    const typeMessage = useCallback((fullText: string, callback: (msg: string) => void) => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < fullText.length) {
                callback(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
                isTypingAnimationRef.current = false;
            }
        }, 30); // Velocidade de digitação (30ms por caractere)
    }, []);

    // Resetar estado quando fechar o modal
    useEffect(() => {
        if (!isOpen) {
            initializedRef.current = false;
            isTypingAnimationRef.current = false;
        }
    }, [isOpen]);
    
    // Adicionar mensagem de boas-vindas quando o modal abre
    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            initializedRef.current = true;
            setInputMessage('');
            setIsTyping(false);
            setError(null);
            
            // Usar fallbackPrompt personalizado do agente
            const welcomeMessage = fallbackPrompt;
            
            // Animar digitação
            typeMessage(welcomeMessage, (typedText) => {
                setMessages([
                    {
                        id: '1',
                        sender: 'agent',
                        message: typedText,
                        timestamp: new Date()
                    }
                ]);
            });
        }
    }, [isOpen, typeMessage, fallbackPrompt]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userText = inputMessage;

        // Adiciona mensagem do usuário
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: userText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        setError(null);

        try {
            // Chama a API do agente para obter resposta real
            const response = await fetch('/api/agents/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: aiProvider,
                    model: aiModel,
                    systemPrompt: systemPrompt,
                    testMessage: userText,
                    fallbackPrompt: 'Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.'
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao obter resposta do agente');
            }

            const result = await response.json();

            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: result.response || result.error || 'Não consegui processar sua solicitação.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao comunicar com o agente';
            setError(errorMessage);

            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: `Desculpe, ocorreu um erro: ${errorMessage}`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="font-display bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col text-on-surface-light dark:text-on-surface-dark"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header do Modal */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">{agentTitle}</h2>
                            <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">{agentDescription}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="text-xs font-mono text-primary bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                    {internalCode}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                    {agentType}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-icons-outlined text-3xl">close</span>
                        </button>
                    </div>
                </div>

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
                                        : 'bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark'
                                }`}
                            >
                                <div className="text-sm">
                                    <MessageRenderer message={msg} onApprovalAction={handleApprovalAction} />
                                </div>
                                <span className={`text-xs mt-1 block ${
                                    msg.sender === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
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
                </div>

                {/* Input de Mensagem */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
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
                            <span className="font-medium">Enviar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
