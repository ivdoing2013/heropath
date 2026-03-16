// HeroPath AI 服务 - 通过后端 API 调用王编导
// 后端代理 DeepSeek API，保护 API Key

// 后端 API 地址 - 优先从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://heropath-backend.vercel.app'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StoryElement {
  type: 'character' | 'world' | 'plot' | 'scene'
  title: string
  content: string
}

export interface WangDaoyanResponse {
  text: string
  storyType?: 'lyric' | 'romance' | 'hero' | null
  storyElement?: StoryElement
  suggestedResponses?: string[]
  shouldTransition?: boolean
  transitionTo?: 'creating'
}

// 消息历史缓存
let messageHistory: ChatMessage[] = []

// 获取系统提示词
const getSystemPrompt = (): string => {
  return `你是王编导，一位资深的网文编辑和创作顾问，擅长帮助作者从灵感到成稿。

## 你的职责
1. 通过对话引导作者明确创作方向
2. 帮助梳理故事核心要素（人物、世界观、情节）
3. 在关键节点生成结构化的故事卡片
4. 识别故事类型（抒情散文/男欢女爱/英雄之旅）
5. 当故事要素足够完整时，引导进入创作阶段

## 你的风格
- 温暖而专业，像一位经验丰富的导师
- 善于发现作品的闪光点
- 能够一针见血地指出问题
- 提供具体可行的改进建议
- 使用中文回复

## 故事类型识别
- 抒情散文：侧重情感表达、意境营造
- 男欢女爱：以爱情关系为核心的故事
- 英雄之旅：主角经历挑战、获得成长的冒险故事

## 回复格式
当你收集到足够信息时，可以在回复末尾添加结构化数据：

---STORY_ELEMENT---
类型: character|world|plot|scene
标题: 简短标题
内容: |
  详细内容，支持多行
---END---

---SUGGESTIONS---
- 建议回复1
- 建议回复2
- 建议回复3
---END---

当故事准备就绪时，添加：
---ACTION---
action: start_creating
message: 开始创作吧！
---END---`
}

// 清空历史
export const clearChatHistory = (): void => {
  messageHistory = []
}

// 获取当前历史
export const getChatHistory = (): ChatMessage[] => {
  return [...messageHistory]
}

// 调用后端 API 与王编导对话
export async function chatWithWangDaoyan(
  userInput: string,
  onStream?: (text: string) => void
): Promise<WangDaoyanResponse> {
  try {
    // 构建消息历史
    const messages: ChatMessage[] = [
      { role: 'system', content: getSystemPrompt() },
      ...messageHistory.slice(-10), // 保留最近10条历史
      { role: 'user', content: userInput }
    ]

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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    let fullText = ''

    // 处理流式响应
    if (onStream && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

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
    } else {
      // 非流式响应
      const data = await response.json()
      fullText = data.choices?.[0]?.message?.content || ''
    }

    // 更新历史
    messageHistory.push({ role: 'user', content: userInput })
    
    // 解析回复
    const parsedResponse = parseWangDaoyanResponse(fullText)
    
    // 将助手回复添加到历史（去除结构化标记）
    messageHistory.push({ 
      role: 'assistant', 
      content: parsedResponse.text 
    })

    // 限制历史长度
    if (messageHistory.length > 20) {
      messageHistory = messageHistory.slice(-20)
    }

    return parsedResponse
  } catch (error) {
    console.error('Backend API error:', error)
    return {
      text: error instanceof Error ? 
        `（王编导似乎走神了... ${error.message}）` : 
        '（王编导似乎走神了...能再说一遍吗？）'
    }
  }
}

