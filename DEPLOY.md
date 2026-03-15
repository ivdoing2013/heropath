# HeroPath 后端部署说明

## 📋 已完成工作

### 1. 后端 API 服务
已创建 `backend-vercel/` 目录，包含：
- `api/index.js` - 健康检查接口
- `api/chat.js` - 王编导 AI 对话接口（支持流式输出）
- `vercel.json` - Vercel 部署配置（含 CORS 设置）

### 2. 前端更新
已更新 `frontend/src/utils/aiService.ts`：
- 移除直接调用 DeepSeek API（避免暴露 API Key）
- 改为调用后端 API
- 支持流式输出
- 添加后端健康检查

### 3. 环境配置
已创建前端环境变量文件：
- `frontend/.env` - 生产环境配置
- `frontend/.env.example` - 开发环境示例

## 🚀 部署步骤

### 步骤 1：部署后端到 Vercel

```bash
cd heropath/backend-vercel

# 使用 Vercel CLI 部署
npx vercel login
npx vercel --prod

# 设置环境变量
npx vercel env add DEEPSEEK_API_KEY
# 输入: sk-2dcd2ddc13484a6ba44ca4028473af78
```

部署成功后会得到一个 URL，例如：
```
https://heropath-backend-xxxxx.vercel.app
```

### 步骤 2：更新前端环境变量

编辑 `heropath/frontend/.env`：

```bash
VITE_DEEPSEEK_API_KEY=sk-2dcd2ddc13484a6ba44ca4028473af78
VITE_API_BASE_URL=https://heropath-backend-xxxxx.vercel.app
```

### 步骤 3：重新构建前端

```bash
cd heropath/frontend
npm install
npm run build
```

### 步骤 4：部署到 GitHub Pages

将 `dist/` 目录内容推送到 GitHub Pages。

## 🔧 API 接口详情

### POST /api/chat

**请求体：**
```json
{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "stream": true
}
```

**响应：**
- 流式：SSE 格式
- 非流式：DeepSeek API 标准响应格式

**CORS：**
- 允许所有来源访问（已配置）
- 支持 GitHub Pages 和本地开发环境

## ✅ 验证部署

1. **检查后端：**
   ```bash
   curl https://your-backend.vercel.app/
   ```
   应该返回服务信息。

2. **测试聊天接口：**
   ```bash
   curl -X POST https://your-backend.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'
   ```

3. **前端测试：**
   打开 GitHub Pages 链接，与王编导对话。

## 📁 项目文件

```
heropath/
├── backend-vercel/           # Vercel 后端
│   ├── api/
│   │   ├── index.js         # 健康检查
│   │   └── chat.js          # AI 对话接口
│   ├── package.json
│   ├── vercel.json          # Vercel 配置
│   └── README.md
│
├── frontend/                 # 前端（已更新）
│   ├── src/
│   │   └── utils/
│   │       └── aiService.ts # 更新后的 AI 服务
│   ├── .env                 # 环境变量
│   └── .env.example
│
└── DEPLOY.md                # 本文件
```

## 🔑 安全说明

- API Key 仅存储在 Vercel 环境变量中，不会暴露给前端
- 前端通过后端代理调用 DeepSeek API
- CORS 已配置允许 GitHub Pages 和本地开发环境

## 🐛 故障排查

| 问题 | 解决方案 |
|------|----------|
| CORS 错误 | 检查 vercel.json 中的 headers 配置 |
| API Key 无效 | 在 Vercel 控制台确认环境变量已设置 |
| 流式输出不工作 | 检查前端是否正确处理 SSE 格式 |
| 前端无法连接后端 | 确认 VITE_API_BASE_URL 配置正确 |

## 📞 联系

如有问题，请检查 Vercel 日志：
```bash
npx vercel logs
```
