import { db } from './db';
import { agents } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateAgentsModel() {
  console.log('🔄 Atualizando modelos de IA dos agentes...');

  try {
    // Atualizar todos os agentes do Ato 01 para usar GPT-4o-mini
    const agentCodes = [
      'AGENT_SCAN_01',
      'AGENT_CLARITY_02',
      'AGENT_MARKET_03',
      'AGENT_PERSONA_04',
      'AGENT_INTELLIGENCE_05'
    ];

    for (const code of agentCodes) {
      const result = await db
        .update(agents)
        .set({
          aiProvider: 'openai',
          aiModel: 'gpt-4o-mini',
          updatedAt: new Date(),
        })
        .where(eq(agents.internalCode, code))
        .returning();

      if (result.length > 0) {
        console.log(`✅ ${code}: Atualizado para gpt-4o-mini`);
      } else {
        console.log(`⚠️ ${code}: Não encontrado`);
      }
    }

    console.log('\n✅ Todos os agentes atualizados!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar agentes:', error);
    process.exit(1);
  }
}

updateAgentsModel();

