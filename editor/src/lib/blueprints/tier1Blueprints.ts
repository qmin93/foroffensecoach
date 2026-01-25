/**
 * Tier-1 Play Blueprints
 *
 * A Blueprint is the single source of truth for a complete play:
 * - Formation reference
 * - Canvas actions (routes, blocks, motions)
 * - Assignment text for each player
 *
 * This eliminates the need to derive assignments from actions or vice versa.
 */

import type { Point } from '@/types/dsl';

// Route action definition within a blueprint
export interface BlueprintRoute {
  type: 'route';
  pattern: string;
  depth: number;  // In yards
  direction?: 'inside' | 'outside';
  breakAngle?: number;
}

// Block action definition within a blueprint
export interface BlueprintBlock {
  type: 'block';
  scheme: string;
  target?: { x: number; y: number };
}

// Motion action definition within a blueprint
export interface BlueprintMotion {
  type: 'motion';
  pathPoints: Point[];
  style?: 'jet' | 'orbit' | 'push';
}

export type BlueprintAction = BlueprintRoute | BlueprintBlock | BlueprintMotion;

// Role assignment within a blueprint
export interface BlueprintRole {
  role: string;           // Player role to match (e.g., 'X', 'Y', 'RB', 'LG')
  action?: BlueprintAction;
  assignment: string;     // Human-readable assignment text
}

// Complete blueprint definition
export interface Blueprint {
  id: string;
  name: string;
  formationKey: string;   // References a formation from formations.ts
  type: 'run' | 'pass';
  category: string;       // e.g., 'inside_zone', 'quick_game', 'dropback'
  tags: string[];
  roles: BlueprintRole[];
  description?: string;
}

// ===== TIER 1 RUN BLUEPRINTS =====

