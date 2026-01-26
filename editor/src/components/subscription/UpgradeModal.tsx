'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SubscriptionTier,
  PRICING,
  PricingInfo,
  FeatureAccess,
  PaymentProvider,
} from '@/lib/subscription';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  blockedFeature?: keyof FeatureAccess;
  suggestedTier?: SubscriptionTier;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  blockedFeature,
  suggestedTier,
}: UpgradeModalProps) {
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('stripe');

  // Filter out current tier and below
  const availablePlans = useMemo(() => {
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'team'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return PRICING.filter((p) => tierOrder.indexOf(p.tier) > currentIndex);
  }, [currentTier]);

  // Get feature-specific message
  const featureMessage = useMemo(() => {
    if (!blockedFeature) return null;

    const messages: Record<keyof FeatureAccess, string> = {
      maxPlays: "You've reached your play limit",
      maxPlaybooks: "You've reached your playbook limit",
      pdfWatermark: 'Remove watermarks from PDF exports',
      installFocus: 'Access all Install Focus drill recommendations',
      teamCollaboration: 'Collaborate with your coaching staff',
      shareLinks: 'Share plays with public links',
      forkEnabled: 'Fork and remix shared plays',
      exportFormats: 'Export to PDF format',
      prioritySupport: 'Get priority support',
    };

    return messages[blockedFeature];
  }, [blockedFeature]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-zinc-700">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upgrade Your Plan</h2>
            {featureMessage && (
              <p className="text-sm text-orange-400 mt-1">{featureMessage}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Plan Badge */}
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
            <span>Current plan:</span>
            <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300 capitalize">
              {currentTier}
            </span>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-2">Payment method:</p>
            <PaymentMethodSelector
              selected={paymentProvider}
              onSelect={setPaymentProvider}
            />
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {availablePlans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                isRecommended={plan.tier === suggestedTier || plan.highlighted}
                onClose={onClose}
                paymentProvider={paymentProvider}
              />
            ))}
          </div>

          {/* FAQ Link */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            <p>
              Questions about pricing?{' '}
              <a href="#" className="text-blue-400 hover:underline">
                View FAQ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: PricingInfo;
  isRecommended?: boolean;
  onClose: () => void;
  paymentProvider: PaymentProvider;
}

function PlanCard({ plan, isRecommended, onClose, paymentProvider }: PlanCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (plan.price === 0) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = paymentProvider === 'lemonsqueezy'
        ? '/api/lemonsqueezy/checkout'
        : '/api/stripe/checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: plan.tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          onClose();
          router.push('/auth/login?redirect=/pricing');
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-5 transition-all ${
        isRecommended
          ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
      }`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-zinc-400">
              /{plan.period === 'monthly' ? 'month' : 'season'}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <svg
              className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      {/* CTA Button */}
      <button
        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecommended
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-zinc-700 hover:bg-zinc-600 text-white'
        }`}
        onClick={handleUpgrade}
        disabled={loading || plan.price === 0}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : plan.price === 0 ? (
          'Current Plan'
        ) : (
          `Upgrade to ${plan.name}`
        )}
      </button>
    </div>
  );
}

export default UpgradeModal;
