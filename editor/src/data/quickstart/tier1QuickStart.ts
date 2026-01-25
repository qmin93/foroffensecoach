/**
 * Tier-1 Quick Start Definitions
 *
 * Quick start items reference blueprints by ID.
 * This provides a curated list for the Quick Start modal.
 */

export interface QuickStartItem {
  id: string;
  blueprintId: string;
  name: string;
  description: string;
  category: 'run' | 'pass';
  tags: string[];
  thumbnail?: string;  // Optional thumbnail path
}

// ===== RUN PLAYS =====
export const QUICKSTART_RUN: QuickStartItem[] = [
  {
    id: 'qs_inside_zone',
    blueprintId: 'run_inside_zone',
    name: 'Inside Zone',
    description: 'Zone blocking scheme, read playside A-gap',
    category: 'run',
    tags: ['zone', 'base'],
  },
  {
    id: 'qs_outside_zone',
    blueprintId: 'run_outside_zone',
    name: 'Outside Zone',
    description: 'Stretch play, press the edge and cut back',
    category: 'run',
    tags: ['zone', 'perimeter'],
  },
  {
    id: 'qs_power',
    blueprintId: 'run_power',
    name: 'Power',
    description: 'Gap scheme with pulling guard and lead blocker',
    category: 'run',
    tags: ['gap', 'power'],
  },
  {
    id: 'qs_counter',
    blueprintId: 'run_counter',
    name: 'Counter',
    description: 'Misdirection with double pull',
    category: 'run',
    tags: ['gap', 'misdirection'],
  },
  {
    id: 'qs_draw',
    blueprintId: 'run_draw',
    name: 'Draw',
    description: 'Delayed handoff with pass action',
    category: 'run',
    tags: ['draw', 'changeup'],
  },
];

// ===== PASS PLAYS =====
export const QUICKSTART_PASS: QuickStartItem[] = [
  {
    id: 'qs_slant_flat',
    blueprintId: 'pass_slant_flat',
    name: 'Slant-Flat',
    description: 'Quick game high-low concept',
    category: 'pass',
    tags: ['quick', 'rhythm'],
  },
  {
    id: 'qs_four_verts',
    blueprintId: 'pass_four_verts',
    name: 'Four Verticals',
    description: 'Deep shot play, stretch the safeties',
    category: 'pass',
    tags: ['deep', 'shot'],
  },
  {
    id: 'qs_mesh',
    blueprintId: 'pass_mesh',
    name: 'Mesh',
    description: 'Crossing routes create natural picks vs man',
    category: 'pass',
    tags: ['man_beater', 'crossing'],
  },
  {
    id: 'qs_smash',
    blueprintId: 'pass_smash',
    name: 'Smash',
    description: 'Hitch-corner to beat cover 2',
    category: 'pass',
    tags: ['cover2_beater', 'high_low'],
  },
  {
    id: 'qs_dagger',
    blueprintId: 'pass_dagger',
    name: 'Dagger',
    description: 'Seam-dig combo to attack cover 3',
    category: 'pass',
    tags: ['cover3_beater', 'hole_shot'],
  },
];

// Combined list
export const ALL_QUICKSTART_ITEMS: QuickStartItem[] = [
  ...QUICKSTART_RUN,
  ...QUICKSTART_PASS,
];

// Helper to get quick start by ID
export function getQuickStartById(id: string): QuickStartItem | undefined {
  return ALL_QUICKSTART_ITEMS.find(item => item.id === id);
}

// Helper to get quick starts by category
export function getQuickStartsByCategory(category: 'run' | 'pass'): QuickStartItem[] {
  return ALL_QUICKSTART_ITEMS.filter(item => item.category === category);
}

// Quick start categories for UI
export const QUICKSTART_CATEGORIES = {
  'Run Plays': QUICKSTART_RUN,
  'Pass Plays': QUICKSTART_PASS,
};
