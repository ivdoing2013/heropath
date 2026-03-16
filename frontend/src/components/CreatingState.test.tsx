import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreatingState } from './CreatingState'
import { useAppStore } from '../stores'

// Mock stores
vi.mock('../stores', () => ({
  useAppStore: vi.fn()
}))

describe('CreatingState Component', () => {
  const createMockStore = (overrides = {}) => ({
    heartbeatMarkers: [],
    editor: {
      content: '',
      cursorPosition: 0,
      wordCount: 0,
      isDirty: false,
      lastSavedAt: undefined
    },
    chapterTitle: '第一章',
    currentChapter: 1,
    detectedType: 'romance',
    storyElements: [],
    messages: [],
    isTyping: false,
    setEditorContent: vi.fn(),
    setCursorPosition: vi.fn(),
    saveEditor: vi.fn(),
    markDirty: vi.fn(),
    addHeartbeat: vi.fn(),
    setChapterTitle: vi.fn(),
    nextChapter: vi.fn(),
    addMessage: vi.fn(),
    setIsTyping: vi.fn(),
    ...overrides
  })

  let mockStore = createMockStore()

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore = createMockStore()
    vi.mocked(useAppStore).mockReturnValue(mockStore)
  })

  describe('Rendering', () => {
    it('should render editor container', () => {
      render(<CreatingState />)
      
      expect(screen.getByPlaceholderText(/开始你的创作/)).toBeInTheDocument()
    })

    it('should render chapter title', () => {
      render(<CreatingState />)
      
      expect(screen.getByDisplayValue('第一章')).toBeInTheDocument()
    })

    it('should render back button', () => {
      render(<CreatingState />)
      
      expect(screen.getByText(/返回对话/)).toBeInTheDocument()
    })

    it('should render complete chapter button', () => {
      render(<CreatingState />)
      
      expect(screen.getByText('完成本章')).toBeInTheDocument()
    })

    it('should render heartbeat count', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        heartbeatMarkers: [
          { id: '1', type: 'flow', position: 10, contentSnapshot: 'A', timestamp: Date.now() }
        ]
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('1 个心跳')).toBeInTheDocument()
    })

    it('should render word count', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        editor: {
          content: 'Test content',
          cursorPosition: 0,
          wordCount: 12,
          isDirty: false
        }
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('12 字')).toBeInTheDocument()
    })
  })

  describe('Editor Functionality', () => {
    it('should call setEditorContent on input', () => {
      render(<CreatingState />)
      
      const textarea = screen.getByPlaceholderText(/开始你的创作/)
      fireEvent.change(textarea, { target: { value: 'New content' } })
      
      expect(mockStore.setEditorContent).toHaveBeenCalledWith('New content')
    })

    it('should show dirty indicator', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        editor: {
          content: 'Content',
          cursorPosition: 0,
          wordCount: 7,
          isDirty: true
        }
      }))

      render(<CreatingState />)
      
      expect(document.querySelector('.text-amber-400')).toBeInTheDocument()
    })

    it('should display keyboard shortcuts', () => {
      render(<CreatingState />)
      
      expect(screen.getByText(/Ctrl\+H 标记心跳/)).toBeInTheDocument()
      expect(screen.getByText(/Ctrl\+S 保存/)).toBeInTheDocument()
    })
  })

  describe('Chapter Management', () => {
    it('should call onBack when back button clicked', () => {
      const onBack = vi.fn()
      render(<CreatingState onBack={onBack} />)
      
      fireEvent.click(screen.getByText(/返回对话/))
      
      expect(onBack).toHaveBeenCalled()
    })

    it('should show complete chapter modal', () => {
      render(<CreatingState />)
      
      fireEvent.click(screen.getByText('完成本章'))
      
      expect(screen.getByText('本章完成！')).toBeInTheDocument()
    })

    it('should show chapter stats in modal', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        editor: { content: 'Content', cursorPosition: 0, wordCount: 7, isDirty: false },
        heartbeatMarkers: [
          { id: '1', type: 'flow', position: 10, contentSnapshot: 'A', timestamp: Date.now() },
          { id: '2', type: 'emotional', position: 20, contentSnapshot: 'B', timestamp: Date.now() }
        ]
      }))

      render(<CreatingState />)
      fireEvent.click(screen.getByText('完成本章'))
      
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should call nextChapter when confirming completion', () => {
      render(<CreatingState />)
      
      fireEvent.click(screen.getByText('完成本章'))
      fireEvent.click(screen.getByText('下一章'))
      
      expect(mockStore.nextChapter).toHaveBeenCalled()
    })

    it('should close modal on cancel', () => {
      render(<CreatingState />)
      
      fireEvent.click(screen.getByText('完成本章'))
      fireEvent.click(screen.getByText('继续编辑'))
      
      expect(screen.queryByText('本章完成！')).not.toBeInTheDocument()
    })

    it('should call onComplete when completing chapter', () => {
      const onComplete = vi.fn()
      render(<CreatingState onComplete={onComplete} />)
      
      fireEvent.click(screen.getByText('完成本章'))
      fireEvent.click(screen.getByText('下一章'))
      
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('Chapter Title', () => {
    it('should update chapter title', () => {
      render(<CreatingState />)
      
      const titleInput = screen.getByDisplayValue('第一章')
      fireEvent.change(titleInput, { target: { value: '楔子' } })
      
      expect(mockStore.setChapterTitle).toHaveBeenCalledWith('楔子')
    })

    it('should display chapter number', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        currentChapter: 5
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('第 5 章')).toBeInTheDocument()
    })
  })

  describe('Story Map Panel', () => {
    it('should show story type info', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        detectedType: 'romance'
      }))

      render(<CreatingState />)
      
      // Panel should show romance info
      expect(document.body.textContent).toContain('言情')
    })

    it('should show story elements', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        storyElements: [
          { type: 'character', title: 'Hero', content: 'Main character', timestamp: Date.now() }
        ]
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('Hero')).toBeInTheDocument()
    })

    it('should show empty state for story elements', () => {
      render(<CreatingState />)
      
      expect(screen.getByText(/暂无故事要素/)).toBeInTheDocument()
    })
  })

  describe('Wang Daoyan Panel', () => {
    it('should show wang daoyan panel', () => {
      render(<CreatingState />)
      
      expect(screen.getByText('王编导')).toBeInTheDocument()
    })

    it('should show recent messages', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        messages: [
          { id: '1', sender: 'wang', text: 'Hello', type: 'text' },
          { id: '2', sender: 'user', text: 'Hi', type: 'text' }
        ]
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi')).toBeInTheDocument()
    })

    it('should show thinking indicator when typing', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        isTyping: true
      }))

      render(<CreatingState />)
      
      const dots = document.querySelectorAll('.animate-bounce')
      expect(dots.length).toBeGreaterThan(0)
    })
  })

  describe('Heartbeat Markers', () => {
    it('should render heartbeat markers', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        heartbeatMarkers: [
          { id: '1', type: 'flow', position: 30, contentSnapshot: 'Text', timestamp: Date.now() }
        ]
      }))

      render(<CreatingState />)
      
      // Heartbeat marker should be rendered
      expect(screen.getByText('💫')).toBeInTheDocument()
    })

    it('should render all heartbeat types', () => {
      vi.mocked(useAppStore).mockReturnValue(createMockStore({
        heartbeatMarkers: [
          { id: '1', type: 'flow', position: 10, contentSnapshot: 'A', timestamp: Date.now() },
          { id: '2', type: 'emotional', position: 20, contentSnapshot: 'B', timestamp: Date.now() },
          { id: '3', type: 'golden_quote', position: 30, contentSnapshot: 'C', timestamp: Date.now() },
          { id: '4', type: 'plot_twist', position: 40, contentSnapshot: 'D', timestamp: Date.now() },
          { id: '5', type: 'user_marked', position: 50, contentSnapshot: 'E', timestamp: Date.now() }
        ]
      }))

      render(<CreatingState />)
      
      expect(screen.getByText('💫')).toBeInTheDocument()
      expect(screen.getByText('💗')).toBeInTheDocument()
      expect(screen.getByText('✨')).toBeInTheDocument()
      expect(screen.getByText('🎭')).toBeInTheDocument()
      expect(screen.getByText('📌')).toBeInTheDocument()
    })
  })

  describe('Panel Toggles', () => {
    it('should toggle left panel', () => {
      render(<CreatingState />)
      
      const toggleButton = screen.getAllByText('◀')[0]
      fireEvent.click(toggleButton)
      
      // Panel should be collapsed
      expect(screen.getByText('▶')).toBeInTheDocument()
    })

    it('should toggle right panel', () => {
      render(<CreatingState />)
      
      const toggleButtons = screen.getAllByText('▶')
      fireEvent.click(toggleButtons[toggleButtons.length - 1])
      
      // Panel should be collapsed
      expect(screen.getAllByText('◀').length).toBeGreaterThan(0)
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+S for save', () => {
      render(<CreatingState />)
      
      const textarea = screen.getByPlaceholderText(/开始你的创作/)
      fireEvent.keyDown(textarea, { key: 's', ctrlKey: true })
      
      expect(mockStore.saveEditor).toHaveBeenCalled()
    })

    it('should handle Cmd+S for save on Mac', () => {
      render(<CreatingState />)
      
      const textarea = screen.getByPlaceholderText(/开始你的创作/)
      fireEvent.keyDown(textarea, { key: 's', metaKey: true })
      
      expect(mockStore.saveEditor).toHaveBeenCalled()
    })
  })
})