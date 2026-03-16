// 工具函数集合

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 格式化日期
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 截断文本
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 计算字数
 */
export const countWords = (text: string): number => {
  // 中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  // 数字
  const numbers = (text.match(/\d+/g) || []).length;
  
  return chineseChars + englishWords + numbers;
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = <T = any>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * 生成随机ID
 */
export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
