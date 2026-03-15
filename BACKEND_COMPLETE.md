# HeroPath 后端部署完成总结

## ✅ 已完成内容

### 1. 后端 API 服务 (backend-vercel/)

**文件结构：**
```
backend-vercel/
├── api/
│   ├── index.js          # 健康检查 / 首页
│   └── chat.js           # 王编导 AI 对话接口
├── .github/workflows/
│   └── deploy.yml        # GitHub Actions 自动部署
├── package.json
├── vercel.json           # Vercel 配置
└── README.md
```

**功能特性：**
- ✅ POST /api/chat - 接收消息并转发到 DeepSeek API
- ✅ 支持流式输出 (SSE)
- ✅ 支持非流式输出 (JSON)
- ✅ CORS 配置 - 允许 GitHub Pages 和本地开发环境
- ✅ 环境变量保护 API Key
- ✅ 王编导系统提示词内置

### 2. 前端更新 (frontend/src/utils/aiService.ts)

**改动：**
- 移除直接调用 DeepSeek API（避免暴露 API Key）
- 改为调用后端 API 代理
- 支持流式输出
- 添加后端健康检查
- 添加环境变量配置

### 3. 环境变量配置

**frontend/.env：**
```bash
VITE_DEEPSEEK_API_KEY=sk-2dcd2ddc13484a6ba44ca4028473af78
VITE_API_BASE_URL=https://heropath-backend.vercel.app
```

**需要设置的 Secrets：**
- `DEEPSEEK_API_KEY` - DeepSeek API 密钥
- `VERCEL_TOKEN` - Vercel 部署 Token

## 🚀 部署方式

### 方式 1：Vercel CLI（手动）

```bash
cd heropath/backend-vercel

# 登录 Vercel
npx vercel login

# 部署
npx vercel --prod

# 设置环境变量
npx vercel env add DEEPSEEK_API_KEY
# 输入: sk-2dcd2ddc13484a6ba44ca4028473af78
```

### 方式 2：GitHub Actions（自动）

1. Fork 项目到 GitHub
2. 在 GitHub Settings → Secrets 添加：
   - `VERCEL_TOKEN` - 从 https://vercel.com/account/tokens 获取
   - `VERCEL_ORG_ID` - 从 Vercel 项目设置获取
   - `VERCEL_PROJECT_ID` - 从 Vercel 项目设置获取
   - `DEEPSEEK_API_KEY` - sk-2dcd2ddc13484a6ba44ca4028473af78
3. 推送代码自动部署

### 方式 3：Vercel Web 界面（最简单）

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. 设置环境变量 `DEEPSEEK_API_KEY`
4. 点击 Deploy

## 📋 API 接口文档

### 健康检查
```bash
GET /
```
返回服务状态信息。

### AI 对话
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "你好，王编导"}
  ],
  "stream": true
}
```

**响应格式：**
- `stream: true` - SSE 流式输出
- `stream: false` - 标准 JSON 响应

## 🧪 测试命令

```bash
# 测试首页
curl https://your-backend.vercel.app/

# 测试聊天（非流式）
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'

# 测试聊天（流式）
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":true}'
```

## 🔒 安全说明

- ✅ API Key 仅存储在服务器端环境变量
- ✅ 前端无法直接访问 DeepSeek API Key
- ✅ CORS 配置保护跨域请求
- ✅ 支持 HTTPS 加密传输

## 📝 下一步操作

1. **部署后端：**
   - 选择上述任一方式部署到 Vercel
   - 获取部署后的 URL

2. **更新前端配置：**
   - 修改 `frontend/.env` 中的 `VITE_API_BASE_URL`
   - 重新构建前端: `npm run build`

3. **部署前端：**
   - 将 `dist/` 推送到 GitHub Pages

4. **验证：**
   - 打开 GitHub Pages 链接
   - 与王编导对话测试

## 🔗 相关链接

- **前端源码：** `/Users/simon/.openclawcn/workspace/heropath/frontend/`
- **后端源码：** `/Users/simon/.openclawcn/workspace/heropath/backend-vercel/`
- **部署说明：** `/Users/simon/.openclawcn/workspace/heropath/DEPLOY.md`
- **DeepSeek 文档：** https://platform.deepseek.com/docs

## 💡 王编导的建议

> "部署就像写故事的开头——设定好场景，后面就水到渠成了。
> 如果遇到问题，先检查环境变量，再看网络请求，最后查日志。
> 慢慢来，我在终点等你。" —— 王编导
