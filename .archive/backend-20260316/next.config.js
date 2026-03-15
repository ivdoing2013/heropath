/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js API 模式，不需要页面渲染
  output: 'standalone',
  // 禁用静态导出，因为我们使用 API 路由
  distDir: '.next',
}

module.exports = nextConfig
