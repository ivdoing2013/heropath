import { Router } from 'express';
import indexRoutes from './routes/index';
import chatRoutes from './routes/chat';
import chapterRoutes from './routes/chapters';

const router = Router();

// 基础路由
router.use('/', indexRoutes);

// 聊天路由
router.use('/chat', chatRoutes);

// 章节路由（包含心跳标记）
router.use('/chapters', chapterRoutes);

export default router;
