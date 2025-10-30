// Serviço para comunicação com N8N

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
      return {
        success: true,
        response: this.extractResponse(data),
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
  private extractResponse(data: any): string {
    console.log('🔍 Extraindo resposta do N8N:', data);

    // Caso 1: Resposta direta em "response"
    if (data.response) {
      console.log('✅ Resposta encontrada em data.response:', data.response);
      return String(data.response);
    }

    // Caso 2: "Workflow was started" indica execução assíncrona
    if (data.message === 'Workflow was started') {
      console.log('⚡ Workflow iniciado, retornando mensagem de processamento');
      return 'Recebi sua mensagem e estou processando. Aguarde um momento para minha resposta completa.';
    }

    // Caso 3: Mensagem de resposta direta
    if (data.message && data.message !== 'Workflow was started') {
      console.log('✅ Resposta encontrada em data.message:', data.message);
      return String(data.message);
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
   * Processa mensagem do usuário através do N8N
   */
  async processMessage(params: {
    message: string;
    agentName?: string;
    clientName?: string;
    userId?: number;
    agentId?: number;
    conversationId?: number;
  }): Promise<string> {
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

    if (!result.success) {
      throw new Error(result.error || 'Erro ao processar mensagem no N8N');
    }

    return result.response || 'Não foi possível obter resposta do N8N';
  }
}

// Exportar instância singleton
export const n8nService = new N8NService();

