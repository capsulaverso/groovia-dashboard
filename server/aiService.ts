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
