export { useAppStore } from './appStore'
export type { 
  UIState, 
  Message, 
  MessageSender, 
  MessageType,
  StoryElement, 
  CreatorType, 
  Star, 
  HeartbeatType, 
  HeartbeatMarker,
  EditorState,
  WangDaoYanStatus,
  WangDaoYanState,
  AppState, 
  AppActions 
} from './appStore'

// 保留旧导出以保持兼容性
export { useChatStore } from './chatStore'
export type { Message as ChatMessage, StoryElement as ChatStoryElement } from './chatStore'
