/**
 * run-concepts.audit3.ts
 * RUN Precision Audit — Core 20 Concepts (Audit3)
 * 구성: Audit1(10) + Audit2(10) = 20개
 *
 * 라벨 표준:
 * QB, RB, FB, X, Z, Y(TE), H(H-back/slot), LT, LG, C, RG, RT
 */

import type { Concept } from '@/types/concept';

export const RUN_CONCEPTS_AUDIT3: Concept[] = [
  /* =========================
   * Audit1 — Core 10
   * ========================= */
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
        { roleName: 'ZONE_LT', appliesTo: ['LT'], defaultBlock: { scheme: 'zone_step', target: 'PSDE' } },
        { roleName: 'ZONE_LG', appliesTo: ['LG'], defaultBlock: { scheme: 'combo', target: 'DT' } },
        { roleName: 'ZONE_C', appliesTo: ['C'], defaultBlock: { scheme: 'combo', target: 'NT' } },
        { roleName: 'ZONE_RG', appliesTo: ['RG'], defaultBlock: { scheme: 'zone_step', target: '3T' } },
        { roleName: 'ZONE_RT', appliesTo: ['RT'], defaultBlock: { scheme: 'reach', target: 'DE' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim PS A / inside leg of PS guard; cutback off DL past C' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'inside_zone', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_optional', aim: 'a_gap' } },
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
        { roleName: 'KICK', appliesTo: ['Y', 'H', 'FB'], defaultBlock: { scheme: 'kick', target: 'BSDE' } },
        { roleName: 'ZONE_LT', appliesTo: ['LT'], defaultBlock: { scheme: 'zone_step' } },
        { roleName: 'ZONE_LG', appliesTo: ['LG'], defaultBlock: { scheme: 'combo' } },
        { roleName: 'ZONE_C', appliesTo: ['C'], defaultBlock: { scheme: 'zone_step' } },
        { roleName: 'ZONE_RG', appliesTo: ['RG'], defaultBlock: { scheme: 'zone_step' } },
        { roleName: 'ZONE_RT', appliesTo: ['RT'], defaultBlock: { scheme: 'reach' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim frontside A; cutback protected by H/TE kick' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'inside_zone', bestWhenBox: ['7', '8'], surfaceNeeds: 'te_required', aim: 'a_gap' } },
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
        { roleName: 'REACH_LT', appliesTo: ['LT'], defaultBlock: { scheme: 'reach', target: 'DE' } },
        { roleName: 'REACH_LG', appliesTo: ['LG'], defaultBlock: { scheme: 'reach', target: 'DT' } },
        { roleName: 'REACH_C', appliesTo: ['C'], defaultBlock: { scheme: 'reach', target: 'NT' } },
        { roleName: 'REACH_RG', appliesTo: ['RG'], defaultBlock: { scheme: 'reach', target: '3T' } },
        { roleName: 'REACH_RT', appliesTo: ['RT'], defaultBlock: { scheme: 'reach', target: 'DE' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim outside leg of TE/OT, press wide then one-cut' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'outside_zone', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_optional', aim: 'edge' } },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_duo',
    name: 'Duo',
    conceptType: 'run',
    summary: "Downhill inside run with doubles — often taught as 'Power without a puller'",
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
        { roleName: 'DUO_LG', appliesTo: ['LG'], defaultBlock: { scheme: 'combo', target: 'DT' } },
        { roleName: 'DUO_C', appliesTo: ['C'], defaultBlock: { scheme: 'combo', target: 'NT' } },
        { roleName: 'DUO_RG', appliesTo: ['RG'], defaultBlock: { scheme: 'combo', target: '3T' } },
        { roleName: 'DUO_RT', appliesTo: ['RT'], defaultBlock: { scheme: 'combo', target: 'DE' } },
        { roleName: 'DUO_TE', appliesTo: ['Y'], defaultBlock: { scheme: 'down', target: 'DE' }, notes: 'Base/down on edge' },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim frontside B-gap, press LOS then cut' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'inside_zone', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_preferred', aim: 'b_gap' } },
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
        { roleName: 'DOWN', appliesTo: ['LT', 'LG', 'C', 'RT', 'Y'], defaultBlock: { scheme: 'down' } },
        { roleName: 'PULL', appliesTo: ['RG', 'LG'], defaultBlock: { scheme: 'pull_kick', target: 'EMOL' } },
        { roleName: 'BACK', appliesTo: ['H', 'FB', 'RB'], defaultBlock: { scheme: 'lead', target: 'PSLB' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim PS B-gap, read kick-out + wrap' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'power', bestWhenBox: ['7', '8'], surfaceNeeds: 'te_preferred', aim: 'b_gap' } },
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
        { roleName: 'DOWN', appliesTo: ['LT', 'LG', 'C'], defaultBlock: { scheme: 'down' } },
        { roleName: 'PULL_G', appliesTo: ['RG', 'LG'], defaultBlock: { scheme: 'pull_kick', target: 'EMOL' } },
        { roleName: 'PULL_T', appliesTo: ['RT', 'LT'], defaultBlock: { scheme: 'pull_wrap', target: 'PSLB' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Counter step, hit backside A/B behind pullers' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'weak', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'counter', bestWhenBox: ['7', '8'], surfaceNeeds: 'te_optional', aim: 'a_gap' } },
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
        { roleName: 'PIN', appliesTo: ['LT', 'RT', 'Y'], defaultBlock: { scheme: 'down', target: 'DT' } },
        { roleName: 'PULL', appliesTo: ['LG', 'RG'], defaultBlock: { scheme: 'pull_lead', target: 'FORCE' } },
        { roleName: 'WR_STALK', appliesTo: ['X', 'Z', 'H'], defaultBlock: { scheme: 'seal', target: 'CB' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Race to numbers then cut vertical' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'perimeter', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_optional', aim: 'edge' } },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_guard_trap',
    name: 'Guard Trap',
    conceptType: 'run',
    summary: 'Quick trap: guard pulls to trap first down lineman (3T/1T)',
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
        { roleName: 'TRAP', appliesTo: ['LG', 'RG'], defaultBlock: { scheme: 'trap', target: '3T' } },
        { roleName: 'DOWN', appliesTo: ['LT', 'C', 'RT'], defaultBlock: { scheme: 'down' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim inside leg of trapper, hit downhill' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'weak', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'trap', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_optional', aim: 'a_gap' } },
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
        { roleName: 'WHAM', appliesTo: ['H', 'Y', 'FB'], defaultBlock: { scheme: 'wham', target: '1T' } },
        { roleName: 'BASE', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'base' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Hit inside behind wham kick; one-cut vertical' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'trap', bestWhenBox: ['6', '7'], surfaceNeeds: 'te_required', aim: 'a_gap' } },
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
        { roleName: 'PASS_SET', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'pass_set' } },
        { roleName: 'DELAY', appliesTo: ['RB'], notes: 'Delay then hit A/B' },
        { roleName: 'QB_SELL', appliesTo: ['QB'], notes: 'Show pass then hand/ride' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'special', bestWhenBox: ['6'], surfaceNeeds: 'te_optional', aim: 'a_gap' } },
  },

  /* =========================
   * Audit2 — Add-on 10 (Reads/Perimeter/QB)
   * ========================= */
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_counter_h_insert',
    name: 'Counter (H Insert)',
    conceptType: 'run',
    summary: 'Counter with H inserting on PSLB; guard kicks EMOL',
    badges: ['nfl_style'],
    requirements: { preferredStructures: ['ace', 'pistol', 'I'], personnelHints: ['11', '12', '21'], needsTE: true, needsPuller: 'G', boxTolerance: '7_ok' },
    template: {
      roles: [
        { roleName: 'DOWN', appliesTo: ['LT', 'LG', 'C'], defaultBlock: { scheme: 'down' } },
        { roleName: 'PULL_G', appliesTo: ['RG', 'LG'], defaultBlock: { scheme: 'pull_kick', target: 'EMOL' } },
        { roleName: 'INSERT', appliesTo: ['H', 'Y', 'FB'], defaultBlock: { scheme: 'insert', target: 'PSLB' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Counter step, hit B-gap behind kick+insert' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'weak', conflictPolicy: 'add_layer', runLandmarks: true },
    },
    suggestionHints: { runHints: { category: 'counter', bestWhenBox: ['7'], aim: 'b_gap' } },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power_read',
    name: 'Power Read',
    conceptType: 'run',
    summary: 'Read play-side end: RB sweep vs QB keep inside power',
    badges: ['spread'],
    requirements: { preferredStructures: ['2x2', '3x1', 'pistol'], personnelHints: ['10', '11'], needsTE: false, needsPuller: 'G', boxTolerance: '6_ok' },
    template: {
      roles: [
        { roleName: 'READ', appliesTo: ['QB'], notes: 'Read PSDE' },
        { roleName: 'SWEEP', appliesTo: ['RB'], notes: 'Sweep if DE squeezes' },
        { roleName: 'PULL_G', appliesTo: ['LG', 'RG'], defaultBlock: { scheme: 'pull_kick', target: 'PSLB' }, notes: 'Lead QB on keep' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer' },
    },
    suggestionHints: { runHints: { category: 'read', bestVsFront: ['even'], aim: 'read' } },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_zone_read',
    name: 'Zone Read',
    conceptType: 'run',
    summary: 'Inside zone with QB reading backside end',
    badges: ['spread'],
    requirements: { preferredStructures: ['2x2', '3x1', 'pistol'], personnelHints: ['10', '11'], needsTE: false, needsPuller: 'none', boxTolerance: '6_ok' },
    template: {
      roles: [
        { roleName: 'READ', appliesTo: ['QB'], notes: 'Read BSDE' },
        { roleName: 'ZONE', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'zone_step' }, notes: 'Inside zone rules' },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'IZ track unless QB pulls' },
      ],
      buildPolicy: { placementStrategy: 'relative_to_alignment', defaultSide: 'strength', conflictPolicy: 'add_layer' },
    },
    suggestionHints: { runHints: { category: 'read', bestVsFront: ['even', 'odd'], aim: 'a_gap' } },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_power',
    name: 'QB Power',
    conceptType: 'run',
    summary: 'Power run with QB as ball carrier and RB leading',
    badges: ['college'],
    requirements: { preferredStructures: ['2x2', 'pistol'], personnelHints: ['10', '11'], needsTE: false, needsPuller: 'G', boxTolerance: '7_ok' },
    template: {
      roles: [
        { roleName: 'PULL_G', appliesTo: ['LG', 'RG'], defaultBlock: { scheme: 'pull_kick', target: 'EMOL' } },
        { roleName: 'LEAD', appliesTo: ['RB'], defaultBlock: { scheme: 'lead', target: 'PSLB' } },
        { roleName: 'AIMING', appliesTo: ['QB'], notes: 'Hit B-gap behind puller' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_draw',
    name: 'QB Draw',
    conceptType: 'run',
    summary: 'Pass look with QB delayed draw',
    badges: ['spread'],
    requirements: { preferredStructures: ['empty', '2x2'], personnelHints: ['10'], needsTE: false, needsPuller: 'none', boxTolerance: '6_ok' },
    template: {
      roles: [
        { roleName: 'PASS_SET', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'pass_set' } },
        { roleName: 'AIMING', appliesTo: ['QB'], notes: 'Delay then hit inside' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_jet_sweep',
    name: 'Jet Sweep',
    conceptType: 'run',
    summary: 'Full-speed jet motion handoff attacking edge',
    badges: ['spread'],
    requirements: { preferredStructures: ['2x2', '3x1'], personnelHints: ['10', '11'], needsTE: false, needsPuller: 'none', boxTolerance: '6_ok' },
    template: {
      roles: [
        { roleName: 'JET', appliesTo: ['Z', 'H'], notes: 'Jet motion at snap' },
        { roleName: 'PIN', appliesTo: ['LT', 'LG', 'Y'], defaultBlock: { scheme: 'down' }, notes: 'Pin inside' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_end_around',
    name: 'End Around',
    conceptType: 'run',
    summary: 'Reverse handoff after fake action (situational)',
    badges: ['situational'],
    requirements: { preferredStructures: ['2x2'], personnelHints: ['10'], needsTE: false, needsPuller: 'none', boxTolerance: '5_light' },
    template: {
      roles: [
        { roleName: 'FAKE', appliesTo: ['RB'], notes: 'Fake opposite direction' },
        { roleName: 'CARRY', appliesTo: ['X', 'Z'], notes: 'Take reverse handoff' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_crack_toss',
    name: 'Crack Toss / Pin-Toss',
    conceptType: 'run',
    summary: 'Perimeter toss with WR crack and OL pullers leading',
    badges: ['nfl_style'],
    requirements: { preferredStructures: ['2x2', 'ace'], personnelHints: ['11', '12'], needsTE: false, needsPuller: 'G', boxTolerance: '7_ok' },
    template: {
      roles: [
        { roleName: 'CRACK', appliesTo: ['X', 'Z'], defaultBlock: { scheme: 'crack', target: 'LB' } },
        { roleName: 'PULL', appliesTo: ['LG', 'RG'], defaultBlock: { scheme: 'pull_lead', target: 'EDGE' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Catch toss and race to edge' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_mid_zone',
    name: 'Mid Zone',
    conceptType: 'run',
    summary: 'Zone run between inside and outside aiming points',
    badges: ['nfl_style'],
    requirements: { preferredStructures: ['ace', 'pistol'], personnelHints: ['11', '12'], needsTE: false, needsPuller: 'none', boxTolerance: '7_ok' },
    template: {
      roles: [
        { roleName: 'ZONE', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'zone_step' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim PS B/C gap' },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_stretch',
    name: 'Stretch (OZ Variant)',
    conceptType: 'run',
    summary: 'Fast-flow outside zone emphasizing horizontal stretch',
    badges: ['nfl_style'],
    requirements: { preferredStructures: ['ace', 'pistol'], personnelHints: ['11', '12'], needsTE: false, needsPuller: 'none', boxTolerance: '7_ok' },
    template: {
      roles: [
        { roleName: 'REACH', appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'], defaultBlock: { scheme: 'reach' } },
        { roleName: 'AIMING', appliesTo: ['RB'], notes: 'Aim wide, one-cut vertical' },
      ],
    },
  },
];

export default RUN_CONCEPTS_AUDIT3;
