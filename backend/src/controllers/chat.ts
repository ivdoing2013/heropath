import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat';

// 请求验证模式
const ChatRequestSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(10000, '消息过长'),
  chapterId: z.string().uuid().optional(),
  novelId: z.string().uuid().optional(),
  stream: z.boolean().optional().default(true),
});

// 聊天控制器
export const ChatController = {
  // 流式聊天（SSE）
  streamChat: async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求
      const validated = ChatRequestSchema.parse(req.body);
      const { message, chapterId, novelId } = validated;

      // 设置SSE头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // 发送初始事件
      res.write('event: start\n');
      res.write(`data: ${JSON.stringify({ status: 'started' })}\n\n`);

      // 获取历史对话
      const history = chapterId || novelId 
        ? await ChatService.getHistory(chapterId, novelId, 10)
        : [];

      // 流式响应
      const stream = ChatService.streamChat(message, {
        chapterId,
        novelId,
        history: history.map(h => ({ role: h.role, content: h.content })),
      });

      for await (const chunk of stream) {
        res.write('event: message\n');
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      // 发送结束事件
      res.write('event: end\n');
      res.write(`data: ${JSON.stringify({ status: 'completed' })}\n\n`);
      res.end();

    } catch (error) {
      console.error('[ChatController] 流式聊天错误:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: '请求参数错误',
          details: error.errors,
        });
        return;
      }

      // 如果是SSE已经开始，发送错误事件
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: '服务器内部错误',
        });
      } else {
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ error: '生成回复时出错' })}\n\n`);
        res.end();
      }
    }
  },

  // 非流式聊天
  chat: async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = ChatRequestSchema.parse(req.body);
      const { message, chapterId, novelId } = validated;

      const history = chapterId || novelId 
        ? await ChatService.getHistory(chapterId, novelId, 10)
        : [];

      const response = await ChatService.chat(message, {
        chapterId,
        novelId,
        history: history.map(h => ({ role: h.role, content: h.content })),
      });

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

  // 获取对话历史
  getHistory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { chapterId, novelId, limit } = req.query;

      const history = await ChatService.getHistory(
        chapterId as string | undefined,
        novelId as string | undefined,
        limit ? parseInt(limit as string, 10) : 20
      );

      res.json({
        success: true,
        data: history,
      });

    } catch (error) {
      console.error('[ChatController] 获取历史错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },
};

export default ChatController;
