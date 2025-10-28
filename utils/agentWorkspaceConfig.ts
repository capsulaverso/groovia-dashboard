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

    // Histórico de conversas
    const conversationHistory = [
        {
            id: 'conv-1',
            title: 'Análise Inicial do Projeto',
            lastMessage: 'Obrigado pela análise detalhada!',
            timestamp: new Date('2024-10-25'),
            messageCount: 15
        },
        {
            id: 'conv-2',
            title: 'Refinamento da Estratégia',
            lastMessage: 'Vamos ajustar os OKRs conforme discutido',
            timestamp: new Date('2024-10-26'),
            messageCount: 23
        }
    ];

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
