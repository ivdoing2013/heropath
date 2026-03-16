import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore, type HeartbeatType } from '../stores'

// 心跳标记类型配置
const heartbeatConfig: Record<HeartbeatType, { icon: string; label: string; color: string }> = {
  flow: { icon: '💫', label: '心流', color: 'text-amber-400' },
  emotional: { icon: '💗', label: '情感', color: 'text-pink-400' },
  golden_quote: { icon: '✨', label: '金句', color: 'text-yellow-400' },
  plot_twist: { icon: '🎭', label: '转折', color: 'text-purple-400' },
  user_marked: { icon: '📌', label: '标记', color: 'text-blue-400' }
}

// 心跳标记组件
const HeartbeatMarker = ({ 
  marker, 
  onClick 
}: { 
  marker: { id: string; type: HeartbeatType; position: number; note?: string; timestamp: number }
  onClick?: () => void 
}) => {
  const config = heartbeatConfig[marker.type]
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div 
      className="absolute right-0 -translate-y-1/2 z-10"
      style={{ top: `${marker.position}%` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        className={`
          w-6 h-6 rounded-full bg-black/60 border border-white/20 
          flex items-center justify-center text-sm
          hover:scale-110 transition-transform cursor-pointer
          ${config.color}
        `}
      >
        {config.icon}
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 p-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg text-xs z-20">
          <div className="flex items-center gap-2 mb-1">
            <span>{config.icon}</span>
            <span className="font-medium text-white/90">{config.label}</span>
            <span className="text-white/40">
              {new Date(marker.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {marker.note && (
            <p className="text-white/60 italic">"{marker.note}"</p>
          )}
        </div>
      )}
    </div>
  )
}

// 编辑器组件
const Editor = () => {
  const { 
    editor, 
    heartbeatMarkers, 
    setEditorContent, 
    setCursorPosition,
    addHeartbeat 
  } = useAppStore()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedText, setSelectedText] = useState('')
  const [showHeartbeatMenu, setShowHeartbeatMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  // 自动保存
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor.isDirty) {
        useAppStore.getState().saveEditor()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [editor.isDirty])

  // 处理文本选择
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection) return
    
    const text = selection.toString().trim()
    
    if (text && text.length > 0) {
      setSelectedText(text)
      
      // 获取选区位置
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top - 40 })
      setShowHeartbeatMenu(true)
    } else {
      setShowHeartbeatMenu(false)
    }
  }, [])

  // 添加心跳标记
  const handleAddHeartbeat = useCallback((type: HeartbeatType) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = editor.content.substring(0, cursorPosition)
    const lineCount = textBeforeCursor.split('\n').length
    const totalLines = editor.content.split('\n').length
    const positionPercent = (lineCount / Math.max(totalLines, 1)) * 100
    
    addHeartbeat({
      type,
      position: positionPercent,
      contentSnapshot: selectedText || textBeforeCursor.slice(-50),
      note: selectedText
    })
    
    setShowHeartbeatMenu(false)
    window.getSelection()?.removeAllRanges()
  }, [editor.content, selectedText, addHeartbeat])

  // 处理输入
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value)
  }, [setEditorContent])

  // 处理光标位置
  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setCursorPosition(target.selectionStart)
  }, [setCursorPosition])

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + H 添加心跳
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault()
      handleAddHeartbeat('user_marked')
    }
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      useAppStore.getState().saveEditor()
    }
  }, [handleAddHeartbeat])

  return (
    <div className="relative h-full">
      {/* 编辑器头部 */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">第 {useAppStore.getState().currentChapter} 章</span>
          <span className="text-white/20">|</span>
          <span className="text-sm text-white/40">{editor.wordCount} 字</span>
          {editor.isDirty && <span className="text-xs text-amber-400/60">●</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">
            Ctrl+H 标记心跳 · Ctrl+S 保存
          </span>
        </div>
      </div>

      {/* 编辑器主体 */}
      <div className="relative h-[calc(100%-45px)]">
        <textarea
          ref={textareaRef}
          value={editor.content}
          onChange={handleChange}
          onSelect={handleSelect}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          placeholder="开始你的创作..."
          className="w-full h-full px-6 py-4 bg-transparent text-white/90 text-[16px] leading-relaxed resize-none outline-none font-sans placeholder-white/20"
          spellCheck={false}
        />
        
        {/* 心跳标记 */}
        <div className="absolute top-4 bottom-4 right-4 w-8 pointer-events-none">
          {heartbeatMarkers.map((marker) => (
            <div key={marker.id} className="pointer-events-auto">
              <HeartbeatMarker 
                marker={marker} 
                onClick={() => {
                  // 点击跳转到对应位置
                  if (textareaRef.current) {
                    const lines = editor.content.split('\n')
                    const targetLine = Math.floor((marker.position / 100) * lines.length)
                    const position = lines.slice(0, targetLine).join('\n').length
                    textareaRef.current.setSelectionRange(position, position)
                    textareaRef.current.focus()
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 选中文字后的心跳菜单 */}
      {showHeartbeatMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowHeartbeatMenu(false)}
          />
          <div 
            className="fixed z-50 flex gap-1 p-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl"
            style={{ 
              left: menuPosition.x, 
              top: menuPosition.y,
              transform: 'translateX(-50%)'
            }}
          >
            {(Object.keys(heartbeatConfig) as HeartbeatType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAddHeartbeat(type)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-lg transition-all"
                title={heartbeatConfig[type].label}
              >
                {heartbeatConfig[type].icon}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 侧边栏故事地图
const StoryMapPanel = () => {
  const { storyElements, detectedType } = useAppStore()
  
  const typeInfo = {
    lyric: { name: '抒情散文', icon: '🌙', stages: ['意象', '情感', '升华', '回响'] },
    romance: { name: '言情', icon: '💕', stages: ['相遇', '吸引', '阻碍', '突破', '承诺'] },
    hero: { name: '英雄之旅', icon: '⚔️', stages: ['平凡', '召唤', '导师', '跨越', '磨难', '奖励', '归来'] }
  }
  
  const currentType = detectedType || 'romance'
  const info = typeInfo[currentType as keyof typeof typeInfo]

  return (
    <div className="p-4 space-y-4">
      {/* 创作类型 */}
      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{info.icon}</span>
          <span className="font-medium text-white/90">{info.name}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {info.stages.map((stage, i) => (
            <span 
              key={i} 
              className={`
                px-2 py-0.5 text-xs rounded-full
                ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40'}
              `}
            >
              {stage}
            </span>
          ))}
        </div>
      </div>

      {/* 故事元素 */}
      <div>
        <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">故事要素</h4>
        <div className="space-y-2">
          {storyElements.length === 0 ? (
            <p className="text-sm text-white/30 italic">暂无故事要素</p>
          ) : (
            storyElements.map((el, i) => (
              <div key={i} className="p-2.5 bg-white/5 rounded-lg border border-white/5 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">
                    {el.type === 'character' ? '👤' : 
                     el.type === 'world' ? '🌍' : 
                     el.type === 'plot' ? '📖' : '🎬'}
                  </span>
                  <span className="text-sm font-medium text-white/80">{el.title}</span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{el.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// 王编导对话面板
const WangDaoyanPanel = () => {
  const { messages, isTyping, addMessage, setIsTyping } = useAppStore()
  const [localInput, setLocalInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!localInput.trim() || isTyping) return

    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: localInput,
      type: 'text'
    })

    setLocalInput('')
    setIsTyping(true)

    // 模拟回复
    setTimeout(() => {
      setIsTyping(false)
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: 'wang',
        text: '这个设定很有意思，继续写下去！\n\n我注意到这段情感的转折点，要不要标记一下？',
        type: 'text'
      })
    }, 1500)
  }, [localInput, isTyping, addMessage, setIsTyping])

  const filteredMessages = messages.slice(-6) // 只显示最近6条

  return (
    <div className="flex flex-col h-full">
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'wang' ? '' : 'flex-row-reverse'}`}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0
              ${msg.sender === 'wang' 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                : 'bg-gradient-to-br from-purple-400 to-indigo-500'
              }
            `}>
              {msg.sender === 'wang' ? '王' : '你'}
            </div>
            <div className={`
              max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-xl
              ${msg.sender === 'wang' 
                ? 'bg-white/5 text-white/80 rounded-tl-sm' 
                : 'bg-purple-500/20 text-white/80 rounded-tr-sm'
              }
            `}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs shrink-0">
              王
            </div>
            <div className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl rounded-tl-sm">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="问王编导..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 outline-none focus:border-amber-400/50"
          />
          <button
            onClick={handleSend}
            disabled={!localInput.trim() || isTyping}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

// 主组件
export const CreatingState = ({
  onComplete,
  onBack
}: {
  onComplete?: () => void
  onBack?: () => void
}) => {
  const { 
    heartbeatMarkers, 
    editor, 
    chapterTitle,
    setChapterTitle,
    nextChapter
  } = useAppStore()
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // 完成本章
  const handleCompleteChapter = useCallback(() => {
    setShowCompleteModal(true)
  }, [])

  const confirmComplete = useCallback(() => {
    nextChapter()
    setShowCompleteModal(false)
    onComplete?.()
  }, [nextChapter, onComplete])

  return (
    <div className="w-full h-screen bg-gradient-radial flex overflow-hidden">
      {/* 左侧：故事地图 */}
      <aside 
        className={`
          ${leftPanelOpen ? 'w-64' : 'w-12'} 
          border-r border-white/10 bg-black/20 backdrop-blur-sm
          transition-all duration-300 flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          {leftPanelOpen && (
            <span className="text-sm font-medium text-white/70">故事地图</span>
          )}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/50"
          >
            {leftPanelOpen ? '◀' : '▶'}
          </button>
        </div>
        {leftPanelOpen && <StoryMapPanel />}
      </aside>

      {/* 中央：编辑器 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-white/50 hover:text-white/80 text-sm"
            >
              ← 返回对话
            </button>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="bg-transparent text-white/90 font-medium outline-none border-b border-transparent focus:border-amber-400/50 px-1"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400">💗</span>
              <span className="text-white/60">{heartbeatMarkers.length} 个心跳</span>
            </div>
            <button
              onClick={handleCompleteChapter}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              完成本章
            </button>
          </div>
        </header>

        {/* 编辑器 */}
        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
      </main>

      {/* 右侧：王编导 */}
      <aside 
        className={`
          ${rightPanelOpen ? 'w-72' : 'w-12'} 
          border-l border-white/10 bg-black/20 backdrop-blur-sm
          transition-all duration-300 flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          {rightPanelOpen && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                王
              </div>
              <span className="text-sm font-medium text-white/70">王编导</span>
            </div>
          )}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/50"
          >
            {rightPanelOpen ? '▶' : '◀'}
          </button>
        </div>
        {rightPanelOpen && (
          <div className="flex-1 overflow-hidden">
            <WangDaoyanPanel />
          </div>
        )}
      </aside>

      {/* 完成章节弹窗 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-full max-w-md p-6 bg-gradient-to-b from-[#1a1a3e] to-[#0f0f2e] border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-semibold text-white mb-2">本章完成！</h3>
              <p className="text-white/60">点亮一颗新的星星</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">字数</span>
                <span className="text-white/90 font-medium">{editor.wordCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">心跳时刻</span>
                <span className="text-amber-400 font-medium">{heartbeatMarkers.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-white/60">章节</span>
                <span className="text-white/90 font-medium">{chapterTitle}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 border border-white/20 text-white/80 rounded-lg hover:bg-white/5 transition-all"
              >
                继续编辑
              </button>
              <button
                onClick={confirmComplete}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                下一章
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, #1a1a3e 0%, #0f0f2e 40%, #0a0a1a 100%);
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease;
        }
      `}</style>
    </div>
  )
}

export default CreatingState
