#!/bin/bash
# HeroPath 后端部署辅助脚本

echo "🚀 HeroPath 后端部署助手"
echo "=========================="
echo ""

# 检查目录
cd "$(dirname "$0")"

if [ ! -f "api/chat.js" ]; then
    echo "❌ 错误：请在 backend-vercel 目录下运行此脚本"
    exit 1
fi

echo "📦 准备部署文件..."
echo ""

# 创建部署包
DEPLOY_DIR="heropath-backend-deploy"
mkdir -p ../$DEPLOY_DIR
cp -r api package.json vercel.json README.md ../$DEPLOY_DIR/

echo "✅ 部署文件已准备到: ../$DEPLOY_DIR/"
echo ""

echo "📋 部署方式选择："
echo ""
echo "1️⃣  Vercel CLI (需要登录)"
echo "     vercel login"
echo "     vercel --prod"
echo ""
echo "2️⃣  Vercel Web (推荐)"
echo "     访问 https://vercel.com/new"
echo "     导入 GitHub 仓库"
echo "     设置 DEEPSEEK_API_KEY 环境变量"
echo ""
echo "3️⃣  GitHub Actions"
echo "     推送代码到 GitHub"
echo "     在 Settings → Secrets 添加:"
echo "     - VERCEL_TOKEN"
echo "     - DEEPSEEK_API_KEY"
echo ""

echo "🔧 环境变量:"
echo "     DEEPSEEK_API_KEY=sk-2dcd2ddc13484a6ba44ca4028473af78"
echo ""

echo "📁 部署文件列表:"
ls -la ../$DEPLOY_DIR/
