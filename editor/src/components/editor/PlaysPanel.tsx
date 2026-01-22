'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/editorStore';
import { getPlays } from '@/lib/api/plays';
import { PlayPreview } from '@/components/dashboard/PlayPreview';
import { Tables } from '@/types/database';
import { Skeleton } from '@/components/ui/Skeleton';

type PlayRow = Tables<'plays'>;

interface PlaysPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function PlaysPanel({ isOpen, onToggle }: PlaysPanelProps) {
  const router = useRouter();
  const params = useParams();
  const currentPlayId = params?.playId as string | undefined;

  const { workspace } = useAuthStore();
  const currentPlay = useEditorStore((state) => state.play);

  const [plays, setPlays] = useState<PlayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch plays
  const fetchPlays = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPlays(workspace.id);
      setPlays(data);
    } catch (err) {
      console.error('Failed to fetch plays:', err);
      setError('Failed to load plays');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  // Refresh plays when current play is saved
  useEffect(() => {
    if (currentPlay.id && !currentPlay.id.startsWith('new-')) {
      // Debounce refresh
      const timer = setTimeout(() => {
        fetchPlays();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlay.updatedAt, fetchPlays, currentPlay.id]);

  const handlePlayClick = (playId: string) => {
    if (playId !== currentPlayId) {
      router.push(`/editor/${playId}`);
    }
  };

  const handleNewPlay = () => {
    router.push('/editor');
  };

  // Filter plays based on search query
  const filteredPlays = plays.filter((play) =>
    play.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!workspace) {
    return null;
  }

  return (
    <div
      className={`
        hidden md:flex flex-col h-full bg-zinc-900 border-r border-zinc-800
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-56' : 'w-12'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800">
        {isOpen && (
          <span className="text-sm font-medium text-white px-2">My Plays</span>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ${!isOpen ? 'mx-auto' : ''}`}
          title={isOpen ? 'Collapse panel' : 'Expand panel'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* New Play Button */}
          <div className="p-2">
            <button
              onClick={handleNewPlay}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Play
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-2 pb-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search plays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Plays List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              // Skeleton loading
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </div>
                ))}
              </>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchPlays}
                  className="mt-2 text-xs text-zinc-400 hover:text-white underline"
                >
                  Retry
                </button>
              </div>
            ) : plays.length === 0 ? (
              <div className="text-center py-8 px-2">
                <div className="text-3xl mb-2">🏈</div>
                <p className="text-sm text-zinc-400">No plays yet</p>
                <p className="text-xs text-zinc-500 mt-1">Create your first play!</p>
              </div>
            ) : filteredPlays.length === 0 ? (
              <div className="text-center py-4 px-2">
                <p className="text-sm text-zinc-400">No matches for &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-zinc-500 hover:text-white underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredPlays.map((play) => {
                const isActive = play.id === currentPlayId;
                return (
                  <button
                    key={play.id}
                    onClick={() => handlePlayClick(play.id)}
                    className={`
                      w-full text-left rounded-lg overflow-hidden transition-all
                      ${isActive
                        ? 'ring-2 ring-green-500 bg-zinc-800'
                        : 'hover:bg-zinc-800/50 hover:ring-1 hover:ring-zinc-700'
                      }
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-zinc-800 relative">
                      {play.thumbnail_url ? (
                        <img
                          src={play.thumbnail_url}
                          alt={play.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PlayPreview play={play} />
                      )}
                      {isActive && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-medium rounded">
                          Editing
                        </div>
                      )}
                    </div>
                    {/* Name */}
                    <div className="p-2">
                      <p className={`text-xs truncate ${isActive ? 'text-white font-medium' : 'text-zinc-300'}`}>
                        {play.name}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {plays.length > 0 && (
            <div className="p-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 text-center">
                {searchQuery
                  ? `${filteredPlays.length} of ${plays.length} plays`
                  : `${plays.length} play${plays.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state - show icons */}
      {!isOpen && (
        <div className="flex flex-col items-center py-2 space-y-2">
          <button
            onClick={handleNewPlay}
            className="p-2 rounded-lg hover:bg-zinc-800 text-green-400 hover:text-green-300 transition-colors"
            title="New Play"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-6 h-px bg-zinc-700" />
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={`${plays.length} plays`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          {plays.length > 0 && (
            <span className="text-[10px] text-zinc-500">{plays.length}</span>
          )}
        </div>
      )}
    </div>
  );
}
