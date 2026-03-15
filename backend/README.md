# HeroPath Backend API

王编导 AI 编剧导师的后端 API 服务

## API 接口

### POST /api/chat

接收用户消息，转发到 DeepSeek API

**请求体：**
```json
{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "stream": false
}
```

**响应：**
- 非流式：直接返回 JSON
- 流式：SSE 格式输出

## 环境变量

- `DEEPSEEK_API_KEY` - DeepSeek API 密钥

## 部署

```bash
npm install
vercel --prod
```
