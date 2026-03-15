import { useRef, useEffect, useCallback } from 'react'
import './App.css'
import { useChatStore, type Message } from './stores'
import { chatWithWangDaoyan, mockChatWithWangDaoyan, checkBackendHealth, type ChatMessage } from './utils/aiService'

function App() {
  // 从 Zustand Store 获取状态和操作
  const {
    messages,
    inputText,
    isTyping,
    streamingText,
    storyElements,
    showSidebar,
    conversationTurn,
    detectedType,
    backendAvailable,
    addMessage,
    setInputText,
    clearInput,
    setIsTyping,
    setStreamingText,
    addStoryElement,
    setShowSidebar,
    incrementTurn,
    setDetectedType,
    setBackendAvailable
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [setBackendAvailable])

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
      let response: { text: string; storyType?: 'lyric' | 'romance' | 'hero' | null; shouldGenerateCard?: boolean; cardType?: 'character' | 'world' | 'plot' }

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

      addMessage(wangMessage)
      incrementTurn()

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
      addMessage({
        id: Date.now().toString(),
        sender: 'wang',
        text: '（王编导似乎在思考...能再说一遍吗？）',
        type: 'text'
      })
    } finally {
      setIsTyping(false)
      setStreamingText('')
    }
  }

  // 生成故事卡片
  const generateStoryCard = (response: { cardType?: 'character' | 'world' | 'plot' }) => {
    const elementType: 'character' | 'world' | 'plot' | 'scene' = response.cardType === 'character' ? 'character' : 'plot'
    const newElement = {
      type: elementType,
      title: response.cardType === 'character' ? '人物速写' : '故事要素',
      content: '根据我们的对话，这是一个关于\n• 主角在困境中寻找自我\n• 情感复杂而真实\n• 有强烈的成长弧光',
      timestamp: Date.now()
    }

    addStoryElement(newElement)
    setShowSidebar(true)

    // 添加卡片消息
    addMessage({
      id: (Date.now() + 1).toString(),
      sender: 'wang',
      text: '我整理了一下我们聊的内容，你看看这个方向对吗？',
      type: 'story-card',
      metadata: newElement
    })
  }

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      type: 'text'
    }

    addMessage(userMessage)
    const currentInput = inputText
    clearInput()

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
    <div className="flex h-screen w-screen bg-heropath-bg-primary">
      {/* 主对话区域 */}
      <main className={`flex-1 flex flex-col relative transition-all duration-300 ${showSidebar ? 'w-[calc(100%-320px)]' : 'w-full'}`}>
        {/* 顶部导航 */}
        <header className="flex justify-between items-center px-5 py-3 border-b border-heropath-border bg-heropath-bg-primary">
          <div className="flex items-center gap-2.5 text-lg font-semibold">
            <span className="text-xl animate-gentle-pulse">✨</span>
            <span className="text-gradient-warm">HeroPath</span>
          </div>
          <div className="flex gap-2 items-center">
            {detectedType && (
              <div className="px-3 py-1.5 bg-heropath-accent-warm/20 border border-heropath-accent-warm/40 rounded-full text-sm text-heropath-accent-warm font-medium">
                {getTypeLabel(detectedType)?.emoji} {getTypeLabel(detectedType)?.text}
              </div>
            )}
            <button className="w-9 h-9 rounded-lg border border-heropath-border bg-transparent text-heropath-text-secondary flex items-center justify-center text-lg transition-all hover:bg-heropath-bg-tertiary hover:text-heropath-text-primary" title="新建故事">+</button>
          </div>
        </header>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto py-5">
          <div className="max-w-3xl mx-auto px-5 flex flex-col gap-6">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-4 animate-fade-in-up ${msg.sender === 'wang' ? 'items-start' : 'flex-row-reverse items-start'} ${index === 0 ? 'first-message' : ''}`}
              >
                {msg.sender === 'wang' && (
                  <div className="w-9 h-9 shrink-0 relative">
                    <div className="w-full h-full relative flex items-center justify-center">
                      <span className="absolute top-0.5 left-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-twinkle">✦</span>
                      <span className="absolute bottom-0.5 right-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-twinkle [animation-delay:0.5s]">✦</span>
                    </div>
                  </div>
                )}

                <div className={`flex-1 max-w-[90%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.sender === 'wang' && (
                    <div className="text-xs text-heropath-text-tertiary mb-1 pl-1">王编导</div>
                  )}
                  <div className={`rounded-xl text-[15px] leading-relaxed whitespace-pre-wrap ${msg.sender === 'wang' ? 'bg-transparent text-heropath-text-primary pl-1' : 'bg-heropath-bg-tertiary text-heropath-text-primary text-right px-4 py-3'} ${msg.type || 'text'}`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>

                  {/* 故事卡片展示 */}
                  {msg.type === 'story-card' && msg.metadata && (
                    <div className="mt-3 bg-heropath-bg-secondary border border-heropath-border rounded-xl overflow-hidden animate-slide-in">
                      <div className="px-4 py-3 bg-heropath-accent-warm/10 border-b border-heropath-border flex items-center gap-2 text-sm font-medium text-heropath-accent-warm">
                        <span>📋</span>
                        <span>{msg.metadata.title}</span>
                      </div>
                      <div className="p-4 text-sm text-heropath-text-secondary leading-relaxed">
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
              <div className="flex gap-4 items-start animate-fade-in-up">
                <div className="w-9 h-9 shrink-0 relative">
                  <div className="w-full h-full relative flex items-center justify-center">
                    <span className="absolute top-0.5 left-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-pulse">✦</span>
                    <span className="absolute bottom-0.5 right-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-pulse">✦</span>
                  </div>
                </div>
                <div className="flex-1 max-w-[90%]">
                  <div className="text-xs text-heropath-text-tertiary mb-1 pl-1">王编导</div>
                  <div className="rounded-xl text-[15px] leading-relaxed whitespace-pre-wrap bg-transparent text-heropath-text-primary pl-1">
                    {streamingText}
                    <span className="animate-cursor-blink text-heropath-accent-gold ml-0.5">▊</span>
                  </div>
                </div>
              </div>
            )}

            {/* 思考中 */}
            {isTyping && !streamingText && (
              <div className="flex gap-4 items-start animate-fade-in-up">
                <div className="w-9 h-9 shrink-0 relative">
                  <div className="w-full h-full relative flex items-center justify-center">
                    <span className="absolute top-0.5 left-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-pulse">✦</span>
                    <span className="absolute bottom-0.5 right-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.5)] animate-star-pulse">✦</span>
                  </div>
                </div>
                <div className="flex-1 max-w-[90%]">
                  <div className="text-xs text-heropath-text-tertiary mb-1 pl-1">王编导</div>
                  <div className="flex gap-1 px-4 py-4 bg-transparent">
                    <span className="w-2 h-2 bg-heropath-accent-gold rounded-full animate-typing-bounce [animation-delay:-0.32s]"></span>
                    <span className="w-2 h-2 bg-heropath-accent-gold rounded-full animate-typing-bounce [animation-delay:-0.16s]"></span>
                    <span className="w-2 h-2 bg-heropath-accent-gold rounded-full animate-typing-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-5 bg-heropath-bg-primary border-t border-heropath-border">
          <div className="max-w-3xl mx-auto relative bg-heropath-bg-secondary border border-heropath-border rounded-2xl p-1 flex items-end transition-colors focus-within:border-heropath-accent-warm">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="告诉王编导你的想法..."
              rows={1}
              className="flex-1 bg-transparent border-none px-4 py-3 text-heropath-text-primary text-[15px] leading-relaxed resize-none max-h-[200px] font-sans focus:outline-none placeholder:text-heropath-text-tertiary"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              className={`w-9 h-9 m-1 rounded-lg border-none flex items-center justify-center transition-all ${inputText.trim() && !isTyping ? 'bg-heropath-accent-warm text-white hover:bg-[#ff5252] hover:scale-105' : 'bg-transparent text-heropath-text-tertiary opacity-30 cursor-not-allowed'}`}
              disabled={!inputText.trim() || isTyping}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center text-xs text-heropath-text-tertiary">
            {isTyping ? '王编导正在思考...' : '按 Enter 发送，Shift + Enter 换行'}
          </div>
        </div>
      </main>

      {/* 侧边栏 - 故事元素（渐进展开） */}
      {showSidebar && (
        <aside className="w-80 bg-heropath-bg-secondary border-l border-heropath-border flex flex-col animate-slide-in-right">
          <div className="flex justify-between items-center px-5 py-4 border-b border-heropath-border">
            <h3 className="text-sm font-semibold text-heropath-text-secondary uppercase tracking-wider">故事大纲</h3>
            <button className="w-7 h-7 rounded-md border-none bg-transparent text-heropath-text-tertiary text-xl flex items-center justify-center transition-all hover:bg-heropath-bg-tertiary hover:text-heropath-text-primary" onClick={() => setShowSidebar(false)}>×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {storyElements.length === 0 ? (
              <div className="text-center py-10 px-5 text-heropath-text-tertiary">
                <span className="text-5xl block mb-4 opacity-60">🌱</span>
                <p className="text-sm leading-relaxed">和王编导多聊聊，故事元素会在这里生长出来</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {storyElements.map((el, idx) => (
                  <div key={idx} className={`flex gap-3 p-4 bg-heropath-bg-tertiary border border-heropath-border rounded-xl cursor-pointer transition-all hover:border-heropath-accent-warm hover:translate-x-1 ${el.type}`}>
                    <div className="w-10 h-10 bg-heropath-accent-warm/10 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {el.type === 'character' && '👤'}
                      {el.type === 'world' && '🌍'}
                      {el.type === 'plot' && '📖'}
                      {el.type === 'scene' && '🎬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-heropath-text-primary mb-1">{el.title}</div>
                      <div className="text-xs text-heropath-text-tertiary truncate">{el.content.slice(0, 50)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-heropath-border">
            <div className="flex items-center justify-center gap-2 text-sm text-heropath-text-secondary">
              <span className="text-base animate-flicker">🔥</span>
              <span>故事正在萌芽</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default App
