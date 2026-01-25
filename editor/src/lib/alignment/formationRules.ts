/**
 * Formation Rules System
 *
 * 좌표를 "데이터"로 두지 않고 "정렬 규칙"으로 생성
 * 각 포메이션은 규칙으로 정의되고, 실행 시점에 좌표가 계산됨
 */

import type {
  AlignmentSpec,
  DepthType,
  AnchorType,
} from './alignmentSpecs';
import {
  YARD,
  OL_GAP,
  CENTER_X,
  LOS_Y,
  OL_POSITIONS,
  TE_POSITIONS,
  DEPTH_MAP,
  ANCHOR_X_MAP,
  generateCoordinates,
} from './alignmentSpecs';
import type { FormationPlayer, Formation } from '@/store/formations';
import type { PlayerShape } from '@/types/dsl';

// ============================================
// Types
// ============================================

export type SnapType = 'under_center' | 'shotgun' | 'pistol';

export type StrengthSide = 'left' | 'right' | 'balanced';

/** Personnel grouping (first digit = RB, second digit = TE) */
export type Personnel = '10' | '11' | '12' | '21' | '22' | '13' | '20' | '00';

export interface PlayerRule {
  /** Player role (C, LG, RG, LT, RT, TE, WR, QB, RB, FB, BALL) */
  role: string;
  /** Display label (X, Y, Z, H, U, etc.) */
  label: string;
  /** Alignment specification - defines how to calculate position */
  spec: AlignmentSpec;
  /** Optional appearance override */
  appearance?: {
    shape?: PlayerShape;
    fill?: string;
    stroke?: string;
    showLabel?: boolean;
    radius?: number;
  };
}

export interface FormationRule {
  /** Unique identifier (matches formation key) */
  id: string;
  /** Display name */
  name: string;
  /** Personnel grouping */
  personnel: Personnel;
  /** Formation tags for filtering */
  tags: string[];
  /** QB snap type */
  snapType: SnapType;
  /** Strength side of formation */
  strength: StrengthSide;
  /** Player positioning rules */
  playerRules: PlayerRule[];
}

// ============================================
// Constants
// ============================================

const BALL_APPEARANCE = {
  shape: 'football' as PlayerShape,
  fill: '#8B4513',
  stroke: '#ffffff',
  showLabel: false,
  radius: 10,
};

