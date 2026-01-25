/**
 * Formation Presets – Audit Version (Cleaned)
 * 기준: Modern NCAA / NFL
 *
 * 라벨 표준:
 * QB, RB, FB, X, Z, Y(TE), H(H-back/slot), LT, LG, C, RG, RT
 *
 * NOTE: This file uses symbolic position names that map to
 * editor/src/types/formation.ts PositionKey type
 */

import type { FormationPreset } from '@/types/formation';

export const FORMATION_PRESETS_AUDIT: FormationPreset[] = [
  /* =========================
   * UNDER CENTER
   * ========================= */
  {
    id: 'under_ace',
    name: 'Ace (Under)',
    structure: 'under_center',
    personnel: '12',
    tags: ['balanced', 'play_action', 'power', 'zone'],
    positions: {
      QB: 'under_center',
      RB: 'i_depth',
      X: 'wide_left',
      Z: 'wide_right',
      Y: 'inline_right',
      H: 'inline_left',
    },
  },

  {
    id: 'under_i',
    name: 'I-Formation',
    structure: 'under_center',
    personnel: '21',
    tags: ['downhill', 'power', 'iso'],
    positions: {
      QB: 'under_center',
      RB: 'deep_i',
      // FB: 'offset_strong' - FB not in positions type, use RB
      X: 'wide_left',
      Z: 'wide_right',
      Y: 'inline_right',
    },
  },

  /* =========================
   * SHOTGUN — CORE
   * ========================= */
  {
    id: 'gun_2x2',
    name: 'Shotgun 2x2',
    structure: 'shotgun',
    personnel: '11',
    tags: ['spread', 'quick_game', 'zone', 'rpo'],
    positions: {
      QB: 'shotgun',
      RB: 'offset_weak',
      X: 'wide_left',
      H: 'slot_left',
      Z: 'wide_right',
      Y: 'slot_right',
    },
  },

  {
    id: 'gun_3x1',
    name: 'Shotgun 3x1 (Trips)',
    structure: 'shotgun',
    personnel: '11',
    tags: ['spread', 'isolation', 'flood', 'trips', '3x1'],
    positions: {
      QB: 'shotgun',
      RB: 'offset_weak',
      X: 'wide_left',
      Z: 'wide_right',
      Y: 'slot_right',
      H: 'inside_slot_right',
    },
  },

  // NOTE: gun_trips_open removed - was duplicate of gun_3x1

  {
    id: 'gun_bunch',
    name: 'Shotgun Bunch',
    structure: 'shotgun',
    personnel: '11',
    tags: ['pick', 'rub', 'quick_game', 'bunch'],
    positions: {
      QB: 'shotgun',
      RB: 'offset_weak',
      X: 'point',
      H: 'inside_bunch',
      Z: 'outside_bunch',
      Y: 'inline_left',
    },
  },

  {
    id: 'gun_stack',
    name: 'Shotgun Stack',
    structure: 'shotgun',
    personnel: '11',
    tags: ['release', 'man_beater', 'stack'],
    positions: {
      QB: 'shotgun',
      RB: 'offset_weak',
      X: 'stack_front_left',
      H: 'stack_back_left',
      Z: 'wide_right',
      Y: 'inline_right',
    },
  },

  /* =========================
   * PISTOL
   * ========================= */
  {
    id: 'pistol_2x2',
    name: 'Pistol 2x2',
    structure: 'pistol',
    personnel: '11',
    tags: ['downhill', 'zone', 'play_action', 'rpo'],
    positions: {
      QB: 'pistol',
      RB: 'pistol_depth',
      X: 'wide_left',
      H: 'slot_left',
      Z: 'wide_right',
      Y: 'slot_right',
    },
  },

  {
    id: 'pistol_ace',
    name: 'Pistol Ace',
    structure: 'pistol',
    personnel: '12',
    tags: ['power', 'duo', 'play_action'],
    positions: {
      QB: 'pistol',
      RB: 'pistol_depth',
      X: 'wide_left',
      Z: 'wide_right',
      Y: 'inline_right',
      H: 'inline_left',
    },
  },

  /* =========================
   * EMPTY
   * ========================= */
  {
    id: 'empty_3x2',
    name: 'Empty 3x2',
    structure: 'shotgun',
    personnel: '10',
    tags: ['quick_game', 'spread', 'qb_run_alert', 'empty'],
    positions: {
      QB: 'shotgun',
      X: 'wide_left',
      H: 'slot_left',
      Z: 'wide_right',
      Y: 'slot_right',
      RB: 'slot_left_inside',
    },
  },

  {
    id: 'empty_trips',
    name: 'Empty Trips',
    structure: 'shotgun',
    personnel: '10',
    tags: ['isolation', 'qb_draw', 'empty', 'trips'],
    positions: {
      QB: 'shotgun',
      X: 'wide_left',
      Z: 'wide_right',
      Y: 'slot_right',
      H: 'inside_slot_right',
      // Note: 5th receiver would need additional position
    },
  },
];

export default FORMATION_PRESETS_AUDIT;
