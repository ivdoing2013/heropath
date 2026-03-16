import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { useAppStore } from '../stores'

// Mock stores
vi.mock('../stores', () => ({
  useAppStore: vi.fn()
}))

describe('EmptyState Component', () => {
  const mockStore = {
    stars: [],
    wangDaoyan: { status: 'waiting' as const },
    inputText: '',
    setInputText: vi.fn(),
    setWangDaoyanStatus: vi.fn(),
    setUIState: vi.fn(),
    initApp: vi.fn(),
    generateStars: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppStore).mockReturnValue(mockStore)
  })

  describe('Rendering', () => {
    it('should render welcome message', () => {
      render(<EmptyState />)
      
      expect(screen.getByText(/嗨，我是/)).toBeInTheDocument()
      expect(screen.getByText('王编导')).toBeInTheDocument()
    })

    it('should render subtitle', () => {
      render(<EmptyState />)
      
      expect(screen.getByText(/在这文字的星辰大海里/)).toBeInTheDocument()
    })

    it('should render input field', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render hint text', () => {
      render(<EmptyState />)
      
      expect(screen.getByText(/按 Enter 开始对话/)).toBeInTheDocument()
    })
  })

  describe('Input Interactions', () => {
    it('should call setInputText on input change', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'Test input' } })
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('Test input')
    })

    it('should call setWangDaoyanStatus on focus', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      
      expect(mockStore.setWangDaoyanStatus).toHaveBeenCalledWith('listening')
    })

    it('should reset wang status on blur when input is empty', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(mockStore.setWangDaoyanStatus).toHaveBeenCalledWith('waiting')
    })

    it('should not reset wang status on blur when input has content', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Some text'
      })

      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      // Should not call with 'waiting' when input has content
      const calls = mockStore.setWangDaoyanStatus.mock.calls
      expect(calls.filter(call => call[0] === 'waiting').length).toBe(0)
    })

    it('should enable send button when input has text', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Test text'
      })

      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should disable send button when input is empty', () => {
      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should call initApp and setUIState on button click', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Test message'
      })

      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockStore.initApp).toHaveBeenCalled()
      expect(mockStore.setUIState).toHaveBeenCalledWith('chatting')
    })

    it('should call onStart callback when provided', () => {
      const onStart = vi.fn()
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Test message'
      })

      render(<EmptyState onStart={onStart} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(onStart).toHaveBeenCalled()
    })

    it('should submit on Enter key press', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Test message'
      })

      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
      
      // Should attempt to transition
      expect(mockStore.initApp).toHaveBeenCalled()
    })

    it('should not submit when input is empty', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
      
      expect(mockStore.initApp).not.toHaveBeenCalled()
    })

    it('should not submit when button is clicked with empty input', () => {
      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockStore.initApp).not.toHaveBeenCalled()
    })
  })

  describe('Star Animation', () => {
    it('should generate stars on mount', () => {
      render(<EmptyState />)
      
      // Stars should be generated via useEffect
      expect(mockStore.generateStars).toHaveBeenCalledWith(60)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible input', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have accessible button', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        inputText: 'Test'
      })

      render(<EmptyState />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Placeholder Rotation', () => {
    it('should display placeholder text', () => {
      render(<EmptyState />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder')
    })
  })

  describe('Avatar Click', () => {
    it('should change status on avatar click', () => {
      render(<EmptyState />)
      
      // Find and click the avatar container
      const avatar = document.querySelector('.cursor-pointer')
      if (avatar) {
        fireEvent.click(avatar)
        expect(mockStore.setWangDaoyanStatus).toHaveBeenCalledWith('thinking')
      }
    })
  })
})