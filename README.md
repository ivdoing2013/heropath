# HeroPath

> **你的创作伙伴，手持火把，陪你穿越黑暗森林**

HeroPath 是一个基于「英雄之旅」故事结构模型的AI辅助创作平台，为中文创作者提供深度陪伴式写作体验。无论你是写抒情散文、言情小说还是英雄冒险故事，王编导都会手持火把，陪你穿越创作的黑暗森林。

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)

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
- 一键标记珍贵灵感
- 完整的创作旅程回顾

### 📜 版本控制
- 自动保存 + 心跳标记
- 可视化版本历史
- 支持分支创作

### 📊 故事脉络可视化
- 12阶段英雄之旅结构
- 实时进度追踪
- 阶段性成果展示

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Redis >= 6

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/heropath/heropath.git
cd heropath

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和API密钥

# 4. 初始化数据库
pnpm db:migrate
pnpm db:seed

# 5. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 开始创作！

## 📁 项目结构

```
heropath/
├── apps/
│   ├── web/                    # 前端应用 (React + Vite)
│   ├── api/                    # 后端API (Node.js + Express)
│   └── websocket/              # WebSocket服务
├── packages/
│   ├── shared/                 # 共享类型和工具
│   ├── ui/                     # UI组件库
│   ├── skills/                 # Skill系统核心
│   └── prompts/                # Prompt模板
├── docs/                       # 文档
├── .github/
│   └── workflows/              # CI/CD配置
└── docker-compose.yml          # 开发环境配置
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **状态管理**: Zustand + Immer
- **样式**: Tailwind CSS
- **编辑器**: TipTap (ProseMirror)
- **动画**: Framer Motion

### 后端
- **API**: Node.js + Express
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **实时通信**: Socket.io
- **队列**: BullMQ

### AI/LLM
- **模型**: GPT-4 / Claude 3
- **Prompt管理**: 模板引擎 + 热更新
- **上下文管理**: 分层压缩策略

## 📝 开发指南

详细开发规范请查看 [开发指南](./docs/development-guide.md)

快速参考：

```bash
# 启动所有服务
pnpm dev

# 仅启动前端
pnpm dev:web

# 仅启动后端
pnpm dev:api

# 运行测试
pnpm test

# 构建生产版本
pnpm build

# 代码检查
pnpm lint
pnpm type-check
```

## 🎯 产品路线图

### MVP (v0.1.0) - 当前
- [x] 核心Skill系统
- [x] 基础UI框架
- [x] 王编导对话系统
- [x] 自动保存功能

### v0.2.0
- [ ] 完整12阶段引导
- [ ] 心跳时刻系统
- [ ] 版本控制功能
- [ ] 黄金三章生成

### v0.3.0
- [ ] 三种创作者类型完整支持
- [ ] 故事脉络可视化
- [ ] 金句收集功能
- [ ] 日志回放系统

### v1.0.0
- [ ] 移动端适配
- [ ] 推送服务
- [ ] 协作功能
- [ ] 性能优化

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

请确保：
- 代码符合我们的 [开发规范](./docs/development-guide.md)
- 所有测试通过
- 提交信息清晰规范

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证

## 🙏 致谢

- 灵感来源于约瑟夫·坎贝尔的《千面英雄》
- 感谢所有早期测试创作者的反馈
- 特别感谢开源社区的支持

## 📮 联系我们

- 官方网站: https://heropath.app
- 问题反馈: https://github.com/heropath/heropath/issues
- 邮件联系: hello@heropath.app

---

**点燃火把，开始你的英雄之旅吧！** 🔥
