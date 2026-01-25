/**
 * RUN Audit 2 (10 concepts) — options, reads, perimeter, QB runs
 * 대상 10:
 * - Counter (H Insert)
 * - Power Read
 * - Zone Read
 * - QB Power
 * - QB Draw
 * - Jet Sweep
 * - End Around
 * - Crack Toss / Pin-Toss
 * - Mid Zone
 * - Stretch (Outside Zone variant, unified)
 */

import type { RunConcept } from './types';

export const RUN_CONCEPTS_AUDIT2: RunConcept[] = [
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_counter_h_insert',
    name: 'Counter (H Insert)',
    conceptType: 'run',
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
          notes: 'Down blocks away from insert',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['RG', 'LG'],
          defaultBlock: { scheme: 'pull_kick', target: 'EMOL' },
          notes: 'Guard kicks out EMOL',
        },
        {
          roleName: 'INSERT',
          appliesTo: ['H', 'Y', 'FB'],
          defaultBlock: { scheme: 'insert', target: 'PSLB' },
          notes: 'Insert through B-gap for playside LB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Counter step, hit B-gap behind kick and insert',
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
        bestWhenBox: ['7'],
        aim: 'b_gap',
      },
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_power_read',
    name: 'Power Read',
    conceptType: 'run',
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
          notes: 'Read play-side DE',
        },
        {
          roleName: 'SWEEP',
          appliesTo: ['RB'],
          notes: 'Sweep path if DE squeezes',
        },
        {
          roleName: 'PULL_G',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_kick', target: 'PSLB' },
          notes: 'Pull to lead QB on keep',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      runHints: {
        category: 'read',
        bestVsFront: ['even'],
        aim: 'read',
      },
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_zone_read',
    name: 'Zone Read',
    conceptType: 'run',
    summary: 'Inside zone with QB reading backside end',
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
          roleName: 'READ',
          appliesTo: ['QB'],
          notes: 'Read backside DE',
        },
        {
          roleName: 'ZONE',
          appliesTo: ['LT', 'LG', 'C', 'RG', 'RT'],
          defaultBlock: { scheme: 'zone_step' },
          notes: 'Standard inside zone rules',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Inside zone track unless QB pulls',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      runHints: {
        category: 'read',
        bestVsFront: ['even', 'odd'],
        aim: 'a_gap',
      },
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'run_qb_power',
    name: 'QB Power',
    conceptType: 'run',
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
          notes: 'Guard kicks out',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['RB'],
          defaultBlock: { scheme: 'lead', target: 'PSLB' },
          notes: 'RB leads for QB',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['QB'],
          notes: 'QB hits B-gap behind puller',
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
          notes: 'Sell pass',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['QB'],
          notes: 'Delay then hit inside',
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
          notes: 'Jet motion at snap',
        },
        {
          roleName: 'PIN',
          appliesTo: ['LT', 'LG', 'Y'],
          defaultBlock: { scheme: 'down' },
          notes: 'Pin inside',
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
    summary: 'Reverse handoff after fake action',
    badges: ['situational'],
    requirements: {
      preferredStructures: ['2x2'],
      personnelHints: ['10'],
      needsTE: false,
      needsPuller: 'none',
      boxTolerance: '5_light',
    },
    template: {
      roles: [
        {
          roleName: 'FAKE',
          appliesTo: ['RB'],
          notes: 'Fake opposite direction',
        },
        {
          roleName: 'CARRY',
          appliesTo: ['X', 'Z'],
          notes: 'Take reverse handoff',
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
          notes: 'Crack on force defender',
        },
        {
          roleName: 'PULL',
          appliesTo: ['LG', 'RG'],
          defaultBlock: { scheme: 'pull_lead', target: 'EDGE' },
          notes: 'Lead to perimeter',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Catch toss and race to edge',
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
          notes: 'Mid zone steps',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim play-side B/C gap',
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
          notes: 'Reach and run',
        },
        {
          roleName: 'AIMING',
          appliesTo: ['RB'],
          notes: 'Aim wide, one-cut vertical',
        },
      ],
    },
  },
];

export default RUN_CONCEPTS_AUDIT2;
