'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  onSave: () => void;
  isSaving: boolean;
  lastSaved?: Date | null;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onShare: () => void;
  canShare: boolean;
}

export function TopBar({
  onSave,
  isSaving,
  lastSaved,
  onExportPNG,
  onExportPDF,
  onShare,
  canShare,
}: TopBarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const play = useEditorStore((state) => state.play);
  const updatePlayName = useEditorStore((state) => state.updatePlayName);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const history = useEditorStore((state) => state.history);
  const flipPlay = useEditorStore((state) => state.flipPlay);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(play.name || 'New Play');

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleNameClick = () => {
    setEditedName(play.name || 'New Play');
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    updatePlayName(editedName.trim() || 'New Play');
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  // Get current concept tab from conceptStore
  const activeTab = useConceptStore((state) => state.activeTab);
  const setActiveTab = useConceptStore((state) => state.setActiveTab);

  return (
    <div className="hidden md:flex items-center justify-between h-12 px-4 bg-zinc-900 border-b border-zinc-800">
      {/* Left Section: Navigation + Play Name */}
      <div className="flex items-center gap-3">
        {/* Back to Dashboard */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="text-zinc-400 hover:text-white h-8 px-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs">Dashboard</span>
        </Button>

        <div className="h-5 w-px bg-zinc-700" />

        {/* Play Name */}
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="w-48 h-8 text-sm bg-zinc-800 border-zinc-600 text-white"
            autoFocus
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="text-white font-medium text-sm hover:text-blue-400 transition-colors max-w-xs truncate"
            title="Click to edit play name"
          >
            {play.name || 'New Play'}
          </button>
        )}

        {/* Pass/Run Toggle */}
        <div className="flex items-center bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'pass'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pass
          </button>
          <button
            onClick={() => setActiveTab('run')}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'run'
                ? 'bg-green-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Run
          </button>
        </div>
      </div>

      {/* Center Section: Undo/Redo + Flip */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 px-2 text-zinc-400 hover:text-white disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 px-2 text-zinc-400 hover:text-white disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </Button>

        <div className="h-5 w-px bg-zinc-700 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={flipPlay}
          className="h-8 px-2 text-zinc-400 hover:text-white"
          title="Flip Play"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-xs ml-1">Flip</span>
        </Button>
      </div>

      {/* Right Section: Save + Export */}
      <div className="flex items-center gap-2">
        {/* Save Status */}
        {lastSaved && (
          <span className="text-xs text-zinc-500 mr-2">
            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Export
              <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
            <DropdownMenuItem onClick={onExportPNG} className="text-zinc-300 hover:bg-zinc-800 cursor-pointer">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF} className="text-zinc-300 hover:bg-zinc-800 cursor-pointer">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </DropdownMenuItem>
            {canShare && (
              <>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem onClick={onShare} className="text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Link
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save Button */}
        {isAuthenticated ? (
          <Button
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="h-8 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/auth/login')}
            size="sm"
            className="h-8 text-xs bg-green-600 hover:bg-green-700"
          >
            Login to Save
          </Button>
        )}
      </div>
    </div>
  );
}
