import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Concept,
  ConceptType,
  PassCategory,
  RunCategory,
  FormationContext,
  DefenseContext,
  ConceptCardData,
} from '@/types/concept';
import { ALL_CONCEPTS, getConceptById } from '@/data/concepts';

// ============================================
// State Types
// ============================================

interface ConceptFilters {
  type: ConceptType | 'all';
  category: PassCategory | RunCategory | 'all';
  searchQuery: string;
}

interface ConceptState {
  // Panel visibility
  isPanelOpen: boolean;
  activeTab: 'pass' | 'run' | 'recommended';

  // Filters
  filters: ConceptFilters;

  // Recommendation context
  formationContext: FormationContext | null;
  defenseContext: DefenseContext | null;

  // Recommended concepts (computed from context)
  recommendedConcepts: ConceptCardData[];

  // Selected concept for preview/apply
  selectedConceptId: string | null;
  hoveredConceptId: string | null;

  // Auto-build state
  lastAppliedConceptId: string | null;
  showUndoToast: boolean;
  undoToastMessage: string;
}

interface ConceptActions {
  // Panel
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'pass' | 'run' | 'recommended') => void;

  // Filters
  setTypeFilter: (type: ConceptType | 'all') => void;
  setCategoryFilter: (category: PassCategory | RunCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Recommendation
  setFormationContext: (context: FormationContext | null) => void;
  setDefenseContext: (context: DefenseContext | null) => void;
  updateRecommendations: () => void;

  // Selection
  selectConcept: (conceptId: string | null) => void;
  hoverConcept: (conceptId: string | null) => void;
  getSelectedConcept: () => Concept | null;

  // Auto-build feedback
  showAppliedToast: (conceptId: string, message: string) => void;
  hideUndoToast: () => void;

  // Utilities
  getFilteredConcepts: () => Concept[];
  getConceptsByCategory: (category: PassCategory | RunCategory) => Concept[];
}

// ============================================
// Initial State
// ============================================

const initialState: ConceptState = {
  isPanelOpen: true,
  activeTab: 'recommended',

  filters: {
    type: 'all',
    category: 'all',
    searchQuery: '',
  },

  formationContext: null,
  defenseContext: null,
  recommendedConcepts: [],

  selectedConceptId: null,
  hoveredConceptId: null,

  lastAppliedConceptId: null,
  showUndoToast: false,
  undoToastMessage: '',
};

// ============================================
// Store
// ============================================

export const useConceptStore = create<ConceptState & ConceptActions>()(
  immer((set, get) => ({
    ...initialState,

    // Panel actions
    openPanel: () =>
      set((state) => {
        state.isPanelOpen = true;
      }),

    closePanel: () =>
      set((state) => {
        state.isPanelOpen = false;
      }),

    togglePanel: () =>
      set((state) => {
        state.isPanelOpen = !state.isPanelOpen;
      }),

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab;
      }),

    // Filter actions
    setTypeFilter: (type) =>
      set((state) => {
        state.filters.type = type;
        // Reset category filter when type changes
        state.filters.category = 'all';
      }),

    setCategoryFilter: (category) =>
      set((state) => {
        state.filters.category = category;
      }),

    setSearchQuery: (query) =>
      set((state) => {
        state.filters.searchQuery = query;
      }),

    clearFilters: () =>
      set((state) => {
        state.filters = {
          type: 'all',
          category: 'all',
          searchQuery: '',
        };
      }),

    // Recommendation context
    setFormationContext: (context) =>
      set((state) => {
        state.formationContext = context;
      }),

    setDefenseContext: (context) =>
      set((state) => {
        state.defenseContext = context;
      }),

    updateRecommendations: () =>
      set((state) => {
        const { formationContext, defenseContext } = state;

        if (!formationContext) {
          state.recommendedConcepts = [];
          return;
        }

        // Import recommendation engine dynamically to avoid circular deps
        // For now, use simple filtering logic
        const recommendations = computeRecommendations(formationContext, defenseContext);
        state.recommendedConcepts = recommendations;
      }),

    // Selection
    selectConcept: (conceptId) =>
      set((state) => {
        state.selectedConceptId = conceptId;
      }),

    hoverConcept: (conceptId) =>
      set((state) => {
        state.hoveredConceptId = conceptId;
      }),

    getSelectedConcept: () => {
      const { selectedConceptId } = get();
      if (!selectedConceptId) return null;
      return getConceptById(selectedConceptId) ?? null;
    },

    // Auto-build feedback
    showAppliedToast: (conceptId, message) =>
      set((state) => {
        state.lastAppliedConceptId = conceptId;
        state.showUndoToast = true;
        state.undoToastMessage = message;
      }),

    hideUndoToast: () =>
      set((state) => {
        state.showUndoToast = false;
      }),

    // Utilities
    getFilteredConcepts: () => {
      const { filters } = get();
      let concepts = ALL_CONCEPTS;

      // Filter by type
      if (filters.type !== 'all') {
        concepts = concepts.filter((c) => c.conceptType === filters.type);
      }

      // Filter by category
      if (filters.category !== 'all') {
        concepts = concepts.filter((c) => {
          const hints = c.suggestionHints;
          if (c.conceptType === 'pass' && hints.passHints) {
            return hints.passHints.category === filters.category;
          }
          if (c.conceptType === 'run' && hints.runHints) {
            return hints.runHints.category === filters.category;
          }
          return false;
        });
      }

      // Filter by search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        concepts = concepts.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.summary.toLowerCase().includes(query) ||
            c.badges?.some((b) => b.toLowerCase().includes(query))
        );
      }

      return concepts;
    },

    getConceptsByCategory: (category) => {
      return ALL_CONCEPTS.filter((c) => {
        const hints = c.suggestionHints;
        if (c.conceptType === 'pass' && hints.passHints) {
          return hints.passHints.category === category;
        }
        if (c.conceptType === 'run' && hints.runHints) {
          return hints.runHints.category === category;
        }
        return false;
      });
    },
  }))
);

