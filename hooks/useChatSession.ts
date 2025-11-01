import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from './useApi';
import { useUser } from './useUser';
import type { ChatMessage, MessageType } from '../types';

interface ConversationRecord {
    id: number;
    agentId: number;
    userId: number;
    clientId: number;
    title: string;
    lastMessage?: string | null;
    messageCount?: number | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
}

interface ApiMessage {
    id: number;
    conversationId: number;
    sender: 'user' | 'agent';
    content: string;
    messageType?: MessageType | null;
    metadata?: Record<string, unknown> | null;
    timestamp?: string | Date | null;
}

interface AgentRespondResponse {
    success: boolean;
    message?: ApiMessage;
    usage?: {
        provider?: string;
        tokensUsed?: number | null;
        latencyMs?: number | null;
        cachedResponse?: boolean;
    };
    error?: string;
}

interface UseChatSessionOptions {
    agentId?: number;
    agentTitle?: string;
    enabled?: boolean;
}

interface UseChatSessionResult {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    conversationId: number | null;
    sessionHash: string | null;
    isSending: boolean;
    isAgentTyping: boolean;
    sendMessage: (content: string) => Promise<ChatMessage | null>;
    refresh: () => Promise<void>;
    reset: () => void;
    getSessionMetrics: () => Promise<SessionMetrics | null>;
}

interface SessionMetrics {
    sessionHash: string;
    startedAt: Date | string;
    lastActivityAt: Date | string;
    duration: number;
    messagesCount: number;
    totalTokensUsed: number;
    totalCostUsd: string;
    avgLatencyMs: number | null;
    status: string;
    costPerMessage: string;
    tokensPerMessage: number;
}

const mapApiMessageToChatMessage = (message: ApiMessage): ChatMessage => {
    const timestampValue = message.timestamp ? new Date(message.timestamp) : new Date();

    return {
        id: String(message.id ?? `${message.sender}-${timestampValue.getTime()}`),
        sender: message.sender,
        message: message.content ?? '',
        messageType: (message.messageType ?? 'text') as MessageType,
        metadata: (message.metadata ?? undefined) as ChatMessage['metadata'],
        timestamp: timestampValue,
    };
};

/**
 * Atualiza o progresso do usuário com base no número de mensagens
 */
const updateProgressBasedOnMessages = async (
    userId: number,
    agentId: number,
    clientId: number,
    messageCount: number
): Promise<void> => {
    try {
        // Calcular progresso baseado em mensagens (a cada 10 mensagens = 10% de progresso, máximo 100%)
        const contextProgress = Math.min(Math.floor(messageCount / 10) * 10, 100);
        
        if (contextProgress > 0) {
            await apiClient.put(
                `/users/${userId}/progress/${agentId}?clientId=${clientId}`,
                { contextProgress },
                true
            );
        }
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
    }
};

