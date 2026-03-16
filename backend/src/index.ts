import express, { Application } from 'express';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

import {
  securityMiddleware,
  corsMiddleware,
  loggerMiddleware,
  bodyParserLimits,
} from './middleware/security';
import { requestLogger, responseFormatter } from './middleware/common';
import { errorHandler, notFoundHandler } from './middleware/error';
import { initializeDatabase, healthCheck } from './utils/init';

// 导入路由
import indexRoutes from './routes';
import chatRoutes from './routes/chat';
import chapterRoutes from './routes/chapters';

// 创建Express应用
const app: Application = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(loggerMiddleware);
app.use(express.json(bodyParserLimits.json));
app.use(express.urlencoded(bodyParserLimits.urlencoded));
app.use(requestLogger);
app.use(responseFormatter);

// 路由
app.use('/api', indexRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chapters', chapterRoutes);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async (): Promise<void> => {
  try {
    // 初始化数据库
    await initializeDatabase();

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 HeroPath Backend Server                              ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST /api/chat           - AI对话（流式SSE）          ║
║   • POST /api/chat/simple    - AI对话（非流式）           ║
║   • GET  /api/chat/history   - 获取对话历史               ║
║   • POST /api/chapters       - 创建章节                   ║
║   • GET  /api/chapters/:id   - 获取章节详情               ║
║   • GET  /api/health         - 健康检查                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('[Server] 启动失败:', error);
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('[Process] 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process] 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('[Server] 收到SIGTERM信号，正在关闭...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] 收到SIGINT信号，正在关闭...');
  process.exit(0);
});

// 启动
startServer();

export default app;
