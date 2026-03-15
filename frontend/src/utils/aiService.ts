// DeepSeek API 服务 - 王编导大脑

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface WangDaoyanResponse {
  text: string
  storyType?: 'lyric' | 'romance' | 'hero' | null
  detectedElements?: {
    characters?: string[]
    setting?: string
    conflict?: string
    emotion?: string
  }
  shouldGenerateCard?: boolean
  cardType?: 'character' | 'world' | 'plot'
}

// 王编导的系统提示词 - 专业编剧导师人设
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

当前对话阶段：根据上下文判断是"开场"、"探索"、"确认"还是"生成"。`

// 调用 DeepSeek API
export async function chatWithWangDaoyan(
  messages: ChatMessage[],
  onStream?: (text: string) => void
): Promise<WangDaoyanResponse> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: WANG_DAOTAO_SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 500,
        stream: !!onStream
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // 处理流式响应
    if (onStream && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullText += content
                onStream(fullText)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      return { text: fullText }
    }

    // 非流式响应
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return parseWangDaoyanResponse(text)
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return {
      text: '（王编导似乎走神了...能再说一遍吗？）'
    }
  }
}

// 解析王编导的回复
function parseWangDaoyanResponse(text: string): WangDaoyanResponse {
  const response: WangDaoyanResponse = { text }

  // 检测创作类型
  if (text.includes('抒情') || text.includes('散文') || text.includes('意境')) {
    response.storyType = 'lyric'
  } else if (text.includes('爱情') || text.includes('感情') || text.includes('相遇') || text.includes('重逢')) {
    response.storyType = 'romance'
  } else if (text.includes('冒险') || text.includes('英雄') || text.includes('成长') || text.includes('使命')) {
    response.storyType = 'hero'
  }

  // 检测是否需要生成卡片（当王编导说"我们开始"或"让我整理"时）
  if (text.includes('开始') && (text.includes('构建') || text.includes('整理') || text.includes('梳理'))) {
    response.shouldGenerateCard = true
    response.cardType = 'character'
  }

  return response
}

// 模拟对话（用于测试，无需API Key）
export async function mockChatWithWangDaoyan(
  userInput: string,
  turnCount: number
): Promise<WangDaoyanResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const responses = [
    {
      text: '有意思...让我再多了解一点。这个人物是什么样的性格？',
      storyType: null
    },
    {
      text: '我感受到了！那种复杂的情绪很抓人。你觉得故事的转折点会在哪里？',
      storyType: 'romance'
    },
    {
      text: '这个设定很有潜力。我们开始构建故事框架吧？',
      storyType: 'hero',
      shouldGenerateCard: true,
      cardType: 'character' as const
    }
  ]

  return responses[Math.min(turnCount, responses.length - 1)]
}
