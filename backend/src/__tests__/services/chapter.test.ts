import { jest } from '@jest/globals'
import { ChapterService, HeartbeatService } from '../../services/chapter'
import { ChapterModel, HeartbeatModel } from '../../models'

// Mock the models
jest.mock('../../models', () => ({
  ChapterModel: {
    create: jest.fn(),
    findById: jest.fn(),
    findByNovelId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  HeartbeatModel: {
    create: jest.fn(),
    findById: jest.fn(),
    findByChapterId: jest.fn(),
    delete: jest.fn()
  }
}))

describe('ChapterService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createChapter', () => {
    it('should create a chapter and return id and chapter', async () => {
      const mockChapter = {
        id: 'chapter-123',
        novel_id: 'novel-456',
        title: 'Test Chapter',
        content: 'Chapter content',
        order_index: 1,
        word_count: 16,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      }

      jest.mocked(ChapterModel.create).mockResolvedValueOnce(mockChapter as any)

      const result = await ChapterService.createChapter({
        title: 'Test Chapter',
        content: 'Chapter content',
        novelId: 'novel-456'
      })

      expect(result).toEqual({
        id: 'chapter-123',
        chapter: mockChapter
      })
      expect(ChapterModel.create).toHaveBeenCalledWith({
        title: 'Test Chapter',
        content: 'Chapter content',
        novelId: 'novel-456'
      })
    })

    it('should create chapter with minimal data', async () => {
      const mockChapter = {
        id: 'chapter-1',
        novel_id: 'novel-1',
        title: 'Minimal Chapter',
        content: '',
        order_index: 1,
        word_count: 0,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      }

      jest.mocked(ChapterModel.create).mockResolvedValueOnce(mockChapter as any)

      const result = await ChapterService.createChapter({
        title: 'Minimal Chapter',
        novelId: 'novel-1'
      })

      expect(result.chapter.title).toBe('Minimal Chapter')
      expect(result.chapter.content).toBe('')
    })

    it('should handle chapter creation errors', async () => {
      jest.mocked(ChapterModel.create).mockRejectedValueOnce(new Error('DB Error'))

      await expect(ChapterService.createChapter({
        title: 'Test',
        novelId: 'novel-1'
      })).rejects.toThrow('DB Error')
    })
  })

  describe('getChapterWithHeartbeats', () => {
    it('should return chapter with heartbeats', async () => {
      const mockChapter = {
        id: 'chapter-1',
        title: 'Test Chapter',
        content: 'Content'
      }
      const mockHeartbeats = [
        { id: 'hb-1', chapter_id: 'chapter-1', type: 'flow', position: 10 },
        { id: 'hb-2', chapter_id: 'chapter-1', type: 'emotion', position: 20 }
      ]

      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(mockChapter as any)
      jest.mocked(HeartbeatModel.findByChapterId).mockResolvedValueOnce(mockHeartbeats as any)

      const result = await ChapterService.getChapterWithHeartbeats('chapter-1')

      expect(result).toEqual({
        chapter: mockChapter,
        heartbeats: mockHeartbeats
      })
      expect(ChapterModel.findById).toHaveBeenCalledWith('chapter-1')
      expect(HeartbeatModel.findByChapterId).toHaveBeenCalledWith('chapter-1')
    })

    it('should return null when chapter not found', async () => {
      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(null)

      const result = await ChapterService.getChapterWithHeartbeats('nonexistent')

      expect(result).toBeNull()
      expect(HeartbeatModel.findByChapterId).not.toHaveBeenCalled()
    })

    it('should return empty heartbeats array when none exist', async () => {
      const mockChapter = {
        id: 'chapter-1',
        title: 'Test Chapter',
        content: 'Content'
      }

      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(mockChapter as any)
      jest.mocked(HeartbeatModel.findByChapterId).mockResolvedValueOnce([])

      const result = await ChapterService.getChapterWithHeartbeats('chapter-1')

      expect(result?.heartbeats).toEqual([])
    })
  })

  describe('getChaptersByNovel', () => {
    it('should return all chapters for a novel', async () => {
      const mockChapters = [
        { id: 'ch-1', novel_id: 'novel-1', title: 'Chapter 1', order_index: 1 },
        { id: 'ch-2', novel_id: 'novel-1', title: 'Chapter 2', order_index: 2 }
      ]

      jest.mocked(ChapterModel.findByNovelId).mockResolvedValueOnce(mockChapters as any)

      const result = await ChapterService.getChaptersByNovel('novel-1')

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Chapter 1')
      expect(result[1].title).toBe('Chapter 2')
      expect(ChapterModel.findByNovelId).toHaveBeenCalledWith('novel-1')
    })

    it('should return empty array when novel has no chapters', async () => {
      jest.mocked(ChapterModel.findByNovelId).mockResolvedValueOnce([])

      const result = await ChapterService.getChaptersByNovel('empty-novel')

      expect(result).toEqual([])
    })
  })

  describe('updateChapter', () => {
    it('should update chapter title', async () => {
      const mockUpdatedChapter = {
        id: 'chapter-1',
        title: 'Updated Title',
        content: 'Original content'
      }

      jest.mocked(ChapterModel.update).mockResolvedValueOnce(mockUpdatedChapter as any)

      const result = await ChapterService.updateChapter('chapter-1', { title: 'Updated Title' })

      expect(result).toEqual(mockUpdatedChapter)
      expect(ChapterModel.update).toHaveBeenCalledWith('chapter-1', { title: 'Updated Title' })
    })

    it('should update chapter content', async () => {
      const mockUpdatedChapter = {
        id: 'chapter-1',
        title: 'Title',
        content: 'Updated content'
      }

      jest.mocked(ChapterModel.update).mockResolvedValueOnce(mockUpdatedChapter as any)

      const result = await ChapterService.updateChapter('chapter-1', { content: 'Updated content' })

      expect(result?.content).toBe('Updated content')
    })

    it('should update both title and content', async () => {
      const mockUpdatedChapter = {
        id: 'chapter-1',
        title: 'New Title',
        content: 'New content'
      }

      jest.mocked(ChapterModel.update).mockResolvedValueOnce(mockUpdatedChapter as any)

      const result = await ChapterService.updateChapter('chapter-1', {
        title: 'New Title',
        content: 'New content'
      })

      expect(result?.title).toBe('New Title')
      expect(result?.content).toBe('New content')
    })

    it('should return null when chapter not found', async () => {
      jest.mocked(ChapterModel.update).mockResolvedValueOnce(null)

      const result = await ChapterService.updateChapter('nonexistent', { title: 'New Title' })

      expect(result).toBeNull()
    })
  })

  describe('deleteChapter', () => {
    it('should delete chapter and return true', async () => {
      jest.mocked(ChapterModel.delete).mockResolvedValueOnce(true)

      const result = await ChapterService.deleteChapter('chapter-1')

      expect(result).toBe(true)
      expect(ChapterModel.delete).toHaveBeenCalledWith('chapter-1')
    })

    it('should return false when chapter not found', async () => {
      jest.mocked(ChapterModel.delete).mockResolvedValueOnce(false)

      const result = await ChapterService.deleteChapter('nonexistent')

      expect(result).toBe(false)
    })
  })
})

