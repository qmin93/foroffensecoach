import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Concept,
  ConceptType,
  ConceptTier,
  PassCategory,
  RunCategory,
  FormationContext,
  DefenseContext,
  ConceptCardData,
} from '@/types/concept';
import { ALL_CONCEPTS, getConceptById } from '@/data/concepts';
import { useTeamProfileStore } from './teamProfileStore';

// ============================================
// State Types
// ============================================

interface ConceptFilters {
  type: ConceptType | 'all';
  category: PassCategory | RunCategory | 'all';
  searchQuery: string;
  maxTier: ConceptTier; // 1=Core only, 2=Core+Situational, 3=All
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
  setMaxTierFilter: (tier: ConceptTier) => void;
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
    maxTier: 3, // Default: show all tiers
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

    setMaxTierFilter: (tier) =>
      set((state) => {
        state.filters.maxTier = tier;
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
          maxTier: 3,
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

      // Filter by tier (show concepts at or below maxTier)
      if (filters.maxTier < 3) {
        concepts = concepts.filter((c) => c.tier <= filters.maxTier);
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

    // Pass concepts: check receiver count and defense coverage
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

      // Defense context for pass concepts
      if (defense && concept.suggestionHints.passHints) {
        const passHints = concept.suggestionHints.passHints;

        // Light box = more defenders in coverage = harder to pass
        if (defense.boxCount === 6) {
          score -= 10; // Light box means more DBs
          if (passHints.zoneBeater) {
            score += 15;
            rationale.push('Zone beater vs light box coverage');
          }
        }

        // Heavy box = easier to pass, harder to run
        if (defense.boxCount === 8) {
          score += 15;
          rationale.push('Heavy box creates passing opportunities');
        }

        // Coverage shell adjustments
        if (defense.coverage === '1-high') {
          // Single high = man or Cover 3
          if (passHints.manBeater) {
            score += 20;
            rationale.push('Man beater vs 1-high shell');
          }
          if (passHints.category === 'deep') {
            score += 10;
            rationale.push('Deep shots available vs 1-high');
          }
        } else if (defense.coverage === '2-high') {
          // Two high = Cover 2 or Cover 4
          if (passHints.zoneBeater) {
            score += 15;
            rationale.push('Zone beater vs 2-high shell');
          }
          if (passHints.stress?.includes('mof')) {
            score += 15;
            rationale.push('Attacks middle of field vs 2-high');
          }
          if (passHints.category === 'deep') {
            score -= 10; // Harder to throw deep vs 2-high
          }
        }
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
        score += 5;
      }

      // Defense context bonuses/penalties
      if (defense) {
        // Box count - strong effect on run concepts
        const boxStr = String(defense.boxCount) as '6' | '7' | '8';
        if (runHints.bestWhenBox?.includes(boxStr)) {
          score += 25;
          rationale.push(`✓ Box: ${defense.boxCount}-man box is favorable`);
        } else {
          // Penalize if running into unfavorable box
          if (defense.boxCount === 8) {
            score -= 25;
            rationale.push(`⚠ Heavy 8-man box`);
          } else if (defense.boxCount === 6 && runHints.category !== 'outside_zone') {
            // Light box but inside run
            score -= 10;
          }
        }

        // Front match - moderate effect
        if (defense.front && runHints.bestVsFront?.includes(defense.front)) {
          score += 20;
          rationale.push(`✓ Front: Effective vs ${defense.front}`);
        } else if (defense.front) {
          // Slight penalty for non-optimal front
          score -= 5;
        }

        // 3-tech position - important for gap schemes
        if (defense.threeTech && runHints.bestVs3T?.includes(defense.threeTech)) {
          score += 15;
          rationale.push(`✓ 3T: ${defense.threeTech} side creates angle`);
        } else if (defense.threeTech && defense.threeTech !== 'none') {
          // Slight penalty for unfavorable 3T
          if (runHints.category === 'gap' || runHints.category === 'power') {
            score -= 10;
          }
        }
      }
    }

    // ============================================
    // Team Profile Based Adjustments
    // ============================================
    const teamProfile = useTeamProfileStore.getState().profile;
    const { stylePreferences, unitStrength } = teamProfile;

    // Run/Pass Balance preference
    if (stylePreferences.runPassBalance === 'run_heavy') {
      if (concept.conceptType === 'run') {
        score += 15;
        rationale.push('✓ Run-heavy offense preference');
      } else {
        score -= 10;
      }
    } else if (stylePreferences.runPassBalance === 'pass_heavy') {
      if (concept.conceptType === 'pass') {
        score += 15;
        rationale.push('✓ Pass-heavy offense preference');
      } else {
        score -= 10;
      }
    }

    // Unit Strength bonuses for pass concepts
    if (concept.conceptType === 'pass') {
      // WR Separation - boost man-beating routes
      if (unitStrength.wrSeparation >= 4 && concept.suggestionHints.passHints?.manBeater) {
        score += 10;
        rationale.push('✓ Strong WR separation for man coverage');
      }

      // QB Arm - boost deep concepts
      if (unitStrength.qbArm >= 4 && concept.suggestionHints.passHints?.category === 'deep') {
        score += 15;
        rationale.push('✓ Strong QB arm for deep shots');
      }

      // QB Mobility - boost RPO and scramble concepts
      if (unitStrength.qbMobility >= 4 && concept.badges?.some(b => b.toLowerCase().includes('rpo') || b.toLowerCase().includes('scramble'))) {
        score += 10;
        rationale.push('✓ Mobile QB for RPO/scramble');
      }

      // OL Pass Protection - boost deep/intermediate concepts (need more time)
      if (unitStrength.olPassPro >= 4 && (concept.suggestionHints.passHints?.category === 'deep' || concept.suggestionHints.passHints?.category === 'intermediate')) {
        score += 10;
        rationale.push('✓ Strong pass protection for deeper routes');
      } else if (unitStrength.olPassPro <= 2 && concept.suggestionHints.passHints?.category === 'deep') {
        score -= 15;
        rationale.push('⚠ Weak pass protection for deep routes');
      }
    }

    // Unit Strength bonuses for run concepts
    if (concept.conceptType === 'run' && concept.suggestionHints.runHints) {
      const runHints = concept.suggestionHints.runHints;

      // OL Run Blocking - boost power/gap schemes
      if (unitStrength.olRunBlock >= 4 && (runHints.category === 'gap' || runHints.category === 'power')) {
        score += 15;
        rationale.push('✓ Strong OL run blocking for gap schemes');
      }

      // RB Vision - boost zone concepts
      if (unitStrength.rbVision >= 4 && (runHints.category === 'inside_zone' || runHints.category === 'outside_zone')) {
        score += 15;
        rationale.push('✓ RB vision for zone reads');
      }

      // RB Power - boost gap/power schemes
      if (unitStrength.rbPower >= 4 && (runHints.category === 'gap' || runHints.category === 'power')) {
        score += 10;
        rationale.push('✓ Power back for downhill runs');
      }

      // TE Blocking - boost run concepts requiring TE
      if (unitStrength.teBlock >= 4 && req.needsTE) {
        score += 10;
        rationale.push('✓ Strong TE blocking');
      }
    }

    // Risk Tolerance
    if (stylePreferences.riskTolerance === 'aggressive') {
      // Boost deep shots and big plays
      if (concept.conceptType === 'pass' && concept.suggestionHints.passHints?.category === 'deep') {
        score += 10;
        rationale.push('✓ Aggressive play-calling');
      }
    } else if (stylePreferences.riskTolerance === 'conservative') {
      // Boost quick game and safe concepts
      if (concept.conceptType === 'pass' && concept.suggestionHints.passHints?.category === 'quick') {
        score += 10;
        rationale.push('✓ Conservative quick game');
      }
      // Penalize deep shots for conservative teams
      if (concept.conceptType === 'pass' && concept.suggestionHints.passHints?.category === 'deep') {
        score -= 15;
      }
    }

    // Only include concepts with positive score
    if (score > 30) {
      const hints = concept.suggestionHints;
      const category =
        concept.conceptType === 'pass'
          ? hints.passHints?.category ?? 'quick'
          : hints.runHints?.category ?? 'inside_zone';

      // Build roles display
      const roles = concept.template.roles.map((role) => {
        let action = '';
        if (role.defaultRoute) {
          const route = role.defaultRoute;
          action = route.pattern.replace(/_/g, ' ');
          if (route.depth) action += ` @ ${route.depth} yds`;
          if (route.direction) action += ` (${route.direction})`;
        } else if (role.defaultBlock) {
          const block = role.defaultBlock;
          action = block.scheme.replace(/_/g, ' ');
          if (block.target) action += ` → ${block.target}`;
        } else {
          action = 'Assignment';
        }
        return {
          roleName: role.roleName,
          appliesTo: role.appliesTo,
          action: action.charAt(0).toUpperCase() + action.slice(1),
          notes: role.notes,
        };
      });

      results.push({
        id: concept.id,
        name: concept.name,
        conceptType: concept.conceptType,
        tier: concept.tier,
        category,
        summary: concept.summary,
        badges: concept.badges ?? [],
        matchScore: Math.min(100, Math.max(0, score)),
        rationale: rationale.length > 0 ? rationale : undefined,
        roles,
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
