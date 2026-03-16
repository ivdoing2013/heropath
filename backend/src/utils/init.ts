import { pool } from './database';
import { CREATE_TABLES_SQL } from '../models/schema';

// 数据库初始化
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('[DB] 正在初始化数据库...');
    
    // 执行建表SQL
    await pool.query(CREATE_TABLES_SQL);
    
    console.log('[DB] 数据库初始化完成');
  } catch (error) {
    console.error('[DB] 数据库初始化失败:', error);
    throw error;
  }
};

// 健康检查
export const healthCheck = async (): Promise<{
  database: boolean;
  timestamp: string;
}> => {
  try {
    await pool.query('SELECT 1');
    return {
      database: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      database: false,
      timestamp: new Date().toISOString(),
    };
  }
};
