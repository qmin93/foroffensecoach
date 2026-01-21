/**
 * Recommendation Engine for ForOffenseCoach
 *
 * Filters and ranks concepts based on:
 * - Formation context (structure, personnel, receivers)
 * - Defense context (box count, front, 3-tech position)
 *
 * Design principles:
 * - Recommendations are filtering, not judgment
 * - Results limited to 20 concepts
 * - Run recommendations include 3-line rationale (Numbers/Angle/Surface)
 * - No AI predictions or success rates
 */

import type {
  Concept,
  ConceptType,
  FormationContext,
  DefenseContext,
  ConceptCardData,
  RecommendationInput,
  RecommendationResult,
  PassCategory,
  RunCategory,
  PreferredStructure,
} from '@/types/concept';
import { ALL_CONCEPTS } from '@/data/concepts';

// ============================================
// Configuration
// ============================================

const CONFIG = {
  maxResults: 20,
  minScore: 25,
  weights: {
    // Pass weights
    receiverMatch: 25,
    structureMatch: 20,
    teMatch: 15,
    personnelMatch: 10,
    badgeBonus: 5,

    // Run weights
    boxMatch: 25,
    frontMatch: 20,
    threeTechMatch: 15,
    surfaceMatch: 20,
    pullerMatch: 10,
  },
};

// ============================================
// Main Recommendation Function
// ============================================

export function getRecommendations(input: RecommendationInput): RecommendationResult {
  const { formation, defense, preferredType } = input;

  let concepts = ALL_CONCEPTS;

  // Pre-filter by type if specified
  if (preferredType) {
    concepts = concepts.filter((c) => c.conceptType === preferredType);
  }

  // Score all concepts
  const scoredConcepts = concepts.map((concept) => {
    const result = scoreConcept(concept, formation, defense ?? null);
    return { concept, ...result };
  });

  // Filter by minimum score
  const validConcepts = scoredConcepts.filter((sc) => sc.score >= CONFIG.minScore);

  // Sort by score descending
  validConcepts.sort((a, b) => b.score - a.score);

  // Take top results
  const topConcepts = validConcepts.slice(0, CONFIG.maxResults);

  // Convert to card data
  const conceptCards: ConceptCardData[] = topConcepts.map((sc) => ({
    id: sc.concept.id,
    name: sc.concept.name,
    conceptType: sc.concept.conceptType,
    category: getCategory(sc.concept),
    summary: sc.concept.summary,
    badges: sc.concept.badges ?? [],
    matchScore: Math.round(sc.score),
    rationale: sc.rationale.length > 0 ? sc.rationale.slice(0, 3) : undefined,
  }));

  // Compute filter counts
  const filters = computeFilterCounts(validConcepts.map((v) => v.concept));

  return {
    concepts: conceptCards,
    totalMatches: validConcepts.length,
    filters,
  };
}

// ============================================
// Scoring Logic
// ============================================

interface ScoringResult {
  score: number;
  rationale: string[];
}

function scoreConcept(
  concept: Concept,
  formation: FormationContext,
  defense: DefenseContext | null
): ScoringResult {
  const rationale: string[] = [];
  let score = 50; // Base score

  const req = concept.requirements;

  // ============================================
  // Pass Concept Scoring
  // ============================================
  if (concept.conceptType === 'pass') {
    // Receiver count requirement
    if (req.minEligibleReceivers) {
      if (formation.receiverCount >= req.minEligibleReceivers) {
        score += CONFIG.weights.receiverMatch;
      } else {
        // Not enough receivers - significant penalty
        score -= 40;
        return { score, rationale }; // Early exit
      }
    }

    // TE requirement
    if (req.needsTE) {
      if (formation.hasTightEnd) {
        score += CONFIG.weights.teMatch;
      } else {
        score -= 35; // Heavy penalty for missing TE
        return { score, rationale };
      }
    }

    // Structure match
    if (req.preferredStructures && req.preferredStructures.length > 0) {
      if (formation.structure && req.preferredStructures.includes(formation.structure)) {
        score += CONFIG.weights.structureMatch;
      }
    }

    // Personnel match
    if (req.personnelHints && formation.personnel) {
      if (req.personnelHints.includes(formation.personnel)) {
        score += CONFIG.weights.personnelMatch;
      }
    }

    // Badge bonuses for preferred styles
    if (concept.badges?.includes('nfl_style')) {
      score += CONFIG.weights.badgeBonus;
    }
  }

  // ============================================
  // Run Concept Scoring
  // ============================================
  if (concept.conceptType === 'run') {
    const runHints = concept.suggestionHints.runHints;

    if (!runHints) {
      return { score: 0, rationale };
    }

    // Surface/TE requirement
    if (runHints.surfaceNeeds === 'te_required') {
      if (!formation.hasTightEnd) {
        score -= 50;
        return { score, rationale };
      }
      score += CONFIG.weights.surfaceMatch;
      rationale.push(`Surface: TE provides playside edge`);
    } else if (runHints.surfaceNeeds === 'te_preferred') {
      if (formation.hasTightEnd) {
        score += CONFIG.weights.surfaceMatch / 2;
        rationale.push(`Surface: TE adds blocking surface`);
      }
    }

    // Puller requirement
    if (req.needsPuller && req.needsPuller !== 'none') {
      // Assume OL can pull - add small bonus
      score += CONFIG.weights.pullerMatch;
    }

    // Defense context scoring
    if (defense) {
      // Box count - Numbers advantage
      if (defense.boxCount && runHints.bestWhenBox) {
        const boxStr = String(defense.boxCount) as '6' | '7' | '8';
        if (runHints.bestWhenBox.includes(boxStr)) {
          score += CONFIG.weights.boxMatch;
          rationale.push(`Numbers: ${defense.boxCount}-man box creates numbers advantage`);
        } else if (defense.boxCount === 8 && req.boxTolerance !== '8_risky') {
          // 8-man box is tough for most runs
          score -= 15;
        }
      }

      // Front match - Angle advantage
      if (defense.front && runHints.bestVsFront) {
        if (runHints.bestVsFront.includes(defense.front)) {
          score += CONFIG.weights.frontMatch;
          rationale.push(`Angle: ${capitalize(defense.front)} front creates favorable blocking angles`);
        }
      }

      // 3-tech position
      if (defense.threeTech && runHints.bestVs3T) {
        if (runHints.bestVs3T.includes(defense.threeTech)) {
          score += CONFIG.weights.threeTechMatch;
          if (defense.threeTech !== 'none') {
            rationale.push(`3T: ${capitalize(defense.threeTech)}-side 3-tech opens backside lane`);
          }
        }
      }
    }

    // Formation match
    if (req.preferredFormations && formation.formationId) {
      if (req.preferredFormations.includes(formation.formationId)) {
        score += 10;
      }
    }
  }

  return { score, rationale };
}

