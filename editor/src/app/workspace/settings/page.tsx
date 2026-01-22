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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access workspace settings</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Workspace Settings</h1>
              <p className="text-sm text-muted-foreground">{workspace?.name || 'My Workspace'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Subscription Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-foreground">{currentPlan.name}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    tier === 'free'
                      ? 'bg-muted text-muted-foreground'
                      : tier === 'pro'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-orange-500/20 text-orange-600'
                  }`}>
                    {tier.toUpperCase()}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {currentPlan.price === 0
                    ? 'Free forever'
                    : `$${currentPlan.price}/${currentPlan.period === 'monthly' ? 'month' : 'season'}`}
                </p>

                {/* Current Plan Features */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your plan includes:</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {currentPlan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Usage Stats */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Plays</span>
                    <span className="text-sm text-foreground">
                      0 / {access.maxPlays === -1 ? '∞' : access.maxPlays}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: access.maxPlays === -1 ? '0%' : '0%' }}
                    />
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Playbooks</span>
                    <span className="text-sm text-foreground">
                      0 / {access.maxPlaybooks === -1 ? '∞' : access.maxPlaybooks}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
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
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </p>
              </div>
              {canInvite && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Workspace Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                defaultValue={workspace?.name || 'My Workspace'}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Workspace Type
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm ${
                  workspace?.type === 'team'
                    ? 'bg-orange-500/20 text-orange-600'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {workspace?.type === 'team' ? 'Team Workspace' : 'Personal Workspace'}
                </span>
              </div>
            </div>
            {role && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Your Role
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                    role === 'owner'
                      ? 'bg-orange-500/20 text-orange-600'
                      : role === 'editor'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
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
          <section className="bg-card rounded-xl border border-destructive/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-destructive/50">
              <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Delete Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-colors"
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
