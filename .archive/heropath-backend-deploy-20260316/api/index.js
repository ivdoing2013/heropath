// HeroPath 后端 API - 首页/健康检查
module.exports = (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    name: 'HeroPath Backend API',
    version: '1.0.0',
    status: 'running',
    character: '王编导 - AI 编剧导师',
    endpoints: {
      'GET /': '首页/健康检查',
      'POST /api/chat': '王编导 AI 对话接口'
    }
  });
};
