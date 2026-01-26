// pass-concepts.audit3.ts
// PASS Precision Audit – Core 20 Concepts (Audit3)
// 구성: 기존 10개(Audit2) + 신규 10개 확장
// 기준: 현대 NCAA/NFL 표준 루트 조합, depth 현실성, progression 논리

import { PassConcept } from './types';

export const PASS_CONCEPTS_AUDIT3: PassConcept[] = [
  /* =========================
   * 기존 10개 (Audit2)
   * ========================= */
  {
    id: 'spacing',
    name: 'Spacing',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'Z', 'H', 'RB'],
    summary: 'Spot concept attacking hook/curl defenders with spacing at ~5 yards.',
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
    summary: 'Double-out family: corner + out to overload the flat defender.',
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
    summary: 'In-breakers at multiple depths to high-low linebackers.',
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
    summary: '3-level flood: clear + corner + flat (sideline stress).',
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
    summary: 'Post paired with deep dig to stress MOF safety.',
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
    summary: 'Classic PA shot: deep post over deep over/dig.',
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
    summary: 'RB angle route isolating a linebacker (man beater).',
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
    summary: 'Pivot/whip option route (best vs man leverage).',
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
    summary: 'Shallow with backside dig (horizontal stretch).',
    routes: {
      H: { type: 'cross', depth: 3 },
      X: { type: 'dig', depth: 12 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Shallow (H) → Dig (X)',
  },

  /* =========================
   * 신규 10개 (Audit3 확장)
   * ========================= */

  {
    id: 'stick',
    name: 'Stick',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['Y', 'H', 'RB', 'X', 'Z'],
    summary: 'Stick concept: stick + flat with an outside clear (quick hi/low).',
    routes: {
      Y: { type: 'stick', depth: 5 }, // stick는 spot/option류지만 명칭 유지
      H: { type: 'flat', depth: 2 },
      X: { type: 'go', depth: 18 },
      RB: { type: 'check', depth: 3 },
    },
    progression: 'Stick (Y) → Flat (H) → Check (RB)',
  },

  {
    id: 'double_slants',
    name: 'Double Slants',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Z'],
    summary: 'Two slants to punish off coverage and inside leverage.',
    routes: {
      X: { type: 'slant', depth: 3 },
      Z: { type: 'slant', depth: 3 },
    },
    progression: 'Best leverage slant → backside slant',
  },

  {
    id: 'all_curls',
    name: 'All Curls',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'All curls with flat control (simple zone beater).',
    routes: {
      X: { type: 'curl', depth: 8 },
      H: { type: 'curl', depth: 8 },
      Y: { type: 'curl', depth: 8 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Middle curl → Outside curl → Checkdown',
  },

  {
    id: 'hitch_seam',
    name: 'Hitch / Seam',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'Y', 'RB'],
    summary: 'Hitch with seam to stress flat defender and hook safety window.',
    routes: {
      X: { type: 'hitch', depth: 5 },
      Y: { type: 'seam', depth: 14 },
      RB: { type: 'check', depth: 3 },
    },
    progression: 'Seam (Y) vs MOF leverage → Hitch (X) → Check (RB)',
  },

  {
    id: 'china',
    name: 'China (Corner + Pivot)',
    family: 'quick-game',
    dropType: '3_step',
    appliesTo: ['X', 'H', 'Z'],
    summary: 'China: corner route paired with pivot/under to beat man and trap-zone.',
    routes: {
      X: { type: 'corner', depth: 12 },
      H: { type: 'pivot', depth: 5 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Corner (X) → Pivot (H)',
  },

  {
    id: 'four_verts',
    name: 'Four Verts',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'Y', 'Z', 'H'],
    summary: 'Vertical stress: 4 verticals with seam read vs safeties.',
    routes: {
      X: { type: 'go', depth: 20 },
      H: { type: 'seam', depth: 16 },
      Y: { type: 'seam', depth: 16 },
      Z: { type: 'go', depth: 20 },
    },
    progression: 'Seam read (H/Y) → Outside go vs leverage',
  },

  {
    id: 'mills',
    name: 'Mills (Post-Dig)',
    family: 'dropback',
    dropType: '7_step',
    appliesTo: ['X', 'Z', 'Y'],
    summary: 'Mills: post + dig to stress MOF safety (shot concept).',
    routes: {
      Z: { type: 'post', depth: 20 },
      X: { type: 'dig', depth: 15 },
      Y: { type: 'check', depth: 3 },
    },
    progression: 'Post (Z) vs safety → Dig (X)',
  },

  {
    id: 'drive',
    name: 'Drive',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'H', 'Y', 'Z'],
    summary: 'Drive: shallow cross + dig (classic horizontal + intermediate).',
    routes: {
      H: { type: 'cross', depth: 3 },
      X: { type: 'dig', depth: 12 },
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Shallow (H) → Dig (X)',
  },

  {
    id: 'mesh',
    name: 'Mesh',
    family: 'dropback',
    dropType: '5_step',
    appliesTo: ['X', 'Z', 'H', 'Y'],
    summary: 'Mesh: two shallow crossers (rub) with sit/dig as alert.',
    routes: {
      H: { type: 'cross', depth: 3 },
      Y: { type: 'cross', depth: 3 },
      X: { type: 'curl', depth: 8 }, // sit window
      Z: { type: 'go', depth: 18 },
    },
    progression: 'Front cross → Back cross → Sit (X)',
  },

  {
    id: 'y_cross',
    name: 'Y-Cross',
    family: 'dropback',
    dropType: '7_step',
    appliesTo: ['Y', 'X', 'Z', 'RB'],
    summary: 'Y-Cross: deep cross with clear-out and backside post/dig options.',
    routes: {
      Y: { type: 'cross', depth: 12 }, // deep cross landmark
      X: { type: 'go', depth: 18 },    // clear
      Z: { type: 'post', depth: 18 },  // backside shot
      RB: { type: 'check', depth: 3 },
    },
    progression: 'Cross (Y) → Post (Z) → Check (RB)',
  },
];

export default PASS_CONCEPTS_AUDIT3;
