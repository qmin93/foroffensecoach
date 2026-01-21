import { create } from 'zustand';
import { Tables } from '@/types/database';
import {
  getPlaybooks,
  getPlaybook,
  createPlaybook,
  updatePlaybook,
  deletePlaybook,
  duplicatePlaybook,
  addPlayToPlaybook,
  removePlayFromPlaybook,
  PlaybookWithPlays,
} from '@/lib/api/playbooks';

type PlaybookRow = Tables<'playbooks'>;

interface PlaybookState {
  // Data
  playbooks: PlaybookRow[];
  currentPlaybook: PlaybookWithPlays | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchPlaybooks: (workspaceId: string) => Promise<void>;
  fetchPlaybook: (playbookId: string) => Promise<void>;
  createPlaybook: (workspaceId: string, userId: string, name: string, tags?: string[]) => Promise<PlaybookRow>;
  updatePlaybook: (playbookId: string, userId: string, updates: { name?: string; tags?: string[]; sections?: unknown[] }) => Promise<void>;
  deletePlaybook: (playbookId: string) => Promise<void>;
  duplicatePlaybook: (playbookId: string, workspaceId: string, userId: string, newName?: string) => Promise<void>;
  addPlayToPlaybook: (playId: string, playbookId: string, userId: string) => Promise<void>;
  removePlayFromPlaybook: (playId: string, userId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePlaybookStore = create<PlaybookState>((set, get) => ({
  // Initial state
  playbooks: [],
  currentPlaybook: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Fetch all playbooks for a workspace
  fetchPlaybooks: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const playbooks = await getPlaybooks(workspaceId);
      set({ playbooks, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch playbooks', isLoading: false });
      throw error;
    }
  },

  // Fetch a single playbook with its plays
  fetchPlaybook: async (playbookId: string) => {
    set({ isLoading: true, error: null });
    try {
      const playbook = await getPlaybook(playbookId);
      set({ currentPlaybook: playbook, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch playbook', isLoading: false });
      throw error;
    }
  },

  // Create a new playbook
  createPlaybook: async (workspaceId: string, userId: string, name: string, tags: string[] = []) => {
    set({ isCreating: true, error: null });
    try {
      const playbook = await createPlaybook(workspaceId, userId, name, tags);
      set((state) => ({
        playbooks: [playbook, ...state.playbooks],
        isCreating: false,
      }));
      return playbook;
    } catch (error) {
      set({ error: 'Failed to create playbook', isCreating: false });
      throw error;
    }
  },

  // Update a playbook
  updatePlaybook: async (playbookId: string, userId: string, updates: { name?: string; tags?: string[]; sections?: unknown[] }) => {
    set({ isUpdating: true, error: null });
    try {
      const updated = await updatePlaybook(playbookId, userId, updates);
      set((state) => ({
        playbooks: state.playbooks.map((p) => (p.id === playbookId ? updated : p)),
        currentPlaybook: state.currentPlaybook?.id === playbookId
          ? { ...state.currentPlaybook, ...updated }
          : state.currentPlaybook,
        isUpdating: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update playbook', isUpdating: false });
      throw error;
    }
  },

  // Delete a playbook
  deletePlaybook: async (playbookId: string) => {
    set({ isDeleting: true, error: null });
    try {
      await deletePlaybook(playbookId);
      set((state) => ({
        playbooks: state.playbooks.filter((p) => p.id !== playbookId),
        currentPlaybook: state.currentPlaybook?.id === playbookId ? null : state.currentPlaybook,
        isDeleting: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete playbook', isDeleting: false });
      throw error;
    }
  },

  // Duplicate a playbook
  duplicatePlaybook: async (playbookId: string, workspaceId: string, userId: string, newName?: string) => {
    set({ isCreating: true, error: null });
    try {
      const duplicated = await duplicatePlaybook(playbookId, workspaceId, userId, newName);
      set((state) => ({
        playbooks: [duplicated, ...state.playbooks],
        isCreating: false,
      }));
    } catch (error) {
      set({ error: 'Failed to duplicate playbook', isCreating: false });
      throw error;
    }
  },

  // Add a play to a playbook
  addPlayToPlaybook: async (playId: string, playbookId: string, userId: string) => {
    set({ isUpdating: true, error: null });
    try {
      await addPlayToPlaybook(playId, playbookId, userId);
      // Refresh the current playbook if it's the one being modified
      if (get().currentPlaybook?.id === playbookId) {
        await get().fetchPlaybook(playbookId);
      }
      set({ isUpdating: false });
    } catch (error) {
      set({ error: 'Failed to add play to playbook', isUpdating: false });
      throw error;
    }
  },

  // Remove a play from a playbook
  removePlayFromPlaybook: async (playId: string, userId: string) => {
    set({ isUpdating: true, error: null });
    try {
      await removePlayFromPlaybook(playId, userId);
      // Refresh the current playbook
      const currentPlaybook = get().currentPlaybook;
      if (currentPlaybook) {
        await get().fetchPlaybook(currentPlaybook.id);
      }
      set({ isUpdating: false });
    } catch (error) {
      set({ error: 'Failed to remove play from playbook', isUpdating: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      playbooks: [],
      currentPlaybook: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
    }),
}));
