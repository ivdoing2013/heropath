# HeroPath

> **你的创作伙伴，手持火把，陪你穿越黑暗森林**

HeroPath 是一个基于「英雄之旅」故事结构模型的AI辅助创作平台，为中文创作者提供深度陪伴式写作体验。无论你是写抒情散文、言情小说还是英雄冒险故事，王编导都会手持火把，陪你穿越创作的黑暗森林。

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)

---

## ✨ 核心特性

### 🎭 三种创作者类型
- **抒情散文** (🌙) - 捕捉生命中那些细微的感动
- **男欢女爱** (💕) - 探索情感深处最柔软的角落
- **英雄之旅** (⚔️) - 创造改变世界的传奇

### 🔥 王编导AI陪伴
- 深度对话引导，而非简单问答
- 实时创作陪伴，感知你的写作节奏
- 情感共鸣与专业指导并重

### 💗 心跳时刻系统
- 自动检测创作高光时刻
- 一键标记珍贵灵感（快捷键：Ctrl+H）
- 完整的创作旅程回顾

### 📜 版本控制
- 自动保存 + 心跳标记
- 可视化版本历史
- 支持分支创作

### 📊 故事脉络可视化
- 12阶段英雄之旅结构
- 实时进度追踪
- 阶段性成果展示

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/heropath/heropath.git
cd heropath

# 2. 安装前端依赖
cd frontend
pnpm install

# 3. 安装后端依赖
cd ../backend
pnpm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和DeepSeek API密钥

# 5. 初始化数据库
npx prisma migrate dev
npx prisma generate

# 6. 启动开发服务器
# 终端1：启动后端
cd backend
pnpm dev

# 终端2：启动前端
cd frontend
pnpm dev
```

访问 http://localhost:5173 开始创作！

---

## 📁 项目结构

```
heropath/
├── frontend/              # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── components/    # React组件
│   │   │   ├── EmptyState.tsx      # 空状态界面
│   │   │   ├── ChattingState.tsx   # 对话状态
│   │   │   └── CreatingState.tsx   # 创作状态
│   │   ├── stores/        # Zustand状态管理
│   │   │   ├── appStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── storyStore.ts
│   │   └── utils/         # 工具函数
│   ├── dist/              # 构建输出
│   └── package.json
│
├── backend/               # 后端API (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   └── middleware/    # 中间件
│   └── package.json
│
├── tests/                 # 测试用例
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # E2E测试
│
├── docs/                  # 项目文档
├── PROJECT_SUMMARY.md     # 项目总结
├── PROGRESS.md            # 进度追踪
└── DEPLOYMENT.md          # 部署指南
```

---

## 🛠️ 技术栈

### 前端
| 技术 | 用途 |
|------|------|
| React 18 | UI框架 |
| TypeScript | 类型安全 |
| Vite 5 | 构建工具 |
| Zustand | 状态管理 |
| Tailwind CSS | 样式方案 |
| Framer Motion | 动画效果 |

### 后端
| 技术 | 用途 |
|------|------|
| Express | Web框架 |
| TypeScript | 类型安全 |
| PostgreSQL | 数据库 |
| Prisma | ORM |
| DeepSeek API | AI服务 |

---

## 📝 开发指南

### 常用命令

```bash
# 前端开发
cd frontend
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm test         # 运行测试

# 后端开发
cd backend
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm test         # 运行测试

# 数据库操作
cd backend
npx prisma migrate dev    # 创建迁移
npx prisma migrate deploy # 部署迁移
npx prisma studio         # 打开数据库管理界面
```

---

## 🎯 产品路线图

### v0.2.0 (当前)
- [x] 对话式UI重构
- [x] 四大界面状态
- [x] 心跳标记系统
- [x] DeepSeek流式聊天

### v0.3.0 (开发中)
- [ ] 完整12阶段引导
- [ ] 黄金三章生成
- [ ] 故事地图可视化
- [ ] 版本控制功能

### v1.0.0 (规划中)
- [ ] 62个Skill完整实现
- [ ] 移动端适配
- [ ] 推送服务
- [ ] 协作功能

---

## 📚 文档

- [项目总结](./PROJECT_SUMMARY.md) - 项目概述、技术架构、功能清单
- [进度追踪](./PROGRESS.md) - 开发进度、待办事项、已知问题
- [部署指南](./DEPLOYMENT.md) - 前端/后端部署、数据库配置
- [UI重构设计](./../heropath_ui_redesign_conversational_design.md) - 对话式创作体验设计
- [测试策略](./tests/TEST_STRATEGY.md) - 测试计划与用例

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证

---

## 🙏 致谢

- 灵感来源于约瑟夫·坎贝尔的《千面英雄》
- 感谢所有早期测试创作者的反馈
- 特别感谢开源社区的支持

---

## 📮 联系我们

- 问题反馈: https://github.com/heropath/heropath/issues
- 邮件联系: hello@heropath.app

---

**点燃火把，开始你的英雄之旅吧！** 🔥