export const INSIDE_ZONE: Blueprint = {
  id: 'run_inside_zone',
  name: 'Inside Zone',
  formationKey: 'i_formation',
  type: 'run',
  category: 'inside_zone',
  tags: ['zone', 'gap_scheme', 'base_run'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Zone step playside, combo to backside LB' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Zone step playside, combo to Mike' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Zone step playside, climb to backside LB' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Zone step playside, combo to Will' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Zone step playside, secure DE' },
    { role: 'Y', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach block EMOL' },
    { role: 'X', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'Z', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block safety' },
    { role: 'FB', action: { type: 'block', scheme: 'lead' }, assignment: 'Lead through A-gap, block first color' },
    { role: 'RB', action: { type: 'route', pattern: 'handoff', depth: 3 }, assignment: 'Inside Zone, read playside A-gap' },
    { role: 'QB', assignment: 'Handoff to RB, carry out fake' },
  ],
  description: 'Base inside zone with FB lead block',
};

export const OUTSIDE_ZONE: Blueprint = {
  id: 'run_outside_zone',
  name: 'Outside Zone',
  formationKey: 'shotgun_11',
  type: 'run',
  category: 'outside_zone',
  tags: ['zone', 'stretch', 'perimeter'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach, overtake or cutoff' },
    { role: 'LG', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach, combo to Mike' },
    { role: 'C', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach, combo to backside LB' },
    { role: 'RG', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach, climb to Will' },
    { role: 'RT', action: { type: 'block', scheme: 'reach' }, assignment: 'Reach DE' },
    { role: 'Y', action: { type: 'block', scheme: 'arc' }, assignment: 'Arc release, block force defender' },
    { role: 'X', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'H', action: { type: 'block', scheme: 'crack' }, assignment: 'Crack block SS/LB' },
    { role: 'Z', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'RB', action: { type: 'route', pattern: 'stretch', depth: 2 }, assignment: 'Outside Zone, press the edge, cut back off reach blocks' },
    { role: 'QB', assignment: 'Hand off, carry out naked boot fake' },
  ],
  description: 'Wide zone/stretch play to the perimeter',
};

export const POWER: Blueprint = {
  id: 'run_power',
  name: 'Power',
  formationKey: 'i_formation',
  type: 'run',
  category: 'gap_scheme',
  tags: ['gap', 'power', 'downhill'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Base block DE' },
    { role: 'LG', action: { type: 'block', scheme: 'down' }, assignment: 'Down block on DT' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Back block playside A-gap' },
    { role: 'RG', action: { type: 'block', scheme: 'pull_kick' }, assignment: 'Pull and kick out EMOL' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Base block DE, hinge if needed' },
    { role: 'Y', action: { type: 'block', scheme: 'down' }, assignment: 'Down block, seal inside' },
    { role: 'X', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'Z', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block safety' },
    { role: 'FB', action: { type: 'block', scheme: 'lead' }, assignment: 'Lead through B-gap, block Mike' },
    { role: 'RB', action: { type: 'route', pattern: 'handoff', depth: 3 }, assignment: 'Follow FB through B-gap' },
    { role: 'QB', assignment: 'Handoff to RB' },
  ],
  description: 'Gap scheme power run with pulling guard and FB lead',
};

export const COUNTER: Blueprint = {
  id: 'run_counter',
  name: 'Counter',
  formationKey: 'i_formation',
  type: 'run',
  category: 'gap_scheme',
  tags: ['gap', 'counter', 'misdirection'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Base block DE' },
    { role: 'LG', action: { type: 'block', scheme: 'pull_lead' }, assignment: 'Pull and lead through hole, block LB' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Back block, secure backside A-gap' },
    { role: 'RG', action: { type: 'block', scheme: 'pull_kick' }, assignment: 'Pull and kick out EMOL' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Hinge, protect backside' },
    { role: 'Y', action: { type: 'block', scheme: 'down' }, assignment: 'Down block DE' },
    { role: 'X', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'Z', action: { type: 'block', scheme: 'stalk' }, assignment: 'Stalk block corner' },
    { role: 'FB', action: { type: 'block', scheme: 'wham' }, assignment: 'Fake opposite, block backside' },
    { role: 'RB', action: { type: 'route', pattern: 'handoff', depth: 3 }, assignment: 'Counter step, follow pullers' },
    { role: 'QB', assignment: 'Counter fake, hand off' },
  ],
  description: 'Counter with double pull, misdirection at LB level',
};

export const DRAW: Blueprint = {
  id: 'run_draw',
  name: 'Draw',
  formationKey: 'shotgun_11',
  type: 'run',
  category: 'draw',
  tags: ['draw', 'pass_action', 'delay'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass set, invite rush, block' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass set, invite rush, block' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass set, invite rush, climb' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass set, invite rush, block' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass set, invite rush, block' },
    { role: 'Y', action: { type: 'route', pattern: 'flat', depth: 2 }, assignment: 'Release flat, sell pass' },
    { role: 'X', action: { type: 'route', pattern: 'go', depth: 10 }, assignment: 'Run off corner' },
    { role: 'H', action: { type: 'route', pattern: 'slant', depth: 5 }, assignment: 'Slant, occupy LB' },
    { role: 'Z', action: { type: 'route', pattern: 'go', depth: 10 }, assignment: 'Run off corner' },
    { role: 'RB', action: { type: 'route', pattern: 'handoff', depth: 2 }, assignment: 'Delay 2 count, receive draw handoff' },
    { role: 'QB', assignment: 'Drop back, hand off draw' },
  ],
  description: 'Delayed draw play with pass action',
};

// ===== TIER 1 PASS BLUEPRINTS =====

export const SLANT_FLAT: Blueprint = {
  id: 'pass_slant_flat',
  name: 'Slant-Flat',
  formationKey: 'spread_2x2',
  type: 'pass',
  category: 'quick_game',
  tags: ['quick_game', 'high_low', 'rhythm'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, half slide left' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, half slide left' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, set to Mike' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, man right' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, man right' },
    { role: 'X', action: { type: 'route', pattern: 'slant', depth: 6, direction: 'inside' }, assignment: 'Slant 6 yards, settle vs zone' },
    { role: 'H', action: { type: 'route', pattern: 'flat', depth: 2, direction: 'outside' }, assignment: 'Flat route, get width quickly' },
    { role: 'Y', action: { type: 'route', pattern: 'flat', depth: 2, direction: 'outside' }, assignment: 'Flat route, get width quickly' },
    { role: 'Z', action: { type: 'route', pattern: 'slant', depth: 6, direction: 'inside' }, assignment: 'Slant 6 yards, settle vs zone' },
    { role: 'RB', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Check release, block edge rusher' },
    { role: 'QB', assignment: 'Quick 3-step, read flat defender' },
  ],
  description: 'Quick game slant/flat combination for horizontal stretch',
};

export const FOUR_VERTICALS: Blueprint = {
  id: 'pass_four_verts',
  name: 'Four Verticals',
  formationKey: 'spread_2x2',
  type: 'pass',
  category: 'vertical',
  tags: ['deep', 'shot_play', 'cover_beater'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Max pro left' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Max pro left' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Max pro, set to front' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Max pro right' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Max pro right' },
    { role: 'X', action: { type: 'route', pattern: 'go', depth: 15 }, assignment: 'Vertical, beat corner outside' },
    { role: 'H', action: { type: 'route', pattern: 'seam', depth: 14 }, assignment: 'Seam, split safeties' },
    { role: 'Y', action: { type: 'route', pattern: 'seam', depth: 14 }, assignment: 'Seam, split safeties' },
    { role: 'Z', action: { type: 'route', pattern: 'go', depth: 15 }, assignment: 'Vertical, beat corner outside' },
    { role: 'RB', action: { type: 'route', pattern: 'flat', depth: 3 }, assignment: 'Check release, swing or sit' },
    { role: 'QB', assignment: '5-step drop, read safety rotation' },
  ],
  description: 'Vertical stretch with 4 receivers pushing deep',
};

export const MESH: Blueprint = {
  id: 'pass_mesh',
  name: 'Mesh',
  formationKey: 'spread_2x2',
  type: 'pass',
  category: 'dropback',
  tags: ['man_beater', 'pick_concept', 'crossing'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, set to Mike' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'X', action: { type: 'route', pattern: 'corner', depth: 12 }, assignment: 'Corner route, clear out' },
    { role: 'H', action: { type: 'route', pattern: 'shallow', depth: 4 }, assignment: 'Shallow cross L to R, under all traffic' },
    { role: 'Y', action: { type: 'route', pattern: 'shallow', depth: 4 }, assignment: 'Shallow cross R to L, under all traffic' },
    { role: 'Z', action: { type: 'route', pattern: 'corner', depth: 12 }, assignment: 'Corner route, clear out' },
    { role: 'RB', action: { type: 'route', pattern: 'flat', depth: 2 }, assignment: 'Check release, sit in vacated area' },
    { role: 'QB', assignment: 'Read mesh point, throw to crosser coming open' },
  ],
  description: 'Mesh crossing concept, natural pick vs man coverage',
};

export const SMASH: Blueprint = {
  id: 'pass_smash',
  name: 'Smash',
  formationKey: 'twins_rt',
  type: 'pass',
  category: 'dropback',
  tags: ['cover_2_beater', 'high_low', '2_man_route'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'Y', action: { type: 'route', pattern: 'go', depth: 15 }, assignment: 'Clear out, occupy FS' },
    { role: 'X', action: { type: 'route', pattern: 'hitch', depth: 5 }, assignment: 'Hitch at 5, settle vs zone' },
    { role: 'H', action: { type: 'route', pattern: 'hitch', depth: 5 }, assignment: 'Hitch at 5, hold flat defender' },
    { role: 'Z', action: { type: 'route', pattern: 'corner', depth: 12 }, assignment: 'Corner route, beat corner over top' },
    { role: 'RB', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro, check weak side' },
    { role: 'QB', assignment: 'Read corner - throw hitch or corner' },
  ],
  description: 'Smash - hitch/corner combo to stress cover 2',
};

export const DAGGER: Blueprint = {
  id: 'pass_dagger',
  name: 'Dagger',
  formationKey: 'trips_rt',
  type: 'pass',
  category: 'dropback',
  tags: ['cover_3_beater', 'hole_shot', 'seam'],
  roles: [
    { role: 'LT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'LG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro left' },
    { role: 'C', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro' },
    { role: 'RG', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'RT', action: { type: 'block', scheme: 'zone_step' }, assignment: 'Pass pro right' },
    { role: 'X', action: { type: 'route', pattern: 'post', depth: 14 }, assignment: 'Post, occupy FS' },
    { role: 'H', action: { type: 'route', pattern: 'seam', depth: 14 }, assignment: 'Seam, attack hole in cover 3' },
    { role: 'Y', action: { type: 'route', pattern: 'dig', depth: 12 }, assignment: 'Dig at 12, sit in hole' },
    { role: 'Z', action: { type: 'route', pattern: 'go', depth: 15 }, assignment: 'Go route, clear out corner' },
    { role: 'RB', action: { type: 'route', pattern: 'flat', depth: 3 }, assignment: 'Check release, flat' },
    { role: 'QB', assignment: 'Read Mike - throw seam or dig' },
  ],
  description: 'Dagger - seam/dig combo to attack cover 3 hole',
};

// ===== EXPORT ALL BLUEPRINTS =====

export const TIER1_RUN_BLUEPRINTS: Blueprint[] = [
  INSIDE_ZONE,
  OUTSIDE_ZONE,
  POWER,
  COUNTER,
  DRAW,
];

export const TIER1_PASS_BLUEPRINTS: Blueprint[] = [
  SLANT_FLAT,
  FOUR_VERTICALS,
  MESH,
  SMASH,
  DAGGER,
];

export const ALL_TIER1_BLUEPRINTS: Blueprint[] = [
  ...TIER1_RUN_BLUEPRINTS,
  ...TIER1_PASS_BLUEPRINTS,
];

// Helper to find blueprint by ID
export function getBlueprintById(id: string): Blueprint | undefined {
  return ALL_TIER1_BLUEPRINTS.find(bp => bp.id === id);
}

// Helper to get blueprints by type
export function getBlueprintsByType(type: 'run' | 'pass'): Blueprint[] {
  return ALL_TIER1_BLUEPRINTS.filter(bp => bp.type === type);
}

// Helper to get blueprints for a specific formation
export function getBlueprintsForFormation(formationKey: string): Blueprint[] {
  return ALL_TIER1_BLUEPRINTS.filter(bp => bp.formationKey === formationKey);
}
