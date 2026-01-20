'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/store/authStore';
import { usePlaybookStore } from '@/store/playbookStore';
import { PlaysGrid } from '@/components/dashboard/PlaysGrid';
import { PlaybooksGrid } from '@/components/dashboard/PlaybooksGrid';
import { CreatePlaybookModal } from '@/components/dashboard/CreatePlaybookModal';
import { FormationRecommendPanel } from '@/components/recommendation';

type TabType = 'plays' | 'playbooks' | 'formations';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('plays');
  const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);

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

  const handleCreatePlaybook = async (name: string, tags: string[]) => {
    if (!workspace || !user) return;
    await createPlaybook(workspace.id, user.id, name, tags);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="border-b border-zinc-700 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">ForOffenseCoach</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {profile?.display_name || profile?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{workspace?.name || 'My Workspace'}</h2>
          <p className="text-zinc-400">
            Manage your playbooks and plays
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCreatePlay}
            className="p-6 bg-zinc-800 border border-zinc-700 rounded-lg text-left hover:border-green-500 transition-colors group"
          >
            <div className="text-3xl mb-3">+</div>
            <h3 className="text-lg font-medium mb-1 group-hover:text-green-400">
              New Play
            </h3>
            <p className="text-sm text-zinc-400">
              Create a new play in the editor
            </p>
          </button>

          <button
            onClick={() => setShowCreatePlaybook(true)}
            className="p-6 bg-zinc-800 border border-zinc-700 rounded-lg text-left hover:border-blue-500 transition-colors group"
          >
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-lg font-medium mb-1 group-hover:text-blue-400">
              New Playbook
            </h3>
            <p className="text-sm text-zinc-400">
              Organize plays into a playbook
            </p>
          </button>

          <button
            onClick={() => router.push('/team-profile')}
            className="p-6 bg-zinc-800 border border-zinc-700 rounded-lg text-left hover:border-purple-500 transition-colors group"
          >
            <div className="text-3xl mb-3">🏈</div>
            <h3 className="text-lg font-medium mb-1 group-hover:text-purple-400">
              Team Profile
            </h3>
            <p className="text-sm text-zinc-400">
              Set up roster and get formation recommendations
            </p>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-700 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('plays')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'plays'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Plays
            </button>
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'playbooks'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Playbooks
            </button>
            <button
              onClick={() => setActiveTab('formations')}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'formations'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
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
              <div className="h-[600px] rounded-lg overflow-hidden">
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
    </div>
  );
}
