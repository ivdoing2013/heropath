import { jest } from '@jest/globals'
import { ChatService } from '../services/chat'
import { ConversationModel } from '../models'

// Mock the OpenAI module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  }
})

// Mock the ConversationModel
jest.mock('../models', () => ({
  ConversationModel: {
    create: jest.fn().mockResolvedValue({}),
    findByChapterId: jest.fn().mockResolvedValue([]),
    findByNovelId: jest.fn().mockResolvedValue([]),
    findRecent: jest.fn().mockResolvedValue([])
  }
}))

// Mock environment variables
process.env.DEEPSEEK_API_KEY = 'test-api-key'
process.env.DEEPSEEK_BASE_URL = 'https://api.test.deepseek.com'

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('streamChat', () => {
    it('should yield chunks from stream', async () => {
      const { default: OpenAI } = await import('openai')
      const mockCreate = jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] }
          yield { choices: [{ delta: { content: ' World' } }] }
          yield { choices: [{ delta: { content: '!' } }] }
        }
      })
      
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as any))

      const generator = ChatService.streamChat('Test message')
      const chunks: string[] = []
      
      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello', ' World', '!'])
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'deepseek-chat',
        stream: true
      }))
    })

    it('should include system prompt', async () => {
      const { default: OpenAI } = await import('openai')
      const mockCreate = jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] }
        }
      })
      
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as any))

      const generator = ChatService.streamChat('Test')
      await generator.next()

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages).toHaveLength(2)
      expect(callArgs.messages[0].role).toBe('system')
      expect(callArgs.messages[0].content).toContain('王编导')
    })

    it('should include history in context', async () => {
      const { default: OpenAI } = await import('openai')
      const mockCreate = jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] }
        }
      })
      
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as any))

      const history = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ]

      const generator = ChatService.streamChat('New message', { history })
      await generator.next()

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages).toHaveLength(4) // system + 2 history + user
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'Previous message' })
      expect(callArgs.messages[2]).toEqual({ role: 'assistant', content: 'Previous response' })
    })

    it('should save conversation after streaming', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              [Symbol.asyncIterator]: async function* () {
                yield { choices: [{ delta: { content: 'Response' } }] }
              }
            })
          }
        }
      } as any))

      const generator = ChatService.streamChat('Test', { 
        chapterId: 'chapter-123',
        novelId: 'novel-456'
      })
      
      // Consume generator
      for await (const _ of generator) { /* consume */ }

      // Wait for async save operations
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(ConversationModel.create).toHaveBeenCalledWith(expect.objectContaining({
        chapterId: 'chapter-123',
        novelId: 'novel-456',
        role: 'user',
        content: 'Test'
      }))
      
      expect(ConversationModel.create).toHaveBeenCalledWith(expect.objectContaining({
        chapterId: 'chapter-123',
        novelId: 'novel-456',
        role: 'assistant',
        content: 'Response',
        model: 'deepseek-chat'
      }))
    })

    it('should throw error on API failure', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      } as any))

      const generator = ChatService.streamChat('Test')
      
      await expect(async () => {
        for await (const _ of generator) { /* consume */ }
      }).rejects.toThrow('API Error')
    })

    it('should use correct temperature and max_tokens', async () => {
      const { default: OpenAI } = await import('openai')
      const mockCreate = jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Response' } }] }
        }
      })
      
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as any))

      const generator = ChatService.streamChat('Test')
      await generator.next()

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.temperature).toBe(0.7)
      expect(callArgs.max_tokens).toBe(4000)
    })
  })

  describe('chat (non-streaming)', () => {
    it('should return response content', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'This is the response'
                }
              }],
              usage: {
                total_tokens: 100
              }
            })
          }
        }
      } as any))

      const result = await ChatService.chat('Test message')

      expect(result).toBe('This is the response')
    })

    it('should not use streaming when calling chat', async () => {
      const { default: OpenAI } = await import('openai')
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 }
      })
      
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as any))

      await ChatService.chat('Test')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.stream).toBeUndefined()
    })

    it('should save conversation with tokens', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Response' } }],
              usage: { total_tokens: 150 }
            })
          }
        }
      } as any))

      await ChatService.chat('Test', { novelId: 'novel-1' })

      expect(ConversationModel.create).toHaveBeenCalledWith(expect.objectContaining({
        novelId: 'novel-1',
        role: 'assistant',
        tokensUsed: 150
      }))
    })

    it('should throw error on API failure', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      } as any))

      await expect(ChatService.chat('Test')).rejects.toThrow('API Error')
    })

    it('should handle empty response', async () => {
      const { default: OpenAI } = await import('openai')
      jest.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: '' } }],
              usage: { total_tokens: 10 }
            })
          }
        }
      } as any))

      const result = await ChatService.chat('Test')

      expect(result).toBe('')
    })
  })

  describe('saveConversation', () => {
    it('should call ConversationModel.create', async () => {
      const input = {
        chapterId: 'chapter-1',
        novelId: 'novel-1',
        role: 'user' as const,
        content: 'Test message',
        model: 'deepseek-chat'
      }

      await ChatService.saveConversation(input)

      expect(ConversationModel.create).toHaveBeenCalledWith(input)
    })

    it('should not throw on save failure', async () => {
      jest.mocked(ConversationModel.create).mockRejectedValueOnce(new Error('DB Error'))

      await expect(ChatService.saveConversation({
        role: 'user',
        content: 'Test'
      })).resolves.not.toThrow()
    })
  })

  describe('getHistory', () => {
    it('should get history by chapterId', async () => {
      const mockHistory = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi' }
      ]
      jest.mocked(ConversationModel.findByChapterId).mockResolvedValueOnce(mockHistory as any)

      const result = await ChatService.getHistory('chapter-1')

      expect(result).toEqual(mockHistory)
      expect(ConversationModel.findByChapterId).toHaveBeenCalledWith('chapter-1', 20)
    })

    it('should get history by novelId when no chapterId', async () => {
      const mockHistory = [
        { id: '1', role: 'user', content: 'Hello' }
      ]
      jest.mocked(ConversationModel.findByNovelId).mockResolvedValueOnce(mockHistory as any)

      const result = await ChatService.getHistory(undefined, 'novel-1')

      expect(result).toEqual(mockHistory)
      expect(ConversationModel.findByNovelId).toHaveBeenCalledWith('novel-1', 20)
    })

    it('should get recent history when no ids provided', async () => {
      const mockHistory = [
        { id: '1', role: 'user', content: 'Hello' }
      ]
      jest.mocked(ConversationModel.findRecent).mockResolvedValueOnce(mockHistory as any)

      const result = await ChatService.getHistory()

      expect(result).toEqual(mockHistory)
      expect(ConversationModel.findRecent).toHaveBeenCalledWith(20)
    })

    it('should use custom limit', async () => {
      await ChatService.getHistory('chapter-1', undefined, 50)

      expect(ConversationModel.findByChapterId).toHaveBeenCalledWith('chapter-1', 50)
    })

    it('should prefer chapterId over novelId', async () => {
      await ChatService.getHistory('chapter-1', 'novel-1')

      expect(ConversationModel.findByChapterId).toHaveBeenCalled()
      expect(ConversationModel.findByNovelId).not.toHaveBeenCalled()
    })
  })
})