// Serviço para comunicação com N8N
import { OutputBlock, TextBlock, LoadingBlock } from '../shared/outputBlocks.js';

interface N8NPayload {
  message: string;
  agentName?: string;
  clientName?: string;
  userId?: number;
  agentId?: number;
  conversationId?: number;
  timestamp?: string;
  [key: string]: any;
}

interface N8NResponse {
  success: boolean;
  response?: string;
  blocks?: OutputBlock[];
  error?: string;
  metadata?: any;
}

export class N8NService {
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || 'https://capsuladev-n8n.jv4bim.easypanel.host/webhook/ENTRADA-DADOS';
  }

  /**
   * Envia dados para o webhook do N8N
   */
  async sendToWebhook(payload: N8NPayload): Promise<N8NResponse> {
    try {
      console.log('📤 Enviando para N8N:', { webhook: this.webhookUrl, payload });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`N8N retornou status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Resposta do N8N:', data);

      // A resposta do N8N pode vir em diferentes formatos
      const blocks = this.extractBlocks(data);
      const text = this.extractResponse(data, blocks);

      // Se text é null, N8N não retornou resposta válida
      if (text === null) {
        console.log('⚠️ N8N retornou resposta inválida, marcando como falha');
        return {
          success: false,
          error: 'N8N retornou resposta inválida ou workflow assíncrono',
        };
      }

      return {
        success: true,
        response: text,
        blocks,
        metadata: data,
      };
    } catch (error) {
      console.error('❌ Erro ao comunicar com N8N:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Extrai a resposta de diferentes formatos possíveis do N8N
   */
  private extractResponse(data: any, preParsedBlocks?: OutputBlock[]): string {
    console.log('🔍 Extraindo resposta do N8N:', data);

    // Se já houver blocks, gerar um texto de fallback simples
    if (preParsedBlocks && preParsedBlocks.length > 0) {
      const maybeText = (preParsedBlocks.find(b => b.type === 'text') as TextBlock | undefined)?.text;
      if (maybeText) return maybeText;
    }

    // Caso 1: Resposta direta em "response"
    if (data.response) {
      console.log('✅ Resposta encontrada em data.response:', data.response);
      return String(data.response);
    }

    // Caso 2: "Workflow was started" indica execução assíncrona - FALHA, USAR FALLBACK
    if (data.message === 'Workflow was started') {
      console.log('⚠️ N8N retornou "Workflow was started" - NÃO É UMA RESPOSTA VÁLIDA');
      // Retorna null para indicar que precisa usar fallback
      return null;
    }

    // Caso 3: Mensagem de resposta direta
    if (data.message && data.message !== 'Workflow was started' && data.message.trim().length > 10) {
      console.log('✅ Resposta encontrada em data.message:', data.message);
      return String(data.message);
    }

    // Caso 3.5: Mensagem genérica curta demais
    if (data.message && data.message.length <= 10) {
      console.log('⚠️ Mensagem muito curta, pode ser erro:', data.message);
      return null;
    }

    // Caso 4: Resposta em array (n8n retorna workflows executados)
    if (Array.isArray(data) && data.length > 0) {
      const lastItem = data[data.length - 1];
      if (lastItem.response) {
        console.log('✅ Resposta encontrada em array[last].response');
        return String(lastItem.response);
      }
      if (lastItem.message && lastItem.message !== 'Workflow was started') {
        console.log('✅ Resposta encontrada em array[last].message');
        return String(lastItem.message);
      }
    }

    // Caso 5: Resposta em objeto aninhado
    if (data.data) {
      if (data.data.response) {
        console.log('✅ Resposta encontrada em data.data.response');
        return String(data.data.response);
      }
      if (data.data.message && data.data.message !== 'Workflow was started') {
        console.log('✅ Resposta encontrada em data.data.message');
        return String(data.data.message);
      }
    }

    // Caso 6: Retorna string do objeto inteiro (fallback)
    console.log('⚠️ Nenhum formato conhecido, retornando JSON completo');
    return JSON.stringify(data);
  }

  /**
   * Tenta extrair OutputBlocks padronizados de uma resposta do N8N
   */
  private extractBlocks(data: any): OutputBlock[] | undefined {
    try {
      // Caso padrão: objeto com campo blocks já pronto
      if (data && Array.isArray(data.blocks)) {
        return data.blocks as OutputBlock[];
      }

      // Caso: mensagem de workflow assíncrono
      if (data && data.message === 'Workflow was started') {
        const block: LoadingBlock = { type: 'loading', message: 'Processando com orquestração. Aguarde...' };
        return [block];
      }

      // Caso: resposta simples em string -> converte para bloco de texto
      if (typeof data === 'string') {
        const block: TextBlock = { type: 'text', text: data };
        return [block];
      }

      // Caso: estrutura comum do N8N
      if (data && (data.response || data.message)) {
        const text = String(data.response || data.message);
        const block: TextBlock = { type: 'text', text };
        return [block];
      }

      // Caso: array de execuções
      if (Array.isArray(data) && data.length > 0) {
        const last = data[data.length - 1];
        if (last && (last.response || last.message)) {
          const text = String(last.response || last.message);
          const block: TextBlock = { type: 'text', text };
          return [block];
        }
      }
    } catch (err) {
      console.warn('⚠️ Falha ao extrair blocks do N8N:', err);
    }
    return undefined;
  }

  /**
   * Processa mensagem do usuário através do N8N
   */
  async processMessage(params: {
    message: string;
    agentName?: string;
    clientName?: string;
    userId?: number;
    agentId?: number;
    conversationId?: number;
  }): Promise<{ text: string; blocks?: OutputBlock[]; raw?: any }> {
    const payload: N8NPayload = {
      message: params.message,
      agentName: params.agentName,
      clientName: params.clientName,
      userId: params.userId,
      agentId: params.agentId,
      conversationId: params.conversationId,
      timestamp: new Date().toISOString(),
    };

    const result = await this.sendToWebhook(payload);

    if (!result.success || !result.response) {
      console.log('❌ N8N falhou ou retornou resposta inválida, deve usar fallback');
      throw new Error(result.error || 'N8N retornou resposta inválida');
    }

    return {
      text: result.response,
      blocks: result.blocks,
      raw: result.metadata,
    };
  }
}

// Exportar instância singleton
export const n8nService = new N8NService();

