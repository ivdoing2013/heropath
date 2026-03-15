// 健康检查 / 首页
export default function handler(req, res) {
  res.status(200).json({
    name: 'HeroPath Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'POST /api/chat': '王编导 AI 对话接口'
    }
  });
}
