import React from 'react'

interface StarFieldProps {
  progress?: number // 0-100
  starCount?: number
}

/**
 * 星空背景组件
 * 随进度点亮星星，创造沉浸感
 */
export const StarField: React.FC<StarFieldProps> = ({
  progress = 0,
  starCount = 50
}) => {
  // 生成随机星星
  const stars = React.useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      brightness: Math.random() * 0.5 + 0.5,
      // 根据进度决定星星是否点亮
      isLit: (i / starCount) * 100 <= progress
    }))
  }, [starCount, progress])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full transition-all duration-1000 ${
            star.isLit
              ? 'bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]'
              : 'bg-white/10'
          }`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.isLit ? star.brightness : 0.2,
            animationDelay: `${star.delay}s`,
            transitionDelay: `${star.id * 20}ms`
          }}
        />
      ))}
    </div>
  )
}

/**
 * 王编导头像 - 呼吸灯效果 + 双星闪烁
 */
export const WangAvatar: React.FC<{ isPulsing?: boolean }> = ({ isPulsing = false }) => {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      {/* 外层光晕 */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-heropath-accent-warm/30 to-heropath-accent-gold/30 blur-md transition-opacity duration-500 ${
          isPulsing ? 'opacity-100 animate-pulse' : 'opacity-50'
        }`}
      />

      {/* 星星 1 */}
      <span
        className="absolute top-0.5 left-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.8)]"
        style={{
          animation: 'starTwinkle 2s ease-in-out infinite'
        }}
      >
        ✦
      </span>

      {/* 星星 2 */}
      <span
        className="absolute bottom-0.5 right-1 text-base text-heropath-accent-gold drop-shadow-[0_0_10px_rgba(255,217,61,0.8)]"
        style={{
          animation: 'starTwinkle 2s ease-in-out infinite 0.5s'
        }}
      >
        ✦
      </span>

      {/* 核心发光点 */}
      <div className="w-2 h-2 bg-heropath-accent-gold rounded-full shadow-[0_0_15px_rgba(255,217,61,1)]" />
    </div>
  )
}

/**
 * 心跳标记按钮
 * 用户标记创作中的"黄金时刻"
 */
export const HeartbeatButton: React.FC<{
  onHeartbeat: () => void
  isActive?: boolean
}> = ({ onHeartbeat, isActive = false }) => {
  return (
    <button
      onClick={onHeartbeat}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive
          ? 'bg-heropath-accent-warm text-white scale-110 shadow-[0_0_20px_rgba(255,107,107,0.6)]'
          : 'bg-heropath-bg-tertiary text-heropath-text-tertiary hover:text-heropath-accent-warm hover:bg-heropath-accent-warm/10'
      }`}
      title="标记心跳时刻 (Ctrl+H)"
    >
      <svg
        className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>

      {/* 波纹效果 */}
      {isActive && (
        <span className="absolute inset-0 rounded-full animate-ping bg-heropath-accent-warm/30" />
      )}
    </button>
  )
}

/**
 * 进度火炬
 * 显示故事创作进度
 */
export const ProgressTorch: React.FC<{ progress: number }> = ({ progress }) => {
  const flames = ['🔥', '🔥', '🔥', '🔥', '🔥']
  const activeFlames = Math.ceil((progress / 100) * flames.length)

  return (
    <div className="flex items-center gap-1">
      {flames.map((flame, i) => (
        <span
          key={i}
          className={`text-lg transition-all duration-500 ${
            i < activeFlames
              ? 'opacity-100 animate-flicker'
              : 'opacity-20 grayscale'
          }`}
          style={{
            animationDelay: `${i * 0.2}s`
          }}
        >
          {flame}
        </span>
      ))}
      <span className="ml-2 text-sm text-heropath-text-secondary">
        {progress}%
      </span>
    </div>
  )
}

/**
 * 打字机光标
 */
export const TypewriterCursor: React.FC = () => {
  return (
    <span
      className="inline-block w-0.5 h-5 ml-0.5 bg-heropath-accent-gold animate-pulse"
      style={{
        animation: 'blink 1s step-end infinite'
      }}
    />
  )
}