// ============================================
// Helper Functions
// ============================================

function getCategory(concept: Concept): PassCategory | RunCategory {
  const hints = concept.suggestionHints;
  if (concept.conceptType === 'pass' && hints.passHints) {
    return hints.passHints.category;
  }
  if (concept.conceptType === 'run' && hints.runHints) {
    return hints.runHints.category;
  }
  return concept.conceptType === 'pass' ? 'quick' : 'inside_zone';
}

function computeFilterCounts(concepts: Concept[]) {
  const byType = { pass: 0, run: 0 };
  const byCategory: Record<string, number> = {};

  for (const concept of concepts) {
    byType[concept.conceptType]++;

    const category = getCategory(concept);
    byCategory[category] = (byCategory[category] ?? 0) + 1;
  }

  return { byType, byCategory };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// Formation Context Builder
// ============================================

export function buildFormationContext(
  formationId: string | undefined,
  players: Array<{ role: string; alignment: { x: number; y: number } }>
): FormationContext {
  // Count receivers (X, Y, Z, H - excluding FB)
  const receiverRoles = ['X', 'Y', 'Z', 'H', 'W', 'R'];
  const receivers = players.filter((p) => receiverRoles.includes(p.role));
  const receiverCount = receivers.length;

  // Check for TE
  const hasTightEnd = players.some((p) => p.role === 'Y' || p.role === 'TE');

  // Determine structure from receiver positions
  const structure = inferStructure(players);

  // Determine strength
  const strength = inferStrength(players);

  return {
    formationId,
    structure,
    receiverCount,
    hasTightEnd,
    strength,
  };
}

function inferStructure(
  players: Array<{ role: string; alignment: { x: number; y: number } }>
): PreferredStructure | undefined {
  const receivers = players.filter((p) =>
    ['X', 'Y', 'Z', 'H', 'W'].includes(p.role)
  );

  if (receivers.length === 0) return undefined;

  // Count receivers on each side (left/right of center x=0.5)
  const leftReceivers = receivers.filter((r) => r.alignment.x < 0.45);
  const rightReceivers = receivers.filter((r) => r.alignment.x > 0.55);

  const left = leftReceivers.length;
  const right = rightReceivers.length;

  // Determine structure
  if (left === 3 && right === 1) return '3x1';
  if (left === 1 && right === 3) return '3x1';
  if (left === 2 && right === 2) return '2x2';
  if (left === 3 || right === 3) return 'trips';
  if (left === 2 || right === 2) return 'twins';

  // Check for special formations
  const hasRB = players.some((p) => p.role === 'RB');
  const hasFB = players.some((p) => p.role === 'FB');

  if (!hasRB && receivers.length >= 4) return 'empty';
  if (hasFB) return 'I';

  return '2x2';
}

function inferStrength(
  players: Array<{ role: string; alignment: { x: number; y: number } }>
): 'left' | 'right' | undefined {
  const te = players.find((p) => p.role === 'Y' || p.role === 'TE');

  if (te) {
    return te.alignment.x > 0.5 ? 'right' : 'left';
  }

  // Count receivers on each side
  const receivers = players.filter((p) => ['X', 'Z', 'H', 'W'].includes(p.role));
  const left = receivers.filter((r) => r.alignment.x < 0.5).length;
  const right = receivers.filter((r) => r.alignment.x > 0.5).length;

  if (right > left) return 'right';
  if (left > right) return 'left';

  return undefined;
}

// ============================================
// Quick Filters
// ============================================

export function getPassConceptsByCategory(category: PassCategory): Concept[] {
  return ALL_CONCEPTS.filter((c) => {
    if (c.conceptType !== 'pass') return false;
    return c.suggestionHints.passHints?.category === category;
  });
}

export function getRunConceptsByCategory(category: RunCategory): Concept[] {
  return ALL_CONCEPTS.filter((c) => {
    if (c.conceptType !== 'run') return false;
    return c.suggestionHints.runHints?.category === category;
  });
}

export function searchConcepts(query: string): Concept[] {
  const lowerQuery = query.toLowerCase();

  return ALL_CONCEPTS.filter((c) => {
    return (
      c.name.toLowerCase().includes(lowerQuery) ||
      c.summary.toLowerCase().includes(lowerQuery) ||
      c.badges?.some((b) => b.toLowerCase().includes(lowerQuery))
    );
  });
}
