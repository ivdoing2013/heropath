/**
 * 数据库表结构定义
 * 运行初始化脚本创建表结构
 */

export const CREATE_TABLES_SQL = `
-- 小说表
CREATE TABLE IF NOT EXISTS novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  genre VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ongoing', -- ongoing, completed, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  order_index INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 心跳标记表（关键情节、情感波动等）
CREATE TABLE IF NOT EXISTS heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 在章节中的字符位置
  type VARCHAR(50) NOT NULL, -- flow, emotion, golden, twist, user
  content TEXT NOT NULL, -- 标记的内容片段
  note TEXT, -- 备注/笔记
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话历史表
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  novel_id UUID REFERENCES novels(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  model VARCHAR(100), -- 使用的AI模型
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(novel_id, order_index);
CREATE INDEX IF NOT EXISTS idx_heartbeats_chapter_id ON heartbeats(chapter_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_type ON heartbeats(type);
CREATE INDEX IF NOT EXISTS idx_conversations_chapter ON conversations(chapter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为novels表添加触发器
DROP TRIGGER IF EXISTS update_novels_updated_at ON novels;
CREATE TRIGGER update_novels_updated_at
  BEFORE UPDATE ON novels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为chapters表添加触发器
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

// 表名枚举
export enum TableNames {
  NOVELS = 'novels',
  CHAPTERS = 'chapters',
  HEARTBEATS = 'heartbeats',
  CONVERSATIONS = 'conversations',
}

// 心跳标记类型
export enum HeartbeatType {
  FLOW = 'flow',       // 情节流畅
  EMOTION = 'emotion', // 情感波动
  GOLDEN = 'golden',   // 金句
  TWIST = 'twist',     // 反转
  USER = 'user',       // 用户标记
}
