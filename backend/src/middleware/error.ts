import { Request, Response, NextFunction } from 'express';

// 错误响应格式
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  stack?: string;
}

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 错误处理
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`找不到路径: ${req.originalUrl}`, 404);
  next(error);
};

// 全局错误处理
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    message = '请求体JSON格式错误';
    isOperational = true;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权';
    isOperational = true;
  }

  const response: ErrorResponse = {
    success: false,
    error: message,
  };

  // 开发环境添加详细信息
  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
    response.stack = err.stack;
  }

  console.error('[ErrorHandler]', {
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json(response);
};

// 异步错误包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
