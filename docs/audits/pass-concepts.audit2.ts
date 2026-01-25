// pass-concepts.audit2.ts
// Phase 2 – PASS Precision Audit (Audit2)
// 대상: Spacing, Hank, Bench, Levels, Sail, Post-Dig, Yankee, Texas, Whip, Shallow
// 기준: 현대 NCAA/NFL 코칭 표준 (route combo, depth, progression)

import type { PassConcept } from './types';

export const PASS_CONCEPTS_AUDIT2: PassConcept[] = [
  {
    id: 'spacing',
    name: 'Spacing',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'Z', 'H', 'RB'],
    summary: 'Spot concept attacking hook/curl defenders with spacing at 5 yards.',
    routes: {
      X: { type: 'hitch', depth: 5 },
      Y: { type: 'spot', depth: 5 },
      Z: { type: 'out', depth: 3 },
      H: { type: 'flat', depth: 2 },
    },
    progression: 'Spot (Y) → Flat (H) → Hitch (X)',
  },

  {
    id: 'hank',
    name: 'Hank (Curl-Flat)',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'Curl-flat concept stressing hook defender with flat control.',
    routes: {
      X: { type: 'curl', depth: 6 },
      H: { type: 'flat', depth: 2 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Curl (X) → Flat (H)',
  },

  {
    id: 'bench',
    name: 'Bench',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'Z'],
    summary: 'Double out concept to overload the flat defender.',
    routes: {
      X: { type: 'corner', depth: 12 },
      Y: { type: 'out', depth: 5 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Corner (X) → Out (Y)',
  },

  {
    id: 'levels',
    name: 'Levels',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'In-breaking routes at multiple depths to high-low linebackers.',
    routes: {
      X: { type: 'dig', depth: 15 },
      H: { type: 'cross', depth: 5 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Dig (X) → Shallow (H)',
  },

  {
    id: 'sail',
    name: 'Sail',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'Three-level flood concept attacking sideline.',
    routes: {
      Z: { type: 'go', depth: 18 },
      X: { type: 'corner', depth: 12 },
      H: { type: 'flat', depth: 2 },
    },
    progression: 'Corner (X) → Flat (H)',
  },

  {
    id: 'post_dig',
    name: 'Post-Dig',
    family: 'dropback',
    dropType: '7_step',
    appliesTo: ['X', 'Y', 'Z'],
    summary: 'Vertical post paired with deep dig to stress safeties.',
    routes: {
      Z: { type: 'post', depth: 18 },
      X: { type: 'dig', depth: 15 },
      Y: { type: 'check', depth: 3 },
    },
    progression: 'Post (Z) → Dig (X)',
  },

  {
    id: 'yankee',
    name: 'Yankee',
    family: 'play-action',
    dropType: '7_step',
    appliesTo: ['X', 'Z'],
    summary: 'Deep play-action concept with post over dig.',
    routes: {
      Z: { type: 'post', depth: 20 },
      X: { type: 'over', depth: 18 },
    },
    progression: 'Post (Z) → Over (X)',
  },

  {
    id: 'texas',
    name: 'Texas (Angle)',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['RB'],
    summary: 'RB angle route isolating linebacker in man coverage.',
    routes: {
      RB: { type: 'angle', depth: 6 },
    },
    progression: 'RB (Texas)',
  },

  {
    id: 'whip',
    name: 'Whip (Pivot)',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['H', 'Y'],
    summary: 'Option pivot route attacking man leverage.',
    routes: {
      H: { type: 'whip', depth: 5 },
      X: { type: 'go', depth: 18 },
    },
    progression: 'Whip (H)',
  },

  {
    id: 'shallow',
    name: 'Shallow Cross',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'Shallow cross with backside dig for horizontal stretch.',
    routes: {
      H: { type: 'cross', depth: 3 },
      X: { type: 'dig', depth: 12 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Shallow (H) → Dig (X)',
  },
];

export default PASS_CONCEPTS_AUDIT2;
