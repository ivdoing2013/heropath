import { Request, Response, NextFunction } from 'express';
import { jwtUtils, responseUtils } from '../utils/helpers';
import { logger } from '../utils/config';

// 扩展Express的Request类型
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// 认证中间件
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractToken(authHeader);

    if (!token) {
      return res.status(401).json(
        responseUtils.error('UNAUTHORIZED', '未提供认证令牌')
      );
    }

    const decoded = jwtUtils.verifyToken(token);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error });
    return res.status(401).json(
      responseUtils.error('UNAUTHORIZED', '认证令牌无效或已过期')
    );
  }
};

// 可选认证中间件(不强制要求登录，但会解析token)
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractToken(authHeader);

    if (token) {
      const decoded = jwtUtils.verifyToken(token);
      req.userId = decoded.userId;
    }
    
    next();
  } catch {
    // 可选认证失败不阻止请求
    next();
  }
};

// 错误处理中间件
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 区分开发和生产环境的错误信息
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(500).json(
    responseUtils.error(
      'INTERNAL_ERROR',
      '服务器内部错误',
      isDev ? { stack: err.stack, message: err.message } : undefined
    )
  );
};

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: duration + 'ms',
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
  });
  
  next();
};

// 异步处理包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 验证中间件(使用Zod)
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json(
          responseUtils.error('VALIDATION_ERROR', '请求参数验证失败', { errors })
        );
      }

      // 将验证后的数据附加到请求对象
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// 请求ID中间件
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.get('X-Request-ID') || Math.random().toString(36).substring(2, 15);
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// 安全头中间件
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS保护
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // 严格的传输安全
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // 内容安全策略
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};