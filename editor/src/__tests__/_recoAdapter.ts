/**
 * Recommendation Adapter for Testing
 * Loads scenarios and runs recommendation engine
 */

import { getRecommendations } from '@/lib/recommendation-engine';
import type {
  FormationContext,
  DefenseContext,
  RecommendationInput,
  ConceptType,
  FrontType,
  ThreeTechPosition,
  Concept,
} from '@/types/concept';
import { FORMATION_LIBRARY } from '@/data/formation-library';
import type { PassConcept, RunConcept, PassRoute, RunRole } from '@/lib/assignment-formatter';

// Scenario format from scenarios.json
export interface Scenario {
  id: string;
  formationId: string;
  tendency: 'PASS' | 'RUN';
  down: number;
  distance: number;
  fieldZone: string;
  box: number;
  front: string;
  coverage: string;
}

// Recommendation result for top5
export interface RecoResult {
  id: string;
  name: string;
  kind: 'pass' | 'run';
  score: number;
}

// Load scenarios from JSON file
export function loadSnapshots(): Scenario[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const scenarios = require('../../../docs/audits/scenarios.json') as Scenario[];
  return scenarios;
}

// Map formation ID to FormationContext
function buildFormationContext(formationId: string): FormationContext {
  // Try to find in FORMATION_LIBRARY
  const formationMeta = FORMATION_LIBRARY.find((f) => f.id === formationId);

  // Default mapping based on common formation patterns
  const structureMap: Record<string, FormationContext['structure']> = {
    gun_2x2: '2x2',
    gun_3x1: '3x1',
    gun_bunch: 'bunch',
    gun_stack: '3x1',
    empty_3x2: 'empty',
    empty_3x1: 'empty',
    pistol_2x2: '2x2',
    pistol_ace: '2x1',
    under_ace: '2x1',
    under_i: 'I',
  };

  const personnelMap: Record<string, FormationContext['personnel']> = {
    gun_2x2: '11',
    gun_3x1: '11',
    gun_bunch: '11',
    gun_stack: '11',
    empty_3x2: '10',
    empty_3x1: '10',
    pistol_2x2: '11',
    pistol_ace: '12',
    under_ace: '12',
    under_i: '21',
  };

  const receiverMap: Record<string, number> = {
    gun_2x2: 4,
    gun_3x1: 4,
    gun_bunch: 4,
    gun_stack: 4,
    empty_3x2: 5,
    empty_3x1: 4,
    pistol_2x2: 4,
    pistol_ace: 3,
    under_ace: 3,
    under_i: 3,
  };

  const hasTEMap: Record<string, boolean> = {
    gun_2x2: false,
    gun_3x1: false,
    gun_bunch: false,
    gun_stack: false,
    empty_3x2: false,
    empty_3x1: false,
    pistol_2x2: false,
    pistol_ace: true,
    under_ace: true,
    under_i: true,
  };

  // Determine hasTightEnd with proper null handling
  let hasTightEnd = hasTEMap[formationId];
  if (hasTightEnd === undefined) {
    hasTightEnd = formationMeta?.requiredRoster?.TE ? formationMeta.requiredRoster.TE > 0 : false;
  }

  return {
    formationId,
    structure: structureMap[formationId] ?? (formationMeta?.structure as FormationContext['structure']) ?? '2x2',
    personnel: personnelMap[formationId] ?? '11',
    receiverCount: receiverMap[formationId] ?? 4,
    hasTightEnd,
    hasFullback: formationId.includes('under_i') || formationId.includes('pistol_ace'),
    strengthSide: 'right',
  };
}

// Map defense fields to DefenseContext
function buildDefenseContext(scenario: Scenario): DefenseContext {
  const frontMap: Record<string, FrontType> = {
    even: 'even',
    odd: 'odd',
    under: 'under',
    over: 'over',
    bear: 'bear',
    goal_line: 'goal_line',
  };

  // Infer 3-tech position from front type
  const threeTechMap: Record<string, ThreeTechPosition> = {
    even: 'both',
    odd: 'none',
    under: 'strength',
    over: 'weak',
    bear: 'both',
    goal_line: 'both',
  };

  return {
    boxCount: scenario.box as 6 | 7 | 8,
    front: frontMap[scenario.front] ?? 'even',
    threeTech: threeTechMap[scenario.front] ?? 'both',
    coverage: scenario.coverage,
  };
}

// Run recommendation and return top 5
export async function recommendTop5(scenario: Scenario): Promise<RecoResult[]> {
  const formation = buildFormationContext(scenario.formationId);
  const defense = buildDefenseContext(scenario);

  // Prefer concept type based on tendency
  const preferredType: ConceptType = scenario.tendency === 'PASS' ? 'pass' : 'run';

  const input: RecommendationInput = {
    formation,
    defense,
    preferredType,
  };

  const result = getRecommendations(input);

  // Convert to RecoResult format and take top 5
  const top5 = result.concepts.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.conceptType,
    score: c.matchScore,
  }));

  return top5;
}

/**
 * Convert main Concept format to audit PassConcept format
 * for assignment-formatter compatibility
 */
export function toPassConcept(concept: Concept): PassConcept {
  const routes: Record<string, PassRoute> = {};

  // Convert template.roles to routes
  for (const role of concept.template?.roles ?? []) {
    if (!role.defaultRoute) continue;
    const pattern = role.defaultRoute.pattern ?? 'check';
    const depth = role.defaultRoute.depth ?? 5;

    for (const label of role.appliesTo) {
      routes[label] = { type: pattern, depth };
    }
  }

  // Map dropType from suggestionHints
  const dropHint = concept.suggestionHints?.passHints?.dropType;
  let dropType: PassConcept['dropType'] = undefined;
  if (dropHint === 'quick' || dropHint === '3_step') dropType = '3_step';
  else if (dropHint === '5_step') dropType = '5_step';
  else if (dropHint === '7_step') dropType = '7_step';

  return {
    id: concept.id,
    name: concept.name,
    family: concept.suggestionHints?.passHints?.category ?? 'dropback',
    dropType,
    appliesTo: Object.keys(routes),
    summary: concept.summary,
    routes,
    progression: undefined,
  };
}

/**
 * Convert main Concept format to audit RunConcept format
 * for assignment-formatter compatibility
 */
export function toRunConcept(concept: Concept): RunConcept {
  const roles: RunRole[] = [];

  // Convert template.roles to RunRoles
  for (const role of concept.template?.roles ?? []) {
    const runRole: RunRole = {
      roleName: role.roleName,
      appliesTo: role.appliesTo,
      defaultBlock: role.defaultBlock
        ? {
            scheme: role.defaultBlock.scheme,
            target: role.defaultBlock.target,
          }
        : undefined,
      notes: role.notes,
    };
    roles.push(runRole);
  }

  return {
    id: concept.id,
    name: concept.name,
    conceptType: 'run',
    summary: concept.summary,
    appliesTo: roles.flatMap((r) => r.appliesTo),
    requirements: {
      needsTE: concept.requirements?.needsTE,
      needsPuller: concept.requirements?.needsPuller,
    },
    template: {
      roles,
      buildPolicy: {
        defaultSide: concept.template?.buildPolicy?.defaultSide as 'strength' | 'weak' | 'either',
      },
    },
  };
}
