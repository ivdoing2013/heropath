#!/bin/bash
# HeroPath 后端部署脚本

echo "🚀 部署 HeroPath 后端到 Vercel..."
echo ""

# 检查是否在正确目录
if [ ! -f "api/chat.js" ]; then
    echo "❌ 错误：请在 backend 目录下运行此脚本"
    exit 1
fi

# 检查是否已登录 Vercel
echo "📋 检查 Vercel 登录状态..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "📝 请先登录 Vercel:"
    vercel login
fi

# 设置环境变量
echo ""
echo "🔧 配置环境变量..."
vercel env add DEEPSEEK_API_KEY

# 部署
echo ""
echo "🚀 开始部署..."
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📌 请记录以下信息："
echo "   - 后端 API 地址: https://your-project.vercel.app"
echo "   - 聊天接口: https://your-project.vercel.app/api/chat"
echo ""
echo "📝 下一步："
echo "   1. 更新前端 .env 文件中的 VITE_API_BASE_URL"
echo "   2. 重新构建并部署前端到 GitHub Pages"
