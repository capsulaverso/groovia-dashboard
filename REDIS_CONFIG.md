# 🔴 CONFIGURAÇÃO DO REDIS

## 📋 Credenciais

```
Host: capsuladev_redis
Port: 6379
Username: default
Password: @Capsula97300*
URL: redis://default:@Capsula97300*@capsuladev_redis:6379
```

## ⚙️ Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Redis Cache
REDIS_HOST=capsuladev_redis
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=@Capsula97300*
REDIS_URL=redis://default:@Capsula97300*@capsuladev_redis:6379
```

## ✅ Cliente Configurado

O cliente Redis já está configurado em `server/redis.ts` com:
- ✅ Reconnect automático
- ✅ Event handlers (connect, error, ready)
- ✅ Helper functions (get, set, delete, etc.)
- ✅ Cache keys padronizados
- ✅ TTLs configuráveis
- ✅ Rate limiting
- ✅ Health check
- ✅ Graceful shutdown

## 🚀 Uso Básico

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from './server/redis';

// Salvar no cache
await cache.set(CACHE_KEYS.agent(123), agentData, CACHE_TTL.LONG);

// Buscar do cache
const agent = await cache.get(CACHE_KEYS.agent(123));

// Deletar do cache
await cache.delete(CACHE_KEYS.agent(123));

// Limpar padrão
await cache.deletePattern('agents:*');
```

## 📊 Endpoints Implementados

### **GET /api/cache/stats**
Retorna estatísticas do cache:
```json
{
  "connected": true,
  "keys": 42,
  "memory": "1.5M",
  "uptime": 3600
}
```

### **DELETE /api/cache/clear**
Limpa todo o cache (admin apenas)

### **GET /api/cache/health**
Health check do Redis

## 🎯 Use Cases Implementados

1. **Cache de Agentes**
   - Lista de agentes por cliente
   - Dados individuais de agente
   - TTL: 1 hora

2. **Cache de Conversas**
   - Histórico de mensagens
   - Lista de conversas do usuário
   - TTL: 5 minutos

3. **Cache de Respostas AI**
   - Evita chamadas repetidas à API
   - TTL: 30 minutos

4. **Rate Limiting**
   - Limita requisições por IP/usuário
   - Janela de 1 minuto
   - Máximo configurável

5. **Analytics**
   - Contadores de eventos
   - Métricas de uso
   - TTL: 24 horas

## 🔧 Testes

```bash
# Testar conexão
npx tsx test-redis.ts
```

## ⚠️ Troubleshooting

### Erro de conexão
- Verificar se Redis está rodando
- Verificar credenciais
- Verificar firewall/rede

### Cache não funciona
- Verificar logs do Redis
- Verificar espaço em disco
- Verificar TTLs configurados

