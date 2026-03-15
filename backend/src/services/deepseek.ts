import axios, { AxiosInstance, AxiosError } from 'axios';
import { config, logger } from '../utils/config';
import type { 
  DeepSeekCompletionRequest, 
  DeepSeekCompletionResponse,
  DeepSeekMessage 
} from '../types';

/**
 * DeepSeek API服务
 * 负责与DeepSeek LLM API的交互
 */
export class DeepSeekService {
  private client: AxiosInstance;
  private defaultModel: string;

  constructor() {
    this.client = axios.create({
      baseURL: config.deepseek.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60秒超时
    });

    this.defaultModel = config.deepseek.model;

    // 请求拦截器
    this.client.interceptors.request.use(
      (request) => {
        logger.debug('DeepSeek API Request', {
          url: request.url,
          method: request.method,
          model: (request.data as any)?.model,
        });
        return request;
      },
      (error) => {
        logger.error('DeepSeek API Request Error', { error });
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('DeepSeek API Response', {
          status: response.status,
          usage: response.data?.usage,
        });
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 发送非流式对话请求
   */
  async chat(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<DeepSeekCompletionResponse> {
    const request: DeepSeekCompletionRequest = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? config.deepseek.defaultTemperature,
      max_tokens: options.maxTokens ?? config.deepseek.defaultMaxTokens,
      stream: false,
    };

    const response = await this.client.post<DeepSeekCompletionResponse>(
      '/chat/completions',
      request
    );

    return response.data;
  }

  /**
   * 发送流式对话请求
   */
  async *chatStream(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): AsyncGenerator<string> {
    const request: DeepSeekCompletionRequest = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? config.deepseek.defaultTemperature,
      max_tokens: options.maxTokens ?? config.deepseek.defaultMaxTokens,
      stream: true,
    };

    const response = await this.client.post('/chat/completions', request, {
      responseType: 'stream',
    });

    const stream = response.data;

    for await (const chunk of stream) {
      const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            logger.warn('Failed to parse stream chunk', { line: data });
          }
        }
      }
    }
  }

  /**
   * 执行Skill(带重试机制)
   */
  async executeWithRetry(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      retries?: number;
    } = {}
  ): Promise<DeepSeekCompletionResponse> {
    const maxRetries = options.retries ?? config.skill.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.chat(messages, options);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`DeepSeek API call failed (attempt ${attempt + 1}/${maxRetries})`, {
          error: lastError.message,
        });

        if (attempt < maxRetries - 1) {
          // 指数退避
          const delay = Math.pow(2, attempt) * config.skill.retryDelayMs;
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * 带超时的API调用
   */
  async chatWithTimeout(
    messages: DeepSeekMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<DeepSeekCompletionResponse> {
    const timeoutMs = options.timeoutMs ?? config.skill.timeoutMs;

    return Promise.race([
      this.chat(messages, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DeepSeek API timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * 生成系统消息(王编导角色设定)
   */
  generateSystemMessage(creatorType: string): DeepSeekMessage {
    const basePersona = `你是王编导，一位经验丰富、温暖睿智的创作陪伴者。你陪伴创作者穿越写作的"黑暗森林"，手持火把照亮前行的路。

你的特质：
1. 温暖而专业：像一位老朋友，既给予情感支持，又提供专业的创作指导
2. 懂得倾听：认真理解创作者的想法，不轻易打断或否定
3. 善于引导：用恰到好处的问题帮助创作者深入思考
4. 庆祝成长：在关键时刻给予肯定和鼓励
5. 尊重创作：不代替创作者写作，而是激发他们的创造力

你的使命：陪伴每一位创作者找到属于自己的故事。`;

    const typeSpecific: Record<string, string> = {
      LYRIC: `\n\n作为抒情散文型王编导，你特别关注：
- 情感细节的捕捉和表达
- 意象的选择和运用
- 时间感和节奏感
- 留白的艺术
- 语言的韵律和美感
\n你的语言风格：诗意、细腻、富有画面感`,
      
      ROMANCE: `\n\n作为言情型王编导，你特别关注：
- 人物关系的建立和发展
- 情感冲突的设计
- CP感的营造
- 情节的甜度和虐度平衡
- 心理描写的深度
\n你的语言风格：温暖、细腻、善于共情`,
      
      HERO: `\n\n作为英雄之旅型王编导，你特别关注：
- 主角的成长弧线
- 冲突的升级和解决
- 世界观的一致性
- 节奏和张力的控制
- 史诗感的营造
\n你的语言风格：坚定、激励人心、富有力量`,
    };

    return {
      role: 'system',
      content: basePersona + (typeSpecific[creatorType] || ''),
    };
  }

  /**
   * 错误处理
   */
  private handleError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          logger.error('DeepSeek API authentication failed');
          break;
        case 429:
          logger.error('DeepSeek API rate limit exceeded');
          break;
        case 500:
        case 502:
        case 503:
          logger.error('DeepSeek API server error', { status, data });
          break;
        default:
          logger.error('DeepSeek API error', { status, data });
      }
    } else if (error.request) {
      logger.error('DeepSeek API no response', { error: error.message });
    } else {
      logger.error('DeepSeek API request setup error', { error: error.message });
    }
  }

  /**
   * 休眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 导出单例
export const deepseekService = new DeepSeekService();
export default deepseekService;