
export interface ScanCardData {
    id: number;
    title: string;
    description: string;
    progress: number;
}

export interface InfoItemData {
    id: number;
    title: string;
    description: string;
    buttonText: string;
}

export interface InstructionBoxProps {
    title: string;
    description: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    onClose?: () => void;
    showCloseButton?: boolean;
    variant?: 'info' | 'warning' | 'success' | 'error';
    icon?: string;
}

export interface AgentCardData {
    id: string;
    title: string;
    description: string;
    contextProgress: number; // Porcentagem de contexto preenchido (0-100)
    act: string; // Ex: "Ato 01", "Ato 02"
    internalCode: string; // Código interno para controle de recursos/tokens
    agentType: string; // Tipo do agente para configurar o chat
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: Date;
}

export interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
}

// Novas interfaces para AgentWorkspace (página dedicada)

export interface AgentFunction {
    id: string;
    name: string;
    description: string;
    icon: string;
    action: () => void;
}

export interface DocumentItem {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'text' | 'image';
    size: string;
    uploadedAt: Date;
    url?: string;
}

export interface ConversationHistory {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

export interface ContextData {
    id: string;
    label: string;
    value: string | number;
    type: 'text' | 'percentage' | 'count' | 'date';
    icon?: string;
}

export interface TooltipConfig {
    id: string;
    target: string; // Elemento alvo
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export interface AgentWorkspaceConfig {
    agentId: string;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
    act: string;
    contextProgress: number;
    
    // Funções específicas do agente
    functions: AgentFunction[];
    
    // Documentos do cliente
    documents: DocumentItem[];
    
    // Histórico de conversas
    conversationHistory: ConversationHistory[];
    
    // Dados de contexto
    contextData: ContextData[];
    
    // Tooltips e ajuda
    tooltips: TooltipConfig[];
    
    // Mensagens de ajuda
    helpMessages: string[];
}
