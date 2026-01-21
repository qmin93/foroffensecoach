import { createClient } from '@/lib/supabase/client';
import { Play } from '@/types/dsl';
import { Tables } from '@/types/database';

type PlayRow = Tables<'plays'>;

export interface PlayWithMeta extends PlayRow {
  // Additional computed fields if needed
}

/**
 * Fetch all plays for a workspace
 */
export async function getPlays(workspaceId: string): Promise<PlayRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plays')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching plays:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single play by ID
 */
export async function getPlay(playId: string): Promise<PlayRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plays')
    .select('*')
    .eq('id', playId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching play:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new play
 */
export async function createPlay(
  workspaceId: string,
  userId: string,
  play: Play,
  thumbnailUrl?: string
): Promise<PlayRow> {
  const supabase = createClient();
  const insertData = {
    workspace_id: workspaceId,
    name: play.name,
    tags: play.tags || [],
    meta: play.meta,
    field: play.field,
    roster: play.roster,
    actions: play.actions,
    notes: play.notes,
    thumbnail_url: thumbnailUrl,
    created_by: userId,
    updated_by: userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('plays')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating play:', error);
    throw error;
  }

  return data as PlayRow;
}

/**
 * Update an existing play
 */
export async function updatePlay(
  playId: string,
  userId: string,
  play: Partial<Play>,
  thumbnailUrl?: string
): Promise<PlayRow> {
  const supabase = createClient();
  const updateData: Record<string, unknown> = {
    updated_by: userId,
  };

  if (play.name !== undefined) updateData.name = play.name;
  if (play.tags !== undefined) updateData.tags = play.tags;
  if (play.meta !== undefined) updateData.meta = play.meta;
  if (play.field !== undefined) updateData.field = play.field;
  if (play.roster !== undefined) updateData.roster = play.roster;
  if (play.actions !== undefined) updateData.actions = play.actions;
  if (play.notes !== undefined) updateData.notes = play.notes;
  if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('plays')
    .update(updateData)
    .eq('id', playId)
    .select()
    .single();

  if (error) {
    console.error('Error updating play:', error);
    throw error;
  }

  return data as PlayRow;
}

/**
 * Delete a play
 */
export async function deletePlay(playId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('plays')
    .delete()
    .eq('id', playId);

  if (error) {
    console.error('Error deleting play:', error);
    throw error;
  }
}

/**
 * Delete all plays in a workspace
 */
export async function deleteAllPlays(workspaceId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('plays')
    .delete()
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error deleting all plays:', error);
    throw error;
  }
}

/**
 * Duplicate a play
 */
export async function duplicatePlay(
  playId: string,
  workspaceId: string,
  userId: string,
  newName?: string
): Promise<PlayRow> {
  const supabase = createClient();

  // First fetch the original play
  const original = await getPlay(playId);
  if (!original) {
    throw new Error('Play not found');
  }

  // Create a new play with the same data
  const insertData = {
    workspace_id: workspaceId,
    name: newName || `${original.name} (Copy)`,
    tags: original.tags,
    meta: original.meta,
    field: original.field,
    roster: original.roster,
    actions: original.actions,
    notes: original.notes,
    created_by: userId,
    updated_by: userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('plays')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error duplicating play:', error);
    throw error;
  }

  return data as PlayRow;
}

/**
 * Convert DSL Play to DB format for saving
 */
export function playToDatabaseFormat(play: Play): Record<string, unknown> {
  return {
    name: play.name,
    tags: play.tags || [],
    meta: play.meta,
    field: play.field,
    roster: play.roster,
    actions: play.actions,
    notes: play.notes,
  };
}

/**
 * Convert DB format to DSL Play
 */
export function databaseToPlayFormat(dbPlay: PlayRow): Play {
  return {
    schemaVersion: '1.0',
    type: 'play',
    id: dbPlay.id,
    name: dbPlay.name,
    tags: dbPlay.tags || [],
    meta: dbPlay.meta as unknown as Play['meta'],
    field: dbPlay.field as unknown as Play['field'],
    roster: dbPlay.roster as unknown as Play['roster'],
    actions: dbPlay.actions as unknown as Play['actions'],
    notes: dbPlay.notes as unknown as Play['notes'],
    createdAt: dbPlay.created_at,
    updatedAt: dbPlay.updated_at,
  };
}
