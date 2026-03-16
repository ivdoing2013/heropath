import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ============================================
// 类型定义
// ============================================

export type UIState = 'empty' | 'chatting' | 'creating' | 'completed'

export type MessageSender = 'wang' | 'user'

export type MessageType = 'text' | 'story-card' | 'character-card' | 'world-card' | 'suggestion' | 'skill-unlock'

export interface Message {
  id: string
  sender: MessageSender
  text: string
  type?: MessageType
  metadata?: any
  timestamp?: number
}

export interface StoryElement {
  type: 'character' | 'world' | 'plot' | 'scene'
  title: string
  content: string
  timestamp: number
}

export type CreatorType = 'lyric' | 'romance' | 'hero' | null

export interface Star {
  id: number
  x: number
  y: number
  size: number
  brightness: number
  twinkleSpeed: number
  unlockAt: number
  state: 'dim' | 'glowing' | 'bright' | 'sparkling'
}

export type HeartbeatType = 'flow' | 'emotional' | 'golden_quote' | 'plot_twist' | 'user_marked'

export interface HeartbeatMarker {
  id: string
  type: HeartbeatType
  position: number
  contentSnapshot: string
  note?: string
  timestamp: number
}

export interface EditorState {
  content: string
  cursorPosition: number
  wordCount: number
  isDirty: boolean
  lastSavedAt?: number
}

export type WangDaoYanStatus = 'waiting' | 'listening' | 'thinking' | 'responding' | 'celebrating'

export interface WangDaoYanState {
  status: WangDaoYanStatus
  expression: 'neutral' | 'gentle' | 'excited' | 'concerned' | 'celebrating'
  torchIntensity: number
}

// ============================================
// 状态接口
// ============================================

interface AppState {
  // UI状态
  currentState: UIState
  previousState: UIState | null
  
  // 对话状态
  messages: Message[]
  inputText: string
  isTyping: boolean
  streamingText: string
  conversationTurn: number
  suggestedResponses: string[]
  
  // 创作类型
  detectedType: CreatorType
  
  // 故事元素
  storyElements: StoryElement[]
  showSidebar: boolean
  
  // 星空状态
  stars: Star[]
  unlockedStarCount: number
  
  // 编辑器状态（Creating State）
  editor: EditorState
  heartbeatMarkers: HeartbeatMarker[]
  currentChapter: number
  chapterTitle: string
  
  // 王编导状态
  wangDaoyan: WangDaoYanState
  
  // 系统状态
  backendAvailable: boolean | null
  isTransitioning: boolean
}

interface AppActions {
  // UI状态操作
  setUIState: (state: UIState, context?: any) => void
  goBack: () => void
  setTransitioning: (transitioning: boolean) => void
  
  // 消息操作
  addMessage: (message: Omit<Message, 'timestamp'>) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void
  
  // 输入操作
  setInputText: (text: string) => void
  clearInput: () => void
  
  // 打字状态
  setIsTyping: (typing: boolean) => void
  setStreamingText: (text: string) => void
  appendStreamingText: (text: string) => void
  setSuggestedResponses: (responses: string[]) => void
  
  // 对话上下文
  incrementTurn: () => number
  setDetectedType: (type: CreatorType) => void
  
  // 故事元素
  addStoryElement: (element: StoryElement) => void
  removeStoryElement: (index: number) => void
  toggleSidebar: () => void
  setShowSidebar: (show: boolean) => void
  
  // 星空操作
  generateStars: (count?: number) => void
  unlockStar: (index?: number) => void
  setStarState: (id: number, state: Star['state']) => void
  updateStarBrightness: (progress: number) => void
  
  // 编辑器操作
  setEditorContent: (content: string) => void
  setCursorPosition: (position: number) => void
  markDirty: (isDirty: boolean) => void
  saveEditor: () => void
  
  // 心跳标记
  addHeartbeat: (heartbeat: Omit<HeartbeatMarker, 'id' | 'timestamp'>) => void
  removeHeartbeat: (id: string) => void
  updateHeartbeatNote: (id: string, note: string) => void
  
  // 章节操作
  setCurrentChapter: (chapter: number) => void
  setChapterTitle: (title: string) => void
  nextChapter: () => void
  
  // 王编导状态
  setWangDaoyanStatus: (status: WangDaoYanStatus) => void
  setWangDaoyanExpression: (expression: WangDaoYanState['expression']) => void
  setTorchIntensity: (intensity: number) => void
  
  // 系统
  setBackendAvailable: (available: boolean) => void
  
