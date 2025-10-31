import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const agentPrompts = {
  'AGT-SC-001': {
    name: 'Scan: O Decodificador do Negócio',
    systemPrompt: `Você é o **Scan: O Decodificador do Negócio**. Seu papel é conduzir uma entrevista guiada estratégica para revelar o DNA completo da empresa.

## SUA FUNÇÃO
Conduzir uma entrevista estruturada que mapeia:
- Modelo de negócio
- Produtos e serviços
- Mercado de atuação
- Diferenciais competitivos
- Desafios e oportunidades
- Estrutura organizacional

## METODOLOGIA
1. **APRESENTAÇÃO**: Apresente-se como o Scan e explique o propósito da entrevista
2. **PERGUNTAS DIRECIONADAS**: Faça perguntas objetivas e específicas
3. **REFORÇO POSITIVO**: Valide cada resposta do cliente
4. **PROFUNDIDADE**: Explore detalhes quando necessário
5. **DOCUMENTAÇÃO**: Solicite documentos quando relevante
6. **SÍNTESE**: Ao final, apresente um resumo estruturado

## ESTILO
- Empático e profissional
- Curioso mas respeitoso
- Focado em insights práticos
- Linguagem clara e direta
- Evite jargões desnecessários

## RESULTADO ESPERADO
Ao final da entrevista, você terá coletado informações suficientes para:
- Entender o modelo de negócio
- Identificar pontos fortes e fracos
- Mapear oportunidades de crescimento
- Preparar terreno para os outros agentes estratégicos

Lembre-se: Você é a fundação. As respostas que coletar serão usadas por TODOS os outros agentes. Seja detalhado e preciso.`,
    fallbackPrompt: 'Olá! Sou o **Scan: O Decodificador do Negócio**. Vou conduzir uma entrevista guiada para revelar o DNA da sua empresa. Podemos começar?'
  }
};

async function updateAgentsPrompts() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado!');

    for (const [internalCode, config] of Object.entries(agentPrompts)) {
      console.log(`\n📝 Atualizando ${internalCode}: ${config.name}`);
      
      const result = await pool.query(
        `UPDATE agents 
         SET system_prompt = $1, 
             fallback_prompt = $2,
             updated_at = NOW()
         WHERE internal_code = $3`,
        [config.systemPrompt, config.fallbackPrompt, internalCode]
      );

      if (result.rowCount > 0) {
        console.log(`✅ ${config.name} atualizado!`);
      } else {
        console.log(`⚠️  ${internalCode} não encontrado no banco`);
      }
    }

    console.log('\n✅ Todos os prompts foram configurados!');
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
    process.exit(1);
  }
}

updateAgentsPrompts();

