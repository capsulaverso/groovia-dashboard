import type { AgentWorkspaceConfig, AgentCardData } from '../types';

export const generateWorkspaceConfig = (agent: AgentCardData): AgentWorkspaceConfig => {
    // Funções padrão para todos os agentes
    const commonFunctions = [
        {
            id: 'new-chat',
            name: 'Nova Conversa',
            description: 'Iniciar conversa do zero',
            icon: 'add_comment',
            action: () => console.log('Nova conversa')
        },
        {
            id: 'export',
            name: 'Exportar Chat',
            description: 'Baixar histórico completo',
            icon: 'download',
            action: () => console.log('Exportar chat')
        }
    ];

    // Funções específicas por tipo de agente
    const specificFunctions = getSpecificFunctions(agent.agentType);

    // Documentos de exemplo (seriam carregados do cliente)
    const documents = [
        {
            id: 'doc-1',
            name: 'Briefing_Cliente_2024.pdf',
            type: 'pdf' as const,
            size: '2.4 MB',
            uploadedAt: new Date('2024-10-15')
        },
        {
            id: 'doc-2',
            name: 'Analise_Mercado.doc',
            type: 'doc' as const,
            size: '1.2 MB',
            uploadedAt: new Date('2024-10-20')
        },
        {
            id: 'doc-3',
            name: 'Dados_Financeiros.sheet',
            type: 'sheet' as const,
            size: '856 KB',
            uploadedAt: new Date('2024-10-22')
        }
    ];

    // Histórico de conversas específico por tipo de agente
    const conversationHistory = getConversationHistory(agent.agentType);

    // Dados de contexto específicos por tipo
    const contextData = getContextData(agent.agentType, agent.contextProgress);

    // Mensagens de ajuda específicas por tipo
    const helpMessages = getHelpMessages(agent.agentType);

    // Tooltips interativos
    const tooltips = [
        {
            id: 'tooltip-1',
            target: 'chat-input',
            title: 'Dica de Uso',
            content: 'Use comandos naturais para interagir com o agente. Ele entende contexto!',
            position: 'top' as const
        },
        {
            id: 'tooltip-2',
            target: 'functions',
            title: 'Funções Rápidas',
            content: 'Clique nas funções para executar ações específicas sem precisar digitar',
            position: 'bottom' as const
        }
    ];

    return {
        agentId: agent.id,
        agentTitle: agent.title,
        agentDescription: agent.description,
        agentType: agent.agentType,
        internalCode: agent.internalCode,
        act: agent.act,
        contextProgress: agent.contextProgress,
        functions: [...commonFunctions, ...specificFunctions],
        documents,
        conversationHistory,
        contextData,
        tooltips,
        helpMessages
    };
};

const getSpecificFunctions = (agentType: string) => {
    switch (agentType) {
        case 'Agente de Diagnóstico':
            return [
                {
                    id: 'run-diagnosis',
                    name: 'Executar Diagnóstico',
                    description: 'Iniciar análise completa',
                    icon: 'analytics',
                    action: () => console.log('Executar diagnóstico')
                },
                {
                    id: 'generate-report',
                    name: 'Gerar Relatório',
                    description: 'Criar relatório completo',
                    icon: 'assessment',
                    action: () => console.log('Gerar relatório')
                }
            ];
        case 'Agente de Pesquisa':
            return [
                {
                    id: 'market-research',
                    name: 'Pesquisa de Mercado',
                    description: 'Analisar mercado e concorrentes',
                    icon: 'search',
                    action: () => console.log('Pesquisa de mercado')
                },
                {
                    id: 'icp-analysis',
                    name: 'Análise de ICP',
                    description: 'Definir perfil ideal de cliente',
                    icon: 'person_search',
                    action: () => console.log('Análise ICP')
                }
            ];
        case 'Agente Estratégico':
            return [
                {
                    id: 'strategic-plan',
                    name: 'Plano Estratégico',
                    description: 'Criar plano estratégico',
                    icon: 'rocket_launch',
                    action: () => console.log('Plano estratégico')
                },
                {
                    id: 'swot-analysis',
                    name: 'Análise SWOT',
                    description: 'Forças, fraquezas, oportunidades',
                    icon: 'grid_view',
                    action: () => console.log('Análise SWOT')
                }
            ];
        case 'Agente Financeiro':
            return [
                {
                    id: 'dre-projection',
                    name: 'Projeção DRE',
                    description: 'Projetar DRE 5 anos',
                    icon: 'trending_up',
                    action: () => console.log('Projeção DRE')
                },
                {
                    id: 'cash-flow',
                    name: 'Fluxo de Caixa',
                    description: 'Analisar fluxo de caixa',
                    icon: 'account_balance',
                    action: () => console.log('Fluxo de caixa')
                }
            ];
        default:
            return [];
    }
};

