import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLemonSqueezyPortalUrl } from '@/lib/lemonsqueezy';

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

    // Get user's Lemon Squeezy customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('ls_customer_id')
      .eq('id', user.id)
      .single() as { data: { ls_customer_id: string | null } | null };

    if (!profile?.ls_customer_id) {
      return NextResponse.json(
        { error: 'No Lemon Squeezy subscription found' },
        { status: 400 }
      );
    }

    // Get customer portal URL from Lemon Squeezy
    const portalUrl = await getLemonSqueezyPortalUrl(profile.ls_customer_id);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Lemon Squeezy portal error:', error);
    return NextResponse.json(
      { error: 'Failed to get portal URL' },
      { status: 500 }
    );
  }
}