describe('HeartbeatService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createHeartbeat', () => {
    it('should create heartbeat and return id and heartbeat', async () => {
      const mockChapter = { id: 'chapter-1', title: 'Test' }
      const mockHeartbeat = {
        id: 'hb-1',
        chapter_id: 'chapter-1',
        position: 100,
        type: 'flow',
        content: 'Test content',
        note: 'Test note',
        created_at: new Date()
      }

      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(mockChapter as any)
      jest.mocked(HeartbeatModel.create).mockResolvedValueOnce(mockHeartbeat as any)

      const result = await HeartbeatService.createHeartbeat({
        chapterId: 'chapter-1',
        position: 100,
        type: 'flow',
        content: 'Test content',
        note: 'Test note'
      })

      expect(result).toEqual({
        id: 'hb-1',
        heartbeat: mockHeartbeat
      })
    })

    it('should create heartbeat without note', async () => {
      const mockChapter = { id: 'chapter-1', title: 'Test' }
      const mockHeartbeat = {
        id: 'hb-1',
        chapter_id: 'chapter-1',
        position: 50,
        type: 'emotion',
        content: 'Content',
        created_at: new Date()
      }

      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(mockChapter as any)
      jest.mocked(HeartbeatModel.create).mockResolvedValueOnce(mockHeartbeat as any)

      const result = await HeartbeatService.createHeartbeat({
        chapterId: 'chapter-1',
        position: 50,
        type: 'emotion',
        content: 'Content'
      })

      expect(result.heartbeat.position).toBe(50)
      expect(result.heartbeat.type).toBe('emotion')
    })

    it('should throw error when chapter does not exist', async () => {
      jest.mocked(ChapterModel.findById).mockResolvedValueOnce(null)

      await expect(HeartbeatService.createHeartbeat({
        chapterId: 'nonexistent',
        position: 10,
        type: 'flow',
        content: 'Content'
      })).rejects.toThrow('章节不存在')

      expect(HeartbeatModel.create).not.toHaveBeenCalled()
    })

    it('should handle all heartbeat types', async () => {
      const mockChapter = { id: 'chapter-1', title: 'Test' }
      const types = ['flow', 'emotion', 'golden', 'twist', 'user']

      for (const type of types) {
        jest.mocked(ChapterModel.findById).mockResolvedValueOnce(mockChapter as any)
        jest.mocked(HeartbeatModel.create).mockResolvedValueOnce({
          id: `hb-${type}`,
          chapter_id: 'chapter-1',
          type,
          position: 10,
          content: 'Test'
        } as any)

        const result = await HeartbeatService.createHeartbeat({
          chapterId: 'chapter-1',
          position: 10,
          type: type as any,
          content: 'Test'
        })

        expect(result.heartbeat.type).toBe(type)
      }
    })
  })

  describe('getHeartbeatsByChapter', () => {
    it('should return all heartbeats for a chapter', async () => {
      const mockHeartbeats = [
        { id: 'hb-1', chapter_id: 'chapter-1', type: 'flow', position: 10 },
        { id: 'hb-2', chapter_id: 'chapter-1', type: 'emotion', position: 50 },
        { id: 'hb-3', chapter_id: 'chapter-1', type: 'golden', position: 100 }
      ]

      jest.mocked(HeartbeatModel.findByChapterId).mockResolvedValueOnce(mockHeartbeats as any)

      const result = await HeartbeatService.getHeartbeatsByChapter('chapter-1')

      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('flow')
      expect(result[1].type).toBe('emotion')
      expect(result[2].type).toBe('golden')
    })

    it('should return empty array when no heartbeats', async () => {
      jest.mocked(HeartbeatModel.findByChapterId).mockResolvedValueOnce([])

      const result = await HeartbeatService.getHeartbeatsByChapter('chapter-empty')

      expect(result).toEqual([])
    })

    it('should be ordered by position', async () => {
      const mockHeartbeats = [
        { id: 'hb-3', chapter_id: 'chapter-1', position: 100 },
        { id: 'hb-1', chapter_id: 'chapter-1', position: 10 },
        { id: 'hb-2', chapter_id: 'chapter-1', position: 50 }
      ]

      jest.mocked(HeartbeatModel.findByChapterId).mockResolvedValueOnce(mockHeartbeats as any)

      const result = await HeartbeatService.getHeartbeatsByChapter('chapter-1')

      expect(result[0].position).toBe(10)
      expect(result[1].position).toBe(50)
      expect(result[2].position).toBe(100)
    })
  })

  describe('deleteHeartbeat', () => {
    it('should delete heartbeat and return true', async () => {
      jest.mocked(HeartbeatModel.delete).mockResolvedValueOnce(true)

      const result = await HeartbeatService.deleteHeartbeat('hb-1')

      expect(result).toBe(true)
      expect(HeartbeatModel.delete).toHaveBeenCalledWith('hb-1')
    })

    it('should return false when heartbeat not found', async () => {
      jest.mocked(HeartbeatModel.delete).mockResolvedValueOnce(false)

      const result = await HeartbeatService.deleteHeartbeat('nonexistent')

      expect(result).toBe(false)
    })
  })
})