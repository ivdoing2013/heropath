# HeroPath 部署指南

> **版本**: v1.0  
> **日期**: 2026-03-16  
> **适用版本**: v0.2.0

---

## 一、部署架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HeroPath 部署架构                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐                  │
│   │    GitHub Pages     │         │      Vercel         │                  │
│   │    (前端静态托管)    │◄───────►│    (后端API托管)     │                  │
│   │                     │   API   │                     │                  │
│   │  ┌───────────────┐  │ 请求    │  ┌───────────────┐  │                  │
│   │  │  React App    │  │────────►│  │ Express API   │  │                  │
│   │  │  - EmptyState │  │  CORS   │  │  - Chat API   │  │                  │
│   │  │  - Chatting   │  │ 配置    │  │  - Chapter    │  │                  │
│   │  │  - Creating   │  │         │  │  - Heartbeat  │  │                  │
│   │  └───────────────┘  │         │  └───────┬───────┘  │                  │
│   └─────────────────────┘         └────────┼───────────┘                  │
│                                             │                               │
│                                             ▼                               │
│                                ┌─────────────────────┐                     │
│                                │    DeepSeek API     │                     │
│                                │   (AI聊天服务)       │                     │
│                                └─────────────────────┘                     │
│                                             │                               │
│                                             ▼                               │
│                                ┌─────────────────────┐                     │
│                                │    PostgreSQL       │                     │
│                                │   (数据持久化)       │                     │
│                                │  - 章节数据         │                     │
│                                │  - 心跳标记         │                     │
│                                └─────────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、环境要求

### 2.1 开发环境

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18.0.0 | 运行时 |
| pnpm | >= 8.0.0 | 包管理 |
| PostgreSQL | >= 14 | 数据库 |
| Git | >= 2.30 | 版本控制 |

### 2.2 生产环境

- **前端托管**: GitHub Pages (免费)
- **后端托管**: Vercel (免费额度)
- **数据库**: Vercel Postgres / Supabase / Railway
- **AI服务**: DeepSeek API

---

## 三、前端部署 (GitHub Pages)

### 3.1 准备工作

```bash
# 1. 确保项目已推送到GitHub
git remote -v
# 输出应显示GitHub仓库地址

# 2. 安装依赖
cd heropath/frontend
pnpm install

# 3. 本地构建测试
pnpm build
# 确保无错误，dist/目录生成
```

### 3.2 配置 vite.config.ts

```typescript
// heropath/frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/heropath/',  // GitHub Pages仓库名
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 3.3 配置 GitHub Actions

创建 `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'heropath/frontend/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: |
          cd heropath/frontend
          pnpm install

      - name: Build
        run: |
          cd heropath/frontend
          pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './heropath/frontend/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3.4 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码触发自动部署

### 3.5 验证部署

```bash
# 访问地址（替换为你的用户名和仓库名）
https://yourusername.github.io/heropath/
```

---

## 四、后端部署 (Vercel)

