import crypto from 'crypto';
import { db } from './db.js';
import { chatSessions, type InsertChatSession, type ChatSession } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Gera um hash único para a sessão baseado em userId + agentId + timestamp
 */
export function generateSessionHash(userId: number, agentId: number): string {
  const timestamp = Date.now();
  const data = `${userId}-${agentId}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Cria ou recupera uma sessão ativa para um usuário e agente
 */
export async function getOrCreateSession(
  userId: number,
  agentId: number,
  clientId: number,
  conversationId?: number | null
): Promise<ChatSession> {
  try {
    // Buscar sessão ativa existente
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.userId, userId),
          eq(chatSessions.agentId, agentId),
          eq(chatSessions.status, 'active')
        )
      )
      .limit(1);

    if (existingSession.length > 0) {
      // Atualizar lastActivityAt
      await db
        .update(chatSessions)
        .set({ 
          lastActivityAt: new Date(),
          conversationId: conversationId ?? existingSession[0].conversationId
        })
        .where(eq(chatSessions.id, existingSession[0].id));
      
      return existingSession[0];
    }

    // Criar nova sessão
    const sessionHash = generateSessionHash(userId, agentId);
    const newSession: InsertChatSession = {
      sessionHash,
      clientId,
      userId,
      agentId,
      conversationId: conversationId ?? null,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messagesCount: 0,
      totalTokensUsed: 0,
      totalCostUsd: '0.00',
      status: 'active',
      metadata: {},
    };

    const created = await db.insert(chatSessions).values(newSession).returning();
    return created[0];
  } catch (error) {
    console.error('❌ Erro ao criar/recuperar sessão:', error);
    throw error;
  }
}

/**
 * Atualiza as métricas de uma sessão
 */
export async function updateSessionMetrics(
  sessionHash: string,
  metrics: {
    messagesCount?: number;
    tokensUsed?: number;
    latencyMs?: number;
    costUsd?: string;
  }
): Promise<void> {
  try {
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionHash, sessionHash))
      .limit(1);

    if (session.length === 0) {
      console.warn(`⚠️ Sessão ${sessionHash} não encontrada`);
      return;
    }

    const current = session[0];
    const updates: Partial<ChatSession> = {
      lastActivityAt: new Date(),
    };

    if (metrics.messagesCount !== undefined) {
      updates.messagesCount = current.messagesCount + metrics.messagesCount;
    }

    if (metrics.tokensUsed !== undefined) {
      updates.totalTokensUsed = current.totalTokensUsed + metrics.tokensUsed;
    }

    if (metrics.latencyMs !== undefined) {
      // Calcular média móvel de latência
      const currentAvg = current.avgLatencyMs || 0;
      const currentCount = current.messagesCount || 1;
      updates.avgLatencyMs = Math.round(
        (currentAvg * currentCount + metrics.latencyMs) / (currentCount + 1)
      );
    }

    if (metrics.costUsd !== undefined) {
      const currentCost = parseFloat(current.totalCostUsd || '0.00');
      const additionalCost = parseFloat(metrics.costUsd);
      updates.totalCostUsd = (currentCost + additionalCost).toFixed(6);
    }

    await db
      .update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.sessionHash, sessionHash));

    console.log(`✅ Métricas atualizadas para sessão ${sessionHash}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar métricas:', error);
    throw error;
  }
}

/**
 * Encerra uma sessão
 */
export async function closeSession(sessionHash: string): Promise<void> {
  try {
    await db
      .update(chatSessions)
      .set({ 
        status: 'closed',
        lastActivityAt: new Date()
      })
      .where(eq(chatSessions.sessionHash, sessionHash));

    console.log(`✅ Sessão ${sessionHash} encerrada`);
  } catch (error) {
    console.error('❌ Erro ao encerrar sessão:', error);
    throw error;
  }
}

/**
 * Busca uma sessão pelo hash
 */
export async function getSessionByHash(sessionHash: string): Promise<ChatSession | null> {
  try {
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionHash, sessionHash))
      .limit(1);

    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error('❌ Erro ao buscar sessão:', error);
    return null;
  }
}

/**
 * Calcula custo estimado baseado em tokens (GPT-4o-mini)
 * Input: $0.150 / 1M tokens
 * Output: $0.600 / 1M tokens
 */
export function calculateCost(inputTokens: number, outputTokens: number): string {
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.60;
  return (inputCost + outputCost).toFixed(6);
}

