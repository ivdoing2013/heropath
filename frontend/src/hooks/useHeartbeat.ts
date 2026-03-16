import { useEffect, useCallback } from 'react';
import { useAppStore, type HeartbeatType } from '../stores';

// 心跳标记类型配置
const heartbeatConfig: Record<HeartbeatType, { icon: string; label: string; color: string; bgColor: string }> = {
  flow: { icon: '💫', label: '心流', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  emotional: { icon: '💗', label: '情感', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  golden_quote: { icon: '✨', label: '金句', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  plot_twist: { icon: '🎭', label: '转折', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  user_marked: { icon: '📌', label: '标记', color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
};

export { heartbeatConfig };

// 使用心跳标记系统的 Hook
export function useHeartbeat() {
  const { 
    heartbeatMarkers, 
    addHeartbeat, 
    removeHeartbeat, 
    updateHeartbeatNote,
    editor
  } = useAppStore();

  // 添加心跳标记
  const addHeartbeatMarker = useCallback((
    type: HeartbeatType,
    position?: number,
    contentSnapshot?: string,
    note?: string
  ) => {
    // 如果没有提供位置，计算当前光标位置对应的百分比
    let finalPosition = position;
    if (finalPosition === undefined) {
      // 默认在50%位置
      finalPosition = 50;
    }

    addHeartbeat({
      type,
      position: finalPosition,
      contentSnapshot: contentSnapshot || editor.content.slice(0, 100) || '',
      note
    });
  }, [addHeartbeat, editor.content]);

  // 从选中的文本添加心跳
  const addHeartbeatFromSelection = useCallback((type: HeartbeatType = 'user_marked') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = selection.toString().trim();
    if (!text) return;

    // 获取选区位置
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 计算相对于编辑器的位置百分比
    const editorElement = document.querySelector('textarea');
    if (editorElement) {
      const editorRect = editorElement.getBoundingClientRect();
      const relativeY = rect.top - editorRect.top + editorElement.scrollTop;
      const positionPercent = (relativeY / editorElement.scrollHeight) * 100;
      
      addHeartbeatMarker(type, Math.max(0, Math.min(100, positionPercent)), text, text);
    } else {
      addHeartbeatMarker(type, undefined, text, text);
    }

    // 清除选区
    selection.removeAllRanges();
  }, [addHeartbeatMarker]);

  return {
    heartbeatMarkers,
    heartbeatConfig,
    addHeartbeat: addHeartbeatMarker,
    addHeartbeatFromSelection,
    removeHeartbeat,
    updateHeartbeatNote
  };
}

// 全局快捷键 Hook
export function useGlobalShortcuts() {
  const { addHeartbeatFromSelection } = useHeartbeat();
  const { saveEditor } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + H - 添加心跳标记
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        addHeartbeatFromSelection('user_marked');
      }

      // Ctrl/Cmd + S - 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveEditor();
      }

      // Ctrl/Cmd + Shift + H - 打开心跳菜单（如果有选中文本）
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        // 这里可以触发打开心跳类型选择菜单
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          // 如果有选中文本，显示心跳菜单
          document.dispatchEvent(new CustomEvent('showHeartbeatMenu'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addHeartbeatFromSelection, saveEditor]);
}

// 心跳标记位置计算工具
export function calculateHeartbeatPosition(
  cursorPosition: number,
  content: string
): number {
  if (!content) return 50;
  
  const textBeforeCursor = content.substring(0, cursorPosition);
  const lineCount = textBeforeCursor.split('\n').length;
  const totalLines = content.split('\n').length;
  
  return Math.min(100, Math.max(0, (lineCount / Math.max(totalLines, 1)) * 100));
}
