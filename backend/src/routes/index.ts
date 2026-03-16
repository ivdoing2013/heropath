import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API 信息
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'HeroPath API',
      version: '1.0.0',
      description: 'AI引导的小说创作平台后端API',
      endpoints: {
        chat: '/api/chat',
        chapters: '/api/chapters',
        health: '/api/health',
      },
    },
  });
});

export default router;