  // 初始化
  initApp: () => void
  resetSession: () => void
}

// ============================================
// 工具函数
// ============================================

const generateStarfield = (count: number): Star[] => {
  const stars: Star[] = []
  const goldenAngle = 137.5 * (Math.PI / 180)
  
  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle
    const radius = 15 + Math.sqrt(i) * 8
    
    // 添加随机偏移，使用黄金角分布避免聚集
    const randomOffset = () => (Math.random() - 0.5) * 10
    const x = 50 + (radius * Math.cos(angle) / 100 * 100) + randomOffset()
    const y = 50 + (radius * Math.sin(angle) / 100 * 100) + randomOffset()
    
    stars.push({
      id: i,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      size: 3 + Math.random() * 4,
      brightness: 0.2 + Math.random() * 0.4,
      twinkleSpeed: 2000 + Math.random() * 6000,
      unlockAt: i / count,
      state: 'dim'
    })
  }
  
  return stars
}

const initialMessages: Message[] = [
  {
    id: 'welcome',
    sender: 'wang',
    text: '嗨，我是王编导。✨\n\n在这文字的星辰大海里，\n我会手持火把，陪你一起走过创作的旅程。\n\n今天想写点什么？',
    type: 'text'
  }
]

// ============================================
// Store创建
// ============================================

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        // ==================== 初始状态 ====================
        currentState: 'empty',
        previousState: null,
        
        messages: [],
        inputText: '',
        isTyping: false,
        streamingText: '',
        conversationTurn: 0,
        suggestedResponses: [],
        
        detectedType: null,
        
        storyElements: [],
        showSidebar: false,
        
        stars: [],
        unlockedStarCount: 0,
        
        editor: {
          content: '',
          cursorPosition: 0,
          wordCount: 0,
          isDirty: false
        },
        heartbeatMarkers: [],
        currentChapter: 1,
        chapterTitle: '第一章',
        
        wangDaoyan: {
          status: 'waiting',
          expression: 'gentle',
          torchIntensity: 0.7
        },
        
        backendAvailable: null,
        isTransitioning: false,
        
        // ==================== UI状态操作 ====================
        setUIState: (newState, _context) => set((state) => {
          // 触发动画过渡
          if (state.currentState !== newState) {
            return {
              previousState: state.currentState,
              currentState: newState,
              isTransitioning: true
            }
          }
          return {}
        }),
        
        goBack: () => set((state) => {
          if (state.previousState) {
            return {
              currentState: state.previousState,
              previousState: null,
              isTransitioning: true
            }
          }
          return {}
        }),
        
        setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
        
        // ==================== 消息操作 ====================
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, { ...message, timestamp: Date.now() }]
        })),
        
        setMessages: (messages) => set({ messages }),
        
        clearMessages: () => set({ messages: [] }),
        
        // ==================== 输入操作 ====================
        setInputText: (text) => set({ inputText: text }),
        
        clearInput: () => set({ inputText: '' }),
        
        // ==================== 打字状态 ====================
        setIsTyping: (typing) => set((state) => ({
          isTyping: typing,
          wangDaoyan: {
            ...state.wangDaoyan,
            status: typing ? 'thinking' : 'waiting'
          }
        })),
        
        setStreamingText: (text) => set({ streamingText: text }),
        
        appendStreamingText: (text) => set((state) => ({
          streamingText: state.streamingText + text
        })),
        
        setSuggestedResponses: (responses) => set({ suggestedResponses: responses }),
        
        // ==================== 对话上下文 ====================
        incrementTurn: () => {
          let newTurn = 0
          set((state) => {
            newTurn = state.conversationTurn + 1
            return { conversationTurn: newTurn }
          })
          return newTurn
        },
        
        setDetectedType: (type) => set({ detectedType: type }),
        
        // ==================== 故事元素 ====================
        addStoryElement: (element) => set((state) => ({
          storyElements: [...state.storyElements, element]
        })),
        
        removeStoryElement: (index) => set((state) => ({
          storyElements: state.storyElements.filter((_, i) => i !== index)
        })),
        
        toggleSidebar: () => set((state) => ({ 
          showSidebar: !state.showSidebar 
        })),
        
        setShowSidebar: (show) => set({ showSidebar: show }),
        
        // ==================== 星空操作 ====================
        generateStars: (count = 50) => set({
          stars: generateStarfield(count),
          unlockedStarCount: 0
        }),
        
        unlockStar: (index) => set((state) => {
          const stars = [...state.stars]
          const targetIndex = index ?? state.unlockedStarCount
          
          if (targetIndex < stars.length) {
            stars[targetIndex] = { ...stars[targetIndex], state: 'glowing' }
          }
          
          return {
            stars,
            unlockedStarCount: Math.min(targetIndex + 1, stars.length)
          }
        }),
        
        setStarState: (id, starState) => set((state) => ({
          stars: state.stars.map(star => 
            star.id === id ? { ...star, state: starState } : star
          )
        })),
        
        updateStarBrightness: (progress) => set((state) => ({
          stars: state.stars.map(star => ({
            ...star,
            state: progress >= star.unlockAt 
              ? (progress >= star.unlockAt + 0.2 ? 'bright' : 'glowing')
              : 'dim'
          })),
          unlockedStarCount: state.stars.filter(s => progress >= s.unlockAt).length
        })),
        
        // ==================== 编辑器操作 ====================
        setEditorContent: (content) => set((state) => ({
          editor: {
            ...state.editor,
            content,
            wordCount: content.trim().length,
            isDirty: true
          }
        })),
        
        setCursorPosition: (position) => set((state) => ({
          editor: { ...state.editor, cursorPosition: position }
        })),
        
        markDirty: (isDirty) => set((state) => ({
          editor: { ...state.editor, isDirty }
        })),
        
        saveEditor: () => set((state) => ({
          editor: { ...state.editor, isDirty: false, lastSavedAt: Date.now() }
        })),
        
        // ==================== 心跳标记 ====================
        addHeartbeat: (heartbeat) => set((state) => ({
          heartbeatMarkers: [...state.heartbeatMarkers, {
            ...heartbeat,
            id: `hb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
          }]
        })),
        
        removeHeartbeat: (id) => set((state) => ({
          heartbeatMarkers: state.heartbeatMarkers.filter(h => h.id !== id)
        })),
        
        updateHeartbeatNote: (id, note) => set((state) => ({
          heartbeatMarkers: state.heartbeatMarkers.map(h =>
            h.id === id ? { ...h, note } : h
          )
        })),
        
        // ==================== 章节操作 ====================
        setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
        
        setChapterTitle: (title) => set({ chapterTitle: title }),
        
        nextChapter: () => set((state) => ({
          currentChapter: state.currentChapter + 1,
          chapterTitle: `第${state.currentChapter + 1}章`,
          editor: { ...state.editor, content: '' }
        })),
        
        // ==================== 王编导状态 ====================
        setWangDaoyanStatus: (status) => set((state) => ({
          wangDaoyan: { ...state.wangDaoyan, status }
        })),
        
        setWangDaoyanExpression: (expression) => set((state) => ({
          wangDaoyan: { ...state.wangDaoyan, expression }
        })),
        
        setTorchIntensity: (intensity) => set((state) => ({
          wangDaoyan: { ...state.wangDaoyan, torchIntensity: intensity }
        })),
        
        // ==================== 系统 ====================
        setBackendAvailable: (available) => set({ backendAvailable: available }),
        
        // ==================== 初始化 ====================
        initApp: () => set(() => ({
          messages: initialMessages.map(m => ({ ...m, timestamp: Date.now() })),
          stars: generateStarfield(50),
          currentState: 'chatting' as UIState,
          conversationTurn: 0,
          wangDaoyan: {
            status: 'waiting',
            expression: 'gentle',
            torchIntensity: 0.7
          }
        })),
        
        resetSession: () => set(() => ({
          currentState: 'empty',
          previousState: null,
          messages: [],
          inputText: '',
          isTyping: false,
          streamingText: '',
          conversationTurn: 0,
          suggestedResponses: [],
          detectedType: null,
          storyElements: [],
          showSidebar: false,
          unlockedStarCount: 0,
          editor: {
            content: '',
            cursorPosition: 0,
            wordCount: 0,
            isDirty: false
          },
          heartbeatMarkers: [],
          currentChapter: 1,
          chapterTitle: '第一章',
          wangDaoyan: {
            status: 'waiting',
            expression: 'gentle',
            torchIntensity: 0.7
          }
        }))
      }),
      {
        name: 'heropath-app-storage',
        partialize: (state) => ({
          detectedType: state.detectedType,
          currentChapter: state.currentChapter,
          chapterTitle: state.chapterTitle,
          heartbeatMarkers: state.heartbeatMarkers
        })
      }
    ),
    { name: 'AppStore' }
  )
)

// 导出类型
export type { AppState, AppActions }
