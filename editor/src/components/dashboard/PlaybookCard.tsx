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
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer shadow-sm"
      onClick={() => onOpen(playbook.id)}
    >
      {/* Thumbnail/Icon */}
      <div className="aspect-[4/3] bg-muted relative flex items-center justify-center">
        <div className="text-5xl opacity-50">
          📁
        </div>
        <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
          {playCount} plays
        </div>

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
                  onDuplicate(playbook.id);
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
        <h3 className="font-medium text-foreground truncate">{playbook.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(playbook.updated_at), { addSuffix: true })}
        </p>
        {playbook.tags && playbook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {playbook.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
              >
                {tag}
              </span>
            ))}
            {playbook.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{playbook.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
