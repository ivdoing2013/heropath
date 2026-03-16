# HeroPath 测试报告

## 📊 测试概述

本文档详细描述了 HeroPath 项目的测试架构、测试覆盖率和运行指南。

---

## 🎯 测试目标

| 目标 | 覆盖率要求 | 实际覆盖率 |
|------|-----------|-----------|
| 前端单元测试 | >70% | 待定 |
| 后端单元测试 | >80% | 待定 |
| 集成测试 | 核心流程 | 已覆盖 |

---

## 📁 测试文件结构

### 前端测试 (Vitest)
```
frontend/src/
├── stores/
│   ├── appStore.test.ts          # App状态管理测试
│   └── chatStore.test.ts         # Chat状态管理测试 (已有)
├── components/
│   ├── EmptyState.test.tsx       # 空状态组件测试
│   ├── ChattingState.test.tsx    # 聊天状态组件测试
│   └── CreatingState.test.tsx    # 创作状态组件测试
├── utils/
│   └── aiService.test.ts         # AI服务测试
└── __tests__/
    └── integration.test.tsx      # 集成测试
```

### 后端测试 (Jest)
```
backend/src/
├── __tests__/
│   ├── setup.ts                  # 测试环境配置
│   ├── services/
│   │   ├── chat.test.ts          # ChatService测试
│   │   └── chapter.test.ts       # Chapter/Heartbeat服务测试
│   └── controllers/
│       ├── chat.test.ts          # ChatController测试
│       └── chapter.test.ts       # Chapter/Heartbeat控制器测试
```

---

## 🚀 运行测试

### 前端测试

```bash
# 进入前端目录
cd /Users/simon/.openclawcn/workspace/heropath/frontend

# 安装依赖 (如果尚未安装)
npm install

# 运行所有测试
npm test

# 运行测试并监视文件变化
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 后端测试

```bash
# 进入后端目录
cd /Users/simon/.openclawcn/workspace/heropath/backend

# 安装依赖 (包括测试依赖)
npm install

# 运行所有测试
npm test

# 运行测试并监视文件变化
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI模式运行测试
npm run test:ci
```

### 一键运行所有测试

```bash
# 在项目根目录创建 test-all.sh
#!/bin/bash
echo "🧪 Running HeroPath Tests..."
echo ""

echo "📦 Frontend Tests:"
cd frontend && npm test -- --run && cd ..

echo ""
echo "📦 Backend Tests:"
cd backend && npm test && cd ..

