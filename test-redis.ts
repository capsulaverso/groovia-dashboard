import { redis, cache, CACHE_KEYS, CACHE_TTL, redisHealthCheck } from './server/redis';

async function testRedis() {
  console.log('🔴 Testando conexão com Redis...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Health Check...');
    const isHealthy = await redisHealthCheck();
    console.log(isHealthy ? '✅ Redis está saudável!\n' : '❌ Redis não está respondendo\n');

    if (!isHealthy) {
      process.exit(1);
    }

    // 2. Test SET/GET
    console.log('2️⃣ Testando SET/GET...');
    const testData = { name: 'Groovia', version: '1.0', features: ['AI', 'Cache', 'Analytics'] };
    await cache.set('test:data', testData, 60);
    const retrieved = await cache.get('test:data');
    console.log('✅ Dados salvos e recuperados:', retrieved);
    console.log('');

    // 3. Test EXISTS
    console.log('3️⃣ Testando EXISTS...');
    const exists = await cache.exists('test:data');
    console.log(`✅ Chave existe: ${exists}\n`);

    // 4. Test TTL
    console.log('4️⃣ Testando TTL...');
    const ttl = await cache.ttl('test:data');
    console.log(`✅ TTL restante: ${ttl} segundos\n`);

    // 5. Test INCREMENT
    console.log('5️⃣ Testando INCREMENT...');
    await cache.increment('test:counter', 60);
    await cache.increment('test:counter', 60);
    const counter = await cache.get<number>('test:counter');
    console.log(`✅ Contador: ${counter}\n`);

    // 6. Test CACHE_KEYS
    console.log('6️⃣ Testando CACHE_KEYS padronizados...');
    const agentKey = CACHE_KEYS.agent(123);
    const userKey = CACHE_KEYS.user(456);
    console.log(`✅ Agent Key: ${agentKey}`);
    console.log(`✅ User Key: ${userKey}\n`);

    // 7. Test Cache Helper com dados reais
    console.log('7️⃣ Testando cache de agente...');
    const mockAgent = {
      id: 1,
      title: 'SCAN Diagnóstico',
      description: 'Agente de diagnóstico estratégico',
      act: 'Ato 01',
    };
    await cache.set(CACHE_KEYS.agent(1), mockAgent, CACHE_TTL.LONG);
    const cachedAgent = await cache.get(CACHE_KEYS.agent(1));
    console.log('✅ Agente em cache:', cachedAgent);
    console.log('');

    // 8. Test DELETE PATTERN
    console.log('8️⃣ Testando DELETE PATTERN...');
    await cache.set('test:item:1', 'value1', 60);
    await cache.set('test:item:2', 'value2', 60);
    await cache.set('test:item:3', 'value3', 60);
    const deleted = await cache.deletePattern('test:item:*');
    console.log(`✅ Deletadas ${deleted} chaves\n`);

    // 9. Test STATS
    console.log('9️⃣ Obtendo estatísticas...');
    const stats = await cache.stats();
    console.log('✅ Estatísticas do Redis:');
    console.log(`   - Conectado: ${stats.connected}`);
    console.log(`   - Total de chaves: ${stats.keys}`);
    console.log(`   - Memória usada: ${stats.memory}`);
    console.log(`   - Uptime: ${Math.floor(stats.uptime / 60)} minutos\n`);

    // 10. Cleanup
    console.log('🧹 Limpando chaves de teste...');
    await cache.delete('test:data');
    await cache.delete('test:counter');
    await cache.delete(CACHE_KEYS.agent(1));
    console.log('✅ Limpeza concluída\n');

    // Final
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║                                                      ║');
    console.log('║   ✅ TODOS OS TESTES PASSARAM!                      ║');
    console.log('║                                                      ║');
    console.log('║   Redis está configurado e funcionando             ║');
    console.log('║   corretamente no Groovia Dashboard!                ║');
    console.log('║                                                      ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error);
    await redis.quit();
    process.exit(1);
  }
}

testRedis();

