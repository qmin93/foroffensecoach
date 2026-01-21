import { NextRequest, NextResponse } from 'next/server';
import { stripe, priceIdToTier } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Validate required environment variables at startup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Use service role for webhook operations (only create if env vars are set)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Get the supabase admin client, throwing if not configured.
 * This is safe to call after the POST handler validates configuration.
 */
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured');
  }
  return supabaseAdmin;
}

// In-memory set for idempotency (in production, use Redis or database)
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 10000;

export async function POST(request: NextRequest) {
  // Validate environment configuration
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
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

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch {
    // Log without exposing internal details
    console.error('Webhook signature verification failed');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Idempotency check - prevent duplicate processing
  if (processedEvents.has(event.id)) {
    console.log(`Skipping duplicate event: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Add to processed events (with size limit to prevent memory leak)
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    const firstKey = processedEvents.values().next().value;
    if (firstKey) processedEvents.delete(firstKey);
  }
  processedEvents.add(event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.subscription
    ? (await stripe.subscriptions.retrieve(session.subscription as string))
        .metadata.supabase_user_id
    : session.metadata?.supabase_user_id;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  // Subscription will be handled by subscription.created event
  console.log(`Checkout completed for user: ${userId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    // Try to find user by customer ID
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    if (customer.deleted) return;

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .single();

    if (!profile) {
      console.error('No user found for customer:', customer.id);
      return;
    }

    await updateSubscription(profile.id, subscription);
    return;
  }

  await updateSubscription(userId, subscription);
}

async function updateSubscription(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const tier = priceIdToTier(priceId) || 'free';

  // Map Stripe status to our status
  let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';
  if (subscription.status === 'canceled') status = 'canceled';
  else if (subscription.status === 'past_due') status = 'past_due';
  else if (subscription.status === 'trialing') status = 'trialing';

  // Extract period dates from subscription (cast to any for compatibility)
  const sub = subscription as unknown as {
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      tier: tier,
      status: status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }

  console.log(`Subscription updated for user ${userId}: ${tier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    if (customer.deleted) return;

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .single();

    if (!profile) return;

    await revertToFree(profile.id);
    return;
  }

  await revertToFree(userId);
}

async function revertToFree(userId: string) {
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      tier: 'free',
      status: 'active',
      stripe_subscription_id: null,
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

  console.log(`Subscription reverted to free for user: ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) return;

  // Update subscription status to past_due
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id);

  console.log(`Payment failed for user: ${profile.id}`);
  // TODO: Send email notification
}
