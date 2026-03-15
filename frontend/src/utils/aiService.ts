// HeroPath AI 服务 - 通过后端 API 调用王编导
// 后端代理 DeepSeek API，保护 API Key

// 后端 API 地址 - 优先从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://heropath-backend.vercel.app'

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

// 调用后端 API 与王编导对话
export async function chatWithWangDaoyan(
  messages: ChatMessage[],
  onStream?: (text: string) => void
): Promise<WangDaoyanResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
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

      return parseWangDaoyanResponse(fullText)
    }

    // 非流式响应
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return parseWangDaoyanResponse(text)
  } catch (error) {
    console.error('Backend API error:', error)
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

// 模拟对话（用于测试，无需后端）
export async function mockChatWithWangDaoyan(
  _userInput: string,
  turnCount: number
): Promise<WangDaoyanResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const responses: WangDaoyanResponse[] = [
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
      cardType: 'character'
    }
  ]

  return responses[Math.min(turnCount, responses.length - 1)]
}

// 检查后端服务是否可用
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch {
    return false
  }
}
