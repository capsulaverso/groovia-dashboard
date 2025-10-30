import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = 'postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require';

console.log('🔍 Testando conexão com o banco de dados...');
console.log(`📍 URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);

const pool = new Pool({ connectionString: DATABASE_URL });

async function testConnection() {
  try {
    console.log('\n⏳ Conectando...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('\n✅ CONEXÃO BEM SUCEDIDA!');
    console.log('📅 Data/Hora do servidor:', result.rows[0].current_time);
    console.log('🐘 Versão PostgreSQL:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Verificar estrutura da tabela agents
    console.log('\n🔍 Estrutura da tabela agents:');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      ORDER BY ordinal_position
    `);
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Testar query nos agentes
    console.log('\n🔍 Buscando agentes...');
    const agents = await pool.query('SELECT id, title, internal_code FROM agents ORDER BY id LIMIT 10');
    console.log(`✅ Encontrados ${agents.rows.length} agentes:`);
    agents.rows.forEach(agent => {
      console.log(`   ${agent.id}. ${agent.title} (${agent.internal_code || 'sem código'})`);
    });
    
    await pool.end();
    console.log('\n✅ Teste concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO NA CONEXÃO:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();

