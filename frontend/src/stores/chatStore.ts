import { create } from 'zustand'

export interface Message {
  id: string
  sender: 'wang' | 'user'
  text: string
  type?: 'text' | 'story-card' | 'character-card' | 'world-card'
  metadata?: any
}

export interface StoryElement {
  type: 'character' | 'world' | 'plot' | 'scene'
  title: string
  content: string
  timestamp: number
}

interface ChatState {
  // 消息列表
  messages: Message[]
  // 输入状态
  inputText: string
  isTyping: boolean
  streamingText: string
  // 故事元素
  storyElements: StoryElement[]
  showSidebar: boolean
  // 对话上下文
  conversationTurn: number
  detectedType: string | null
  backendAvailable: boolean | null
}

interface ChatActions {
  // 消息操作
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  // 输入操作
  setInputText: (text: string) => void
  clearInput: () => void
  // 打字状态
  setIsTyping: (typing: boolean) => void
  setStreamingText: (text: string) => void
  // 故事元素
  addStoryElement: (element: StoryElement) => void
  toggleSidebar: () => void
  setShowSidebar: (show: boolean) => void
  // 对话上下文
  incrementTurn: () => void
  setDetectedType: (type: string | null) => void
  setBackendAvailable: (available: boolean) => void
  // 流式消息更新
  appendStreamingText: (text: string) => void
  // 初始化欢迎消息
  initWelcomeMessage: () => void
}

const initialMessage: Message = {
  id: 'welcome',
  sender: 'wang',
  text: '嗨，我是王编导。✨\n\n我见过太多故事胎死腹中——不是才华不够，是方向不清。\n\n告诉我，你想讲一个什么样的故事？',
  type: 'text'
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  // 初始状态
  messages: [initialMessage],
  inputText: '',
  isTyping: false,
  streamingText: '',
  storyElements: [],
  showSidebar: false,
  conversationTurn: 0,
  detectedType: null,
  backendAvailable: null,

  // 消息操作
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),

  // 输入操作
  setInputText: (text) => set({ inputText: text }),
  
  clearInput: () => set({ inputText: '' }),

  // 打字状态
  setIsTyping: (typing) => set({ isTyping: typing }),
  
  setStreamingText: (text) => set({ streamingText: text }),
  
  appendStreamingText: (text) => set((state) => ({
    streamingText: state.streamingText + text
  })),

  // 故事元素
  addStoryElement: (element) => set((state) => ({
    storyElements: [...state.storyElements, element]
  })),
  
  toggleSidebar: () => set((state) => ({ 
    showSidebar: !state.showSidebar 
  })),
  
  setShowSidebar: (show) => set({ showSidebar: show }),

  // 对话上下文
  incrementTurn: () => set((state) => ({ 
    conversationTurn: state.conversationTurn + 1 
  })),
  
  setDetectedType: (type) => set({ detectedType: type }),
  
  setBackendAvailable: (available) => set({ backendAvailable: available }),

  // 初始化
  initWelcomeMessage: () => set({ 
    messages: [initialMessage],
    inputText: '',
    isTyping: false,
    streamingText: '',
    storyElements: [],
    showSidebar: false,
    conversationTurn: 0,
    detectedType: null
  })
}))
