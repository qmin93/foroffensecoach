/**
 * Auth Store
 * Manages authentication state with Supabase
 *
 * Note: Database type assertions are used because the actual Supabase tables
 * need to be created first. Once tables exist, run `supabase gen types typescript`
 * to generate proper types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { createBrowserClient } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, Workspace } from '@/types/database';

// ============================================
// Types
// ============================================

interface AuthState {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workspace: Workspace | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  // Auth actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Profile actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;

  // Workspace actions
  loadWorkspace: () => Promise<void>;
  createPersonalWorkspace: () => Promise<{ error: string | null }>;

  // Utility
  clearError: () => void;
}

// ============================================
// Error Message Sanitization
// ============================================

/**
 * Sanitize error messages to prevent information leakage
 * Maps internal Supabase errors to user-friendly messages
 */
function sanitizeAuthError(error: { message?: string; code?: string } | null): string {
  if (!error) return 'An unexpected error occurred';

  const message = error.message?.toLowerCase() || '';
  const code = error.code || '';

  // Common auth errors with safe user-facing messages
  if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
    return 'Invalid email or password';
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address';
  }
  if (message.includes('user already registered') || code === '23505') {
    return 'An account with this email already exists';
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'Password does not meet security requirements';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please try again later';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection';
  }

  // Generic fallback (don't expose internal details)
  return 'Authentication failed. Please try again';
}

// ============================================
// Initial State
// ============================================

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  workspace: null,
  loading: false,
  initialized: false,
  error: null,
};

// ============================================
// Store
// ============================================

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  ...initialState,

  // Initialize auth state from Supabase session
  initialize: async () => {
    const supabase = createBrowserClient();

    try {
      set({ loading: true, error: null });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        set({
          user: session.user,
          session,
        });

        // Load profile and workspace
        await get().loadProfile();
        await get().loadWorkspace();
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({
          user: session?.user ?? null,
          session,
        });

        if (event === 'SIGNED_IN' && session?.user) {
          await get().loadProfile();
          await get().loadWorkspace();
        }

        if (event === 'SIGNED_OUT') {
          set({ profile: null, workspace: null });
        }
      });

      set({ initialized: true });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: 'Failed to initialize authentication' });
    } finally {
      set({ loading: false });
    }
  },

  // Email/Password sign in
  signInWithEmail: async (email, password) => {
    const supabase = createBrowserClient();

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const sanitizedError = sanitizeAuthError(error);
        set({ error: sanitizedError });
        return { error: sanitizedError };
      }

      set({
        user: data.user,
        session: data.session,
      });

      await get().loadProfile();
      await get().loadWorkspace();

      return { error: null };
    } catch (error) {
      const sanitizedError = sanitizeAuthError(error as { message?: string });
      set({ error: sanitizedError });
      return { error: sanitizedError };
    } finally {
      set({ loading: false });
    }
  },

  // Email/Password sign up
  signUpWithEmail: async (email, password, displayName) => {
    const supabase = createBrowserClient();

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        const sanitizedError = sanitizeAuthError(error);
        set({ error: sanitizedError });
        return { error: sanitizedError };
      }

      // If email confirmation is required, the user won't be signed in yet
      if (data.user && data.session) {
        set({
          user: data.user,
          session: data.session,
        });

        // Create profile and personal workspace
        await get().loadProfile();
        const workspaceResult = await get().createPersonalWorkspace();

        if (workspaceResult.error) {
          return workspaceResult;
        }
      }

      return { error: null };
    } catch (error) {
      const sanitizedError = sanitizeAuthError(error as { message?: string });
      set({ error: sanitizedError });
      return { error: sanitizedError };
    } finally {
      set({ loading: false });
    }
  },

  // Google OAuth sign in
  signInWithGoogle: async () => {
    const supabase = createBrowserClient();

    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const sanitizedError = sanitizeAuthError(error);
        set({ error: sanitizedError });
        return { error: sanitizedError };
      }

      return { error: null };
    } catch (error) {
      const sanitizedError = sanitizeAuthError(error as { message?: string });
      set({ error: sanitizedError });
      return { error: sanitizedError };
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  signOut: async () => {
    const supabase = createBrowserClient();

    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        profile: null,
        workspace: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Load user profile
  loadProfile: async () => {
    const supabase = createBrowserClient();
    const { user } = get();

    if (!user) return;

    try {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        set({ profile: data as Profile });
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
        };

        const { data: createdProfile, error: createError } = await (supabase
          .from('profiles') as any)
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          set({ profile: createdProfile as Profile });
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    const supabase = createBrowserClient();
    const { user, profile } = get();

    if (!user || !profile) {
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      set({ profile: data as Profile });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      return { error: message };
    }
  },

  // Load user's workspace
  loadWorkspace: async () => {
    const supabase = createBrowserClient();
    const { user } = get();

    if (!user) return;

    try {
      // First, try to find a workspace where user is owner
      const { data, error } = await (supabase
        .from('workspaces') as any)
        .select('*')
        .eq('owner_id', user.id)
        .eq('type', 'personal')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading workspace:', error);
        return;
      }

      if (data) {
        set({ workspace: data as Workspace });
      } else {
        // No workspace found, create one
        await get().createPersonalWorkspace();
      }
    } catch (error) {
      console.error('Error in loadWorkspace:', error);
    }
  },

  // Create personal workspace
  createPersonalWorkspace: async () => {
    const supabase = createBrowserClient();
    const { user, profile } = get();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      const workspaceName = profile?.display_name
        ? `${profile.display_name}'s Playbooks`
        : 'My Playbooks';

      const { data, error } = await (supabase
        .from('workspaces') as any)
        .insert({
          name: workspaceName,
          type: 'personal',
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace:', error);
        return { error: error.message };
      }

      // Also add owner as workspace member
      await (supabase
        .from('workspace_members') as any)
        .insert({
          workspace_id: data.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        });

      set({ workspace: data as Workspace });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workspace';
      return { error: message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

// ============================================
// Selectors
// ============================================

export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectIsLoading = (state: AuthState) => state.loading || !state.initialized;
