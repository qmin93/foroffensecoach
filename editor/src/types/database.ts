/**
 * Supabase Database Types
 * Generated from ForOffenseCoach DSL Specification
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          ls_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          ls_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          ls_customer_id?: string | null;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          type: 'personal' | 'team';
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'personal' | 'team';
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: 'personal' | 'team';
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'viewer';
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: 'owner' | 'editor' | 'viewer';
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          role?: 'owner' | 'editor' | 'viewer';
          accepted_at?: string | null;
        };
      };
      playbooks: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          tags: string[];
          sections: Json;
          export_settings: Json;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          tags?: string[];
          sections?: Json;
          export_settings?: Json;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          tags?: string[];
          sections?: Json;
          export_settings?: Json;
          updated_by?: string;
          updated_at?: string;
        };
      };
      plays: {
        Row: {
          id: string;
          workspace_id: string;
          playbook_id: string | null;
          name: string;
          description: string | null;
          tags: string[];
          meta: Json;
          field: Json;
          roster: Json;
          actions: Json;
          notes: Json;
          thumbnail_url: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          playbook_id?: string | null;
          name: string;
          description?: string | null;
          tags?: string[];
          meta?: Json;
          field?: Json;
          roster?: Json;
          actions?: Json;
          notes?: Json;
          thumbnail_url?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          playbook_id?: string | null;
          name?: string;
          description?: string | null;
          tags?: string[];
          meta?: Json;
          field?: Json;
          roster?: Json;
          actions?: Json;
          notes?: Json;
          thumbnail_url?: string | null;
          updated_by?: string;
          updated_at?: string;
        };
      };
      shared_links: {
        Row: {
          id: string;
          playbook_id: string;
          share_token: string;
          allow_fork: boolean;
          expires_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          playbook_id: string;
          share_token: string;
          allow_fork?: boolean;
          expires_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          allow_fork?: boolean;
          expires_at?: string | null;
        };
      };
      team_profiles: {
        Row: {
          id: string;
          workspace_id: string;
          team_name: string;
          roster_availability: Json;
          unit_strength: Json;
          style_preferences: Json;
          notes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          team_name: string;
          roster_availability: Json;
          unit_strength: Json;
          style_preferences: Json;
          notes?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          team_name?: string;
          roster_availability?: Json;
          unit_strength?: Json;
          style_preferences?: Json;
          notes?: string[];
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          ls_customer_id: string | null;
          ls_subscription_id: string | null;
          payment_provider: 'stripe' | 'lemonsqueezy';
          tier: 'free' | 'pro' | 'team';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          ls_customer_id?: string | null;
          ls_subscription_id?: string | null;
          payment_provider?: 'stripe' | 'lemonsqueezy';
          tier?: 'free' | 'pro' | 'team';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          ls_customer_id?: string | null;
          ls_subscription_id?: string | null;
          payment_provider?: 'stripe' | 'lemonsqueezy';
          tier?: 'free' | 'pro' | 'team';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      workspace_type: 'personal' | 'team';
      member_role: 'owner' | 'editor' | 'viewer';
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience types
export type Profile = Tables<'profiles'>;
export type Workspace = Tables<'workspaces'>;
export type WorkspaceMember = Tables<'workspace_members'>;
export type PlaybookRow = Tables<'playbooks'>;
export type PlayRow = Tables<'plays'>;
export type SharedLink = Tables<'shared_links'>;
export type TeamProfileRow = Tables<'team_profiles'>;
export type SubscriptionRow = Tables<'subscriptions'>;
