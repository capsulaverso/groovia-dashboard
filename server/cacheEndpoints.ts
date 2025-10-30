/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║   CACHE ENDPOINTS - REDIS MANAGEMENT                     ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import type { Express, Request, Response } from 'express';
import { cache, redisHealthCheck, CACHE_KEYS } from './redis.js';

export function setupCacheEndpoints(app: Express, requireAuth: Function) {
  
  /**
   * GET /api/cache/stats
   * Retorna estatísticas do cache Redis
   */
  app.get('/api/cache/stats', async (req: Request, res: Response) => {
    const auth = await requireAuth(req, res);
    if (!auth || auth.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    try {
      const stats = await cache.stats();
      res.json({
        ...stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
      res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
  });

  /**
   * GET /api/cache/health
   * Health check do Redis
   */
  app.get('/api/cache/health', async (req: Request, res: Response) => {
    try {
      const isHealthy = await redisHealthCheck();
      res.json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'Redis',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'Redis',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * DELETE /api/cache/clear
   * Limpa todo o cache (admin apenas)
   */
  app.delete('/api/cache/clear', async (req: Request, res: Response) => {
    const auth = await requireAuth(req, res);
    if (!auth || auth.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    try {
      const success = await cache.flush();
      res.json({
        success,
        message: success ? 'Cache limpo com sucesso' : 'Falha ao limpar cache',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      res.status(500).json({ error: 'Erro ao limpar cache' });
    }
  });

  /**
   * DELETE /api/cache/:pattern
   * Limpa chaves por padrão (admin apenas)
   */
  app.delete('/api/cache/pattern/:pattern', async (req: Request, res: Response) => {
    const auth = await requireAuth(req, res);
    if (!auth || auth.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    try {
      const { pattern } = req.params;
      const deletedCount = await cache.deletePattern(pattern);
      res.json({
        success: true,
        deletedCount,
        pattern,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao deletar padrão:', error);
      res.status(500).json({ error: 'Erro ao deletar padrão' });
    }
  });

  /**
   * POST /api/cache/invalidate/agents
   * Invalida cache de agentes para um cliente
   */
  app.post('/api/cache/invalidate/agents', async (req: Request, res: Response) => {
    const auth = await requireAuth(req, res);
    if (!auth) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      const { clientId } = req.body;
      const key = CACHE_KEYS.agents(clientId || auth.clientId);
      await cache.delete(key);
      
      res.json({
        success: true,
        message: 'Cache de agentes invalidado',
        key,
      });
    } catch (error) {
      console.error('Erro ao invalidar cache de agentes:', error);
      res.status(500).json({ error: 'Erro ao invalidar cache' });
    }
  });

  /**
   * POST /api/cache/invalidate/conversations
   * Invalida cache de conversas para um usuário
   */
  app.post('/api/cache/invalidate/conversations', async (req: Request, res: Response) => {
    const auth = await requireAuth(req, res);
    if (!auth) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      const { userId } = req.body;
      const key = CACHE_KEYS.userConversations(userId || auth.userId);
      await cache.delete(key);
      
      res.json({
        success: true,
        message: 'Cache de conversas invalidado',
        key,
      });
    } catch (error) {
      console.error('Erro ao invalidar cache de conversas:', error);
      res.status(500).json({ error: 'Erro ao invalidar cache' });
    }
  });
}

