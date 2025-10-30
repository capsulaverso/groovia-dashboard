import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = 'postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require';
const pool = new Pool({ connectionString: DATABASE_URL });

const agentsAto1 = [
  'AGENT_SCAN_01',
  'AGENT_CLARITY_02',
  'AGENT_MARKET_03',
  'AGENT_PERSONA_04',
  'AGENT_INTELLIGENCE_05'
];

async function updateAgents() {
  try {
    console.log('🔧 Atualizando campo "act" dos agentes...\n');
    
    for (const code of agentsAto1) {
      const result = await pool.query(
        'UPDATE agents SET act = $1 WHERE internal_code = $2 RETURNING id, title, act',
        ['Ato 01', code]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${code}: ${result.rows[0].title} → act = "Ato 01"`);
      } else {
        console.log(`⚠️  ${code}: Agente não encontrado`);
      }
    }
    
    console.log('\n✅ Atualização concluída!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

updateAgents();

