'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { createPlay, updatePlay } from '@/lib/api/plays';

interface UseSavePlayResult {
  save: () => Promise<void>;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
}

export function useSavePlay(): UseSavePlayResult {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const play = useEditorStore((state) => state.play);
  const setPlay = useEditorStore((state) => state.setPlay);
  const { user, workspace } = useAuthStore();

  const save = useCallback(async () => {
    if (!user || !workspace) {
      setError('Please log in to save');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Check if this is a new play or existing one
      const isNewPlay = !play.id || play.id.startsWith('new-') || play.createdAt === play.updatedAt;

      if (isNewPlay) {
        // Create new play
        const savedPlay = await createPlay(workspace.id, user.id, play);

        // Update the local play with the saved data (includes server-generated id)
        setPlay({
          ...play,
          id: savedPlay.id,
          createdAt: savedPlay.created_at,
          updatedAt: savedPlay.updated_at,
        });

        // Navigate to the new play URL
        router.replace(`/editor/${savedPlay.id}`);
      } else {
        // Update existing play
        const savedPlay = await updatePlay(play.id, user.id, {
          name: play.name,
          tags: play.tags,
          meta: play.meta,
          field: play.field,
          roster: play.roster,
          actions: play.actions,
          notes: play.notes,
        });

        // Update local play with new timestamp
        setPlay({
          ...play,
          updatedAt: savedPlay.updated_at,
        });
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save play:', err);
      setError('Failed to save play');
    } finally {
      setIsSaving(false);
    }
  }, [play, user, workspace, setPlay, router]);

  return {
    save,
    isSaving,
    error,
    lastSaved,
  };
}
