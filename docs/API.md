# HeroPath API 文档

后端 API 接口说明

---

## 基础信息

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **认证方式**: 暂无需认证（MVP阶段）

---

## 健康检查

### GET /health

检查服务运行状态

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T05:00:00.000Z"
}
```

---

## 聊天接口

### POST /chat/stream

流式聊天（SSE）

**请求体：**
```json
{
  "message": "我想写个关于重逢的故事",
  "sessionId": "optional-session-id"
}
```

**响应：**
- Content-Type: `text/event-stream`
- 返回 Server-Sent Events 流

```
data: {"chunk": "重逢..."}

data: {"chunk": "这是个"}

data: {"chunk": "很有张力的主题"}

data: {"done": true}
```

### POST /chat

非流式聊天

**请求体：**
```json
{
  "message": "你好"
}
```

**响应：**
```json
{
  "response": "你好！我是王编导，很高兴陪你一起创作。",
  "sessionId": "sess-xxxx"
}
```

### GET /chat/history

获取对话历史

**查询参数：**
- `sessionId`: 会话ID

**响应：**
```json
{
  "messages": [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！我是王编导..."}
  ]
}
```

---

## 章节管理

### POST /chapters

创建章节

**请求体：**
```json
{
  "title": "第一章：雨夜的告白",
  "content": "窗外的雨越下越大...",
  "novelId": "novel-xxxx"
}
```

**响应：**
```json
{
  "id": "chap-xxxx",
  "title": "第一章：雨夜的告白",
  "content": "窗外的雨越下越大...",
  "status": "DRAFT",
  "createdAt": "2026-03-16T05:00:00.000Z"
}
```

### GET /chapters/:id

获取章节详情

**响应：**
```json
{
  "id": "chap-xxxx",
  "title": "第一章：雨夜的告白",
  "content": "...",
  "heartbeats": [
    {
      "id": "hb-xxxx",
      "type": "emotion",
      "position": 156,
      "note": "这里的情感转折很精彩"
    }
  ]
}
```

### GET /novels/:id/chapters

获取小说的所有章节

**响应：**
```json
{
  "chapters": [
    {"id": "chap-1", "title": "第一章", "order": 1},
    {"id": "chap-2", "title": "第二章", "order": 2}
  ]
}
```

### PUT /chapters/:id

更新章节

**请求体：**
```json
{
  "title": "新标题",
  "content": "更新后的内容..."
}
```

### DELETE /chapters/:id

删除章节

**响应：**
```json
{
  "success": true
}
```

---

## 心跳标记

### POST /heartbeats

创建心跳标记

**请求体：**
```json
{
  "chapterId": "chap-xxxx",
  "type": "emotion",
  "position": 156,
  "note": "这里的情感转折很精彩"
}
```

**心跳类型：**
- `flow` - 心流时刻
- `emotion` - 情感共鸣
- `golden` - 金句
- `twist` - 剧情转折
- `user` - 用户标记

**响应：**
```json
{
  "id": "hb-xxxx",
  "type": "emotion",
  "position": 156,
  "note": "这里的情感转折很精彩",
  "createdAt": "2026-03-16T05:00:00.000Z"
}
```

### GET /chapters/:id/heartbeats

获取章节的所有心跳标记

**响应：**
```json
{
  "heartbeats": [
    {
      "id": "hb-1",
      "type": "emotion",
      "position": 156,
      "note": "情感转折",
      "createdAt": "2026-03-16T05:00:00.000Z"
    },
    {
      "id": "hb-2",
      "type": "golden",
      "position": 234,
      "note": "金句",
      "createdAt": "2026-03-16T05:01:00.000Z"
    }
  ]
}
```

### DELETE /heartbeats/:id

删除心跳标记

**响应：**
```json
{
  "success": true
}
```

---

## 错误处理

所有错误响应格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 常见错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 404 | NOT_FOUND | 资源不存在 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |
| 503 | AI_SERVICE_ERROR | AI服务调用失败 |

---

## 前端调用示例

```typescript
// 流式聊天
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '你好' })
});

const reader = response.body?.getReader();
while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = new TextDecoder().decode(value);
  // 处理 SSE 数据
}

// 创建心跳标记
const heartbeat = await fetch('/api/heartbeats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapterId: 'chap-xxx',
    type: 'emotion',
    position: 156
  })
}).then(r => r.json());
```
