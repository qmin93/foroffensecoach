/**
 * Formation Type Definitions
 *
 * Defines types for formation presets using symbolic position names
 * that map to AlignmentSpecs for coordinate generation
 */

import type { PlayerShape } from './dsl';

/**
 * QB position types (snap type)
 */
export type QBPositionKey = 'under_center' | 'shotgun' | 'pistol';

/**
 * Backfield position types
 */
export type BackfieldPositionKey =
  | 'i_depth'         // I-Formation TB (y: -0.19)
  | 'deep_i'          // Same as i_depth
  | 'pistol_depth'    // Behind pistol QB (y: -0.18)
  | 'offset_weak'     // Offset to weak side (typically left)
  | 'offset_strong'   // Offset to strong side (typically right)
  | 'fb_center'       // FB in front of RB
  | 'fb_offset_left'  // FB offset left
  | 'fb_offset_right'; // FB offset right

/**
 * Wide receiver position types
 */
export type ReceiverPositionKey =
  | 'wide_left'         // Outside left (x: 0.05)
  | 'wide_right'        // Outside right (x: 0.95)
  | 'split_left'        // Split left (x: 0.10)
  | 'split_right'       // Split right (x: 0.90)
  | 'slot_left'         // Slot left (x: 0.15, y: -0.05)
  | 'slot_right'        // Slot right (x: 0.85, y: -0.05)
  | 'inside_slot_left'  // Inside slot left (closer to formation)
  | 'inside_slot_right'; // Inside slot right

/**
 * Tight End position types
 */
export type TEPositionKey =
  | 'inline_left'   // Inline TE left (x: 0.38)
  | 'inline_right'  // Inline TE right (x: 0.62)
  | 'flexed_left'   // Flexed out from tackle
  | 'flexed_right';

/**
 * Bunch/Stack specialty positions
 */
export type SpecialPositionKey =
  | 'point'           // Bunch point man
  | 'inside_bunch'    // Inside bunch receiver
  | 'outside_bunch'   // Outside bunch receiver
  | 'stack_front_left'  // Stack front (on LOS)
  | 'stack_back_left'   // Stack back (off LOS)
  | 'stack_front_right'
  | 'stack_back_right'
  | 'slot_left_inside'; // RB as slot in empty

/**
 * All position keys combined
 */
export type PositionKey =
  | QBPositionKey
  | BackfieldPositionKey
  | ReceiverPositionKey
  | TEPositionKey
  | SpecialPositionKey;

/**
 * Structure type for formation categorization
 */
export type FormationStructure = 'under_center' | 'shotgun' | 'pistol';

/**
 * Personnel grouping (first digit = RB, second digit = TE)
 * e.g., "11" = 1 RB, 1 TE, 3 WR
 */
export type PersonnelGrouping = '00' | '10' | '11' | '12' | '13' | '20' | '21' | '22';

/**
 * Formation preset using symbolic position names
 * Positions are resolved to coordinates at runtime
 */
export interface FormationPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Formation structure (QB snap type) */
  structure: FormationStructure;
  /** Personnel grouping */
  personnel: PersonnelGrouping;
  /** Tags for filtering/matching */
  tags: string[];
  /** Position assignments by role label */
  positions: {
    QB: QBPositionKey;
    RB?: BackfieldPositionKey | ReceiverPositionKey;
    FB?: BackfieldPositionKey;
    X?: ReceiverPositionKey | SpecialPositionKey;
    Y?: ReceiverPositionKey | TEPositionKey | SpecialPositionKey;
    Z?: ReceiverPositionKey | SpecialPositionKey;
    H?: ReceiverPositionKey | SpecialPositionKey;
  };
}

/**
 * Resolved formation player with coordinates
 */
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

/**
 * Resolved formation with player coordinates
 */
export interface Formation {
  name: string;
  players: FormationPlayer[];
  tags?: string[];
  personnel?: string;
}

/**
 * Position key to coordinate mapping
 * Used to resolve symbolic positions to actual coordinates
 */
export const POSITION_COORDINATES: Record<PositionKey, { x: number; y: number }> = {
  // QB positions
  under_center: { x: 0.5, y: -0.09 },
  shotgun: { x: 0.5, y: -0.15 },
  pistol: { x: 0.5, y: -0.10 },

  // Backfield positions
  i_depth: { x: 0.5, y: -0.19 },
  deep_i: { x: 0.5, y: -0.19 },
  pistol_depth: { x: 0.5, y: -0.18 },
  offset_weak: { x: 0.46, y: -0.15 },
  offset_strong: { x: 0.54, y: -0.15 },
  fb_center: { x: 0.5, y: -0.13 },
  fb_offset_left: { x: 0.46, y: -0.13 },
  fb_offset_right: { x: 0.54, y: -0.13 },

  // Wide receiver positions
  wide_left: { x: 0.05, y: -0.03 },
  wide_right: { x: 0.95, y: -0.03 },
  split_left: { x: 0.10, y: -0.03 },
  split_right: { x: 0.90, y: -0.03 },
  slot_left: { x: 0.15, y: -0.05 },
  slot_right: { x: 0.85, y: -0.05 },
  inside_slot_left: { x: 0.22, y: -0.05 },
  inside_slot_right: { x: 0.78, y: -0.05 },

  // TE positions
  inline_left: { x: 0.38, y: -0.03 },
  inline_right: { x: 0.62, y: -0.03 },
  flexed_left: { x: 0.30, y: -0.03 },
  flexed_right: { x: 0.70, y: -0.03 },

  // Bunch/Stack specialty positions
  point: { x: 0.75, y: -0.03 },
  inside_bunch: { x: 0.78, y: -0.08 },
  outside_bunch: { x: 0.82, y: -0.03 },
  stack_front_left: { x: 0.15, y: -0.03 },
  stack_back_left: { x: 0.15, y: -0.09 },
  stack_front_right: { x: 0.85, y: -0.03 },
  stack_back_right: { x: 0.85, y: -0.09 },
  slot_left_inside: { x: 0.25, y: -0.05 },
};

/**
 * Resolve a position key to coordinates
 */
export function resolvePosition(key: PositionKey): { x: number; y: number } {
  return POSITION_COORDINATES[key] || { x: 0.5, y: -0.15 };
}
