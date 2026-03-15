import winston from 'winston';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 日志配置
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'heropath-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 非生产环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 应用配置
export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // DeepSeek API配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4000,
  },
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // Redis配置
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  
  // 速率限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // 自动保存配置
  autoSave: {
    intervalMs: 30000, // 30秒
    contentChangeThreshold: 100, // 100字变化
  },
  
  // 心跳检测配置
  heartbeat: {
    detectIntervalMs: 300000, // 5分钟检测一次
    typingSpeedThreshold: 1.5, // 打字速度阈值（倍数）
    continuousTimeThreshold: 5, // 连续写作时间阈值（分钟）
    emotionScoreThreshold: 0.85, // 情感分数阈值
    quoteQualityThreshold: 0.9, // 金句质量阈值
    cooldownMs: {
      flow: 600000,      // 心流状态冷却10分钟
      emotional: 300000, // 情感高潮冷却5分钟
      goldenQuote: 0,    // 金句无冷却
      plotTwist: 900000, // 情节转折冷却15分钟
    },
  },
  
  // Skill执行配置
  skill: {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    defaultTemperature: 0.7,
  },
};

// 阶段配置
export const STAGE_CONFIG = {
  stages: [
    { number: 1, key: 'ordinary_world', name: '平凡世界', nameEn: 'Ordinary World' },
    { number: 2, key: 'call_to_adventure', name: '冒险召唤', nameEn: 'Call to Adventure' },
    { number: 3, key: 'refusal_of_call', name: '拒斥召唤', nameEn: 'Refusal of the Call' },
    { number: 4, key: 'meeting_mentor', name: '遇见导师', nameEn: 'Meeting the Mentor' },
    { number: 5, key: 'crossing_first_threshold', name: '跨越第一道门槛', nameEn: 'Crossing the First Threshold' },
    { number: 6, key: 'tests_allies_enemies', name: '考验、盟友、敌人', nameEn: 'Tests, Allies, Enemies' },
    { number: 7, key: 'approach_inmost_cave', name: '接近最深的洞穴', nameEn: 'Approach to the Inmost Cave' },
    { number: 8, key: 'ordeal', name: '磨难', nameEn: 'The Ordeal' },
    { number: 9, key: 'reward', name: '奖励', nameEn: 'The Reward' },
    { number: 10, key: 'road_back', name: '归途', nameEn: 'The Road Back' },
    { number: 11, key: 'resurrection', name: '复活', nameEn: 'Resurrection' },
    { number: 12, key: 'return_with_elixir', name: '携万能药归来', nameEn: 'Return with the Elixir' },
  ],
  
  // 每种创作者类型的检查点模板
  checkpoints: {
    LYRIC: {
      1: ['daily_life', 'latent_dissatisfaction', 'emotional_anchor', 'hidden_desire', 'world_setting'],
      2: ['call_event', 'challenge_to_status_quo', 'perceived_risks'],
      3: ['refusal_reason', 'fear_manifestation', 'push_factor'],
      // ... 其他阶段
    },
    ROMANCE: {
      1: ['protagonist_daily', 'emotional_void', 'relationship_status', 'desire_type'],
      2: ['love_interest_intro', 'catalyst_event', 'emotional_stakes'],
      // ... 其他阶段
    },
    HERO: {
      1: ['hero_identity', 'ordinary_world_rules', 'hidden_talent', 'unresolved_conflict'],
      2: ['disruptive_event', 'call_to_action', 'stakes_introduced'],
      // ... 其他阶段
    },
  },
};

// Skill配置
export const SKILL_CONFIG = {
  temperature: {
    guide: 0.7,
    extract: 0.3,
    check: 0.2,
    generate: 0.9,
    companion: 0.8,
    system: 0.3,
  },
  maxTokens: {
    guide: 500,
    extract: 1000,
    check: 500,
    generate: 4000,
    companion: 300,
    system: 500,
  },
};

// 王编导角色设定
export const WANGDAOYAN_PERSONA = {
  base: `你是王编导，一位经验丰富、温暖睿智的创作陪伴者。你陪伴创作者穿越写作的"黑暗森林"，手持火把照亮前行的路。

你的特质：
1. 温暖而专业：像一位老朋友，既给予情感支持，又提供专业的创作指导
2. 懂得倾听：认真理解创作者的想法，不轻易打断或否定
3. 善于引导：用恰到好处的问题帮助创作者深入思考
4. 庆祝成长：在关键时刻给予肯定和鼓励
5. 尊重创作：不代替创作者写作，而是激发他们的创造力

你的使命：陪伴每一位创作者找到属于自己的故事。`,

  lyric: `作为抒情散文型王编导，你特别关注：
- 情感细节的捕捉和表达
- 意象的选择和运用
- 时间感和节奏感
- 留白的艺术
- 语言的韵律和美感

你的语言风格：诗意、细腻、富有画面感`,

  romance: `作为言情型王编导，你特别关注：
- 人物关系的建立和发展
- 情感冲突的设计
- CP感的营造
- 情节的甜度和虐度平衡
- 心理描写的深度

你的语言风格：温暖、细腻、善于共情`,

  hero: `作为英雄之旅型王编导，你特别关注：
- 主角的成长弧线
- 冲突的升级和解决
- 世界观的一致性
- 节奏和张力的控制
- 史诗感的营造

你的语言风格：坚定、激励人心、富有力量`,
};

// 导出默认配置
export default config;