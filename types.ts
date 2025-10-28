
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
