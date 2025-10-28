import OpenAI from 'openai';
import Groq from 'groq-sdk';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });

const replitOpenAI = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

const externalOpenAI = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const groqClient = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

export interface AITestRequest {
  provider: 'replit' | 'openai' | 'groq';
  model: string;
  systemPrompt: string;
  testMessage: string;
  fallbackPrompt?: string;
  webhookUrl?: string;
}

export interface AITestResponse {
  success: boolean;
  response?: string;
  error?: string;
  usedFallback?: boolean;
  cachedResponse?: boolean;
  provider: string;
  model: string;
  tokensUsed?: number;
  latencyMs: number;
}

export interface N8NIntegrationConfig {
  n8nUrl: string;
  workflowId?: string;
  headers?: Record<string, string>;
}

export interface DifyIntegrationConfig {
  apiUrl: string;
  apiKey: string;
  appId?: string;
  userId?: string;
}

export interface LangchainIntegrationConfig {
  apiUrl: string;
  apiKey?: string;
  agentId?: string;
  model?: string;
  headers?: Record<string, string>;
}

export interface AgentMessageRequest {
  clientId: number;
  senderAgentId: number;
  receiverAgentId: number;
  content: string;
  messageType?: string;
  metadata?: Record<string, any>;
}

const getCacheKey = (provider: string, model: string, systemPrompt: string, message: string): string => {
  return `ai:${provider}:${model}:${Buffer.from(systemPrompt + message).toString('base64').substring(0, 50)}`;
};

const callWebhook = async (webhookUrl: string, data: any): Promise<any> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const callN8N = async (config: N8NIntegrationConfig, data: any): Promise<any> => {
  try {
    const url = config.workflowId 
      ? `${config.n8nUrl}/webhook/${config.workflowId}`
      : config.n8nUrl;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`N8N returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`N8N error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const callDify = async (config: DifyIntegrationConfig, message: string, userId?: string): Promise<any> => {
  try {
    const response = await fetch(`${config.apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        user: userId || config.userId || 'default-user',
        response_mode: 'blocking',
      }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`Dify returned status ${response.status}`);
    }
    
    const result = await response.json();
    return result.answer || result;
  } catch (error) {
    throw new Error(`Dify error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const callLangchain = async (config: LangchainIntegrationConfig, message: string, systemPrompt?: string): Promise<any> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    const body: any = {
      input: message,
    };
    
    if (systemPrompt) {
      body.system_message = systemPrompt;
    }
    
    if (config.agentId) {
      body.agent_id = config.agentId;
    }
    
    if (config.model) {
      body.model = config.model;
    }
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`Langchain returned status ${response.status}`);
    }
    
    const result = await response.json();
    return result.output || result.response || result;
  } catch (error) {
    throw new Error(`Langchain error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const testAIAgent = async (request: AITestRequest): Promise<AITestResponse> => {
  const startTime = Date.now();
  const cacheKey = getCacheKey(request.provider, request.model, request.systemPrompt, request.testMessage);
  
  const cachedResponse = cache.get<string>(cacheKey);
  if (cachedResponse) {
    return {
      success: true,
      response: cachedResponse,
      cachedResponse: true,
      provider: request.provider,
      model: request.model,
      latencyMs: Date.now() - startTime
    };
  }

  try {
    if (request.webhookUrl) {
      try {
        const webhookResult = await callWebhook(request.webhookUrl, {
          message: request.testMessage,
          systemPrompt: request.systemPrompt,
          model: request.model
        });
        
        const responseText = typeof webhookResult === 'string' ? webhookResult : webhookResult.response || JSON.stringify(webhookResult);
        
        cache.set(cacheKey, responseText);
        
        return {
          success: true,
          response: responseText,
          provider: 'webhook',
          model: request.model,
          latencyMs: Date.now() - startTime
        };
      } catch (webhookError) {
        console.error('Webhook error, falling back to AI:', webhookError);
      }
    }

    let aiResponse: string;
    let tokensUsed: number | undefined;

    if (request.provider === 'replit') {
      const completion = await replitOpenAI.chat.completions.create({
        model: request.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.testMessage }
        ],
        max_completion_tokens: 8192
      });
      
      aiResponse = completion.choices[0]?.message?.content || '';
      tokensUsed = completion.usage?.total_tokens;

    } else if (request.provider === 'openai') {
      if (!externalOpenAI) {
        throw new Error('OpenAI API key não configurada');
      }
      
      const completion = await externalOpenAI.chat.completions.create({
        model: request.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.testMessage }
        ],
        max_tokens: 8192
      });
      
      aiResponse = completion.choices[0]?.message?.content || '';
      tokensUsed = completion.usage?.total_tokens;

    } else if (request.provider === 'groq') {
      if (!groqClient) {
        throw new Error('Groq API key não configurada');
      }
      
      const completion = await groqClient.chat.completions.create({
        model: request.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.testMessage }
        ],
        max_tokens: 8192
      });
      
      aiResponse = completion.choices[0]?.message?.content || '';
      tokensUsed = completion.usage?.total_tokens;

    } else {
      throw new Error(`Provider desconhecido: ${request.provider}`);
    }

    cache.set(cacheKey, aiResponse);

    return {
      success: true,
      response: aiResponse,
      provider: request.provider,
      model: request.model,
      tokensUsed,
      latencyMs: Date.now() - startTime
    };

  } catch (error) {
    console.error('AI Error:', error);
    
    if (request.fallbackPrompt) {
      return {
        success: true,
        response: request.fallbackPrompt,
        usedFallback: true,
        provider: request.provider,
        model: request.model,
        latencyMs: Date.now() - startTime
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      provider: request.provider,
      model: request.model,
      latencyMs: Date.now() - startTime
    };
  }
};

export const clearCache = (pattern?: string): number => {
  if (!pattern) {
    const keys = cache.keys();
    cache.flushAll();
    return keys.length;
  }
  
  const keys = cache.keys().filter(key => key.includes(pattern));
  keys.forEach(key => cache.del(key));
  return keys.length;
};

export const getCacheStats = () => {
  return cache.getStats();
};

export const executeIntegration = async (
  integrationType: string,
  config: any,
  message: string,
  systemPrompt?: string,
  userId?: string
): Promise<any> => {
  try {
    switch (integrationType.toLowerCase()) {
      case 'n8n':
        return await callN8N(config as N8NIntegrationConfig, { message, systemPrompt });
      
      case 'dify':
        return await callDify(config as DifyIntegrationConfig, message, userId);
      
      case 'langchain':
        return await callLangchain(config as LangchainIntegrationConfig, message, systemPrompt);
      
      case 'webhook':
        return await callWebhook(config.webhookUrl || config.url, { message, systemPrompt });
      
      default:
        throw new Error(`Unsupported integration type: ${integrationType}`);
    }
  } catch (error) {
    console.error(`Integration ${integrationType} error:`, error);
    throw error;
  }
};

export const routeAgentMessage = async (request: AgentMessageRequest): Promise<any> => {
  try {
    const messageData = {
      clientId: request.clientId,
      senderAgentId: request.senderAgentId,
      receiverAgentId: request.receiverAgentId,
      content: request.content,
      messageType: request.messageType || 'request',
      metadata: request.metadata || {},
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      messageData,
      status: 'routed'
    };
  } catch (error) {
    console.error('Agent message routing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
