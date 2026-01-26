/**
 * ASSIGNMENT AUTO-GENERATION ENGINE (v1)
 *
 * 목표: Formation + Concept 선택 시 모든 포지션 Assignment를 자동 생성
 * 규칙: ASSIGNMENT_RULEBOOK.v1을 절대 규칙으로 사용
 */

// ============================================
// TYPES
// ============================================

export type Direction = 'left' | 'right';

export interface EngineInput {
  formationId: string;
  conceptId: string;
  direction: Direction;
  tags?: string[]; // motion, playAction, rpo 등
}

export interface Assignment {
  role: string;
  action: string;
  notes?: string;
}

export interface EngineOutput {
  status: 'VALID' | 'INVALID';
  reason?: string;
  assignments?: Record<string, Assignment[]>;
}

// ============================================
// FORMATION RULES
// ============================================

export const FORMATION_RULES: Record<
  string,
  {
    OL: string[];
    eligible: string[];
  }
> = {
  'shotgun-2x2': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  'shotgun-trips': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  'shotgun-bunch': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  ace: {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Z', 'Y', 'TE', 'RB'],
  },
  'i-formation': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Z', 'TE', 'FB', 'RB'],
  },
  'gun-trips-y-off': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  'tight-trips': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  'ace-wing': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Z', 'TE', 'H', 'RB'],
  },
  'pistol-strong-slot': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'RB'],
  },
  'empty-qb-safe': {
    OL: ['LT', 'LG', 'C', 'RG', 'RT'],
    eligible: ['X', 'Y', 'Z', 'H', 'A'],
  },
};

// ============================================
// RUN CONCEPT RULES
// ============================================

interface RunConceptRule {
  scheme: 'zone' | 'gap' | 'perimeter';
  aim: string;
  needsPuller: boolean | string;
  generate: (dir: Direction) => Record<string, Assignment[]>;
}

