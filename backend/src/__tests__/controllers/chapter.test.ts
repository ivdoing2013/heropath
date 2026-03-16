import { jest } from '@jest/globals'
import { Request, Response } from 'express'
import { ChapterController, HeartbeatController } from '../../controllers/chapter'
import { ChapterService, HeartbeatService } from '../../services/chapter'

// Mock the services
jest.mock('../../services/chapter', () => ({
  ChapterService: {
    createChapter: jest.fn(),
    getChapterWithHeartbeats: jest.fn(),
    getChaptersByNovel: jest.fn(),
    updateChapter: jest.fn(),
    deleteChapter: jest.fn()
  },
  HeartbeatService: {
    createHeartbeat: jest.fn(),
    getHeartbeatsByChapter: jest.fn(),
    deleteHeartbeat: jest.fn()
  }
}))

describe('ChapterController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    jsonMock = jest.fn().mockReturnThis()
    statusMock = jest.fn().mockReturnThis()

    mockReq = {
      body: {},
      params: {},
      query: {}
    }

    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  describe('create', () => {
    it('should create chapter and return 201', async () => {
      mockReq.body = {
        title: 'New Chapter',
        content: 'Chapter content',
        novelId: 'novel-123'
      }

      const mockResult = {
        id: 'chapter-1',
        chapter: {
          id: 'chapter-1',
          title: 'New Chapter',
          novel_id: 'novel-123'
        }
      }

      jest.mocked(ChapterService.createChapter).mockResolvedValueOnce(mockResult as any)

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      })
    })

    it('should create chapter with minimal data', async () => {
      mockReq.body = {
        title: 'Minimal Chapter',
        novelId: 'novel-123'
      }

      const mockResult = {
        id: 'chapter-1',
        chapter: { id: 'chapter-1', title: 'Minimal Chapter' }
      }

      jest.mocked(ChapterService.createChapter).mockResolvedValueOnce(mockResult as any)

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(ChapterService.createChapter).toHaveBeenCalledWith({
        title: 'Minimal Chapter',
        novelId: 'novel-123'
      })
    })

    it('should handle validation error - empty title', async () => {
      mockReq.body = {
        title: '',
        novelId: 'novel-123'
      }

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '请求参数错误'
      }))
    })

    it('should handle validation error - title too long', async () => {
      mockReq.body = {
        title: 'a'.repeat(256),
        novelId: 'novel-123'
      }

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle validation error - invalid novelId', async () => {
      mockReq.body = {
        title: 'Test',
        novelId: 'not-a-uuid'
      }

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle content too long', async () => {
      mockReq.body = {
        title: 'Test',
        content: 'a'.repeat(100001),
        novelId: 'novel-123'
      }

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle service errors', async () => {
      mockReq.body = {
        title: 'Test',
        novelId: 'novel-123'
      }

      jest.mocked(ChapterService.createChapter).mockRejectedValueOnce(new Error('DB Error'))

      await ChapterController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '服务器内部错误'
      }))
    })
  })

  describe('getById', () => {
    it('should return chapter with heartbeats', async () => {
      mockReq.params = { id: 'chapter-1' }

      const mockResult = {
        chapter: {
          id: 'chapter-1',
          title: 'Test Chapter',
          content: 'Content'
        },
        heartbeats: [
          { id: 'hb-1', type: 'flow', position: 10 }
        ]
      }

      jest.mocked(ChapterService.getChapterWithHeartbeats).mockResolvedValueOnce(mockResult as any)

      await ChapterController.getById(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      })
    })

    it('should return 404 when chapter not found', async () => {
      mockReq.params = { id: 'nonexistent' }

      jest.mocked(ChapterService.getChapterWithHeartbeats).mockResolvedValueOnce(null)

      await ChapterController.getById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '章节不存在'
      }))
    })

    it('should handle service errors', async () => {
      mockReq.params = { id: 'chapter-1' }

      jest.mocked(ChapterService.getChapterWithHeartbeats).mockRejectedValueOnce(new Error('DB Error'))

      await ChapterController.getById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('getByNovel', () => {
    it('should return chapters for novel', async () => {
      mockReq.params = { novelId: 'novel-1' }

      const mockChapters = [
        { id: 'ch-1', title: 'Chapter 1', order_index: 1 },
        { id: 'ch-2', title: 'Chapter 2', order_index: 2 }
      ]

      jest.mocked(ChapterService.getChaptersByNovel).mockResolvedValueOnce(mockChapters as any)

      await ChapterController.getByNovel(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockChapters
      })
    })

    it('should return empty array when novel has no chapters', async () => {
      mockReq.params = { novelId: 'empty-novel' }

      jest.mocked(ChapterService.getChaptersByNovel).mockResolvedValueOnce([])

      await ChapterController.getByNovel(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: []
      })
    })

    it('should handle service errors', async () => {
      mockReq.params = { novelId: 'novel-1' }

      jest.mocked(ChapterService.getChaptersByNovel).mockRejectedValueOnce(new Error('DB Error'))

      await ChapterController.getByNovel(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('update', () => {
    it('should update chapter and return updated data', async () => {
      mockReq.params = { id: 'chapter-1' }
      mockReq.body = { title: 'Updated Title' }

      const mockUpdatedChapter = {
        id: 'chapter-1',
        title: 'Updated Title',
        content: 'Original content'
      }

      jest.mocked(ChapterService.updateChapter).mockResolvedValueOnce(mockUpdatedChapter as any)

      await ChapterController.update(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedChapter
      })
    })

    it('should update chapter content', async () => {
      mockReq.params = { id: 'chapter-1' }
      mockReq.body = { content: 'Updated content' }

      const mockUpdatedChapter = {
        id: 'chapter-1',
        title: 'Title',
        content: 'Updated content'
      }

      jest.mocked(ChapterService.updateChapter).mockResolvedValueOnce(mockUpdatedChapter as any)

      await ChapterController.update(mockReq as Request, mockRes as Response)

      expect(ChapterService.updateChapter).toHaveBeenCalledWith('chapter-1', {
        content: 'Updated content'
      })
    })

    it('should return 404 when chapter not found', async () => {
      mockReq.params = { id: 'nonexistent' }
      mockReq.body = { title: 'New Title' }

      jest.mocked(ChapterService.updateChapter).mockResolvedValueOnce(null)

      await ChapterController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '章节不存在'
      }))
    })

    it('should handle service errors', async () => {
      mockReq.params = { id: 'chapter-1' }
      mockReq.body = { title: 'New Title' }

      jest.mocked(ChapterService.updateChapter).mockRejectedValueOnce(new Error('DB Error'))

      await ChapterController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('delete', () => {
    it('should delete chapter and return success', async () => {
      mockReq.params = { id: 'chapter-1' }

      jest.mocked(ChapterService.deleteChapter).mockResolvedValueOnce(true)

      await ChapterController.delete(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '章节已删除'
      })
    })

    it('should return 404 when chapter not found', async () => {
      mockReq.params = { id: 'nonexistent' }

      jest.mocked(ChapterService.deleteChapter).mockResolvedValueOnce(false)

      await ChapterController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '章节不存在'
      }))
    })

    it('should handle service errors', async () => {
      mockReq.params = { id: 'chapter-1' }

      jest.mocked(ChapterService.deleteChapter).mockRejectedValueOnce(new Error('DB Error'))

      await ChapterController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })
})

describe('HeartbeatController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    jsonMock = jest.fn().mockReturnThis()
    statusMock = jest.fn().mockReturnThis()

    mockReq = {
      body: {},
      params: {}
    }

    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  describe('create', () => {
    it('should create heartbeat and return 201', async () => {
      mockReq.body = {
        chapterId: 'chapter-1',
        position: 100,
        type: 'flow',
        content: 'Heartbeat content',
        note: 'Optional note'
      }

      const mockResult = {
        id: 'hb-1',
        heartbeat: {
          id: 'hb-1',
          chapter_id: 'chapter-1',
          position: 100,
          type: 'flow',
          content: 'Heartbeat content'
        }
      }

      jest.mocked(HeartbeatService.createHeartbeat).mockResolvedValueOnce(mockResult as any)

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      })
    })

    it('should create heartbeat without note', async () => {
      mockReq.body = {
        chapterId: 'chapter-1',
        position: 50,
        type: 'emotion',
        content: 'Content'
      }

      const mockResult = {
        id: 'hb-1',
        heartbeat: {
          id: 'hb-1',
          chapter_id: 'chapter-1',
          type: 'emotion'
        }
      }

      jest.mocked(HeartbeatService.createHeartbeat).mockResolvedValueOnce(mockResult as any)

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(HeartbeatService.createHeartbeat).toHaveBeenCalledWith({
        chapterId: 'chapter-1',
        position: 50,
        type: 'emotion',
        content: 'Content',
        note: undefined
      })
    })

    it('should handle all heartbeat types', async () => {
      const types = ['flow', 'emotion', 'golden', 'twist', 'user']

      for (const type of types) {
        jest.clearAllMocks()
        mockReq.body = {
          chapterId: 'chapter-1',
          position: 10,
          type,
          content: 'Test'
        }

        jest.mocked(HeartbeatService.createHeartbeat).mockResolvedValueOnce({
          id: `hb-${type}`,
          heartbeat: { id: `hb-${type}`, type }
        } as any)

        await HeartbeatController.create(mockReq as Request, mockRes as Response)

        expect(statusMock).toHaveBeenCalledWith(201)
      }
    })

    it('should handle validation error - invalid chapterId', async () => {
      mockReq.body = {
        chapterId: 'not-a-uuid',
        position: 10,
        type: 'flow',
        content: 'Test'
      }

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle validation error - negative position', async () => {
      mockReq.body = {
        chapterId: 'chapter-1',
        position: -1,
        type: 'flow',
        content: 'Test'
      }

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle validation error - empty content', async () => {
      mockReq.body = {
        chapterId: 'chapter-1',
        position: 10,
        type: 'flow',
        content: ''
      }

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should handle chapter not found error', async () => {
      mockReq.body = {
        chapterId: 'nonexistent',
        position: 10,
        type: 'flow',
        content: 'Test'
      }

      jest.mocked(HeartbeatService.createHeartbeat).mockRejectedValueOnce(new Error('章节不存在'))

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '章节不存在'
      }))
    })

    it('should handle service errors', async () => {
      mockReq.body = {
        chapterId: 'chapter-1',
        position: 10,
        type: 'flow',
        content: 'Test'
      }

      jest.mocked(HeartbeatService.createHeartbeat).mockRejectedValueOnce(new Error('DB Error'))

      await HeartbeatController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('getByChapter', () => {
    it('should return heartbeats for chapter', async () => {
      mockReq.params = { chapterId: 'chapter-1' }

      const mockHeartbeats = [
        { id: 'hb-1', chapter_id: 'chapter-1', type: 'flow', position: 10 },
        { id: 'hb-2', chapter_id: 'chapter-1', type: 'emotion', position: 50 }
      ]

      jest.mocked(HeartbeatService.getHeartbeatsByChapter).mockResolvedValueOnce(mockHeartbeats as any)

      await HeartbeatController.getByChapter(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockHeartbeats
      })
    })

    it('should return empty array when no heartbeats', async () => {
      mockReq.params = { chapterId: 'chapter-empty' }

      jest.mocked(HeartbeatService.getHeartbeatsByChapter).mockResolvedValueOnce([])

      await HeartbeatController.getByChapter(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: []
      })
    })

    it('should handle service errors', async () => {
      mockReq.params = { chapterId: 'chapter-1' }

      jest.mocked(HeartbeatService.getHeartbeatsByChapter).mockRejectedValueOnce(new Error('DB Error'))

      await HeartbeatController.getByChapter(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('delete', () => {
    it('should delete heartbeat and return success', async () => {
      mockReq.params = { id: 'hb-1' }

      jest.mocked(HeartbeatService.deleteHeartbeat).mockResolvedValueOnce(true)

      await HeartbeatController.delete(mockReq as Request, mockRes as Response)

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '心跳标记已删除'
      })
    })

    it('should return 404 when heartbeat not found', async () => {
      mockReq.params = { id: 'nonexistent' }

      jest.mocked(HeartbeatService.deleteHeartbeat).mockResolvedValueOnce(false)

      await HeartbeatController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: '心跳标记不存在'
      }))
    })

    it('should handle service errors', async () => {
      mockReq.params = { id: 'hb-1' }

      jest.mocked(HeartbeatService.deleteHeartbeat).mockRejectedValueOnce(new Error('DB Error'))

      await HeartbeatController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })
})