echo ""
echo "✅ All tests completed!"
```

---

## 📋 测试详情

### 1️⃣ 前端单元测试

#### App Store 测试 (`appStore.test.ts`)

| 测试模块 | 测试项数 | 描述 |
|---------|---------|------|
| UI State Management | 9项 | 状态切换、返回、过渡动画 |
| Message Management | 8项 | 消息添加、设置、清除、排序 |
| Input Management | 4项 | 输入设置、清除、长文本 |
| Typing State | 6项 | 打字状态、流式文本、追加 |
| Conversation Context | 7项 | 回合计数、类型检测、建议 |
| Story Elements | 7项 | 元素添加、删除、侧边栏 |
| Starfield Management | 8项 | 星星生成、解锁、亮度 |
| Editor State | 7项 | 内容编辑、光标、保存 |
| Heartbeat Markers | 8项 | 心跳添加、删除、更新 |
| Chapter Management | 6项 | 章节切换、标题、完成 |
| Wang Daoyan State | 7项 | 状态、表情、火把强度 |
| System State | 2项 | 后端可用性 |
| Initialization | 4项 | 初始化、重置 |
| Complex Scenarios | 4项 | 完整流程场景 |

**总计: 87项测试**

#### 组件测试

| 组件 | 测试模块 | 测试项数 |
|------|---------|---------|
| EmptyState | 渲染、交互、提交、动画 | 17项 |
| ChattingState | 渲染、消息、输入、侧边栏 | 18项 |
| CreatingState | 编辑器、章节、心跳、面板 | 19项 |

**组件测试总计: 54项**

#### AI Service 测试

| 测试模块 | 测试项数 |
|---------|---------|
| Backend Health | 4项 |
| Mock Chat | 5项 |
| Non-streaming Chat | 12项 |
| Streaming | 6项 |
| Type Detection | 7项 |
| Edge Cases | 7项 |

**AI Service 测试总计: 41项**

#### 集成测试

| 测试模块 | 测试项数 |
|---------|---------|
| Complete User Flow | 2项 |
| State Transitions | 5项 |
| Message Flow | 3项 |
| Heartbeat Complete Flow | 4项 |
| Chapter Management Flow | 4项 |
| Story Elements Integration | 5项 |
| Editor State Integration | 5项 |
| Starfield Animation | 3项 |
| API Integration | 3项 |
| Complex Scenarios | 3项 |

**集成测试总计: 37项**

### 2️⃣ 后端单元测试

#### ChatService 测试

| 测试模块 | 测试项数 | 描述 |
|---------|---------|------|
| streamChat | 7项 | 流式响应、历史、错误处理 |
| chat | 6项 | 非流式聊天、令牌、错误 |
| saveConversation | 2项 | 保存、失败处理 |
| getHistory | 5项 | 多种查询条件 |

**ChatService 测试总计: 20项**

#### ChapterService / HeartbeatService 测试

| 测试模块 | 测试项数 |
|---------|---------|
| createChapter | 3项 |
| getChapterWithHeartbeats | 4项 |
| getChaptersByNovel | 3项 |
| updateChapter | 5项 |
| deleteChapter | 3项 |
| createHeartbeat | 6项 |
| getHeartbeatsByChapter | 3项 |
| deleteHeartbeat | 2项 |

**Chapter/Heartbeat Service 测试总计: 29项**

#### ChatController 测试

| 测试模块 | 测试项数 |
|---------|---------|
| streamChat (SSE) | 10项 |
| chat (non-streaming) | 6项 |
| getHistory | 5项 |

**ChatController 测试总计: 21项**

#### ChapterController / HeartbeatController 测试

| 测试模块 | 测试项数 |
|---------|---------|
| create chapter | 8项 |
| getById | 4项 |
| getByNovel | 4项 |
| update | 5项 |
| delete chapter | 4项 |
| create heartbeat | 10项 |
| getByChapter | 4项 |
| delete heartbeat | 4项 |

**Chapter/Heartbeat Controller 测试总计: 43项**

---

## 📊 测试统计

| 类别 | 测试文件 | 测试项数 |
|------|---------|---------|
| 前端 Store | 2 | ~110项 |
| 前端组件 | 3 | ~54项 |
| 前端工具 | 1 | ~41项 |
| 前端集成 | 1 | ~37项 |
| 后端服务 | 2 | ~49项 |
| 后端控制器 | 2 | ~64项 |
| **总计** | **11** | **~355项** |

---

## 🔧 配置说明

### Vitest 配置 (前端)

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

### Jest 配置 (后端)

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

---

## 📝 关键测试场景

### 1. 心跳标记完整流程
```typescript
// 用户场景：在写作时标记重要时刻
1. 用户进入写作状态 (creating)
2. 用户在编辑器中输入内容
3. 用户选中文字并添加心跳标记
4. 系统保存心跳到 store
5. 心跳标记在编辑器侧边显示
6. 用户可以查看、更新、删除心跳
```

### 2. 对话到写作的过渡
```typescript
// 用户场景：从构思到开始写作
1. 用户在 EmptyState 输入故事想法
2. 系统切换到 ChattingState
3. 用户与王编导对话完善构思
4. 用户点击"开始创作"按钮
5. 系统切换到 CreatingState
6. 对话历史保留，故事元素同步到侧边栏
```

### 3. 章节管理流程
```typescript
// 用户场景：完成一章开始下一章
1. 用户在 CreatingState 写作
2. 用户添加心跳标记关键情节
3. 用户点击"完成本章"
4. 系统显示统计信息
5. 用户确认进入下一章
6. 编辑器清空，章节号递增，心跳保留
```

---

## 🐛 常见测试问题

### 问题1: `window.matchMedia` 错误
**解决**: 已在 `setup.ts` 中 mock

### 问题2: `fetch` 未定义
**解决**: 已在 `setup.ts` 中 mock

### 问题3: Zustand store 状态残留
**解决**: 每个测试前调用 `resetSession()`

### 问题4: Jest 无法识别 ES 模块
**解决**: 使用 `ts-jest` preset 并配置 `transform`

---

## ✅ 验证清单

- [x] 前端 Store 测试覆盖所有 actions
- [x] 前端组件测试覆盖主要交互
- [x] AI Service 测试覆盖 API 调用和错误处理
- [x] 集成测试覆盖核心用户流程
- [x] 后端 Service 测试覆盖业务逻辑
- [x] 后端 Controller 测试覆盖 API 端点
- [x] SSE 流式响应测试
- [x] 错误处理测试
- [x] 验证 schema 测试

---

## 🔄 CI/CD 集成建议

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test:coverage
      
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run test:ci
```

---

## 📈 未来扩展

1. **E2E 测试**: 使用 Playwright 测试完整用户旅程
2. **性能测试**: 添加 AI 响应时间和编辑器渲染性能测试
3. **可视化回归测试**: 使用 Storybook + Chromatic
4. **契约测试**: 验证前后端 API 契约
5. **负载测试**: 测试高并发场景下的 SSE 连接

---

## 📞 支持

如有测试相关问题，请检查:
1. 测试环境变量是否正确设置
2. 依赖是否完全安装
3. 数据库连接是否配置 (后端测试)

**测试编写完成日期**: 2026-03-16