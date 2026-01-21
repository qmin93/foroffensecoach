'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { EditorMode } from '@/types/dsl';

interface FloatingActionsProps {
  onAddPlayer: () => void;
  onOpenConcepts: () => void;
}

export function FloatingActions({ onAddPlayer, onOpenConcepts }: FloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);

  const handleDrawMode = () => {
    if (mode === 'draw') {
      setMode('select');
    } else {
      setMode('draw');
    }
    setIsExpanded(false);
  };

  const handleTextMode = () => {
    setMode('text');
    setIsExpanded(false);
  };

  const handleAddPlayerClick = () => {
    onAddPlayer();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 hidden md:flex flex-col items-end gap-2">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Add Text */}
          <button
            onClick={handleTextMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all ${
              mode === 'text'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
            title="Add Text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium">Add Text</span>
          </button>

          {/* Draw Route */}
          <button
            onClick={handleDrawMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all ${
              mode === 'draw'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
            title="Draw Route"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-sm font-medium">Draw Route</span>
          </button>

          {/* Add Player */}
          <button
            onClick={handleAddPlayerClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white shadow-lg transition-all"
            title="Add Player"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">Add Player</span>
          </button>

          {/* Concepts */}
          <button
            onClick={() => { onOpenConcepts(); setIsExpanded(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white shadow-lg transition-all"
            title="Apply Concept"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium">Concepts</span>
          </button>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${
          isExpanded
            ? 'bg-zinc-700 rotate-45'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
        aria-expanded={isExpanded}
      >
        <svg className="w-6 h-6 text-white transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Quick Mode Indicator */}
      {mode !== 'select' && !isExpanded && (
        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-green-500 border-2 border-zinc-900 animate-pulse" />
      )}
    </div>
  );
}
