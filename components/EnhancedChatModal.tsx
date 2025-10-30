import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageRenderer } from './messages';

interface EnhancedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
}

interface ContextTag {
    id: string;
    text: string;
    frequency: number;
    category: 'keyword' | 'entity' | 'action' | 'topic';
}

const EnhancedChatModal: React.FC<EnhancedChatModalProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentDescription,
    agentType,
    internalCode
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [contextTags, setContextTags] = useState<ContextTag[]>([]);
    const [sidebarVisible, setSidebarVisible] = useState({
        left: true,
        right: true
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Extrair palavras-chave das mensagens para criar tags de contexto
    const extractContextTags = (text: string): string[] => {
        // Palavras comuns que não devem ser tags
        const stopWords = ['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'por', 'para', 'com', 'sem', 'que', 'quem', 'onde', 'quando', 'como', 'ele', 'ela', 'eles', 'elas', 'um', 'uma', 'uns', 'umas', 'e', 'ou', 'mas', 'já', 'também', 'mais', 'muito', 'mais', 'está', 'esse', 'essa', 'isto', 'isso'];
        
        // Palavras-chave importantes
        const keywords = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .filter((word, index, arr) => arr.indexOf(word) === index); // remover duplicatas
        
        return keywords.slice(0, 10); // Limitar a 10 palavras-chave
    };

    // Categorizar tags
    const categorizeTag = (text: string): ContextTag['category'] => {
        const actionWords = ['analisar', 'criar', 'fazer', 'implementar', 'desenvolver', 'conceber', 'propor', 'testar'];
        const entityWords = ['cliente', 'usuário', 'produto', 'serviço', 'empresa', 'sistema', 'marca'];
        const topicWords = ['marketing', 'vendas', 'estratégia', 'operacional', 'financeiro', 'tecnologia'];
        
        if (actionWords.some(word => text.includes(word))) return 'action';
        if (entityWords.some(word => text.includes(word))) return 'entity';
        if (topicWords.some(word => text.includes(word))) return 'topic';
        return 'keyword';
    };

    // Atualizar tags de contexto quando novas mensagens são adicionadas
    useEffect(() => {
        const allText = messages.map(m => m.message).join(' ');
        const keywords = extractContextTags(allText);
        
        const newTags = keywords.map((keyword, index) => {
            const existingTag = contextTags.find(t => t.text === keyword);
            if (existingTag) {
                return {
                    ...existingTag,
                    frequency: existingTag.frequency + 1
                };
            }
            return {
                id: `tag-${keyword}-${index}`,
                text: keyword,
                frequency: 1,
                category: categorizeTag(keyword)
            };
        });

        // Manter as tags existentes e adicionar/atualizar as novas
        const updatedTags = [...contextTags];
        newTags.forEach(newTag => {
            const index = updatedTags.findIndex(t => t.text === newTag.text);
            if (index >= 0) {
                updatedTags[index] = newTag;
            } else {
                updatedTags.push(newTag);
            }
        });

        // Ordenar por frequência
        updatedTags.sort((a, b) => b.frequency - a.frequency);
        setContextTags(updatedTags.slice(0, 20)); // Manter apenas as 20 principais
    }, [messages]);

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
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    id: '1',
                    sender: 'agent',
                    message: `Olá! Sou o **${agentTitle}**. ${agentDescription}\n\nComo posso ajudar você hoje?`,
                    timestamp: new Date()
                }
            ]);
            setInputMessage('');
            setIsTyping(false);
        }
    }, [isOpen, agentTitle, agentDescription]);

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

        setTimeout(() => {
            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: `Recebi sua mensagem: "${userText}". Estou processando sua solicitação usando o ${agentType}.\n\n*[Código: ${internalCode}]*`,
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

    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-0 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="w-full h-full bg-surface-light dark:bg-surface-dark flex flex-col shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Full Screen */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarVisible(prev => ({ ...prev, left: !prev.left }))}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={sidebarVisible.left ? 'Ocultar histórico' : 'Mostrar histórico'}
                        >
                            <span className="material-icons-outlined text-xl text-on-surface-light dark:text-on-surface-dark">
                                history
                            </span>
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-semibold text-on-surface-light dark:text-on-surface-dark truncate">
                                {agentTitle}
                            </h2>
                            <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark truncate">
                                {agentDescription}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <span className="text-xs font-mono text-primary bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                {internalCode}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                {agentType}
                            </span>
                        </div>

                        <button
                            onClick={() => setSidebarVisible(prev => ({ ...prev, right: !prev.right }))}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={sidebarVisible.right ? 'Ocultar contexto' : 'Mostrar contexto'}
                        >
                            <span className="material-icons-outlined text-xl text-on-surface-light dark:text-on-surface-dark">
                                label
                            </span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Fechar (ESC)"
                        >
                            <span className="material-icons-outlined text-xl text-red-500">close</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Histórico de Mensagens */}
                    {sidebarVisible.left && (
                        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-slide-right">
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-4 flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">history</span>
                                    Histórico
                                </h3>
                                <div className="space-y-2">
                                    {messages.filter(m => m.sender === 'user').map(msg => (
                                        <div
                                            key={msg.id}
                                            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => scrollToBottom()}
                                        >
                                            <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark line-clamp-2">
                                                {msg.message}
                                            </p>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                                                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Center - Chat Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span className="material-icons-outlined">send</span>
                                    <span className="font-medium hidden sm:inline">Enviar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Tags de Contexto */}
                    {sidebarVisible.right && (
                        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-slide-left">
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-4 flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">label</span>
                                    Tags de Contexto
                                </h3>
                                <div className="space-y-2">
                                    {contextTags.length === 0 ? (
                                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-center py-4">
                                            Nenhuma tag de contexto ainda
                                        </p>
                                    ) : (
                                        contextTags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className={`p-3 rounded-lg border flex items-center justify-between ${
                                                    tag.category === 'action' 
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                        : tag.category === 'entity'
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                        : tag.category === 'topic'
                                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <span className="text-xs font-medium text-on-surface-light dark:text-on-surface-dark">
                                                        {tag.text}
                                                    </span>
                                                    <span className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark block">
                                                        Apareceu {tag.frequency}x
                                                    </span>
                                                </div>
                                                <span className="material-icons-outlined text-lg text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                    {tag.category === 'action' ? 'play_arrow' : tag.category === 'entity' ? 'person' : tag.category === 'topic' ? 'topic' : 'tag'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedChatModal;

