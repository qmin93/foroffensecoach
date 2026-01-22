'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { usePlaybookStore } from '@/store/playbookStore';
import { PlayCard } from '@/components/dashboard/PlayCard';
import { getPlays, deletePlay, duplicatePlay } from '@/lib/api/plays';
import { Tables } from '@/types/database';
import { PlaybookDetailSkeleton, PlaysGridSkeleton } from '@/components/ui/Skeleton';

type PlayRow = Tables<'plays'>;

export default function PlaybookPage() {
  const params = useParams();
  const router = useRouter();
  const playbookId = params.playbookId as string;

  const [plays, setPlays] = useState<PlayRow[]>([]);
  const [isLoadingPlays, setIsLoadingPlays] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const { user, workspace, initialized, initialize } = useAuthStore();
  const {
    currentPlaybook,
    isLoading,
    error,
    fetchPlaybook,
    updatePlaybook,
    deletePlaybook,
  } = usePlaybookStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (playbookId && initialized) {
      fetchPlaybook(playbookId);
    }
  }, [playbookId, initialized, fetchPlaybook]);

  useEffect(() => {
    if (currentPlaybook) {
      setEditName(currentPlaybook.name);
      fetchPlays();
    }
  }, [currentPlaybook]);

  const fetchPlays = async () => {
    if (!workspace) return;
    try {
      setIsLoadingPlays(true);
      const allPlays = await getPlays(workspace.id);
      // Filter plays that belong to this playbook
      const playbookPlays = allPlays.filter(
        (p) => p.playbook_id === playbookId
      );
      setPlays(playbookPlays);
    } catch (err) {
      console.error('Failed to fetch plays:', err);
    } finally {
      setIsLoadingPlays(false);
    }
  };

  const handleOpenPlay = (playId: string) => {
    router.push(`/editor/${playId}`);
  };

  const handleDuplicatePlay = async (playId: string) => {
    if (!workspace || !user) return;
    try {
      await duplicatePlay(playId, workspace.id, user.id);
      fetchPlays();
    } catch (err) {
      console.error('Failed to duplicate play:', err);
    }
  };

  const handleDeletePlay = async (playId: string) => {
    try {
      await deletePlay(playId);
      setPlays((prev) => prev.filter((p) => p.id !== playId));
    } catch (err) {
      console.error('Failed to delete play:', err);
    }
  };

  const handleSaveName = async () => {
    if (!user || !currentPlaybook) return;
    try {
      await updatePlaybook(currentPlaybook.id, user.id, { name: editName });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update playbook:', err);
    }
  };

  const handleDeletePlaybook = async () => {
    if (!currentPlaybook) return;
    if (confirm(`Delete "${currentPlaybook.name}"? This will NOT delete the plays inside.`)) {
      try {
        await deletePlaybook(currentPlaybook.id);
        router.push('/dashboard');
      } catch (err) {
        console.error('Failed to delete playbook:', err);
      }
    }
  };

  if (isLoading) {
    return <PlaybookDetailSkeleton />;
  }

  if (error || !currentPlaybook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Playbook not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link href="/" className="text-xl font-bold hover:text-muted-foreground transition-colors">
              ForOffenseCoach
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playbook Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-muted border border-border rounded px-3 py-2 text-xl font-bold"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditName(currentPlaybook.name);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h2
                  className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Click to edit"
                >
                  {currentPlaybook.name}
                </h2>
              )}
              <p className="text-muted-foreground mt-2">
                {plays.length} plays &bull; Updated{' '}
                {formatDistanceToNow(new Date(currentPlaybook.updated_at), { addSuffix: true })}
              </p>
              {currentPlaybook.tags && currentPlaybook.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentPlaybook.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-sm bg-primary/10 text-primary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => router.push('/editor')}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Play
              </button>
              <button
                onClick={handleDeletePlaybook}
                className="px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Plays Grid */}
        {isLoadingPlays ? (
          <PlaysGridSkeleton />
        ) : plays.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No Plays in This Playbook</h3>
            <p className="text-muted-foreground mb-4">
              Add plays to this playbook from the editor
            </p>
            <button
              onClick={() => router.push('/editor')}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-colors"
            >
              Create Play
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {plays.map((play) => (
              <PlayCard
                key={play.id}
                play={play}
                onOpen={handleOpenPlay}
                onDuplicate={handleDuplicatePlay}
                onDelete={handleDeletePlay}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