// ============================================
// Recommendation Logic (simplified)
// Full implementation will be in recommendation-engine.ts
// ============================================

function computeRecommendations(
  formation: FormationContext,
  defense: DefenseContext | null
): ConceptCardData[] {
  const results: ConceptCardData[] = [];

  for (const concept of ALL_CONCEPTS) {
    let score = 50; // Base score
    const rationale: string[] = [];

    // Check requirements match
    const req = concept.requirements;

    // Pass concepts: check receiver count
    if (concept.conceptType === 'pass') {
      if (req.minEligibleReceivers && formation.receiverCount >= req.minEligibleReceivers) {
        score += 20;
      } else if (req.minEligibleReceivers && formation.receiverCount < req.minEligibleReceivers) {
        score -= 30;
      }

      // Check TE requirement
      if (req.needsTE && !formation.hasTightEnd) {
        score -= 40;
      }

      // Structure match
      if (req.preferredStructures?.includes(formation.structure as any)) {
        score += 15;
      }
    }

    // Run concepts: check defense context
    if (concept.conceptType === 'run' && concept.suggestionHints.runHints) {
      const runHints = concept.suggestionHints.runHints;

      // TE surface
      if (runHints.surfaceNeeds === 'te_required' && !formation.hasTightEnd) {
        score -= 50;
      }

      // Puller needs
      if (req.needsPuller && req.needsPuller !== 'none') {
        // Assume we have pullers available
        score += 5;
      }

      // Defense context bonuses
      if (defense) {
        // Box count
        if (runHints.bestWhenBox?.includes(String(defense.boxCount) as any)) {
          score += 20;
          rationale.push(`Box: ${defense.boxCount}-man box is favorable`);
        }

        // Front match
        if (defense.front && runHints.bestVsFront?.includes(defense.front)) {
          score += 15;
          rationale.push(`Front: Works well vs ${defense.front}`);
        }

        // 3-tech position
        if (defense.threeTech && runHints.bestVs3T?.includes(defense.threeTech)) {
          score += 10;
          rationale.push(`3T: ${defense.threeTech} side creates angle`);
        }
      }
    }

    // Only include concepts with positive score
    if (score > 30) {
      const hints = concept.suggestionHints;
      const category =
        concept.conceptType === 'pass'
          ? hints.passHints?.category ?? 'quick'
          : hints.runHints?.category ?? 'inside_zone';

      results.push({
        id: concept.id,
        name: concept.name,
        conceptType: concept.conceptType,
        category,
        summary: concept.summary,
        badges: concept.badges ?? [],
        matchScore: Math.min(100, Math.max(0, score)),
        rationale: rationale.length > 0 ? rationale : undefined,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  // Limit to top 12 concepts
  return results.slice(0, 12);
}

// Export for testing
export { computeRecommendations };
