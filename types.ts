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

export interface Integration {
    id: string;
    name: string;
    color: string; // Cor da badge (ex: 'purple', 'green', 'gray')
}

export interface AgentCardData {
    id: string;
    title: string;
    description: string;
    contextProgress: number; // Porcentagem de contexto preenchido (0-100)
    act: string; // Ex: "Ato 01", "Ato 02"
    internalCode: string; // Código interno para controle de recursos/tokens
    agentType: string; // Tipo do agente para configurar o chat
    integrations?: Integration[]; // Integrações do agente (GPT, DRIVE, etc)
}

export type MessageType = 'text' | 'chart' | 'document' | 'link' | 'approval' | 'image' | 'file';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    message: string;
    messageType?: MessageType;
    metadata?: MessageMetadata;
    timestamp: Date;
}

export interface MessageMetadata {
    chartData?: ChartData;
    documentRef?: DocumentReference;
    linkData?: LinkData;
    approvalRequest?: ApprovalRequest;
    fileData?: FileData;
}

export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    data: any[];
    labels?: string[];
    title?: string;
    options?: Record<string, any>;
}

export interface DocumentReference {
    documentId: string;
    documentName: string;
    documentUrl?: string;
    preview?: string;
}

export interface LinkData {
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
}

export interface ApprovalRequest {
    requestId: string;
    title: string;
    description: string;
    options: ApprovalOption[];
    status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovalOption {
    id: string;
    label: string;
    value: string;
}

export interface FileData {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
}

export interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentTitle: string;
    agentDescription: string;
    agentType: string;
    internalCode: string;
    agentId?: number;
    aiProvider?: string;
    aiModel?: string;
    systemPrompt?: string;
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

// Tipos para documentos com Google Drive
export interface DocumentUploadData {
    name: string;
    mimeType: string;
    size: number;
    contentHash: string;
    extractedText?: string;
    metadata?: Record<string, any>;
    driveFileId?: string;
    userId: number;
    clientId: number;
}

export interface DocumentContent {
    id: number;
    documentId: string;
    contentHash: string;
    textContent: string;
    extractedAt: Date;
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

// Interfaces para Clientes
export interface ClientData {
    id: number;
    name: string;
    domain?: string;
    isActive: boolean;
    settings?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

// Interfaces para Integrations
export type IntegrationType = 'webhook' | 'n8n' | 'dify' | 'langchain';

export interface WebhookIntegration {
    type: 'webhook';
    webhookUrl: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    timeout?: number;
}

export interface N8NIntegration {
    type: 'n8n';
    n8nUrl: string;
    workflowId?: string;
    headers?: Record<string, string>;
}

export interface DifyIntegration {
    type: 'dify';
    apiUrl: string;
    apiKey: string;
    appId?: string;
    userId?: string;
}

export interface LangChainIntegration {
    type: 'langchain';
    apiUrl: string;
    apiKey?: string;
    agentId?: string;
    model?: string;
    headers?: Record<string, string>;
}

export type AgentIntegration = WebhookIntegration | N8NIntegration | DifyIntegration | LangChainIntegration;

export interface IntegrationConfig {
    id: number;
    clientId: number;
    agentId?: number;
    integrationType: IntegrationType;
    name: string;
    config: AgentIntegration;
    isActive: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

// Interfaces para Admin Dashboard
export interface AgentConfiguration {
    id: string;
    name: string;
    description: string;
    type: string;
    act: string; // Ex: "Ato 01", "Ato 02"
    status: 'active' | 'disabled';
    behaviorType: 'autonomous' | 'interagent';
    canCommunicateWithAgents: boolean;
    integration: AgentIntegration;
    createdAt: Date;
    updatedAt: Date;
}

// Interfaces para Comunicação entre Agentes
export interface AgentConversationData {
    id: number;
    clientId: number;
    initiatorAgentId: number;
    participantAgentIds: number[];
    purpose?: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentMessageData {
    id: number;
    agentConversationId: number;
    senderAgentId: number;
    receiverAgentId?: number;
    content: string;
    messageType: 'request' | 'response' | 'notification' | 'error';
    metadata?: Record<string, any>;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: Date;
}
