import OpenAI from 'openai';

// DeepSeek 客户端
const createDeepSeekClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });
};

// 消息类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 系统提示词 - 王编导角色
const getSystemPrompt = (): string => {
  return `你是王编导，一位资深的网文编辑和创作顾问，擅长帮助作者从灵感到成稿。

## 你的职责
1. 通过对话引导作者明确创作方向
2. 帮助梳理故事核心要素（人物、世界观、情节）
3. 在关键节点生成结构化的故事卡片
4. 识别故事类型（抒情散文/男欢女爱/英雄之旅）
5. 当故事要素足够完整时，引导进入创作阶段

## 你的风格
- 温暖而专业，像一位经验丰富的导师
- 善于发现作品的闪光点
- 能够一针见血地指出问题
- 提供具体可行的改进建议
- 使用中文回复

## 故事类型识别
- 抒情散文：侧重情感表达、意境营造
- 男欢女爱：以爱情关系为核心的故事
- 英雄之旅：主角经历挑战、获得成长的冒险故事

## 回复格式
当你收集到足够信息时，可以在回复末尾添加结构化数据：

---STORY_ELEMENT---
类型: character|world|plot|scene
标题: 简短标题
内容: |
  详细内容，支持多行
---END---

---SUGGESTIONS---
- 建议回复1
- 建议回复2
- 建议回复3
---END---

当故事准备就绪时，添加：
---ACTION---
action: start_creating
message: 开始创作吧！
---END---`;
};

// AI 聊天服务
export const ChatService = {
  // 流式聊天（SSE）
  streamChat: async function* (
    messages: ChatMessage[]
  ): AsyncGenerator<string, void, unknown> {
    const client = createDeepSeekClient();

    // 构建完整消息列表
    const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      }))
    ];

    try {
      const stream = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: fullMessages,
        stream: true,
        temperature: 0.8,
        max_tokens: 2000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('[ChatService] 流式聊天错误:', error);
      throw error;
    }
  },

  // 非流式聊天（用于测试或简单场景）
  chat: async (messages: ChatMessage[]): Promise<string> => {
    const client = createDeepSeekClient();

    const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      }))
    ];

    try {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: fullMessages,
        temperature: 0.8,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ChatService] 聊天错误:', error);
      throw error;
    }
  },

  // 获取对话历史（简化版本，不依赖数据库）
  getHistory: async (_chapterId?: string, _novelId?: string, limit: number = 20) => {
    // 返回空数组，因为历史由前端维护
    return [];
  },
};

export default ChatService;