### 4.1 准备工作

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 进入后端目录
cd heropath/backend
```

### 4.2 配置 vercel.json

```json
{
  "version": 2,
  "name": "heropath-api",
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4.3 配置 package.json

```json
{
  "name": "heropath-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "vercel-build": "echo 'Build completed'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### 4.4 环境变量配置

创建 `.env.local`:

```bash
# 服务器配置
PORT=3001
NODE_ENV=development

# 前端URL（生产环境替换为GitHub Pages地址）
FRONTEND_URL=http://localhost:5173

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 数据库（开发环境）
DATABASE_URL=postgresql://user:password@localhost:5432/heropath

# 数据库（Vercel Postgres - 生产环境）
POSTGRES_PRISMA_URL=your_vercel_postgres_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
```

### 4.5 部署命令

```bash
# 开发部署（预览环境）
vercel

# 生产部署
vercel --prod
```

### 4.6 Vercel Dashboard 配置

1. 导入项目到 Vercel Dashboard
2. 设置环境变量（Settings → Environment Variables）:
   - `DEEPSEEK_API_KEY`
   - `DATABASE_URL`
   - `FRONTEND_URL`
3. 部署完成后获取域名

---

## 五、数据库配置

### 5.1 开发环境 (本地 PostgreSQL)

```bash
# 1. 安装 PostgreSQL
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt-get install postgresql-14
sudo service postgresql start

# 2. 创建数据库
createdb heropath

# 3. 运行迁移
cd heropath/backend
npx prisma migrate dev

# 4. 生成 Prisma Client
npx prisma generate
```

### 5.2 生产环境 (Vercel Postgres)

```bash
# 1. 在 Vercel Dashboard 创建 Postgres 数据库
# Storage → Create Database → PostgreSQL

# 2. 连接字符串会自动添加到环境变量
# POSTGRES_PRISMA_URL
# POSTGRES_URL_NON_POOLING

# 3. 更新 schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

# 4. 部署迁移
vercel --prod
# 然后在 Vercel Dashboard 运行迁移或使用 prisma migrate deploy
```

### 5.3 数据库迁移

```bash
# 创建迁移
cd heropath/backend
npx prisma migrate dev --name init

# 部署迁移（生产环境）
npx prisma migrate deploy

# 查看数据库
npx prisma studio
```

---

## 六、环境变量说明

### 6.1 前端环境变量

创建 `heropath/frontend/.env`:

```bash
# API 基础地址（开发环境）
VITE_API_BASE_URL=http://localhost:3001/api

# API 基础地址（生产环境 - 部署后更新）
# VITE_API_BASE_URL=https://heropath-api.vercel.app/api
```

### 6.2 后端环境变量

创建 `heropath/backend/.env`:

```bash
# ============================================
# 服务器配置
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# CORS 配置
# ============================================
# 开发环境 - 允许本地前端
FRONTEND_URL=http://localhost:5173

# 生产环境 - GitHub Pages 地址（部署后更新）
# FRONTEND_URL=https://yourusername.github.io

# ============================================
# DeepSeek API 配置
# ============================================
# 从 https://platform.deepseek.com 获取
DEEPSEEK_API_KEY=sk-your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# ============================================
# 数据库配置（开发环境）
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/heropath

# ============================================
# 数据库配置（Vercel Postgres - 生产环境）
# ============================================
# 这些变量由 Vercel 自动提供
# POSTGRES_PRISMA_URL=
# POSTGRES_URL_NON_POOLING=
```

### 6.3 环境变量优先级

```
生产环境: Vercel Dashboard > .env.production > .env
开发环境: .env.development > .env.local > .env
```

---

## 七、完整部署流程

### 7.1 首次部署检查清单

```bash
# Step 1: 确认代码已提交
git status
# 确保所有文件已提交

# Step 2: 前端部署
cd heropath/frontend
pnpm install
pnpm build
# 确认无错误

# Step 3: 后端部署
cd ../backend
pnpm install
# 配置 .env 文件
vercel --prod

# Step 4: 配置环境变量
# - Vercel Dashboard: 添加 DEEPSEEK_API_KEY
# - Vercel Dashboard: 配置 PostgreSQL

# Step 5: 数据库迁移
cd backend
npx prisma migrate deploy

# Step 6: 验证部署
curl https://your-api.vercel.app/health
# 应返回: {"status":"ok"}

# Step 7: 更新前端 API 地址
# 修改 frontend/.env.production
VITE_API_BASE_URL=https://your-api.vercel.app/api

# Step 8: 部署前端
# 推送代码触发 GitHub Actions 自动部署
```

### 7.2 部署验证

```bash
# 1. 健康检查
curl https://your-api.vercel.app/health

# 2. API 测试
curl -X POST https://your-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'

# 3. 前端访问
open https://yourusername.github.io/heropath/
```

---

## 八、故障排查

### 8.1 前端问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 白屏 | 资源路径错误 | 检查 vite.config.ts base 配置 |
| API 请求失败 | CORS 问题 | 检查后端 CORS 配置和 FRONTEND_URL |
| 404 刷新 | SPA 路由 | 配置 _redirects 或 404.html |

### 8.2 后端问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 502 错误 | 构建失败 | 检查 vercel.json 和构建日志 |
| 数据库连接失败 | 连接字符串错误 | 检查 DATABASE_URL 格式 |
| API 超时 | DeepSeek 响应慢 | 检查 API Key 和网络 |

### 8.3 数据库问题

```bash
# 重置数据库（开发环境）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status

# 强制同步（谨慎使用）
npx prisma db push
```

---

## 九、更新部署

### 9.1 前端更新

```bash
# 修改代码后提交，自动触发 GitHub Actions 部署
git add .
git commit -m "feat: 更新UI"
git push origin main

# 查看部署状态
# GitHub → Actions → 查看最新工作流
```

### 9.2 后端更新

```bash
cd heropath/backend

# 开发环境测试
pnpm dev

# 生产部署
vercel --prod

# 查看日志
vercel logs --production
```

---

## 十、回滚操作

### 10.1 前端回滚

```bash
# GitHub Pages 回滚到上一版本
git revert HEAD
git push origin main

# 或回滚到指定版本
git log --oneline
git revert <commit-hash>
git push origin main
```

### 10.2 后端回滚

```bash
# Vercel 回滚
# 1. 进入 Vercel Dashboard
# 2. Deployments → 选择上一版本
# 3. 点击 "Promote to Production"

# 或使用 CLI
vercel rollback
```

---

## 十一、性能优化

### 11.1 前端优化

```typescript
// vite.config.ts 优化配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

### 11.2 后端优化

```typescript
// 启用 gzip 压缩
import compression from 'compression'
app.use(compression())

// 添加缓存头
app.use('/static', express.static('public', {
  maxAge: '1d',
}))
```

---

## 十二、监控与日志

### 12.1 Vercel 日志

```bash
# 查看实时日志
vercel logs --production

# 查看特定时间日志
vercel logs --since 1h
```

### 12.2 健康检查端点

```bash
# 添加到后端 src/index.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  })
})
```

---

## 十三、参考链接

- [GitHub Pages 文档](https://docs.github.com/pages)
- [Vercel 文档](https://vercel.com/docs)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

---

*部署遇到问题？请联系项目团队或提交 Issue*
