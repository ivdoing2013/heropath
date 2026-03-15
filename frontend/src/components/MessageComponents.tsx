import React, { useState, useCallback } from 'react'
import type { Message } from '../stores'
import { WangAvatar, HeartbeatButton, TypewriterCursor } from './Animations'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onHeartbeat?: () => void
}

/**
 * 消息气泡组件
 * 支持文本、故事卡片等多种类型
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  onHeartbeat
}) => {
  const [isHeartbeated, setIsHeartbeated] = useState(false)

  const handleHeartbeat = useCallback(() => {
    setIsHeartbeated(true)
    onHeartbeat?.()
    // 3秒后重置状态
    setTimeout(() => setIsHeartbeated(false), 3000)
  }, [onHeartbeat])

  const isUser = message.sender === 'user'
  const isFirstMessage = message.id === 'welcome'

  return (
    <div
      className={`flex gap-4 animate-fade-in-up ${
        isUser ? 'flex-row-reverse items-start' : 'items-start'
      }`}
    >
      {/* 头像 */}
      {!isUser && (
        <div className="shrink-0">
          <WangAvatar isPulsing={isStreaming} />
        </div>
      )}

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[90%] ${isUser ? 'text-right' : ''}`}>
        {/* 发送者名称 */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-heropath-text-tertiary">王编导</span>
            {/* 心跳标记按钮 */}
            <HeartbeatButton
              onHeartbeat={handleHeartbeat}
              isActive={isHeartbeated}
            />
          </div>
        )}

        {/* 气泡 */}
        <div
          className={`rounded-xl text-[15px] leading-relaxed whitespace-pre-wrap relative ${
            isUser
              ? 'bg-heropath-bg-tertiary text-heropath-text-primary text-right px-4 py-3'
              : 'bg-transparent text-heropath-text-primary pl-1'
          } ${isFirstMessage ? 'first-message' : ''}`}
        >
          {message.text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}

          {/* 流式光标 */}
          {isStreaming && <TypewriterCursor />}

          {/* 心跳效果 */}
          {isHeartbeated && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2">
              <span className="text-heropath-accent-warm animate-ping">💫</span>
            </div>
          )}
        </div>

        {/* 故事卡片 */}
        {message.type === 'story-card' && message.metadata && (
          <StoryCard metadata={message.metadata} />
        )}
      </div>
    </div>
  )
}

/**
 * 故事卡片组件
 */
interface StoryCardProps {
  metadata: {
    title: string
    content: string
    type: string
  }
}

const StoryCard: React.FC<StoryCardProps> = ({ metadata }) => {
  const typeIcons: Record<string, string> = {
    character: '👤',
    world: '🌍',
    plot: '📖',
    scene: '🎬'
  }

  return (
    <div className="mt-3 bg-heropath-bg-secondary border border-heropath-border rounded-xl overflow-hidden animate-slide-in group hover:border-heropath-accent-warm/50 transition-colors">
      {/* 卡片头部 */}
      <div className="px-4 py-3 bg-heropath-accent-warm/10 border-b border-heropath-border flex items-center gap-2">
        <span className="text-lg">{typeIcons[metadata.type] || '📋'}</span>
        <span className="text-sm font-medium text-heropath-accent-warm">
          {metadata.title}
        </span>
      </div>

      {/* 卡片内容 */}
      <div className="p-4 text-sm text-heropath-text-secondary leading-relaxed">
        {metadata.content.split('\n').map((line: string, i: number) => (
          <div
            key={i}
            className="flex items-start gap-2 py-1 group-hover:translate-x-1 transition-transform"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <span className="text-heropath-accent-gold mt-1">•</span>
            <span>{line.replace('•', '').trim()}</span>
          </div>
        ))}
      </div>

      {/* 卡片底部装饰 */}
      <div className="px-4 py-2 bg-heropath-bg-tertiary/50 flex justify-between items-center">
        <span className="text-xs text-heropath-text-tertiary">
          故事元素 #{Math.floor(Math.random() * 1000)}
        </span>
        <button className="text-xs text-heropath-accent-warm hover:underline">
          编辑
        </button>
      </div>
    </div>
  )
}

/**
 * 打字指示器
 */
export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-4 items-start animate-fade-in-up">
      <div className="shrink-0">
        <WangAvatar isPulsing={true} />
      </div>
      <div className="flex-1 max-w-[90%]">
        <div className="text-xs text-heropath-text-tertiary mb-1 pl-1">王编导</div>
        <div className="flex gap-1 px-4 py-4">
          <span
            className="w-2 h-2 bg-heropath-accent-gold rounded-full"
            style={{ animation: 'typingBounce 1.4s ease-in-out infinite both', animationDelay: '-0.32s' }}
          />
          <span
            className="w-2 h-2 bg-heropath-accent-gold rounded-full"
            style={{ animation: 'typingBounce 1.4s ease-in-out infinite both', animationDelay: '-0.16s' }}
          />
          <span
            className="w-2 h-2 bg-heropath-accent-gold rounded-full"
            style={{ animation: 'typingBounce 1.4s ease-in-out infinite both' }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 快捷输入建议
 */
interface QuickSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  suggestions,
  onSelect
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-sm bg-heropath-bg-tertiary/50 border border-heropath-border rounded-full text-heropath-text-secondary hover:bg-heropath-accent-warm/10 hover:border-heropath-accent-warm/30 hover:text-heropath-accent-warm transition-all animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
