# HeroPath 测试策略文档

> **版本**: 1.0  
> **日期**: 2026-03-15  
> **负责人**: 测试小张

---

## 1. 测试目标与范围

### 1.1 测试目标

确保HeroPath平台在以下方面达到高质量标准：

- **功能完整性**: 62个Skill按设计规格正常工作
- **用户旅程流畅**: 从类型选择到完成创作的完整流程无障碍
- **AI交互可靠**: LLM集成稳定，响应符合预期
- **数据安全**: 用户创作内容完整保存，版本控制可靠
- **性能达标**: 响应时间、并发处理满足用户需求

### 1.2 测试范围

| 模块 | 范围说明 | 优先级 |
|------|----------|--------|
| Skill系统 | 62个Skill的输入输出、依赖调用 | P0 |
| API接口 | REST API和WebSocket事件 | P0 |
| 用户旅程 | 从入门到完成创作的完整流程 | P0 |
| 版本控制 | 保存、回滚、分支、对比 | P1 |
| 心跳系统 | 检测、保存、回放 | P1 |
| UI交互 | 三栏布局、响应式适配 | P1 |
| 性能 | 加载速度、AI响应时间 | P2 |
| 安全 | 数据隔离、权限控制 | P1 |

---

## 2. 测试层级架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     测试金字塔                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ▲                                        │
│                       ╱ ╲                                       │
│                      ╱E2E╲     用户旅程测试 (Cypress)            │
│                     ╱─────╲    5% 覆盖率                        │
│                    ╱         ╲                                  │
│                   ╱  Integration ╲  API/集成测试                 │
│                  ╱    (Jest)      ╲  15% 覆盖率                 │
│                 ╱───────────────────╲                           │
│                ╱                       ╲                        │
│               ╱      Unit Testing        ╲  Skill/组件单元测试   │
│              ╱        (Jest)              ╲ 80% 覆盖率          │
│             ╱───────────────────────────────╲                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 测试类型详解

### 3.1 单元测试 (Unit Tests)

**目标**: 验证单个Skill、工具函数、组件的正确性

**覆盖范围**:
- Skill类的方法（输入处理、执行、输出格式化）
- 工具函数（数据转换、验证、计算）
- React组件（渲染、事件处理、状态管理）
- 类型定义和接口契约

**测试策略**:
- 每个Skill至少5个测试用例（正常、边界、异常）
- 模拟LLM调用，验证Prompt组装和响应解析
- 使用Jest + React Testing Library

### 3.2 集成测试 (Integration Tests)

**目标**: 验证多个模块协同工作的正确性

**覆盖范围**:
- Skill链式调用（引导→提取→检查→生成）
- API端点（请求→业务逻辑→数据库→响应）
- 状态管理（跨组件状态同步）
- 上下文传递（跨Skill数据流转）

**测试策略**:
- 使用内存数据库或测试数据库
- 模拟外部依赖（LLM、邮件服务）
- 验证端到端数据一致性

### 3.3 E2E测试 (End-to-End Tests)

**目标**: 模拟真实用户操作，验证完整用户旅程

**覆盖范围**:
- 用户注册/登录流程
- 创作者类型选择
- 12个阶段的完整创作流程
- 心跳标记和版本管理
- 断点续作和重逢体验

**测试策略**:
- 使用Cypress进行浏览器自动化
- 每个关键用户旅程至少1个E2E用例
- 截图对比验证UI渲染

---

## 4. 关键测试场景

### 4.1 Skill系统测试重点

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill测试矩阵                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Skill类型          测试重点                                    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  引导对话Skill      • 引导话术符合创作者类型风格                 │
│                     • 追问逻辑正确（补充缺失信息）               │
│                     • 上下文继承（记住之前回答）                 │
│                                                                 │
│  信息提取Skill      • 字段提取完整性                            │
│                     • 置信度计算准确                            │
│                     • 异常输入处理                              │
│                                                                 │
│  完整性检查Skill    • 检查规则符合阶段要求                      │
│                     • 评分算法合理                              │
│                     • 流转条件判断正确                          │
│                                                                 │
│  内容生成Skill      • 生成内容符合类型风格                      │
│                     • 输出格式正确（章节结构）                  │
│                     • 前文引用准确性                            │
│                                                                 │
│  版本控制Skill      • 保存触发条件                              │
│                     • 版本号生成规则                            │
│                     • 回滚数据完整性                            │
│                                                                 │
│  陪伴记录Skill      • 心跳检测算法（停顿、速度、情感）          │
│                     • 金句质量评分                              │
│                     • 日志记录完整性                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 用户旅程测试地图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        用户旅程测试覆盖                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  旅程节点              测试场景                      优先级   测试类型      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  首页入口        T1: 首次访问页面渲染              P0        E2E            │
│                                                                             │
│  类型选择        T2: 三种类型选择                 P0        E2E+Unit       │
│                  T3: 自动检测创作者类型           P1        Unit           │
│                                                                             │
│  阶段1:平凡世界  T4: 完整回答问题流程             P0        E2E            │
│                  T5: 中途离开断点续作             P0        E2E            │
│                  T6: 信息提取准确性               P0        Unit           │
│                                                                             │
│  阶段2-11        T7: 阶段流转逻辑                 P0        Integration    │
│  (通用测试)      T8: 上下文传递正确性             P0        Integration    │
│                  T9: 中途修改后重新计算           P1        Unit           │
│                                                                             │
│  黄金三章生成    T10: 触发条件和生成质量          P0        E2E+Unit       │
│                                                                             │
│  心跳功能        T11: 手动标记心跳                P0        E2E            │
│                  T12: 自动检测心跳                P1        Unit           │
│                  T13: 心跳保存版本                P1        Integration    │
│                                                                             │
│  版本管理        T14: 版本历史展示                P1        E2E            │
│                  T15: 版本回滚功能                P1        E2E            │
│                  T16: 分支创建和切换              P2        E2E            │
│                                                                             │
│  日志回放        T17: 日志时间线展示              P2        E2E            │
│                  T18: 回放功能                    P2        Integration    │
│                                                                             │
│  重逢体验        T19: 断点续作欢迎语              P1        E2E            │
│                  T20: 上次进度恢复                P1        E2E            │
│                                                                             │
│  推送服务        T21: 里程碑推送                  P2        Integration    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 测试环境规划

