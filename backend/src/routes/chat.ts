import { Router } from 'express';
import { ChatController } from '../controllers/chat';

const router = Router();

// POST /api/chat - 流式对话接口（SSE）
router.post('/', ChatController.streamChat);

// POST /api/chat/simple - 非流式对话接口
router.post('/simple', ChatController.chat);

// GET /api/chat/history - 获取对话历史
router.get('/history', ChatController.getHistory);

export default router;
