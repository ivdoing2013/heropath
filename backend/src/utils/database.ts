import { Pool, PoolClient, QueryResult } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// 数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 数据库连接事件监听
pool.on('connect', () => {
  console.log('[DB] 数据库连接已建立');
});

pool.on('error', (err) => {
  console.error('[DB] 数据库连接错误:', err);
});

// 数据库操作封装
export const db = {
  // 执行查询
  query: async <T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> => {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  },

  // 事务执行
  transaction: async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // 生成UUID
  generateId: (): string => uuidv4(),

  // 获取当前时间戳
  now: (): Date => new Date(),
};

export { pool };
export default db;
