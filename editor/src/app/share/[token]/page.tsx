'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { getShareLink } from '@/lib/api/share';
import { getPlay, databaseToPlayFormat, createPlay } from '@/lib/api/plays';
import { useAuthStore } from '@/store/authStore';
import { FieldLayer } from '@/components/editor/FieldLayer';
import { PlayerLayer } from '@/components/editor/PlayerLayer';
import { ActionLayer } from '@/components/editor/ActionLayer';
import { Button } from '@/components/ui/button';
import { Play } from '@/types/dsl';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const stageRef = useRef<Konva.Stage>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [allowFork, setAllowFork] = useState(false);
  const [isForkingd, setIsForking] = useState(false);

  const { user, workspace, initialized, initialize } = useAuthStore();

  // Canvas sizing
  const [stageWidth, setStageWidth] = useState(800);
  const [stageHeight, setStageHeight] = useState(600);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    const loadSharedContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get share link
        const shareLink = await getShareLink(token);
        if (!shareLink) {
          setError('This link is invalid or has expired');
          return;
        }

        setAllowFork(shareLink.allow_fork);

        // Get the play
        const playData = await getPlay(shareLink.playbook_id);
        if (!playData) {
          setError('Play not found');
          return;
        }

        setPlay(databaseToPlayFormat(playData));
      } catch (err) {
        console.error('Failed to load shared content:', err);
        setError('Failed to load shared content');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSharedContent();
    }
  }, [token]);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 64, 900);
      const height = width * 0.75; // 4:3 aspect ratio
      setStageWidth(width);
      setStageHeight(height);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFork = async () => {
    if (!play || !user || !workspace) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsForking(true);

      // Create a copy of the play in the user's workspace
      const newPlay = await createPlay(workspace.id, user.id, {
        ...play,
        name: `${play.name} (Copy)`,
      });

      // Navigate to the editor with the new play
      router.push(`/editor/${newPlay.id}`);
    } catch (err) {
      console.error('Failed to fork play:', err);
      setError('Failed to fork play');
    } finally {
      setIsForking(false);
    }
  };

  const handleExportPNG = () => {
    if (!stageRef.current || !play) return;

    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
    });

    const link = document.createElement('a');
    link.download = `${play.name}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-[4/3] rounded-lg" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-4">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Link Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Editor
          </Button>
        </div>
      </div>
    );
  }

  if (!play) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{play.name}</h1>
            <p className="text-sm text-muted-foreground">Shared play via ForOffenseCoach</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportPNG}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Export PNG
            </Button>
            {allowFork && (
              <Button
                onClick={handleFork}
                disabled={isForkingd}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                {isForkingd ? 'Copying...' : user ? 'Copy to My Plays' : 'Sign in to Copy'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Play View */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mx-auto" style={{ width: stageWidth }}>
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
          >
            <FieldLayer width={stageWidth} height={stageHeight} />
            <ActionLayer
              width={stageWidth}
              height={stageHeight}
              actions={play.actions}
              isReadOnly
            />
            <PlayerLayer
              width={stageWidth}
              height={stageHeight}
              players={play.roster.players}
              isReadOnly
            />
          </Stage>
        </div>

        {/* Play Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          {play.tags && play.tags.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {play.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm bg-muted text-muted-foreground rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Coaching Notes */}
          {play.notes?.coachingPoints && play.notes.coachingPoints.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Coaching Points</h3>
              <ul className="space-y-2">
                {play.notes.coachingPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-muted-foreground/60">{index + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Create your own plays with{' '}
            <a href="/" className="text-primary hover:text-primary/80">
              ForOffenseCoach
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
