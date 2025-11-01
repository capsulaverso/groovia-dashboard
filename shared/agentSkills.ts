// Tipos compartilhados para o sistema de Skills dos agentes (Agent Builder)

export type SkillType = 'upload' | 'chart' | 'checklist' | 'analysis' | 'document_request' | 'predict' | 'insight' | 'custom';

export interface BaseSkill {
  id: string;
  type: SkillType;
  name: string;
  description: string;
  enabled: boolean;
  order: number; // ordem de execução
}

// Upload de Documentos
export interface UploadSkill extends BaseSkill {
  type: 'upload';
  allowedTypes: string[]; // ['pdf', 'docx', 'xlsx']
  maxSizeMB: number;
  required?: boolean;
  modalTitle?: string;
  uploadPrompt?: string; // mensagem quando solicitar
}

// Geração de Gráficos
export interface ChartSkill extends BaseSkill {
  type: 'chart';
  chartTypes: Array<'bar' | 'line' | 'pie' | 'area'>;
  autoGenerate?: boolean; // se true, gera automaticamente quando vê dados
  defaultChartType?: 'bar' | 'line' | 'pie' | 'area';
}

// Checklists Interativas
export interface ChecklistSkill extends BaseSkill {
  type: 'checklist';
  dynamicItems?: boolean; // se true, itens podem vir do agente
  maxItems?: number;
  allowUserAdd?: boolean;
}

// Análise de Dados
export interface AnalysisSkill extends BaseSkill {
  type: 'analysis';
  analysisTypes: string[]; // ['sentiment', 'risk', 'trend']
  outputFormat: 'text' | 'blocks' | 'mixed';
}

// Solicitação de Documentos do Usuário
export interface DocumentRequestSkill extends BaseSkill {
  type: 'document_request';
  documentTypes: string[]; // tipos aceitos
  requiredDocuments?: string[]; // lista obrigatória
  optionalDocuments?: string[];
  modalMessage?: string;
}

// Previsão e Forecasting
export interface PredictSkill extends BaseSkill {
  type: 'predict';
  predictionTypes: string[]; // ['revenue', 'risk', 'trend']
  horizonDays?: number;
  confidenceThreshold?: number; // 0-100
}

// Insights Automáticos
export interface InsightSkill extends BaseSkill {
  type: 'insight';
  insightDepth: 'surface' | 'deep' | 'expert'; // nível de análise
  sources: string[]; // de onde buscar dados
}

// Skill Customizado
export interface CustomSkill extends BaseSkill {
  type: 'custom';
  customConfig: Record<string, any>;
  handlerUrl?: string; // webhook para processar
}

export type AgentSkill = UploadSkill | ChartSkill | ChecklistSkill | AnalysisSkill | 
                        DocumentRequestSkill | PredictSkill | InsightSkill | CustomSkill;

export interface SkillsConfig {
  skills: AgentSkill[];
  skillOrder: string[]; // IDs das skills na ordem de execução
  fallbackBehavior?: 'continue' | 'halt' | 'notify';
}

// Helper: reordena skills pela propriedade order
export function reorderSkills(skills: AgentSkill[]): AgentSkill[] {
  return [...skills].sort((a, b) => a.order - b.order);
}

// Helper: valida se uma skill está habilitada e ativa
export function isSkillActive(skill: AgentSkill): boolean {
  return skill.enabled;
}

// Helper: busca skill por ID
export function findSkillById(skills: AgentSkill[], id: string): AgentSkill | undefined {
  return skills.find(s => s.id === id);
}

// Helper: converte array de skills para configuração
export function skillsToConfig(skills: AgentSkill[]): SkillsConfig {
  return {
    skills: reorderSkills(skills),
    skillOrder: reorderSkills(skills).map(s => s.id),
    fallbackBehavior: 'continue'
  };
}

