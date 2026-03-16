import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  chatWithWangDaoyan,
  mockChatWithWangDaoyan,
  checkBackendHealth,
  type ChatMessage,
  type WangDaoyanResponse
} from './aiService'

// Mock environment variables
const mockEnv = { VITE_API_BASE_URL: 'https://test-api.example.com' }
vi.stubGlobal('import', { meta: { env: mockEnv } })

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ============================================
  // Backend Health Check Tests
  // ============================================
  describe('checkBackendHealth', () => {
    it('should return true when backend responds with OK', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

      const result = await checkBackendHealth()

      expect(result).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should return false when backend responds with error', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const result = await checkBackendHealth()

      expect(result).toBe(false)
    })

    it('should return false on network error', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await checkBackendHealth()

      expect(result).toBe(false)
    })

    it('should return false on timeout', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Timeout'))

      const result = await checkBackendHealth()

      expect(result).toBe(false)
    })
  })

  // ============================================
  // Mock Chat Tests
  // ============================================
  describe('mockChatWithWangDaoyan', () => {
    it('should return welcome response for turn 0', async () => {
      const response = await mockChatWithWangDaoyan('Hello', 0)

      expect(response.text).toContain('有意思')
      expect(response.storyType).toBeNull()
      expect(response.shouldGenerateCard).toBeFalsy()
    })

    it('should return romance type for turn 1', async () => {
      const response = await mockChatWithWangDaoyan('Love story', 1)

      expect(response.storyType).toBe('romance')
    })

    it('should suggest card generation for turn 2', async () => {
      const response = await mockChatWithWangDaoyan('Start building', 2)

      expect(response.shouldGenerateCard).toBe(true)
      expect(response.cardType).toBe('character')
      expect(response.storyType).toBe('hero')
    })

    it('should handle turn beyond available responses', async () => {
      const response = await mockChatWithWangDaoyan('Test', 10)

      // Should return last available response
      expect(response.text).toBeDefined()
    })

    it('should introduce delay', async () => {
      const startTime = Date.now()
      await mockChatWithWangDaoyan('Test', 0)
      const elapsed = Date.now() - startTime

      expect(elapsed).toBeGreaterThanOrEqual(900) // ~1000ms delay
    })
  })

  // ============================================
  // Real Chat API Tests
  // ============================================
  describe('chatWithWangDaoyan - Non-streaming', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' }
    ]

    it('should call backend API with correct parameters', async () => {
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
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: mockMessages,
            stream: false
          })
        })
      )
      expect(result.text).toBe('你好！我是王编导。')
    })

    it('should parse story type from response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这是一个关于爱情的故事，感情丰富，关于相遇和重逢。'
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

    it('should handle empty response content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: ''
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)

      expect(result.text).toBe('')
    })

    it('should handle missing choices', async () => {
      const mockResponse = {}

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(mockMessages)

      expect(result.text).toBe('')
    })
  })

  // ============================================
  // Streaming Tests
  // ============================================
  describe('chatWithWangDaoyan - Streaming', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' }
    ]

    it('should call API with stream enabled when onStream provided', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'))
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            controller.close()
          }
        })
      } as Response)

      const onStream = vi.fn()
      await chatWithWangDaoyan(mockMessages, onStream)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          body: JSON.stringify({
            messages: mockMessages,
            stream: true
          })
        })
      )
    })

    it('should stream content chunks', async () => {
      const streamData = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" World"}}]}\n\n',
        'data: [DONE]\n\n'
      ]

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          async start(controller) {
            for (const chunk of streamData) {
              controller.enqueue(new TextEncoder().encode(chunk))
            }
            controller.close()
          }
        })
      } as Response)

      const onStream = vi.fn()
      await chatWithWangDaoyan(mockMessages, onStream)

      expect(onStream).toHaveBeenCalledWith('Hello')
      expect(onStream).toHaveBeenCalledWith('Hello World')
    })

    it('should handle stream errors gracefully', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.error(new Error('Stream error'))
          }
        })
      } as Response)

      const onStream = vi.fn()
      const result = await chatWithWangDaoyan(mockMessages, onStream)

      expect(result.text).toContain('走神了')
    })

    it('should handle malformed stream data', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: invalid json\n\n'))
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            controller.close()
          }
        })
      } as Response)

      const onStream = vi.fn()
      const result = await chatWithWangDaoyan(mockMessages, onStream)

      // Should not crash and return result
      expect(result).toBeDefined()
    })

    it('should handle empty stream body', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        body: null
      } as Response)

      const onStream = vi.fn()
      const result = await chatWithWangDaoyan(mockMessages, onStream)

      expect(result.text).toContain('走神了')
    })
  })

  // ============================================
  // Type Detection Tests
  // ============================================
  describe('Story Type Detection', () => {
    const testCases: Array<{ input: string; expectedType: WangDaoyanResponse['storyType'] }> = [
      { input: '这是一个抒情散文', expectedType: 'lyric' },
      { input: '这篇散文意境很美', expectedType: 'lyric' },
      { input: '爱情故事', expectedType: 'romance' },
      { input: '感情纠葛', expectedType: 'romance' },
      { input: '英雄冒险', expectedType: 'hero' },
      { input: '成长之旅', expectedType: 'hero' },
      { input: '普通的故事', expectedType: undefined }
    ]

    testCases.forEach(({ input, expectedType }) => {
      it(`should detect ${expectedType || 'no type'} from "${input}"`, async () => {
        const mockResponse = {
          choices: [{
            message: {
              content: input
            }
          }]
        }

        vi.mocked(globalThis.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        } as Response)

        const result = await chatWithWangDaoyan([{ role: 'user', content: 'test' }])

        expect(result.storyType).toBe(expectedType)
      })
    })
  })

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle multiple messages in history', async () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'First message' },
        { role: 'assistant', content: 'First response' },
        { role: 'user', content: 'Second message' }
      ]

      const mockResponse = {
        choices: [{
          message: {
            content: 'Response'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(messages)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(JSON.stringify(messages).slice(1, -1))
        })
      )
      expect(result.text).toBe('Response')
    })

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000)
      const messages: ChatMessage[] = [{ role: 'user', content: longMessage }]

      const mockResponse = {
        choices: [{
          message: {
            content: 'Response'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan(messages)

      expect(globalThis.fetch).toHaveBeenCalled()
      expect(result.text).toBe('Response')
    })

    it('should handle special characters in response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Special: <>&"\'\n\t🎉'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await chatWithWangDaoyan([{ role: 'user', content: 'test' }])

      expect(result.text).toBe('Special: <>&"\'\n\t🎉')
    })

    it('should handle concurrent requests', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Response'
          }
        }]
      }

      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const promises = [
        chatWithWangDaoyan([{ role: 'user', content: '1' }]),
        chatWithWangDaoyan([{ role: 'user', content: '2' }]),
        chatWithWangDaoyan([{ role: 'user', content: '3' }])
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.text).toBe('Response')
      })
    })
  })
})