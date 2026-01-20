import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

type SharedLinkRow = Tables<'shared_links'>;

export interface SharedLinkWithPlay extends SharedLinkRow {
  play?: Tables<'plays'>;
}

/**
 * Generate a unique share token
 */
function generateShareToken(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

/**
 * Create a share link for a play
 */
export async function createShareLink(
  playId: string,
  userId: string,
  options: {
    allowFork?: boolean;
    expiresInDays?: number;
  } = {}
): Promise<SharedLinkRow> {
  const supabase = createClient();

  const shareToken = generateShareToken();
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Note: We're using playbook_id field to store play_id for now
  // In a production app, you'd want to add a play_id column to shared_links
  const insertData = {
    playbook_id: playId, // Using this field to store play reference
    share_token: shareToken,
    allow_fork: options.allowFork ?? false,
    expires_at: expiresAt,
    created_by: userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('shared_links')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating share link:', error);
    throw error;
  }

  return data as SharedLinkRow;
}

/**
 * Get a share link by token
 */
export async function getShareLink(token: string): Promise<SharedLinkWithPlay | null> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('shared_links')
    .select('*')
    .eq('share_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching share link:', error);
    throw error;
  }

  const linkData = data as SharedLinkRow;

  // Check if expired
  if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
    return null; // Expired
  }

  return linkData;
}

/**
 * Get all share links for a play
 */
export async function getShareLinksForPlay(playId: string): Promise<SharedLinkRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('shared_links')
    .select('*')
    .eq('playbook_id', playId) // Using playbook_id to store play reference
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching share links:', error);
    throw error;
  }

  return data || [];
}

/**
 * Delete a share link
 */
export async function deleteShareLink(linkId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('shared_links')
    .delete()
    .eq('id', linkId);

  if (error) {
    console.error('Error deleting share link:', error);
    throw error;
  }
}

/**
 * Update share link settings
 */
export async function updateShareLink(
  linkId: string,
  updates: {
    allowFork?: boolean;
    expiresAt?: string | null;
  }
): Promise<SharedLinkRow> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('shared_links')
    .update({
      allow_fork: updates.allowFork,
      expires_at: updates.expiresAt,
    })
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    console.error('Error updating share link:', error);
    throw error;
  }

  return data as SharedLinkRow;
}

/**
 * Get the full share URL
 */
export function getShareUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${token}`;
  }
  return `/share/${token}`;
}
