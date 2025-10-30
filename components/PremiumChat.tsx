import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOramaSearch } from '../hooks/useOramaSearch';
import type { ChatMessage } from '../types';
import { useChatSession } from '../hooks/useChatSession';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';

interface PropsItem {
    id: string;
    name: string;
    value: string;
}

interface QueueItem {
    id: string;
    task: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    timestamp: Date;
}

interface TaskItem {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'completed';
}

interface PlanItem {
    id: string;
    title: string;
    steps: string[];
    estimatedTime: string;
    status: 'pending_approval' | 'approved' | 'rejected' | 'executing';
}

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

interface AgentData {
    id: number;
    title: string;
    description: string;
    systemPrompt: string;
    agentType: string;
    act: string;
}

interface ProgressData {
    currentStep: string;
    stepDescription: string;
    contextProgress: number;
    updatedAt: string;
}

const PremiumChat: React.FC<PremiumChatProps> = ({
    isOpen,
    onClose,
    agentTitle,
    agentDescription,
    agentType,
    internalCode,
    agentId,
    initialMessage
}) => {
    console.log('🚀 PremiumChat RENDERIZADO!');
    console.log('📊 Props:', { isOpen, agentId, agentTitle, initialMessage: initialMessage?.substring(0, 30) });
    
    // ⚠️ IMPORTANTE: Todos os hooks DEVEM vir ANTES de qualquer return condicional
    const { user } = useUser();
    const [inputMessage, setInputMessage] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState<'props' | 'queue' | 'tasks' | 'plan' | 'directives' | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [propsItems, setPropsItems] = useState<PropsItem[]>([]);
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Buscar dados do agente e progresso
    const { data: agentData } = useApi<AgentData>(`/agents/${agentId}?clientId=${user?.clientId || 1}`, isOpen);
    const { data: progressData } = useApi<ProgressData>(`/users/${user?.id}/progress/${agentId}?clientId=${user?.clientId || 1}`, isOpen && !!user?.id);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const indexedMessagesRef = useRef<Set<string>>(new Set());

    const { isReady, indexMultipleMessages, searchMessages } = useOramaSearch();
    
    console.log('📞 Chamando useChatSession com:', { agentId, agentTitle, enabled: isOpen });
    
    const {
        messages,
        loading,
        error,
        conversationId,
        sessionHash,
        isSending,
        isAgentTyping,
        sendMessage,
        getSessionMetrics,
    } = useChatSession({ agentId, agentTitle, enabled: isOpen });

    const canSend = useMemo(() => inputMessage.trim().length > 0 && !isSending && !loading, [inputMessage, isSending, loading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputMessage]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setInputMessage('');
        setActiveTool(null);
        setSearchQuery('');
        setSearchResults([]);
        indexedMessagesRef.current.clear();
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Enviar mensagem inicial automaticamente
    useEffect(() => {
        console.log('🔄 useEffect - initialMessage');
        console.log('📨 initialMessage:', initialMessage);
        console.log('🔧 hasInitialized:', hasInitialized);
        console.log('⏳ loading:', loading);
        console.log('💬 conversationId:', conversationId);
        console.log('🎯 isOpen:', isOpen);
        
        if (initialMessage && !hasInitialized && !loading && conversationId && isOpen) {
            console.log('✅ Condições atendidas! Enviando mensagem inicial...');
            setHasInitialized(true);
            
            // Pequeno delay para garantir que tudo está carregado
            setTimeout(() => {
                console.log('📤 Executando sendMessage agora...');
                try {
                    sendMessage(initialMessage);
                    console.log('✅ sendMessage executado com sucesso!');
                } catch (e) {
                    console.error('❌ Erro ao executar sendMessage:', e);
                }
            }, 500);
        } else {
            console.log('⏸️ Condições NÃO atendidas:', {
                hasInitialMessage: !!initialMessage,
                notInitialized: !hasInitialized,
                notLoading: !loading,
                hasConversationId: !!conversationId,
                isOpenFlag: isOpen
            });
        }
    }, [initialMessage, hasInitialized, loading, conversationId, sendMessage, isOpen]);

    useEffect(() => {
        if (!isOpen || !isReady) {
            return;
        }

        const pendingMessages = messages.filter((messageItem) => !indexedMessagesRef.current.has(messageItem.id));
        if (pendingMessages.length === 0) {
            return;
        }

        const indexBatch = async () => {
            try {
                await indexMultipleMessages(pendingMessages);
                pendingMessages.forEach((item) => indexedMessagesRef.current.add(item.id));
            } catch (indexError) {
                console.error('Erro ao indexar mensagens para busca:', indexError);
            }
        };

        indexBatch();
    }, [indexMultipleMessages, isOpen, isReady, messages]);

    const handleSendMessage = useCallback(async () => {
        const trimmed = inputMessage.trim();
        if (!trimmed) {
            return;
        }

        if (!canSend) {
            return;
        }

        setInputMessage('');

        try {
            await sendMessage(trimmed);
        } catch (error) {
            console.error('Erro ao enviar mensagem para o agente:', error);
            setInputMessage(trimmed);
        }
    }, [canSend, inputMessage, sendMessage]);

    // ✅ Validações APÓS todos os hooks
    if (!user) {
        console.error('❌ Usuário não encontrado!');
        return null;
    }
    
    if (!agentId || typeof agentId !== 'number') {
        console.error('❌ agentId inválido:', agentId);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl">
                    <p className="text-red-500">Erro: ID do agente inválido ({agentId})</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-white rounded">
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const results = await searchMessages(query);
        setSearchResults(results);
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isSearching) {
                    setIsSearching(false);
                    setSearchQuery('');
                    setSearchResults([]);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isSearching, onClose]);

    if (!isOpen) {
        return null;
    }

    const toolButtons = [
        {
            id: 'directives' as const,
            icon: 'psychology',
            label: 'Diretrizes',
            description: 'Instruções do agente',
            counter: 0,
            counterClass: 'bg-[#00FF7F]/20 text-[#00FF7F]'
        },
        {
            id: 'props' as const,
            icon: 'settings',
            label: 'Properties',
            description: 'Configurações do agente',
            counter: propsItems.length,
            counterClass: 'bg-white/10'
        },
        {
            id: 'queue' as const,
            icon: 'list',
            label: 'Queue',
            description: 'Fila de execução',
            counter: queueItems.length,
            counterClass: 'bg-blue-500/20 text-blue-300'
        },
        {
            id: 'tasks' as const,
            icon: 'check_circle',
            label: 'Tasks',
            description: 'Acompanhamento de tarefas',
            counter: taskItems.length,
            counterClass: 'bg-green-500/20 text-green-300'
        },
        {
            id: 'plan' as const,
            icon: 'dashboard',
            label: 'Plan',
            description: 'Plano de ação',
            counter: planItems.length,
            counterClass: 'bg-purple-500/20 text-purple-300'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex animate-fade-in bg-background-light dark:bg-background-dark">
            <div className="flex h-full w-full">
                <aside
                    className="border-r border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark transition-all duration-300"
                    style={{
                        width: sidebarCollapsed ? '72px' : '280px'
                    }}
                >
                    <div className="flex h-full flex-col">
                        <header className="border-b border-gray-300 dark:border-gray-700 px-6 py-5">
                            <div className="flex items-center justify-between">
                                {!sidebarCollapsed && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark">Tools</h2>
                                        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">Workspace utilities</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setSidebarCollapsed((prev) => !prev)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5"
                                >
                                    <span className="material-icons-outlined text-lg">
                                        {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                                    </span>
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-3 py-4">
                            {!sidebarCollapsed && (
                                <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Active tools
                                </p>
                            )}
                            <div className="space-y-2">
                                {toolButtons.map((tool) => {
                                    const isActive = activeTool === tool.id;
                                    return (
                                        <button
                                            key={tool.id}
                                            type="button"
                                            onClick={() => setActiveTool(isActive ? null : tool.id)}
                                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                                                isActive ? 'bg-white/10 text-white shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white group-hover:bg-white/20">
                                                <span className="material-icons-outlined text-lg">{tool.icon}</span>
                                            </div>
                                            {!sidebarCollapsed && (
                                                <>
                                                    <div className="flex-1 text-left">
                                                        <div className="text-sm font-medium">{tool.label}</div>
                                                        <div className="text-xs text-gray-400">{tool.description}</div>
                                                    </div>
                                                    {tool.counter > 0 && (
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tool.counterClass}`}>
                                                            {tool.counter}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {!sidebarCollapsed && (
                                <>
                                    <div className="my-6 border-t" style={{ borderColor: '#444444' }} />
                                    <div className="space-y-2 px-3 text-xs text-gray-400">
                                        <div className="flex items-center justify-between">
                                            <span>Mensagens</span>
                                            <span className="text-white">{messages.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Ferramentas ativas</span>
                                            <span className="text-white">
                                                {[propsItems.length, queueItems.length, taskItems.length, planItems.length].filter((n) => n > 0)
                                                    .length}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <footer className="border-t p-4" style={{ borderColor: '#444444' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-red-500/10 hover:text-red-300"
                            >
                                <span className="material-icons-outlined text-lg">close</span>
                                {!sidebarCollapsed && <span>Fechar</span>}
                            </button>
                        </footer>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col bg-background-light dark:bg-background-dark">
                    <div className="border-b border-gray-300 dark:border-gray-700 px-8 py-4">
                        <div className="mx-auto flex max-w-3xl items-center justify-between">
                            <div>
                                <h1 className="text-lg font-medium text-on-surface-light dark:text-on-surface-dark">{agentTitle}</h1>
                                <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">{agentType}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-mono text-gray-600">{internalCode}</span>
                                <div className="relative">
                                    <input
                                        value={searchQuery}
                                        onChange={(event) => handleSearch(event.target.value)}
                                        placeholder="Buscar no histórico"
                                        className="w-64 rounded-lg border px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                                        style={{ backgroundColor: '#2a2a2a', borderColor: isSearching ? '#666666' : '#3a3a3a' }}
                                    />
                                    <span className="material-icons-outlined pointer-events-none absolute right-3 top-2.5 text-sm text-gray-500">
                                        search
                                    </span>
                                    {isSearching && searchResults.length > 0 && (
                                        <div
                                            className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border shadow-xl"
                                            style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                                        >
                                            {searchResults.map((result) => (
                                                <button
                                                    type="button"
                                                    key={result.id}
                                                    onClick={() => {
                                                        setIsSearching(false);
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/5"
                                                >
                                                    <div className="text-xs text-gray-500">
                                                        {result.sender === 'user' ? 'Você' : agentTitle} —{' '}
                                                        {result.timestamp.toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <div className="line-clamp-2 text-sm text-gray-100">{result.message}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                {error && (
                    <div className="px-8 pt-4">
                        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    </div>
                )}

                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="mx-auto flex max-w-3xl flex-col space-y-6">
                            {loading ? (
                                <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-sm text-gray-300">
                                    Carregando histórico do agente...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
                                    <p className="text-base font-medium text-white">Olá! Sou {agentTitle}.</p>
                                    <p className="mt-2 text-sm text-gray-300">
                                        {agentDescription || 'Envie sua primeira mensagem para iniciarmos a conversa.'}
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={msg.id}
                                        className="flex animate-slide-up items-start gap-4"
                                        style={{ animationDelay: `${index * 40}ms` }}
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                msg.sender === 'agent'
                                                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                                                    : 'bg-gray-800 text-gray-300'
                                            }`}
                                        >
                                            <span className="material-icons-outlined text-sm">
                                                {msg.sender === 'agent' ? 'auto_awesome' : 'person'}
                                            </span>
                                        </div>
                                        <div className="group flex-1">
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                                                {msg.message}
                                            </div>
                                            <span className="mt-2 block text-xs text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
                                                {msg.timestamp.toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}

                            {isAgentTyping && !loading && (
                                <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                        <span className="material-icons-outlined text-sm">auto_awesome</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="border-t border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark px-8 py-6">
                        <div className="mx-auto max-w-3xl">
                            <div
                                className="relative rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition focus-within:border-primary"
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={inputMessage}
                                    onChange={(event) => setInputMessage(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Escreva sua mensagem..."
                                    rows={1}
                                    disabled={isSending || loading}
                                    className={`w-full resize-none bg-transparent px-6 py-4 pr-14 text-sm text-on-surface-light dark:text-on-surface-dark placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                                        isSending || loading ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                    style={{ minHeight: '56px', maxHeight: '200px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={!canSend}
                                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                >
                                    <span className="material-icons-outlined text-sm">arrow_upward</span>
                                </button>
                            </div>
                            <p className="mt-3 text-center text-xs text-gray-600">
                                Pressione Enter para enviar • Shift + Enter para nova linha
                            </p>
                        </div>
                    </div>
                </main>

                {activeTool && (
                    <aside className="w-80 border-l border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
                        <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 px-6 py-5">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-on-surface-light dark:text-on-surface-dark">{activeTool}</h3>
                                <button
                                    type="button"
                                    onClick={() => setActiveTool(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5"
                                >
                                    <span className="material-icons-outlined text-sm">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ color: '#e8e8e8' }}>
                                {activeTool === 'directives' && (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-[#00FF7F]/30 bg-[#00FF7F]/5 px-4 py-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-outlined text-[#00FF7F] text-lg">info</span>
                                                <h3 className="text-sm font-semibold text-[#00FF7F]">Diretrizes do Agente</h3>
                                            </div>
                                            {agentData ? (
                                                <div className="space-y-3 text-xs text-gray-300">
                                                    <div>
                                                        <p className="font-semibold text-white mb-1">Função:</p>
                                                        <p>{agentData.agentType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white mb-1">Ato:</p>
                                                        <p>{agentData.act}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white mb-1">Prompt do Sistema:</p>
                                                        <p className="whitespace-pre-wrap">{agentData.systemPrompt}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Carregando diretrizes...</p>
                                            )}
                                        </div>

                                        {progressData && (
                                            <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="material-icons-outlined text-blue-400 text-lg">trending_up</span>
                                                    <h3 className="text-sm font-semibold text-white">Seu Progresso</h3>
                                                </div>
                                                <div className="space-y-2 text-xs">
                                                    <div>
                                                        <p className="text-gray-400">Etapa Atual:</p>
                                                        <p className="text-white font-medium">{progressData.currentStep}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Descrição:</p>
                                                        <p className="text-gray-300">{progressData.stepDescription}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Progresso:</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-[#00FF7F] transition-all duration-300"
                                                                    style={{ width: `${progressData.contextProgress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-white font-semibold">{progressData.contextProgress}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-700">
                                                        <p className="text-gray-400">Última atualização:</p>
                                                        <p className="text-gray-300">{new Date(progressData.updatedAt).toLocaleString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {sessionHash && (
                                            <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="material-icons-outlined text-purple-400 text-lg">fingerprint</span>
                                                    <h3 className="text-sm font-semibold text-white">Sessão Atual</h3>
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div>
                                                        <p className="text-gray-400">Hash:</p>
                                                        <p className="text-gray-300 font-mono break-all">{sessionHash.substring(0, 16)}...</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Mensagens:</p>
                                                        <p className="text-white">{messages.length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTool === 'props' && (
                                    <div className="space-y-3">
                                        {propsItems.length === 0 ? (
                                            <p className="text-sm text-gray-500">Nenhuma propriedade configurada.</p>
                                        ) : (
                                            propsItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border px-4 py-3"
                                                    style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}
                                                >
                                                    <p className="text-xs font-semibold text-white">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.value}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTool === 'queue' && (
                                    <div className="space-y-3">
                                        {queueItems.length === 0 ? (
                                            <p className="text-sm text-gray-500">Queue vazia.</p>
                                        ) : (
                                            queueItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border px-4 py-3"
                                                    style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}
                                                >
                                                    <p className="text-xs text-white">{item.task}</p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {item.timestamp.toLocaleString('pt-BR')}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTool === 'tasks' && (
                                    <div className="space-y-3">
                                        {taskItems.length === 0 ? (
                                            <p className="text-sm text-gray-500">Nenhuma tarefa registrada.</p>
                                        ) : (
                                            taskItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border px-4 py-3"
                                                    style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}
                                                >
                                                    <p className="text-xs text-white">{item.title}</p>
                                                    <p className="text-xs text-gray-400">Status: {item.status}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTool === 'plan' && (
                                    <div className="space-y-3">
                                        {planItems.length === 0 ? (
                                            <p className="text-sm text-gray-500">Nenhum plano ativo.</p>
                                        ) : (
                                            planItems.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    className="space-y-3 rounded-xl border px-4 py-3"
                                                    style={{ backgroundColor: '#2a2a2a', borderColor: '#444444' }}
                                                >
                                                    <div className="text-xs font-semibold text-white">{plan.title}</div>
                                                    <ul className="space-y-1 text-xs text-gray-400">
                                                        {plan.steps.map((step, index) => (
                                                            <li key={index} className="flex gap-2">
                                                                <span>{index + 1}.</span>
                                                                <span>{step}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {plan.status === 'pending_approval' && (
                                                        <div className="flex gap-2 border-t pt-3" style={{ borderColor: '#444444' }}>
                                                            <button className="flex-1 rounded-lg bg-white py-2 text-xs font-medium text-black transition hover:bg-gray-100">
                                                                Aprovar
                                                            </button>
                                                            <button className="flex-1 rounded-lg py-2 text-xs font-medium text-white transition hover:opacity-80" style={{ backgroundColor: '#444444' }}>
                                                                Rejeitar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default PremiumChat;
