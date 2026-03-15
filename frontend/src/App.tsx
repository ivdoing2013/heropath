import { useState, useRef, useEffect } from 'react'
import './App.css'

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
      text: '你好，我是王编导。✨\n\n我见过太多故事胎死腹中——不是才华不够，是方向不清。\n\n告诉我，你想讲一个什么样的故事？',
      type: 'text'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [storyElements, setStoryElements] = useState<StoryElement[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 模拟王编导思考并回复
  const simulateWangResponse = async (userInput: string) => {
    setIsTyping(true)
    
    // 模拟思考时间
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 根据用户输入生成回复（简化版，实际应该调用AI）
    const responses = [
      '有意思的想法...让我帮你梳理一下。这个故事的核心冲突是什么？',
      '我感受到了！主人公的内心挣扎很关键。能再多说说TA的处境吗？',
      '这是个很好的起点。你觉得这个故事最打动人的瞬间会是什么？',
      '明白了。让我为你整理一下刚才的灵感...',
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    // 如果是第三次对话，展示一个故事卡片
    if (messages.length >= 4 && storyElements.length === 0) {
      const newElement: StoryElement = {
        type: 'character',
        title: '主人公设定',
        content: '根据你的描述，这是一个在困境中寻找自我的人物...',
        timestamp: Date.now()
      }
      setStoryElements([newElement])
      setShowSidebar(true)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'wang',
        text: '我根据你的描述，初步梳理了主人公的轮廓。你可以随时调整。',
        type: 'story-card',
        metadata: newElement
      }])
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'wang',
        text: randomResponse,
        type: 'text'
      }])
    }
    
    setIsTyping(false)
  }

  const handleSend = async () => {
    if (!inputText.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      type: 'text'
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    
    await simulateWangResponse(inputText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
            <button className="icon-btn" title="新建故事">+</button>
            <button className="icon-btn" title="设置">⚙️</button>
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
                        <span className="card-icon">👤</span>
                        <span>{msg.metadata.title}</span>
                      </div>
                      <div className="card-body">
                        {msg.metadata.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
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
            />
            <button 
              onClick={handleSend} 
              className={`send-btn ${inputText.trim() ? 'active' : ''}`}
              disabled={!inputText.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="input-hint">
            按 Enter 发送，Shift + Enter 换行
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
