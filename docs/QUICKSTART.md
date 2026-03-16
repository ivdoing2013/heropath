# 快速开始指南

5分钟上手 HeroPath 开发环境

---

## 环境准备

确保已安装：
- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) >= 8.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14

---

## 1. 克隆项目

```bash
git clone https://github.com/yourusername/heropath.git
cd heropath
```

---

## 2. 安装依赖

### 前端
```bash
cd frontend
pnpm install
```

### 后端
```bash
cd ../backend
pnpm install
```

---

## 3. 配置环境变量

### 后端配置
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

必须配置：
- `DATABASE_URL` - PostgreSQL 连接字符串
- `DEEPSEEK_API_KEY` - 从 https://platform.deepseek.com 获取

### 前端配置
```bash
cd ../frontend
cp .env.example .env
# 编辑 .env 文件（通常默认配置即可）
```

---

## 4. 初始化数据库

```bash
cd backend

# 创建数据库迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

---

## 5. 启动开发服务器

### 方式一：分别启动

**终端1 - 后端：**
```bash
cd backend
pnpm dev
# 服务运行在 http://localhost:3001
```

**终端2 - 前端：**
```bash
cd frontend
pnpm dev
# 服务运行在 http://localhost:5173
```

### 方式二：使用 concurrently（可选）

```bash
# 在项目根目录
pnpm dev
```

---

## 6. 验证安装

1. 打开浏览器访问 http://localhost:5173
2. 应该看到 HeroPath 的星空欢迎界面
3. 尝试与王编导对话测试 AI 连接

---

## 下一步

- [阅读项目架构](./../PROJECT_SUMMARY.md)
- [查看开发进度](./../PROGRESS.md)
- [了解部署流程](./../DEPLOYMENT.md)

---

## 故障排查

### 端口被占用
```bash
# 查找占用 3001 端口的进程
lsof -i :3001
# 结束进程
kill -9 <PID>
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql  # macOS
sudo service postgresql status         # Linux

# 启动 PostgreSQL
brew services start postgresql@14      # macOS
sudo service postgresql start          # Linux
```

### 依赖安装失败
```bash
# 清理缓存后重试
pnpm store prune
rm -rf node_modules
pnpm install
```
