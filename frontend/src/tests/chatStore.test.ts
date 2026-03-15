import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '../stores/chatStore'
import { act } from 'react'

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useChatStore.getState().initWelcomeMessage()
    })
  })

  describe('messages', () => {
    it('should have welcome message on init', () => {
      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].sender).toBe('wang')
      expect(messages[0].text).toContain('王编导')
    })

    it('should add new message', () => {
      act(() => {
        useChatStore.getState().addMessage({
          id: 'test-1',
          sender: 'user',
          text: 'Test message',
          type: 'text'
        })
      })

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(2)
      expect(messages[1].text).toBe('Test message')
    })

    it('should set messages', () => {
      act(() => {
        useChatStore.getState().setMessages([
          { id: '1', sender: 'wang', text: 'Hi', type: 'text' }
        ])
      })

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0].text).toBe('Hi')
    })
  })

  describe('input', () => {
    it('should set input text', () => {
      act(() => {
        useChatStore.getState().setInputText('Hello')
      })

      expect(useChatStore.getState().inputText).toBe('Hello')
    })

    it('should clear input', () => {
      act(() => {
        useChatStore.getState().setInputText('Hello')
        useChatStore.getState().clearInput()
      })

      expect(useChatStore.getState().inputText).toBe('')
    })
  })

  describe('typing state', () => {
    it('should set typing state', () => {
      act(() => {
        useChatStore.getState().setIsTyping(true)
      })

      expect(useChatStore.getState().isTyping).toBe(true)
    })

    it('should set streaming text', () => {
      act(() => {
        useChatStore.getState().setStreamingText('Hello')
      })

      expect(useChatStore.getState().streamingText).toBe('Hello')
    })
  })

  describe('story elements', () => {
    it('should add story element', () => {
      act(() => {
        useChatStore.getState().addStoryElement({
          type: 'character',
          title: '主角',
          content: '勇敢的年轻人',
          timestamp: Date.now()
        })
      })

      const { storyElements } = useChatStore.getState()
      expect(storyElements).toHaveLength(1)
      expect(storyElements[0].title).toBe('主角')
    })

    it('should toggle sidebar', () => {
      act(() => {
        useChatStore.getState().toggleSidebar()
      })

      expect(useChatStore.getState().showSidebar).toBe(true)

      act(() => {
        useChatStore.getState().toggleSidebar()
      })

      expect(useChatStore.getState().showSidebar).toBe(false)
    })

    it('should set sidebar visibility', () => {
      act(() => {
        useChatStore.getState().setShowSidebar(true)
      })

      expect(useChatStore.getState().showSidebar).toBe(true)
    })
  })

  describe('conversation context', () => {
    it('should increment turn', () => {
      act(() => {
        useChatStore.getState().incrementTurn()
        useChatStore.getState().incrementTurn()
      })

      expect(useChatStore.getState().conversationTurn).toBe(2)
    })

    it('should set detected type', () => {
      act(() => {
        useChatStore.getState().setDetectedType('romance')
      })

      expect(useChatStore.getState().detectedType).toBe('romance')
    })

    it('should set backend availability', () => {
      act(() => {
        useChatStore.getState().setBackendAvailable(true)
      })

      expect(useChatStore.getState().backendAvailable).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      act(() => {
        useChatStore.getState().addMessage({
          id: 'test',
          sender: 'user',
          text: 'Test',
          type: 'text'
        })
        useChatStore.getState().setInputText('Input')
        useChatStore.getState().setDetectedType('hero')
        useChatStore.getState().initWelcomeMessage()
      })

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.inputText).toBe('')
      expect(state.detectedType).toBeNull()
    })
  })
})
