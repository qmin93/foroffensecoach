/**
 * RUN Audit 1 (10 concepts) — modern zone+gap+perimeter core
 * 대상 10:
 * - Inside Zone, Split Zone, Outside Zone, Duo
 * - Power, GT Counter
 * - Pin-Pull
 * - Guard Trap, Wham
 * - Draw
 */

import type { Concept } from '@/types/concept';

export const RUN_CONCEPTS: Concept[] = [
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_inside_zone',
    name: 'Inside Zone',
    conceptType: 'run',
    summary:
      'Downhill zone run: RB aims play-side A-gap/inside leg of guard, reads first down lineman past the center for cutback',
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
          notes:
            'Aim play-side A-gap / inside leg of PS guard; read first down lineman past center for cutback',
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
    id: 'run_outside_zone',
    name: 'Outside Zone (Wide Zone)',
    conceptType: 'run',
    summary: 'Stretch zone run to the edge, RB presses outside hip of TE/OT then cuts upfield',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', '2x2', 'pistol'],
      personnelHints: ['11', '12', '21'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'REACH_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach edge',
        },
        {
          roleName: 'REACH_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'reach', target: 'DT' },
          notes: 'Reach / combo',
        },
        {
          roleName: 'REACH_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach', target: 'NT' },
          notes: 'Reach / scoop',
        },
        {
          roleName: 'REACH_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'reach', target: '3T' },
          notes: 'Reach',
        },
        {
          roleName: 'REACH_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          notes: 'Reach',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim outside leg of TE/OT, press wide then one-cut',
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
        bestVsFront: ['even', 'under'],
        bestVs3T: ['strong', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_oz_reach',
          name: 'Reach leverage',
          drill: {
            name: 'Reach Drill',
            purpose: 'Reach and run feet to seal edge',
            phase: 'group',
          },
        },
        {
          id: 'fp_oz_onecut',
          name: 'RB one-cut decision',
          drill: {
            name: 'One-Cut Drill',
            purpose: 'Press then plant and go vertical',
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
    summary:
      "Downhill inside run with double teams at the point of attack — often taught as 'Power without a puller'",
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
          defaultBlock: { scheme: 'down', target: 'DE' },
          notes: 'Base/down on edge to create extra gap (Duo = doubles + vertical push)',
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

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power',
    name: 'Power',
    conceptType: 'run',
    summary: 'Gap run with backside guard pulling to kick out, RB hits playside B-gap',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'LG', 'C', 'RT', 'Y'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down blocks to create gap; TE typically down/base on edge',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          notes: 'Backside guard pulls to kick out EMOL',
        },
        {
          roleName: 'BACK',
          appliesTo: ['H', 'FB', 'RB'],
          defaultBlock: { scheme: 'lead', target: 'PSLB' },
          notes: 'Lead through for playside LB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim playside B-gap, read kick-out and wrap',
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
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_preferred',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_power_kick',
          name: 'Kick-out block angle',
          drill: {
            name: 'Pull & Kick Drill',
            purpose: 'Puller kicks out with inside leverage',
            phase: 'group',
          },
        },
        {
          id: 'fp_power_track',
          name: 'RB track and press',
          drill: {
            name: 'Power Track Drill',
            purpose: 'RB presses B-gap behind puller',
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
    summary: 'Gap run with backside guard and tackle pulling (G-T) — guard kicks, tackle wraps',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol', 'I'],
      personnelHints: ['11', '12', '21'],
      needsTE: false,
      needsPuller: 'GT',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'LG', 'C'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down blocks away from pullers',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          notes: 'Guard pulls to kick out EMOL',
        },
        {
          roleName: 'PULL_T',
          appliesTo: ['RT', 'LT'],
          defaultBlock: { scheme: 'pull_wrap', target: 'PSLB' },
          notes: 'Tackle wraps inside to playside LB',
        },
        {
          roleName: 'BACKSIDE_SEAL',
          appliesTo: ['RT', 'LT'],
          defaultBlock: { scheme: 'hinge' },
          notes: 'Backside hinge if not pulling',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Counter step then hit backside A/B gap behind pullers',
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
        category: 'counter',
        bestVsFront: ['even', 'odd'],
        bestVs3T: ['strong', 'none'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_counter_pulls',
          name: 'Pull timing & spacing',
          drill: {
            name: 'GT Pull Drill',
            purpose: 'Guard kicks, tackle wraps with spacing',
            phase: 'group',
          },
        },
        {
          id: 'fp_counter_track',
          name: 'RB counter step and entry',
          drill: {
            name: 'Counter Track Drill',
            purpose: 'RB counter step then downhill entry',
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
    summary: 'Perimeter run: down blocks (pin) inside, pullers lead to edge',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PIN',
          appliesTo: ['LT', 'RT', 'Y'],
          defaultBlock: { scheme: 'down', target: 'DT' },
          notes: 'Pin inside defenders',
        },
        {
          roleName: 'PULL',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'FORCE' },
          notes: 'Pull to edge; first puller logs/kicks force',
        },
        {
          roleName: 'WR_STALK',
          appliesTo: ['X', 'Z', 'H'],
          defaultBlock: { scheme: 'seal', target: 'CB' },
          notes: 'Stalk/seal on perimeter',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim outside, get to numbers then cut vertical',
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
        category: 'perimeter',
        bestVsFront: ['even', 'under'],
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_pin_pull_angles',
          name: 'Pin angles & pull spacing',
          drill: {
            name: 'Pin-Pull Fit Drill',
            purpose: 'Correct down angles and puller spacing',
            phase: 'group',
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
    summary: 'Quick hitting trap: guard pulls to trap first down lineman (3T/1T)',
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
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'trap', target: '3T' },
          notes: 'Trap first DL past center (often 3T)',
        },
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'C', 'RT'],
          defaultBlock: { scheme: 'down' },
          notes: 'Down blocks to wash',
        },
        {
          roleName: 'BACKSIDE_HINGE',
          appliesTo: ['LT', 'RT'],
          defaultBlock: { scheme: 'hinge' },
          notes: 'Hinge if not down blocking',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim inside leg of trapper, hit downhill',
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
        category: 'trap',
        bestVsFront: ['even', 'under'],
        bestVs3T: ['strong', 'weak'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_trap_aim',
          name: 'Trap aiming point',
          drill: {
            name: 'Trap Track Drill',
            purpose: 'RB aims inside leg of trapper',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_wham',
    name: 'Wham',
    conceptType: 'run',
    summary: 'Trap a DL with TE/H/FB from off the ball (wham block)',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'I'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'WHAM',
          appliesTo: ['H', 'Y', 'FB'],
          defaultBlock: { scheme: 'wham', target: '1T' },
          notes: 'Wham trap DL from off-ball alignment',
        },
        {
          roleName: 'BASE',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'base' },
          notes: 'Base blocks; create lane behind wham',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Hit inside behind wham kick, one-cut vertical',
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
        category: 'trap',
        bestVsFront: ['odd', 'even'],
        bestVs3T: ['none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_required',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_wham_timing',
          name: 'Wham timing',
          drill: {
            name: 'Wham Timing Drill',
            purpose: 'Off-ball trap timing and angle',
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
    summary: 'Pass set then run: OL sells pass, RB delays then hits A/B gap',
    badges: ['spread'],
    requirements: {
      preferredStructures: ['2x2', 'empty', 'pistol'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PASS_SET',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'pass_set' },
          notes: 'Sell pass, then release to second level',
        },
        {
          roleName: 'DELAY',
          appliesTo: ['RB'],
          notes: 'Delay count, then hit A/B gap',
        },
        {
          roleName: 'QB_SELL',
          appliesTo: ['QB'],
          notes: 'Show pass set, carry fake',
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
];

export default RUN_CONCEPTS;
