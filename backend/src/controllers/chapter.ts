import { Request, Response } from 'express';
import { z } from 'zod';
import { HeartbeatType } from '../models/schema';
import { ChapterService, HeartbeatService } from '../services/chapter';

// 创建章节请求验证
const CreateChapterSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题过长'),
  content: z.string().max(100000, '内容过长').optional(),
  novelId: z.string().uuid('无效的小说ID'),
});

// 创建心跳标记请求验证
const CreateHeartbeatSchema = z.object({
  chapterId: z.string().uuid('无效的章节ID'),
  position: z.number().int().min(0, '位置不能为负数'),
  type: z.enum(['flow', 'emotion', 'golden', 'twist', 'user']),
  content: z.string().min(1, '内容不能为空').max(1000, '内容过长'),
  note: z.string().max(2000, '备注过长').optional(),
});

// 章节控制器
export const ChapterController = {
  // 创建章节
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateChapterSchema.parse(req.body);
      const result = await ChapterService.createChapter(validated);

      res.status(201).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('[ChapterController] 创建章节错误:', error);

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

  // 获取章节详情
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await ChapterService.getChapterWithHeartbeats(id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: '章节不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('[ChapterController] 获取章节错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 获取小说的所有章节
  getByNovel: async (req: Request, res: Response): Promise<void> => {
    try {
      const { novelId } = req.params;
      const chapters = await ChapterService.getChaptersByNovel(novelId);

      res.json({
        success: true,
        data: chapters,
      });

    } catch (error) {
      console.error('[ChapterController] 获取章节列表错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 更新章节
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      const chapter = await ChapterService.updateChapter(id, { title, content });

      if (!chapter) {
        res.status(404).json({
          success: false,
          error: '章节不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: chapter,
      });

    } catch (error) {
      console.error('[ChapterController] 更新章节错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 删除章节
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await ChapterService.deleteChapter(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: '章节不存在',
        });
        return;
      }

      res.json({
        success: true,
        message: '章节已删除',
      });

    } catch (error) {
      console.error('[ChapterController] 删除章节错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },
};

// 心跳标记控制器
export const HeartbeatController = {
  // 创建心跳标记
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateHeartbeatSchema.parse(req.body);
      const result = await HeartbeatService.createHeartbeat(validated);

      res.status(201).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('[HeartbeatController] 创建心跳标记错误:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: '请求参数错误',
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error && error.message === '章节不存在') {
        res.status(404).json({
          success: false,
          error: '章节不存在',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 获取章节的心跳标记
  getByChapter: async (req: Request, res: Response): Promise<void> => {
    try {
      const { chapterId } = req.params;
      const heartbeats = await HeartbeatService.getHeartbeatsByChapter(chapterId);

      res.json({
        success: true,
        data: heartbeats,
      });

    } catch (error) {
      console.error('[HeartbeatController] 获取心跳标记错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },

  // 删除心跳标记
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await HeartbeatService.deleteHeartbeat(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: '心跳标记不存在',
        });
        return;
      }

      res.json({
        success: true,
        message: '心跳标记已删除',
      });

    } catch (error) {
      console.error('[HeartbeatController] 删除心跳标记错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
    }
  },
};

export default { ChapterController, HeartbeatController };
