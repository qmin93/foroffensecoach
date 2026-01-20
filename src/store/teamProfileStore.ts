import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TeamProfile,
  RosterAvailability,
  UnitStrength,
  StylePreferences,
  PositionAvailability,
  QualityRating,
  createEmptyTeamProfile,
} from '@/types/team-profile';

interface TeamProfileState {
  // Current team profile
  profile: TeamProfile;

  // UI state
  isEditing: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setTeamName: (name: string) => void;
  setRosterAvailability: (position: keyof RosterAvailability, data: PositionAvailability) => void;
  setUnitStrength: (key: keyof UnitStrength, value: QualityRating) => void;
  setStylePreference: <K extends keyof StylePreferences>(key: K, value: StylePreferences[K]) => void;
  addNote: (note: string) => void;
  removeNote: (index: number) => void;
  updateNote: (index: number, note: string) => void;

  // Profile management
  saveProfile: () => void;
  resetProfile: () => void;
  loadProfile: (profile: TeamProfile) => void;

  // UI actions
  setIsEditing: (editing: boolean) => void;
}

export const useTeamProfileStore = create<TeamProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: createEmptyTeamProfile(),
      isEditing: false,
      hasUnsavedChanges: false,

      // Set team name
      setTeamName: (name: string) => {
        set((state) => ({
          profile: {
            ...state.profile,
            teamName: name,
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      // Set roster availability for a position
      setRosterAvailability: (position: keyof RosterAvailability, data: PositionAvailability) => {
        set((state) => ({
          profile: {
            ...state.profile,
            rosterAvailability: {
              ...state.profile.rosterAvailability,
              [position]: data,
            },
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      // Set unit strength
      setUnitStrength: (key: keyof UnitStrength, value: QualityRating) => {
        set((state) => ({
          profile: {
            ...state.profile,
            unitStrength: {
              ...state.profile.unitStrength,
              [key]: value,
            },
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      // Set style preference
      setStylePreference: <K extends keyof StylePreferences>(key: K, value: StylePreferences[K]) => {
        set((state) => ({
          profile: {
            ...state.profile,
            stylePreferences: {
              ...state.profile.stylePreferences,
              [key]: value,
            },
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      // Notes management
      addNote: (note: string) => {
        set((state) => ({
          profile: {
            ...state.profile,
            notes: [...state.profile.notes, note],
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      removeNote: (index: number) => {
        set((state) => ({
          profile: {
            ...state.profile,
            notes: state.profile.notes.filter((_, i) => i !== index),
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      updateNote: (index: number, note: string) => {
        set((state) => ({
          profile: {
            ...state.profile,
            notes: state.profile.notes.map((n, i) => (i === index ? note : n)),
            updatedAt: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        }));
      },

      // Save profile (mark as saved)
      saveProfile: () => {
        set({ hasUnsavedChanges: false });
      },

      // Reset to default profile
      resetProfile: () => {
        set({
          profile: createEmptyTeamProfile(),
          hasUnsavedChanges: false,
        });
      },

      // Load an existing profile
      loadProfile: (profile: TeamProfile) => {
        set({
          profile,
          hasUnsavedChanges: false,
        });
      },

      // UI state
      setIsEditing: (editing: boolean) => {
        set({ isEditing: editing });
      },
    }),
    {
      name: 'team-profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
