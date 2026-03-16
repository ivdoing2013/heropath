import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { initializeDatabase } from './utils/init';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app: Application = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // 日志
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API路由
app.use('/api', routes);

// 健康检查（根路径）
app.get('/health', (_req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initializeDatabase();
    console.log('✅ 数据库初始化完成');

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
    console.error('❌ 服务器启动失败:', error);
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

startServer();

export default app;
