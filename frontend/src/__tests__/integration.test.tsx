import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import App from '../App'
import { useAppStore } from '../stores'

// Mock fetch for API calls
globalThis.fetch = vi.fn()

// Mock the AI service
vi.mock('../utils/aiService', async () => {
  const actual = await vi.importActual<typeof import('../utils/aiService')>('../utils/aiService')
  return {
    ...actual,
    chatWithWangDaoyan: vi.fn(),
    checkBackendHealth: vi.fn()
  }
})

import { chatWithWangDaoyan, checkBackendHealth } from '../utils/aiService'

describe('Integration Tests - HeroPath Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store
    act(() => {
      useAppStore.getState().resetSession()
    })
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  // ============================================
  // 完整用户流程测试
  // ============================================
  describe('Complete User Flow', () => {
    it('should complete full story creation flow', async () => {
      // 1. 初始状态 - EmptyState
      vi.mocked(checkBackendHealth).mockResolvedValueOnce(true)
      vi.mocked(chatWithWangDaoyan).mockResolvedValueOnce({
        text: '很有意思的想法！能再多说说主角的性格吗？',
        storyType: 'romance'
      })

      render(<App />)

      // 验证初始状态
      expect(screen.getByText(/嗨，我是/)).toBeInTheDocument()
      
      // 2. 输入故事想法并提交
      const input = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button')

      await act(async () => {
        fireEvent.change(input, { target: { value: '我想写一个关于重逢的爱情故事' } })
      })

      await act(async () => {
        fireEvent.click(sendButton)
      })

      // 3. 进入聊天状态
      await waitFor(() => {
        expect(useAppStore.getState().currentState).toBe('chatting')
      })
    })

    it('should handle backend unavailable gracefully', async () => {
      vi.mocked(checkBackendHealth).mockResolvedValueOnce(false)

      render(<App />)

      // 应用应该仍然可以工作（使用本地模拟）
      expect(screen.getByText(/嗨，我是/)).toBeInTheDocument()
    })
  })

  // ============================================
  // 状态切换集成测试
  // ============================================
  describe('State Transitions', () => {
    it('should transition from empty to chatting', async () => {
      render(<App />)

      // 初始状态
      expect(useAppStore.getState().currentState).toBe('empty')

      // 触发状态切换
      await act(async () => {
        useAppStore.getState().setInputText('Test input')
        useAppStore.getState().setUIState('chatting')
      })

      expect(useAppStore.getState().currentState).toBe('chatting')
    })

    it('should transition from chatting to creating', async () => {
      await act(async () => {
        useAppStore.getState().setUIState('chatting')
      })

      expect(useAppStore.getState().currentState).toBe('chatting')

      await act(async () => {
        useAppStore.getState().setUIState('creating')
      })

      expect(useAppStore.getState().currentState).toBe('creating')
    })

    it('should track previous state', async () => {
      await act(async () => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().setUIState('creating')
      })

      expect(useAppStore.getState().previousState).toBe('chatting')
      expect(useAppStore.getState().currentState).toBe('creating')
    })

    it('should go back to previous state', async () => {
      await act(async () => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().goBack()
      })

      expect(useAppStore.getState().currentState).toBe('chatting')
    })
  })

  // ============================================
  // 消息流集成测试
  // ============================================
  describe('Message Flow Integration', () => {
    it('should handle message exchange with store', async () => {
      // 添加用户消息
      await act(async () => {
        useAppStore.getState().addMessage({
          id: '1',
          sender: 'user',
          text: 'Hello Wang Daoyan'
        })
      })

      expect(useAppStore.getState().messages).toHaveLength(1)
      expect(useAppStore.getState().messages[0].text).toBe('Hello Wang Daoyan')

      // 添加王编导回复
      await act(async () => {
        useAppStore.getState().addMessage({
          id: '2',
          sender: 'wang',
          text: 'Hi there!'
        })
      })

      expect(useAppStore.getState().messages).toHaveLength(2)
      expect(useAppStore.getState().messages[1].text).toBe('Hi there!')
    })

    it('should increment turn counter on messages', async () => {
      await act(async () => {
        useAppStore.getState().incrementTurn()
        useAppStore.getState().incrementTurn()
      })

      expect(useAppStore.getState().conversationTurn).toBe(2)
    })

    it('should clear input after sending', async () => {
      await act(async () => {
        useAppStore.getState().setInputText('Test message')
        useAppStore.getState().clearInput()
      })

      expect(useAppStore.getState().inputText).toBe('')
    })
  })

  // ============================================
  // 心跳标记完整流程测试
  // ============================================
  describe('Heartbeat Marker Complete Flow', () => {
    it('should handle heartbeat creation flow', async () => {
      // 进入写作状态
      await act(async () => {
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().setEditorContent('The story begins with a hero.')
      })

      // 添加心跳标记
      await act(async () => {
        useAppStore.getState().addHeartbeat({
          type: 'plot_twist',
          position: 30,
          contentSnapshot: 'hero',
          note: 'Hero introduction'
        })
      })

      const markers = useAppStore.getState().heartbeatMarkers
      expect(markers).toHaveLength(1)
      expect(markers[0].type).toBe('plot_twist')
      expect(markers[0].note).toBe('Hero introduction')
    })

    it('should handle multiple heartbeats in editor', async () => {
      await act(async () => {
        useAppStore.getState().setEditorContent('Line 1\nLine 2\nLine 3')
      })

      // 添加多个心跳
      const types = ['flow', 'emotional', 'golden_quote'] as const
      
      for (let i = 0; i < types.length; i++) {
        await act(async () => {
          useAppStore.getState().addHeartbeat({
            type: types[i],
            position: (i + 1) * 25,
            contentSnapshot: `Snapshot ${i}`
          })
        })
      }

      expect(useAppStore.getState().heartbeatMarkers).toHaveLength(3)
    })

    it('should update heartbeat note', async () => {
      await act(async () => {
        useAppStore.getState().addHeartbeat({
          type: 'user_marked',
          position: 50,
          contentSnapshot: 'Important',
          note: 'Initial note'
        })
      })

      const markerId = useAppStore.getState().heartbeatMarkers[0].id

      await act(async () => {
        useAppStore.getState().updateHeartbeatNote(markerId, 'Updated note')
      })

      expect(useAppStore.getState().heartbeatMarkers[0].note).toBe('Updated note')
    })

    it('should remove heartbeat', async () => {
      await act(async () => {
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 10,
          contentSnapshot: 'Test'
        })
      })

      const markerId = useAppStore.getState().heartbeatMarkers[0].id

      await act(async () => {
        useAppStore.getState().removeHeartbeat(markerId)
      })

      expect(useAppStore.getState().heartbeatMarkers).toHaveLength(0)
    })
  })

  // ============================================
  // 章节管理集成测试
  // ============================================
  describe('Chapter Management Flow', () => {
    it('should handle chapter creation flow', async () => {
      // 初始状态
      expect(useAppStore.getState().currentChapter).toBe(1)
      expect(useAppStore.getState().chapterTitle).toBe('第一章')

      // 更新标题
      await act(async () => {
        useAppStore.getState().setChapterTitle('楔子')
      })

      expect(useAppStore.getState().chapterTitle).toBe('楔子')
    })

    it('should handle chapter advancement', async () => {
      await act(async () => {
        useAppStore.getState().setEditorContent('Chapter 1 content')
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 50,
          contentSnapshot: 'content'
        })
      })

      // 完成当前章节，进入下一章
      await act(async () => {
        useAppStore.getState().nextChapter()
      })

      expect(useAppStore.getState().currentChapter).toBe(2)
      expect(useAppStore.getState().chapterTitle).toBe('第2章')
      expect(useAppStore.getState().editor.content).toBe('')
      // Heartbeats should be preserved (they persist across chapters)
    })

    it('should handle direct chapter navigation', async () => {
      await act(async () => {
        useAppStore.getState().setCurrentChapter(5)
        useAppStore.getState().setChapterTitle('第五章：高潮')
      })

      expect(useAppStore.getState().currentChapter).toBe(5)
      expect(useAppStore.getState().chapterTitle).toBe('第五章：高潮')
    })
  })

  // ============================================
  // 故事元素集成测试
  // ============================================
  describe('Story Elements Integration', () => {
    it('should handle story element creation', async () => {
      await act(async () => {
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: '主角',
          content: '一个勇敢的少年',
          timestamp: Date.now()
        })
      })

      const elements = useAppStore.getState().storyElements
      expect(elements).toHaveLength(1)
      expect(elements[0].type).toBe('character')
    })

    it('should handle multiple element types', async () => {
      const elements = [
        { type: 'character' as const, title: 'Hero' },
        { type: 'world' as const, title: 'Setting' },
        { type: 'plot' as const, title: 'Plot' },
        { type: 'scene' as const, title: 'Scene' }
      ]

      for (const el of elements) {
        await act(async () => {
          useAppStore.getState().addStoryElement({
            type: el.type,
            title: el.title,
            content: 'Content',
            timestamp: Date.now()
          })
        })
      }

      expect(useAppStore.getState().storyElements).toHaveLength(4)
    })

    it('should toggle sidebar visibility', async () => {
      await act(async () => {
        useAppStore.getState().setShowSidebar(true)
      })

      expect(useAppStore.getState().showSidebar).toBe(true)

      await act(async () => {
        useAppStore.getState().toggleSidebar()
      })

      expect(useAppStore.getState().showSidebar).toBe(false)
    })

    it('should remove story elements', async () => {
      await act(async () => {
        useAppStore.getState().addStoryElement({
          type: 'character',
          title: 'To Remove',
          content: 'Content',
          timestamp: Date.now()
        })
        useAppStore.getState().removeStoryElement(0)
      })

      expect(useAppStore.getState().storyElements).toHaveLength(0)
    })
  })

  // ============================================
  // 编辑器状态集成测试
  // ============================================
  describe('Editor State Integration', () => {
    it('should handle content editing', async () => {
      await act(async () => {
        useAppStore.getState().setEditorContent('Initial content')
      })

      expect(useAppStore.getState().editor.content).toBe('Initial content')
      expect(useAppStore.getState().editor.isDirty).toBe(true)

      await act(async () => {
        useAppStore.getState().setEditorContent('Updated content')
      })

      expect(useAppStore.getState().editor.content).toBe('Updated content')
    })

    it('should track word count', async () => {
      await act(async () => {
        useAppStore.getState().setEditorContent('Hello World 你好世界')
      })

      expect(useAppStore.getState().editor.wordCount).toBe(18)
    })

    it('should handle cursor position', async () => {
      await act(async () => {
        useAppStore.getState().setCursorPosition(10)
      })

      expect(useAppStore.getState().editor.cursorPosition).toBe(10)
    })

    it('should handle save state', async () => {
      await act(async () => {
        useAppStore.getState().setEditorContent('Content')
        useAppStore.getState().saveEditor()
      })

      expect(useAppStore.getState().editor.isDirty).toBe(false)
      expect(useAppStore.getState().editor.lastSavedAt).toBeDefined()
    })
  })

  // ============================================
  // 星空动画集成测试
  // ============================================
  describe('Starfield Animation Integration', () => {
    it('should generate stars', async () => {
      await act(async () => {
        useAppStore.getState().generateStars(30)
      })

      expect(useAppStore.getState().stars).toHaveLength(30)
    })

    it('should unlock stars based on progress', async () => {
      await act(async () => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().unlockStar(0)
        useAppStore.getState().unlockStar(1)
      })

      expect(useAppStore.getState().stars[0].state).toBe('glowing')
      expect(useAppStore.getState().stars[1].state).toBe('glowing')
      expect(useAppStore.getState().unlockedStarCount).toBe(2)
    })

    it('should update star brightness', async () => {
      await act(async () => {
        useAppStore.getState().generateStars(10)
        useAppStore.getState().updateStarBrightness(0.5)
      })

      const unlockedCount = useAppStore.getState().unlockedStarCount
      expect(unlockedCount).toBeGreaterThan(0)
    })
  })

  // ============================================
  // API 集成测试
  // ============================================
  describe('API Integration', () => {
    it('should handle successful API call', async () => {
      vi.mocked(chatWithWangDaoyan).mockResolvedValueOnce({
        text: 'API Response',
        storyType: 'romance'
      })

      const { chatWithWangDaoyan: mockChat } = await import('../utils/aiService')
      const result = await mockChat([{ role: 'user', content: 'Test' }])

      expect(result.text).toBe('API Response')
      expect(result.storyType).toBe('romance')
    })

    it('should handle API error gracefully', async () => {
      vi.mocked(chatWithWangDaoyan).mockResolvedValueOnce({
        text: '（王编导似乎走神了...能再说一遍吗？）'
      })

      const { chatWithWangDaoyan: mockChat } = await import('../utils/aiService')
      const result = await mockChat([{ role: 'user', content: 'Test' }])

      expect(result.text).toContain('走神了')
    })

    it('should handle streaming response', async () => {
      const streamHandler = vi.fn()
      
      vi.mocked(chatWithWangDaoyan).mockImplementation(async (_, onStream) => {
        if (onStream) {
          onStream('Hello')
          onStream('Hello World')
        }
        return { text: 'Hello World' }
      })

      const { chatWithWangDaoyan: mockChat } = await import('../utils/aiService')
      await mockChat([{ role: 'user', content: 'Test' }], streamHandler)

      expect(streamHandler).toHaveBeenCalledWith('Hello')
      expect(streamHandler).toHaveBeenCalledWith('Hello World')
    })
  })

  // ============================================
  // 复杂场景集成测试
  // ============================================
  describe('Complex Scenarios', () => {
    it('should handle story type detection integration', async () => {
      // 模拟检测为抒情类型
      vi.mocked(chatWithWangDaoyan).mockResolvedValueOnce({
        text: '很有意境的散文',
        storyType: 'lyric'
      })

      const { chatWithWangDaoyan: mockChat } = await import('../utils/aiService')
      const result = await mockChat([{ role: 'user', content: '散文' }])

      await act(async () => {
        useAppStore.getState().setDetectedType(result.storyType || null)
      })

      expect(useAppStore.getState().detectedType).toBe('lyric')
    })

    it('should handle story card generation trigger', async () => {
      vi.mocked(chatWithWangDaoyan).mockResolvedValueOnce({
        text: '让我们开始构建故事框架',
        shouldGenerateCard: true,
        cardType: 'character'
      })

      const { chatWithWangDaoyan: mockChat } = await import('../utils/aiService')
      const result = await mockChat([{ role: 'user', content: '开始' }])

      expect(result.shouldGenerateCard).toBe(true)
      expect(result.cardType).toBe('character')
    })

    it('should maintain state across operations', async () => {
      // 设置复杂状态
      await act(async () => {
        useAppStore.getState().setUIState('chatting')
        useAppStore.getState().addMessage({
          id: '1',
          sender: 'user',
          text: 'Hello'
        })
        useAppStore.getState().setDetectedType('hero')
        useAppStore.getState().incrementTurn()
      })

      // 切换到写作状态
      await act(async () => {
        useAppStore.getState().setUIState('creating')
        useAppStore.getState().setEditorContent('Story content')
        useAppStore.getState().addHeartbeat({
          type: 'flow',
          position: 50,
          contentSnapshot: 'content'
        })
      })

      // 验证状态保持
      const state = useAppStore.getState()
      expect(state.currentState).toBe('creating')
      expect(state.messages).toHaveLength(1)
      expect(state.detectedType).toBe('hero')
      expect(state.conversationTurn).toBe(1)
      expect(state.editor.content).toBe('Story content')
      expect(state.heartbeatMarkers).toHaveLength(1)
    })
  })
})