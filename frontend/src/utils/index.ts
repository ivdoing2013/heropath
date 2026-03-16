// AI 服务
export { 
  chatWithWangDaoyan, 
  clearChatHistory,
  getChatHistory,
  checkBackendHealth,
  SKILL_TREE,
  calculateProgress,
  getCurrentSkillNode
} from './aiService'
export type { 
  ChatMessage, 
  WangDaoyanResponse,
  StoryElement,
  SkillNode
} from './aiService'
