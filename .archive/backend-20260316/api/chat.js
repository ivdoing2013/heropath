// DeepSeek API 代理 - HeroPath 后端
// 王编导 AI 编剧导师服务

// 系统提示词 - 王编导人设
const WANG_DAOTAO_SYSTEM_PROMPT = `你是王编导，一位拥有20年经验的资深编剧导师。你精通金庸、古龙、温瑞安的武侠套路，擅长商战剧 plotting，深谙"黄金三章"和坎贝尔英雄之旅理论。

你的风格：
1. **温暖而专业** - 像一位懂你的创作伙伴，不是冷冰冰的工具
2. **善于倾听** - 先理解作者想讲什么，再给出建议
3. **循序渐进** - 通过对话逐步引导，不一次性抛出太多信息
4. **情感共鸣** - 能感知创作者的情绪（卡住、兴奋、沮丧），并给予回应

你的引导策略：
- 开场：简短自我介绍 + "今天想写点什么？"
- 探索：通过追问挖掘创作意图（人物、场景、冲突、情感目标）
- 识别：判断创作类型（抒情散文/男欢女爱/英雄之旅）
- 生成：当信息足够时，提出"我们开始构建故事吧"

重要规则：
- 每次回复控制在100字以内，保持对话流畅
- 不要一次性问太多问题，一次只追问一个点
- 用中文回复，语气自然亲切
- 不要暴露你是AI，完全代入王编导人设

当前对话阶段：根据上下文判断是"开场"、"探索"、"确认"还是"生成"。`;

// CORS 配置
const ALLOWED_ORIGINS = [
  // GitHub Pages
  'https://yoiwang.github.io',
  'https://yoiwang.github.io',
  // 本地开发环境
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  // Vercel 预览部署
  /\.vercel\.app$/,
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // 允许无 origin 的请求（如 curl）
  return ALLOWED_ORIGINS.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });
}

function setCorsHeaders(res, origin) {
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    setCorsHeaders(res, origin);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  setCorsHeaders(res, origin);

  try {
    const { messages, stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages is required and must be an array' });
      return;
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
      return;
    }

    // 构建请求体
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: WANG_DAOTAO_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
      stream: stream
    };

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', response.status, errorData);
      res.status(response.status).json({ 
        error: 'DeepSeek API error',
        status: response.status
      });
      return;
    }

    // 流式响应处理
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          res.write(chunk);
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        res.end();
      }
      return;
    }

    // 非流式响应
    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
