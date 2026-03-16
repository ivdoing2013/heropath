import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat';

// 请求验证模式
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  stream: z.boolean().optional().default(true),
});

// 简单的非流式聊天请求
const SimpleChatRequestSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(10000, '消息过长'),
  stream: z.boolean().optional().default(false),
});

// 聊天控制器
export const ChatController = {
  // 流式聊天（SSE）
  streamChat: async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求
      const validated = ChatRequestSchema.parse(req.body);
      const { messages, stream } = validated;

      if (stream) {
        // 设置SSE头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // 发送初始事件
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { role: 'assistant' }, index: 0 }] })}\n\n`);

        // 流式响应
        const streamGenerator = ChatService.streamChat(messages);

        for await (const chunk of streamGenerator) {
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk }, index: 0 }] })}\n\n`);
        }

        // 发送结束标记
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        // 非流式响应
        const response = await ChatService.chat(messages);
        res.json({
          success: true,
          data: {
            content: response,
            role: 'assistant',
          },
        });
      }
    } catch (error) {
      console.error('[ChatController] 流式聊天错误:', error);
      
      if (error instanceof z.ZodError) {
        if (!res.headersSent) {
          res.status(400).json({
            success: false,
            error: '请求参数错误',
            details: error.errors,
          });
        }
        return;
      }

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: '服务器内部错误',
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: '生成回复时出错' })}\n\n`);
        res.end();
      }
    }
  },

  // 简单的非流式聊天接口
  chat: async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = SimpleChatRequestSchema.parse(req.body);
      const { message } = validated;

      const response = await ChatService.chat([
        { role: 'user', content: message }
      ]);

      res.json({
        success: true,
        data: {
          content: response,
          role: 'assistant',
        },
      });
    } catch (error) {
      console.error('[ChatController] 聊天错误:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: '请求参数错误',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 获取对话历史（简化版本）
  getHistory: async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: [],
    });
  },
};

export default ChatController;
