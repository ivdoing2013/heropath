# HeroPath 后端部署指南

## 快速部署（推荐）

### 方式 1：Vercel Web 界面（最简单）

1. **访问 Vercel 导入页面**
   - 打开 https://vercel.com/new

2. **导入 GitHub 仓库**
   - 选择 `ivdoing2013/heropath`
   - 选择 `backend-vercel` 目录

3. **配置环境变量**
   - 点击 "Environment Variables"
   - 添加：`DEEPSEEK_API_KEY` = `sk-2dcd2ddc13484a6ba44ca4028473af78`

4. **部署**
   - 点击 "Deploy"
   - 等待 1-2 分钟完成

5. **获取域名**
   - 例如：`https://heropath-backend-xxxxx.vercel.app`

### 方式 2：Vercel CLI

```bash
# 1. 登录 Vercel
npx vercel login

# 2. 进入后端目录
cd backend-vercel

# 3. 部署
npx vercel --prod

# 4. 设置环境变量
npx vercel env add DEEPSEEK_API_KEY
# 输入: sk-2dcd2ddc13484a6ba44ca4028473af78
```

## 验证部署

部署完成后，测试 API：

```bash
# 测试健康检查
curl https://your-backend.vercel.app/

# 测试聊天接口
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}],"stream":false}'
```

## 更新前端 API 地址

部署成功后，编辑 `frontend/.env`：

```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

然后重新构建前端：

```bash
cd frontend
npm run build
```

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| 500 错误 | 检查环境变量 DEEPSEEK_API_KEY 是否设置 |
| CORS 错误 | 确认请求来源在允许列表中 |
| 流式输出不工作 | 前端需要正确处理 SSE 格式 |

## API 端点

- `GET /` - 健康检查
- `POST /api/chat` - AI 对话接口

### POST /api/chat 请求格式

```json
{
  "messages": [
    {"role": "user", "content": "你好，王编导"}
  ],
  "stream": true
}
```

---

**部署状态**: 待部署
**预计时间**: 2-3 分钟
