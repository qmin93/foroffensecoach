'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { getPlay, databaseToPlayFormat } from '@/lib/api/plays';
import { PlayEditor } from '@/components/editor/PlayEditor';
import { getConceptById } from '@/data/concepts';
import { buildConceptActions } from '@/lib/concept-builder';
import { DEFAULT_PLAY_FIELD } from '@/types/dsl';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import { EditorSkeleton } from '@/components/ui/Skeleton';

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

        // Fix field settings for plays with old/missing field properties
        if (!play.field || !play.field.showYardLines) {
          play.field = { ...DEFAULT_PLAY_FIELD, ...play.field };
        }

        // Auto-regenerate routes if play has conceptId but no/empty actions
        // This fixes plays created before the buildConceptActions fix
        const conceptId = play.meta?.conceptId;
        const actionsArray = Array.isArray(play.actions) ? play.actions : [];
        const hasNoActions = actionsArray.length === 0;
        const hasPlayers = play.roster?.players && play.roster.players.length > 0;

        console.log('Play loaded from DB:', {
          name: play.name,
          conceptId,
          hasNoActions,
          actionsCount: play.actions?.length ?? 0,
          playersCount: play.roster?.players?.length ?? 0,
          firstAction: play.actions?.[0],
          fieldSettings: play.field,
        });

        // Regenerate routes BEFORE setting play if needed
        if (conceptId && hasNoActions && hasPlayers) {
          console.log('Auto-regenerating routes for conceptId:', conceptId);
          const concept = getConceptById(conceptId);

          if (concept) {
            try {
              const result = buildConceptActions(concept, play.roster.players);
              play.actions = result.actions;
              console.log(`Regenerated ${result.actionsCreated} actions for play`);
            } catch (err) {
              console.error('Failed to regenerate routes:', err);
            }
          } else {
            console.error('Concept not found:', conceptId);
          }
        }

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
    return <EditorSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <GlobalNavbar />
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <GlobalNavbar />
      <div className="flex-1 min-h-0">
        <PlayEditor />
      </div>
    </div>
  );
}
