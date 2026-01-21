'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/store/authStore';
import { usePlaybookStore } from '@/store/playbookStore';
import { PlaysGrid } from '@/components/dashboard/PlaysGrid';
import { PlaybooksGrid } from '@/components/dashboard/PlaybooksGrid';
import { CreatePlaybookModal } from '@/components/dashboard/CreatePlaybookModal';
import { QuickStartModal } from '@/components/dashboard/QuickStartModal';
import { FormationRecommendPanel } from '@/components/recommendation';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import { type GeneratedPlay, convertGeneratedPlayToPlayDSL } from '@/lib/playbook-generator';
import { createPlay } from '@/lib/api/plays';
import { addPlayToPlaybook } from '@/lib/api/playbooks';

type TabType = 'plays' | 'playbooks' | 'formations';

// Component to handle search params (needs Suspense boundary)
function QuickStartHandler({ onQuickStart }: { onQuickStart: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('quickstart') === 'true') {
      onQuickStart();
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router, onQuickStart]);

  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('plays');
  const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);

  const { initialize, initialized, profile, workspace, user, signOut } = useAuthStore();

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const { createPlaybook } = usePlaybookStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [initialized, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreatePlay = () => {
    router.push('/editor');
  };

  const handleOpenPlay = (playId: string) => {
    router.push(`/editor/${playId}`);
  };

  const handleOpenPlaybook = (playbookId: string) => {
    router.push(`/playbook/${playbookId}`);
  };

  const handleCreatePlaybook = async (
    name: string,
    tags: string[],
    generatedPlays: GeneratedPlay[],
    onProgress?: (progress: { current: number; total: number; currentPlayName: string }) => void
  ) => {
    if (!workspace || !user) return;

    // 1. Create the playbook
    const playbook = await createPlaybook(workspace.id, user.id, name, tags);

    // 2. Create each generated play and add to playbook
    const selectedPlays = generatedPlays.filter(p => p.selected);
    const total = selectedPlays.length;

    for (let i = 0; i < selectedPlays.length; i++) {
      const generatedPlay = selectedPlays[i];

      // Report progress
      onProgress?.({
        current: i + 1,
        total,
        currentPlayName: generatedPlay.name,
      });

      try {
        // Convert generated play to DSL format
        const playDSL = convertGeneratedPlayToPlayDSL(generatedPlay);

        // Create the play in the database
        const createdPlay = await createPlay(
          workspace.id,
          user.id,
          playDSL as any // Type coercion needed for partial Play type
        );

        // Add the play to the playbook
        await addPlayToPlaybook(createdPlay.id, playbook.id, user.id);
      } catch (err) {
        console.error('Failed to create play:', generatedPlay.name, err);
        // Continue with other plays even if one fails
      }
    }

    // 3. Navigate to the new playbook
    router.push(`/playbook/${playbook.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Handle quickstart query param */}
      <Suspense fallback={null}>
        <QuickStartHandler onQuickStart={() => setShowQuickStart(true)} />
      </Suspense>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Workspace Info */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{workspace?.name || 'My Workspace'}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your playbooks and plays
          </p>
        </div>

        {/* Quick Start - Featured Button */}
        <button
          onClick={() => setShowQuickStart(true)}
          className="w-full mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-left hover:from-green-500 hover:to-blue-500 transition-all shadow-lg shadow-green-600/20 group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-3xl sm:text-5xl">⚡</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                Quick Start
              </h3>
              <p className="text-sm sm:text-base text-white/80 truncate sm:whitespace-normal">
                Select formations → Auto-generate plays
              </p>
            </div>
            <div className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all hidden sm:block">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <button
            onClick={handleCreatePlay}
            className="p-4 sm:p-6 bg-card border border-border rounded-lg text-left hover:border-green-500 hover:shadow-md transition-all group"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">+</div>
            <h3 className="text-base sm:text-lg font-medium mb-0.5 sm:mb-1 group-hover:text-green-600">
              New Play
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create a new play in the editor
            </p>
          </button>

          <button
            onClick={() => setShowCreatePlaybook(true)}
            className="p-4 sm:p-6 bg-card border border-border rounded-lg text-left hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📁</div>
            <h3 className="text-base sm:text-lg font-medium mb-0.5 sm:mb-1 group-hover:text-blue-600">
              New Playbook
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Organize plays into a playbook
            </p>
          </button>

          <button
            onClick={() => router.push('/team-profile')}
            className="p-4 sm:p-6 bg-card border border-border rounded-lg text-left hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏈</div>
            <h3 className="text-base sm:text-lg font-medium mb-0.5 sm:mb-1 group-hover:text-purple-600">
              Team Profile
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Set up roster and get recommendations
            </p>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-4 sm:mb-6 overflow-x-auto">
          <nav className="flex gap-4 sm:gap-8 min-w-max">
            <button
              onClick={() => setActiveTab('plays')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'plays'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Plays
            </button>
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'playbooks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Playbooks
            </button>
            <button
              onClick={() => setActiveTab('formations')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'formations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Formations
            </button>
          </nav>
        </div>

        {/* Content */}
        {workspace && user && (
          <>
            {activeTab === 'plays' && (
              <PlaysGrid
                workspaceId={workspace.id}
                userId={user.id}
                onOpenPlay={handleOpenPlay}
                onCreatePlay={handleCreatePlay}
              />
            )}
            {activeTab === 'playbooks' && (
              <PlaybooksGrid
                workspaceId={workspace.id}
                userId={user.id}
                onOpenPlaybook={handleOpenPlaybook}
                onCreatePlaybook={() => setShowCreatePlaybook(true)}
              />
            )}
            {activeTab === 'formations' && (
              <div className="h-[600px] rounded-lg overflow-hidden border border-border">
                <FormationRecommendPanel
                  onSelectFormation={(formationId) => {
                    // Navigate to editor with selected formation
                    router.push(`/editor?formation=${formationId}`);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Playbook Modal */}
      <CreatePlaybookModal
        isOpen={showCreatePlaybook}
        onClose={() => setShowCreatePlaybook(false)}
        onCreate={handleCreatePlaybook}
      />

      {/* Quick Start Modal */}
      <QuickStartModal
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onCreate={handleCreatePlaybook}
      />
    </div>
  );
}
