import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../stores'

// 星星组件
interface StarProps {
  x: number
  y: number
  size: number
  brightness: number
  twinkleSpeed: number
  state: 'dim' | 'glowing' | 'bright' | 'sparkling'
  delay: number
}

const Star = ({ x, y, size, brightness, twinkleSpeed, state, delay }: StarProps) => {
  const getOpacity = () => {
    switch (state) {
      case 'sparkling':
        return 1
      case 'bright':
        return 0.9
      case 'glowing':
        return 0.7
      default:
        return brightness
    }
  }

  const getAnimationStyle = () => {
    const baseDuration = twinkleSpeed || 4000
    switch (state) {
      case 'sparkling':
        return `star-sparkle ${baseDuration}ms ease-in-out infinite`
      case 'bright':
        return `star-bright ${baseDuration}ms ease-in-out infinite`
      case 'glowing':
        return `star-glow ${baseDuration}ms ease-in-out infinite`
      default:
        return `star-dim ${baseDuration}ms ease-in-out infinite`
    }
  }

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: state === 'dim' 
          ? 'rgba(255, 255, 255, 0.6)' 
          : 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 50%, #fff 100%)',
        boxShadow: state !== 'dim' 
          ? `0 0 ${size * 2}px rgba(255, 217, 61, 0.6), 0 0 ${size * 4}px rgba(255, 107, 107, 0.4)` 
          : 'none',
        opacity: getOpacity(),
        animation: getAnimationStyle(),
        animationDelay: `${delay}ms`
      }}
    />
  )
}

