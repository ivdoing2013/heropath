# HeroPath 后端部署指南

## 项目结构

```
backend-vercel/
├── api/
│   ├── index.js      # 健康检查 / 首页
│   └── chat.js       # 王编导 AI 对话接口
├── package.json
└── vercel.json       # Vercel 配置
```

## 部署步骤

### 方法 1：使用 Vercel CLI（推荐）

```bash
# 1. 进入后端目录
cd heropath/backend-vercel

# 2. 安装 Vercel CLI（如未安装）
npm i -g vercel

# 3. 登录 Vercel
vercel login

# 4. 部署
vercel --prod

# 5. 设置环境变量（或在 Vercel 控制台设置）
vercel env add DEEPSEEK_API_KEY
# 输入: sk-2dcd2ddc13484a6ba44ca4028473af78
```

### 方法 2：使用 Vercel Web 界面

1. 将 `backend-vercel` 目录推送到 GitHub
2. 访问 https://vercel.com/new
3. 导入 GitHub 仓库
4. 配置环境变量 `DEEPSEEK_API_KEY`
5. 点击 Deploy

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

**响应：**
- 流式：SSE 格式
- 非流式：JSON

## 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |

## 前端配置

部署后端后，更新前端 `.env` 文件：

```bash
# frontend/.env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

然后重新构建并部署前端到 GitHub Pages。

## 测试

```bash
# 测试首页
curl https://your-backend.vercel.app/

# 测试聊天接口
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'
```

## CORS

后端已配置允许所有来源访问。如需限制特定域名，修改 `vercel.json` 中的 headers 配置。
