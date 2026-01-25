/**
 * Run Concepts (45개) for ForOffenseCoach
 *
 * Categories:
 * - Inside Zone (3): Inside Zone, Split Zone, Duo
 * - Gap/Power (5): Power, Counter, Iso, Tackle Trap, Guard Trap
 * - Outside (5): Outside Zone, Stretch, Toss, Sweep, Buck Sweep
 * - Counter (2): GT Counter, OH Counter
 * - Special (5): Wham, Pin-Pull, QB Power, Read Option, RPO Zone
 *
 * NEW Categories (25개):
 * - Zone Additional (5): Wide Zone, Mid Zone, Zone Read Give, Zone Arc, Split Zone Weak
 * - Gap/Power Additional (8): Dart, Down G, Lead Iso, Insert, Power Read, FB Dive, Draw, Lead Draw
 * - Outside Additional (6): Jet Sweep, Speed Option, Rocket Toss, Pitch, End Around, Fly Sweep
 * - Misdirection (4): Counter Iso, Reverse, Bootleg, Waggle
 * - Option (2): Triple Option, Midline Option
 */

import type { Concept } from '@/types/concept';

export const RUN_CONCEPTS: Concept[] = [
  // ============================================
  // INSIDE ZONE (3)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_inside_zone',
    name: 'Inside Zone',
    conceptType: 'run',
    tier: 1,
    summary: 'Zone blocking scheme with RB reading backside A-gap',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol', '2x2'],
      personnelHints: ['11', '12', '21'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: IZ zone step + combo to LB',
          notes: 'Zone step, combo to PSLB/BSLB',
        },
        {
          roleName: 'ZONE_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'TE: Zone/Reach — stay square',
          notes: 'Zone or reach block',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk (crack if tagged)',
          notes: 'Stalk block on CB/Safety',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim A/B — one cut',
          notes: 'Aim backside A-gap, read NT/DT',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open/mesh — handoff (read if tagged)',
          notes: 'Open step, mesh with RB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_iz_combo',
          name: 'Combo block timing',
          drill: {
            name: 'Combo to LB Drill',
            purpose: 'Get movement on DL before climbing',
            phase: 'group',
          },
        },
        {
          id: 'fp_iz_read',
          name: 'RB read & cutback',
          drill: {
            name: 'Zone Read Drill',
            purpose: 'RB reads front side, cuts back',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_split_zone',
    name: 'Split Zone',
    conceptType: 'run',
    tier: 1,
    summary: 'Inside zone with TE/H kicking backside end',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2', 'I'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['Y', 'H', 'FB'],
          defaultBlock: { scheme: 'kick', target: 'BSDE' },
          assignment: 'H: Slice across — kick/secure EMOL',
          notes: 'Kick out backside DE',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: Split Zone (zone + combo)',
          notes: 'Zone step playside',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim A/B — one cut',
          notes: 'Aim frontside A, cutback lane created by H kick',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open/mesh — handoff',
          notes: 'Open step, mesh with RB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'weak'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_split_kick',
          name: 'H-back kick block',
          drill: {
            name: 'Kick Block Drill',
            purpose: 'H kick out DE with leverage',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_duo',
    name: 'Duo',
    conceptType: 'run',
    tier: 1,
    summary: 'Double team at POA with LBs sorted by RB track',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'DUO_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'combo' },
          assignment: 'OL: Duo — double @POA + climb',
          notes: 'Double team at point of attack, climb to LB',
        },
        {
          roleName: 'DUO_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'arc', target: 'PSLB' },
          assignment: 'TE: Base/Drive (set edge)',
          notes: 'Arc to LB',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Press A — bounce/bang by LB',
          notes: 'Aim frontside B-gap, press LOS then cut',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open — handoff',
          notes: 'Open step, handoff',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'under'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_preferred',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_duo_double',
          name: 'Duo double team at POA',
          drill: {
            name: 'Duo Double Drill',
            purpose: 'Get vertical push at point of attack',
            phase: 'group',
          },
        },
        {
          id: 'fp_duo_track',
          name: 'RB track to daylight',
          drill: {
            name: 'Duo Read Drill',
            purpose: 'RB presses LOS, cuts to daylight',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // GAP/POWER (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power',
    name: 'Power',
    conceptType: 'run',
    tier: 1,
    summary: 'Gap scheme with kickout and lead blocker',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace', '2x2'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['FB', 'H'],
          defaultBlock: { scheme: 'kick', target: 'EMOL' },
          assignment: 'FB: Insert/Lead — fit inside-out',
          notes: 'Kick out end man on LOS',
        },
        {
          roleName: 'POWER_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Power — down blocks + pullers (G kick / T wrap)',
          notes: 'Down blocks + pulling guard',
        },
        {
          roleName: 'POWER_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'down' },
          assignment: 'TE: Down/Seal (close C-gap)',
          notes: 'Down block or seal',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim inside leg of play-side TE/OT',
          notes: 'Aim inside leg of TE, follow puller',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open — handoff',
          notes: 'Open step, handoff',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'power',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_power_kick',
          name: 'FB kick block on EMOL',
          drill: {
            name: 'Kick Out Drill',
            purpose: 'FB kicks EMOL with inside-out leverage',
            phase: 'indy',
          },
        },
        {
          id: 'fp_power_pull',
          name: 'Guard pull path',
          drill: {
            name: 'Pull & Lead Drill',
            purpose: 'Guard pulls flat, finds LB to block',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_gt_counter',
    name: 'GT Counter',
    conceptType: 'run',
    tier: 1,
    summary: 'Guard and tackle pull for misdirection gap scheme',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['11', '12', '21'],
      needsTE: true,
      needsPuller: 'GT',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'COUNTER_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Counter — down + (G kick / T wrap)',
          notes: 'Down blocks + pulling G and T',
        },
        {
          roleName: 'COUNTER_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          assignment: 'TE: Down/Seal (protect edge)',
          notes: 'Down block on DE',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Counter step — follow pullers',
          notes: 'Counter step, follow T through hole',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Reverse out — handoff (timing)',
          notes: 'Reverse out, mesh with RB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'counter',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_counter_timing',
          name: 'G/T pull timing',
          drill: {
            name: 'Counter Pull Drill',
            purpose: 'Guard kicks, Tackle wraps with timing',
            phase: 'group',
          },
        },
        {
          id: 'fp_counter_fake',
          name: 'RB counter step',
          drill: {
            name: 'Counter Step Drill',
            purpose: 'Sell backside, redirect to playside',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_iso',
    name: 'Iso',
    conceptType: 'run',
    tier: 2,
    summary: 'Fullback leads through A-gap, isolates LB',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'LEAD',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'MLB' },
          notes: 'Lead block on Mike LB',
        },
        {
          roleName: 'COMBO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo NT to backside LB',
        },
        {
          roleName: 'COMBO_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          notes: 'Combo 3T to Will',
        },
        {
          roleName: 'DOWN_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Back block',
        },
        {
          roleName: 'BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Back block',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim A-gap, follow FB lead',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_iso_lead',
          name: 'FB lead block on LB',
          drill: {
            name: 'Iso Lead Drill',
            purpose: 'FB attacks LB downhill, creates crease',
            phase: 'indy',
          },
        },
        {
          id: 'fp_iso_follow',
          name: 'RB follow path',
          drill: {
            name: 'Follow FB Drill',
            purpose: 'RB stays tight to FB hip through hole',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_tackle_trap',
    name: 'Tackle Trap',
    conceptType: 'run',
    tier: 2,
    summary: 'Backside tackle traps playside DT',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'T',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'TRAP',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'trap', target: '3T' },
          notes: 'Pull and trap 3-tech',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block DE',
        },
        {
          roleName: 'FAN_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'down', target: 'PSLB' },
          notes: 'Fan to LB',
        },
        {
          roleName: 'COMBO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach', target: 'NT' },
          notes: 'Reach or double',
        },
        {
          roleName: 'HINGE_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim at trap block, cut off tackle hip',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['even', 'over'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_preferred',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_tackle_trap_path',
          name: 'Tackle trap path',
          drill: {
            name: 'Tackle Trap Drill',
            purpose: 'Tackle pulls flat, attacks DT inside-out',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_guard_trap',
    name: 'Guard Trap',
    conceptType: 'run',
    tier: 2,
    summary: 'Backside guard traps first down lineman',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['11', '12', '21'],
      needsTE: false,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'TRAP',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'trap', target: 'DT' },
          notes: 'Pull and trap first down lineman',
        },
        {
          roleName: 'FAN_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'down', target: 'MLB' },
          notes: 'Fan block to LB',
        },
        {
          roleName: 'REACH_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach', target: 'NT' },
          notes: 'Reach to backside A',
        },
        {
          roleName: 'PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge and protect puller',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Quick hit A-gap, cut off trap',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['strong', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_guard_trap_angle',
          name: 'Guard trap angle',
          drill: {
            name: 'Guard Trap Drill',
            purpose: 'Quick pull, kick first DL inside-out',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // OUTSIDE (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_outside_zone',
    name: 'Outside Zone',
    conceptType: 'run',
    tier: 1,
    summary: 'Zone stretch to the perimeter with cutback option',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'OZ_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'OL: OZ stretch — reach/overtake',
          notes: 'Zone step, reach and overtake',
        },
        {
          roleName: 'OZ_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'TE: Reach/Arc — set edge',
          notes: 'Reach EMOL or arc release',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk/Crack',
          notes: 'Stalk or crack block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Press edge — cut back off blocks',
          notes: 'Aim outside hip of TE/T, cut back if needed',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open/reach — handoff (wide)',
          notes: 'Open step, reach handoff',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_oz_reach',
          name: 'OL reach steps',
          drill: {
            name: 'Reach Block Drill',
            purpose: 'Get lateral movement on zone step',
            phase: 'indy',
          },
        },
        {
          id: 'fp_oz_cutback',
          name: 'RB cutback vision',
          drill: {
            name: 'OZ Read Drill',
            purpose: 'RB reads blocks, finds cutback',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_stretch',
    name: 'Stretch',
    conceptType: 'run',
    tier: 1,
    summary: 'Wide zone concept attacking the edge',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'I'],
      personnelHints: ['11', '12'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'STRETCH_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'OL: Stretch — reach & overtake',
          notes: 'Reach and overtake',
        },
        {
          roleName: 'STRETCH_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'reach', target: 'EMOL' },
          assignment: 'TE: Reach / Arc release',
          notes: 'Reach EMOL',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk block',
          notes: 'Stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Press outside — bang or bend',
          notes: 'Get to sideline, cut up when you see grass',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open step — handoff (wide mesh)',
          notes: 'Open step, wide mesh',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_preferred',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_stretch_reach',
          name: 'TE/T reach blocks',
          drill: {
            name: 'Stretch Reach Drill',
            purpose: 'Get width on reach steps to seal edge',
            phase: 'group',
          },
        },
        {
          id: 'fp_stretch_aiming',
          name: 'RB aiming point',
          drill: {
            name: 'Stretch Track Drill',
            purpose: 'RB aims wide, cuts up at first opening',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_toss',
    name: 'Toss',
    conceptType: 'run',
    tier: 2,
    summary: 'Quick pitch to the edge with pulling blockers',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace', '2x2'],
      personnelHints: ['21', '22', '12'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['FB', 'H'],
          defaultBlock: { scheme: 'kick', target: 'CB' },
          notes: 'Kick out corner/force',
        },
        {
          roleName: 'PULL_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'OLB' },
          notes: 'Pull and lead to perimeter',
        },
        {
          roleName: 'REACH_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'HINGE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach playside',
        },
        {
          roleName: 'HINGE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Catch toss, get to edge, turn upfield',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_toss_pitch',
          name: 'QB-RB toss timing',
          drill: {
            name: 'Toss Pitch Drill',
            purpose: 'Quick soft pitch, RB catches in stride',
            phase: 'group',
          },
        },
        {
          id: 'fp_toss_edge',
          name: 'Getting to edge',
          drill: {
            name: 'Perimeter Block Drill',
            purpose: 'FB/H kick force, RB turns corner',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_sweep',
    name: 'Sweep',
    conceptType: 'run',
    tier: 2,
    summary: 'Classic sweep with multiple pullers',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: true,
      needsPuller: 'GT',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'Force' },
          notes: 'Pull and kick force defender',
        },
        {
          roleName: 'PULL_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'pull_lead', target: 'MLB' },
          notes: 'Pull and lead for RB',
        },
        {
          roleName: 'REACH_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach or seal DE',
        },
        {
          roleName: 'KICK',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'OLB' },
          notes: 'Lead kick OLB',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LT', 'LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge and protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Follow pullers, turn corner',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_sweep_pull',
          name: 'Multiple pullers coordination',
          drill: {
            name: 'Sweep Pull Drill',
            purpose: 'G and C pull together, maintain spacing',
            phase: 'group',
          },
        },
        {
          id: 'fp_sweep_patience',
          name: 'RB patience behind pullers',
          drill: {
            name: 'Follow Pullers Drill',
            purpose: 'RB stays behind lead blockers, turns upfield',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_buck_sweep',
    name: 'Buck Sweep',
    conceptType: 'run',
    tier: 2,
    summary: 'Gap scheme sweep with guards pulling',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', '2x2'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'GT',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          notes: 'Kick EMOL',
        },
        {
          roleName: 'PULL_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'pull_lead', target: 'OLB' },
          notes: 'Wrap and lead',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block DE',
        },
        {
          roleName: 'DOWN_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'down', target: 'DT' },
          notes: 'Down block DT',
        },
        {
          roleName: 'HINGE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down' },
          notes: 'Back block A-gap',
        },
        {
          roleName: 'HINGE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim off tackle, follow BSG lead',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'both'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_required',
        aim: 'off_tackle',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_buck_down',
          name: 'Down blocks at POA',
          drill: {
            name: 'Down Block Drill',
            purpose: 'TE/T seal down inside defenders',
            phase: 'group',
          },
        },
        {
          id: 'fp_buck_guards',
          name: 'Dual guard pull',
          drill: {
            name: 'Buck Pull Drill',
            purpose: 'PSG kicks, BSG wraps with timing',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // COUNTER (2)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_oh_counter',
    name: 'OH Counter',
    conceptType: 'run',
    tier: 2,
    summary: 'Counter with H-back and guard pulling',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2', 'pistol'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['H'],
          defaultBlock: { scheme: 'kick', target: 'EMOL' },
          notes: 'H kicks EMOL',
        },
        {
          roleName: 'WRAP',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'wrap', target: 'PSLB' },
          notes: 'Guard wraps for LB',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block DE',
        },
        {
          roleName: 'DOWN_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'down', target: 'DT' },
          notes: 'Down block DT',
        },
        {
          roleName: 'DOWN_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down', target: 'NT' },
          notes: 'Back block',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Counter step, follow G through hole',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'counter',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'weak'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_oh_kick',
          name: 'H-back kick timing',
          drill: {
            name: 'OH Kick Drill',
            purpose: 'H motion, kick EMOL with leverage',
            phase: 'indy',
          },
        },
        {
          id: 'fp_oh_counter_step',
          name: 'RB counter step',
          drill: {
            name: 'Counter Footwork Drill',
            purpose: 'Sell backside, redirect to playside',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // SPECIAL (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_wham',
    name: 'Wham',
    conceptType: 'run',
    tier: 2,
    summary: 'H-back wham block on 3-tech with zone blocking',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2', 'pistol'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'WHAM',
          appliesTo: ['H', 'FB'],
          defaultBlock: { scheme: 'wham', target: '3T' },
          notes: 'Wham block 3-tech',
        },
        {
          roleName: 'PULL_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'MLB' },
          notes: 'Pull through for LB',
        },
        {
          roleName: 'ZONE_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step to backside',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim at wham block, cut off H-back',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even', 'over'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_preferred',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_wham_angle',
          name: 'H-back wham angle',
          drill: {
            name: 'Wham Block Drill',
            purpose: 'H attacks 3T inside-out',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_pin_pull',
    name: 'Pin-Pull',
    conceptType: 'run',
    tier: 1,
    summary: 'TE pins, tackle pulls to edge',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'I', '2x2'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'T',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PIN_TE',
          appliesTo: ['Y', 'TE'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          assignment: 'TE: Pin/Reach (by call)',
          notes: 'Pin (down) block DE',
        },
        {
          roleName: 'PIN_PULL_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: Pin-Pull — pin inside / pull to edge',
          notes: 'Pin inside, tackle pulls to edge',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Crack/Stalk (by call)',
          notes: 'Crack or stalk block',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim outside hip of puller — press & read',
          notes: 'Aim outside TE, follow pulling tackle',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open — handoff (wide timing)',
          notes: 'Open step, wide timing',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_required',
        aim: 'off_tackle',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_pin_down',
          name: 'TE pin block',
          drill: {
            name: 'Pin Block Drill',
            purpose: 'TE down blocks DE with inside leverage',
            phase: 'indy',
          },
        },
        {
          id: 'fp_pin_pull_path',
          name: 'Tackle pull path',
          drill: {
            name: 'Tackle Pull Drill',
            purpose: 'T pulls to edge, kicks force defender',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_power',
    name: 'QB Power',
    conceptType: 'run',
    tier: 2,
    summary: 'QB run with power blocking scheme',
    badges: ['option'],
    requirements: {
      preferredStructures: ['pistol', 'I', 'ace'],
      personnelHints: ['11', '12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['H', 'FB'],
          defaultBlock: { scheme: 'kick', target: 'EMOL' },
          notes: 'Kick EMOL',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'PSLB' },
          notes: 'Pull and lead for QB',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block',
        },
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'LG', 'C'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down block scheme',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake dive opposite',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['QB'],
          notes: 'Fake handoff, follow puller',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_qb_power_fake',
          name: 'QB fake handoff',
          drill: {
            name: 'QB Fake Drill',
            purpose: 'Sell handoff fake, pull ball and run',
            phase: 'group',
          },
        },
        {
          id: 'fp_qb_power_follow',
          name: 'QB follow puller',
          drill: {
            name: 'QB Follow Drill',
            purpose: 'QB stays tight to pulling guard',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_read_option',
    name: 'Read Option',
    conceptType: 'run',
    tier: 1,
    summary: 'Inside zone with QB reading unblocked DE',
    badges: ['option', 'spread'],
    requirements: {
      preferredStructures: ['pistol', '2x2', 'empty'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: Zone step — leave read key',
          notes: 'Zone away from read key',
        },
        {
          roleName: 'TE_ARC',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'arc' },
          assignment: 'TE: Arc to safety',
          notes: 'Arc to second level',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk / Crack',
          notes: 'Stalk block',
        },
        {
          roleName: 'MESH_RB',
          appliesTo: ['RB'],
          assignment: 'RB: Mesh — receive or fake',
          notes: 'Inside zone path, wait for mesh decision',
        },
        {
          roleName: 'READ_QB',
          appliesTo: ['QB'],
          assignment: 'QB: Read unblocked defender',
          notes: 'Give if DE crashes, keep if DE stays',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_read_mesh',
          name: 'QB-RB mesh point',
          drill: {
            name: 'Mesh Point Drill',
            purpose: 'Clean mesh, soft hands on exchange',
            phase: 'group',
          },
        },
        {
          id: 'fp_read_key',
          name: 'QB read decision',
          drill: {
            name: 'Read Key Drill',
            purpose: 'Quick give/keep decision on DE',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_rpo_zone',
    name: 'RPO Zone',
    conceptType: 'run',
    tier: 1,
    summary: 'Inside zone with RPO pass option',
    badges: ['rpo', 'spread'],
    requirements: {
      preferredStructures: ['2x2', 'pistol', '3x1'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: Zone — stay behind LOS (RPO rule)',
          notes: 'Zone blocking, stay behind LOS',
        },
        {
          roleName: 'BUBBLE',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'bubble', depth: 1 },
          assignment: 'H: Bubble screen option',
          notes: 'Bubble screen option',
        },
        {
          roleName: 'SLANT',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'slant', depth: 6 },
          assignment: 'Z: Slant — quick pass option',
          notes: 'Slant as quick pass option',
        },
        {
          roleName: 'STALK',
          appliesTo: ['X'],
          defaultBlock: { scheme: 'seal' },
          assignment: 'X: Stalk/Seal for bubble',
          notes: 'Stalk block for bubble',
        },
        {
          roleName: 'RUN',
          appliesTo: ['RB'],
          assignment: 'RB: Inside zone track (RPO fake if pass)',
          notes: 'Inside zone track',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          assignment: 'QB: Read LB — give / bubble / slant',
          notes: 'Read LB: give, bubble, or slant',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_rpo_read',
          name: 'QB RPO read timing',
          drill: {
            name: 'RPO Decision Drill',
            purpose: 'Quick pre-snap to post-snap read',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // ZONE - ADDITIONAL (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_wide_zone',
    name: 'Wide Zone',
    conceptType: 'run',
    tier: 2,
    summary: 'Wide stretch concept attacking the perimeter',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'REACH_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'reach', target: 'EMOL' },
          notes: 'Reach EMOL, get to edge',
        },
        {
          roleName: 'REACH_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'REACH_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'reach', target: '3T' },
          notes: 'Reach 3T',
        },
        {
          roleName: 'REACH_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach', target: 'NT' },
          notes: 'Reach NT',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step playside',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step, hinge if needed',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim wide, cut up at first crease',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_wide_zone_reach',
          name: 'Reach block execution',
          drill: {
            name: 'Wide Zone Reach Drill',
            purpose: 'Get width on reach steps to seal defenders',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_mid_zone',
    name: 'Mid Zone',
    conceptType: 'run',
    tier: 3,
    summary: 'Zone concept between inside and outside zone',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'zone_step', target: 'DE' },
          notes: 'Zone step, combo to Sam',
        },
        {
          roleName: 'ZONE_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          notes: 'Combo to Mike',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim B-gap, cut to daylight',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_mid_zone_track',
          name: 'RB aiming point',
          drill: {
            name: 'Mid Zone Track Drill',
            purpose: 'RB aims B-gap, presses LOS',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_zone_read_give',
    name: 'Zone Read Give',
    conceptType: 'run',
    tier: 3,
    summary: 'Zone read with automatic give to RB',
    badges: ['option', 'spread'],
    requirements: {
      preferredStructures: ['pistol', '2x2'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone blocking, leave DE unblocked',
        },
        {
          roleName: 'GIVE',
          appliesTo: ['QB'],
          notes: 'Auto give regardless of DE',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Inside zone path',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_zone_give_mesh',
          name: 'Quick mesh point',
          drill: {
            name: 'Auto Give Drill',
            purpose: 'Fast clean handoff',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_zone_arc',
    name: 'Zone Arc',
    conceptType: 'run',
    tier: 2,
    summary: 'Inside zone with TE arc block on LB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2'],
      personnelHints: ['12'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ARC',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'arc', target: 'PSLB' },
          notes: 'Arc release to LB',
        },
        {
          roleName: 'ZONE_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'ZONE_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step', target: '3T' },
          notes: 'Zone step, climb',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim A-gap, cut back if needed',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_zone_arc_release',
          name: 'TE arc release',
          drill: {
            name: 'Arc Release Drill',
            purpose: 'TE releases inside, arc to LB',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_split_zone_weak',
    name: 'Split Zone Weak',
    conceptType: 'run',
    tier: 3,
    summary: 'Split zone to the weak side',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2', 'I'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['Y', 'H', 'FB'],
          defaultBlock: { scheme: 'kick', target: 'BSDE' },
          notes: 'Kick backside DE',
        },
        {
          roleName: 'ZONE_PST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step weak side',
        },
        {
          roleName: 'ZONE_PSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo' },
          notes: 'Combo to LB',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone to weak',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach DE',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim weak A, cutback lane from H kick',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'weak',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'weak'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_split_weak_kick',
          name: 'H-back kick weak side',
          drill: {
            name: 'Weak Split Drill',
            purpose: 'H kick on backside DE',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // GAP/POWER - ADDITIONAL (8)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_dart',
    name: 'Dart',
    conceptType: 'run',
    tier: 2,
    summary: 'Tackle pull for quick hitting gap scheme',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol', '2x2'],
      personnelHints: ['11', '12'],
      needsTE: true,
      needsPuller: 'T',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'pull_lead', target: 'PSLB' },
          notes: 'Tackle pulls for LB',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block DE',
        },
        {
          roleName: 'DOWN_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'down', target: '3T' },
          notes: 'Down block DT',
        },
        {
          roleName: 'DOWN_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down', target: 'NT' },
          notes: 'Back block',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Quick hit off tackle butt',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_dart_pull',
          name: 'Tackle pull path',
          drill: {
            name: 'Dart Pull Drill',
            purpose: 'Quick flat pull to playside LB',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_down_g',
    name: 'Down G',
    conceptType: 'run',
    tier: 2,
    summary: 'Down blocking with guard pulling for LB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'I', '2x2'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block DE',
        },
        {
          roleName: 'DOWN_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'down', target: '3T' },
          notes: 'Down block DT',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'PSLB' },
          notes: 'Pull through for LB',
        },
        {
          roleName: 'DOWN_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down', target: 'NT' },
          notes: 'Back block',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim inside TE leg, follow puller',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_down_g_down',
          name: 'Down blocks at POA',
          drill: {
            name: 'Down Block Drill',
            purpose: 'Seal inside defenders at POA',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_lead_iso',
    name: 'Lead Iso',
    conceptType: 'run',
    tier: 2,
    summary: 'Iso with additional lead blocker',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'LEAD_FB',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'MLB' },
          notes: 'FB leads on Mike',
        },
        {
          roleName: 'LEAD_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'arc', target: 'PSLB' },
          notes: 'TE arcs to Sam',
        },
        {
          roleName: 'COMBO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside',
        },
        {
          roleName: 'COMBO_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          notes: 'Combo to Will',
        },
        {
          roleName: 'DOWN',
          appliesTo: ['RT', 'LT', 'LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down block',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Follow FB through A-gap',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_lead_iso_double',
          name: 'Double lead blocks',
          drill: {
            name: 'Lead Iso Drill',
            purpose: 'FB and TE clear LBs',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_insert',
    name: 'Insert',
    conceptType: 'run',
    tier: 2,
    summary: 'Zone scheme with TE inserting for LB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2'],
      personnelHints: ['12'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'INSERT',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'kick', target: 'PSLB' },
          notes: 'TE inserts for LB',
        },
        {
          roleName: 'ZONE_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'ZONE_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step', target: '3T' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim B-gap, follow TE insert',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'inside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_insert_timing',
          name: 'TE insert timing',
          drill: {
            name: 'Insert Timing Drill',
            purpose: 'TE releases for LB at right time',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power_read',
    name: 'Power Read',
    conceptType: 'run',
    tier: 2,
    summary: 'Power blocking with QB reading the backside',
    badges: ['option', 'spread'],
    requirements: {
      preferredStructures: ['pistol', '2x2'],
      personnelHints: ['11', '12'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'KICK',
          appliesTo: ['H'],
          defaultBlock: { scheme: 'kick', target: 'EMOL' },
          notes: 'Kick EMOL',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'PSLB' },
          notes: 'Pull and lead',
        },
        {
          roleName: 'DOWN',
          appliesTo: ['Y', 'RT', 'C', 'LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down blocking',
        },
        {
          roleName: 'MESH',
          appliesTo: ['RB'],
          notes: 'Sweep path, wait for mesh',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          notes: 'Read backside DE: give or keep',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_power_read_mesh',
          name: 'Power read mesh',
          drill: {
            name: 'Power Read Drill',
            purpose: 'QB reads DE, RB runs sweep track',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_fb_dive',
    name: 'FB Dive',
    conceptType: 'run',
    tier: 3,
    summary: 'Quick hitting fullback dive',
    badges: ['pro_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'COMBO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside LB',
        },
        {
          roleName: 'COMBO_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          notes: 'Combo to Mike',
        },
        {
          roleName: 'DOWN_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'DOWN_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down' },
          notes: 'Back block',
        },
        {
          roleName: 'DOWN_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Back block',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['FB'],
          notes: 'Quick hit A-gap',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake sweep action',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'gap',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_fb_dive_quick',
          name: 'FB quick hit',
          drill: {
            name: 'FB Dive Drill',
            purpose: 'Quick downhill FB run',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_draw',
    name: 'Draw',
    conceptType: 'run',
    tier: 1,
    summary: 'Play-action draw with pass protection look',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'DRAW_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'pass_set' },
          assignment: 'OL: Pass set (2 count) → drive block',
          notes: 'Pass set, then block man',
        },
        {
          roleName: 'DRAW_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'pass_set' },
          assignment: 'TE: Pass pro (sell) → release',
          notes: 'Pass protection look, then release',
        },
        {
          roleName: 'DRAW_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultRoute: { pattern: 'go', depth: 10 },
          assignment: 'WR: Run routes (sell pass)',
          notes: 'Run routes to sell pass',
        },
        {
          roleName: 'DRAW_QB',
          appliesTo: ['QB'],
          assignment: 'QB: Drop back (sell pass) → handoff',
          notes: 'Pass fake, hand off on delay',
        },
        {
          roleName: 'DRAW_RB',
          appliesTo: ['RB'],
          assignment: 'RB: Delay 2 count → take handoff',
          notes: 'Pass protect look, receive handoff',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_draw_sell',
          name: 'Draw fake sell',
          drill: {
            name: 'Draw Fake Drill',
            purpose: 'OL sells pass, RB delays',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_lead_draw',
    name: 'Lead Draw',
    conceptType: 'run',
    tier: 3,
    summary: 'Draw play with lead blocker',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'DRAW_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'pass_set' },
          notes: 'Pass set, block on cue',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'MLB' },
          notes: 'Lead for Mike LB',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['QB'],
          notes: 'Pass fake, hand off',
        },
        {
          roleName: 'DRAW',
          appliesTo: ['RB'],
          notes: 'Delay, follow FB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_lead_draw_timing',
          name: 'Lead draw timing',
          drill: {
            name: 'Lead Draw Drill',
            purpose: 'FB delays, leads through hole',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // OUTSIDE - ADDITIONAL (6)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_jet_sweep',
    name: 'Jet Sweep',
    conceptType: 'run',
    tier: 2,
    summary: 'Jet motion sweep to the perimeter',
    badges: ['spread', 'nfl_style'],
    requirements: {
      preferredStructures: ['2x2', '3x1', 'pistol'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'JET',
          appliesTo: ['H', 'Y'],
          defaultMotion: { pattern: 'jet', direction: 'across' },
          notes: 'Jet motion, receive handoff',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach block playside',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Z', 'X'],
          defaultBlock: { scheme: 'stalk' },
          notes: 'Stalk block DBs',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_jet_timing',
          name: 'Jet motion timing',
          drill: {
            name: 'Jet Sweep Drill',
            purpose: 'Time motion with snap',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_speed_option',
    name: 'Speed Option',
    conceptType: 'run',
    tier: 3,
    summary: 'Quick option play to the perimeter',
    badges: ['option'],
    requirements: {
      preferredStructures: ['pistol', '2x2'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone playside',
        },
        {
          roleName: 'PITCH',
          appliesTo: ['RB'],
          notes: 'Pitch relationship with QB',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          notes: 'Option the DE/OLB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_speed_option_pitch',
          name: 'Pitch relationship',
          drill: {
            name: 'Speed Option Drill',
            purpose: 'QB-RB pitch timing and depth',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_rocket_toss',
    name: 'Rocket Toss',
    conceptType: 'run',
    tier: 3,
    summary: 'Quick toss with jet motion fake',
    badges: ['spread', 'nfl_style'],
    requirements: {
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ROCKET',
          appliesTo: ['RB'],
          notes: 'Catch toss, get to edge',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['H'],
          defaultMotion: { pattern: 'jet', direction: 'across' },
          notes: 'Jet fake opposite',
        },
        {
          roleName: 'REACH_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach block',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Z', 'X'],
          defaultBlock: { scheme: 'stalk' },
          notes: 'Stalk block',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_rocket_toss_timing',
          name: 'Toss timing',
          drill: {
            name: 'Rocket Toss Drill',
            purpose: 'Quick soft toss to RB',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_pitch',
    name: 'Pitch',
    conceptType: 'run',
    tier: 3,
    summary: 'Quick pitch play to the outside',
    badges: ['option', 'nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['11', '12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'Force' },
          notes: 'Pull and lead',
        },
        {
          roleName: 'REACH_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE',
        },
        {
          roleName: 'KICK',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'OLB' },
          notes: 'Kick OLB',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['C', 'LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'PITCH',
          appliesTo: ['RB'],
          notes: 'Catch pitch, turn corner',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_pitch_exchange',
          name: 'Pitch exchange',
          drill: {
            name: 'Pitch Drill',
            purpose: 'Quick accurate pitch',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_end_around',
    name: 'End Around',
    conceptType: 'run',
    tier: 3,
    summary: 'WR end around reverse',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'END_AROUND',
          appliesTo: ['Z', 'H'],
          defaultMotion: { pattern: 'jet', direction: 'across' },
          notes: 'Motion, receive handoff',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake dive',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach playside',
        },
        {
          roleName: 'STALK',
          appliesTo: ['X'],
          defaultBlock: { scheme: 'stalk' },
          notes: 'Stalk block',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_end_around_timing',
          name: 'End around timing',
          drill: {
            name: 'End Around Drill',
            purpose: 'WR motion timing with handoff',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_fly_sweep',
    name: 'Fly Sweep',
    conceptType: 'run',
    tier: 3,
    summary: 'Fly motion sweep',
    badges: ['spread'],
    requirements: {
      preferredStructures: ['2x2', '3x1', 'pistol'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'FLY',
          appliesTo: ['H', 'Y'],
          defaultMotion: { pattern: 'jet', direction: 'across' },
          notes: 'Fly motion, receive handoff',
        },
        {
          roleName: 'REACH_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach block',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Z', 'X'],
          defaultBlock: { scheme: 'stalk' },
          notes: 'Stalk block',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake opposite',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'outside_zone',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_fly_timing',
          name: 'Fly motion timing',
          drill: {
            name: 'Fly Sweep Drill',
            purpose: 'Time motion at full speed',
            phase: 'team',
          },
        },
      ],
    },
  },

  // ============================================
  // MISDIRECTION - ADDITIONAL (4)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_counter_iso',
    name: 'Counter Iso',
    conceptType: 'run',
    tier: 3,
    summary: 'Counter action with FB leading through',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'LEAD',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'kick', target: 'PSLB' },
          notes: 'Counter action, lead for LB',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block',
        },
        {
          roleName: 'DOWN_OL',
          appliesTo: ['RT', 'RG', 'C'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down block',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LG', 'LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'COUNTER',
          appliesTo: ['RB'],
          notes: 'Counter step, follow FB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'counter',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_counter_iso_fake',
          name: 'Counter step fake',
          drill: {
            name: 'Counter Iso Drill',
            purpose: 'Sell backside, redirect playside',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_reverse',
    name: 'Reverse',
    conceptType: 'run',
    tier: 3,
    summary: 'Traditional reverse play',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', '3x1', 'ace'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'REVERSE',
          appliesTo: ['X', 'Z'],
          notes: 'Receive reverse handoff',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake sweep, hand off to WR',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone away from reverse',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'stalk' },
          notes: 'Block on perimeter',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'weak',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_reverse_exchange',
          name: 'Reverse handoff',
          drill: {
            name: 'Reverse Drill',
            purpose: 'Clean RB to WR exchange',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_bootleg',
    name: 'Bootleg',
    conceptType: 'run',
    tier: 2,
    summary: 'Naked bootleg with QB run option',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      preferredStructures: ['ace', 'I', '2x2'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake run opposite',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone away, sell run',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 5 },
          notes: 'Drag to flat',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'corner', depth: 15 },
          notes: 'Corner route option',
        },
        {
          roleName: 'BOOT',
          appliesTo: ['QB'],
          notes: 'Boot away, run or pass',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'weak',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_bootleg_sell',
          name: 'Run fake sell',
          drill: {
            name: 'Bootleg Drill',
            purpose: 'OL sells run, QB boots out',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_waggle',
    name: 'Waggle',
    conceptType: 'run',
    tier: 3,
    summary: 'Waggle with pulling guard for protection',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      preferredStructures: ['ace', 'I', '2x2'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'EMOL' },
          notes: 'Pull and protect QB',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake run opposite',
        },
        {
          roleName: 'ZONE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone away, sell run',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 5 },
          notes: 'Drag to flat',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Dig route option',
        },
        {
          roleName: 'WAGGLE',
          appliesTo: ['QB'],
          notes: 'Waggle out, run or pass',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'weak',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'special',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_waggle_pull',
          name: 'Guard pull protection',
          drill: {
            name: 'Waggle Drill',
            purpose: 'G pulls for QB protection on rollout',
            phase: 'team',
          },
        },
      ],
    },
  },

  // ============================================
  // OPTION - ADDITIONAL (2)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_triple_option',
    name: 'Triple Option',
    conceptType: 'run',
    tier: 3,
    summary: 'Classic triple option with dive, keep, pitch',
    badges: ['option'],
    requirements: {
      preferredStructures: ['I', 'wishbone', 'flexbone'],
      personnelHints: ['21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'VEER_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG'],
          defaultBlock: { scheme: 'veer' },
          notes: 'Veer release, leave DE/OLB unblocked',
        },
        {
          roleName: 'ARC',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'arc', target: 'S' },
          notes: 'Arc to safety',
        },
        {
          roleName: 'DIVE',
          appliesTo: ['FB'],
          notes: 'Dive back for mesh',
        },
        {
          roleName: 'PITCH',
          appliesTo: ['RB'],
          notes: 'Pitch relationship',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          notes: 'Read DE (give/keep), read OLB (keep/pitch)',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['weak', 'both'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'multiple',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_triple_mesh',
          name: 'Triple option mesh',
          drill: {
            name: 'Triple Option Drill',
            purpose: 'QB reads DE/OLB sequentially',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_midline_option',
    name: 'Midline Option',
    conceptType: 'run',
    tier: 3,
    summary: 'Midline option reading 3-tech or nose',
    badges: ['option'],
    requirements: {
      preferredStructures: ['I', 'pistol', 'ace'],
      personnelHints: ['12', '21'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'VEER_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'veer' },
          notes: 'Veer release, leave read key unblocked',
        },
        {
          roleName: 'ARC',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'arc', target: 'PSLB' },
          notes: 'Arc to LB',
        },
        {
          roleName: 'DIVE',
          appliesTo: ['FB', 'RB'],
          notes: 'Dive path for mesh',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          notes: 'Read 3-tech or nose: give or keep',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
        runLandmarks: true,
      },
    },
    suggestionHints: {
      runHints: {
        category: 'option',
        bestVsFront: ['even', 'over'],
        bestVs3T: ['strong', 'both'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_midline_read',
          name: 'Midline read key',
          drill: {
            name: 'Midline Drill',
            purpose: 'QB reads DT, give or keep',
            phase: 'group',
          },
        },
      ],
    },
  },
];

export default RUN_CONCEPTS;
