/**
 * Concepts Index
 * Export all concept data
 */

export { PASS_CONCEPTS, default as passConceptsDefault } from './pass-concepts';
export { RUN_CONCEPTS, default as runConceptsDefault } from './run-concepts';

import { PASS_CONCEPTS } from './pass-concepts';
import { RUN_CONCEPTS } from './run-concepts';
import type { Concept } from '@/types/concept';

// Combined concepts array
export const ALL_CONCEPTS: Concept[] = [...PASS_CONCEPTS, ...RUN_CONCEPTS];

// Concept lookup by ID
export const CONCEPT_BY_ID: Record<string, Concept> = ALL_CONCEPTS.reduce(
  (acc, concept) => {
    acc[concept.id] = concept;
    return acc;
  },
  {} as Record<string, Concept>
);

// Get concept by ID
export function getConceptById(id: string): Concept | undefined {
  return CONCEPT_BY_ID[id];
}

// Get concepts by type
export function getConceptsByType(type: 'pass' | 'run'): Concept[] {
  return ALL_CONCEPTS.filter((c) => c.conceptType === type);
}
