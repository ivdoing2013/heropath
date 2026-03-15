import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'
import { chatWithWangDaoyan, mockChatWithWangDaoyan, checkBackendHealth, ChatMessage, WangDaoyanResponse } from './utils/aiService'

interface Message {
  id: string
  sender: 'wang' | 'user'
  text: string
  type?: 'text' | 'story-card' | 'character-card' | 'world-card'
  metadata?: any
}

interface StoryElement {
  type: 'character' | 'world' | 'plot' | 'scene'
  title: string
  content: string
  timestamp: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'wang',
      text: '嗨，我是王编导。✨\n\n我见过太多故事胎死腹中——不是才华不够，是方向不清。\n\n告诉我，你想讲一个什么样的故事？',
      type: 'text'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [storyElements, setStoryElements] = useState<StoryElement[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [conversationTurn, setConversationTurn] = useState(0)
  const [detectedType, setDetectedType] = useState<string | null>(null)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingText, setStreamingText] = useState('')

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  // 检查后端服务状态
  useEffect(() => {
    checkBackendHealth().then(available => {
      setBackendAvailable(available)
      console.log('Backend available:', available)
    })
  }, [])

  // 构建对话历史
  const buildChatHistory = useCallback((): ChatMessage[] => {
    return messages.map(msg => ({
      role: msg.sender === 'wang' ? 'assistant' : 'user',
      content: msg.text
    }))
  }, [messages])

  // 调用王编导 AI
  const callWangDaoyan = async (userInput: string) => {
    setIsTyping(true)
    setStreamingText('')

    try {
      let response: WangDaoyanResponse

      // 优先使用后端 API，如果不可用则使用模拟对话
      if (backendAvailable) {
        const history = buildChatHistory()
        response = await chatWithWangDaoyan(history, (text) => {
          setStreamingText(text)
        })
      } else {
        // 使用模拟对话
        response = await mockChatWithWangDaoyan(userInput, conversationTurn)
      }

      // 添加 AI 回复
      const wangMessage: Message = {
        id: Date.now().toString(),
        sender: 'wang',
        text: response.text,
        type: 'text'
      }

      setMessages(prev => [...prev, wangMessage])
      setConversationTurn(prev => prev + 1)

      // 检测到的创作类型
      if (response.storyType) {
        setDetectedType(response.storyType)
      }

      // 如果需要生成卡片
      if (response.shouldGenerateCard) {
        setTimeout(() => {
          generateStoryCard(response)
        }, 500)
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'wang',
        text: '（王编导似乎在思考...能再说一遍吗？）',
        type: 'text'
      }])
    } finally {
      setIsTyping(false)
      setStreamingText('')
    }
  }

  // 生成故事卡片
  const generateStoryCard = (response: WangDaoyanResponse) => {
    const newElement: StoryElement = {
      type: response.cardType || 'character',
      title: response.cardType === 'character' ? '人物速写' : '故事要素',
      content: '根据我们的对话，这是一个关于\n• 主角在困境中寻找自我\n• 情感复杂而真实\n• 有强烈的成长弧光',
      timestamp: Date.now()
    }

    setStoryElements([newElement])
    setShowSidebar(true)

    // 添加卡片消息
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'wang',
      text: '我整理了一下我们聊的内容，你看看这个方向对吗？',
      type: 'story-card',
      metadata: newElement
    }])
  }

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')

    await callWangDaoyan(currentInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 获取创作类型标签
  const getTypeLabel = (type: string | null) => {
    const labels: Record<string, { text: string; emoji: string }> = {
      lyric: { text: '抒情散文', emoji: '🌸' },
      romance: { text: '男欢女爱', emoji: '💕' },
      hero: { text: '英雄之旅', emoji: '⚔️' }
    }
    return type ? labels[type] : null
  }

  return (
    <div className="heropath-app">
      {/* 主对话区域 */}
      <main className={`chat-container ${showSidebar ? 'with-sidebar' : ''}`}>
        {/* 顶部导航 */}
        <header className="app-header">
          <div className="logo">
            <span className="logo-star">✨</span>
            <span className="logo-text">HeroPath</span>
          </div>
          <div className="header-actions">
            {detectedType && (
              <div className="type-badge">
                {getTypeLabel(detectedType)?.emoji} {getTypeLabel(detectedType)?.text}
              </div>
            )}
            <button className="icon-btn" title="新建故事">+</button>
          </div>
        </header>

        {/* 消息列表 */}
        <div className="messages-wrapper">
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`message-row ${msg.sender} ${index === 0 ? 'first-message' : ''}`}
              >
                {msg.sender === 'wang' && (
                  <div className="wang-avatar">
                    <div className="star-icon">
                      <span className="star-1">✦</span>
                      <span className="star-2">✦</span>
                    </div>
                  </div>
                )}

                <div className="message-content">
                  {msg.sender === 'wang' && (
                    <div className="sender-name">王编导</div>
                  )}
                  <div className={`message-bubble ${msg.type || 'text'}`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {/* 故事卡片展示 */}
                  {msg.type === 'story-card' && msg.metadata && (
                    <div className="generated-card">
                      <div className="card-header">
                        <span className="card-icon">📋</span>
                        <span>{msg.metadata.title}</span>
                      </div>
                      <div className="card-body">
                        {msg.metadata.content.split('\n').map((line: string, i: number) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 流式输出 */}
            {isTyping && streamingText && (
              <div className="message-row wang streaming">
                <div className="wang-avatar">
                  <div className="star-icon pulsing">
                    <span className="star-1">✦</span>
                    <span className="star-2">✦</span>
                  </div>
                </div>
                <div className="message-content">
                  <div className="sender-name">王编导</div>
                  <div className="message-bubble">
                    {streamingText}
                    <span className="cursor-blink">▊</span>
                  </div>
                </div>
              </div>
            )}

            {/* 思考中 */}
            {isTyping && !streamingText && (
              <div className="message-row wang typing">
                <div className="wang-avatar">
                  <div className="star-icon pulsing">
                    <span className="star-1">✦</span>
                    <span className="star-2">✦</span>
                  </div>
                </div>
                <div className="message-content">
                  <div className="sender-name">王编导</div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="input-wrapper">
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="告诉王编导你的想法..."
              rows={1}
              className="message-input"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              className={`send-btn ${inputText.trim() && !isTyping ? 'active' : ''}`}
              disabled={!inputText.trim() || isTyping}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="input-hint">
            {isTyping ? '王编导正在思考...' : '按 Enter 发送，Shift + Enter 换行'}
          </div>
        </div>
      </main>

      {/* 侧边栏 - 故事元素（渐进展开） */}
      {showSidebar && (
        <aside className="story-sidebar">
          <div className="sidebar-header">
            <h3>故事大纲</h3>
            <button className="close-sidebar" onClick={() => setShowSidebar(false)}>×</button>
          </div>

          <div className="sidebar-content">
            {storyElements.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🌱</span>
                <p>和王编导多聊聊，故事元素会在这里生长出来</p>
              </div>
            ) : (
              <div className="elements-list">
                {storyElements.map((el, idx) => (
                  <div key={idx} className={`element-card ${el.type}`}>
                    <div className="element-icon">
                      {el.type === 'character' && '👤'}
                      {el.type === 'world' && '🌍'}
                      {el.type === 'plot' && '📖'}
                      {el.type === 'scene' && '🎬'}
                    </div>
                    <div className="element-info">
                      <div className="element-title">{el.title}</div>
                      <div className="element-preview">{el.content.slice(0, 50)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="progress-hint">
              <span className="torch-icon">🔥</span>
              <span>故事正在萌芽</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default App
