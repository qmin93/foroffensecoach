import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Client-side Stripe promise (singleton)
let stripePromise: Promise<StripeJS | null> | null = null;

export function getStripe(): Promise<StripeJS | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}

// Price IDs for subscription tiers
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  team: process.env.STRIPE_TEAM_PRICE_ID!,
} as const;

// Map Stripe price ID to subscription tier
export function priceIdToTier(priceId: string): 'pro' | 'team' | null {
  if (priceId === STRIPE_PRICE_IDS.pro) return 'pro';
  if (priceId === STRIPE_PRICE_IDS.team) return 'team';
  return null;
}

// Map subscription tier to Stripe price ID
export function tierToPriceId(tier: 'pro' | 'team'): string {
  return STRIPE_PRICE_IDS[tier];
}
