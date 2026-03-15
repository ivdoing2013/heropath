/** HeroPath 类型定义 */

// ============================================
// 用户相关类型
// ============================================
export interface User {
  id: string;
  email: string;
  username: string;
  creatorType?: CreatorType;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  lineHeight: number;
  autoSaveInterval: number;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  inApp: boolean;
  email: boolean;
  wechat: boolean;
  heartbeatAlert: boolean;
  restReminder: boolean;
  milestoneCelebration: boolean;
}

// ============================================
// 创作者类型
// ============================================
export type CreatorType = 'lyric' | 'romance' | 'hero';

export interface CreatorTypeConfig {
  id: CreatorType;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// ============================================
// 会话相关类型
// ============================================
export interface Session {
  id: string;
  userId: string;
  title: string;
  creatorType: CreatorType;
  currentStage: number;
  status: 'active' | 'paused' | 'completed';
  contextData: ContextData;
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
}

export interface ContextData {
  sessionId: string;
  createdAt: string;
  creatorType: CreatorType;
  currentStage: string;
  status: string;
  previousOutputs: Record<string, StageOutput>;
  checkpoints: Record<string, Checkpoint>;
}

// ============================================
// 阶段相关类型
// ============================================
export interface Stage {
  id: string;
  number: number;
  name: string;
  nameEn: string;
  description: string;
  status: 'locked' | 'in_progress' | 'completed';
  checkpoints: Checkpoint[];
  outputs?: StageOutput;
  startedAt?: string;
  completedAt?: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  value?: unknown;
}

export interface StageOutput {
  stageId: string;
  data: Record<string, unknown>;
  summary?: string;
}

// ============================================
// 章节相关类型
// ============================================
export interface Chapter {
  id: string;
  sessionId: string;
  stageId?: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 心跳相关类型
// ============================================
export type HeartbeatType = 'flow' | 'emotional' | 'golden_quote' | 'plot_twist' | 'user_marked';

export interface Heartbeat {
  id: string;
  sessionId: string;
  chapterId?: string;
  type: HeartbeatType;
  position: number;
  contentSnapshot: string;
  note?: string;
  timestamp: string;
  triggers?: HeartbeatTrigger[];
}

export interface HeartbeatTrigger {
  type: string;
  value: unknown;
}

// ============================================
// 版本相关类型
// ============================================
export type VersionType = 'auto_saved' | 'user_saved' | 'heartbeat';

export interface Version {
  id: string;
  chapterId: string;
  versionNumber: string;
  content: string;
  type: VersionType;
  metadata: VersionMetadata;
  parentVersionId?: string;
  createdBy: 'system' | 'user';
  commitMessage?: string;
  createdAt: string;
}

export interface VersionMetadata {
  wordCount: number;
  cursorPosition?: number;
  stageInfo?: StageInfo;
}

export interface StageInfo {
  stageId: string;
  stageName: string;
  progress: number;
}

// ============================================
// 对话消息类型
// ============================================
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  skillId?: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export interface MessageMetadata {
  suggestedQuestions?: string[];
  action?: MessageAction;
}

export interface MessageAction {
  type: string;
  label: string;
  data?: unknown;
}

// ============================================
// 王编导相关类型
// ============================================
export type WangDaoYanStatus = 'idle' | 'accompanying' | 'thinking' | 'celebrating' | 'resting';
export type AvatarExpression = 'neutral' | 'gentle' | 'excited' | 'concerned' | 'celebrating';
export type TorchState = 'waiting' | 'accompanying' | 'flow' | 'resting' | 'completed';

export interface WangDaoYanState {
  status: WangDaoYanStatus;
  avatarExpression: AvatarExpression;
  torchState: TorchState;
  lastMessage?: string;
  isTyping: boolean;
}

// ============================================
// 金句相关类型
// ============================================
export interface Quote {
  id: string;
  sessionId: string;
  chapterId?: string;
  content: string;
  context?: string;
  qualityScores: QualityScores;
  tags: string[];
  usedCount: number;
  starred: boolean;
  createdAt: string;
}

export interface QualityScores {
  overall: number;
  uniqueness: number;
  emotional: number;
  literary: number;
}

// ============================================
// Skill相关类型
// ============================================
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  inputSchema: unknown;
  outputSchema: unknown;
}

export type SkillCategory = 
  | 'guide_dialog' 
  | 'content_generate' 
  | 'companion_record' 
  | 'version_control' 
  | 'notification' 
  | 'system';

// ============================================
// UI相关类型
// ============================================
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: unknown;
}

// ============================================
// 创作者类型配置
// ============================================
export const CREATOR_TYPES: CreatorTypeConfig[] = [
  {
    id: 'lyric',
    name: '抒情散文',
    icon: '🌙',
    description: '捕捉生命中那些细微的感动',
    color: '#8B9DC3'
  },
  {
    id: 'romance',
    name: '男欢女爱',
    icon: '💕',
    description: '探索情感深处最柔软的角落',
    color: '#E899A9'
  },
  {
    id: 'hero',
    name: '英雄之旅',
    icon: '⚔️',
    description: '创造改变世界的传奇',
    color: '#F4A460'
  }
];

// ============================================
// 英雄之旅12阶段定义
// ============================================
export const HERO_STAGES: Omit<Stage, 'status' | 'checkpoints' | 'startedAt' | 'completedAt'>[] = [
  { id: 'stage_1', number: 1, name: '平凡世界', nameEn: 'Ordinary World', description: '主角的日常生活' },
  { id: 'stage_2', number: 2, name: '冒险召唤', nameEn: 'Call to Adventure', description: '打破平静的事件' },
  { id: 'stage_3', number: 3, name: '拒斥召唤', nameEn: 'Refusal of the Call', description: '主角的犹豫与抗拒' },
  { id: 'stage_4', number: 4, name: '遇见导师', nameEn: 'Meeting the Mentor', description: '获得指引与智慧' },
  { id: 'stage_5', number: 5, name: '跨越门槛', nameEn: 'Crossing the Threshold', description: '踏入未知世界' },
  { id: 'stage_6', number: 6, name: '考验盟友', nameEn: 'Tests, Allies, Enemies', description: '新世界的挑战' },
  { id: 'stage_7', number: 7, name: '接近洞穴', nameEn: 'Approach to the Cave', description: '逼近核心危险' },
  { id: 'stage_8', number: 8, name: '磨难', nameEn: 'The Ordeal', description: '最严峻的考验' },
  { id: 'stage_9', number: 9, name: '奖励', nameEn: 'The Reward', description: '战胜后获得' },
  { id: 'stage_10', number: 10, name: '归途', nameEn: 'The Road Back', description: '踏上归程' },
  { id: 'stage_11', number: 11, name: '复活', nameEn: 'Resurrection', description: '最终蜕变' },
  { id: 'stage_12', number: 12, name: '携药归来', nameEn: 'Return with Elixir', description: '带回万能药' }
];