export const RUN_CONCEPT_RULES: Record<string, RunConceptRule> = {
  run_inside_zone: {
    scheme: 'zone',
    aim: 'a_gap',
    needsPuller: false,
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside T/G', action: 'Zone step to play-side gap' },
        { role: 'Center', action: 'Combo to backside LB' },
        { role: 'Backside OL', action: 'Cutoff backside gap' },
      ],
      RB: [{ role: 'RB', action: `Press ${dir} A-gap, read 1st DL past C`, notes: 'Bounce/Bang/Bend' }],
      QB: [{ role: 'QB', action: 'Mesh and boot fake' }],
      WR: [{ role: 'Playside WR', action: 'Stalk block' }, { role: 'Backside WR', action: 'Cutoff' }],
    }),
  },

  run_duo: {
    scheme: 'zone',
    aim: 'b_gap',
    needsPuller: false,
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside T/G', action: 'Double team to LB' },
        { role: 'Center', action: 'Double team with backside G' },
        { role: 'Backside OL', action: 'Reach/Cutoff' },
      ],
      RB: [{ role: 'RB', action: `Press ${dir} B-gap, vertical track`, notes: 'Power without a puller' }],
      QB: [{ role: 'QB', action: 'Mesh handoff' }],
      WR: [{ role: 'All WR', action: 'Stalk block' }],
    }),
  },

  run_power: {
    scheme: 'gap',
    aim: 'b_gap',
    needsPuller: 'G',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside OL', action: 'Down block inside gap' },
        { role: 'Backside Guard', action: 'Pull and kick EMOL', notes: 'Inside shoulder' },
        { role: 'Center', action: 'Backside A-gap protection' },
        { role: 'Backside Tackle', action: 'Hinge' },
      ],
      RB: [{ role: 'RB', action: `Aim ${dir} B-gap, follow puller`, notes: 'Cut off spill' }],
      QB: [{ role: 'QB', action: 'Reverse pivot, mesh' }],
      WR: [{ role: 'Playside', action: 'Crack or stalk' }, { role: 'Backside', action: 'Cutoff' }],
    }),
  },

  run_gt_counter: {
    scheme: 'gap',
    aim: 'a_gap',
    needsPuller: 'GT',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside OL', action: 'Down block' },
        { role: 'Backside Guard', action: 'Pull, kick EMOL', notes: 'Inside shoulder' },
        { role: 'Backside Tackle', action: 'Pull, wrap for LB', notes: 'Lead through hole' },
        { role: 'Center', action: 'Backside A-gap' },
      ],
      RB: [{ role: 'RB', action: `Counter step, aim ${dir} A-gap`, notes: 'Follow tackle' }],
      QB: [{ role: 'QB', action: 'Counter fake, mesh' }],
      WR: [{ role: 'Playside', action: 'Crack block' }, { role: 'Backside', action: 'Cutoff' }],
    }),
  },

  run_pin_pull: {
    scheme: 'perimeter',
    aim: 'edge',
    needsPuller: 'G',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside Tackle', action: 'Pin inside DL' },
        { role: 'Playside Guard', action: 'Pull to edge, block force' },
        { role: 'Center', action: 'Reach/Hinge' },
        { role: 'Backside', action: 'Cutoff' },
      ],
      RB: [{ role: 'RB', action: `Aim ${dir} edge, do NOT cut early`, notes: 'Speed to edge' }],
      QB: [{ role: 'QB', action: 'Quick toss/pitch or handoff' }],
      WR: [{ role: 'Playside', action: 'Crack force defender' }, { role: 'Backside', action: 'Stalk' }],
    }),
  },

  // Tier 2 Run Concepts
  run_split_zone_arc: {
    scheme: 'zone',
    aim: 'a_gap',
    needsPuller: false,
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside OL', action: 'Zone step' },
        { role: 'Backside OL', action: 'Cutoff (ignore BSDE)' },
      ],
      RB: [{ role: 'RB', action: `Press ${dir} A-gap` }],
      TE: [{ role: 'TE/H', action: 'Arc block backside DE', notes: 'Punish crash' }],
      QB: [{ role: 'QB', action: 'Mesh, boot away' }],
    }),
  },

  run_counter_bash: {
    scheme: 'gap',
    aim: 'b_gap',
    needsPuller: 'G',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside', action: 'Down block' },
        { role: 'Backside Guard', action: 'Pull, read DE' },
      ],
      RB: [{ role: 'RB', action: `Counter step, ${dir} B-gap` }],
      QB: [{ role: 'QB', action: 'Fake opposite, mesh' }],
      WR: [{ role: 'All', action: 'Stalk block' }],
    }),
  },

  run_wham_insert: {
    scheme: 'gap',
    aim: 'a_gap',
    needsPuller: false,
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Center', action: 'Leave 3T unblocked' },
        { role: 'Guards', action: 'Combo to LB' },
        { role: 'Tackles', action: 'Base block' },
      ],
      TE: [{ role: 'TE/H', action: 'Wham block 3T', notes: 'Inside shoulder' }],
      RB: [{ role: 'RB', action: `Press ${dir} A-gap` }],
      QB: [{ role: 'QB', action: 'Handoff' }],
    }),
  },

  run_pin_pull_toss: {
    scheme: 'perimeter',
    aim: 'edge',
    needsPuller: 'G',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside Tackle', action: 'Pin' },
        { role: 'Playside Guard', action: 'Pull to edge' },
      ],
      RB: [{ role: 'RB', action: `Catch toss, ${dir} edge` }],
      QB: [{ role: 'QB', action: 'Quick toss' }],
      WR: [{ role: 'Playside', action: 'Crack' }],
    }),
  },

  run_qb_counter: {
    scheme: 'gap',
    aim: 'a_gap',
    needsPuller: 'GT',
    generate: (dir: Direction) => ({
      OL: [
        { role: 'Playside', action: 'Down block' },
        { role: 'Backside Guard', action: 'Pull, kick' },
        { role: 'Backside Tackle', action: 'Pull, lead' },
      ],
      RB: [{ role: 'RB', action: 'Fake carry opposite' }],
      QB: [{ role: 'QB', action: `Counter step, keep ${dir}`, notes: 'Follow tackle' }],
      WR: [{ role: 'All', action: 'Block' }],
    }),
  },
};

// ============================================
// PASS CONCEPT RULES
// ============================================

interface PassConceptRule {
  dropType: 'quick' | 'dropback' | 'play-action' | 'rollout';
  generate: (dir: Direction) => Record<string, Assignment[]>;
}

