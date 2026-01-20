/**
 * Subscription & Feature Gating
 * Based on business plan.md pricing tiers
 */

// Subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'team';

// Subscription status
export interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// Feature access configuration per tier
export interface FeatureAccess {
  maxPlays: number; // Free: 10, Pro/Team: unlimited (-1)
  maxPlaybooks: number; // Free: 1, Pro: 5, Team: unlimited (-1)
  pdfWatermark: boolean; // Free: true, Pro/Team: false
  installFocus: 'limited' | 'full'; // Free: limited (1 per concept), Pro/Team: full
  teamCollaboration: boolean; // Free/Pro: false, Team: true
  shareLinks: boolean; // Free: false, Pro/Team: true
  forkEnabled: boolean; // Free: false, Pro/Team: true
  exportFormats: ('png' | 'pdf')[]; // Free: ['png'], Pro/Team: ['png', 'pdf']
  prioritySupport: boolean; // Free/Pro: false, Team: true
}

// Tier configurations
export const TIER_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    maxPlays: 10,
    maxPlaybooks: 1,
    pdfWatermark: true,
    installFocus: 'limited',
    teamCollaboration: false,
    shareLinks: false,
    forkEnabled: false,
    exportFormats: ['png'],
    prioritySupport: false,
  },
  pro: {
    maxPlays: -1, // unlimited
    maxPlaybooks: 5,
    pdfWatermark: false,
    installFocus: 'full',
    teamCollaboration: false,
    shareLinks: true,
    forkEnabled: true,
    exportFormats: ['png', 'pdf'],
    prioritySupport: false,
  },
  team: {
    maxPlays: -1, // unlimited
    maxPlaybooks: -1, // unlimited
    pdfWatermark: false,
    installFocus: 'full',
    teamCollaboration: true,
    shareLinks: true,
    forkEnabled: true,
    exportFormats: ['png', 'pdf'],
    prioritySupport: true,
  },
};

// Pricing information
export interface PricingInfo {
  tier: SubscriptionTier;
  name: string;
  price: number;
  period: 'monthly' | 'season';
  features: string[];
  highlighted?: boolean;
}

export const PRICING: PricingInfo[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    period: 'monthly',
    features: [
      'Up to 10 plays',
      '1 playbook',
      'PNG export',
      'Basic concepts',
      'Formation presets',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 9,
    period: 'monthly',
    highlighted: true,
    features: [
      'Unlimited plays',
      'Up to 5 playbooks',
      'PNG & PDF export (no watermark)',
      'Full Install Focus',
      'Share links',
      'Fork plays',
    ],
  },
  {
    tier: 'team',
    name: 'Team',
    price: 99,
    period: 'season',
    features: [
      'Everything in Pro',
      'Unlimited playbooks',
      'Team workspace',
      'Member roles (Owner/Editor/Viewer)',
      'Priority support',
    ],
  },
];

/**
 * Get feature access for a subscription tier
 */
export function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  return TIER_FEATURES[tier];
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeature(
  tier: SubscriptionTier,
  feature: keyof FeatureAccess
): boolean {
  const access = TIER_FEATURES[tier];
  const value = access[feature];

  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== 'limited';
}

/**
 * Check if user has reached play limit
 */
export function hasReachedPlayLimit(
  tier: SubscriptionTier,
  currentPlayCount: number
): boolean {
  const maxPlays = TIER_FEATURES[tier].maxPlays;
  if (maxPlays === -1) return false; // unlimited
  return currentPlayCount >= maxPlays;
}

/**
 * Check if user has reached playbook limit
 */
export function hasReachedPlaybookLimit(
  tier: SubscriptionTier,
  currentPlaybookCount: number
): boolean {
  const maxPlaybooks = TIER_FEATURES[tier].maxPlaybooks;
  if (maxPlaybooks === -1) return false; // unlimited
  return currentPlaybookCount >= maxPlaybooks;
}

/**
 * Get upgrade suggestions based on blocked feature
 */
export function getUpgradeSuggestion(
  currentTier: SubscriptionTier,
  blockedFeature: keyof FeatureAccess
): SubscriptionTier | null {
  if (currentTier === 'team') return null; // Already at highest tier

  // Check if Pro tier has the feature
  if (currentTier === 'free') {
    if (hasFeature('pro', blockedFeature)) {
      return 'pro';
    }
  }

  // Check if Team tier has the feature
  if (hasFeature('team', blockedFeature)) {
    return 'team';
  }

  return null;
}

/**
 * Format price for display
 */
export function formatPrice(tier: SubscriptionTier): string {
  const pricing = PRICING.find((p) => p.tier === tier);
  if (!pricing) return '';

  if (pricing.price === 0) return 'Free';

  return `$${pricing.price}/${pricing.period === 'monthly' ? 'mo' : 'season'}`;
}

// Team member roles
export type TeamRole = 'owner' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: TeamRole;
  invitedAt: string;
  acceptedAt?: string;
}

// Role permissions
export const ROLE_PERMISSIONS: Record<TeamRole, {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageRoles: boolean;
  canManageBilling: boolean;
}> = {
  owner: {
    canEdit: true,
    canDelete: true,
    canInvite: true,
    canManageRoles: true,
    canManageBilling: true,
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canInvite: false,
    canManageRoles: false,
    canManageBilling: false,
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canInvite: false,
    canManageRoles: false,
    canManageBilling: false,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: TeamRole,
  permission: keyof typeof ROLE_PERMISSIONS.owner
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}
