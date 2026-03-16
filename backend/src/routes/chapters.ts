import { Router } from 'express';
import { ChapterController, HeartbeatController } from '../controllers/chapter';

const router = Router();

// 章节路由
// POST /api/chapters - 创建章节
router.post('/', ChapterController.create);

// GET /api/chapters/:id - 获取章节详情
router.get('/:id', ChapterController.getById);

// GET /api/chapters/novel/:novelId - 获取小说的所有章节
router.get('/novel/:novelId', ChapterController.getByNovel);

// PUT /api/chapters/:id - 更新章节
router.put('/:id', ChapterController.update);

// DELETE /api/chapters/:id - 删除章节
router.delete('/:id', ChapterController.delete);

// 心跳标记路由
// POST /api/heartbeat - 创建心跳标记
router.post('/heartbeat', HeartbeatController.create);

// GET /api/heartbeat/chapter/:chapterId - 获取章节的心跳标记
router.get('/heartbeat/chapter/:chapterId', HeartbeatController.getByChapter);

// DELETE /api/heartbeat/:id - 删除心跳标记
router.delete('/heartbeat/:id', HeartbeatController.delete);

export default router;
