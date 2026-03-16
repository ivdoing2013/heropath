import { useEffect } from 'react'
import { useAppStore } from './stores'
import { EmptyState, ChattingState, CreatingState } from './components'
import './App.css'

function App() {
  const { 
    currentState, 
    isTransitioning,
    setUIState,
    setTransitioning,
    initApp,
    setBackendAvailable
  } = useAppStore()

  // 检查后端健康状态
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        setBackendAvailable(response.ok)
      } catch {
        setBackendAvailable(false)
      }
    }
    checkBackend()
  }, [setBackendAvailable])

  // 处理状态过渡动画
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, setTransitioning])

  // 页面加载时初始化
  useEffect(() => {
    // 如果有保存的状态，恢复它
    const savedState = localStorage.getItem('heropath-app-storage')
    if (!savedState) {
      // 首次使用，显示空状态
      setUIState('empty')
    }
  }, [setUIState])

  // 状态切换处理
  const handleStartChatting = () => {
    initApp()
    setUIState('chatting')
  }

  const handleStartCreating = () => {
    setUIState('creating')
  }

  const handleBackToChatting = () => {
    setUIState('chatting')
  }

  const handleCompleteChapter = () => {
    // 可以在这里添加完成章节后的逻辑
    setUIState('chatting')
  }

  // 根据当前状态渲染对应组件
  const renderContent = () => {
    switch (currentState) {
      case 'empty':
        return (
          <EmptyState 
            onStart={handleStartChatting}
          />
        )
      
      case 'chatting':
        return (
          <ChattingState 
            onStartCreating={handleStartCreating}
          />
        )
      
      case 'creating':
        return (
          <CreatingState 
            onComplete={handleCompleteChapter}
            onBack={handleBackToChatting}
          />
        )
      
      case 'completed':
        // 暂时回到chatting状态
        return (
          <ChattingState 
            onStartCreating={handleStartCreating}
          />
        )
      
      default:
        return <EmptyState onStart={handleStartChatting} />
    }
  }

  return (
    <div className={`app-container ${isTransitioning ? 'transitioning' : ''}`}>
      {renderContent()}
      
      {/* 全局样式 */}
      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        
        .app-container.transitioning {
          pointer-events: none;
        }
        
        /* 全局滚动条样式 */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* 选中文字样式 */
        ::selection {
          background: rgba(251, 191, 36, 0.3);
          color: white;
        }
        
        /* 渐变文字工具类 */
        .text-gradient-warm {
          background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* 动画工具类 */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.5); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default App