// Pre-defined alignment specs for common positions
const SPECS = {
  // Ball
  BALL: { anchor: 'C' as AnchorType, offsetYards: 0, depth: 0 as DepthType },

  // O-Line (always on LOS)
  C: { anchor: 'C' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  LG: { anchor: 'LG' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  RG: { anchor: 'RG' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  LT: { anchor: 'LT' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  RT: { anchor: 'RT' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },

  // TE (MUST be anchored to tackles)
  TE_L: { anchor: 'LT' as AnchorType, offsetYards: -1, depth: 'LOS' as DepthType, onLOS: true },
  TE_R: { anchor: 'RT' as AnchorType, offsetYards: 1, depth: 'LOS' as DepthType, onLOS: true },

  // Wide Receivers (on LOS)
  X_OUTSIDE_L: { anchor: 'SIDELINE_L' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  Z_OUTSIDE_R: { anchor: 'SIDELINE_R' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  X_SPLIT_L: { anchor: 'NUMBERS_L' as AnchorType, offsetYards: -1, depth: 'LOS' as DepthType, onLOS: true },
  Z_SPLIT_R: { anchor: 'NUMBERS_R' as AnchorType, offsetYards: 1, depth: 'LOS' as DepthType, onLOS: true },

  // Slot Receivers (off LOS)
  H_SLOT_L: { anchor: 'NUMBERS_L' as AnchorType, offsetYards: 0, depth: 'SLOT' as DepthType, onLOS: false },
  H_SLOT_R: { anchor: 'NUMBERS_R' as AnchorType, offsetYards: 0, depth: 'SLOT' as DepthType, onLOS: false },
  Y_SLOT_L: { anchor: 'NUMBERS_L' as AnchorType, offsetYards: 2, depth: 'SLOT' as DepthType, onLOS: false },
  Y_SLOT_R: { anchor: 'NUMBERS_R' as AnchorType, offsetYards: -2, depth: 'SLOT' as DepthType, onLOS: false },

  // Backfield
  QB_UC: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: 'QB_UC' as DepthType },
  QB_PISTOL: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: 'QB_PISTOL' as DepthType },
  QB_GUN: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: 'QB_GUN' as DepthType },
  RB_GUN_L: { anchor: 'LG' as AnchorType, offsetYards: 0, depth: 'RB_GUN' as DepthType },
  RB_GUN_R: { anchor: 'RG' as AnchorType, offsetYards: 0, depth: 'RB_GUN' as DepthType },
  RB_I: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: 'TB' as DepthType },
  RB_PISTOL: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: -4.5 as DepthType }, // -0.18
  FB_CENTER: { anchor: 'CENTER' as AnchorType, offsetYards: 0, depth: 'FB' as DepthType },
  FB_OFFSET_L: { anchor: 'LG' as AnchorType, offsetYards: 0, depth: 'FB' as DepthType },
  FB_OFFSET_R: { anchor: 'RG' as AnchorType, offsetYards: 0, depth: 'FB' as DepthType },
  FB_OFFSET_STRONG: { anchor: 'RG' as AnchorType, offsetYards: 1, depth: 'FB' as DepthType },

  // Inside Slot (tighter than normal slot)
  INSIDE_SLOT_R: { anchor: 'RT' as AnchorType, offsetYards: 4, depth: 'SLOT' as DepthType, onLOS: false },
  INSIDE_SLOT_L: { anchor: 'LT' as AnchorType, offsetYards: -4, depth: 'SLOT' as DepthType, onLOS: false },

  // Bunch positions (right side)
  POINT_R: { anchor: 'HASH_R' as AnchorType, offsetYards: 2, depth: 'LOS' as DepthType, onLOS: true },
  INSIDE_BUNCH_R: { anchor: 'HASH_R' as AnchorType, offsetYards: 3, depth: -2 as DepthType, onLOS: false },
  OUTSIDE_BUNCH_R: { anchor: 'HASH_R' as AnchorType, offsetYards: 4, depth: 'LOS' as DepthType, onLOS: true },

  // Stack positions (left side)
  STACK_FRONT_L: { anchor: 'NUMBERS_L' as AnchorType, offsetYards: 0, depth: 'LOS' as DepthType, onLOS: true },
  STACK_BACK_L: { anchor: 'NUMBERS_L' as AnchorType, offsetYards: 0, depth: 'SLOT' as DepthType, onLOS: false },
};

// ============================================
// Formation Rules Definitions
// ============================================

export const FORMATION_RULES: Record<string, FormationRule> = {
  // ===== TIER 1: Core Formations =====

  spread_2x2: {
    id: 'spread_2x2',
    name: 'Spread 2x2',
    personnel: '10',
    tags: ['spread', 'shotgun', '2x2', 'empty_box'],
    snapType: 'shotgun',
    strength: 'balanced',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'WR', label: 'X', spec: SPECS.X_OUTSIDE_L },
      { role: 'WR', label: 'H', spec: SPECS.H_SLOT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'RB', label: 'RB', spec: SPECS.RB_GUN_R },
      { role: 'WR', label: 'Y', spec: SPECS.H_SLOT_R },
      { role: 'WR', label: 'Z', spec: SPECS.Z_OUTSIDE_R },
    ],
  },

  trips_rt: {
    id: 'trips_rt',
    name: 'Trips Right',
    personnel: '10',
    tags: ['spread', 'shotgun', 'trips', '3x1'],
    snapType: 'shotgun',
    strength: 'right',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'WR', label: 'X', spec: SPECS.X_OUTSIDE_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'RB', label: 'RB', spec: SPECS.RB_GUN_L },
      { role: 'WR', label: 'H', spec: { anchor: 'NUMBERS_R', offsetYards: -4, depth: 'SLOT', onLOS: false } },
      { role: 'WR', label: 'Y', spec: { anchor: 'NUMBERS_R', offsetYards: 0, depth: 'LOS', onLOS: true } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_OUTSIDE_R },
    ],
  },

  i_formation: {
    id: 'i_formation',
    name: 'I-Formation',
    personnel: '21',
    tags: ['pro', 'under_center', 'power', 'run_heavy'],
    snapType: 'under_center',
    strength: 'left', // TE on left
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_L },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_UC },
      { role: 'FB', label: 'FB', spec: SPECS.FB_CENTER },
      { role: 'RB', label: 'RB', spec: SPECS.RB_I },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  singleback: {
    id: 'singleback',
    name: 'Singleback',
    personnel: '11',
    tags: ['pro', 'balanced', 'versatile'],
    snapType: 'under_center',
    strength: 'left', // TE on left
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_L },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_UC },
      { role: 'RB', label: 'RB', spec: { anchor: 'CENTER', offsetYards: 0, depth: 'QB_GUN' } },
      { role: 'WR', label: 'H', spec: { anchor: 'RT', offsetYards: 1, depth: 'SLOT', onLOS: false } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  shotgun_11: {
    id: 'shotgun_11',
    name: 'Shotgun 11',
    personnel: '11',
    tags: ['spread', 'shotgun', 'balanced'],
    snapType: 'shotgun',
    strength: 'right', // TE on right
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_R },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'WR', label: 'H', spec: SPECS.H_SLOT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'RB', label: 'RB', spec: SPECS.RB_GUN_L },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  pistol: {
    id: 'pistol',
    name: 'Pistol',
    personnel: '11',
    tags: ['pistol', 'zone_read', 'rpo'],
    snapType: 'pistol',
    strength: 'balanced',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'WR', label: 'H', spec: SPECS.H_SLOT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_PISTOL },
      { role: 'RB', label: 'RB', spec: SPECS.RB_PISTOL },
      { role: 'WR', label: 'Y', spec: { anchor: 'NUMBERS_R', offsetYards: 0, depth: 'LOS', onLOS: true } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  // ===== TIER 2: Extended Formations =====

  bunch_rt: {
    id: 'bunch_rt',
    name: 'Bunch Right',
    personnel: '11',
    tags: ['spread', 'bunch', 'rub_routes'],
    snapType: 'shotgun',
    strength: 'right',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'WR', label: 'X', spec: SPECS.X_OUTSIDE_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'RB', label: 'RB', spec: SPECS.RB_GUN_L },
      { role: 'TE', label: 'Y', spec: { anchor: 'HASH_R', offsetYards: 3, depth: 'LOS', onLOS: true } },
      { role: 'WR', label: 'H', spec: { anchor: 'HASH_R', offsetYards: 4, depth: -2, onLOS: false } },
      { role: 'WR', label: 'Z', spec: { anchor: 'HASH_R', offsetYards: 5, depth: 'LOS', onLOS: true } },
    ],
  },

  twins_rt: {
    id: 'twins_rt',
    name: 'Twins Right',
    personnel: '11',
    tags: ['spread', 'twins', '2x1'],
    snapType: 'shotgun',
    strength: 'right',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_R },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'RB', label: 'RB', spec: SPECS.RB_GUN_L },
      { role: 'WR', label: 'H', spec: { anchor: 'NUMBERS_R', offsetYards: -2, depth: 'SLOT', onLOS: false } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  pro_set: {
    id: 'pro_set',
    name: 'Pro Set',
    personnel: '21',
    tags: ['pro', 'under_center', 'balanced'],
    snapType: 'under_center',
    strength: 'left',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_L },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_UC },
      { role: 'RB', label: 'RB', spec: SPECS.FB_OFFSET_L },
      { role: 'FB', label: 'FB', spec: SPECS.FB_OFFSET_R },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  ace_12: {
    id: 'ace_12',
    name: 'Ace (12 Personnel)',
    personnel: '12',
    tags: ['pro', '12_personnel', 'balanced'],
    snapType: 'under_center',
    strength: 'balanced', // TE on both sides
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_L },
      { role: 'TE', label: 'U', spec: SPECS.TE_R },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_UC },
      { role: 'RB', label: 'RB', spec: { anchor: 'CENTER', offsetYards: 0, depth: 'QB_GUN' } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },

  empty_3x2: {
    id: 'empty_3x2',
    name: 'Empty 3x2',
    personnel: '10',
    tags: ['spread', 'empty', '5_wide'],
    snapType: 'shotgun',
    strength: 'left',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'WR', label: 'X', spec: SPECS.X_OUTSIDE_L },
      { role: 'WR', label: 'H', spec: SPECS.H_SLOT_L },
      { role: 'WR', label: 'A', spec: { anchor: 'NUMBERS_L', offsetYards: 3, depth: 'LOS', onLOS: true } },
      { role: 'QB', label: 'QB', spec: SPECS.QB_GUN },
      { role: 'WR', label: 'Y', spec: SPECS.H_SLOT_R },
      { role: 'WR', label: 'Z', spec: SPECS.Z_OUTSIDE_R },
    ],
  },

  goal_line: {
    id: 'goal_line',
    name: 'Goal Line',
    personnel: '22',
    tags: ['goal_line', 'power', 'short_yardage'],
    snapType: 'under_center',
    strength: 'balanced',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_L },
      { role: 'TE', label: 'U', spec: SPECS.TE_R },
      { role: 'QB', label: 'QB', spec: SPECS.QB_UC },
      { role: 'FB', label: 'FB', spec: { anchor: 'CENTER', offsetYards: 0, depth: -2.75 } },
      { role: 'RB', label: 'RB', spec: { anchor: 'CENTER', offsetYards: 0, depth: -4.25 } },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
    ],
  },

  pistol_ace: {
    id: 'pistol_ace',
    name: 'Pistol Ace',
    personnel: '12',
    tags: ['pistol', 'power', 'duo', 'play_action'],
    snapType: 'pistol',
    strength: 'balanced',
    playerRules: [
      { role: 'BALL', label: '', spec: SPECS.BALL, appearance: BALL_APPEARANCE },
      { role: 'C', label: 'C', spec: SPECS.C },
      { role: 'LG', label: 'LG', spec: SPECS.LG },
      { role: 'RG', label: 'RG', spec: SPECS.RG },
      { role: 'LT', label: 'LT', spec: SPECS.LT },
      { role: 'RT', label: 'RT', spec: SPECS.RT },
      { role: 'TE', label: 'Y', spec: SPECS.TE_R },
      { role: 'TE', label: 'H', spec: SPECS.TE_L },
      { role: 'WR', label: 'X', spec: SPECS.X_SPLIT_L },
      { role: 'QB', label: 'QB', spec: SPECS.QB_PISTOL },
      { role: 'RB', label: 'RB', spec: { anchor: 'CENTER', offsetYards: 0, depth: -4.5 } },
      { role: 'WR', label: 'Z', spec: SPECS.Z_SPLIT_R },
    ],
  },
};

