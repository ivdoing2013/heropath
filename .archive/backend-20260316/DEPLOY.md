# HeroPath 后端部署指南

## 项目结构

```
backend/
├── api/
│   ├── index.js      # 健康检查 / 首页
│   └── chat.js       # 王编导 AI 对话接口
├── package.json
├── next.config.js
├── vercel.json       # Vercel 配置
├── .env.example
└── deploy.sh         # 部署脚本
```

## 快速部署

### 1. 进入后端目录

```bash
cd heropath/backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 登录 Vercel

```bash
npx vercel login
```

### 4. 部署

```bash
# 使用部署脚本
./deploy.sh

# 或手动部署
npx vercel --prod
```

### 5. 设置环境变量

在 Vercel 控制台或命令行设置：

```bash
npx vercel env add DEEPSEEK_API_KEY
# 输入: sk-2dcd2ddc13484a6ba44ca4028473af78
```

## API 接口

### POST /api/chat

**请求体：**
```json
{
  "messages": [
    {"role": "user", "content": "你好，王编导"}
  ],
  "stream": true
}
```

**响应（流式）：**
```
data: {"choices":[{"delta":{"content":"你"}}]}
data: {"choices":[{"delta":{"content":"好"}}]}
...
```

**响应（非流式）：**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "你好！我是王编导..."
    }
  }]
}
```

## CORS 配置

后端已配置允许以下来源：
- `https://yoiwang.github.io` (GitHub Pages)
- `http://localhost:3000` (本地开发)
- `http://localhost:5173` (Vite 默认)
- `*.vercel.app` (Vercel 预览)

如需添加新域名，修改 `api/chat.js` 中的 `ALLOWED_ORIGINS`。

## 前端配置

部署后端后，更新前端环境变量：

```bash
# frontend/.env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

然后重新构建前端：

```bash
cd frontend
npm run build
# 部署 dist 到 GitHub Pages
```

## 本地开发

```bash
# 启动后端（端口 3000）
cd backend
npm run dev

# 启动前端（端口 5173）
cd frontend
npm run dev
```

前端会自动使用 `http://localhost:3000` 作为后端地址。

## 故障排查

### 检查后端是否运行
```bash
curl https://your-backend.vercel.app/
```

### 测试聊天接口
```bash
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'
```

### 查看 Vercel 日志
```bash
npx vercel logs
```
