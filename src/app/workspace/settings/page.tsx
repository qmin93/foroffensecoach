'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { MemberList } from '@/components/workspace/MemberList';
import { InviteMemberModal } from '@/components/workspace/InviteMemberModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { TeamRole, TeamMember, PRICING } from '@/lib/subscription';

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const workspace = useAuthStore((state) => state.workspace);

  const {
    tier,
    access,
    canInvite,
    canManageRoles,
    canManageBilling,
    role,
  } = useFeatureAccess();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Mock members data - in real implementation, this would come from Supabase
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: user?.id || '1',
      userId: user?.id || '1',
      email: user?.email || 'coach@team.com',
      displayName: user?.user_metadata?.display_name || 'Head Coach',
      role: 'owner',
      avatarUrl: user?.user_metadata?.avatar_url,
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    },
  ]);

  // Get current plan info
  const currentPlan = PRICING.find((p) => p.tier === tier) || PRICING[0];

  const handleInvite = async (email: string, inviteRole: TeamRole) => {
    // TODO: Implement actual invite logic with Supabase
    console.log('Inviting:', email, 'as', inviteRole);

    // Mock: Add to members list as pending
    const newMember: TeamMember = {
      id: `pending-${Date.now()}`,
      userId: `pending-${Date.now()}`,
      email,
      role: inviteRole,
      invitedAt: new Date().toISOString(),
      // acceptedAt is undefined for pending invitations
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    // TODO: Implement actual role change with Supabase
    console.log('Changing role for:', memberId, 'to', newRole);

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    // TODO: Implement actual removal with Supabase
    console.log('Removing member:', memberId);

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Please sign in to access workspace settings</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Workspace Settings</h1>
              <p className="text-sm text-zinc-400">{workspace?.name || 'My Workspace'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Subscription Section */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-white">{currentPlan.name}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    tier === 'free'
                      ? 'bg-zinc-700 text-zinc-300'
                      : tier === 'pro'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {tier.toUpperCase()}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                  {currentPlan.price === 0
                    ? 'Free forever'
                    : `$${currentPlan.price}/${currentPlan.period === 'monthly' ? 'month' : 'season'}`}
                </p>

                {/* Current Plan Features */}
                <div className="space-y-2">
                  <p className="text-sm text-zinc-500">Your plan includes:</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {currentPlan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tier !== 'team' && canManageBilling && (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Usage Stats */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Plays</span>
                    <span className="text-sm text-zinc-300">
                      0 / {access.maxPlays === -1 ? '∞' : access.maxPlays}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: access.maxPlays === -1 ? '0%' : '0%' }}
                    />
                  </div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Playbooks</span>
                    <span className="text-sm text-zinc-300">
                      0 / {access.maxPlaybooks === -1 ? '∞' : access.maxPlaybooks}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: access.maxPlaybooks === -1 ? '0%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Members Section (Team tier only) */}
        {access.teamCollaboration && (
          <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Team Members</h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </p>
              </div>
              {canInvite && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Invite Member
                </button>
              )}
            </div>
            <div className="p-6">
              <MemberList
                members={members}
                currentUserId={user.id}
                canManageRoles={canManageRoles}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
              />
            </div>
          </section>
        )}

        {/* Workspace Info Section */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Workspace Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                defaultValue={workspace?.name || 'My Workspace'}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Workspace Type
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm ${
                  workspace?.type === 'team'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-zinc-700 text-zinc-300'
                }`}>
                  {workspace?.type === 'team' ? 'Team Workspace' : 'Personal Workspace'}
                </span>
              </div>
            </div>
            {role && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Your Role
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                    role === 'owner'
                      ? 'bg-orange-500/20 text-orange-400'
                      : role === 'editor'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        {canManageBilling && (
          <section className="bg-zinc-900 rounded-xl border border-red-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-900/50">
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Delete Workspace</p>
                  <p className="text-sm text-zinc-400">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                  onClick={() => {
                    // TODO: Implement workspace deletion
                    alert('This action is not yet implemented');
                  }}
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        workspaceName={workspace?.name || 'My Workspace'}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
      />
    </div>
  );
}
