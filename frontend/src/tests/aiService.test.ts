import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  chatWithWangDaoyan,
  mockChatWithWangDaoyan,
  checkBackendHealth,
  type ChatMessage
} from '../utils/aiService'

// Mock fetch
globalThis.fetch = vi.fn()

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkBackendHealth', () => {
    it('should return true when backend is available', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

      const result = await checkBackendHealth()
      expect(result).toBe(true)
    })

    it('should return false when backend is unavailable', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await checkBackendHealth()
      expect(result).toBe(false)
    })
  })

  describe('mockChatWithWangDaoyan', () => {
    it('should return welcome response for first turn', async () => {
      const response = await mockChatWithWangDaoyan('你好', 0)
      
      expect(response.text).toContain('有意思')
      expect(response.storyType).toBeNull()
    })

    it('should detect romance type on second turn', async () => {
      const response = await mockChatWithWangDaoyan('爱情故事', 1)
      
      expect(response.storyType).toBe('romance')
    })

    it('should generate card on third turn', async () => {
      const response = await mockChatWithWangDaoyan('开始构建', 2)
      
      expect(response.shouldGenerateCard).toBe(true)
      expect(response.cardType).toBe('character')
    })
  })

  describe('chatWithWangDaoyan', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: '你好' }
    ]

    it('should call DeepSeek API with correct parameters', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '你好！我是王编导。'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )
      expect(result.text).toBe('你好！我是王编导。')
    })

    it('should parse story type from response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这是一个关于爱情的故事，很抒情。'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.storyType).toBe('romance')
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('API error'))

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.text).toContain('走神了')
    })

    it('should handle non-ok response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.text).toContain('走神了')
    })

    it('should detect lyric type', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这篇散文很有意境，抒情色彩浓厚。'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.storyType).toBe('lyric')
    })

    it('should detect hero type', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这是一个英雄的冒险故事，充满成长。'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.storyType).toBe('hero')
    })

    it('should trigger card generation when appropriate', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '好的，让我们开始构建故事框架吧！'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)
      
      expect(result.shouldGenerateCard).toBe(true)
    })
  })
})
