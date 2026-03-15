// ==================== 用户相关类型 ====================

export interface User {
  id: string;
  email: string;
  username: string;
  creatorType?: CreatorType;
  preferences: Record<string, any>;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatorType = 'LYRIC' | 'ROMANCE' | 'HERO';

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  creatorType?: CreatorType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

// ==================== 会话相关类型 ====================

export interface Session {
  id: string;
  userId: string;
  title?: string;
  creatorType: CreatorType;
  currentStage: number;
  status: SessionStatus;
  contextData: SessionContext;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
}

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface SessionContext {
  user?: {
    userId: string;
    preferences: Record<string, any>;
    historySummary?: string;
  };
  currentStage?: {
    stageId: string;
    startedAt: string;
    checkpoints: Checkpoint[];
    outputs: Record<string, any>;
  };
  previousOutputs?: Record<string, StageOutput>;
  realtime?: {
    currentContent?: string;
    cursorPosition?: number;
    wordCount: number;
    lastActivity: string;
  };
  metadata?: {
    skillChain: string[];
    versionInfo: Record<string, any>;
    heartbeatCount: number;
  };
}

export interface CreateSessionInput {
  title?: string;
  creatorType: CreatorType;
}

// ==================== 阶段相关类型 ====================

export interface Stage {
  id: string;
  sessionId: string;
  stageNumber: number;
  stageName: string;
  stageKey: StageKey;
  status: StageStatus;
  checkpoints: Checkpoint[];
  outputs: StageOutput;
  startedAt: Date;
  completedAt?: Date;
}

export type StageStatus = 'IN_PROGRESS' | 'COMPLETED' | 'NEED_REVIEW' | 'ROLLED_BACK';

export type StageKey = 
  | 'ordinary_world'           // 阶段1: 平凡世界
  | 'call_to_adventure'        // 阶段2: 冒险召唤
  | 'refusal_of_call'          // 阶段3: 拒斥召唤
  | 'meeting_mentor'           // 阶段4: 遇见导师
  | 'crossing_first_threshold' // 阶段5: 跨越第一道门槛
  | 'tests_allies_enemies'     // 阶段6: 考验、盟友、敌人
  | 'approach_inmost_cave'     // 阶段7: 接近最深的洞穴
  | 'ordeal'                   // 阶段8: 磨难
  | 'reward'                   // 阶段9: 奖励
  | 'road_back'                // 阶段10: 归途
  | 'resurrection'             // 阶段11: 复活
  | 'return_with_elixir';      // 阶段12: 携万能药归来

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'FILLED' | 'COMPLETE';
  value?: any;
  confidence?: number;
}

export interface StageOutput {
  [key: string]: any;
}

export interface CompleteStageInput {
  outputs: StageOutput;
  checkpoints: Checkpoint[];
}

// ==================== 章节相关类型 ====================

export interface Chapter {
  id: string;
  sessionId: string;
  stageId?: string;
  chapterNumber?: number;
  title?: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChapterInput {
  title?: string;
  content: string;
  stageId?: string;
}

export interface UpdateChapterInput {
  title?: string;
  content?: string;
}

// ==================== 版本相关类型 ====================

export interface Version {
  id: string;
  chapterId: string;
  versionNumber: string;
  content: string;
  versionType: VersionType;
  metadata: Record<string, any>;
  parentVersionId?: string;
  createdBy: string;
  commitMessage?: string;
  createdAt: Date;
}

export type VersionType = 'AUTO_SAVED' | 'USER_SAVED' | 'HEARTBEAT' | 'BRANCH';

export interface SaveVersionInput {
  chapterId: string;
  content: string;
  versionType: VersionType;
  commitMessage?: string;
  metadata?: Record<string, any>;
}

export interface HeartbeatVersionInput {
  chapterId: string;
  content: string;
  heartbeatType: HeartbeatType;
  position?: number;
  note?: string;
}

export interface RollbackInput {
  chapterId: string;
  targetVersionId: string;
  rollbackType: 'soft' | 'hard';
}

// ==================== 心跳相关类型 ====================

export interface Heartbeat {
  id: string;
  sessionId: string;
  chapterId?: string;
  versionId?: string;
  heartbeatType: HeartbeatType;
  position?: number;
  contentSnapshot?: string;
  note?: string;
  triggers: HeartbeatTrigger[];
  qualityScore?: number;
  createdAt: Date;
}

export type HeartbeatType = 'FLOW' | 'EMOTIONAL' | 'GOLDEN_QUOTE' | 'PLOT_TWIST' | 'USER_MARKED';

export interface HeartbeatTrigger {
  type: string;
  value: number;
  description: string;
}

export interface CreateHeartbeatInput {
  chapterId?: string;
  heartbeatType?: HeartbeatType;
  position?: number;
  note?: string;
}

export interface DetectHeartbeatInput {
  recentContent: string;
  typingPattern: TypingPattern;
  editBehavior: EditBehavior;
  emotionSignals: EmotionSignals;
}

export interface TypingPattern {
  speed: number;           // 字符/分钟
  baselineSpeed: number;
  continuousTime: number;  // 连续写作时间(分钟)
}

export interface EditBehavior {
  editRate: number;        // 编辑率
  deleteCount: number;     // 删除次数
  pauseDuration: number;   // 停顿时间
}

export interface EmotionSignals {
  sentimentScore: number;
  intensityScore: number;
}

// ==================== 金句相关类型 ====================

export interface Quote {
  id: string;
  sessionId: string;
  chapterId?: string;
  content: string;
  context?: string;
  qualityScores: Record<string, number>;
  tags: string[];
  usedCount: number;
  starred: boolean;
  createdAt: Date;
}

// ==================== 消息相关类型 ====================

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  skillId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface SendMessageInput {
  content: string;
  sessionId: string;
}

// ==================== Skill相关类型 ====================

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  category: SkillCategory;
  stage?: number;
  creatorType?: CreatorType;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  promptTemplate: string;
}