export const useChatSession = (options: UseChatSessionOptions): UseChatSessionResult => {
    const { agentId, agentTitle, enabled = true } = options;
    const { user } = useUser();
    
    console.log('🎬 useChatSession INICIALIZADO');
    console.log('📊 Options:', { agentId, agentTitle, enabled });
    console.log('👤 User:', { id: user?.id, clientId: user?.clientId });

    const [conversationId, setConversationId] = useState<number | null>(null);
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);

    const initializedRef = useRef<boolean>(false);
    const lastAgentIdRef = useRef<number | undefined>(undefined);

    const reset = useCallback(() => {
        setConversationId(null);
        setSessionHash(null);
        setMessages([]);
        setError(null);
        setIsSending(false);
        setIsAgentTyping(false);
        initializedRef.current = false;
    }, []);

    const normalizeMessages = useCallback((items: ApiMessage[] = []) => {
        return items.map(mapApiMessageToChatMessage);
    }, []);

    const ensureConversation = useCallback(async () => {
        console.log('🔍 [ensureConversation] Iniciando...');
        console.log('📊 Verificando condições:', { enabled, agentId, userId: user?.id, clientId: user?.clientId });
        
        if (!enabled || !agentId || !user?.id || !user?.clientId) {
            console.log('⏭️ Pulando: condições não atendidas');
            return;
        }

        console.log('✅ Todas condições OK! Criando/buscando conversa...');
        setLoading(true);
        setError(null);

        try {
            console.log('🌐 Buscando conversas do usuário...');
            const conversations = await apiClient.get<ConversationRecord[]>(`/users/${user.id}/conversations`);
            console.log('📦 Conversas encontradas:', conversations.length);
            
            let conversation = conversations.find((item) => item.agentId === agentId);
            console.log('🔎 Conversa existente para este agente?', !!conversation);

            if (!conversation) {
                console.log('🆕 Criando nova conversa...');
                conversation = await apiClient.post<ConversationRecord>(`/conversations`, {
                    userId: user.id,
                    agentId,
                    title: agentTitle || 'Conversa com agente',
                });
                console.log('✅ Conversa criada:', conversation);
            }

            console.log('🔢 Setando conversationId:', conversation.id);
            setConversationId(conversation.id);

            // Criar ou recuperar sessão com hash
            interface SessionResponse {
                id: number;
                sessionHash: string;
                conversationId: number | null;
                messagesCount: number;
            }

            console.log('🔐 Criando sessão...');
            const session = await apiClient.post<SessionResponse>('/sessions', {
                userId: user.id,
                agentId,
                clientId: user.clientId,
                conversationId: conversation.id,
            });

            setSessionHash(session.sessionHash);
            console.log(`✅ Sessão criada: ${session.sessionHash}`);

            console.log('📬 Buscando histórico de mensagens...');
            const history = await apiClient.get<ApiMessage[]>(`/conversations/${conversation.id}/messages`);
            console.log('📨 Mensagens carregadas:', history.length);
            
            setMessages(normalizeMessages(history));
            initializedRef.current = true;
            console.log('🏁 ensureConversation CONCLUÍDO!');
        } catch (fetchError) {
            console.error('❌ ERRO em ensureConversation:', fetchError);
            setError(fetchError instanceof Error ? fetchError.message : 'Não foi possível carregar a conversa');
        } finally {
            setLoading(false);
        }
    }, [agentId, agentTitle, enabled, normalizeMessages, user?.id, user?.clientId]);

    useEffect(() => {
        console.log('🔄 [useEffect] Verificando se deve chamar ensureConversation');
        console.log('📊 Estado:', { enabled, agentId, userId: user?.id });
        
        if (!enabled) {
            console.log('⏭️ enabled = false, pulando');
            return;
        }

        if (!agentId || !user?.id) {
            console.log('⏭️ agentId ou userId faltando:', { agentId, userId: user?.id });
            return;
        }

        if (lastAgentIdRef.current !== agentId) {
            console.log('🔄 Agente mudou! Resetando estado...');
            reset();
            lastAgentIdRef.current = agentId;
        }

        console.log('✅ Chamando ensureConversation...');
        ensureConversation();
    }, [agentId, enabled, ensureConversation, reset, user?.id]);

    const sendMessage = useCallback(
        async (content: string): Promise<ChatMessage | null> => {
            console.log('📨 [useChatSession] sendMessage chamado');
            console.log('📝 Content:', content);
            
            const trimmed = content?.trim();
            if (!trimmed) {
                console.warn('⚠️ Conteúdo vazio após trim');
                return null;
            }

            if (!conversationId || !agentId) {
                console.error('❌ Conversa não inicializada:', { conversationId, agentId });
                throw new Error('Conversa não inicializada. Tente novamente.');
            }

            console.log('✅ Criando mensagem otimista...');
            const tempId = `temp-${Date.now()}`;
            const now = new Date();
            const optimisticMessage: ChatMessage = {
                id: tempId,
                sender: 'user',
                message: trimmed,
                timestamp: now,
            };

            console.log('📤 Adicionando ao estado:', optimisticMessage);
            setMessages((prev) => {
                const newMessages = [...prev, optimisticMessage];
                console.log('📊 Total mensagens:', newMessages.length);
                return newMessages;
            });
            setIsSending(true);
            setError(null);

            try {
                console.log('🌐 Salvando mensagem na API...');
                const created = await apiClient.post<ApiMessage>(`/messages`, {
                    conversationId,
                    sender: 'user',
                    content: trimmed,
                    messageType: 'text',
                });
                console.log('✅ Mensagem salva:', created);

                const persistedUserMessage = mapApiMessageToChatMessage(created);
                console.log('🔄 Substituindo mensagem otimista pela persistida...');
                setMessages((prev) => prev.map((messageItem) => (messageItem.id === tempId ? persistedUserMessage : messageItem)));

                console.log('🤖 Agente digitando...');
                setIsAgentTyping(true);

                console.log('🚀 Solicitando resposta do agente...');
                const agentResponse = await apiClient.post<AgentRespondResponse>(`/agents/${agentId}/respond`, {
                    conversationId,
                    message: trimmed,
                });
                console.log('✅ Resposta do agente recebida:', agentResponse);

                if (!agentResponse?.success || !agentResponse.message) {
                    throw new Error(agentResponse?.error || 'Não foi possível obter a resposta do agente.');
                }

                const agentMessage = mapApiMessageToChatMessage(agentResponse.message);
                setMessages((prev) => {
                    const newMessages = [...prev, agentMessage];
                    
                    // Atualizar progresso baseado no número de mensagens
                    if (user?.id && user?.clientId && agentId) {
                        updateProgressBasedOnMessages(
                            user.id,
                            agentId,
                            user.clientId,
                            newMessages.length
                        );
                    }
                    
                    return newMessages;
                });
                return agentMessage;
            } catch (sendError) {
                console.error('Erro ao enviar mensagem:', sendError);
                setMessages((prev) => prev.filter((messageItem) => messageItem.id !== tempId));
                setError(sendError instanceof Error ? sendError.message : 'Erro ao enviar mensagem');
                throw sendError;
            } finally {
                setIsSending(false);
                setIsAgentTyping(false);
            }
        },
        [agentId, conversationId, user]
    );

    const refresh = useCallback(async () => {
        if (!conversationId || !agentId || !user?.id) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const history = await apiClient.get<ApiMessage[]>(`/conversations/${conversationId}/messages`);
            setMessages(normalizeMessages(history));
        } catch (refreshError) {
            console.error('Erro ao recarregar mensagens:', refreshError);
            setError(refreshError instanceof Error ? refreshError.message : 'Erro ao recarregar mensagens');
        } finally {
            setLoading(false);
        }
    }, [agentId, conversationId, normalizeMessages, user?.id]);

    const getSessionMetrics = useCallback(async (): Promise<SessionMetrics | null> => {
        if (!sessionHash) {
            return null;
        }

        try {
            const metrics = await apiClient.get<SessionMetrics>(`/sessions/${sessionHash}/metrics`);
            return metrics;
        } catch (metricsError) {
            console.error('Erro ao buscar métricas:', metricsError);
            return null;
        }
    }, [sessionHash]);

    const value = useMemo<UseChatSessionResult>(
        () => ({
            messages,
            loading,
            error,
            conversationId,
            sessionHash,
            isSending,
            isAgentTyping,
            sendMessage,
            refresh,
            reset,
            getSessionMetrics,
        }),
        [conversationId, sessionHash, error, isAgentTyping, isSending, loading, messages, refresh, reset, sendMessage, getSessionMetrics]
    );

    return value;
};
