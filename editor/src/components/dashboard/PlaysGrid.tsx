'use client';

import { useState, useEffect, useMemo } from 'react';
import { PlayCard } from './PlayCard';
import { getPlays, deletePlay, duplicatePlay, deleteAllPlays } from '@/lib/api/plays';
import { Tables } from '@/types/database';
import { PlayCardSkeleton } from '@/components/ui/Skeleton';

type PlayRow = Tables<'plays'>;

interface PlaysGridProps {
  workspaceId: string;
  userId: string;
  onOpenPlay: (playId: string) => void;
  onCreatePlay: () => void;
}

export function PlaysGrid({ workspaceId, userId, onOpenPlay, onCreatePlay }: PlaysGridProps) {
  const [plays, setPlays] = useState<PlayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter plays based on search query
  const filteredPlays = useMemo(() => {
    if (!searchQuery.trim()) return plays;
    const query = searchQuery.toLowerCase();
    return plays.filter((play) => {
      // Check play.name and meta.notes.callName for search
      const callName = (play.meta as any)?.notes?.callName || '';
      const name = play.name || callName || '';
      return name.toLowerCase().includes(query);
    });
  }, [plays, searchQuery]);

  const fetchPlays = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlays(workspaceId);
      setPlays(data);
    } catch (err) {
      console.error('Error fetching plays:', err);
      setError('Failed to load plays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchPlays();
    }
  }, [workspaceId]);

  const handleDuplicate = async (playId: string) => {
    try {
      const newPlay = await duplicatePlay(playId, workspaceId, userId);
      setPlays((prev) => [newPlay, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate play:', err);
    }
  };

  const handleDelete = async (playId: string) => {
    try {
      await deletePlay(playId);
      setPlays((prev) => prev.filter((p) => p.id !== playId));
    } catch (err) {
      console.error('Failed to delete play:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      await deleteAllPlays(workspaceId);
      setPlays([]);
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error('Failed to delete all plays:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <PlayCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchPlays}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-medium text-foreground">My Plays ({plays.length})</h3>

        {/* Search Bar */}
        {plays.length > 0 && (
          <div className="flex-1 max-w-md mx-0 sm:mx-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plays by name..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {plays.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              Delete All
            </button>
          )}
          <button
            onClick={onCreatePlay}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            + New Play
          </button>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 shadow-lg">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete All Plays?</h3>
            <p className="text-muted-foreground mb-4">
              This will permanently delete all {plays.length} plays. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {plays.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No plays yet. Create your first play!</p>
          <button
            onClick={onCreatePlay}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Create Play
          </button>
        </div>
      ) : filteredPlays.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No plays found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {filteredPlays.map((play) => (
            <PlayCard
              key={play.id}
              play={play}
              onOpen={onOpenPlay}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