export const PASS_CONCEPT_RULES: Record<string, PassConceptRule> = {
  pass_stick: {
    dropType: 'quick',
    generate: () => ({
      WR: [
        { role: 'CLEAR', action: 'Corner route 12+', notes: 'Clear out CB' },
        { role: 'INTERMEDIATE', action: 'Stick route 5-6', notes: 'Settle in window' },
        { role: 'FLAT', action: 'RB to flat', notes: 'Stretch flat defender' },
      ],
      QB: [{ role: 'QB', action: 'Pre-snap read flat D, 1-step throw', notes: 'High-low read' }],
      OL: [{ role: 'All', action: 'Quick set, inside-out' }],
    }),
  },

  pass_mesh: {
    dropType: 'dropback',
    generate: () => ({
      WR: [
        { role: 'UNDER', action: 'Shallow cross (rub)', notes: 'Pick action' },
        { role: 'UNDER', action: 'Opposite shallow cross', notes: 'Cross behind' },
        { role: 'CLEAR', action: 'Go route', notes: 'Clear safety' },
        { role: 'CHECKDOWN', action: 'Sit over ball', notes: 'Safety valve' },
      ],
      QB: [{ role: 'QB', action: 'High → Low progression', notes: '5-step drop' }],
      OL: [{ role: 'All', action: '5-step pass pro, inside-out' }],
    }),
  },

  pass_flood: {
    dropType: 'rollout',
    generate: (dir: Direction) => ({
      WR: [
        { role: 'CLEAR', action: 'Go route 18+', notes: 'Clear corner' },
        { role: 'INTERMEDIATE', action: 'Deep out 10-12', notes: 'Sit in void' },
        { role: 'FLAT', action: 'Arrow to flat', notes: 'Stretch underneath' },
      ],
      QB: [
        {
          role: 'QB',
          action: `Roll ${dir}, read flat D → intermediate → checkdown`,
          notes: 'Run option if nothing',
        },
      ],
      OL: [
        { role: 'Playside', action: 'Reach/Hinge' },
        { role: 'Backside', action: 'Cutoff' },
      ],
    }),
  },

  pass_four_verts: {
    dropType: 'dropback',
    generate: () => ({
      WR: [
        { role: 'X', action: 'Go route', notes: 'Push vertical' },
        { role: 'Z', action: 'Go route', notes: 'Push vertical' },
        { role: 'H/Y', action: 'Seam route', notes: 'Split safeties' },
        { role: 'TE/RB', action: 'Seam or check release', notes: 'Middle read' },
      ],
      QB: [
        {
          role: 'QB',
          action: 'Read safety structure (MOFO/MOFC)',
          notes: 'Work seams vs MOFO, outside vs MOFC',
        },
      ],
      OL: [{ role: 'All', action: '5-step pass pro' }],
    }),
  },

  pass_dagger: {
    dropType: 'dropback',
    generate: () => ({
      WR: [
        { role: 'CLEAR', action: 'Post route 15+', notes: 'Occupy safety' },
        { role: 'INTERMEDIATE', action: 'Dig route 12-15', notes: 'Underneath post' },
        { role: 'CHECKDOWN', action: 'Flat or check', notes: 'Safety valve' },
      ],
      QB: [{ role: 'QB', action: 'Post → Dig read, check middle open', notes: '5-step' }],
      OL: [{ role: 'All', action: '5-step pass pro, inside-out' }],
    }),
  },

  // Tier 2 Pass Concepts
  pass_sail: {
    dropType: 'play-action',
    generate: (dir: Direction) => ({
      WR: [
        { role: 'CLEAR', action: 'Go route', notes: 'Clear deep' },
        { role: 'INTERMEDIATE', action: 'Corner route 12-15' },
        { role: 'FLAT', action: 'Flat route' },
      ],
      QB: [
        {
          role: 'QB',
          action: 'PA fake, read corner → flat',
          notes: 'Eyes up after fake',
        },
      ],
      OL: [{ role: 'All', action: 'PA fake, pass pro' }],
    }),
  },

  pass_post_wheel: {
    dropType: 'play-action',
    generate: () => ({
      WR: [
        { role: 'CLEAR', action: 'Post route', notes: 'Attack safety' },
        { role: 'INTERMEDIATE', action: 'Wheel route', notes: 'Behind LB' },
      ],
      RB: [{ role: 'RB', action: 'Check, wheel route', notes: 'Out of backfield' }],
      QB: [{ role: 'QB', action: 'PA fake, Post → Wheel read', notes: 'Safety check first' }],
      OL: [{ role: 'All', action: 'PA action, pass pro' }],
    }),
  },

  pass_shallow: {
    dropType: 'quick',
    generate: () => ({
      WR: [
        { role: 'UNDER', action: 'Shallow cross', notes: 'Mesh simplified' },
        { role: 'INTERMEDIATE', action: 'Dig route', notes: 'Over the top' },
        { role: 'CHECKDOWN', action: 'Check release' },
      ],
      QB: [{ role: 'QB', action: 'Quick read shallow, check dig' }],
      OL: [{ role: 'All', action: 'Quick set' }],
    }),
  },

  pass_y_cross: {
    dropType: 'dropback',
    generate: () => ({
      WR: [
        { role: 'CLEAR', action: 'Go/Post', notes: 'Clear safety' },
        { role: 'INTERMEDIATE', action: 'Dig route' },
      ],
      TE: [{ role: 'TE', action: 'Deep cross 15-18', notes: 'Primary read' }],
      QB: [{ role: 'QB', action: 'Y-Cross → Dig → Check', notes: 'Full field read' }],
      OL: [{ role: 'All', action: '5-step pass pro' }],
    }),
  },

  pass_yankee: {
    dropType: 'play-action',
    generate: (dir: Direction) => ({
      WR: [
        { role: 'CLEAR', action: 'Post route', notes: 'Shot play' },
        { role: 'INTERMEDIATE', action: 'Dig/Cross' },
      ],
      QB: [
        {
          role: 'QB',
          action: 'PA shot, Post read',
          notes: 'Safety check, throw if 1-on-1',
        },
      ],
      OL: [{ role: 'All', action: 'Heavy PA fake, max pro' }],
      RB: [{ role: 'RB', action: 'PA fake, check release' }],
    }),
  },
};

