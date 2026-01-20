'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { getPlay, databaseToPlayFormat } from '@/lib/api/plays';
import { PlayEditor } from '@/components/editor/PlayEditor';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const playId = params.playId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setPlay = useEditorStore((state) => state.setPlay);
  const { user, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    const loadPlay = async () => {
      try {
        setLoading(true);
        setError(null);

        const dbPlay = await getPlay(playId);
        if (!dbPlay) {
          setError('Play not found');
          return;
        }

        const play = databaseToPlayFormat(dbPlay);
        setPlay(play);
      } catch (err) {
        console.error('Failed to load play:', err);
        setError('Failed to load play');
      } finally {
        setLoading(false);
      }
    };

    if (playId && initialized) {
      loadPlay();
    }
  }, [playId, initialized, setPlay]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading play...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <PlayEditor />;
}
