# HeroPath Backend

HeroPath小说创作平台后端服务

## 技术栈

- **框架**: Express + TypeScript
- **数据库**: PostgreSQL
- **AI**: DeepSeek API
- **验证**: Zod

## 目录结构

```
src/
├── config/        # 配置文件
├── controllers/   # 控制器
├── middleware/    # 中间件
├── models/        # 数据模型
├── routes/        # 路由
├── services/      # 业务逻辑
├── utils/         # 工具函数
└── server.ts      # 入口文件
```

## 环境变量

复制 `.env.example` 到 `.env` 并配置:

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# DeepSeek API
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/heropath
```

## 启动

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## API文档

### 健康检查
```
GET /health
```

### 聊天接口
```
POST /api/chat/stream    # 流式聊天 (SSE)
POST /api/chat           # 非流式聊天
GET  /api/chat/history   # 获取对话历史
```

### 章节管理
```
POST   /api/chapters           # 创建章节
GET    /api/chapters/:id       # 获取章节详情
GET    /api/novels/:id/chapters # 获取小说章节列表
PUT    /api/chapters/:id       # 更新章节
DELETE /api/chapters/:id       # 删除章节
```

### 心跳标记
```
POST   /api/heartbeats         # 创建心跳标记
GET    /api/chapters/:id/heartbeats # 获取章节心跳标记
DELETE /api/heartbeats/:id     # 删除心跳标记
```

## 心跳标记类型

- `flow`: 心流时刻
- `emotion`: 情感共鸣
- `golden`: 金句
- `twist`: 剧情转折
- `user`: 用户标记
