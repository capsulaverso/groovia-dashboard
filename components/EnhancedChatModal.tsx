import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageRenderer } from './messages';
import { apiClient } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import ScanInterviewGuide from './ScanInterviewGuide';

interface EnhancedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
    knowledgeBase?: string | null;
    promptUrl?: string | null;
}

interface ContextTag {
    id: string;
    text: string;
    frequency: number;
    category: 'keyword' | 'entity' | 'action' | 'topic';
}

interface ApiMessage {
    id: number;
    conversationId: number;
    sender: 'user' | 'agent';
    content: string;
    messageType?: string | null;
    metadata?: Record<string, unknown> | null;
    timestamp?: string | Date | null;
}

interface N8NResponse {
    text: string;
    blocks?: unknown;
    raw?: unknown;
}

interface AgentRespondResponse {
    success: boolean;
    message?: ApiMessage;
    n8nResponse?: N8NResponse;
    usage?: {
        provider?: string;
        tokensUsed?: number | null;
        latencyMs?: number | null;
        cachedResponse?: boolean;
    };
    error?: string;
}

const EnhancedChatModal: React.FC<EnhancedChatModalProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentDescription,
    agentType,
    internalCode,
    knowledgeBase,
    promptUrl
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [contextTags, setContextTags] = useState<ContextTag[]>([]);
    const [sidebarVisible, setSidebarVisible] = useState({
        left: false,
        right: false
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [agentData, setAgentData] = useState<{ knowledgeBase?: string | null; promptUrl?: string | null }>({});
    
    // Extrair agentId do internalCode
    const agentId = parseInt(internalCode.split('-').pop() || '1');
    
    // Buscar dados completos do agente se knowledgeBase ou promptUrl não foram fornecidos
    useEffect(() => {
        if (isOpen && !knowledgeBase && !promptUrl) {
            const fetchAgentData = async () => {
                try {
                    const data = await apiClient.get<{ knowledgeBase?: string | null; promptUrl?: string | null }>(
                        `/agents/${agentId}?clientId=${user?.clientId || 1}`
                    );
                    setAgentData(data);
                } catch (error) {
                    console.error('Erro ao buscar dados do agente:', error);
                }
            };
            fetchAgentData();
        } else {
            setAgentData({ knowledgeBase, promptUrl });
        }
    }, [isOpen, agentId, user?.clientId, knowledgeBase, promptUrl]);
    
    // Contar mensagens do usuário para determinar se passou da segunda etapa
    const userMessagesCount = messages.filter(m => m.sender === 'user').length;
    const canShowSidebars = userMessagesCount >= 2; // Só permite mostrar sidebars após segunda mensagem
    
    // Verificar se é o agente SCAN (primeiro agente de diagnóstico)
    const isScanAgent = internalCode.includes('SCAN') || internalCode.includes('SCAN_01') || internalCode.includes('AGENT_SCAN');
    const [showInterview, setShowInterview] = useState(isScanAgent && userMessagesCount === 0);
    const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});

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
            if (isScanAgent && userMessagesCount === 0) {
                // Para SCAN, mostrar entrevista guiada
                setShowInterview(true);
                setMessages([]);
            } else {
                // Para outros agentes ou SCAN após entrevista
                setMessages([
                    {
                        id: '1',
                        sender: 'agent',
                        message: `Olá! Sou o **${agentTitle}**. ${agentDescription}\n\nComo posso ajudar você hoje?`,
                        timestamp: new Date()
                    }
                ]);
            }
            setInputMessage('');
            setIsTyping(false);
        }
    }, [isOpen, agentTitle, agentDescription, isScanAgent, userMessagesCount]);

    // Handler para quando entrevista for completada
    const handleInterviewComplete = (answers: Record<string, string>) => {
        setShowInterview(false);
        setInterviewAnswers(answers);
        
        // Criar resumo das respostas agrupadas por categoria
        const categories: Record<string, string[]> = {};
        Object.entries(answers).forEach(([key, answer]) => {
            if (answer.trim()) {
                const category = key.split('-')[0].toUpperCase();
                if (!categories[category]) categories[category] = [];
                categories[category].push(answer);
            }
        });
        
        const summary = Object.entries(categories)
            .map(([category, answers]) => `**${category}**:\n${answers.join('\n')}`)
            .join('\n\n');

        const welcomeMessage: ChatMessage = {
            id: '1',
            sender: 'agent',
            message: `Olá! Sou o **${agentTitle}**. ${agentDescription}\n\nObrigado por responder à entrevista guiada. Vou analisar suas respostas e aprofundar alguns pontos específicos.\n\nVamos começar!`,
            timestamp: new Date()
        };

        setMessages([welcomeMessage]);
        
        // Enviar primeira mensagem automática com resumo após delay
        setTimeout(() => {
            const summaryMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: 'user',
                message: `Concluí a entrevista guiada. Aqui estão minhas respostas organizadas por categoria:\n\n${summary}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, summaryMessage]);
        }, 1500);
    };

    const handleQuestionAnswer = (questionId: string, answer: string) => {
        // Opcional: salvar respostas incrementalmente
        console.log('Resposta registrada:', questionId, answer);
    };

    const handleSendMessage = async () => {
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

        try {
            console.log('📤 Enviando para agente:', agentId);
            const response = await apiClient.post<AgentRespondResponse>(`/agents/${agentId}/respond`, {
                conversationId: undefined,
                message: userText,
            });

            console.log('✅ Resposta:', response);

            const agentMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: response.message?.content || response.n8nResponse?.text || 'Não consegui processar sua solicitação.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('❌ Erro:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                message: 'Desculpe, houve um erro ao processar sua mensagem.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="w-full max-w-4xl h-[85vh] max-h-[800px] bg-surface-light dark:bg-surface-dark flex flex-col shadow-2xl rounded-xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Minimalista */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => canShowSidebars && setSidebarVisible(prev => ({ ...prev, left: !prev.left }))}
                            disabled={!canShowSidebars}
                            className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                                canShowSidebars 
                                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' 
                                    : 'opacity-40 cursor-not-allowed'
                            }`}
                            title={canShowSidebars ? (sidebarVisible.left ? 'Ocultar histórico' : 'Mostrar histórico') : 'Disponível após segunda mensagem'}
                        >
                            <span className="material-icons-outlined text-lg text-on-surface-light dark:text-on-surface-dark">
                                {sidebarVisible.left ? 'menu_open' : 'menu'}
                            </span>
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-medium text-on-surface-light dark:text-on-surface-dark truncate">
                                {agentTitle}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark truncate">
                                    {internalCode}
                                </p>
                                {/* Links de Consulta e Base de Conhecimento */}
                                {(agentData.knowledgeBase || agentData.promptUrl) && (
                                    <div className="flex items-center gap-2">
                                        {agentData.knowledgeBase && (
                                            <a
                                                href={agentData.knowledgeBase}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                                                title="Base de Conhecimento"
                                            >
                                                <span className="material-icons-outlined text-sm">menu_book</span>
                                                <span>Base</span>
                                            </a>
                                        )}
                                        {agentData.promptUrl && (
                                            <a
                                                href={agentData.promptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                                                title="Link de Consulta"
                                            >
                                                <span className="material-icons-outlined text-sm">link</span>
                                                <span>Consulta</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => canShowSidebars && setSidebarVisible(prev => ({ ...prev, right: !prev.right }))}
                            disabled={!canShowSidebars}
                            className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                                canShowSidebars 
                                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' 
                                    : 'opacity-40 cursor-not-allowed'
                            }`}
                            title={canShowSidebars ? (sidebarVisible.right ? 'Ocultar contexto' : 'Mostrar contexto') : 'Disponível após segunda mensagem'}
                        >
                            <span className="material-icons-outlined text-lg text-on-surface-light dark:text-on-surface-dark">
                                {sidebarVisible.right ? 'label_off' : 'label'}
                            </span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            title="Fechar (ESC)"
                        >
                            <span className="material-icons-outlined text-lg text-gray-500 dark:text-gray-400">close</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Histórico de Mensagens */}
                    {canShowSidebars && sidebarVisible.left && (
                        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto transition-all">
                            <div className="p-3">
                                <h3 className="text-xs font-medium text-on-surface-light dark:text-on-surface-dark mb-3 flex items-center gap-1.5">
                                    <span className="material-icons-outlined text-base">history</span>
                                    Histórico
                                </h3>
                                <div className="space-y-1.5">
                                    {messages.filter(m => m.sender === 'user').map(msg => (
                                        <div
                                            key={msg.id}
                                            className="p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

                    {/* Center - Chat Area ou Entrevista Guiada */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {showInterview ? (
                            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                                <ScanInterviewGuide
                                    onComplete={handleInterviewComplete}
                                    onQuestionAnswer={handleQuestionAnswer}
                                />
                            </div>
                        ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg px-3 py-2 ${
                                            msg.sender === 'user'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark'
                                        }`}
                                    >
                                        <div className="text-sm leading-relaxed">
                                            <MessageRenderer message={msg} onApprovalAction={handleApprovalAction} />
                                        </div>
                                        <span className={`text-xs mt-1 block opacity-70 ${
                                            msg.sender === 'user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                        )}
                        
                        {/* Input de Mensagem - Oculto durante entrevista */}
                        {!showInterview && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
                                >
                                    <span className="material-icons-outlined text-lg">send</span>
                                </button>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Right Sidebar - Tags de Contexto */}
                    {canShowSidebars && sidebarVisible.right && (
                        <div className="w-64 border-l border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto transition-all">
                            <div className="p-3">
                                <h3 className="text-xs font-medium text-on-surface-light dark:text-on-surface-dark mb-3 flex items-center gap-1.5">
                                    <span className="material-icons-outlined text-base">label</span>
                                    Tags de Contexto
                                </h3>
                                <div className="space-y-1.5">
                                    {contextTags.length === 0 ? (
                                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-center py-3">
                                            Nenhuma tag ainda
                                        </p>
                                    ) : (
                                        contextTags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className={`p-2 rounded-md border flex items-center justify-between ${
                                                    tag.category === 'action' 
                                                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50'
                                                        : tag.category === 'entity'
                                                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50'
                                                        : tag.category === 'topic'
                                                        ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/50 dark:border-purple-800/50'
                                                        : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-medium text-on-surface-light dark:text-on-surface-dark truncate block">
                                                        {tag.text}
                                                    </span>
                                                    <span className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                        {tag.frequency}x
                                                    </span>
                                                </div>
                                                <span className="material-icons-outlined text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark flex-shrink-0 ml-1">
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

