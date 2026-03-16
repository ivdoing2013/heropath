import { jest } from '@jest/globals'
import { Request, Response } from 'express'
import { ChatController } from '../../controllers/chat'
import { ChatService } from '../../services/chat'

// Mock the ChatService
jest.mock('../../services/chat', () => ({
  ChatService: {
    streamChat: jest.fn(),
    chat: jest.fn(),
    getHistory: jest.fn()
  }
}))

describe('ChatController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock
  let writeMock: jest.Mock
  let endMock: jest.Mock
  let setHeaderMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    jsonMock = jest.fn().mockReturnThis()
    statusMock = jest.fn().mockReturnThis()
    writeMock = jest.fn()
    endMock = jest.fn()
    setHeaderMock = jest.fn()

    mockReq = {
      body: {}
    }

    mockRes = {
      json: jsonMock,
      status: statusMock,
      write: writeMock,
      end: endMock,
      setHeader: setHeaderMock,
      headersSent: false
    }
  })

  describe('streamChat (SSE)', () => {
    it('should set SSE headers correctly', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Hi'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'text/event-stream')
      expect(setHeaderMock).toHaveBeenCalledWith('Cache-Control', 'no-cache')
      expect(setHeaderMock).toHaveBeenCalledWith('Connection', 'keep-alive')
      expect(setHeaderMock).toHaveBeenCalledWith('X-Accel-Buffering', 'no')
    })

    it('should send start event', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Hi'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(writeMock).toHaveBeenCalledWith('event: start\n')
      expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('"status":"started"'))
    })

    it('should stream message chunks', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () {
          yield 'Hello';
          yield ' World';
          yield '!';
        })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('"content":"Hello"'))
      expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('"content":" World"'))
      expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('"content":"!"'))
    })

    it('should send end event', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Done'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(writeMock).toHaveBeenCalledWith('event: end\n')
      expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('"status":"completed"'))
      expect(endMock).toHaveBeenCalled()
    })

    it('should include chapter and novel context', async () => {
      mockReq.body = {
        message: 'Hello',
        chapterId: 'chapter-123',
        novelId: 'novel-456'
      }

      const mockHistory = [
        { id: '1', role: 'user', content: 'Previous', chapter_id: 'chapter-123' }
      ]

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce(mockHistory as any)
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Response'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(ChatService.getHistory).toHaveBeenCalledWith('chapter-123', 'novel-456', 10)
      expect(ChatService.streamChat).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          chapterId: 'chapter-123',
          novelId: 'novel-456',
          history: [{ role: 'user', content: 'Previous' }]
        })
      )
    })

    it('should handle validation errors', async () => {
      mockReq.body = { message: '' } // Empty message should fail validation

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '请求参数错误'
      }))
    })

    it('should handle message too long error', async () => {
      mockReq.body = { message: 'a'.repeat(10001) }

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '请求参数错误'
      }))
    })

    it('should handle service errors before headers sent', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockRejectedValueOnce(new Error('Service Error'))

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '服务器内部错误'
      }))
    })

    it('should handle service errors after headers sent', async () => {
      mockReq.body = { message: 'Hello' }
      mockRes.headersSent = true

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockImplementation(() => {
        throw new Error('Stream Error')
      })

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(writeMock).toHaveBeenCalledWith('event: error\n')
      expect(endMock).toHaveBeenCalled()
    })

    it('should handle stream with no chapter or novel', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Response'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      expect(ChatService.getHistory).toHaveBeenCalledWith(undefined, undefined, 10)
    })
  })

  describe('chat (non-streaming)', () => {
    it('should return chat response', async () => {
      mockReq.body = { message: 'Hello', stream: false }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.chat).mockResolvedValueOnce('This is the response')

      await ChatController.chat(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          content: 'This is the response',
          role: 'assistant'
        }
      })
    })

    it('should include context in non-streaming chat', async () => {
      mockReq.body = {
        message: 'Hello',
        stream: false,
        chapterId: 'chapter-1'
      }

      const mockHistory = [
        { id: '1', role: 'user', content: 'Previous message' }
      ]

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce(mockHistory as any)
      jest.mocked(ChatService.chat).mockResolvedValueOnce('Response')

      await ChatController.chat(mockReq as Request, mockRes as Response)

      expect(ChatService.chat).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          chapterId: 'chapter-1',
          history: [{ role: 'user', content: 'Previous message' }]
        })
      )
    })

    it('should handle validation errors in non-streaming', async () => {
      mockReq.body = { message: '', stream: false }

      await ChatController.chat(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle service errors', async () => {
      mockReq.body = { message: 'Hello', stream: false }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.chat).mockRejectedValueOnce(new Error('Service Error'))

      await ChatController.chat(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '服务器内部错误'
      }))
    })

    it('should default to streaming when stream not specified', async () => {
      mockReq.body = { message: 'Hello' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])
      jest.mocked(ChatService.streamChat).mockReturnValue(
        (async function* () { yield 'Response'; })()
      )

      await ChatController.streamChat(mockReq as Request, mockRes as Response)

      // Should use streamChat endpoint
      expect(ChatService.streamChat).toHaveBeenCalled()
    })
  })

  describe('getHistory', () => {
    it('should return history by chapterId', async () => {
      mockReq.query = { chapterId: 'chapter-1' }

      const mockHistory = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi' }
      ]

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce(mockHistory as any)

      await ChatController.getHistory(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockHistory
      })
      expect(ChatService.getHistory).toHaveBeenCalledWith('chapter-1', undefined, 20)
    })

    it('should return history by novelId', async () => {
      mockReq.query = { novelId: 'novel-1' }

      const mockHistory = [{ id: '1', role: 'user', content: 'Hello' }]

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce(mockHistory as any)

      await ChatController.getHistory(mockReq as Request, mockRes as Response)

      expect(ChatService.getHistory).toHaveBeenCalledWith(undefined, 'novel-1', 20)
    })

    it('should use custom limit', async () => {
      mockReq.query = { chapterId: 'chapter-1', limit: '50' }

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])

      await ChatController.getHistory(mockReq as Request, mockRes as Response)

      expect(ChatService.getHistory).toHaveBeenCalledWith('chapter-1', undefined, 50)
    })

    it('should handle service errors', async () => {
      mockReq.query = { chapterId: 'chapter-1' }

      jest.mocked(ChatService.getHistory).mockRejectedValueOnce(new Error('DB Error'))

      await ChatController.getHistory(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '服务器内部错误'
      }))
    })

    it('should return empty history when no params', async () => {
      mockReq.query = {}

      jest.mocked(ChatService.getHistory).mockResolvedValueOnce([])

      await ChatController.getHistory(mockReq as Request, mockRes as Response)

      expect(ChatService.getHistory).toHaveBeenCalledWith(undefined, undefined, 20)
    })
  })
})