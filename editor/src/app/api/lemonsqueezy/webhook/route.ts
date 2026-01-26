import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyLemonSqueezySignature,
  variantIdToTier,
  mapLemonSqueezyStatus,
  type LemonSqueezyWebhookPayload,
} from '@/lib/lemonsqueezy';

// Validate required environment variables at startup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role for webhook operations (only create if env vars are set)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured');
  }
  return supabaseAdmin;
}

// In-memory set for idempotency
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 10000;

export async function POST(request: NextRequest) {
  // Validate environment configuration
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  if (!supabaseAdmin) {
    console.error('Supabase admin client is not configured');
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  // Verify webhook signature
  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    console.error('Lemon Squeezy webhook signature verification failed');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const eventId = `${payload.meta.event_name}-${payload.data.id}-${payload.data.attributes.updated_at}`;

  // Idempotency check
  if (processedEvents.has(eventId)) {
    console.log(`Skipping duplicate Lemon Squeezy event: ${eventId}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Add to processed events with size limit
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    const firstKey = processedEvents.values().next().value;
    if (firstKey) processedEvents.delete(firstKey);
  }
  processedEvents.add(eventId);

  try {
    const eventName = payload.meta.event_name;
    console.log(`Processing Lemon Squeezy event: ${eventName}`);

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_unpaused':
        await handleSubscriptionChange(payload);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(payload);
        break;

      case 'subscription_paused':
      case 'subscription_payment_failed':
        await handleSubscriptionPaused(payload);
        break;

      case 'subscription_payment_success':
      case 'subscription_payment_recovered':
        // Reactivate subscription
        await handleSubscriptionChange(payload);
        break;

      default:
        console.log(`Unhandled Lemon Squeezy event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(payload: LemonSqueezyWebhookPayload) {
  const userId = payload.meta.custom_data?.supabase_user_id;
  const customerId = payload.data.relationships.customer.data.id;
  const subscriptionId = payload.data.id;
  const variantId = String(payload.data.attributes.variant_id);
  const attrs = payload.data.attributes;

  if (!userId) {
    // Try to find user by Lemon Squeezy customer ID
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('ls_customer_id', customerId)
      .single();

    if (!profile) {
      console.error('No user found for Lemon Squeezy customer:', customerId);
      return;
    }

    await updateSubscription(profile.id, {
      customerId,
      subscriptionId,
      variantId,
      status: attrs.status,
      renewsAt: attrs.renews_at,
      endsAt: attrs.ends_at,
    });
    return;
  }

  // Save customer ID to profile if not already saved
  await getSupabaseAdmin()
    .from('profiles')
    .update({ ls_customer_id: customerId })
    .eq('id', userId);

  await updateSubscription(userId, {
    customerId,
    subscriptionId,
    variantId,
    status: attrs.status,
    renewsAt: attrs.renews_at,
    endsAt: attrs.ends_at,
  });
}

async function updateSubscription(
  userId: string,
  data: {
    customerId: string;
    subscriptionId: string;
    variantId: string;
    status: string;
    renewsAt?: string;
    endsAt?: string;
  }
) {
  const tier = variantIdToTier(data.variantId) || 'free';
  const status = mapLemonSqueezyStatus(data.status);

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      ls_subscription_id: data.subscriptionId,
      ls_customer_id: data.customerId,
      payment_provider: 'lemonsqueezy',
      tier: tier,
      status: status,
      current_period_start: new Date().toISOString(),
      current_period_end: data.renewsAt || data.endsAt || null,
      cancel_at_period_end: !!data.endsAt,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to update Lemon Squeezy subscription:', error);
    throw error;
  }

  console.log(`Lemon Squeezy subscription updated for user ${userId}: ${tier} (${status})`);
}

async function handleSubscriptionCancelled(payload: LemonSqueezyWebhookPayload) {
  const userId = payload.meta.custom_data?.supabase_user_id;
  const customerId = payload.data.relationships.customer.data.id;

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('ls_customer_id', customerId)
      .single();

    if (!profile) return;
    targetUserId = profile.id;
  }

  // Revert to free tier
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: targetUserId,
      tier: 'free',
      status: 'active',
      payment_provider: 'lemonsqueezy',
      ls_subscription_id: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to revert to free:', error);
    throw error;
  }

  console.log(`Lemon Squeezy subscription cancelled for user: ${targetUserId}`);
}

async function handleSubscriptionPaused(payload: LemonSqueezyWebhookPayload) {
  const userId = payload.meta.custom_data?.supabase_user_id;
  const customerId = payload.data.relationships.customer.data.id;

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('ls_customer_id', customerId)
      .single();

    if (!profile) return;
    targetUserId = profile.id;
  }

  // Update subscription status to past_due
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', targetUserId);

  console.log(`Lemon Squeezy subscription paused/failed for user: ${targetUserId}`);
}
