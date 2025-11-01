import type { ChatMessage } from '../types';

// Popula conversas de exemplo no localStorage para demonstração
export const populateExampleConversations = () => {
    // Conversa 1: Diagnóstico - Análise Completa do Negócio
    const diagConv1: ChatMessage[] = [
        {
            id: 'msg-1',
            sender: 'agent',
            message: 'Olá! Sou o **SCAN CLARITY**. Vou realizar uma análise completa do seu negócio. Para começar, conte-me sobre sua empresa e os principais desafios que você enfrenta.',
            timestamp: new Date('2024-10-27T09:00:00')
        },
        {
            id: 'msg-2',
            sender: 'user',
            message: 'Somos uma startup de SaaS B2B com 18 meses de operação. Temos ~50 clientes pagantes mas estamos com dificuldade de escalar vendas.',
            timestamp: new Date('2024-10-27T09:05:00')
        },
        {
            id: 'msg-3',
            sender: 'agent',
            message: 'Entendo. Vamos analisar em 5 dimensões:\n\n**1. Mercado:** Qual seu ICP atual e tamanho do mercado endereçável?\n**2. Produto:** Como está o fit produto-mercado?\n**3. Operações:** Estrutura da equipe e processos?\n**4. Financeiro:** CAC, LTV e runway atual?\n**5. Pessoas:** Time e cultura organizacional?',
            timestamp: new Date('2024-10-27T09:07:00')
        },
        {
            id: 'msg-4',
            sender: 'user',
            message: 'ICP: Empresas tech de 20-100 funcionários. TAM estimado em $5B. Produto: NPS de 42, churn de 4%/mês. Time: 12 pessoas (4 eng, 3 vendas, 2 CS, 3 admin). CAC: $2.8k, LTV: $12k, runway: 14 meses.',
            timestamp: new Date('2024-10-27T09:15:00')
        },
        {
            id: 'msg-5',
            sender: 'agent',
            message: '📊 **Diagnóstico Inicial:**\n\n✅ **Pontos Fortes:**\n- LTV/CAC ratio de 4.3x (excelente!)\n- Churn dentro da média para SaaS B2B\n- Runway saudável\n\n⚠️ **Áreas de Atenção:**\n- Time de vendas pequeno para ambição de escala\n- NPS de 42 indica espaço para melhoria\n- Processos de vendas precisam ser analisados\n\nVou aprofundar em **Operações de Vendas**. Me conte sobre seu processo atual de vendas: ciclo médio, pipeline, conversão por etapa?',
            timestamp: new Date('2024-10-27T09:20:00')
        },
        {
            id: 'msg-6',
            sender: 'user',
            message: 'Ciclo de vendas: ~45 dias. Pipeline: ~$800k. Conversão: Lead→Oportunidade (12%), Oportunidade→Fechamento (25%). Apenas outbound, sem inbound estruturado.',
            timestamp: new Date('2024-10-27T09:25:00')
        },
        {
            id: 'msg-7',
            sender: 'agent',
            message: '🎯 **Insights Críticos Identificados:**\n\n**1. Gargalo em Geração de Leads**\n- Conversão Lead→Oportunidade de 12% está abaixo da média (15-20%)\n- Falta de inbound é oportunidade significativa\n\n**2. Força em Vendas Consultivas**\n- 25% de fechamento é excelente (média: 15-20%)\n- Indica que quando você chega no prospect certo, fecha bem\n\n**Recomendações Prioritárias:**\n📌 Implementar máquina de inbound (SEO + Content)\n📌 Melhorar qualificação de leads (framework BANT/MEDDIC)\n📌 Contratar 2 SDRs focados em qualificação\n\nQuer que eu detalhe alguma dessas recomendações?',
            timestamp: new Date('2024-10-27T09:30:00')
        },
        {
            id: 'msg-8',
            sender: 'user',
            message: 'Sim! Gostaria de entender melhor a estratégia de inbound. Quanto tempo leva para começar a gerar resultados?',
            timestamp: new Date('2024-10-27T09:35:00')
        },
        {
            id: 'msg-9',
            sender: 'agent',
            message: '⏱️ **Timeline Realista de Inbound B2B SaaS:**\n\n**Meses 1-3: Fundação**\n- Setup técnico (blog, SEO on-page, analytics)\n- Produção de 12-16 artigos pilares\n- Resultado esperado: ~100 visitas orgânicas/mês\n\n**Meses 4-6: Tração Inicial**  \n- 20-30 artigos publicados\n- Primeiros rankings no Google\n- Resultado esperado: ~500 visitas/mês, 5-10 MQLs\n\n**Meses 7-12: Escalada**\n- Biblioteca de 40-60 artigos\n- Rankings sólidos em palavras-chave estratégicas\n- Resultado esperado: ~2.000 visitas/mês, 30-50 MQLs\n\n💰 **Investimento Estimado:**\n- Conteúdo: $3-5k/mês\n- SEO/Otimização: $2k/mês\n- Ferramentas: $500/mês\n\n**ROI típico:** Break-even em 8-10 meses, depois é puro ganho marginal.',
            timestamp: new Date('2024-10-27T09:42:00')
        },
        {
            id: 'msg-10',
            sender: 'user',
            message: 'Perfeito! Vou revisar os insights sobre operações amanhã.',
            timestamp: new Date('2024-10-27T09:45:00')
        }
    ];

    // Conversa 2: Pesquisa - Pesquisa de Mercado Setor Tech
    const pesqConv1: ChatMessage[] = [
        {
            id: 'msg-1',
            sender: 'agent',
            message: 'Olá! Sou o **Pesquisador de Mercado**. Vou realizar uma pesquisa profunda do seu mercado. Qual setor específico você quer analisar?',
            timestamp: new Date('2024-10-27T14:00:00')
        },
        {
            id: 'msg-2',
            sender: 'user',
            message: 'Quero entender o mercado de plataformas de automação de marketing para empresas B2B tech.',
            timestamp: new Date('2024-10-27T14:05:00')
        },
        {
            id: 'msg-3',
            sender: 'agent',
            message: '🔍 **Iniciando Pesquisa de Mercado - Marketing Automation B2B**\n\n**Escopo da Análise:**\n1. Tamanho de mercado e crescimento\n2. Principais players e market share\n3. Tendências e inovações\n4. Gaps e oportunidades\n5. Perfil de compradores (ICP)\n\nVou começar coletando dados. Você tem preferência por região geográfica?',
            timestamp: new Date('2024-10-27T14:08:00')
        },
        {
            id: 'msg-4',
            sender: 'user',
            message: 'Foco inicial em América do Norte e Europa.',
            timestamp: new Date('2024-10-27T14:10:00')
        },
        {
            id: 'msg-5',
            sender: 'agent',
            message: '📊 **Dados de Mercado (América do Norte + Europa):**\n\n**Tamanho & Crescimento:**\n- TAM: $8.4B (2024) → $16.8B projetado (2029)\n- CAGR: 14.8%\n- América do Norte: 62% do mercado\n- Europa: 28% do mercado\n\n**Top 10 Players:**\n1. HubSpot - 23% market share\n2. Marketo (Adobe) - 18%\n3. Pardot (Salesforce) - 15%\n4. ActiveCampaign - 8%\n5. Mailchimp - 7%\n6. Outros - 29%\n\n**Segmentos:**\n- Enterprise (>1000 emp): 45% da receita\n- Mid-market (100-1000): 35%\n- SMB (<100): 20%',
            timestamp: new Date('2024-10-27T14:20:00')
        },
        {
            id: 'msg-6',
            sender: 'user',
            message: 'Interessante! E quais são as tendências mais relevantes que você identificou?',
            timestamp: new Date('2024-10-27T14:25:00')
        },
        {
            id: 'msg-7',
            sender: 'agent',
            message: '🚀 **Top 5 Tendências - Marketing Automation 2024-2025:**\n\n**1. AI-Powered Personalization**\n- 78% das empresas planejam investir em personalização via IA\n- Casos de uso: email subject lines, timing otimizado, conteúdo dinâmico\n\n**2. Account-Based Marketing (ABM)**\n- Crescimento de 67% em adoção nos últimos 2 anos\n- Integração profunda com CRM é exigência\n\n**3. Multi-Touch Attribution**\n- Compradores tocam marca 8-12x antes de comprar\n- Ferramentas com atribuição avançada têm premium de 40%\n\n**4. No-Code/Low-Code**\n- Democratização: marketers sem dev querem autonomia\n- Drag-and-drop workflows são expectativa básica\n\n**5. Privacy-First & Compliance**\n- GDPR, LGPD, CCPA moldam arquitetura\n- First-party data collection é prioridade #1\n\nVamos aprofundar na análise de concorrentes B2B?',
            timestamp: new Date('2024-10-27T14:35:00')
        }
    ];

    // Salvar no localStorage
    localStorage.setItem('conversation_conv-diag-1', JSON.stringify(diagConv1));
    localStorage.setItem('conversation_conv-pesq-1', JSON.stringify(pesqConv1));

    console.log('✅ Conversas de exemplo populadas no localStorage');
};
