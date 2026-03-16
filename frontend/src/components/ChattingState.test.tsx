import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChattingState } from './ChattingState'
import { useAppStore } from '../stores'

// Mock stores
vi.mock('../stores', () => ({
  useAppStore: vi.fn()
}))

describe('ChattingState Component', () => {
  const createMockStore = (overrides = {}) => ({
    messages: [
      {
        id: 'welcome',
        sender: 'wang' as const,
        text: 'Welcome message',
        type: 'text' as const
      }
    ],
    inputText: '',
    isTyping: false,
    streamingText: '',
    storyElements: [],
    showSidebar: false,
    detectedType: null,
    stars: [],
    unlockedStarCount: 0,
    addMessage: vi.fn(),
    setInputText: vi.fn(),
    clearInput: vi.fn(),
    setIsTyping: vi.fn(),
    setStreamingText: vi.fn(),
    toggleSidebar: vi.fn(),
    setShowSidebar: vi.fn(),
    incrementTurn: vi.fn().mockReturnValue(1),
    addStoryElement: vi.fn(),
    unlockStar: vi.fn(),
    ...overrides
  })

  let mockStore = createMockStore()

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore = createMockStore()
    vi.mocked(useAppStore).mockReturnValue(mockStore)
  })

  describe('Rendering', () => {
    it('should render header with title', () => {
      render(<ChattingState />)
      
      expect(screen.getByText('HeroPath')).toBeInTheDocument()
    })

    it('should render welcome message', () => {
      render(<ChattingState />)
      
      expect(screen.getByText('Welcome message')).toBeInTheDocument()
    })

    it('should render input textarea', () => {
      render(<ChattingState />)
      
      expect(screen.getByPlaceholderText(/告诉王编导你的想法/)).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(<ChattingState />)
      
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
    })
  })

  describe('Message Display', () => {
    it('should render multiple messages', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: 'First', type: 'text' },
          { id: '2', sender: 'user', text: 'Second', type: 'text' },
          { id: '3', sender: 'wang', text: 'Third', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })

    it('should display sender names', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: 'Hello', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('王编导')).toBeInTheDocument()
    })

    it('should display user name', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'user', text: 'Hello', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('你')).toBeInTheDocument()
    })

    it('should render story card message', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { 
            id: '1', 
            sender: 'wang', 
            text: 'Check this out', 
            type: 'story-card',
            metadata: { title: 'Card Title', content: 'Card content' }
          }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })
  })

  describe('Typing State', () => {
    it('should show thinking indicator when typing', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        isTyping: true,
        streamingText: ''
      }))

      render(<ChattingState />)
      
      // Should show three bouncing dots
      const dots = document.querySelectorAll('.animate-bounce')
      expect(dots.length).toBeGreaterThan(0)
    })

    it('should show streaming text', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        isTyping: true,
        streamingText: 'Streaming content'
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('Streaming content')).toBeInTheDocument()
    })

    it('should show typing status in footer', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        isTyping: true
      }))

      render(<ChattingState />)
      
      expect(screen.getByText(/王编导正在思考/)).toBeInTheDocument()
    })
  })

  describe('Input Interactions', () => {
    it('should call setInputText on change', () => {
      render(<ChattingState />)
      
      const textarea = screen.getByPlaceholderText(/告诉王编导你的想法/)
      fireEvent.change(textarea, { target: { value: 'New message' } })
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('New message')
    })

    it('should enable send button with input', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        inputText: 'Test message'
      }))

      render(<ChattingState />)
      
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      expect(sendButton).not.toBeDisabled()
    })

    it('should disable send button when empty', () => {
      render(<ChattingState />)
      
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      expect(sendButton).toBeDisabled()
    })

    it('should disable send button when typing', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        inputText: 'Test',
        isTyping: true
      }))

      render(<ChattingState />)
      
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Sidebar', () => {
    it('should toggle sidebar on button click', () => {
      render(<ChattingState />)
      
      const sidebarButton = screen.getByText('📋')
      fireEvent.click(sidebarButton)
      
      expect(mockStore.toggleSidebar).toHaveBeenCalled()
    })

    it('should show sidebar when enabled', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        showSidebar: true,
        storyElements: [
          { type: 'character', title: 'Hero', content: 'Main character', timestamp: Date.now() }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('故事大纲')).toBeInTheDocument()
      expect(screen.getByText('Hero')).toBeInTheDocument()
    })

    it('should show empty state when no story elements', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        showSidebar: true,
        storyElements: []
      }))

      render(<ChattingState />)
      
      expect(screen.getByText(/故事元素会在这里生长出来/)).toBeInTheDocument()
    })
  })

  describe('Story Elements', () => {
    it('should display detected type', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        detectedType: 'romance'
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('言情')).toBeInTheDocument()
    })

    it('should display lyric type', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        detectedType: 'lyric'
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('抒情散文')).toBeInTheDocument()
    })

    it('should display hero type', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        detectedType: 'hero'
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('英雄之旅')).toBeInTheDocument()
    })
  })

  describe('Start Creating Button', () => {
    it('should show start creating button after enough messages', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: '1', type: 'text' },
          { id: '2', sender: 'user', text: '2', type: 'text' },
          { id: '3', sender: 'wang', text: '3', type: 'text' },
          { id: '4', sender: 'user', text: '4', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('开始创作')).toBeInTheDocument()
    })

    it('should call onStartCreating when clicked', () => {
      const onStartCreating = vi.fn()
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: '1', type: 'text' },
          { id: '2', sender: 'user', text: '2', type: 'text' },
          { id: '3', sender: 'wang', text: '3', type: 'text' },
          { id: '4', sender: 'user', text: '4', type: 'text' }
        ]
      }))

      render(<ChattingState onStartCreating={onStartCreating} />)
      
      const button = screen.getByText('开始创作')
      fireEvent.click(button)
      
      expect(onStartCreating).toHaveBeenCalled()
    })
  })

  describe('Suggested Responses', () => {
    it('should show suggestion buttons', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: 'Hello', type: 'text' },
          { id: '2', sender: 'user', text: 'Hi', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      expect(screen.getByText('久别重逢')).toBeInTheDocument()
      expect(screen.getByText('擦肩而过')).toBeInTheDocument()
    })

    it('should set input text on suggestion click', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: 'Hello', type: 'text' },
          { id: '2', sender: 'user', text: 'Hi', type: 'text' }
        ]
      }))

      render(<ChattingState />)
      
      fireEvent.click(screen.getByText('久别重逢'))
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('久别重逢')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Enter key for sending', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        inputText: 'Test message'
      }))

      render(<ChattingState />)
      
      const textarea = screen.getByPlaceholderText(/告诉王编导你的想法/)
      fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 })
      
      // Should trigger send
      expect(mockStore.setIsTyping).toHaveBeenCalledWith(true)
    })
  })
})