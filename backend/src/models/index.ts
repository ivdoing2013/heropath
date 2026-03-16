import { db } from '../utils/database';
import { TableNames, HeartbeatType } from './schema';

// 小说模型
export interface Novel {
  id: string;
  title: string;
  author?: string;
  description?: string;
  genre?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNovelInput {
  title: string;
  author?: string;
  description?: string;
  genre?: string;
}

// 章节模型
export interface Chapter {
  id: string;
  novel_id: string;
  title: string;
  content: string;
  order_index: number;
  word_count: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChapterInput {
  title: string;
  content?: string;
  novelId: string;
  orderIndex?: number;
}

// 心跳标记模型
export interface Heartbeat {
  id: string;
  chapter_id: string;
  position: number;
  type: HeartbeatType;
  content: string;
  note?: string;
  created_at: Date;
}

export interface CreateHeartbeatInput {
  chapterId: string;
  position: number;
  type: HeartbeatType;
  content: string;
  note?: string;
}

// 对话记录模型
export interface Conversation {
  id: string;
  chapter_id?: string;
  novel_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens_used?: number;
  created_at: Date;
}

export interface CreateConversationInput {
  chapterId?: string;
  novelId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokensUsed?: number;
}

// Novel 数据访问对象
export const NovelModel = {
  // 创建小说
  create: async (input: CreateNovelInput): Promise<Novel> => {
    const result = await db.query<Novel>(
      `INSERT INTO ${TableNames.NOVELS} (title, author, description, genre)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.title, input.author, input.description, input.genre]
    );
    return result.rows[0];
  },

  // 获取小说
  findById: async (id: string): Promise<Novel | null> => {
    const result = await db.query<Novel>(
      `SELECT * FROM ${TableNames.NOVELS} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // 获取所有小说
  findAll: async (): Promise<Novel[]> => {
    const result = await db.query<Novel>(
      `SELECT * FROM ${TableNames.NOVELS} ORDER BY updated_at DESC`
    );
    return result.rows;
  },

  // 更新小说
  update: async (id: string, input: Partial<CreateNovelInput>): Promise<Novel | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.author !== undefined) {
      fields.push(`author = $${paramIndex++}`);
      values.push(input.author);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.genre !== undefined) {
      fields.push(`genre = $${paramIndex++}`);
      values.push(input.genre);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query<Novel>(
      `UPDATE ${TableNames.NOVELS} SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // 删除小说
  delete: async (id: string): Promise<boolean> => {
    const result = await db.query(
      `DELETE FROM ${TableNames.NOVELS} WHERE id = $1`,
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },
};

// Chapter 数据访问对象
export const ChapterModel = {
  // 创建章节
  create: async (input: CreateChapterInput): Promise<Chapter> => {
    const content = input.content || '';
    const wordCount = content.length;
    
    // 获取当前最大order_index
    const orderResult = await db.query<{ max_order: number }>(
      `SELECT COALESCE(MAX(order_index), 0) as max_order FROM ${TableNames.CHAPTERS} WHERE novel_id = $1`,
      [input.novelId]
    );
    const orderIndex = input.orderIndex ?? (orderResult.rows[0].max_order + 1);

    const result = await db.query<Chapter>(
      `INSERT INTO ${TableNames.CHAPTERS} (novel_id, title, content, order_index, word_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.novelId, input.title, content, orderIndex, wordCount]
    );
    return result.rows[0];
  },

  // 获取章节
  findById: async (id: string): Promise<Chapter | null> => {
    const result = await db.query<Chapter>(
      `SELECT * FROM ${TableNames.CHAPTERS} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // 获取小说的所有章节
  findByNovelId: async (novelId: string): Promise<Chapter[]> => {
    const result = await db.query<Chapter>(
      `SELECT * FROM ${TableNames.CHAPTERS} WHERE novel_id = $1 ORDER BY order_index ASC`,
      [novelId]
    );
    return result.rows;
  },

  // 更新章节
  update: async (id: string, input: Partial<CreateChapterInput>): Promise<Chapter | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      fields.push(`word_count = $${paramIndex++}`);
      values.push(input.content);
      values.push(input.content.length);
    }
    if (input.orderIndex !== undefined) {
      fields.push(`order_index = $${paramIndex++}`);
      values.push(input.orderIndex);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query<Chapter>(
      `UPDATE ${TableNames.CHAPTERS} SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // 删除章节
  delete: async (id: string): Promise<boolean> => {
    const result = await db.query(
      `DELETE FROM ${TableNames.CHAPTERS} WHERE id = $1`,
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },
};

// Heartbeat 数据访问对象
export const HeartbeatModel = {
  // 创建心跳标记
  create: async (input: CreateHeartbeatInput): Promise<Heartbeat> => {
    const result = await db.query<Heartbeat>(
      `INSERT INTO ${TableNames.HEARTBEATS} (chapter_id, position, type, content, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.chapterId, input.position, input.type, input.content, input.note]
    );
    return result.rows[0];
  },

  // 获取心跳标记
  findById: async (id: string): Promise<Heartbeat | null> => {
    const result = await db.query<Heartbeat>(
      `SELECT * FROM ${TableNames.HEARTBEATS} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // 获取章节的所有心跳标记
  findByChapterId: async (chapterId: string): Promise<Heartbeat[]> => {
    const result = await db.query<Heartbeat>(
      `SELECT * FROM ${TableNames.HEARTBEATS} WHERE chapter_id = $1 ORDER BY position ASC`,
      [chapterId]
    );
    return result.rows;
  },

  // 删除心跳标记
  delete: async (id: string): Promise<boolean> => {
    const result = await db.query(
      `DELETE FROM ${TableNames.HEARTBEATS} WHERE id = $1`,
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  },
};

// Conversation 数据访问对象
export const ConversationModel = {
  // 创建对话记录
  create: async (input: CreateConversationInput): Promise<Conversation> => {
    const result = await db.query<Conversation>(
      `INSERT INTO ${TableNames.CONVERSATIONS} (chapter_id, novel_id, role, content, model, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.chapterId, input.novelId, input.role, input.content, input.model, input.tokensUsed]
    );
    return result.rows[0];
  },

  // 获取章节的对话历史
  findByChapterId: async (chapterId: string, limit: number = 50): Promise<Conversation[]> => {
    const result = await db.query<Conversation>(
      `SELECT * FROM ${TableNames.CONVERSATIONS} 
       WHERE chapter_id = $1 
       ORDER BY created_at ASC 
       LIMIT $2`,
      [chapterId, limit]
    );
    return result.rows;
  },

  // 获取小说的对话历史
  findByNovelId: async (novelId: string, limit: number = 100): Promise<Conversation[]> => {
    const result = await db.query<Conversation>(
      `SELECT * FROM ${TableNames.CONVERSATIONS} 
       WHERE novel_id = $1 
       ORDER BY created_at ASC 
       LIMIT $2`,
      [novelId, limit]
    );
    return result.rows;
  },

  // 获取最近的对话历史（全局）
  findRecent: async (limit: number = 20): Promise<Conversation[]> => {
    const result = await db.query<Conversation>(
      `SELECT * FROM ${TableNames.CONVERSATIONS} 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows.reverse();
  },
};
