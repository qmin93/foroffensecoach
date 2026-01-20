'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING, SubscriptionTier } from '@/lib/subscription';
import { useAuthStore } from '@/store/authStore';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free') {
      router.push('/dashboard');
      return;
    }

    if (!user) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setLoading(tier);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-xl font-bold text-white hover:text-zinc-300 transition-colors"
          >
            ForOffenseCoach
          </button>
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Pricing Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-zinc-400">
            Choose the plan that works best for your coaching needs
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600/20 to-blue-600/5 border-2 border-blue-500'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-zinc-400">
                      /{plan.period === 'monthly' ? 'mo' : 'season'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? 'text-blue-400' : 'text-green-400'
                      }`}
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

              <button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.tier ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : plan.tier === 'free' ? (
                  'Get Started'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-zinc-400">
                Yes, you can cancel your subscription at any time. Your access
                will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                What happens to my plays if I downgrade?
              </h3>
              <p className="text-zinc-400">
                Your plays are never deleted. If you exceed the free tier limit,
                you&apos;ll still be able to view them but won&apos;t be able to create new
                ones until you upgrade or delete some plays.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Is there a discount for annual billing?
              </h3>
              <p className="text-zinc-400">
                The Team plan is billed per season (approximately 5 months),
                which already offers better value than monthly billing.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>&copy; 2025 ForOffenseCoach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
