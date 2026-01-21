'use client';

import { useEditorStore } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { EditorMode } from '@/types/dsl';

interface MobileBottomBarProps {
  onOpenMenu: () => void;
  onOpenConcepts: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function MobileBottomBar({
  onOpenMenu,
  onOpenConcepts,
  canUndo,
  canRedo,
}: MobileBottomBarProps) {
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const handleModeChange = (newMode: EditorMode) => {
    setMode(newMode);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-2 md:hidden z-40 safe-area-pb">
      {/* Select Mode */}
      <button
        onClick={() => handleModeChange('select')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
          mode === 'select'
            ? 'bg-blue-600 text-white'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        aria-label="Select mode"
        aria-pressed={mode === 'select'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-[10px] mt-0.5">Select</span>
      </button>

      {/* Draw Mode */}
      <button
        onClick={() => handleModeChange('draw')}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
          mode === 'draw'
            ? 'bg-blue-600 text-white'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        aria-label="Draw mode"
        aria-pressed={mode === 'draw'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span className="text-[10px] mt-0.5">Draw</span>
      </button>

      {/* Undo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
          canUndo
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
        aria-label="Undo"
        aria-disabled={!canUndo}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="text-[10px] mt-0.5">Undo</span>
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
          canRedo
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
        aria-label="Redo"
        aria-disabled={!canRedo}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
        <span className="text-[10px] mt-0.5">Redo</span>
      </button>

      {/* Concepts */}
      <button
        onClick={onOpenConcepts}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Open concepts"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-[10px] mt-0.5">Concepts</span>
      </button>

      {/* More Menu */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="More options"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        <span className="text-[10px] mt-0.5">More</span>
      </button>
    </div>
  );
}
