'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/types/database';

type PlayRow = Tables<'plays'>;

interface PlayCardProps {
  play: PlayRow;
  onOpen: (playId: string) => void;
  onDuplicate: (playId: string) => void;
  onDelete: (playId: string) => void;
}

export function PlayCard({ play, onOpen, onDuplicate, onDelete }: PlayCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Delete "${play.name}"? This cannot be undone.`)) {
      setIsDeleting(true);
      await onDelete(play.id);
    }
  };

  return (
    <div
      className="group relative bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onOpen(play.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-zinc-900 relative">
        {play.thumbnail_url ? (
          <img
            src={play.thumbnail_url}
            alt={play.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        )}

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
                  onDuplicate(play.id);
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
        <h3 className="font-medium text-white truncate">{play.name}</h3>
        <p className="text-xs text-zinc-500 mt-1">
          {formatDistanceToNow(new Date(play.updated_at), { addSuffix: true })}
        </p>
        {play.tags && play.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {play.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded"
              >
                {tag}
              </span>
            ))}
            {play.tags.length > 3 && (
              <span className="text-xs text-zinc-500">+{play.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
