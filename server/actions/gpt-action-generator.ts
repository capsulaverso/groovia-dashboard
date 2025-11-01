/**
 * 🤖 GPT Action Generator
 * 
 * Gerador de prompts e regras de agentes usando GPT-4 via OpenAI Actions
 * Retorna dados estruturados populando nossa arquitetura de agentes
 */

import OpenAI from 'openai';
import { pool } from '../db';

// Inicializar clientes OpenAI com múltiplos providers
const vercelGateway = process.env.VERCEL_GATEWAY_API_KEY ? new OpenAI({
  baseURL: 'https://aigateway.dev/api/proxy',
  apiKey: process.env.VERCEL_GATEWAY_API_KEY,
  defaultHeaders: {
    'X-Vercel-AI-Gateway-Key': process.env.VERCEL_GATEWAY_API_KEY
  }
}) : null;

const openaiDirect = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Função para escolher o melhor cliente disponível
const getOpenAIClient = (): OpenAI => {
  if (vercelGateway) return vercelGateway;
  if (openaiDirect) return openaiDirect;
  throw new Error('Nenhuma API key configurada. Configure VERCEL_GATEWAY_API_KEY ou OPENAI_API_KEY no .env');
};

// Detectar qual provider está sendo usado
const getProviderName = (): string => {
  if (vercelGateway) return 'Vercel Gateway';
  if (openaiDirect) return 'OpenAI Direct';
  return 'Nenhum';
};

console.log(`🤖 GPT Action Generator configurado: ${getProviderName()}`);

export interface AgentRule {
  name: string;
  description: string;
  pattern: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export interface AgentRulesStructure {
  agentId: number;
  agentCode: string;
  agentName: string;
  rules: AgentRule[];
  systemPrompt: string;
  fallbackPrompt: string;
  metadata: {
    version: string;
    lastUpdate: string;
    totalRules: number;
    enabledRules: number;
  };
}

export interface GPTPromptRequest {
  agentType: string;
  agentPurpose: string;
  context?: string;
  exampleInput?: string;
  exampleOutput?: string;
}

export interface GPTPromptResponse {
  systemPrompt: string;
  fallbackPrompt: string;
  rules: {
    name: string;
    description: string;
    pattern: string;
    action: string;
    priority: number;
  }[];
  welcomeMessage: string;
  metadata: {
    generatedAt: string;
    model: string;
    tokensUsed?: number;
  };
}

/**
 * Gera prompts e regras de agente usando GPT-4
 */
export async function generateAgentRulesFromGPT(
  request: GPTPromptRequest
): Promise<GPTPromptResponse> {
  const client = getOpenAIClient(); // Usa Vercel Gateway ou OpenAI Direct

  const systemInstruction = `Você é um especialista em criação de prompts e regras para agentes de IA.

Sua tarefa é gerar:
1. Um systemPrompt completo e detalhado para o agente
2. Um fallbackPrompt caso o agente não consiga responder
3. Uma lista de regras de ação (regex patterns + ações)
4. Uma mensagem de boas-vindas personalizada

RETORNE APENAS JSON no seguinte formato:
{
  "systemPrompt": "prompt completo em português do Brasil",
  "fallbackPrompt": "mensagem de fallback",
  "welcomeMessage": "mensagem de boas-vindas",
  "rules": [
    {
      "name": "Nome da Regra",
      "description": "Descrição do que a regra faz",
      "pattern": "^regex pattern$",
      "action": "Ação executada quando pattern match",
      "priority": 1
    }
  ]
}`;

  const userPrompt = `
Gere prompts e regras para um agente com as seguintes características:

TIPO: ${request.agentType}
PROPÓSITO: ${request.agentPurpose}
${request.context ? `CONTEXTO: ${request.context}` : ''}
${request.exampleInput ? `EXEMPLO DE ENTRADA: ${request.exampleInput}` : ''}
${request.exampleOutput ? `EXEMPLO DE SAÍDA: ${request.exampleOutput}` : ''}

INSTRUÇÕES:
- SystemPrompt deve ser detalhado, profissional e em português do Brasil
- FallbackPrompt deve ser empático e útil
- WelcomeMessage deve ser acolhedora e informativa
- Regras devem cobrir casos comuns de uso
- Patterns devem ser regex válidos
- Prioridades: 1 (mais alta) a 10 (mais baixa)
- Mínimo de 3 regras, máximo de 10
`;

  try {
    const provider = getProviderName();
    console.log(`🤖 Chamando GPT-4 via ${provider} para gerar prompts...`);
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT não retornou resposta');
    }

    const parsedResponse = JSON.parse(content) as GPTPromptResponse;
    
    // Adicionar metadados
    parsedResponse.metadata = {
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o',
      tokensUsed: completion.usage?.total_tokens
    };

    console.log('✅ Prompts gerados com sucesso!');
    console.log(`📊 Tokens usados: ${completion.usage?.total_tokens}`);
    
    return parsedResponse;

  } catch (error) {
    console.error('❌ Erro ao gerar prompts via GPT:', error);
    throw error;
  }
}

