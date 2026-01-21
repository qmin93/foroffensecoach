'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SubscriptionTier,
  TIER_FEATURES,
  formatPrice,
  Subscription,
} from '@/lib/subscription';

interface SubscriptionManagerProps {
  subscription: Subscription | null;
  tier: SubscriptionTier;
}

export function SubscriptionManager({
  subscription,
  tier,
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const features = TIER_FEATURES[tier];

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (t: SubscriptionTier) => {
    switch (t) {
      case 'team':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-400';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'canceled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Subscription</h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getTierBadgeColor(
              tier
            )}`}
          >
            {tier}
          </span>
          {subscription && (
            <span
              className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusBadgeColor(
                subscription.status
              )}`}
            >
              {subscription.status}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Current Plan Info */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-700">
          <span className="text-zinc-400">Current Plan</span>
          <span className="text-white font-medium">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} - {formatPrice(tier)}
          </span>
        </div>

        {subscription?.currentPeriodEnd && (
          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <span className="text-zinc-400">
              {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
            </span>
            <span className="text-white">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
            Your subscription will be canceled at the end of the current billing
            period.
          </div>
        )}

        {/* Features Summary */}
        <div className="py-3">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">
            Plan Features
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">
              <span className="text-zinc-400">Plays: </span>
              <span className="text-white">
                {features.maxPlays === -1 ? 'Unlimited' : features.maxPlays}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-zinc-400">Playbooks: </span>
              <span className="text-white">
                {features.maxPlaybooks === -1
                  ? 'Unlimited'
                  : features.maxPlaybooks}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-zinc-400">PDF Export: </span>
              <span className="text-white">
                {features.exportFormats.includes('pdf') ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-zinc-400">Share Links: </span>
              <span className="text-white">
                {features.shareLinks ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {tier === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Upgrade Plan
            </button>
          ) : (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </button>
          )}
          <button
            onClick={() => router.push('/pricing')}
            className="py-2 px-4 border border-zinc-600 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManager;
