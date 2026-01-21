/**
 * Auth Callback Route
 * Handles OAuth redirects and email confirmation
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Check if user has a workspace, create one if not
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check for existing workspace
        // Note: Type assertions used because database types aren't available until tables are created
        const { data: existingWorkspace } = await (supabase
          .from('workspaces') as unknown as { select: (cols: string) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { id: string } | null }> } } } })
          .select('id')
          .eq('owner_id', user.id)
          .eq('type', 'personal')
          .single();

        // Create personal workspace if it doesn't exist
        if (!existingWorkspace) {
          // First ensure profile exists
          const { data: profile } = await (supabase
            .from('profiles') as unknown as { select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { display_name: string | null } | null }> } } })
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profile) {
            await (supabase.from('profiles') as unknown as { insert: (data: unknown) => Promise<void> }).insert({
              id: user.id,
              email: user.email ?? null,
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
              avatar_url: user.user_metadata?.avatar_url || null,
            });
          }

          // Create workspace
          const workspaceName = profile?.display_name
            ? `${profile.display_name}'s Playbooks`
            : 'My Playbooks';

          const { data: newWorkspace } = await (supabase
            .from('workspaces') as unknown as { insert: (data: unknown) => { select: () => { single: () => Promise<{ data: { id: string } | null }> } } })
            .insert({
              name: workspaceName,
              type: 'personal',
              owner_id: user.id,
            })
            .select()
            .single();

          // Add owner as member
          if (newWorkspace) {
            await (supabase.from('workspace_members') as unknown as { insert: (data: unknown) => Promise<void> }).insert({
              workspace_id: newWorkspace.id,
              user_id: user.id,
              role: 'owner',
              accepted_at: new Date().toISOString(),
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Auth code exchange error:', exchangeError);
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
