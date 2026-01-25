/**
 * Standardized Formation Definitions
 *
 * Coordinate System:
 * - 1 yard = 0.04 normalized units
 * - Y=0 is Line of Scrimmage (LOS)
 * - Y<0 is backfield (toward own end zone)
 * - Y>0 is toward defense
 *
 * O-Line Standard Spacing (1 yard = 0.04 between each):
 * - C: 0.50, LG: 0.46, RG: 0.54, LT: 0.42, RT: 0.58
 * - TE uses SAME spacing as OL (0.04 from tackle)
 *   - TE Left: 0.38, TE Right: 0.62
 *
 * Backfield Depths:
 * - LOS players: y = -0.03 (0.75yd behind LOS)
 * - Slot receivers: y = -0.05 (1.25yd behind LOS, ineligible prevention)
 * - QB under center: y = -0.09 (2.25yd, no overlap with C)
 * - QB shotgun: y = -0.15 (3.75yd)
 * - QB pistol: y = -0.10 (2.5yd)
 */

import type { PlayerShape } from '@/types/dsl';

// Ball appearance constant
const BALL_APPEARANCE = {
  shape: 'football' as PlayerShape,
  fill: '#8B4513',
  stroke: '#ffffff',
  showLabel: false,
  radius: 10,
};

// Standard O-Line X positions (1 yard = 0.04 spacing)
const OL_X = {
  LT: 0.42,
  LG: 0.46,
  C: 0.50,
  RG: 0.54,
  RT: 0.58,
  TE_L: 0.38,  // Same spacing as OL (0.04 from LT)
  TE_R: 0.62,  // Same spacing as OL (0.04 from RT)
};

// Standard Y depths
const DEPTH = {
  LOS: -0.03,      // 0.75yd behind LOS
  SLOT: -0.05,     // 1.25yd behind LOS (ineligible prevention)
  QB_UC: -0.09,    // 2.25yd (under center, no overlap with C)
  QB_PISTOL: -0.10, // 2.5yd
  QB_GUN: -0.15,    // 3.75yd
  FB: -0.13,        // 3.25yd
  RB_I: -0.19,      // 4.75yd (I-Formation)
  RB_GUN: -0.15,    // 3.75yd (Shotgun)
  WING: -0.07,      // 1.75yd
};

// WR X positions
const WR_X = {
  OUTSIDE_L: 0.05,
  SLOT_L: 0.15,
  SLOT_L2: 0.25,
  OUTSIDE_R: 0.95,
  SLOT_R: 0.85,
  SLOT_R2: 0.75,
  SPLIT_L: 0.10,
  SPLIT_R: 0.90,
};

export interface FormationPlayer {
  role: string;
  label: string;
  x: number;
  y: number;
  appearance?: {
    shape?: PlayerShape;
    fill?: string;
    stroke?: string;
    showLabel?: boolean;
    radius?: number;
  };
}

export interface Formation {
  name: string;
  players: FormationPlayer[];
  tags?: string[];
  personnel?: string; // e.g., "11", "12", "21"
}

// ===== TIER 1: Core Formations (Most Common) =====
export const TIER1_FORMATIONS: Record<string, Formation> = {
  // --- Spread/Air Raid ---
  spread_2x2: {
    name: 'Spread 2x2',
    personnel: '10',
    tags: ['spread', 'shotgun', '2x2', 'empty_box'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.OUTSIDE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'H', x: WR_X.SLOT_L, y: DEPTH.SLOT },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'RB', label: 'RB', x: OL_X.RT, y: DEPTH.RB_GUN },
      { role: 'WR', label: 'Y', x: WR_X.SLOT_R, y: DEPTH.SLOT },
      { role: 'WR', label: 'Z', x: WR_X.OUTSIDE_R, y: DEPTH.LOS },
    ],
  },

  trips_rt: {
    name: 'Trips Right',
    personnel: '10',
    tags: ['spread', 'shotgun', 'trips', '3x1'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.OUTSIDE_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'RB', label: 'RB', x: OL_X.LG, y: DEPTH.RB_GUN },
      { role: 'WR', label: 'H', x: WR_X.SLOT_R2, y: DEPTH.SLOT },
      { role: 'WR', label: 'Y', x: WR_X.SLOT_R, y: DEPTH.LOS },
      { role: 'WR', label: 'Z', x: WR_X.OUTSIDE_R, y: DEPTH.LOS },
    ],
  },

  // --- Pro Style ---
  i_formation: {
    name: 'I-Formation',
    personnel: '21',
    tags: ['pro', 'under_center', 'power', 'run_heavy'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_UC },
      { role: 'FB', label: 'FB', x: OL_X.C, y: DEPTH.FB },
      { role: 'RB', label: 'RB', x: OL_X.C, y: DEPTH.RB_I },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  singleback: {
    name: 'Singleback',
    personnel: '11',
    tags: ['pro', 'balanced', 'versatile'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_UC },
      { role: 'RB', label: 'RB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'WR', label: 'H', x: OL_X.TE_R, y: DEPTH.SLOT },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  shotgun_11: {
    name: 'Shotgun 11',
    personnel: '11',
    tags: ['spread', 'shotgun', 'balanced'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_R, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'WR', label: 'H', x: WR_X.SLOT_L, y: DEPTH.SLOT },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'RB', label: 'RB', x: OL_X.LG, y: DEPTH.RB_GUN },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  pistol: {
    name: 'Pistol',
    personnel: '11',
    tags: ['pistol', 'zone_read', 'rpo'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'WR', label: 'H', x: WR_X.SLOT_L, y: DEPTH.SLOT },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_PISTOL },
      { role: 'RB', label: 'RB', x: OL_X.C, y: -0.18 },
      { role: 'WR', label: 'Y', x: WR_X.SLOT_R, y: DEPTH.LOS },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },
};

