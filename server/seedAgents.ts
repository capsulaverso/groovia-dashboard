import { db } from './db.js';
import { agents } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { AGENTS_METADATA } from './agents/agent-prompts.js';

/**
 * Popula o banco com os 5 Agentes Inteligentes do Ato 1
 */
export async function seedIntelligentAgents() {
  console.log('🤖 Populando 5 Agentes Inteligentes (Ato 1)...');

  const clientId = 1; // Cliente padrão
  const userId = 1; // Admin

  for (const agentData of AGENTS_METADATA) {
    try {
      // Verificar se agente já existe
      const existing = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.clientId, clientId),
            eq(agents.internalCode, agentData.internalCode)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`   ℹ️  Agente ${agentData.internalCode} já existe, pulando...`);
        continue;
      }

      // Criar agente
      await db.insert(agents).values({
        clientId,
        createdBy: userId,
        internalCode: agentData.internalCode,
        title: agentData.title,
        description: agentData.description,
        agentType: agentData.agentType,
        act: agentData.act,
        systemPrompt: agentData.systemPrompt,
        fallbackPrompt: 'Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente.',
        aiProvider: agentData.aiProvider as 'openai' | 'groq' | 'vercel-gateway' | 'replit',
        aiModel: agentData.aiModel,
        maxTokens: 4096,
        temperature: 0.7,
        isActive: true,
        webhookEnabled: false,
        integrations: [],
        metadata: {
          order: agentData.order,
          autoStart: agentData.autoStart,
          dependsOn: agentData.dependsOn || null,
          capabilities: [
            'text-generation',
            'strategic-analysis',
            'document-generation'
          ],
          tags: ['ato-1', 'strategic', 'diagnostic'],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`   ✅ Agente ${agentData.internalCode} criado com sucesso!`);
    } catch (error) {
      console.error(`   ❌ Erro ao criar agente ${agentData.internalCode}:`, error);
    }
  }

  console.log('🎉 Seed dos 5 Agentes Inteligentes concluído!\n');
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedIntelligentAgents()
    .then(() => {
      console.log('✅ Seed executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar seed:', error);
      process.exit(1);
    });
}

