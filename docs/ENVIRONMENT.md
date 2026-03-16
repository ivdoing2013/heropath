# 环境变量配置指南

本文档说明 HeroPath 项目所需的环境变量配置。

---

## 前端环境变量

在 `frontend/` 目录下创建 `.env` 文件：

```bash
# API 基础地址
# 开发环境
VITE_API_BASE_URL=http://localhost:3001/api

# 生产环境（部署后更新）
# VITE_API_BASE_URL=https://your-api.vercel.app/api
```

**注意**: 前端环境变量必须以 `VITE_` 开头才能在代码中访问。

---

## 后端环境变量

在 `backend/` 目录下创建 `.env` 文件：

```bash
# ============================================
# 基础配置
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# 数据库配置
# ============================================
# 本地 PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/heropath

# Vercel Postgres（生产环境）
# POSTGRES_PRISMA_URL=your_vercel_postgres_url
# POSTGRES_URL_NON_POOLING=your_non_pooling_url

# ============================================
# AI 服务配置
# ============================================
# 从 https://platform.deepseek.com 获取 API Key
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# ============================================
# CORS 配置
# ============================================
# 开发环境
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# 生产环境（部署后更新）
# CORS_ORIGIN=https://yourusername.github.io

# ============================================
# 日志配置
# ============================================
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## 变量说明

### 后端变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `PORT` | 是 | 服务器端口 | `3001` |
| `NODE_ENV` | 是 | 环境模式 | `development` / `production` |
| `DATABASE_URL` | 是 | PostgreSQL连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API密钥 | `sk-xxxxxxxx` |
| `DEEPSEEK_BASE_URL` | 否 | DeepSeek API地址 | `https://api.deepseek.com` |
| `CORS_ORIGIN` | 是 | 允许的跨域来源 | `http://localhost:5173` |
| `LOG_LEVEL` | 否 | 日志级别 | `debug` |

### 前端变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `VITE_API_BASE_URL` | 是 | API基础地址 | `http://localhost:3001/api` |

---

## 获取 DeepSeek API Key

1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key
5. 复制并保存到 `.env` 文件

**安全提示**: 
- 永远不要将 API Key 提交到 Git
- 生产环境使用环境变量或密钥管理服务
- 定期轮换 API Key

---

## 验证配置

### 后端验证

```bash
cd backend
pnpm dev

# 访问健康检查端点
curl http://localhost:3001/health
# 预期输出: {"status":"ok"}
```

### 前端验证

```bash
cd frontend
pnpm dev

# 打开浏览器控制台，检查环境变量
console.log(import.meta.env.VITE_API_BASE_URL)
```

---

## 常见问题

### Q: 前端无法读取环境变量？
A: 确保变量名以 `VITE_` 开头，并且重启开发服务器。

### Q: 数据库连接失败？
A: 检查 PostgreSQL 是否运行，以及连接字符串格式是否正确。

### Q: DeepSeek API 返回 401？
A: 检查 API Key 是否正确，以及是否已充值账户。

### Q: CORS 错误？
A: 确保 `CORS_ORIGIN` 包含前端实际运行的地址。
