import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore, type UIState, type Message, type HeartbeatType } from './appStore'
import { act } from 'react'

describe('appStore', () => {
  beforeEach(() => {
    // 重置store到初始状态
    act(() => {
      useAppStore.getState().resetSession()
    })
  })

  // ============================================
  // UI状态测试
  // ============================================
  describe('UI State Management', () => {
    it('should have initial UI state as empty', () => {
      const { currentState, previousState } = useAppStore.getState()
      expect(currentState).toBe('empty')
      expect(previousState).toBeNull()
    })

    it('should set UI state correctly', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
      })

      const { currentState, previousState } = useAppStore.getState()
      expect(currentState).toBe('chatting')
      expect(previousState).toBe('empty')
    })

    it('should track state transitions', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().setUIState('creating')
      })

      const { currentState, previousState } = useAppStore.getState()
      expect(currentState).toBe('creating')
      expect(previousState).toBe('chatting')
    })

    it('should not transition when setting same state', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().setUIState('chatting')
      })

      const { currentState, previousState } = useAppStore.getState()
      expect(currentState).toBe('chatting')
      expect(previousState).toBe('empty')
    })

    it('should go back to previous state', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().goBack()
      })

      const { currentState } = useAppStore.getState()
      expect(currentState).toBe('chatting')
    })

    it('should handle all UI states', () => {
      const states: UIState[] = ['empty', 'chatting', 'creating', 'completed']
      
      states.forEach(state => {
        act(() => {
          useAppStore.getState().setUIState(state)
        })
        expect(useAppStore.getState().currentState).toBe(state)
      })
    })

    it('should set transitioning state', () => {
      act(() => {
        useAppStore.getState().setTransitioning(true)
      })

      expect(useAppStore.getState().isTransitioning).toBe(true)

      act(() => {
        useAppStore.getState().setTransitioning(false)
      })

      expect(useAppStore.getState().isTransitioning).toBe(false)
    })

    it('should set transitioning when changing state', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
      })

      expect(useAppStore.getState().isTransitioning).toBe(true)
    })
  })

  // ============================================
  // 消息管理测试
  // ============================================
  describe('Message Management', () => {
    it('should have empty messages initially', () => {
      const { messages } = useAppStore.getState()
      expect(messages).toHaveLength(0)
    })

    it('should add a message with timestamp', () => {
      const beforeTime = Date.now()
      
      act(() => {
        useAppStore.getState().addMessage({
          id: 'msg-1',
          sender: 'user',
          text: 'Hello',
          type: 'text'
        })
      })

      const { messages } = useAppStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].text).toBe('Hello')
      expect(messages[0].sender).toBe('user')
      expect(messages[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
    })

    it('should add wang message', () => {
      act(() => {
        useAppStore.getState().addMessage({
          id: 'msg-wang',
          sender: 'wang',
          text: '你好！',
          type: 'text'
        })
      })

      const { messages } = useAppStore.getState()
      expect(messages[0].sender).toBe('wang')
    })

    it('should add story-card message', () => {
      act(() => {
        useAppStore.getState().addMessage({
          id: 'msg-card',
          sender: 'wang',
          text: 'Story card',
          type: 'story-card',
          metadata: { title: 'Test', content: 'Content' }
        })
      })

      const { messages } = useAppStore.getState()
      expect(messages[0].type).toBe('story-card')
      expect(messages[0].metadata).toEqual({ title: 'Test', content: 'Content' })
    })

    it('should set all messages', () => {
      const newMessages: Message[] = [
        { id: '1', sender: 'wang', text: 'Hi', type: 'text', timestamp: Date.now() },
        { id: '2', sender: 'user', text: 'Hello', type: 'text', timestamp: Date.now() }
      ]

      act(() => {
        useAppStore.getState().setMessages(newMessages)
      })

      const { messages } = useAppStore.getState()
      expect(messages).toHaveLength(2)
      expect(messages[0].text).toBe('Hi')
      expect(messages[1].text).toBe('Hello')
    })

    it('should clear all messages', () => {
      act(() => {
        useAppStore.getState().addMessage({
          id: 'msg-1',
          sender: 'user',
          text: 'Test',
          type: 'text'
        })
        useAppStore.getState().clearMessages()
      })

      const { messages } = useAppStore.getState()
      expect(messages).toHaveLength(0)
    })

    it('should maintain message order', () => {
      act(() => {
        useAppStore.getState().addMessage({ id: '1', sender: 'wang', text: 'First', type: 'text' })
        useAppStore.getState().addMessage({ id: '2', sender: 'user', text: 'Second', type: 'text' })
        useAppStore.getState().addMessage({ id: '3', sender: 'wang', text: 'Third', type: 'text' })
      })

      const { messages } = useAppStore.getState()
      expect(messages[0].text).toBe('First')
      expect(messages[1].text).toBe('Second')
      expect(messages[2].text).toBe('Third')
    })
  })

  // ============================================
  // 输入管理测试
  // ============================================
  describe('Input Management', () => {
    it('should set input text', () => {
      act(() => {
        useAppStore.getState().setInputText('Test input')
      })

      expect(useAppStore.getState().inputText).toBe('Test input')
    })

    it('should clear input', () => {
      act(() => {
        useAppStore.getState().setInputText('Test input')
        useAppStore.getState().clearInput()
      })

      expect(useAppStore.getState().inputText).toBe('')
    })

    it('should handle empty input', () => {
      act(() => {
        useAppStore.getState().setInputText('')
      })

      expect(useAppStore.getState().inputText).toBe('')
    })

    it('should handle long input', () => {
      const longText = 'a'.repeat(10000)
      
      act(() => {
        useAppStore.getState().setInputText(longText)
      })

      expect(useAppStore.getState().inputText).toBe(longText)
    })
  })

  // ============================================
  // 打字状态测试
  // ============================================
  describe('Typing State', () => {
    it('should set typing state', () => {
      act(() => {
        useAppStore.getState().setIsTyping(true)
      })

      expect(useAppStore.getState().isTyping).toBe(true)
      expect(useAppStore.getState().wangDaoyan.status).toBe('thinking')
    })

    it('should update wang status when not typing', () => {
      act(() => {
        useAppStore.getState().setIsTyping(true)
        useAppStore.getState().setIsTyping(false)
      })

      expect(useAppStore.getState().isTyping).toBe(false)
      expect(useAppStore.getState().wangDaoyan.status).toBe('waiting')
    })

    it('should set streaming text', () => {
      act(() => {
        useAppStore.getState().setStreamingText('Streaming...')
      })

      expect(useAppStore.getState().streamingText).toBe('Streaming...')
    })

    it('should append streaming text', () => {
      act(() => {
        useAppStore.getState().setStreamingText('Hello')
        useAppStore.getState().appendStreamingText(' World')
      })

      expect(useAppStore.getState().streamingText).toBe('Hello World')
    })

    it('should append streaming text multiple times', () => {
      act(() => {
        useAppStore.getState().setStreamingText('')
        useAppStore.getState().appendStreamingText('A')
        useAppStore.getState().appendStreamingText('B')
        useAppStore.getState().appendStreamingText('C')
      })

      expect(useAppStore.getState().streamingText).toBe('ABC')
    })
  })

  // ============================================
  // 对话上下文测试
  // ============================================
  describe('Conversation Context', () => {
    it('should increment turn count', () => {
      act(() => {
        useAppStore.getState().incrementTurn()
        useAppStore.getState().incrementTurn()
      })

      expect(useAppStore.getState().conversationTurn).toBe(2)
    })

    it('should return new turn number', () => {
      let newTurn = 0
      act(() => {
        useAppStore.getState().incrementTurn()
        newTurn = useAppStore.getState().incrementTurn()
      })

      expect(newTurn).toBe(2)
    })

    it('should set detected type', () => {
      act(() => {
        useAppStore.getState().setDetectedType('lyric')
      })

      expect(useAppStore.getState().detectedType).toBe('lyric')
    })

    it('should set all creator types', () => {
      const types: Array<'lyric' | 'romance' | 'hero'> = ['lyric', 'romance', 'hero']
      
      types.forEach(type => {
        act(() => {
          useAppStore.getState().setDetectedType(type)
        })
        expect(useAppStore.getState().detectedType).toBe(type)
      })
    })

    it('should set detected type to null', () => {
      act(() => {
        useAppStore.getState().setDetectedType('hero')
        useAppStore.getState().setDetectedType(null)
      })

      expect(useAppStore.getState().detectedType).toBeNull()
    })

    it('should set suggested responses', () => {
      const responses = ['Option 1', 'Option 2', 'Option 3']
      
      act(() => {
        useAppStore.getState().setSuggestedResponses(responses)
      })

      expect(useAppStore.getState().suggestedResponses).toEqual(responses)
    })
  })

  // ============================================
  // 故事元素测试
  // ============================================
  describe('Story Elements', () => {
    it('should add story element', () => {
      act(() => {
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: '主角',
          content: '一个勇敢的少年',
          timestamp: Date.now()
        })
      })

      const { storyElements } = useAppStore.getState()
      expect(storyElements).toHaveLength(1)
      expect(storyElements[0].type).toBe('character')
      expect(storyElements[0].title).toBe('主角')
    })

    it('should add multiple element types', () => {
      act(() => {
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: 'Character',
          content: 'Content',
          timestamp: Date.now()
        })
        useAppStore.getState().addStoryElement({
          type: 'world',
          title: 'World',
          content: 'World content',
          timestamp: Date.now()
        })
        useAppStore.getState().addStoryElement({
          type: 'plot',
          title: 'Plot',
          content: 'Plot content',
          timestamp: Date.now()
        })
        useAppStore.getState().addStoryElement({
          type: 'scene',
          title: 'Scene',
          content: 'Scene content',
          timestamp: Date.now()
        })
      })

      const { storyElements } = useAppStore.getState()
      expect(storyElements).toHaveLength(4)
      expect(storyElements.map(e => e.type)).toEqual(['character', 'world', 'plot', 'scene'])
    })

    it('should remove story element by index', () => {
      act(() => {
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: 'First',
          content: 'Content',
          timestamp: Date.now()
        })
        useAppStore.getState().addStoryElement({
          type: 'world',
          title: 'Second',
          content: 'Content',
          timestamp: Date.now()
        })
        useAppStore.getState().removeStoryElement(0)
      })

      const { storyElements } = useAppStore.getState()
      expect(storyElements).toHaveLength(1)
      expect(storyElements[0].title).toBe('Second')
    })

    it('should toggle sidebar', () => {
      act(() => {
        useAppStore.getState().toggleSidebar()
      })

      expect(useAppStore.getState().showSidebar).toBe(true)

      act(() => {
        useAppStore.getState().toggleSidebar()
      })

      expect(useAppStore.getState().showSidebar).toBe(false)
    })

    it('should set sidebar visibility', () => {
      act(() => {
        useAppStore.getState().setShowSidebar(true)
      })

      expect(useAppStore.getState().showSidebar).toBe(true)

      act(() => {
        useAppStore.getState().setShowSidebar(false)
      })

      expect(useAppStore.getState().showSidebar).toBe(false)
    })
  })

  // ============================================
  // 星空状态测试
  // ============================================
  describe('Starfield Management', () => {
    it('should generate stars', () => {
      act(() => {
        useAppStore.getState().generateStars(50)
      })

      const { stars } = useAppStore.getState()
      expect(stars).toHaveLength(50)
    })

    it('should generate stars with correct properties', () => {
      act(() => {
        useAppStore.getState().generateStars(1)
      })

      const { stars } = useAppStore.getState()
      expect(stars[0]).toHaveProperty('id')
      expect(stars[0]).toHaveProperty('x')
      expect(stars[0]).toHaveProperty('y')
      expect(stars[0]).toHaveProperty('size')
      expect(stars[0]).toHaveProperty('brightness')
      expect(stars[0]).toHaveProperty('twinkleSpeed')
      expect(stars[0]).toHaveProperty('unlockAt')
      expect(stars[0]).toHaveProperty('state')
    })

    it('should unlock next star', () => {
      act(() => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().unlockStar()
      })

      const { stars, unlockedStarCount } = useAppStore.getState()
      expect(unlockedStarCount).toBe(1)
      expect(stars[0].state).toBe('glowing')
    })

    it('should unlock specific star', () => {
      act(() => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().unlockStar(5)
      })

      const { stars } = useAppStore.getState()
      expect(stars[5].state).toBe('glowing')
    })

    it('should set star state', () => {
      act(() => {
        useAppStore.getState().generateStars(5)
        useAppStore.getState().setStarState(0, 'sparkling')
      })

      const { stars } = useAppStore.getState()
      expect(stars[0].state).toBe('sparkling')
    })

    it('should set all star states', () => {
      act(() => {
        useAppStore.getState().generateStars(5)
        useAppStore.getState().setStarState(0, 'dim')
        useAppStore.getState().setStarState(1, 'glowing')
        useAppStore.getState().setStarState(2, 'bright')
        useAppStore.getState().setStarState(3, 'sparkling')
      })

      const { stars } = useAppStore.getState()
      expect(stars[0].state).toBe('dim')
      expect(stars[1].state).toBe('glowing')
      expect(stars[2].state).toBe('bright')
      expect(stars[3].state).toBe('sparkling')
    })

    it('should update star brightness based on progress', () => {
      act(() => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().updateStarBrightness(0.5)
      })

      const { stars } = useAppStore.getState()
      // Stars with unlockAt <= 0.5 should be glowing or bright
      expect(stars.filter(s => s.state !== 'dim').length).toBeGreaterThan(0)
    })

    it('should reset unlocked count when regenerating', () => {
      act(() => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().unlockStar()
        useAppStore.getState().generateStars(20)
      })

      expect(useAppStore.getState().unlockedStarCount).toBe(0)
    })
  })

  // ============================================
  // 编辑器状态测试
  // ============================================
  describe('Editor State', () => {
    it('should have initial editor state', () => {
      const { editor } = useAppStore.getState()
      expect(editor.content).toBe('')
      expect(editor.cursorPosition).toBe(0)
      expect(editor.wordCount).toBe(0)
      expect(editor.isDirty).toBe(false)
      expect(editor.lastSavedAt).toBeUndefined()
    })

    it('should set editor content', () => {
      act(() => {
        useAppStore.getState().setEditorContent('Test content')
      })

      const { editor } = useAppStore.getState()
      expect(editor.content).toBe('Test content')
      expect(editor.wordCount).toBe(12) // 'Test content'.length
      expect(editor.isDirty).toBe(true)
    })

    it('should calculate word count correctly', () => {
      act(() => {
        useAppStore.getState().setEditorContent('Hello World')
      })

      expect(useAppStore.getState().editor.wordCount).toBe(11) // 'Hello World'.length
    })

    it('should trim whitespace for word count', () => {
      act(() => {
        useAppStore.getState().setEditorContent('  hello  ')
      })

      expect(useAppStore.getState().editor.wordCount).toBe(5)
    })

    it('should set cursor position', () => {
      act(() => {
        useAppStore.getState().setCursorPosition(10)
      })

      expect(useAppStore.getState().editor.cursorPosition).toBe(10)
    })

    it('should mark dirty state', () => {
      act(() => {
        useAppStore.getState().markDirty(true)
      })

      expect(useAppStore.getState().editor.isDirty).toBe(true)

      act(() => {
        useAppStore.getState().markDirty(false)
      })

      expect(useAppStore.getState().editor.isDirty).toBe(false)
    })

    it('should save editor and update lastSavedAt', () => {
      const beforeSave = Date.now()
      
      act(() => {
        useAppStore.getState().setEditorContent('Content')
        useAppStore.getState().saveEditor()
      })

      const { editor } = useAppStore.getState()
      expect(editor.isDirty).toBe(false)
      expect(editor.lastSavedAt).toBeGreaterThanOrEqual(beforeSave)
    })
  })

  // ============================================
  // 心跳标记测试
  // ============================================
  describe('Heartbeat Markers', () => {
    it('should have empty heartbeat markers initially', () => {
      expect(useAppStore.getState().heartbeatMarkers).toHaveLength(0)
    })

    it('should add heartbeat marker', () => {
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 50,
          contentSnapshot: 'Test content'
        })
      })

      const { heartbeatMarkers } = useAppStore.getState()
      expect(heartbeatMarkers).toHaveLength(1)
      expect(heartbeatMarkers[0].type).toBe('flow')
      expect(heartbeatMarkers[0].position).toBe(50)
      expect(heartbeatMarkers[0].contentSnapshot).toBe('Test content')
      expect(heartbeatMarkers[0].id).toBeDefined()
      expect(heartbeatMarkers[0].timestamp).toBeDefined()
    })

    it('should add heartbeat with note', () => {
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'emotional',
          position: 30,
          contentSnapshot: 'Snapshot',
          note: 'Important moment'
        })
      })

      const { heartbeatMarkers } = useAppStore.getState()
      expect(heartbeatMarkers[0].note).toBe('Important moment')
    })

    it('should add all heartbeat types', () => {
      const types: HeartbeatType[] = ['flow', 'emotional', 'golden_quote', 'plot_twist', 'user_marked']
      
      types.forEach((type, index) => {
        act(() => {
          useAppStore.getState().addHeartbeat({
            type,
            position: index * 10,
            contentSnapshot: `Snapshot ${index}`
          })
        })
      })

      expect(useAppStore.getState().heartbeatMarkers).toHaveLength(5)
    })

    it('should remove heartbeat marker', () => {
      let markerId = ''
      
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 50,
          contentSnapshot: 'Test'
        })
        markerId = useAppStore.getState().heartbeatMarkers[0].id
        useAppStore.getState().removeHeartbeat(markerId)
      })

      expect(useAppStore.getState().heartbeatMarkers).toHaveLength(0)
    })

    it('should update heartbeat note', () => {
      let markerId = ''
      
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'user_marked',
          position: 20,
          contentSnapshot: 'Test',
          note: 'Initial note'
        })
        markerId = useAppStore.getState().heartbeatMarkers[0].id
        useAppStore.getState().updateHeartbeatNote(markerId, 'Updated note')
      })

      const marker = useAppStore.getState().heartbeatMarkers[0]
      expect(marker.note).toBe('Updated note')
    })

    it('should generate unique ids for each heartbeat', () => {
      act(() => {
        useAppStore.getState().addHeartbeat({ type: 'flow', position: 10, contentSnapshot: 'A' })
        useAppStore.getState().addHeartbeat({ type: 'emotional', position: 20, contentSnapshot: 'B' })
      })

      const ids = useAppStore.getState().heartbeatMarkers.map(h => h.id)
      expect(new Set(ids).size).toBe(2)
    })
  })

  // ============================================
  // 章节管理测试
  // ============================================
  describe('Chapter Management', () => {
    it('should have initial chapter as 1', () => {
      expect(useAppStore.getState().currentChapter).toBe(1)
    })

    it('should have initial chapter title', () => {
      expect(useAppStore.getState().chapterTitle).toBe('第一章')
    })

    it('should set current chapter', () => {
      act(() => {
        useAppStore.getState().setCurrentChapter(5)
      })

      expect(useAppStore.getState().currentChapter).toBe(5)
    })

    it('should set chapter title', () => {
      act(() => {
        useAppStore.getState().setChapterTitle('楔子')
      })

      expect(useAppStore.getState().chapterTitle).toBe('楔子')
    })

    it('should advance to next chapter', () => {
      act(() => {
        useAppStore.getState().setEditorContent('Chapter 1 content')
        useAppStore.getState().nextChapter()
      })

      const state = useAppStore.getState()
      expect(state.currentChapter).toBe(2)
      expect(state.chapterTitle).toBe('第2章')
      expect(state.editor.content).toBe('')
    })

    it('should clear editor on next chapter', () => {
      act(() => {
        useAppStore.getState().setEditorContent('Old content')
        useAppStore.getState().nextChapter()
      })

      expect(useAppStore.getState().editor.content).toBe('')
    })
  })

  // ============================================
  // 王编导状态测试
  // ============================================
  describe('Wang Daoyan State', () => {
    it('should have initial wang state', () => {
      const { wangDaoyan } = useAppStore.getState()
      expect(wangDaoyan.status).toBe('waiting')
      expect(wangDaoyan.expression).toBe('gentle')
      expect(wangDaoyan.torchIntensity).toBe(0.7)
    })

    it('should set wang status', () => {
      act(() => {
        useAppStore.getState().setWangDaoyanStatus('listening')
      })

      expect(useAppStore.getState().wangDaoyan.status).toBe('listening')
    })

    it('should set all wang statuses', () => {
      const statuses = ['waiting', 'listening', 'thinking', 'responding', 'celebrating'] as const
      
      statuses.forEach(status => {
        act(() => {
          useAppStore.getState().setWangDaoyanStatus(status)
        })
        expect(useAppStore.getState().wangDaoyan.status).toBe(status)
      })
    })

    it('should set wang expression', () => {
      act(() => {
        useAppStore.getState().setWangDaoyanExpression('excited')
      })

      expect(useAppStore.getState().wangDaoyan.expression).toBe('excited')
    })

    it('should set all expressions', () => {
      const expressions = ['neutral', 'gentle', 'excited', 'concerned', 'celebrating'] as const
      
      expressions.forEach(expression => {
        act(() => {
          useAppStore.getState().setWangDaoyanExpression(expression)
        })
        expect(useAppStore.getState().wangDaoyan.expression).toBe(expression)
      })
    })

    it('should set torch intensity', () => {
      act(() => {
        useAppStore.getState().setTorchIntensity(1.0)
      })

      expect(useAppStore.getState().wangDaoyan.torchIntensity).toBe(1.0)
    })

    it('should handle torch intensity bounds', () => {
      act(() => {
        useAppStore.getState().setTorchIntensity(0)
      })

      expect(useAppStore.getState().wangDaoyan.torchIntensity).toBe(0)

      act(() => {
        useAppStore.getState().setTorchIntensity(1.5)
      })

      expect(useAppStore.getState().wangDaoyan.torchIntensity).toBe(1.5)
    })
  })

  // ============================================
  // 系统状态测试
  // ============================================
  describe('System State', () => {
    it('should have null backend availability initially', () => {
      expect(useAppStore.getState().backendAvailable).toBeNull()
    })

    it('should set backend availability', () => {
      act(() => {
        useAppStore.getState().setBackendAvailable(true)
      })

      expect(useAppStore.getState().backendAvailable).toBe(true)

      act(() => {
        useAppStore.getState().setBackendAvailable(false)
      })

      expect(useAppStore.getState().backendAvailable).toBe(false)
    })
  })

  // ============================================
  // 初始化测试
  // ============================================
  describe('Initialization', () => {
    it('should init app with welcome message', () => {
      act(() => {
        useAppStore.getState().initApp()
      })

      const state = useAppStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].sender).toBe('wang')
      expect(state.messages[0].text).toContain('王编导')
      expect(state.currentState).toBe('chatting')
      expect(state.stars).toHaveLength(50)
    })

    it('should init with timestamp on messages', () => {
      const beforeTime = Date.now()
      
      act(() => {
        useAppStore.getState().initApp()
      })

      const { messages } = useAppStore.getState()
      expect(messages[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
    })

    it('should reset session to initial state', () => {
      act(() => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().addMessage({ id: '1', sender: 'user', text: 'Test', type: 'text' })
        useAppStore.getState().setEditorContent('Content')
        useAppStore.getState().addHeartbeat({ type: 'flow', position: 50, contentSnapshot: 'Test' })
        useAppStore.getState().resetSession()
      })

      const state = useAppStore.getState()
      expect(state.currentState).toBe('empty')
      expect(state.messages).toHaveLength(0)
      expect(state.inputText).toBe('')
      expect(state.editor.content).toBe('')
      expect(state.heartbeatMarkers).toHaveLength(0)
      expect(state.currentChapter).toBe(1)
      expect(state.chapterTitle).toBe('第一章')
    })
  })

  // ============================================
  // 复杂场景测试
  // ============================================
  describe('Complex Scenarios', () => {
    it('should handle full conversation flow', () => {
      // 初始化
      act(() => {
        useAppStore.getState().initApp()
      })

      // 用户发送消息
      act(() => {
        useAppStore.getState().addMessage({
          id: 'user-1',
          sender: 'user',
          text: 'Hello'
        })
        useAppStore.getState().incrementTurn()
      })

      // 王编导回复
      act(() => {
        useAppStore.getState().setIsTyping(true)
        useAppStore.getState().setStreamingText('Hi')
        useAppStore.getState().appendStreamingText(' there')
        useAppStore.getState().setIsTyping(false)
        useAppStore.getState().addMessage({
          id: 'wang-1',
          sender: 'wang',
          text: 'Hi there'
        })
      })

      // 检测类型并生成故事元素
      act(() => {
        useAppStore.getState().setDetectedType('romance')
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: '主角',
          content: '一个浪漫的灵魂',
          timestamp: Date.now()
        })
      })

      const state = useAppStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.conversationTurn).toBe(1)
      expect(state.detectedType).toBe('romance')
      expect(state.storyElements).toHaveLength(1)
    })

    it('should handle writing flow with heartbeats', () => {
      // 切换到写作状态
      act(() => {
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().setEditorContent('The story begins...')
      })

      // 添加心跳标记
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'emotional',
          position: 10,
          contentSnapshot: 'The story',
          note: 'Opening line'
        })
      })

      // 继续写作
      act(() => {
        useAppStore.getState().setEditorContent('The story begins with a hero.')
      })

      // 添加另一个心跳
      act(() => {
        useAppStore.getState().addHeartbeat({
          type: 'plot_twist',
          position: 50,
          contentSnapshot: 'hero',
          note: 'Hero introduced'
        })
      })

      const state = useAppStore.getState()
      expect(state.currentState).toBe('creating')
      expect(state.editor.content).toBe('The story begins with a hero.')
      expect(state.heartbeatMarkers).toHaveLength(2)
      expect(state.editor.isDirty).toBe(true)
    })

    it('should handle chapter completion flow', () => {
      act(() => {
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().setEditorContent('Chapter one content...')
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 30,
          contentSnapshot: 'content'
        })
        useAppStore.getState().saveEditor()
      })

      // 完成章节
      act(() => {
        useAppStore.getState().nextChapter()
      })

      const state = useAppStore.getState()
      expect(state.currentChapter).toBe(2)
      expect(state.chapterTitle).toBe('第2章')
      expect(state.editor.content).toBe('')
    })

    it('should handle sidebar interactions during conversation', () => {
      act(() => {
        useAppStore.getState().initApp()
      })

      // 生成故事元素
      act(() => {
        useAppStore.getState().addStoryElement({
          type: 'world',
          title: 'Setting',
          content: 'A mystical world',
          timestamp: Date.now()
        })
      })

      // 打开侧边栏
      act(() => {
        useAppStore.getState().setShowSidebar(true)
      })

      // 关闭侧边栏
      act(() => {
        useAppStore.getState().toggleSidebar()
      })

      const state = useAppStore.getState()
      expect(state.showSidebar).toBe(false)
      expect(state.storyElements).toHaveLength(1)
    })
  })
})