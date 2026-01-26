import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLemonSqueezyCheckout, tierToVariantId } from '@/lib/lemonsqueezy';
import { z } from 'zod';

// Input validation schema (same as Stripe)
const CheckoutRequestSchema = z.object({
  tier: z.enum(['pro', 'team'], {
    message: 'Invalid subscription tier',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate and parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const parseResult = CheckoutRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { tier } = parseResult.data;

    const variantId = tierToVariantId(tier);
    if (!variantId) {
      return NextResponse.json(
        { error: 'Product variant not configured' },
        { status: 500 }
      );
    }

    // Create Lemon Squeezy checkout session
    const checkout = await createLemonSqueezyCheckout({
      variantId,
      email: user.email,
      customData: {
        supabase_user_id: user.id,
        tier: tier,
      },
      successUrl: `${request.nextUrl.origin}/dashboard?checkout=success`,
    });

    return NextResponse.json({
      checkoutId: checkout.data.id,
      url: checkout.data.attributes.url,
    });
  } catch (error) {
    // Log error internally but don't expose details to client
    console.error('Lemon Squeezy checkout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
