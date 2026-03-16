import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

// Helmet 安全配置
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS 配置
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
    // 允许无来源的请求（如Postman）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export const corsMiddleware = cors(corsOptions);

// 日志配置
export const loggerMiddleware = morgan(
  process.env.NODE_ENV === 'production' 
    ? 'combined' 
    : ':method :url :status :response-time ms - :res[content-length]',
  {
    stream: {
      write: (message: string) => {
        console.log(message.trim());
      },
    },
  }
);

// 请求体大小限制
export const bodyParserLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true },
};

// 请求超时处理
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeoutMs, () => {
      res.status(408).json({
        success: false,
        error: '请求超时',
      });
    });
    next();
  };
};
