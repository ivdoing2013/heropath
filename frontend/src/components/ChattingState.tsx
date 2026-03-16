import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore, type Message, type StoryElement } from '../stores'
import { 
  chatWithWangDaoyan, 
  clearChatHistory,
  SKILL_TREE,
  calculateProgress,
  getCurrentSkillNode,
  type SkillNode
} from '../utils/aiService'

// 消息气泡组件
const MessageBubble = ({ 
  message, 
  isLast,
  onSuggestionClick
}: { 
  message: Message
  isLast: boolean
  onSuggestionClick?: (suggestion: string) => void
}) => {
  const isWang = message.sender === 'wang'
  
  return (
    <div 
      className={`
        flex gap-3 md:gap-4 animate-fade-in-up
        ${isWang ? 'items-start' : 'flex-row-reverse items-start'}
      `}
    >
      {/* 头像 */}
      {isWang && (
        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="9" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
      )}
      
      {!isWang && (
        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
      )}

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[85%] md:max-w-[80%] ${isWang ? '' : 'text-right'}`}>
        {/* 发送者名称 */}
        <div className={`text-xs mb-1 ${isWang ? 'text-amber-400/70' : 'text-purple-400/70'}`}>
          {isWang ? '王编导' : '你'}
        </div>
        
        {/* 气泡 */}
        <div 
          className={`
            inline-block rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap
            ${isWang 
              ? 'bg-white/5 text-white/90 rounded-tl-sm border border-white/10' 
              : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white/90 rounded-tr-sm border border-purple-500/20'
            }
          `}
        >
          {message.text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* 故事卡片 */}
        {message.type === 'story-card' && message.metadata && (
          <StoryCard metadata={message.metadata} />
        )}

        {/* 技能解锁卡片 */}
        {message.type === 'skill-unlock' && message.metadata && (
          <SkillUnlockCard node={message.metadata} />
        )}

        {/* 建议回复按钮 */}
        {isWang && isLast && message.metadata?.suggestions && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.metadata.suggestions.map((suggestion: string, i: number) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-full text-xs text-white/70 hover:text-white transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 故事卡片组件
const StoryCard = ({ metadata }: { metadata: { type: string; title: string; content: string } }) => {
  const icons: Record<string, string> = {
    character: '👤',
    world: '🌍',
    plot: '📖',
    scene: '🎬'
  }

  return (
    <div className="mt-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl overflow-hidden animate-slide-in">
      <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-sm font-medium text-amber-400">
        <span>{icons[metadata.type] || '✨'}</span>
        <span>{metadata.title}</span>
      </div>
      <div className="p-4 text-sm text-white/70 leading-relaxed">
        {metadata.content.split('\n').map((line: string, i: number) => (
          <div key={i} className={line.startsWith('•') ? 'ml-4' : ''}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

// 技能解锁卡片
const SkillUnlockCard = ({ node }: { node: SkillNode }) => {
  return (
    <div className="mt-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl overflow-hidden animate-pulse-glow">
      <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">{node.icon}</span>
          <div>
            <div className="text-sm font-medium text-purple-300">技能解锁</div>
            <div className="text-xs text-white/50">{node.nameEn}</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-lg font-medium text-white/90 mb-1">{node.name}</div>
        <p className="text-sm text-white/60">{node.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
          <span>✨</span>
          <span>已解锁创作节点 #{node.number}/12</span>
        </div>
      </div>
    </div>
  )
}

// 流式输出组件
const StreamingMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex gap-3 md:gap-4 items-start animate-fade-in-up">
      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 md:w-6 md:h-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="9" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>
      
      <div className="flex-1 max-w-[85%] md:max-w-[80%]">
        <div className="text-xs mb-1 text-amber-400/70">王编导</div>
        <div className="inline-block rounded-2xl px-4 py-3 text-[15px] leading-relaxed bg-white/5 text-white/90 rounded-tl-sm border border-white/10">
          {text}
          <span className="inline-block w-0.5 h-5 bg-amber-400 ml-1 animate-cursor-blink" />
        </div>
      </div>
    </div>
  )
}

// 思考中动画
const ThinkingIndicator = () => {
  return (
    <div className="flex gap-3 md:gap-4 items-start animate-fade-in-up">
      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 md:w-6 md:h-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="9" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>
      
      <div className="flex-1 max-w-[85%] md:max-w-[80%]">
        <div className="text-xs mb-1 text-amber-400/70">王编导</div>
        <div className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// 技能进度条
const SkillProgressBar = ({ 
  progress, 
  currentNode
}: { 
  progress: number
  currentNode: SkillNode | null
}) => {
  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="flex justify-between items-center mb-2 text-xs text-white/50">
        <span>创作进度</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {currentNode && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span>{currentNode.icon}</span>
          <span className="text-white/60">当前: {currentNode.name}</span>
        </div>
      )}
    </div>
  )
}

// 侧边栏故事元素卡片
const StoryElementCard = ({ 
  element, 
  index 
}: { 
  element: StoryElement
  index: number 
}) => {
  const icons: Record<string, string> = {
    character: '👤',
    world: '🌍',
    plot: '📖',
    scene: '🎬'
  }

  return (
    <div 
      className="group flex gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl cursor-pointer transition-all hover:translate-x-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
        {icons[element.type] || '✨'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/90 mb-0.5">{element.title}</div>
        <div className="text-xs text-white/50 line-clamp-2">{element.content}</div>
      </div>
    </div>
  )
}

// 主组件
export const ChattingState = ({
  onStartCreating
}: {
  onStartCreating?: () => void
}) => {
  const {
    messages,
    inputText,
    isTyping,
    streamingText,
    storyElements,
    showSidebar,
    detectedType,
    stars,
    unlockedStarCount,
    conversationTurn,
    wangDaoyan,
    addMessage,
    setInputText,
    clearInput,
    setIsTyping,
    setStreamingText,
    setWangDaoyanStatus,
    toggleSidebar,
    setShowSidebar,
    incrementTurn,
    addStoryElement,
    setDetectedType,
    unlockStar
  } = useAppStore()

  const [completedSkills, setCompletedSkills] = useState(0)
  const [backendError, setBackendError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 计算当前进度
  const progress = calculateProgress(conversationTurn, storyElements.length)
  const currentSkillNode = getCurrentSkillNode(completedSkills)

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // 根据进度解锁星星和技能
  useEffect(() => {
    // 解锁星星
    const targetUnlockCount = Math.floor(progress * stars.length)
    if (targetUnlockCount > unlockedStarCount) {
      unlockStar(unlockedStarCount)
    }

    // 解锁技能节点
    const newCompletedSkills = SKILL_TREE.filter(n => progress >= n.requiredProgress).length
    if (newCompletedSkills > completedSkills) {
      setCompletedSkills(newCompletedSkills)
      // 发送技能解锁消息
      const unlockedNode = SKILL_TREE.find(n => n.number === newCompletedSkills)
      if (unlockedNode) {
        addMessage({
          id: `skill_${Date.now()}`,
          sender: 'wang',
          text: `太好了！我们的讨论已经触达了「${unlockedNode.name}」这个层面。${unlockedNode.description}`,
          type: 'skill-unlock',
          metadata: unlockedNode
        })
      }
    }
  }, [progress, stars.length, unlockedStarCount, completedSkills, unlockStar, addMessage])

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [inputText])

  // 组件挂载时清空历史
  useEffect(() => {
    clearChatHistory()
  }, [])

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isTyping) return

    setBackendError(null)
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      type: 'text'
    }

    addMessage(userMessage)
    clearInput()
    setIsTyping(true)
    setStreamingText('')
    setWangDaoyanStatus('thinking')

    try {
      // 调用 AI 服务
      const response = await chatWithWangDaoyan(
        userMessage.text,
        (streamText) => {
          setStreamingText(streamText)
          setWangDaoyanStatus('responding')
        }
      )

      setStreamingText('')
      setIsTyping(false)

      // 检测故事类型
      if (response.storyType && !detectedType) {
        setDetectedType(response.storyType)
      }

      // 添加王编导回复
      const turn = incrementTurn()
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: 'wang',
        text: response.text,
        type: 'text',
        metadata: { 
          suggestions: response.suggestedResponses,
          turn 
        }
      })

      // 处理故事元素
      if (response.storyElement) {
        setTimeout(() => {
          addStoryElement({
            ...response.storyElement!,
            timestamp: Date.now()
          })
          setShowSidebar(true)
          
          addMessage({
            id: (Date.now() + 2).toString(),
            sender: 'wang',
            text: '我整理了一下我们聊的内容，你看看这个方向对吗？',
            type: 'story-card',
            metadata: response.storyElement
          })
        }, 500)
      }

      // 检查是否需要跳转到创作状态
      if (response.shouldTransition && response.transitionTo === 'creating') {
        setTimeout(() => {
          onStartCreating?.()
        }, 2000)
      }

      setWangDaoyanStatus('waiting')

    } catch (error) {
      console.error('Chat error:', error)
      setBackendError('连接遇到问题，请重试')
      setIsTyping(false)
      setStreamingText('')
      setWangDaoyanStatus('waiting')
      
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: 'wang',
        text: '抱歉，刚才走神了...能再说一遍吗？',
        type: 'text'
      })
    }
  }, [
    inputText, isTyping, addMessage, clearInput, setIsTyping, setStreamingText,
    setWangDaoyanStatus, incrementTurn, detectedType, setDetectedType,
    addStoryElement, setShowSidebar, onStartCreating
  ])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputText(suggestion)
    textareaRef.current?.focus()
  }, [setInputText])

  const getTypeLabel = (type: string | null) => {
    const labels: Record<string, { text: string; emoji: string; color: string }> = {
      lyric: { text: '抒情散文', emoji: '🌙', color: 'text-blue-300' },
      romance: { text: '男欢女爱', emoji: '💕', color: 'text-pink-300' },
      hero: { text: '英雄之旅', emoji: '⚔️', color: 'text-amber-300' }
    }
    return type ? labels[type] : null
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-radial flex">
      {/* 背景星空 */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute rounded-full transition-all duration-1000 ${
              star.state === 'dim' ? 'animate-twinkle-dim' : 
              star.state === 'glowing' ? 'animate-twinkle-glow' : 
              'animate-twinkle-bright'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.state === 'dim' 
                ? 'rgba(255, 255, 255, 0.4)' 
                : 'linear-gradient(135deg, #ffd93d, #ff6b6b)',
              boxShadow: star.state !== 'dim' 
                ? `0 0 ${star.size * 3}px rgba(255, 217, 61, 0.5)` 
                : 'none',
              opacity: star.brightness
            }}
          />
        ))}
      </div>

      {/* 主内容区 */}
      <main className={`flex-1 flex flex-col relative transition-all duration-500 ${showSidebar ? 'lg:mr-80' : ''}`}>
        {/* 顶部导航 */}
        <header className="flex justify-between items-center px-4 md:px-6 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-pulse-slow">✨</span>
            <span className="text-lg font-semibold text-gradient-warm">HeroPath</span>
          </div>
          
          <div className="flex items-center gap-3">
            {detectedType && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-sm">
                <span>{getTypeLabel(detectedType)?.emoji}</span>
                <span className={getTypeLabel(detectedType)?.color}>
                  {getTypeLabel(detectedType)?.text}
                </span>
              </div>
            )}
            
            {/* 侧边栏切换按钮 */}
            <button
              onClick={toggleSidebar}
              className={`
                w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all
                ${showSidebar 
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }
              `}
            >
              📋
            </button>
            
            {/* 开始创作按钮 */}
            {progress > 0.3 && (
              <button
                onClick={onStartCreating}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                <span>✍️</span>
                <span>开始创作</span>
              </button>
            )}
          </div>
        </header>

        {/* 技能进度条 */}
        <div className="px-4 py-2 bg-black/10 backdrop-blur-sm">
          <SkillProgressBar 
            progress={progress} 
            currentNode={currentSkillNode}
          />
        </div>

        {/* 错误提示 */}
        {backendError && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm text-center">
            {backendError}
          </div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto py-4 md:py-6">
          <div className="max-w-3xl mx-auto px-4 md:px-6 flex flex-col gap-4 md:gap-6">
            {messages.map((msg, index) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isLast={index === messages.length - 1}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}

            {/* 流式输出 */}
            {isTyping && streamingText && (
              <StreamingMessage text={streamingText} />
            )}

            {/* 思考中 */}
            {isTyping && !streamingText && <ThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-4 md:p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {/* 建议回复 */}
            {messages.length > 1 && messages.length < 5 && !isTyping && (
              <div className="flex flex-wrap gap-2 mb-3">
                {['关于一个重逢的故事', '一个英雄的冒险旅程', '一段复杂的感情纠葛', '一个奇幻的世界'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-full text-xs text-white/60 hover:text-white transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            <div className="relative bg-white/5 border border-white/10 focus-within:border-amber-400/50 rounded-2xl transition-all">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={wangDaoyan.status === 'thinking' ? '王编导正在思考...' : '告诉王编导你的想法...'}
                rows={1}
                className="w-full px-4 py-3.5 bg-transparent text-white placeholder-white/40 text-[15px] leading-relaxed resize-none outline-none rounded-2xl min-h-[52px]"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2
                  w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${inputText.trim() && !isTyping
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-amber-500/30 hover:scale-105' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }
                `}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-white/40">
              <span>{isTyping ? '王编导正在思考...' : '按 Enter 发送，Shift + Enter 换行'}</span>
              {progress > 0.3 && (
                <button
                  onClick={onStartCreating}
                  className="md:hidden text-amber-400 hover:text-amber-300"
                >
                  开始创作 →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 侧边栏 */}
      {showSidebar && (
        <>
          {/* 移动端遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* 侧边栏内容 */}
          <aside className="fixed right-0 top-0 bottom-0 w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col z-50 lg:absolute animate-slide-in-right">
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">故事大纲</h3>
              <button 
                onClick={() => setShowSidebar(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                ×
              </button>
            </div>

            {/* 技能进度 */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-xs text-white/50 mb-2">创作节点 {completedSkills}/12</div>
              <div className="flex flex-wrap gap-1">
                {SKILL_TREE.map((node) => (
                  <div 
                    key={node.id}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      ${node.number <= completedSkills 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'bg-white/5 text-white/30'
                      }
                    `}
                    title={`${node.name}: ${node.description}`}
                  >
                    {node.number <= completedSkills ? node.icon : node.number}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {storyElements.length === 0 ? (
                <div className="text-center py-10 text-white/40">
                  <span className="text-4xl block mb-3">🌱</span>
                  <p className="text-sm">和王编导多聊聊，<br />故事元素会在这里生长出来</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {storyElements.map((el, idx) => (
                    <StoryElementCard key={idx} element={el} index={idx} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                <span className="animate-pulse">🔥</span>
                <span>{progress > 0.3 ? '准备开始创作' : '故事正在萌芽'}</span>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* CSS动画 */}
      <style>{`
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, #1a1a3e 0%, #0f0f2e 40%, #0a0a1a 100%);
        }
        
        .text-gradient-warm {
          background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes twinkle-dim {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes twinkle-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes twinkle-bright {
          0%, 100% { opacity: 0.8; transform: scale(1.2); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.4s ease; }
        .animate-slide-in { animation: slide-in 0.3s ease; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease; }
        .animate-cursor-blink { animation: cursor-blink 1s step-end infinite; }
        .animate-twinkle-dim { animation: twinkle-dim 4s ease-in-out infinite; }
        .animate-twinkle-glow { animation: twinkle-glow 3s ease-in-out infinite; }
        .animate-twinkle-bright { animation: twinkle-bright 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default ChattingState
