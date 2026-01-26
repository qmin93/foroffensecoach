/**
 * Lemon Squeezy SDK Initialization & Configuration
 * Parallel payment provider alongside Stripe
 */

import { createHmac, timingSafeEqual } from 'crypto';

// Lemon Squeezy API configuration
export interface LemonSqueezyConfig {
  apiKey: string;
  baseUrl: string;
  headers: Record<string, string>;
}

// Lazy initialization of API config
let lsConfig: LemonSqueezyConfig | null = null;

export function getLemonSqueezyAPI(): LemonSqueezyConfig {
  if (!lsConfig) {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      throw new Error('LEMONSQUEEZY_API_KEY is not configured');
    }

    lsConfig = {
      apiKey,
      baseUrl: 'https://api.lemonsqueezy.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    };
  }
  return lsConfig;
}

// Variant IDs for subscription tiers (Lemon Squeezy uses "variants" instead of "prices")
export function getLemonSqueezyVariantIds() {
  return {
    pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
    team: process.env.LEMONSQUEEZY_TEAM_VARIANT_ID || '',
  };
}

// Map variant ID to subscription tier
export function variantIdToTier(variantId: string): 'pro' | 'team' | null {
  const variants = getLemonSqueezyVariantIds();
  if (variantId === variants.pro) return 'pro';
  if (variantId === variants.team) return 'team';
  return null;
}

// Map subscription tier to variant ID
export function tierToVariantId(tier: 'pro' | 'team'): string {
  const variants = getLemonSqueezyVariantIds();
  return variants[tier];
}

// Checkout response type
export interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    attributes: {
      url: string;
    };
  };
}

// Create checkout session
export async function createLemonSqueezyCheckout(options: {
  variantId: string;
  email?: string;
  customData: Record<string, string>;
  successUrl: string;
}): Promise<LemonSqueezyCheckoutResponse> {
  const api = getLemonSqueezyAPI();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not configured');
  }

  const response = await fetch(`${api.baseUrl}/checkouts`, {
    method: 'POST',
    headers: api.headers,
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: options.customData,
            email: options.email,
          },
          product_options: {
            redirect_url: options.successUrl,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: options.variantId } },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lemon Squeezy checkout error:', errorText);
    throw new Error('Failed to create Lemon Squeezy checkout');
  }

  return response.json();
}

// Customer portal URL response type
export interface LemonSqueezyCustomerResponse {
  data: {
    id: string;
    attributes: {
      urls: {
        customer_portal: string;
      };
    };
  };
}

// Get customer portal URL
export async function getLemonSqueezyPortalUrl(customerId: string): Promise<string> {
  const api = getLemonSqueezyAPI();

  const response = await fetch(`${api.baseUrl}/customers/${customerId}`, {
    headers: api.headers,
  });

  if (!response.ok) {
    throw new Error('Failed to get Lemon Squeezy customer');
  }

  const data: LemonSqueezyCustomerResponse = await response.json();
  return data.data.attributes.urls.customer_portal;
}

// Webhook signature verification
export function verifyLemonSqueezySignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
  }

  const hmac = createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

// Webhook event types
export type LemonSqueezyEventName =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'subscription_payment_failed'
  | 'subscription_payment_success'
  | 'subscription_payment_recovered';

// Webhook payload structure
export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: LemonSqueezyEventName;
    custom_data?: {
      supabase_user_id?: string;
      tier?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
      card_brand?: string;
      card_last_four?: string;
      renews_at?: string;
      ends_at?: string;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
    };
    relationships: {
      customer: {
        data: {
          id: string;
        };
      };
    };
  };
}

// Map Lemon Squeezy status to our status
export function mapLemonSqueezyStatus(
  lsStatus: string
): 'active' | 'canceled' | 'past_due' | 'trialing' {
  switch (lsStatus) {
    case 'on_trial':
      return 'trialing';
    case 'active':
      return 'active';
    case 'paused':
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'cancelled':
    case 'expired':
      return 'canceled';
    default:
      return 'active';
  }
}
