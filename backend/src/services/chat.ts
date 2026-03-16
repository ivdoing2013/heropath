import OpenAI from 'openai';
import { ConversationModel, CreateConversationInput } from '../models';

// 系统提示词 - 王编导角色
const SYSTEM_PROMPT = `你是王编导，一位资深的网文编辑和创作顾问，擅长帮助作者优化小说创作。

你的职责：
1. 帮助作者分析情节结构，提供专业的叙事建议
2. 识别故事中的亮点和需要改进的地方
3. 在关键情节点给出针对性的指导
4. 鼓励作者的同时保持专业态度

你的风格：
- 专业但不失亲和
- 善于发现作品的闪光点
- 能够一针见血地指出问题
- 提供具体可行的改进建议
- 使用中文回复

回复格式：
- 先简要回应作者的内容
- 然后给出具体的分析和建议
- 最后可以提出引导性的问题帮助作者思考`;

// DeepSeek 客户端
const createDeepSeekClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });
};

// AI 聊天服务
export const ChatService = {
  // 流式聊天（SSE）
  streamChat: async function* (
    userMessage: string,
    context?: { chapterId?: string; novelId?: string; history?: any[] }
  ): AsyncGenerator<string, void, unknown> {
    const client = createDeepSeekClient();

    // 构建消息历史
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // 添加历史对话
    if (context?.history && context.history.length > 0) {
      for (const msg of context.history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // 添加用户消息
    messages.push({ role: 'user', content: userMessage });

    try {
      const stream = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          yield content;
        }
      }

      // 保存对话记录
      await this.saveConversation({
        chapterId: context?.chapterId,
        novelId: context?.novelId,
        role: 'user',
        content: userMessage,
      });

      await this.saveConversation({
        chapterId: context?.chapterId,
        novelId: context?.novelId,
        role: 'assistant',
        content: fullResponse,
        model: 'deepseek-chat',
      });
    } catch (error) {
      console.error('[ChatService] 流式聊天错误:', error);
      throw error;
    }
  },

  // 非流式聊天（用于测试或简单场景）
  chat: async (
    userMessage: string,
    context?: { chapterId?: string; novelId?: string; history?: any[] }
  ): Promise<string> => {
    const client = createDeepSeekClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (context?.history && context.history.length > 0) {
      for (const msg of context.history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: userMessage });

    try {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';

      // 保存对话记录
      await ChatService.saveConversation({
        chapterId: context?.chapterId,
        novelId: context?.novelId,
        role: 'user',
        content: userMessage,
      });

      await ChatService.saveConversation({
        chapterId: context?.chapterId,
        novelId: context?.novelId,
        role: 'assistant',
        content,
        model: 'deepseek-chat',
        tokensUsed: response.usage?.total_tokens,
      });

      return content;
    } catch (error) {
      console.error('[ChatService] 聊天错误:', error);
      throw error;
    }
  },

  // 保存对话记录
  saveConversation: async (input: CreateConversationInput): Promise<void> => {
    try {
      await ConversationModel.create(input);
    } catch (error) {
      console.error('[ChatService] 保存对话记录失败:', error);
      // 不抛出错误，避免影响主流程
    }
  },

  // 获取对话历史
  getHistory: async (chapterId?: string, novelId?: string, limit: number = 20) => {
    if (chapterId) {
      return await ConversationModel.findByChapterId(chapterId, limit);
    } else if (novelId) {
      return await ConversationModel.findByNovelId(novelId, limit);
    } else {
      return await ConversationModel.findRecent(limit);
    }
  },
};

export default ChatService;
