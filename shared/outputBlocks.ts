// Tipos compartilhados para respostas ricas dos agentes (OutputBlocks)

export type OutputBlockType = 'text' | 'loading' | 'chart' | 'checklist' | 'action';

export interface BaseBlock {
  type: OutputBlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
}

export interface LoadingBlock extends BaseBlock {
  type: 'loading';
  message?: string;
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  title?: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | string;
  data: unknown; // backend não opina no formato aqui
  options?: unknown;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
}

export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  title?: string;
  items: ChecklistItem[];
}

export interface ActionBlock extends BaseBlock {
  type: 'action';
  actionId: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  payload?: Record<string, unknown>;
}

export type OutputBlock = TextBlock | LoadingBlock | ChartBlock | ChecklistBlock | ActionBlock;

export function blocksToPlainText(blocks: OutputBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'text':
          return b.text;
        case 'loading':
          return b.message || 'Processando...';
        case 'checklist':
          return `${b.title ? `${b.title}:\n` : ''}${b.items
            .map((i) => `${i.checked ? '[x]' : '[ ]'} ${i.label}`)
            .join('\n')}`;
        case 'action':
          return `Ação: ${b.label}`;
        case 'chart':
          return b.title ? `Gráfico: ${b.title}` : 'Gráfico';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}


