/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║   REDIS CLIENT - CACHE E PERFORMANCE                     ║
 * ║   Groovia Dashboard powered by Capsula Aeon®             ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import Redis from 'ioredis';

// Configuração do Redis
const REDIS_CONFIG = {
  host: 'capsuladev_redis',
  port: 6379,
  username: 'default',
  password: '@Capsula97300*',
  retryStrategy: (times: number) => {
    // Não tentar reconectar indefinidamente
    if (times > 3) {
      console.log('⚠️  Redis não disponível - continuando sem cache');
      return null; // Para de tentar
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false, // Desabilitar para evitar travamento
  lazyConnect: true, // Conectar apenas quando necessário
  enableOfflineQueue: false, // Não enfileirar comandos offline
};

// Criar cliente Redis
export const redis = new Redis(REDIS_CONFIG);

// Fallback em memória se Redis não estiver disponível
const memoryCache = new Map<string, { value: any; expiry: number }>();
let redisAvailable = false;

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis conectado com sucesso!');
  redisAvailable = true;
});

redis.on('ready', () => {
  console.log('🚀 Redis pronto para uso');
  redisAvailable = true;
});

redis.on('error', (error) => {
  console.error('⚠️  Redis não disponível:', error.message);
  redisAvailable = false;
});

redis.on('close', () => {
  console.log('⚠️  Conexão com Redis fechada');
  redisAvailable = false;
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconectando ao Redis...');
});

/**
 * Cache Helper Functions
 */

// TTL padrão: 1 hora
const DEFAULT_TTL = 60 * 60;

export const cache = {
  /**
   * Buscar do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Tentar Redis primeiro
      if (redisAvailable) {
        const data = await redis.get(key);
        if (data) return JSON.parse(data) as T;
      }
      
      // Fallback para memória
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value as T;
      }
      
      // Limpar entrada expirada
      if (cached) {
        memoryCache.delete(key);
      }
      
      return null;
    } catch (error) {
      // Silenciar erro se Redis não estiver disponível
      return null;
    }
  },

  /**
   * Salvar no cache
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
    try {
      // Tentar Redis primeiro
      if (redisAvailable) {
        const serialized = JSON.stringify(value);
        await redis.setex(key, ttl, serialized);
      }
      
      // Sempre salvar em memória como fallback
      memoryCache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000),
      });
      
      return true;
    } catch (error) {
      // Fallback apenas para memória
      memoryCache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000),
      });
      return true;
    }
  },

  /**
   * Deletar do cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar cache [${key}]:`, error);
      return false;
    }
  },

  /**
   * Deletar múltiplas chaves por padrão
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Erro ao deletar padrão [${pattern}]:`, error);
      return 0;
    }
  },

  /**
   * Verificar se chave existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Erro ao verificar existência [${key}]:`, error);
      return false;
    }
  },

  /**
   * Incrementar contador
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttl) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error(`Erro ao incrementar [${key}]:`, error);
      return 0;
    }
  },

  /**
   * Obter TTL restante
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Erro ao obter TTL [${key}]:`, error);
      return -1;
    }
  },

  /**
   * Limpar todo o cache
   */
  async flush(): Promise<boolean> {
    try {
      await redis.flushdb();
      console.log('🧹 Cache Redis limpo');
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  },

  /**
   * Obter estatísticas do cache
   */
  async stats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
    uptime: number;
  }> {
    try {
      const info = await redis.info('stats');
      const dbSize = await redis.dbsize();
      const memory = await redis.info('memory');
      
      // Parse info strings
      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
      const memoryMatch = memory.match(/used_memory_human:(.+)/);

      return {
        connected: redis.status === 'ready',
        keys: dbSize,
        memory: memoryMatch ? memoryMatch[1].trim() : 'N/A',
        uptime: uptimeMatch ? parseInt(uptimeMatch[1]) : 0,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        connected: false,
        keys: 0,
        memory: 'N/A',
        uptime: 0,
      };
    }
  },
};

/**
 * Cache Keys (padronizados)
 */
export const CACHE_KEYS = {
  // Agentes
  agents: (clientId: number) => `agents:client:${clientId}`,
  agent: (agentId: number) => `agent:${agentId}`,
  
  // Conversas
  conversation: (conversationId: number) => `conversation:${conversationId}`,
  conversationMessages: (conversationId: number) => `messages:conversation:${conversationId}`,
  userConversations: (userId: number) => `conversations:user:${userId}`,
  
  // AI Responses (para evitar chamadas repetidas)
  aiResponse: (prompt: string) => {
    const hash = Buffer.from(prompt).toString('base64').slice(0, 32);
    return `ai:response:${hash}`;
  },
  
  // Usuários
  user: (userId: number) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `rate:${identifier}`,
  
  // Capsula Aeon
  capsulaStatus: () => 'capsula:status',
  capsulaMetrics: (period: string) => `capsula:metrics:${period}`,
  
  // Analytics
  analytics: (key: string) => `analytics:${key}`,
};

/**
 * Cache TTLs (em segundos)
 */
export const CACHE_TTL = {
  SHORT: 60,           // 1 minuto
  MEDIUM: 300,         // 5 minutos
  LONG: 3600,          // 1 hora
  DAY: 86400,          // 24 horas
  WEEK: 604800,        // 7 dias
  AI_RESPONSE: 1800,   // 30 minutos (respostas de IA)
  RATE_LIMIT: 60,      // 1 minuto (rate limiting)
};

/**
 * Decorator para cache automático
 */
export function Cacheable(ttl: number = DEFAULT_TTL) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${propertyKey}:${JSON.stringify(args)}`;
      
      // Tentar buscar do cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        console.log(`📦 Cache HIT: ${propertyKey}`);
        return cached;
      }

      // Executar método original
      console.log(`🔍 Cache MISS: ${propertyKey}`);
      const result = await originalMethod.apply(this, args);

      // Salvar no cache
      await cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Middleware de Rate Limiting
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const key = CACHE_KEYS.rateLimit(identifier);
  
  try {
    const current = await cache.increment(key, windowSeconds);
    const ttl = await cache.ttl(key);
    
    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
      resetAt: Date.now() + (ttl * 1000),
    };
  } catch (error) {
    console.error('Erro no rate limiting:', error);
    // Em caso de erro, permitir a requisição
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: Date.now() + (windowSeconds * 1000),
    };
  }
}

/**
 * Health check do Redis
 */
export async function redisHealthCheck(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check falhou:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Fechando conexão com Redis...');
  await redis.quit();
});

process.on('SIGINT', async () => {
  console.log('🛑 Fechando conexão com Redis...');
  await redis.quit();
});

export default redis;

