import React, { useState, useRef, useEffect } from 'react'

interface SmartInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isTyping: boolean
  disabled?: boolean
  placeholder?: string
}

/**
 * 智能输入框
 * 支持快捷键、字数统计、自动调整高度
 */
export const SmartInput: React.FC<SmartInputProps> = ({
  value,
  onChange,
  onSend,
  isTyping,
  disabled = false,
  placeholder = '告诉王编导你的想法...'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(0)

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
    setCharCount(value.length)
  }, [value])

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 发送
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSend()
      }
    }
    // Ctrl/Cmd + Enter 换行
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onChange(value + '\n')
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="relative">
      {/* 输入框容器 */}
      <div
        className={`relative bg-heropath-bg-secondary border rounded-2xl p-1 flex items-end transition-all ${
          disabled
            ? 'border-heropath-border/50 opacity-50'
            : 'border-heropath-border focus-within:border-heropath-accent-warm focus-within:shadow-[0_0_20px_rgba(255,107,107,0.1)]'
        }`}
      >
        {/* 文本域 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none px-4 py-3 text-heropath-text-primary text-[15px] leading-relaxed resize-none max-h-[200px] font-sans focus:outline-none placeholder:text-heropath-text-tertiary/50 disabled:cursor-not-allowed"
        />

        {/* 发送按钮 */}
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`w-9 h-9 m-1 rounded-lg border-none flex items-center justify-center transition-all ${
            canSend
              ? 'bg-heropath-accent-warm text-white hover:bg-[#ff5252] hover:scale-105 hover:shadow-[0_0_15px_rgba(255,107,107,0.4)]'
              : 'bg-transparent text-heropath-text-tertiary opacity-30 cursor-not-allowed'
          }`}
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      {/* 底部提示 */}
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-heropath-text-tertiary">
          {isTyping ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-heropath-accent-gold animate-pulse" />
              王编导正在思考...
            </span>
          ) : (
            '按 Enter 发送，Shift + Enter 换行'
          )}
        </span>

        {/* 字数统计 */}
        <span
          className={`text-xs transition-colors ${
            charCount > 500
              ? 'text-heropath-accent-warm'
              : 'text-heropath-text-tertiary'
          }`}
        >
          {charCount > 0 && `${charCount}`}
        </span>
      </div>
    </div>
  )
}

/**
 * 快捷建议输入
 * 根据上下文提供输入建议
 */
interface ContextualSuggestionsProps {
  detectedType: string | null
  onSelect: (text: string) => void
}

export const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({
  detectedType,
  onSelect
}) => {
  const suggestionsByType: Record<string, string[]> = {
    lyric: ['想写一段关于...', '描述一下那个场景', '用诗意的语言表达'],
    romance: ['男女主角怎么相遇？', '他们的矛盾是什么？', '结局是HE还是BE？'],
    hero: ['主角的超能力是什么？', '他的对手是谁？', '英雄之旅的转折点？']
  }

  const defaultSuggestions = [
    '我想写一个...',
    '帮我构思一个...',
    '有个故事想法...'
  ]

  const suggestions = detectedType
    ? suggestionsByType[detectedType]
    : defaultSuggestions

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-xs bg-heropath-bg-tertiary/50 border border-heropath-border rounded-full text-heropath-text-secondary hover:bg-heropath-accent-warm/10 hover:border-heropath-accent-warm/30 hover:text-heropath-accent-warm transition-all"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
