
import type { ScanCardData, InfoItemData, AgentCardData } from './types';

export const SCAN_CARDS_DATA: ScanCardData[] = [
    {
        id: 1,
        title: "SCAN CLARITY",
        description: "Tem como objetivo consolidar informações do cliente que preencheu o Scan Clarity, criando o DE-PARA e até 5 diretrizes estratégicas",
        progress: 83,
    },
    {
        id: 2,
        title: "Pesquisador de Mercado e ICP",
        description: "Agente autônomo, tem como objetivo realizar uma profunda pesquisa de mercado e ICP com maior detalhamento com base em documentos do cliente",
        progress: 83,
    },
    {
        id: 3,
        title: "Agente criador de Persona",
        description: "Agente autônomo, realiza seu trabalho detalhado de criação de Persona avançado com base nos documentos anteriores do cliente",
        progress: 83,
    },
    {
        id: 4,
        title: "Agente criador de Persona",
        description: "Agente autônomo, realiza seu trabalho detalhado de criação de Persona avançado com base nos documentos anteriores do cliente",
        progress: 83,
    },
];

export const ANALYSIS_CARDS_DATA: ScanCardData[] = [
    {
        id: 1,
        title: "Agente de Estratégia Corporativa",
        description: "Criar uma robusta e completa estratégia corporativa que seja o ponto de partida para planejamento Tático e Operacional se guiarem.",
        progress: 83,
    },
    {
        id: 2,
        title: "Agente Projetista de DRE",
        description: "Responsável por construir uma projeção DRE (financeiro) combinando com o plano estratégico realista para os próximos 5 anos",
        progress: 0,
    },
    {
        id: 3,
        title: "Agente Gerador de OKRs",
        description: "Especialista em criação de OKRs para empresas com a entrega de Kit de Implementação e Comunicação de OKRs",
        progress: 0,
    },
    {
        id: 4,
        title: "Agente Estrategista de Branding",
        description: "Função é sintetizar um diagnóstico completo em uma plataforma de marca robusta e orientada ao crescimento.",
        progress: 0,
    },
];


export const INFO_ITEMS_DATA: InfoItemData[] = [
    {
        id: 1,
        title: "Dados da Entrevista",
        description: "Revise seus dados",
        buttonText: "Continuar"
    },
    {
        id: 2,
        title: "Revise suas diretrizes",
        description: "Revise seus dados",
        buttonText: "Continuar"
    },
    {
        id: 3,
        title: "Resultado da Pesquisa",
        description: "Revise seus dados",
        buttonText: "Continuar"
    },
    {
        id: 4,
        title: "Criação de Persona",
        description: "Revise seus dados",
        buttonText: "Começar Agora"
    }
];

export const AGENT_CARDS_DATA: AgentCardData[] = [
    {
        id: "agent-001",
        title: "SCAN CLARITY",
        description: "Tem como objetivo consolidar informações do cliente que preencheu o Scan Clarity, criando o DE-PARA e até 5 diretrizes estratégicas",
        contextProgress: 83,
        act: "Ato 01",
        internalCode: "AGT-SC-001",
        agentType: "Agente de Diagnóstico"
    },
    {
        id: "agent-002",
        title: "Pesquisador de Mercado e ICP",
        description: "Agente autônomo, tem como objetivo realizar uma profunda pesquisa de mercado e ICP com maior detalhamento com base em documentos do cliente",
        contextProgress: 83,
        act: "Ato 01",
        internalCode: "AGT-PM-002",
        agentType: "Agente de Pesquisa"
    },
    {
        id: "agent-003",
        title: "Agente criador de Persona",
        description: "Agente autônomo, realiza seu trabalho detalhado de criação de Persona avançado com base nos documentos anteriores do cliente",
        contextProgress: 83,
        act: "Ato 01",
        internalCode: "AGT-CP-003",
        agentType: "Agente de Criação"
    },
    {
        id: "agent-004",
        title: "Agente de Estratégia Corporativa",
        description: "Criar uma robusta e completa estratégia corporativa que seja o ponto de partida para planejamento Tático e Operacional se guiarem.",
        contextProgress: 67,
        act: "Ato 02",
        internalCode: "AGT-EC-004",
        agentType: "Agente Estratégico"
    },
    {
        id: "agent-005",
        title: "Agente Projetista de DRE",
        description: "Responsável por construir uma projeção DRE (financeiro) combinando com o plano estratégico realista para os próximos 5 anos",
        contextProgress: 45,
        act: "Ato 02",
        internalCode: "AGT-DRE-005",
        agentType: "Agente Financeiro"
    },
    {
        id: "agent-006",
        title: "Agente Gerador de OKRs",
        description: "Especialista em criação de OKRs para empresas com a entrega de Kit de Implementação e Comunicação de OKRs",
        contextProgress: 28,
        act: "Ato 03",
        internalCode: "AGT-OKR-006",
        agentType: "Agente de Planejamento"
    },
    {
        id: "agent-007",
        title: "Agente Estrategista de Branding",
        description: "Função é sintetizar um diagnóstico completo em uma plataforma de marca robusta e orientada ao crescimento.",
        contextProgress: 15,
        act: "Ato 03",
        internalCode: "AGT-BR-007",
        agentType: "Agente de Marketing"
    },
];
