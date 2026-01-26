/**
 * Core Run Concepts (26개) - modern install staples 중심
 *
 * Zone (5):
 * - Inside Zone, Split Zone, Duo, Mid Zone, Outside Zone
 *
 * Gap/Man (9):
 * - Power, GT Counter, Down G, Dart, Insert, Lead Iso, Guard Trap, Wham, FB Dive
 *
 * Perimeter (4):
 * - Pin-Pull, Toss, Jet Sweep, End Around
 *
 * QB/Option/RPO (8):
 * - QB Power, Draw, Lead Draw, Read Option, Zone Arc, Power Read, Speed Option, RPO Zone
 */

import type { Concept } from '@/types/concept';

export const RUN_CONCEPTS: Concept[] = [
  // ============================================
  // ZONE (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_inside_zone',
    name: 'Inside Zone',
    conceptType: 'run',
    tier: 1,
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
          assignment: 'LT: Zone step, combo to PSLB',
          notes: 'Zone step, combo to PSLB',
        },
        {
          roleName: 'ZONE_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo', target: 'DT' },
          assignment: 'LG: Combo with C to backside LB',
          notes: 'Combo with C to backside LB',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          assignment: 'C: Double to backside LB',
          notes: 'Double to backside LB',
        },
        {
          roleName: 'ZONE_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step', target: '3T' },
          assignment: 'RG: Zone step, climb to Mike',
          notes: 'Zone step, climb to Mike',
        },
        {
          roleName: 'ZONE_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          assignment: 'RT: Reach or down block',
          notes: 'Reach or down block',
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
          assignment:
            'RB: Aim play-side A-gap / inside leg of PS guard; read first down lineman past center for cutback',
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
          assignment: 'Y/H/FB: Kick out backside DE',
          notes: 'Kick out backside DE',
        },
        {
          roleName: 'ZONE_LT',
          appliesTo: ['LT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'LT: Zone step playside',
          notes: 'Zone step playside',
        },
        {
          roleName: 'ZONE_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo' },
          assignment: 'LG: Combo to BSLB',
          notes: 'Combo to BSLB',
        },
        {
          roleName: 'ZONE_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'C: Zone to backside',
          notes: 'Zone to backside',
        },
        {
          roleName: 'ZONE_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'RG: Zone step',
          notes: 'Zone step',
        },
        {
          roleName: 'ZONE_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'RT: Reach DE',
          notes: 'Reach DE',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block on CB',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim frontside A, cutback lane created by H kick',
          notes: 'Read slice block, cut off backside',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Mesh timing — handoff',
          notes: 'Mesh timing with RB',
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
          assignment: 'LT: Reach/down on DE',
          notes: 'Reach/down on DE',
        },
        {
          roleName: 'DUO_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'combo', target: 'DT' },
          assignment: 'LG: Combo with C to Mike',
          notes: 'Combo with C to Mike',
        },
        {
          roleName: 'DUO_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'combo', target: 'NT' },
          assignment: 'C: Combo to backside LB',
          notes: 'Combo to backside LB',
        },
        {
          roleName: 'DUO_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'combo', target: '3T' },
          assignment: 'RG: Double with RT to Will',
          notes: 'Double with RT to Will',
        },
        {
          roleName: 'DUO_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'combo', target: 'DE' },
          assignment: 'RT: Combo to Sam',
          notes: 'Combo to Sam',
        },
        {
          roleName: 'DUO_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'down', target: 'DE' },
          assignment: 'TE: Base/down on edge (Duo = doubles + vertical push)',
          notes: 'Base/down on edge to create extra gap',
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
          assignment: 'RB: Aim frontside B-gap, press LOS then cut',
          notes: 'Press A-gap, bang or bounce',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Straight handoff',
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
    id: 'run_mid_zone',
    name: 'Mid Zone',
    conceptType: 'run',
    tier: 1,
    summary: 'Zone run between inside and outside zone aiming points',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'ZONE',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'OL: Mid zone steps',
          notes: 'Mid zone steps',
        },
        {
          roleName: 'ZONE_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'zone_step' },
          assignment: 'TE: Zone/Reach',
          notes: 'Zone or reach block',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          assignment: 'RB: Aim play-side B/C gap, one cut',
          notes: 'Aim play-side B/C gap',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Mesh — handoff',
          notes: 'Mesh with RB',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_mid_track',
          name: 'RB track discipline',
          drill: {
            name: 'Track Drill',
            purpose: 'B-gap track with tight cut',
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
    tier: 1,
    summary:
      'Stretch zone run to the edge, RB presses outside hip of TE/OT then cuts upfield',
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
          assignment: 'LT: Reach edge',
          notes: 'Reach edge',
        },
        {
          roleName: 'REACH_LG',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'reach', target: 'DT' },
          assignment: 'LG: Reach / combo',
          notes: 'Reach / combo',
        },
        {
          roleName: 'REACH_C',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'reach', target: 'NT' },
          assignment: 'C: Reach / scoop',
          notes: 'Reach / scoop',
        },
        {
          roleName: 'REACH_RG',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'reach', target: '3T' },
          assignment: 'RG: Reach',
          notes: 'Reach',
        },
        {
          roleName: 'REACH_RT',
          appliesTo: ['RT'],
          defaultBlock: { scheme: 'reach', target: 'DE' },
          assignment: 'RT: Reach',
          notes: 'Reach',
        },
        {
          roleName: 'ZONE_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'TE: Reach EMOL — seal',
          notes: 'Reach and seal EMOL',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk/Crack',
          notes: 'Stalk or crack on safety',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim outside leg of TE/OT, press wide then one-cut',
          notes: 'Press outside, bend back to cutback',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open step — handoff',
          notes: 'Open step playside',
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

  // ============================================
  // GAP/MAN (9)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power',
    name: 'Power',
    conceptType: 'run',
    tier: 1,
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
          assignment: 'OL/TE: Down blocks to create gap',
          notes: 'Down blocks to create gap; TE typically down/base on edge',
        },
        {
          roleName: 'PULL',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          assignment: 'BSG: Pull to kick out EMOL',
          notes: 'Backside guard pulls to kick out EMOL',
        },
        {
          roleName: 'BACK',
          appliesTo: ['H', 'FB'],
          defaultBlock: { scheme: 'lead', target: 'PSLB' },
          assignment: 'FB/H: Lead through for playside LB',
          notes: 'Lead through for playside LB',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim playside B-gap, read kick-out and wrap',
          notes: 'Follow puller, press inside leg',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff — boot fake',
          notes: 'Handoff then boot fake',
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
    tier: 1,
    summary:
      'Gap run with backside guard and tackle pulling (G-T) — guard kicks, tackle wraps',
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
          assignment: 'OL: Down blocks away from pullers',
          notes: 'Down blocks away from pullers',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          assignment: 'G: Pull to kick out EMOL',
          notes: 'Guard pulls to kick out EMOL',
        },
        {
          roleName: 'PULL_T',
          appliesTo: ['RT', 'LT'],
          defaultBlock: { scheme: 'wrap', target: 'PSLB' },
          assignment: 'T: Wrap inside to playside LB',
          notes: 'Tackle wraps inside to playside LB',
        },
        {
          roleName: 'BACKSIDE_SEAL',
          appliesTo: ['RT', 'LT'],
          defaultBlock: { scheme: 'hinge' },
          assignment: 'BST: Backside hinge if not pulling',
          notes: 'Backside hinge if not pulling',
        },
        {
          roleName: 'ZONE_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'down' },
          assignment: 'TE: Down — seal',
          notes: 'Down block and seal',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Counter step then hit backside A/B gap behind pullers',
          notes: 'Counter step, follow tackle wrap',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Fake opposite — handoff',
          notes: 'Fake opposite, handoff',
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
    id: 'run_down_g',
    name: 'Down G',
    conceptType: 'run',
    tier: 1,
    summary: 'Gap scheme with guard pulling and TE/FB lead',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['12', '21', '22'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Down block',
          notes: 'Down block playside',
        },
        {
          roleName: 'PULLER',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'log' },
          assignment: 'G: Pull log/kick',
          notes: 'Guard pulls to log or kick',
        },
        {
          roleName: 'KICK_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'kick' },
          assignment: 'TE: Kick out EMOL',
          notes: 'Kick out EMOL',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Follow guard — cut up',
          notes: 'Follow guard, cut upfield',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Straight handoff',
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
        bestVsFront: ['odd'],
        bestVs3T: ['strong'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_down_g_te',
          name: 'TE kick technique',
          drill: {
            name: 'TE Kick Drill',
            purpose: 'TE kick angle on EMOL',
            phase: 'indy',
          },
        },
      ],
    },
  },
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_dart',
    name: 'Dart',
    conceptType: 'run',
    tier: 1,
    summary: 'Quick-hitting tackle pull scheme',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol', '2x2'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'T',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Down block',
          notes: 'Down block, create lane',
        },
        {
          roleName: 'PULLER',
          appliesTo: ['RT', 'LT'],
          defaultBlock: { scheme: 'wrap' },
          assignment: 'T: Pull wrap to hole',
          notes: 'Tackle pulls to hole',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: One-cut behind puller',
          notes: 'Quick one-cut behind tackle',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Quick handoff',
          notes: 'Quick handoff',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_dart_timing',
          name: 'Tackle pull timing',
          drill: {
            name: 'Dart Pull Drill',
            purpose: 'Quick tackle pull path',
            phase: 'indy',
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
    tier: 1,
    summary: 'Zone with H-back inserting for LB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol', '2x2'],
      personnelHints: ['12', '21'],
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
          assignment: 'OL: Zone step',
          notes: 'Zone step playside',
        },
        {
          roleName: 'INSERT',
          appliesTo: ['H', 'FB', 'Y'],
          defaultBlock: { scheme: 'lead' },
          assignment: 'H: Insert for PSLB',
          notes: 'Insert block on PSLB',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Follow insert — cut',
          notes: 'Follow insert, one cut',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Handoff to RB',
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
        bestVsFront: ['odd'],
        bestVs3T: ['none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_insert_path',
          name: 'Insert path & timing',
          drill: {
            name: 'Insert Block Drill',
            purpose: 'H-back insert timing',
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
    tier: 1,
    summary: 'FB leads on MLB, RB follows',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace'],
      personnelHints: ['21', '22'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'BASE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Base block — seal',
          notes: 'Base block, seal gaps',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['FB'],
          defaultBlock: { scheme: 'lead' },
          assignment: 'FB: Lead on MLB',
          notes: 'Lead block on MLB',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Follow FB — north/south',
          notes: 'Follow FB, north/south',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Handoff',
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
        bestVsFront: ['odd'],
        bestVs3T: ['none'],
        bestWhenBox: ['7', '8'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_iso_fit',
          name: 'FB lead fit',
          drill: {
            name: 'Lead Block Fit Drill',
            purpose: 'FB fitting on MLB',
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
    tier: 1,
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
          assignment: 'G: Trap first DL past center (often 3T)',
          notes: 'Trap first DL past center (often 3T)',
        },
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'C', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Down blocks to wash',
          notes: 'Down blocks to wash',
        },
        {
          roleName: 'BACKSIDE_HINGE',
          appliesTo: ['LT', 'RT'],
          defaultBlock: { scheme: 'hinge' },
          assignment: 'BST: Hinge if not down blocking',
          notes: 'Hinge if not down blocking',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim inside leg of trapper, hit downhill',
          notes: 'Aim behind trap block',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Quick handoff',
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
        category: 'gap',
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
    tier: 1,
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
          assignment: 'H/Y/FB: Wham trap DL from off-ball alignment',
          notes: 'Wham trap DL from off-ball alignment',
        },
        {
          roleName: 'BASE',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Base blocks; create lane behind wham',
          notes: 'Base blocks; create lane behind wham',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Hit inside behind wham kick, one-cut vertical',
          notes: 'Cut behind wham block',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Quick handoff',
          notes: 'Quick handoff',
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
    id: 'run_fb_dive',
    name: 'FB Dive',
    conceptType: 'run',
    tier: 1,
    summary: 'Quick FB dive up A-gap',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I'],
      personnelHints: ['21', '22'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '8_risky',
    },
    template: {
      roles: [
        {
          roleName: 'BASE_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Base drive',
          notes: 'Base block, drive',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['FB'],
          assignment: 'FB: Dive A-gap',
          notes: 'Quick dive A-gap',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['RB'],
          defaultBlock: { scheme: 'lead' },
          assignment: 'RB: Lead/Fake',
          notes: 'Lead or fake action',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff to FB',
          notes: 'Handoff to FB',
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
        bestVs3T: ['none'],
        bestWhenBox: ['8'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_dive_pad',
          name: 'FB pad level',
          drill: {
            name: 'Dive Pad Drill',
            purpose: 'Low pad on dive',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // PERIMETER (4)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_pin_pull',
    name: 'Pin-Pull',
    conceptType: 'run',
    tier: 1,
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
          assignment: 'OT/TE: Pin inside defenders',
          notes: 'Pin inside defenders',
        },
        {
          roleName: 'PULL',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'FORCE' },
          assignment: 'G: Pull to edge; first puller logs/kicks force',
          notes: 'Pull to edge; first puller logs/kicks force',
        },
        {
          roleName: 'WR_STALK',
          appliesTo: ['X', 'Z', 'H'],
          defaultBlock: { scheme: 'seal', target: 'CB' },
          assignment: 'WR: Stalk/seal on perimeter',
          notes: 'Stalk/seal on perimeter',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Aim outside, get to numbers then cut vertical',
          notes: 'Follow pullers to edge',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Handoff',
          notes: 'Handoff',
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
    id: 'run_toss',
    name: 'Toss',
    conceptType: 'run',
    tier: 1,
    summary: 'Perimeter run with toss to RB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['I', 'ace', 'pistol'],
      personnelHints: ['11', '12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'REACH_OL',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'OL: Reach — seal inside',
          notes: 'Reach block playside',
        },
        {
          roleName: 'PULLER',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_kick' },
          assignment: 'G: Pull kick force',
          notes: 'Pull kick force player',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['FB', 'H'],
          defaultBlock: { scheme: 'lead' },
          assignment: 'FB: Lead to alley',
          notes: 'Lead to alley',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Catch toss — get edge',
          notes: 'Catch toss, get to edge',
        },
        {
          roleName: 'QB_TOSS',
          appliesTo: ['QB'],
          assignment: 'QB: Toss to RB',
          notes: 'Toss to RB',
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
        bestVs3T: ['weak'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_required',
        aim: 'd_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_toss_timing',
          name: 'Toss timing',
          drill: {
            name: 'Toss Timing Drill',
            purpose: 'QB/RB toss timing',
            phase: 'group',
          },
        },
      ],
    },
  },
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_jet_sweep',
    name: 'Jet Sweep',
    conceptType: 'run',
    tier: 1,
    summary: 'Full-speed jet motion handoff attacking edge',
    badges: ['spread'],
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
          roleName: 'JET',
          appliesTo: ['Z', 'H'],
          assignment: 'Z/H: Jet motion at snap — full speed to edge',
          notes: 'Jet motion at snap',
        },
        {
          roleName: 'PIN',
          appliesTo: ['LT', 'LG', 'Y'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL/TE: Pin inside defenders',
          notes: 'Pin inside',
        },
        {
          roleName: 'CRACK',
          appliesTo: ['X', 'Z', 'WR'],
          defaultBlock: { scheme: 'crack' },
          assignment: 'WR: Crack safety/force',
          notes: 'Crack on safety',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Mesh timing with jet',
          notes: 'Mesh timing with jet',
        },
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          assignment: 'RB: Fake inside',
          notes: 'Fake inside run',
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
        bestVs3T: ['weak'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_jet_timing',
          name: 'Jet timing',
          drill: {
            name: 'Jet Timing Drill',
            purpose: 'Motion timing with snap',
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
    tier: 1,
    summary: 'Reverse handoff after fake action',
    badges: ['situational'],
    requirements: {
      preferredStructures: ['2x2'],
      personnelHints: ['10'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          assignment: 'RB: Fake opposite direction',
          notes: 'Fake opposite direction',
        },
        {
          roleName: 'CARRY',
          appliesTo: ['X', 'Z'],
          assignment: 'WR: Take reverse handoff',
          notes: 'Take reverse handoff',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Fake to RB — give reverse',
          notes: 'Fake to RB, give to WR',
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
        bestVs3T: ['none'],
        bestWhenBox: ['6'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_end_timing',
          name: 'End around timing',
          drill: {
            name: 'End Around Timing Drill',
            purpose: 'WR path and timing',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // QB/OPTION/RPO (8)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_power',
    name: 'QB Power',
    conceptType: 'run',
    tier: 1,
    summary: 'Power run with QB as ball carrier and RB leading',
    badges: ['college'],
    requirements: {
      preferredStructures: ['2x2', 'pistol'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PULL_G',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          assignment: 'G: Guard kicks out EMOL',
          notes: 'Guard kicks out',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['RB'],
          defaultBlock: { scheme: 'lead', target: 'PSLB' },
          assignment: 'RB: Lead for QB through B-gap',
          notes: 'RB leads for QB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['QB'],
          assignment: 'QB: Hit B-gap behind puller',
          notes: 'QB hits B-gap behind puller',
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
        bestVs3T: ['strong'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_qb_power_mesh',
          name: 'QB fake & run',
          drill: {
            name: 'QB Power Drill',
            purpose: 'QB fake then follow puller',
            phase: 'group',
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
          assignment: 'OL: Sell pass, then release to second level',
          notes: 'Sell pass, then release to second level',
        },
        {
          roleName: 'DELAY',
          appliesTo: ['RB'],
          assignment: 'RB: Delay count, then hit A/B gap',
          notes: 'Delay then take handoff',
        },
        {
          roleName: 'QB_SELL',
          appliesTo: ['QB'],
          assignment: 'QB: Show pass set, carry fake',
          notes: 'Sell pass, delayed handoff',
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
    tier: 1,
    summary: 'Draw with FB/H leading',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol'],
      personnelHints: ['12', '21'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'PASS_SET',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'pass_set' },
          assignment: 'OL: Pass set — drive',
          notes: 'Pass set then drive',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['H', 'FB'],
          defaultBlock: { scheme: 'lead' },
          assignment: 'H/FB: Lead on LB',
          notes: 'Lead block on LB',
        },
        {
          roleName: 'BALL_CARRIER',
          appliesTo: ['RB'],
          assignment: 'RB: Follow lead — take handoff',
          notes: 'Follow lead, take handoff',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Pass fake — handoff',
          notes: 'Pass fake then handoff',
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
        bestVs3T: ['none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_lead_draw_timing',
          name: 'Lead timing',
          drill: {
            name: 'Lead Draw Drill',
            purpose: 'Lead block timing on draw',
            phase: 'group',
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
    summary: 'Zone read with QB reading unblocked DE',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol'],
      personnelHints: ['11', '12'],
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
          assignment: 'OL: Zone — leave read key',
          notes: 'Zone step, leave BSDE unblocked',
        },
        {
          roleName: 'STALK_WR',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultBlock: { scheme: 'stalk' },
          assignment: 'WR: Stalk',
          notes: 'Stalk block',
        },
        {
          roleName: 'MESH',
          appliesTo: ['RB'],
          assignment: 'RB: Mesh — run zone',
          notes: 'Mesh with QB, run zone',
        },
        {
          roleName: 'READ_KEY',
          appliesTo: ['QB'],
          assignment: 'QB: Read DE — give or keep',
          notes: 'Read BSDE, give or keep',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_read_mesh',
          name: 'Mesh point',
          drill: {
            name: 'Mesh Point Drill',
            purpose: 'QB/RB mesh and read timing',
            phase: 'group',
          },
        },
        {
          id: 'fp_read_key',
          name: 'Read key ID',
          drill: {
            name: 'Read Key Drill',
            purpose: 'QB reading BSDE',
            phase: 'indy',
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
    tier: 1,
    summary: 'Zone read with H-back arc blocking',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol'],
      personnelHints: ['11', '12'],
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
          assignment: 'OL: Zone step',
          notes: 'Zone step playside',
        },
        {
          roleName: 'ARC',
          appliesTo: ['H', 'Y'],
          defaultBlock: { scheme: 'arc' },
          assignment: 'H: Arc to safety',
          notes: 'Arc block on safety',
        },
        {
          roleName: 'MESH',
          appliesTo: ['RB'],
          assignment: 'RB: Mesh — run zone',
          notes: 'Mesh with QB, run zone',
        },
        {
          roleName: 'READ_KEY',
          appliesTo: ['QB'],
          assignment: 'QB: Read DE — give or pull',
          notes: 'Read DE, pull to arc block',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'c_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_arc_angle',
          name: 'Arc angle',
          drill: {
            name: 'Arc Block Drill',
            purpose: 'H-back arc path to safety',
            phase: 'indy',
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
    tier: 1,
    summary: 'Read play-side end: RB sweep vs QB keep inside power',
    badges: ['spread'],
    requirements: {
      preferredStructures: ['2x2', '3x1', 'pistol'],
      personnelHints: ['10', '11'],
      needsTE: false,
      needsPuller: 'G',
      boxTolerance: '6_ok',
    },
    template: {
      roles: [
        {
          roleName: 'READ',
          appliesTo: ['QB'],
          assignment: 'QB: Read play-side DE — keep or give sweep',
          notes: 'Read play-side DE',
        },
        {
          roleName: 'SWEEP',
          appliesTo: ['RB'],
          assignment: 'RB: Sweep path if DE squeezes',
          notes: 'Sweep path if DE squeezes',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'PSLB' },
          assignment: 'G: Pull to lead QB on keep',
          notes: 'Pull to lead QB on keep',
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
        bestVsFront: ['even'],
        bestVs3T: ['strong'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_power_read_key',
          name: 'Power read key',
          drill: {
            name: 'Power Read Drill',
            purpose: 'QB reading EMOL on power',
            phase: 'group',
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
    tier: 1,
    summary: 'Quick pitch option off zone action',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol'],
      personnelHints: ['11', '12'],
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
          assignment: 'OL: Zone step playside',
          notes: 'Zone step',
        },
        {
          roleName: 'ARC',
          appliesTo: ['H', 'Y'],
          defaultBlock: { scheme: 'arc' },
          assignment: 'Y/H: Arc to force',
          notes: 'Arc to force player',
        },
        {
          roleName: 'PITCH',
          appliesTo: ['RB'],
          assignment: 'RB: Pitch relation',
          notes: 'Maintain pitch relation',
        },
        {
          roleName: 'OPTION_QB',
          appliesTo: ['QB'],
          assignment: 'QB: Attack edge — pitch or keep',
          notes: 'Attack edge, pitch or keep',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'd_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_speed_pitch',
          name: 'Pitch timing',
          drill: {
            name: 'Speed Option Drill',
            purpose: 'QB/RB pitch relation and timing',
            phase: 'group',
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
    summary: 'Zone run with pass option based on LB',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['shotgun', 'pistol', '2x2', '3x1'],
      personnelHints: ['11', '12'],
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
          assignment: 'OL: Zone step (stay legal)',
          notes: 'Zone step, stay behind LOS',
        },
        {
          roleName: 'RPO_ROUTE',
          appliesTo: ['X', 'Z', 'H', 'WR'],
          defaultRoute: { pattern: 'slant', depth: 5 },
          assignment: 'WR: Quick route (slant/bubble)',
          notes: 'Quick route for RPO read',
        },
        {
          roleName: 'MESH',
          appliesTo: ['RB'],
          assignment: 'RB: Mesh — run zone',
          notes: 'Mesh, run zone',
        },
        {
          roleName: 'RPO_READ',
          appliesTo: ['QB'],
          assignment: 'QB: Read LB — give or throw',
          notes: 'Read LB, give or throw RPO',
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
        bestVsFront: ['even'],
        bestVs3T: ['weak'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_optional',
        aim: 'a_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_rpo_key',
          name: 'RPO read key',
          drill: {
            name: 'RPO Key Drill',
            purpose: 'QB reading LB for RPO',
            phase: 'group',
          },
        },
        {
          id: 'fp_rpo_ol',
          name: 'OL staying legal',
          drill: {
            name: 'RPO OL Drill',
            purpose: 'OL zone without crossing LOS',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // AUDIT 2 ADDITIONS
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_counter_h_insert',
    name: 'Counter (H Insert)',
    conceptType: 'run',
    tier: 1,
    summary: 'Counter run with H-back inserting on playside LB; no wrap tackle',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol', 'I'],
      personnelHints: ['11', '12', '21'],
      needsTE: true,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'DOWN',
          appliesTo: ['LT', 'LG', 'C'],
          defaultBlock: { scheme: 'down' },
          assignment: 'OL: Down blocks away from insert',
          notes: 'Down blocks away from insert',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          assignment: 'G: Kick out EMOL',
          notes: 'Guard kicks out EMOL',
        },
        {
          roleName: 'INSERT',
          appliesTo: ['H', 'Y', 'FB'],
          defaultBlock: { scheme: 'insert', target: 'PSLB' },
          assignment: 'H/Y: Insert through B-gap for playside LB',
          notes: 'Insert through B-gap for playside LB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          assignment: 'RB: Counter step, hit B-gap behind kick and insert',
          notes: 'Counter step, hit B-gap behind kick and insert',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Fake opposite — handoff',
          notes: 'Fake opposite, handoff',
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
        bestVsFront: ['even', 'under'],
        bestVs3T: ['strong', 'none'],
        bestWhenBox: ['7'],
        surfaceNeeds: 'te_required',
        aim: 'b_gap',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_counter_insert_timing',
          name: 'Insert timing',
          drill: {
            name: 'H Insert Drill',
            purpose: 'H insert path and timing',
            phase: 'group',
          },
        },
      ],
    },
  },
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_draw',
    name: 'QB Draw',
    conceptType: 'run',
    tier: 1,
    summary: 'Pass look with QB delayed draw',
    badges: ['spread'],
    requirements: {
      preferredStructures: ['empty', '2x2'],
      personnelHints: ['10'],
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
          assignment: 'OL: Sell pass, release to second level',
          notes: 'Sell pass',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['QB'],
          assignment: 'QB: Delay then hit inside',
          notes: 'Delay then hit inside',
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
          id: 'fp_qb_draw_sell',
          name: 'QB draw sell',
          drill: {
            name: 'QB Draw Drill',
            purpose: 'OL sells pass, QB delays',
            phase: 'team',
          },
        },
      ],
    },
  },
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_crack_toss',
    name: 'Crack Toss / Pin-Toss',
    conceptType: 'run',
    tier: 1,
    summary: 'Perimeter toss with WR cracking and OL pulling',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'G',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'CRACK',
          appliesTo: ['X', 'Z'],
          defaultBlock: { scheme: 'crack', target: 'LB' },
          assignment: 'WR: Crack on force defender',
          notes: 'Crack on force defender',
        },
        {
          roleName: 'PULL',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'EDGE' },
          assignment: 'G: Lead to perimeter',
          notes: 'Lead to perimeter',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          assignment: 'RB: Catch toss and race to edge',
          notes: 'Catch toss and race to edge',
        },
        {
          roleName: 'QB_TOSS',
          appliesTo: ['QB'],
          assignment: 'QB: Toss to RB',
          notes: 'Toss to RB',
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
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_crack_toss_timing',
          name: 'Crack toss timing',
          drill: {
            name: 'Crack Toss Drill',
            purpose: 'WR crack and toss timing',
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
    name: 'Stretch (OZ Variant)',
    conceptType: 'run',
    tier: 1,
    summary: 'Fast-flow outside zone emphasizing horizontal stretch',
    badges: ['nfl_style'],
    requirements: {
      preferredStructures: ['ace', 'pistol'],
      personnelHints: ['11', '12'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '7_ok',
    },
    template: {
      roles: [
        {
          roleName: 'REACH',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'OL: Reach and run',
          notes: 'Reach and run',
        },
        {
          roleName: 'ZONE_TE',
          appliesTo: ['TE', 'Y'],
          defaultBlock: { scheme: 'reach' },
          assignment: 'TE: Reach and seal',
          notes: 'Reach and seal edge',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          assignment: 'RB: Aim wide, one-cut vertical',
          notes: 'Aim wide, one-cut vertical',
        },
        {
          roleName: 'QB_HANDOFF',
          appliesTo: ['QB'],
          assignment: 'QB: Open step — handoff',
          notes: 'Open step playside',
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
        bestVs3T: ['weak', 'none'],
        bestWhenBox: ['6', '7'],
        surfaceNeeds: 'te_optional',
        aim: 'edge',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_stretch_reach',
          name: 'Stretch reach steps',
          drill: {
            name: 'Stretch Reach Drill',
            purpose: 'Fast reach steps to seal edge',
            phase: 'group',
          },
        },
      ],
    },
  },
];

export default RUN_CONCEPTS;
