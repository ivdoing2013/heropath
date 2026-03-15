import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import type { User, AuthResponse } from '../types';

// JWT工具
export const jwtUtils = {
  // 生成JWT令牌
  generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  },

  // 验证JWT令牌
  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, config.jwt.secret) as { userId: string };
  },

  // 从请求头中提取令牌
  extractToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  },
};

// 密码工具
export const passwordUtils = {
  // 哈希密码
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // 验证密码
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

// 时间工具
export const timeUtils = {
  // 获取当前时间戳(毫秒)
  now(): number {
    return Date.now();
  },

  // 获取当前时间戳(秒)
  nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  },

  // 格式化日期
  format(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 获取相对时间描述
  relativeTime(date: Date | string | number): string {
    const now = Date.now();
    const target = new Date(date).getTime();
    const diff = now - target;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return timeUtils.format(date, 'YYYY-MM-DD');
  },

  // 计算持续时间(毫秒转可读格式)
  duration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    }
    if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  },
};

// 字符串工具
export const stringUtils = {
  // 生成随机ID
  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  // 截断字符串
  truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  // 计算字数(中文字符算1个字，英文单词算1个字)
  countWords(text: string): number {
    if (!text) return 0;
    // 移除空白字符后计算长度(中文)
    const chineseChars = text.replace(/\s/g, '').length;
    // 英文单词数
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  },

  // 生成版本号
  generateVersionNumber(type: 'major' | 'minor' | 'patch', currentVersion?: string): string {
    if (!currentVersion) return '1.0.0';
    
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return currentVersion;
    }
  },

  // 安全地解析JSON
  safeJsonParse<T>(str: string, defaultValue: T): T {
    try {
      return JSON.parse(str) as T;
    } catch {
      return defaultValue;
    }
  },
};

// 验证工具
export const validationUtils = {
  // 验证邮箱
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 验证密码强度
  isStrongPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: '密码至少需要8个字符' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: '密码需要包含大写字母' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: '密码需要包含小写字母' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: '密码需要包含数字' };
    }
    return { valid: true };
  },

  // 验证UUID
  isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },
};

// API响应工具
export const responseUtils = {
  // 成功响应
  success<T>(data: T, meta?: Record<string, any>) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  },

  // 错误响应
  error(code: string, message: string, details?: Record<string, any>) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // 分页响应
  paginate<T>(items: T[], page: number, pageSize: number, total: number) {
    return {
      success: true,
      data: items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        timestamp: new Date().toISOString(),
      },
    };
  },
};

// 情感分析工具(简单实现)
export const sentimentUtils = {
  // 简单的情感分析(返回-1到1的分数)
  analyze(text: string): number {
    const positiveWords = ['好', '棒', '优秀', '喜欢', '爱', '开心', '幸福', '成功', '胜利', '美丽', '温暖'];
    const negativeWords = ['坏', '差', '糟糕', '讨厌', '恨', '难过', '痛苦', '失败', '死亡', '丑陋', '寒冷'];
    
    let score = 0;
    let count = 0;
    
    for (const word of positiveWords) {
      const matches = text.match(new RegExp(word, 'g'));
      if (matches) {
        score += matches.length;
        count += matches.length;
      }
    }
    
    for (const word of negativeWords) {
      const matches = text.match(new RegExp(word, 'g'));
      if (matches) {
        score -= matches.length;
        count += matches.length;
      }
    }
    
    if (count === 0) return 0;
    return Math.max(-1, Math.min(1, score / count));
  },

  // 检测情感强度
  intensity(text: string): number {
    // 感叹号、问号、重复标点等表示强烈情感
    const intensityMarks = (text.match(/[!！]{2,}/g) || []).length;
    const questionMarks = (text.match(/[?？]{2,}/g) || []).length;
    const emotionalWords = (text.match(/[非常极其特别真的]+/g) || []).length;
    
    const score = (intensityMarks + questionMarks + emotionalWords) / (text.length / 50);
    return Math.min(1, score);
  },
};

// 导出所有工具
export default {
  jwt: jwtUtils,
  password: passwordUtils,
  time: timeUtils,
  string: stringUtils,
  validation: validationUtils,
  response: responseUtils,
  sentiment: sentimentUtils,
};