// 解析王编导的回复
function parseWangDaoyanResponse(text: string): WangDaoyanResponse {
  const response: WangDaoyanResponse = { text }

  // 提取 story element
  const elementMatch = text.match(/---STORY_ELEMENT---\n([\s\S]*?)\n---END---/)
  if (elementMatch) {
    const elementContent = elementMatch[1]
    const typeMatch = elementContent.match(/类型:\s*(\w+)/)
    const titleMatch = elementContent.match(/标题:\s*(.+)/)
    const contentMatch = elementContent.match(/内容:\s*\|?\s*\n?([\s\S]*)/)

    if (typeMatch && titleMatch) {
      response.storyElement = {
        type: typeMatch[1] as StoryElement['type'],
        title: titleMatch[1].trim(),
        content: contentMatch ? contentMatch[1].trim().replace(/^\s*-\s*/gm, '• ') : ''
      }
    }
    // 从正文中移除结构化数据
    response.text = text.replace(/---STORY_ELEMENT---[\s\S]*?---END---\n?/g, '').trim()
  }

  // 提取建议回复
  const suggestionsMatch = text.match(/---SUGGESTIONS---\n([\s\S]*?)\n---END---/)
  if (suggestionsMatch) {
    response.suggestedResponses = suggestionsMatch[1]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('-'))
      .map(s => s.slice(1).trim())
    response.text = response.text.replace(/---SUGGESTIONS---[\s\S]*?---END---\n?/g, '').trim()
  }

  // 检测创作类型
  const lowerText = response.text.toLowerCase()
  if (lowerText.includes('抒情') || lowerText.includes('散文') || lowerText.includes('意境')) {
    response.storyType = 'lyric'
  } else if (lowerText.includes('爱情') || lowerText.includes('感情') || lowerText.includes('相遇') || lowerText.includes('重逢') || lowerText.includes('他') || lowerText.includes('她')) {
    response.storyType = 'romance'
  } else if (lowerText.includes('冒险') || lowerText.includes('英雄') || lowerText.includes('成长') || lowerText.includes('使命') || lowerText.includes('旅程')) {
    response.storyType = 'hero'
  }

  // 检测动作指令
  const actionMatch = text.match(/---ACTION---\n([\s\S]*?)\n---END---/)
  if (actionMatch) {
    const actionContent = actionMatch[1]
    const actionType = actionContent.match(/action:\s*(\w+)/)
    if (actionType?.[1] === 'start_creating') {
      response.shouldTransition = true
      response.transitionTo = 'creating'
    }
    response.text = response.text.replace(/---ACTION---[\s\S]*?---END---\n?/g, '').trim()
  }

  return response
}

// 检查后端服务是否可用
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// Skill 系统 - 12 节点英雄之旅
export interface SkillNode {
  id: string
  number: number
  name: string
  nameEn: string
  description: string
  icon: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  requiredProgress: number // 0-1
}

// 12 节点技能树
export const SKILL_TREE: SkillNode[] = [
  { id: 'stage_1', number: 1, name: '平凡世界', nameEn: 'Ordinary World', description: '描绘主角的日常生活，建立读者共鸣', icon: '🏠', status: 'locked', requiredProgress: 0 },
  { id: 'stage_2', number: 2, name: '冒险召唤', nameEn: 'Call to Adventure', description: '打破平静的事件，引出故事冲突', icon: '📢', status: 'locked', requiredProgress: 0.08 },
  { id: 'stage_3', number: 3, name: '拒斥召唤', nameEn: 'Refusal of the Call', description: '主角的犹豫与抗拒，展现人性真实', icon: '😰', status: 'locked', requiredProgress: 0.17 },
  { id: 'stage_4', number: 4, name: '遇见导师', nameEn: 'Meeting the Mentor', description: '获得指引与智慧，准备出发', icon: '👴', status: 'locked', requiredProgress: 0.25 },
  { id: 'stage_5', number: 5, name: '跨越门槛', nameEn: 'Crossing the Threshold', description: '踏入未知世界，故事正式开始', icon: '🚪', status: 'locked', requiredProgress: 0.33 },
  { id: 'stage_6', number: 6, name: '考验盟友', nameEn: 'Tests, Allies, Enemies', description: '新世界的挑战，建立关系网络', icon: '🤝', status: 'locked', requiredProgress: 0.42 },
  { id: 'stage_7', number: 7, name: '接近洞穴', nameEn: 'Approach to the Cave', description: '逼近核心危险，紧张感升级', icon: '🕸️', status: 'locked', requiredProgress: 0.5 },
  { id: 'stage_8', number: 8, name: '磨难', nameEn: 'The Ordeal', description: '最严峻的考验，生与死的边缘', icon: '🔥', status: 'locked', requiredProgress: 0.58 },
  { id: 'stage_9', number: 9, name: '奖励', nameEn: 'The Reward', description: '战胜磨难后获得珍贵之物', icon: '🏆', status: 'locked', requiredProgress: 0.67 },
  { id: 'stage_10', number: 10, name: '归途', nameEn: 'The Road Back', description: '踏上归程，带着收获返乡', icon: '🛤️', status: 'locked', requiredProgress: 0.75 },
  { id: 'stage_11', number: 11, name: '复活', nameEn: 'Resurrection', description: '最终蜕变，浴火重生', icon: '✨', status: 'locked', requiredProgress: 0.83 },
  { id: 'stage_12', number: 12, name: '携药归来', nameEn: 'Return with Elixir', description: '带回万能药，完成旅程', icon: '💊', status: 'locked', requiredProgress: 0.92 }
]

// 根据进度获取当前技能节点
export function getCurrentSkillNode(completedNodes: number): SkillNode | null {
  const nextNode = SKILL_TREE.find(n => n.number === completedNodes + 1)
  return nextNode || null
}

// 根据对话轮数计算进度
export function calculateProgress(conversationTurn: number, storyElements: number): number {
  const turnProgress = Math.min(conversationTurn / 15, 0.6) // 对话贡献最多60%
  const elementProgress = Math.min(storyElements / 5, 0.4) // 元素贡献最多40%
  return Math.min(turnProgress + elementProgress, 1)
}
