import React from 'react'
import type { StoryElement } from '../stores'
import { ProgressTorch } from './Animations'

interface StorySidebarProps {
  elements: StoryElement[]
  onClose: () => void
  progress?: number
}

/**
 * 故事侧边栏
 * 渐进式展开故事元素
 */
export const StorySidebar: React.FC<StorySidebarProps> = ({
  elements,
  onClose,
  progress = 0
}) => {
  const typeIcons: Record<string, string> = {
    character: '👤',
    world: '🌍',
    plot: '📖',
    scene: '🎬'
  }

  const typeLabels: Record<string, string> = {
    character: '人物',
    world: '世界观',
    plot: '情节',
    scene: '场景'
  }

  return (
    <aside className="w-80 bg-heropath-bg-secondary border-l border-heropath-border flex flex-col animate-slide-in-right">
      {/* 头部 */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-heropath-border">
        <div>
          <h3 className="text-sm font-semibold text-heropath-text-secondary uppercase tracking-wider">
            故事大纲
          </h3>
          <p className="text-xs text-heropath-text-tertiary mt-1">
            {elements.length} 个元素
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md border-none bg-transparent text-heropath-text-tertiary text-xl flex items-center justify-center transition-all hover:bg-heropath-bg-tertiary hover:text-heropath-text-primary"
        >
          ×
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {elements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {elements.map((el, idx) => (
              <ElementCard
                key={idx}
                element={el}
                icon={typeIcons[el.type]}
                label={typeLabels[el.type]}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部进度 */}
      <div className="p-4 border-t border-heropath-border">
        <div className="mb-3">
          <ProgressTorch progress={progress} />
        </div>
        <p className="text-xs text-center text-heropath-text-tertiary">
          {progress < 20 && '故事正在萌芽 🌱'}
          {progress >= 20 && progress < 50 && '情节逐渐清晰 ✨'}
          {progress >= 50 && progress < 80 && '世界观成形 🌍'}
          {progress >= 80 && '即将完成 🔥'}
        </p>
      </div>
    </aside>
  )
}

/**
 * 空状态
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-10 px-5 text-heropath-text-tertiary">
      <div className="relative inline-block">
        <span className="text-5xl block mb-4 opacity-60">🌱</span>
        <span className="absolute -top-1 -right-1 text-2xl animate-pulse">✨</span>
      </div>
      <p className="text-sm leading-relaxed">
        和王编导多聊聊，<br />
        故事元素会在这里生长出来
      </p>
      <div className="mt-4 flex justify-center gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-heropath-text-tertiary/30"
            style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 元素卡片
 */
interface ElementCardProps {
  element: StoryElement
  icon: string
  label: string
  index: number
}

const ElementCard: React.FC<ElementCardProps> = ({
  element,
  icon,
  label,
  index
}) => {
  return (
    <div
      className="group flex gap-3 p-4 bg-heropath-bg-tertiary border border-heropath-border rounded-xl cursor-pointer transition-all hover:border-heropath-accent-warm hover:shadow-[0_0_15px_rgba(255,107,107,0.1)] animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 图标 */}
      <div className="w-10 h-10 bg-heropath-accent-warm/10 rounded-lg flex items-center justify-center text-xl shrink-0 group-hover:bg-heropath-accent-warm/20 transition-colors">
        {icon}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-heropath-accent-warm">{label}</span>
          <span className="text-xs text-heropath-text-tertiary">
            {new Date(element.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="text-sm font-medium text-heropath-text-primary mb-1 truncate">
          {element.title}
        </div>
        <div className="text-xs text-heropath-text-tertiary line-clamp-2">
          {element.content.slice(0, 80)}...
        </div>
      </div>

      {/* 悬停箭头 */}
      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-heropath-accent-warm">
        →
      </div>
    </div>
  )
}
