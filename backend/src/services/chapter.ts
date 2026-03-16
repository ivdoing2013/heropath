import { ChapterModel, HeartbeatModel, CreateHeartbeatInput, CreateChapterInput, Chapter, Heartbeat } from '../models';

// 章节服务
export const ChapterService = {
  // 创建章节
  createChapter: async (input: CreateChapterInput): Promise<{ id: string; chapter: Chapter }> => {
    const chapter = await ChapterModel.create(input);
    return {
      id: chapter.id,
      chapter,
    };
  },

  // 获取章节详情（包含心跳标记）
  getChapterWithHeartbeats: async (id: string): Promise<{ chapter: Chapter; heartbeats: Heartbeat[] } | null> => {
    const chapter = await ChapterModel.findById(id);
    if (!chapter) {
      return null;
    }

    const heartbeats = await HeartbeatModel.findByChapterId(id);
    return {
      chapter,
      heartbeats,
    };
  },

  // 获取小说的所有章节
  getChaptersByNovel: async (novelId: string): Promise<Chapter[]> => {
    return await ChapterModel.findByNovelId(novelId);
  },

  // 更新章节
  updateChapter: async (id: string, input: Partial<CreateChapterInput>): Promise<Chapter | null> => {
    return await ChapterModel.update(id, input);
  },

  // 删除章节
  deleteChapter: async (id: string): Promise<boolean> => {
    return await ChapterModel.delete(id);
  },
};

// 心跳标记服务
export const HeartbeatService = {
  // 创建心跳标记
  createHeartbeat: async (input: CreateHeartbeatInput): Promise<{ id: string; heartbeat: Heartbeat }> => {
    // 验证章节是否存在
    const chapter = await ChapterModel.findById(input.chapterId);
    if (!chapter) {
      throw new Error('章节不存在');
    }

    const heartbeat = await HeartbeatModel.create(input);
    return {
      id: heartbeat.id,
      heartbeat,
    };
  },

  // 获取章节的所有心跳标记
  getHeartbeatsByChapter: async (chapterId: string): Promise<Heartbeat[]> => {
    return await HeartbeatModel.findByChapterId(chapterId);
  },

  // 删除心跳标记
  deleteHeartbeat: async (id: string): Promise<boolean> => {
    return await HeartbeatModel.delete(id);
  },
};

export default { ChapterService, HeartbeatService };
