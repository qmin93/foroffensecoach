'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/types/database';
import { PlayPreview } from './PlayPreview';

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
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer shadow-sm"
      onClick={() => onOpen(play.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-muted relative">
        {play.thumbnail_url ? (
          <img
            src={play.thumbnail_url}
            alt={play.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlayPreview play={play} />
        )}

        {/* Menu Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-background/80 hover:bg-background rounded-md text-muted-foreground hover:text-foreground border border-border"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onDuplicate(play.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-accent disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{play.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(play.updated_at), { addSuffix: true })}
        </p>
        {play.tags && play.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {play.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
              >
                {tag}
              </span>
            ))}
            {play.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{play.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
