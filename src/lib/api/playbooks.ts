import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/types/database';

type PlaybookRow = Tables<'playbooks'>;

export interface PlaybookWithPlays extends PlaybookRow {
  plays?: Tables<'plays'>[];
}

/**
 * Fetch all playbooks for a workspace
 */
export async function getPlaybooks(workspaceId: string): Promise<PlaybookRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching playbooks:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single playbook by ID with its plays
 */
export async function getPlaybook(playbookId: string): Promise<PlaybookWithPlays | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('playbooks')
    .select(`
      *,
      plays (*)
    `)
    .eq('id', playbookId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching playbook:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new playbook
 */
export async function createPlaybook(
  workspaceId: string,
  userId: string,
  name: string,
  tags: string[] = []
): Promise<PlaybookRow> {
  const supabase = createClient();
  const insertData = {
    workspace_id: workspaceId,
    name,
    tags,
    sections: [] as unknown[],
    export_settings: {} as Record<string, unknown>,
    created_by: userId,
    updated_by: userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('playbooks')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating playbook:', error);
    throw error;
  }

  return data as PlaybookRow;
}

/**
 * Update an existing playbook
 */
export async function updatePlaybook(
  playbookId: string,
  userId: string,
  updates: {
    name?: string;
    tags?: string[];
    sections?: unknown[];
    exportSettings?: Record<string, unknown>;
  }
): Promise<PlaybookRow> {
  const supabase = createClient();
  const updateData: Record<string, unknown> = {
    updated_by: userId,
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.sections !== undefined) updateData.sections = updates.sections;
  if (updates.exportSettings !== undefined) updateData.export_settings = updates.exportSettings;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('playbooks')
    .update(updateData)
    .eq('id', playbookId)
    .select()
    .single();

  if (error) {
    console.error('Error updating playbook:', error);
    throw error;
  }

  return data as PlaybookRow;
}

/**
 * Delete a playbook
 */
export async function deletePlaybook(playbookId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('playbooks')
    .delete()
    .eq('id', playbookId);

  if (error) {
    console.error('Error deleting playbook:', error);
    throw error;
  }
}

/**
 * Duplicate a playbook
 */
export async function duplicatePlaybook(
  playbookId: string,
  workspaceId: string,
  userId: string,
  newName?: string
): Promise<PlaybookRow> {
  const supabase = createClient();

  // First fetch the original playbook
  const original = await getPlaybook(playbookId);
  if (!original) {
    throw new Error('Playbook not found');
  }

  // Create a new playbook with the same data
  const insertData = {
    workspace_id: workspaceId,
    name: newName || `${original.name} (Copy)`,
    tags: original.tags,
    sections: original.sections,
    export_settings: original.export_settings,
    created_by: userId,
    updated_by: userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('playbooks')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error duplicating playbook:', error);
    throw error;
  }

  return data as PlaybookRow;
}

/**
 * Add a play to a playbook
 */
export async function addPlayToPlaybook(
  playId: string,
  playbookId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('plays')
    .update({ playbook_id: playbookId, updated_by: userId })
    .eq('id', playId);

  if (error) {
    console.error('Error adding play to playbook:', error);
    throw error;
  }
}

/**
 * Remove a play from a playbook
 */
export async function removePlayFromPlaybook(
  playId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('plays')
    .update({ playbook_id: null, updated_by: userId })
    .eq('id', playId);

  if (error) {
    console.error('Error removing play from playbook:', error);
    throw error;
  }
}