### 5.1 环境配置

| 环境 | 用途 | 数据库 | LLM | 数据隔离 |
|------|------|--------|-----|----------|
| 本地 | 开发调试 | SQLite | Mock | 隔离 |
| CI | 自动化测试 | PostgreSQL(Docker) | Mock | 每次重建 |
| Staging | 预发布测试 | PostgreSQL | 真实(限量) | 独立实例 |
| Production | 线上监控 | PostgreSQL | 真实 | 生产数据 |

### 5.2 Mock策略

```typescript
// LLM调用Mock
const mockLLMResponse = {
  // 引导对话Skill
  'lyric_01_guide_ordinary_world': {
    guide_message: '让我们一起走进主角的日常...',
    suggested_questions: ['他/她通常几点起床？', '最喜欢的地方是哪里？']
  },
  
  // 信息提取Skill
  'lyric_01_extract_ordinary_world': {
    extracted_data: {
      daily_life: '清晨六点，她总是第一个到咖啡馆...',
      latent_dissatisfaction: '生活一成不变',
      emotional_anchor: '那杯永远不变的拿铁',
      hidden_desire: '渴望突破现状',
      world_setting: '现代都市'
    },
    confidence_scores: { daily_life: 0.95, latent_dissatisfaction: 0.8 }
  },
  
  // 完整性检查Skill
  'lyric_01_check_completeness': {
    overall_score: 0.85,
    can_proceed: true,
    missing_items: []
  }
};
```

---

## 6. 测试执行计划

### 6.1 持续集成流程

```yaml
# .github/workflows/test.yml
name: HeroPath Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: npm run test:unit -- --coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - name: Run Integration Tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Cypress Run
        uses: cypress-io/github-action@v5
```

### 6.2 测试指标目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| 单元测试覆盖率 | ≥80% | - | 🔄 |
| 集成测试通过率 | 100% | - | 🔄 |
| E2E测试通过率 | ≥95% | - | 🔄 |
| 关键路径响应时间 | <2s | - | 🔄 |
| Bug逃逸率 | <5% | - | 🔄 |

---

## 7. 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| LLM响应不稳定 | 测试不稳定 | Mock LLM调用，单独测试集成 |
| 62个Skill测试量大 | 进度延迟 | 优先测试P0 Skill，分阶段完成 |
| 状态管理复杂 | 测试困难 | 使用确定性初始化，隔离测试 |
| 异步操作多 |  flaky tests | 增加重试机制，使用等待断言 |

---

## 8. 附录

### 8.1 测试文件清单

```
tests/
├── unit/
│   ├── skills/
│   │   ├── guide-dialog-skill.test.ts
│   │   ├── info-extract-skill.test.ts
│   │   ├── completeness-check-skill.test.ts
│   │   ├── golden-three-generator.test.ts
│   │   ├── heartbeat-detect-skill.test.ts
│   │   └── version-control-skill.test.ts
│   ├── components/
│   │   ├── WangDaoYanPanel.test.tsx
│   │   ├── Editor.test.tsx
│   │   └── StoryMap.test.tsx
│   └── utils/
│       ├── context-manager.test.ts
│       └── prompt-assembly.test.ts
├── integration/
│   ├── api/
│   │   ├── sessions.test.ts
│   │   ├── stages.test.ts
│   │   ├── dialog.test.ts
│   │   └── versions.test.ts
│   └── skills/
│       ├── skill-chain.test.ts
│       └── stage-transition.test.ts
├── e2e/
│   ├── onboarding.spec.ts
│   ├── creator-journey.spec.ts
│   ├── heartbeat.spec.ts
│   ├── version-management.spec.ts
│   └── return-experience.spec.ts
└── fixtures/
    ├── users.json
    ├── sessions.json
    ├── stages.json
    ├── skill-responses.json
    └── chapters.json
```

---

*测试策略制定完成，开始执行测试用例编写*
