import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Server-side Stripe instance (lazy initialization)
let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get customers() { return getStripeServer().customers; },
  get checkout() { return getStripeServer().checkout; },
  get subscriptions() { return getStripeServer().subscriptions; },
  get billingPortal() { return getStripeServer().billingPortal; },
  get webhooks() { return getStripeServer().webhooks; },
};

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

// Price IDs for subscription tiers (lazy access)
export function getStripePriceIds() {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
    team: process.env.STRIPE_TEAM_PRICE_ID || '',
  };
}

// For backward compatibility
export const STRIPE_PRICE_IDS = {
  get pro() { return process.env.STRIPE_PRO_PRICE_ID || ''; },
  get team() { return process.env.STRIPE_TEAM_PRICE_ID || ''; },
};

// Map Stripe price ID to subscription tier
export function priceIdToTier(priceId: string): 'pro' | 'team' | null {
  const priceIds = getStripePriceIds();
  if (priceId === priceIds.pro) return 'pro';
  if (priceId === priceIds.team) return 'team';
  return null;
}

// Map subscription tier to Stripe price ID
export function tierToPriceId(tier: 'pro' | 'team'): string {
  const priceIds = getStripePriceIds();
  return priceIds[tier];
}
