'use client';

import { useState, useEffect } from 'react';
import { PlayCard } from './PlayCard';
import { getPlays, deletePlay, duplicatePlay } from '@/lib/api/plays';
import { Tables } from '@/types/database';

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

  const fetchPlays = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlays(workspaceId);
      setPlays(data);
    } catch (err) {
      setError('Failed to load plays');
      console.error(err);
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
      await duplicatePlay(playId, workspaceId, userId);
      await fetchPlays();
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

  if (loading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPlays}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (plays.length === 0) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🏈</div>
        <h3 className="text-lg font-medium mb-2">No Plays Yet</h3>
        <p className="text-zinc-400 mb-4">
          Create your first play to get started
        </p>
        <button
          onClick={onCreatePlay}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          Create Play
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">My Plays ({plays.length})</h3>
        <button
          onClick={onCreatePlay}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Play
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {plays.map((play) => (
          <PlayCard
            key={play.id}
            play={play}
            onOpen={onOpenPlay}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