const getContextData = (agentType: string, contextProgress: number) => {
    const baseContext = [
        {
            id: 'ctx-1',
            label: 'Contexto Preenchido',
            value: contextProgress,
            type: 'percentage' as const,
            icon: 'donut_large'
        },
        {
            id: 'ctx-2',
            label: 'Mensagens Processadas',
            value: 127,
            type: 'count' as const,
            icon: 'chat'
        }
    ];

    const specificContext = {
        'Agente de Diagnóstico': [
            {
                id: 'ctx-3',
                label: 'Áreas Analisadas',
                value: 8,
                type: 'count' as const,
                icon: 'category'
            }
        ],
        'Agente de Pesquisa': [
            {
                id: 'ctx-3',
                label: 'Fontes Consultadas',
                value: 24,
                type: 'count' as const,
                icon: 'source'
            }
        ],
        'Agente Estratégico': [
            {
                id: 'ctx-3',
                label: 'Objetivos Definidos',
                value: 12,
                type: 'count' as const,
                icon: 'flag'
            }
        ]
    };

    return [...baseContext, ...(specificContext[agentType as keyof typeof specificContext] || [])];
};

const getConversationHistory = (agentType: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const histories = {
        'Agente de Diagnóstico': [
            {
                id: 'conv-diag-1',
                title: 'Análise Completa do Negócio',
                lastMessage: 'Perfeito! Vou revisar os insights sobre operações amanhã e depois quero discutir o plano de ação.',
                timestamp: yesterday,
                messageCount: 34
            },
            {
                id: 'conv-diag-2',
                title: 'Diagnóstico Financeiro Q3',
                lastMessage: 'Preciso de uma análise mais profunda dos indicadores de liquidez. Pode detalhar?',
                timestamp: lastWeek,
                messageCount: 28
            },
            {
                id: 'conv-diag-3',
                title: 'Avaliação de Processos Internos',
                lastMessage: 'Obrigado pelas sugestões! Vou implementar e te atualizo na próxima semana.',
                timestamp: twoWeeksAgo,
                messageCount: 19
            }
        ],
        'Agente de Pesquisa': [
            {
                id: 'conv-pesq-1',
                title: 'Pesquisa de Mercado - Setor Tech',
                lastMessage: 'Ótimo! Agora vamos aprofundar na análise de concorrentes B2B. Quais são os 3 principais?',
                timestamp: yesterday,
                messageCount: 42
            },
            {
                id: 'conv-pesq-2',
                title: 'Definição do ICP Principal',
                lastMessage: 'Perfeito! O perfil de empresas 50-200 funcionários ficou claro. Pode detalhar as dores deles?',
                timestamp: twoDaysAgo,
                messageCount: 31
            },
            {
                id: 'conv-pesq-3',
                title: 'Tendências de Consumo 2025',
                lastMessage: 'Preciso dos dados sobre comportamento mobile e também sobre e-commerce. Pode buscar?',
                timestamp: lastWeek,
                messageCount: 25
            }
        ],
        'Agente Estratégico': [
            {
                id: 'conv-estrat-1',
                title: 'Planejamento Estratégico 2025-2027',
                lastMessage: 'Os OKRs do pilar de Crescimento ficaram excelentes! Agora quero definir os do pilar Operacional.',
                timestamp: yesterday,
                messageCount: 38
            },
            {
                id: 'conv-estrat-2',
                title: 'Análise SWOT Atualizada',
                lastMessage: 'Vamos incluir as novas oportunidades de parcerias com fintechs. O que você acha?',
                timestamp: twoDaysAgo,
                messageCount: 27
            },
            {
                id: 'conv-estrat-3',
                title: 'Roadmap de Expansão',
                lastMessage: 'Gostei da estratégia go-to-market. Pode detalhar o plano de lançamento por região?',
                timestamp: lastWeek,
                messageCount: 33
            }
        ],
        'Agente Criativo': [
            {
                id: 'conv-creat-1',
                title: 'Criação de Personas - Projeto Alpha',
                lastMessage: 'A persona "Gestor Inovador" está perfeita! Agora vamos criar a "CEO Visionário"?',
                timestamp: yesterday,
                messageCount: 29
            },
            {
                id: 'conv-creat-2',
                title: 'Desenvolvimento de Brand Voice',
                lastMessage: 'Gostei do tom técnico mas acessível. Pode criar exemplos de posts para LinkedIn?',
                timestamp: twoDaysAgo,
                messageCount: 22
            },
            {
                id: 'conv-creat-3',
                title: 'Estratégia de Conteúdo Q4',
                lastMessage: 'Vamos focar em cases de sucesso. Quantos posts você recomenda por semana?',
                timestamp: lastWeek,
                messageCount: 36
            }
        ],
        'Agente de Branding': [
            {
                id: 'conv-brand-1',
                title: 'Reposicionamento de Marca',
                lastMessage: 'O posicionamento "Inovação Acessível" ressoou bem! Agora vamos definir o tagline?',
                timestamp: yesterday,
                messageCount: 41
            },
            {
                id: 'conv-brand-2',
                title: 'Análise de Percepção de Marca',
                lastMessage: 'Os insights foram reveladores. Como melhoramos a percepção de confiança da marca?',
                timestamp: twoDaysAgo,
                messageCount: 30
            },
            {
                id: 'conv-brand-3',
                title: 'Guia de Identidade Visual',
                lastMessage: 'Paleta e tipografia aprovadas! Pode criar mockups de aplicação da marca?',
                timestamp: lastWeek,
                messageCount: 24
            }
        ]
    };

    // Retornar histórico específico ou genérico
    return histories[agentType as keyof typeof histories] || [
        {
            id: 'conv-gen-1',
            title: 'Sessão de Trabalho Anterior',
            lastMessage: 'Ótima conversa! Vamos continuar na próxima sessão com os novos dados.',
            timestamp: yesterday,
            messageCount: 18
        },
        {
            id: 'conv-gen-2',
            title: 'Análise Inicial',
            lastMessage: 'Os próximos passos estão definidos. Pode me ajudar com a implementação?',
            timestamp: lastWeek,
            messageCount: 12
        }
    ];
};

const getHelpMessages = (agentType: string) => {
    const commonHelp = [
        'Use linguagem natural para interagir com o agente\nEle entende contexto e pode referenciar conversas anteriores.',
        'Você pode anexar documentos para análise\nFormatos aceitos: PDF, DOC, XLSX, TXT'
    ];

    const specificHelp = {
        'Agente de Diagnóstico': [
            'Este agente realiza diagnóstico completo\nForneça informações sobre seu negócio para melhor análise.',
            'O diagnóstico considera 5 dimensões:\nMercado, Produto, Operações, Financeiro e Pessoas.'
        ],
        'Agente de Pesquisa': [
            'Pesquisa aprofundada de mercado e ICP\nQuanto mais informações você fornecer, mais precisa será a análise.',
            'Análise de concorrentes e tendências\nO agente monitora fontes atualizadas em tempo real.'
        ],
        'Agente Estratégico': [
            'Criação de estratégia corporativa robusta\nDefina visão, missão e objetivos de longo prazo.',
            'Integração com plano tático e operacional\nA estratégia guiará todas as ações futuras.'
        ]
    };

    return [...commonHelp, ...(specificHelp[agentType as keyof typeof specificHelp] || [])];
};