// ============================================
// Formation Generator
// ============================================

/**
 * Generate a Formation from a FormationRule
 * Calculates all player coordinates from alignment specs
 */
export function generateFormationFromRule(rule: FormationRule): Formation {
  const players: FormationPlayer[] = rule.playerRules.map((pr) => {
    const coords = generateCoordinates(pr.spec);
    return {
      role: pr.role,
      label: pr.label,
      x: coords.x,
      y: coords.y,
      appearance: pr.appearance,
    };
  });

  return {
    name: rule.name,
    players,
    tags: rule.tags,
    personnel: rule.personnel,
  };
}

/**
 * Get formation by key, preferring rule-based generation
 */
export function getFormationFromRule(key: string): Formation | undefined {
  const rule = FORMATION_RULES[key];
  if (rule) {
    return generateFormationFromRule(rule);
  }
  return undefined;
}

/**
 * Get all formation rules as a list
 */
export function getAllFormationRules(): FormationRule[] {
  return Object.values(FORMATION_RULES);
}

/**
 * Get formation rules by snap type
 */
export function getFormationRulesBySnapType(snapType: SnapType): FormationRule[] {
  return getAllFormationRules().filter((r) => r.snapType === snapType);
}

/**
 * Get formation rules by tag
 */
export function getFormationRulesByTag(tag: string): FormationRule[] {
  return getAllFormationRules().filter((r) => r.tags.includes(tag));
}

/**
 * Get formation rules by personnel
 */
export function getFormationRulesByPersonnel(personnel: Personnel): FormationRule[] {
  return getAllFormationRules().filter((r) => r.personnel === personnel);
}

// ============================================
// Exports
// ============================================

export { SPECS };