export type SkillType = 'GUIDE' | 'EXTRACT' | 'CHECK' | 'GENERATE' | 'COMPANION' | 'VERSION' | 'SYSTEM';

export type SkillCategory = 
  | 'DIALOG_GUIDE'      // 对话引导
  | 'CONTENT_GENERATE'  // 内容生成
  | 'COMPANION_RECORD'  // 陪伴记录
  | 'VERSION_CONTROL'   // 版本控制
  | 'NOTIFICATION'      // 推送服务
  | 'SYSTEM_COMMON';    // 系统通用

export interface SkillInput {
  context: SessionContext;
  userInput?: string;
  previousSkillOutput?: SkillOutput;
  triggerEvent?: TriggerEvent;
  config?: SkillConfig;
}

export interface SkillOutput {
  skillId: string;
  executedAt: string;
  executionTimeMs: number;
  output: {
    type: string;
    data: any;
  };
  status: 'success' | 'partial' | 'failed';
  nextAction: NextAction;
  updatedContext: SessionContext;
  debugInfo?: DebugInfo;
}

export interface TriggerEvent {
  type: string;
  data: Record<string, any>;
}

export interface SkillConfig {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  retries?: number;
}

export interface NextAction {
  type: 'call_skill' | 'wait_user' | 'complete' | 'error';
  target?: string;
  parameters?: Record<string, any>;
}

export interface DebugInfo {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  rawResponse?: string;
}

export interface SkillExecution {
  id: string;
  sessionId: string;
  skillId: string;
  skillType: string;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  status: ExecutionStatus;
  executionTimeMs?: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface ExecuteSkillInput {
  skillId: string;
  input: SkillInput;
}

// ==================== DeepSeek API相关类型 ====================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface DeepSeekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ==================== 日志相关类型 ====================

export interface Log {
  id: string;
  sessionId: string;
  eventType: string;
  eventData: Record<string, any>;
  createdAt: Date;
}

export type LogEventType = 
  | 'session_start'
  | 'session_end'
  | 'stage_complete'
  | 'heartbeat_detected'
  | 'heartbeat_marked'
  | 'version_saved'
  | 'version_rollback'
  | 'skill_execute'
  | 'skill_complete'
  | 'message_send'
  | 'content_update';

// ==================== API响应类型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  timestamp: string;
}

// ==================== 生成内容相关类型 ====================

export interface GenerateGoldenThreeInput {
  sessionId: string;
  stageOutputs: StageOutput[];
  tonePreference?: string;
}

export interface GoldenThreeOutput {
  chapter1: GeneratedChapter;
  chapter2: GeneratedChapter;
  chapter3: GeneratedChapter;
  analysis: ChapterAnalysis;
}

export interface GeneratedChapter {
  title: string;
  content: string;
  wordCount: number;
  keyElements: string[];
}

export interface ChapterAnalysis {
  hookStrength: number;
  tensionCurve: number[];
  readerRetention: number;
}

export interface GenerateContinuationInput {
  chapterId: string;
  previousContent: string;
  continuationLength?: number;
  styleGuidance?: string;
}

export interface ContinuationOutput {
  continuation: string;
  writingTips: string[];
  alternativePaths: string[];
}

export interface PolishInput {
  content: string;
  polishTarget: 'language' | 'emotion' | 'structure';
}

export interface PolishOutput {
  polishedContent: string;
  changes: string[];
}