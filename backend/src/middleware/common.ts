import { Request, Response, NextFunction } from 'express';

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('[Request]', JSON.stringify(logData, null, 2));
    }
  });
  
  next();
};

// 响应格式化中间件
export const responseFormatter = (req: Request, res: Response, next: NextFunction): void => {
  // 保存原始的res.json方法
  const originalJson = res.json.bind(res);
  
  // 重写res.json方法
  res.json = function(data: any) {
    // 如果已经是标准格式，直接返回
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson(data);
    }
    
    // 包装为标准格式
    return originalJson({
      success: true,
      data,
    });
  };
  
  next();
};