// 王编导头像组件
const WangDaoyanAvatar = ({ 
  status, 
  onClick 
}: { 
  status: 'waiting' | 'listening' | 'thinking' | 'responding' | 'celebrating'
  onClick?: () => void 
}) => {
  const getStatusAnimation = () => {
    switch (status) {
      case 'listening':
        return 'animate-listening'
      case 'thinking':
        return 'animate-thinking'
      case 'responding':
        return 'animate-responding'
      case 'celebrating':
        return 'animate-celebrating'
      default:
        return 'animate-breathe'
    }
  }

  return (
    <div 
      className={`relative cursor-pointer transition-transform hover:scale-105 ${getStatusAnimation()}`}
      onClick={onClick}
    >
      {/* 外层光晕 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/30 via-orange-500/30 to-amber-400/30 blur-xl animate-pulse-slow" />
      
      {/* 中层光晕 */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-amber-400/20 blur-lg animate-glow-rotate" />
      
      {/* 头像容器 */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 50%, #ff9f43 100%)' }}>
        {/* 王编导简笔插画 */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-16 h-16 md:w-20 md:h-20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* 头部轮廓 */}
          <circle cx="50" cy="35" r="20" className="text-white/90" />
          {/* 眼睛 */}
          <circle cx="43" cy="32" r="2" className="text-white/90" fill="currentColor" />
          <circle cx="57" cy="32" r="2" className="text-white/90" fill="currentColor" />
          {/* 微笑 */}
          <path d="M43 42 Q50 48 57 42" className="text-white/90" />
          {/* 身体 */}
          <path d="M30 80 Q50 55 70 80" className="text-white/70" />
          {/* 衣领 */}
          <path d="M40 58 L50 65 L60 58" className="text-white/80" />
          {/* 火把 - 在王编导下方 */}
          <line x1="50" y1="80" x2="50" y2="95" className="text-amber-200" strokeWidth="3" />
        </svg>
      </div>
      
      {/* 火把火焰 */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
        <div className="relative">
          {/* 火焰外层 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-sm animate-flame-dance opacity-80" />
          {/* 火焰内层 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-5 bg-gradient-to-t from-amber-300 via-yellow-200 to-white rounded-full animate-flame-dance-slow" />
          {/* 火星粒子 */}
          <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-amber-300 rounded-full animate-spark-1" />
          <div className="absolute bottom-3 left-1/3 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-spark-2" />
          <div className="absolute bottom-2 right-1/3 w-0.5 h-0.5 bg-orange-300 rounded-full animate-spark-3" />
        </div>
      </div>
    </div>
  )
}

// 主组件
export const EmptyState = ({ onStart }: { onStart?: () => void }) => {
  const { stars, wangDaoyan, messages, setWangDaoyanStatus, setUIState, inputText, setInputText, initApp } = useAppStore()
  const [isFocused, setIsFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  
  const placeholders = [
    '想写什么？告诉我...',
    '一个故事想法、一个场景、一种情绪...',
    '比如：关于重逢的言情故事...',
    '或者：一个英雄踏上旅程的传说...'
  ]

  // 轮播placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // 初始化星空
  useEffect(() => {
    const { generateStars, stars } = useAppStore.getState()
    if (stars.length === 0) {
      generateStars(60)
    }
  }, [])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setWangDaoyanStatus('listening')
  }, [setWangDaoyanStatus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    if (!inputText) {
      setWangDaoyanStatus('waiting')
    }
  }, [inputText, setWangDaoyanStatus])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }, [setInputText])

  const handleStart = useCallback(() => {
    if (inputText.trim()) {
      initApp()
      setUIState('chatting')
      onStart?.()
    }
  }, [inputText, initApp, setUIState, onStart])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleStart()
    }
  }, [inputText, handleStart])

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0f0f2e 40%, #0a0a1a 100%)' }}>
      {/* 星空背景 */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0f0f2e 40%, #0a0a1a 100%)' }}>
        {/* 星星层 */}
        <div className="absolute inset-0">
          {stars.map((star, index) => (
            <Star
              key={star.id}
              x={star.x}
              y={star.y}
              size={star.size}
              brightness={star.brightness}
              twinkleSpeed={star.twinkleSpeed}
              state={star.state}
              delay={index * 100}
            />
          ))}
        </div>
        
        {/* 微妙的星云效果 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* 左下角对话记录区 */}
      <div className="absolute bottom-6 left-6 z-20 w-1/3 max-h-[40vh] overflow-y-auto bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">对话记录</h3>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-white/30 text-base italic">还没有对话记录...</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`text-base leading-relaxed ${msg.sender === 'wang' ? 'text-amber-400/90' : 'text-white/80'}`}>
                <span className="text-white/50 text-sm font-medium mr-2">{msg.sender === 'wang' ? '王编导' : '你'}:</span>
                {msg.text.slice(0, 120)}{msg.text.length > 120 ? '...' : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右上角状态栏 */}
      <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white/50 text-xs">当前状态</div>
            <div className="text-white/90 text-sm font-medium">{wangDaoyan.status === 'waiting' ? '等待输入' : wangDaoyan.status === 'listening' ? '倾听中' : '思考中'}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="9" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 左上角偏右 - 王编导头像 */}
      <div className="absolute top-6 left-24 z-20">
        <WangDaoyanAvatar 
          status={wangDaoyan.status} 
          onClick={() => setWangDaoyanStatus('thinking')}
        />
      </div>

      {/* 内容层 - 欢迎语居中 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-32">
        {/* 欢迎文字 */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-light text-white/90 mb-3">
            嗨，我是<span className="text-gradient-warm font-medium">王编导</span>
          </h1>
          <p className="text-sm md:text-base text-white/60 max-w-md mx-auto leading-relaxed">
            在这文字的星辰大海里，我会手持火把，陪你一起走过创作的旅程
          </p>
        </div>

        {/* 输入框 - 在中下部 */}
        <div className="w-full max-w-lg mt-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div 
            className={`
              relative bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-500
              ${isFocused 
                ? 'border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]' 
                : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
              }
            `}
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              placeholder={placeholders[placeholderIndex]}
              className="
                w-full px-6 py-4 bg-transparent text-white placeholder-white/40
                text-base md:text-lg outline-none rounded-2xl
              "
            />
            
            {/* 发送按钮 */}
            <button
              onClick={handleStart}
              disabled={!inputText.trim()}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${inputText.trim() 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-amber-400/30 hover:scale-105' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          
          {/* 提示文字 */}
          <p className="text-center text-white/30 text-xs mt-3">
            按 Enter 开始对话
          </p>
        </div>

        {/* 底部装饰星星 */}
        <div className="absolute bottom-8 right-8 animate-twinkle-slow">
          <svg className="w-6 h-6 text-amber-300/60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes listening {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.02); }
          75% { transform: scale(1.02); }
        }
        
        @keyframes thinking {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(-1deg); }
          75% { transform: scale(1.02) rotate(1deg); }
        }
        
        @keyframes responding {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        
        @keyframes celebrating {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-3deg); }
          50% { transform: scale(1.1) rotate(0deg); }
          75% { transform: scale(1.05) rotate(3deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes glow-rotate {
          0% { transform: rotate(0deg); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }
        
        @keyframes flame-dance {
          0%, 100% { transform: translateX(-50%) scaleY(1) skewX(-2deg); opacity: 0.8; }
          50% { transform: translateX(-50%) scaleY(1.1) skewX(2deg); opacity: 1; }
        }
        
        @keyframes flame-dance-slow {
          0%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0.9; }
          50% { transform: translateX(-50%) scaleY(1.15); opacity: 1; }
        }
        
        @keyframes spark-1 {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-20px) translateX(5px); opacity: 0; }
        }
        
        @keyframes spark-2 {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-15px) translateX(-8px); opacity: 0; }
        }
        
        @keyframes spark-3 {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-25px) translateX(3px); opacity: 0; }
        }
        
        @keyframes star-dim {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes star-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        
        @keyframes star-bright {
          0%, 100% { opacity: 0.8; transform: scale(1.2); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes star-sparkle {
          0%, 100% { opacity: 1; transform: scale(1.5) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(2) rotate(180deg); }
        }
        
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .animate-listening { animation: listening 2s ease-in-out infinite; }
        .animate-thinking { animation: thinking 2s ease-in-out infinite; }
        .animate-responding { animation: responding 1s ease-in-out infinite; }
        .animate-celebrating { animation: celebrating 0.8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-glow-rotate { animation: glow-rotate 20s linear infinite; }
        .animate-flame-dance { animation: flame-dance 0.8s ease-in-out infinite; }
        .animate-flame-dance-slow { animation: flame-dance-slow 1.2s ease-in-out infinite; }
        .animate-spark-1 { animation: spark-1 1.5s ease-out infinite; }
        .animate-spark-2 { animation: spark-2 1.8s ease-out infinite 0.3s; }
        .animate-spark-3 { animation: spark-3 1.3s ease-out infinite 0.6s; }
        .animate-star-dim { animation: star-dim 4s ease-in-out infinite; }
        .animate-star-glow { animation: star-glow 3s ease-in-out infinite; }
        .animate-star-bright { animation: star-bright 2s ease-in-out infinite; }
        .animate-star-sparkle { animation: star-sparkle 2s ease-in-out infinite; }
        .animate-twinkle-slow { animation: twinkle-slow 4s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        
        .text-gradient-warm {
          background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}

export default EmptyState
