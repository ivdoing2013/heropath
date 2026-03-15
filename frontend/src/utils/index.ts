import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  
  // 默认返回日期
  return date.toLocaleDateString('zh-CN');
}

/**
 * 格式化时长
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

/**
 * 格式化字数
 */
export function formatWordCount(count: number): string {
  if (count < 1000) {
    return `${count}字`;
  }
  return `${(count / 1000).toFixed(1)}k字`;
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * 计算阅读时间（分钟）
 */
export function calculateReadingTime(wordCount: number): number {
  // 假设平均阅读速度为300字/分钟
  return Math.ceil(wordCount / 300);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}

/**
 * 获取阶段颜色
 */
export function getStageColor(stageNumber: number): string {
  const colors = [
    '#4A90A4', // 1 - 蓝绿
    '#5BA8A0', // 2
    '#6BB88C', // 3
    '#8BC34A', // 4
    '#CDDC39', // 5
    '#FFEB3B', // 6
    '#FFC107', // 7
    '#FF9800', // 8
    '#FF5722', // 9
    '#E91E63', // 10
    '#9C27B0', // 11
    '#673AB7', // 12 - 紫色
  ];
  return colors[stageNumber - 1] || colors[0];
}

/**
 * 获取进度阶段名称
 */
export function getProgressStage(progress: number): { name: string; icon: string } {
  if (progress < 8) {
    return { name: '启程', icon: '🕯️' };
  } else if (progress < 42) {
    return { name: '启蒙', icon: '🔥' };
  } else if (progress < 83) {
    return { name: '回归', icon: '🔥🔥' };
  } else {
    return { name: '完成', icon: '🎉' };
  }
}
