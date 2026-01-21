'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/types/database';

type PlaybookRow = Tables<'playbooks'>;

interface PlaybookCardProps {
  playbook: PlaybookRow;
  onOpen: (playbookId: string) => void;
  onDuplicate: (playbookId: string) => void;
  onDelete: (playbookId: string) => void;
}

export function PlaybookCard({ playbook, onOpen, onDuplicate, onDelete }: PlaybookCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Delete "${playbook.name}"? This will also remove all plays in this playbook.`)) {
      setIsDeleting(true);
      await onDelete(playbook.id);
    }
  };

  // Calculate number of plays from sections
  const sections = playbook.sections as unknown[];
  const playCount = sections?.length || 0;

  return (
    <div
      className="group relative bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onOpen(playbook.id)}
    >
      {/* Thumbnail/Icon */}
      <div className="aspect-[4/3] bg-gradient-to-br from-zinc-700 to-zinc-900 relative flex items-center justify-center">
        <div className="text-5xl opacity-50">
          📁
        </div>
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-zinc-300">
          {playCount} plays
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-zinc-900/80 hover:bg-zinc-900 rounded-md text-zinc-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onDuplicate(playbook.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{playbook.name}</h3>
        <p className="text-xs text-zinc-500 mt-1">
          {formatDistanceToNow(new Date(playbook.updated_at), { addSuffix: true })}
        </p>
        {playbook.tags && playbook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {playbook.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded"
              >
                {tag}
              </span>
            ))}
            {playbook.tags.length > 3 && (
              <span className="text-xs text-zinc-500">+{playbook.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