// ===== TIER 2: Extended Common Formations =====
export const TIER2_FORMATIONS: Record<string, Formation> = {
  bunch_rt: {
    name: 'Bunch Right',
    personnel: '11',
    tags: ['spread', 'bunch', 'rub_routes'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.OUTSIDE_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'RB', label: 'RB', x: OL_X.LG, y: DEPTH.RB_GUN },
      { role: 'TE', label: 'Y', x: 0.75, y: DEPTH.LOS },
      { role: 'WR', label: 'H', x: 0.78, y: -0.08 },
      { role: 'WR', label: 'Z', x: 0.82, y: DEPTH.LOS },
    ],
  },

  twins_rt: {
    name: 'Twins Right',
    personnel: '11',
    tags: ['spread', 'twins', '2x1'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_R, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'RB', label: 'RB', x: OL_X.LG, y: DEPTH.RB_GUN },
      { role: 'WR', label: 'H', x: 0.78, y: DEPTH.SLOT },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  pro_set: {
    name: 'Pro Set',
    personnel: '21',
    tags: ['pro', 'under_center', 'balanced'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_UC },
      { role: 'RB', label: 'RB', x: OL_X.LG, y: DEPTH.FB },
      { role: 'FB', label: 'FB', x: OL_X.RG, y: DEPTH.FB },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  ace_12: {
    name: 'Ace (12 Personnel)',
    personnel: '12',
    tags: ['pro', '12_personnel', 'balanced'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'TE', label: 'U', x: OL_X.TE_R, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_UC },
      { role: 'RB', label: 'RB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },

  empty_3x2: {
    name: 'Empty 3x2',
    personnel: '10',
    tags: ['spread', 'empty', '5_wide'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.OUTSIDE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'H', x: WR_X.SLOT_L, y: DEPTH.SLOT },
      { role: 'WR', label: 'A', x: WR_X.SLOT_L2, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_GUN },
      { role: 'WR', label: 'Y', x: WR_X.SLOT_R, y: DEPTH.SLOT },
      { role: 'WR', label: 'Z', x: WR_X.OUTSIDE_R, y: DEPTH.LOS },
    ],
  },

  goal_line: {
    name: 'Goal Line',
    personnel: '22',
    tags: ['goal_line', 'power', 'short_yardage'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'TE', label: 'U', x: OL_X.TE_R, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_UC },
      { role: 'FB', label: 'FB', x: OL_X.C, y: -0.11 },
      { role: 'RB', label: 'RB', x: OL_X.C, y: -0.17 },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
    ],
  },

  pistol_ace: {
    name: 'Pistol Ace',
    personnel: '12',
    tags: ['pistol', 'power', 'duo', 'play_action'],
    players: [
      { role: 'BALL', label: '', x: OL_X.C, y: 0, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', x: OL_X.C, y: DEPTH.LOS },
      { role: 'LG', label: 'LG', x: OL_X.LG, y: DEPTH.LOS },
      { role: 'RG', label: 'RG', x: OL_X.RG, y: DEPTH.LOS },
      { role: 'LT', label: 'LT', x: OL_X.LT, y: DEPTH.LOS },
      { role: 'RT', label: 'RT', x: OL_X.RT, y: DEPTH.LOS },
      { role: 'TE', label: 'Y', x: OL_X.TE_R, y: DEPTH.LOS },
      { role: 'TE', label: 'H', x: OL_X.TE_L, y: DEPTH.LOS },
      { role: 'WR', label: 'X', x: WR_X.SPLIT_L, y: DEPTH.LOS },
      { role: 'QB', label: 'QB', x: OL_X.C, y: DEPTH.QB_PISTOL },
      { role: 'RB', label: 'RB', x: OL_X.C, y: -0.18 },
      { role: 'WR', label: 'Z', x: WR_X.SPLIT_R, y: DEPTH.LOS },
    ],
  },
};

// Export all formations combined
export const ALL_FORMATIONS: Record<string, Formation> = {
  ...TIER1_FORMATIONS,
  ...TIER2_FORMATIONS,
};

// Formation categories for UI
export const FORMATION_CATEGORIES: Record<string, string[]> = {
  'Spread': ['spread_2x2', 'trips_rt', 'bunch_rt', 'twins_rt', 'empty_3x2'],
  'Pro Style': ['i_formation', 'singleback', 'pro_set', 'ace_12'],
  'Shotgun/Pistol': ['shotgun_11', 'pistol', 'pistol_ace'],
  'Short Yardage': ['goal_line'],
};

// Helper to get formation by key
export function getFormation(key: string): Formation | undefined {
  return ALL_FORMATIONS[key];
}

// Helper to get formation name
export function getFormationName(key: string): string {
  return ALL_FORMATIONS[key]?.name || key;
}
