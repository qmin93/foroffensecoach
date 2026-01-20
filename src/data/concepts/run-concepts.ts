/**
 * Run Concepts (20개) for ForOffenseCoach
 *
 * Categories:
 * - Inside Zone (3): Inside Zone, Split Zone, Duo
 * - Gap/Power (5): Power, Counter, Iso, Tackle Trap, Guard Trap
 * - Outside (5): Outside Zone, Stretch, Toss, Sweep, Buck Sweep
 * - Counter (2): GT Counter, OH Counter
 * - Special (5): Wham, Pin-Pull, QB Power, Read Option, RPO Zone
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
          roleName: 'ZONE_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step', target: 'PSDE' },
          notes: 'Zone step, combo to PSLB',
        },
        {
          roleName: 'ZONE_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo', target: 'DT' },
          notes: 'Combo with C to backside LB',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Double to backside LB',
        },
        {
          roleName: 'ZONE_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step', target: '3T' },
          notes: 'Zone step, climb to Mike',
        },
        {
          roleName: 'ZONE_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach or down block',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim backside A-gap, read NT/DT',
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
          notes: 'Kick out backside DE',
        },
        {
          roleName: 'ZONE_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step playside',
        },
        {
          roleName: 'ZONE_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo' },
          notes: 'Combo to BSLB',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone to backside',
        },
        {
          roleName: 'ZONE_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach' },
          notes: 'Reach DE',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim frontside A, cutback lane created by H kick',
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
          roleName: 'DUO_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Reach/down on DE',
        },
        {
          roleName: 'DUO_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo', target: 'DT' },
          notes: 'Combo with C to Mike',
        },
        {
          roleName: 'DUO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside LB',
        },
        {
          roleName: 'DUO_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          notes: 'Double with RT to Will',
        },
        {
          roleName: 'DUO_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'combo', target: 'DE' },
          notes: 'Combo to Sam',
        },
        {
          roleName: 'DUO_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'arc', target: 'PSLB' },
          notes: 'Arc to LB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim frontside B-gap, press LOS then cut',
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
          notes: 'Kick out end man on LOS',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'PSLB' },
          notes: 'Pull and lead through hole',
        },
        {
          roleName: 'DOWN_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down', target: 'PSDE' },
          notes: 'Down block on DE',
        },
        {
          roleName: 'DOWN_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down', target: 'DT' },
          notes: 'Down block on DT',
        },
        {
          roleName: 'HINGE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down', target: 'NT' },
          notes: 'Back block backside A',
        },
        {
          roleName: 'HINGE_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect puller',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim inside leg of TE, follow puller',
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
          roleName: 'KICK',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          notes: 'Pull and kick EMOL',
        },
        {
          roleName: 'WRAP',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'wrap', target: 'PSLB' },
          notes: 'Pull and wrap for LB',
        },
        {
          roleName: 'DOWN_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Down block on DE',
        },
        {
          roleName: 'DOWN_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down', target: 'DT' },
          notes: 'Down block',
        },
        {
          roleName: 'DOWN_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'down', target: 'NT' },
          notes: 'Down block backside',
        },
        {
          roleName: 'HINGE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Counter step, follow T through hole',
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
          roleName: 'REACH_PST',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach DE, get to edge',
        },
        {
          roleName: 'REACH_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'reach', target: '3T' },
          notes: 'Reach 3-tech',
        },
        {
          roleName: 'COMBO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          notes: 'Combo to backside LB',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step, work to 2nd level',
        },
        {
          roleName: 'ZONE_BST',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step playside',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim outside hip of TE/T, cut back if needed',
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
          roleName: 'REACH_TE',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'reach', target: 'EMOL' },
          notes: 'Reach EMOL',
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
          notes: 'Reach DT',
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
          notes: 'Zone step, work playside',
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
          notes: 'Get to sideline, cut up when you see grass',
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
          roleName: 'PIN',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Pin (down) block DE',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'pull_lead', target: 'OLB' },
          notes: 'Pull to edge for OLB/Force',
        },
        {
          roleName: 'ZONE_PSG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step', target: 'DT' },
          notes: 'Zone to LB level',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_BSG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Zone step',
        },
        {
          roleName: 'HINGE',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Hinge protect',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim outside TE, follow pulling tackle',
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
          notes: 'Zone away from read key',
        },
        {
          roleName: 'READ_KEY',
          appliesTo: [],
          notes: 'BSDE is unblocked read',
        },
        {
          roleName: 'MESH',
          appliesTo: ['RB'],
          notes: 'Inside zone path, wait for mesh decision',
        },
        {
          roleName: 'DECISION',
          appliesTo: ['QB'],
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
          notes: 'Zone blocking, stay behind LOS',
        },
        {
          roleName: 'BUBBLE',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'bubble', depth: 1 },
          notes: 'Bubble screen option',
        },
        {
          roleName: 'SLANT',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'slant', depth: 6 },
          notes: 'Slant as quick pass option',
        },
        {
          roleName: 'STALK',
          appliesTo: ['X'],
          defaultBlock: { scheme: 'seal' },
          notes: 'Stalk block for bubble',
        },
        {
          roleName: 'RUN',
          appliesTo: ['RB'],
          notes: 'Inside zone track',
        },
        {
          roleName: 'READ',
          appliesTo: ['QB'],
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
];

export default RUN_CONCEPTS;