/**
 * Salva regras geradas no banco de dados
 */
export async function saveAgentRules(
  agentId: number,
  rulesStructure: AgentRulesStructure
): Promise<void> {
  try {
    console.log(`💾 Salvando regras para agente ${agentId}...`);
    
    // Atualizar agent com novos prompts e regras
    await pool.query(
      `UPDATE agents 
       SET 
         system_prompt = $1,
         fallback_prompt = $2,
         capabilities = $3,
         updated_at = NOW()
       WHERE id = $4`,
      [
        rulesStructure.systemPrompt,
        rulesStructure.fallbackPrompt,
        JSON.stringify({ rules: rulesStructure.rules }),
        agentId
      ]
    );

    console.log('✅ Regras salvas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao salvar regras:', error);
    throw error;
  }
}

/**
 * Busca regras de um agente do banco de dados
 */
export async function getAgentRules(agentId: number): Promise<AgentRulesStructure | null> {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         internal_code,
         title,
         system_prompt,
         fallback_prompt,
         capabilities
       FROM agents
       WHERE id = $1`,
      [agentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const agent = result.rows[0];
    const capabilities = agent.capabilities || {};
    const rules = (capabilities.rules || []) as AgentRule[];

    return {
      agentId: agent.id,
      agentCode: agent.internal_code,
      agentName: agent.title,
      rules: rules,
      systemPrompt: agent.system_prompt,
      fallbackPrompt: agent.fallback_prompt,
      metadata: {
        version: '1.0',
        lastUpdate: new Date().toISOString(),
        totalRules: rules.length,
        enabledRules: rules.filter(r => r.enabled).length
      }
    };
  } catch (error) {
    console.error('❌ Erro ao buscar regras:', error);
    throw error;
  }
}

/**
 * Aplica regras a uma mensagem de entrada
 */
export function applyRulesToMessage(message: string, rules: AgentRule[]): AgentRule | null {
  // Ordenar regras por prioridade (menor número = maior prioridade)
  const sortedRules = [...rules]
    .filter(r => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  // Testar cada regra
  for (const rule of sortedRules) {
    try {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(message)) {
        console.log(`✅ Regra "${rule.name}" matched!`);
        return rule;
      }
    } catch (error) {
      console.warn(`⚠️ Regex inválida na regra "${rule.name}": ${rule.pattern}`);
    }
  }

  return null;
}

/**
 * Gera e salva regras para um agente
 */
export async function generateAndSaveAgentRules(
  agentId: number,
  request: GPTPromptRequest
): Promise<AgentRulesStructure> {
  try {
    // 1. Gerar prompts e regras via GPT
    const gptResponse = await generateAgentRulesFromGPT(request);

    // 2. Buscar dados do agente
    const result = await pool.query(
      'SELECT internal_code, title FROM agents WHERE id = $1',
      [agentId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Agente ${agentId} não encontrado`);
    }

    const agent = result.rows[0];

    // 3. Estruturar dados
    const rulesStructure: AgentRulesStructure = {
      agentId,
      agentCode: agent.internal_code,
      agentName: agent.title,
      rules: gptResponse.rules.map(r => ({
        ...r,
        enabled: true
      })),
      systemPrompt: gptResponse.systemPrompt,
      fallbackPrompt: gptResponse.fallbackPrompt,
      metadata: gptResponse.metadata
    };

    // 4. Salvar no banco
    await saveAgentRules(agentId, rulesStructure);

    return rulesStructure;
  } catch (error) {
    console.error('❌ Erro ao gerar e salvar regras:', error);
    throw error;
  }
}

export default {
  generateAgentRulesFromGPT,
  saveAgentRules,
  getAgentRules,
  applyRulesToMessage,
  generateAndSaveAgentRules
};