// ============================================
// ENGINE CORE
// ============================================

/**
 * Validate formation + concept combination
 */
export function validate(formationId: string, concept: RunConceptRule | PassConceptRule): EngineOutput {
  // Check puller requirement
  if ('needsPuller' in concept && concept.needsPuller && !concept.generate) {
    return { status: 'INVALID', reason: 'Missing puller assignment' };
  }

  // Check formation conflicts
  const formation = FORMATION_RULES[formationId];
  if (!formation) {
    return { status: 'INVALID', reason: `Formation not found: ${formationId}` };
  }

  // Empty formation + gap scheme conflict
  if (formationId === 'empty-qb-safe' && 'needsPuller' in concept && concept.needsPuller) {
    return { status: 'INVALID', reason: 'Empty formation cannot run gap scheme' };
  }

  return { status: 'VALID' };
}

/**
 * Main entry point for assignment generation
 */
export function runAssignmentEngine(input: EngineInput): EngineOutput {
  const runConcept = RUN_CONCEPT_RULES[input.conceptId];
  const passConcept = PASS_CONCEPT_RULES[input.conceptId];

  const concept = runConcept || passConcept;
  if (!concept) {
    return { status: 'INVALID', reason: 'Unknown concept' };
  }

  const validation = validate(input.formationId, concept);
  if (validation.status === 'INVALID') return validation;

  const assignments = concept.generate(input.direction);

  // Apply tags modifications
  if (input.tags?.includes('motion')) {
    assignments['MOTION'] = [{ role: 'Motion', action: 'Pre-snap motion' }];
  }
  if (input.tags?.includes('playAction') && !input.conceptId.startsWith('run_')) {
    assignments['OL']?.forEach((a) => {
      a.notes = (a.notes || '') + ' (PA fake)';
    });
  }

  return {
    status: 'VALID',
    assignments,
  };
}

/**
 * Legacy function - use runAssignmentEngine instead
 */
export function generateAssignments(input: EngineInput): EngineOutput {
  return runAssignmentEngine(input);
}

// ============================================
// EXPORTS
// ============================================

export default runAssignmentEngine;
