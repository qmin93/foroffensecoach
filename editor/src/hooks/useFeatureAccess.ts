'use client';

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  SubscriptionTier,
  FeatureAccess,
  getFeatureAccess,
  hasFeature,
  hasReachedPlayLimit,
  hasReachedPlaybookLimit,
  getUpgradeSuggestion,
  hasPermission,
  TeamRole,
  ROLE_PERMISSIONS,
} from '@/lib/subscription';

interface UseFeatureAccessReturn {
  // Current tier and access
  tier: SubscriptionTier;
  access: FeatureAccess;

  // Feature checks
  canCreatePlay: boolean;
  canCreatePlaybook: boolean;
  canExportPDF: boolean;
  canShareLinks: boolean;
  canForkPlays: boolean;
  canAccessFullInstallFocus: boolean;
  canCollaborate: boolean;
  hasPrioritySupport: boolean;
  showWatermark: boolean;

  // Limits
  playLimit: number;
  playbookLimit: number;

  // Helper functions
  checkFeature: (feature: keyof FeatureAccess) => boolean;
  getUpgradeTarget: (feature: keyof FeatureAccess) => SubscriptionTier | null;

  // Team role checks (if in team workspace)
  role: TeamRole | null;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageRoles: boolean;
  canManageBilling: boolean;
}

/**
 * Hook for checking feature access based on subscription tier
 */
export function useFeatureAccess(): UseFeatureAccessReturn {
  const user = useAuthStore((state) => state.user);
  const workspace = useAuthStore((state) => state.workspace);

  // Get subscription tier from user profile or default to free
  // In a real implementation, this would come from the user's subscription data
  const tier: SubscriptionTier = useMemo(() => {
    // TODO: Get actual subscription tier from user profile or Supabase
    // For now, return 'free' as default
    if (!user) return 'free';

    // Check workspace type for team tier
    if (workspace?.type === 'team') {
      return 'team';
    }

    // This would be fetched from subscription data
    // For now, default to free
    return 'free';
  }, [user, workspace]);

  // Get feature access for current tier
  const access = useMemo(() => getFeatureAccess(tier), [tier]);

  // Get team role if in team workspace
  const role: TeamRole | null = useMemo(() => {
    if (workspace?.type !== 'team') return null;

    // TODO: Get actual role from workspace membership
    // For now, assume owner for the workspace creator
    if (workspace.owner_id === user?.id) {
      return 'owner';
    }

    // Default to viewer for other team members
    return 'viewer';
  }, [workspace, user]);

  // Feature checks
  const canCreatePlay = useMemo(() => {
    // TODO: Get actual play count from database
    const currentPlayCount = 0; // This would be fetched
    return !hasReachedPlayLimit(tier, currentPlayCount);
  }, [tier]);

  const canCreatePlaybook = useMemo(() => {
    // TODO: Get actual playbook count from database
    const currentPlaybookCount = 0; // This would be fetched
    return !hasReachedPlaybookLimit(tier, currentPlaybookCount);
  }, [tier]);

  const canExportPDF = useMemo(
    () => access.exportFormats.includes('pdf'),
    [access]
  );

  const canShareLinks = useMemo(() => access.shareLinks, [access]);

  const canForkPlays = useMemo(() => access.forkEnabled, [access]);

  const canAccessFullInstallFocus = useMemo(
    () => access.installFocus === 'full',
    [access]
  );

  const canCollaborate = useMemo(() => access.teamCollaboration, [access]);

  const hasPrioritySupport = useMemo(() => access.prioritySupport, [access]);

  const showWatermark = useMemo(() => access.pdfWatermark, [access]);

  // Limits
  const playLimit = useMemo(() => access.maxPlays, [access]);
  const playbookLimit = useMemo(() => access.maxPlaybooks, [access]);

  // Helper functions
  const checkFeature = useCallback(
    (feature: keyof FeatureAccess) => hasFeature(tier, feature),
    [tier]
  );

  const getUpgradeTarget = useCallback(
    (feature: keyof FeatureAccess) => getUpgradeSuggestion(tier, feature),
    [tier]
  );

  // Team role permissions
  const canEdit = useMemo(
    () => (role ? hasPermission(role, 'canEdit') : true), // Non-team users can always edit their own content
    [role]
  );

  const canDelete = useMemo(
    () => (role ? hasPermission(role, 'canDelete') : true),
    [role]
  );

  const canInvite = useMemo(
    () => (role ? hasPermission(role, 'canInvite') : false),
    [role]
  );

  const canManageRoles = useMemo(
    () => (role ? hasPermission(role, 'canManageRoles') : false),
    [role]
  );

  const canManageBilling = useMemo(
    () => (role ? hasPermission(role, 'canManageBilling') : true), // Non-team users manage their own billing
    [role]
  );

  return {
    tier,
    access,
    canCreatePlay,
    canCreatePlaybook,
    canExportPDF,
    canShareLinks,
    canForkPlays,
    canAccessFullInstallFocus,
    canCollaborate,
    hasPrioritySupport,
    showWatermark,
    playLimit,
    playbookLimit,
    checkFeature,
    getUpgradeTarget,
    role,
    canEdit,
    canDelete,
    canInvite,
    canManageRoles,
    canManageBilling,
  };
}

export default useFeatureAccess;
