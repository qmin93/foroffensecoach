/**
 * Pass Concepts (20개) for ForOffenseCoach
 *
 * Categories:
 * - Quick (5): Stick, Spacing, Quick Out, Slant/Flat, Hitch/Seam
 * - Intermediate (6): Curl/Flat, Smash, Levels, Mesh, Drive, Y-Cross
 * - Deep (6): Flood, Dagger, Sail, Post/Dig, Verts, Switch Verts
 * - Screen (3): Bubble, Tunnel, Jail
 */

import type { Concept } from '@/types/concept';

export const PASS_CONCEPTS: Concept[] = [
  // ============================================
  // QUICK GAME (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_stick',
    name: 'Stick',
    conceptType: 'pass',
    summary: '3-level quick game with flat, stick, and corner routes',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'trips', 'bunch'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'STICK',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'stick', depth: 6, direction: 'inside' },
          notes: 'Settle in soft spot between LBs',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 2, direction: 'outside' },
          notes: 'Quick release to flat, eye defender',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'corner', depth: 12 },
          notes: 'Clear out defender, option route vs man',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'slant', depth: 6, direction: 'inside' },
          notes: 'Backside slant for scramble',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'quick',
        manBeater: true,
        zoneBeater: true,
        stress: ['flat_conflict'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_stick_settle',
          name: 'Stick receiver settling depth',
          drill: {
            name: 'Stick Settle Drill',
            purpose: 'Find soft spot at 5-6 yards between LBs',
            phase: 'indy',
          },
        },
        {
          id: 'fp_stick_timing',
          name: 'QB-Stick timing',
          drill: {
            name: 'Quick Game Timing',
            purpose: 'Catch and throw rhythm on 3-step',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_spacing',
    name: 'Spacing',
    conceptType: 'pass',
    summary: 'Horizontal stretch with 5 receivers on different levels',
    badges: ['air_raid', 'spread'],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ['2x2', 'empty'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SNAG',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'snag', depth: 6, direction: 'inside' },
          notes: 'Settle in open grass',
        },
        {
          roleName: 'SIT',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'hitch', depth: 5 },
          notes: 'Hitch at 5 yards',
        },
        {
          roleName: 'SPEED_OUT',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'speed_out', depth: 5 },
          notes: 'Quick speed out',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB', 'H'],
          defaultRoute: { pattern: 'flat', depth: 1 },
          notes: 'Check release to flat',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'field',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'quick',
        manBeater: false,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_spacing_windows',
          name: 'Finding spacing windows',
          drill: {
            name: 'Window Finding Drill',
            purpose: 'Receivers find soft spots between defenders',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_quick_out',
    name: 'Quick Out',
    conceptType: 'pass',
    summary: 'Outside receiver quick out with flat underneath',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'OUT',
          appliesTo: ['Z', 'X'],
          defaultRoute: { pattern: 'quick_out', depth: 5, direction: 'outside' },
          notes: 'Quick 3-step out, accelerate after break',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'arrow', depth: 2 },
          notes: 'Arrow to flat, take what D gives',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'seam', depth: 12 },
          notes: 'Seam to clear out coverage',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'quick',
        manBeater: true,
        zoneBeater: false,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_quick_out_break',
          name: 'Quick out break speed',
          drill: {
            name: 'Speed Out Drill',
            purpose: 'Accelerate through the break, eyes to QB',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_slant_flat',
    name: 'Slant/Flat',
    conceptType: 'pass',
    summary: 'Classic high-low read with slant and flat combination',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SLANT',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'slant', depth: 6, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Attack inside leverage, accelerate after break',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB', 'H'],
          defaultRoute: { pattern: 'flat', depth: 2, direction: 'outside' },
          notes: 'Quick out to flat, stretch LB',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'go', depth: 15 },
          notes: 'Vertical to clear middle',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'quick',
        manBeater: true,
        zoneBeater: true,
        stress: ['flat_conflict', 'horizontal'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_slant_angle',
          name: 'Slant angle consistency',
          drill: {
            name: 'Slant Progression Drill',
            purpose: 'Consistent 45-degree break with acceleration',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_hitch_seam',
    name: 'Hitch/Seam',
    conceptType: 'pass',
    summary: 'Outside hitch with inside seam stretch',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'HITCH',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'hitch', depth: 5 },
          notes: 'Pivot at 5 yards, eyes to QB',
        },
        {
          roleName: 'SEAM',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'seam', depth: 12 },
          notes: 'Vertical seam, sit vs zone',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 2 },
          notes: 'Protect first, release swing',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'quick',
        manBeater: true,
        zoneBeater: true,
        stress: ['vertical', 'mof'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_hitch_seam_pivot',
          name: 'Hitch pivot and seam timing',
          drill: {
            name: 'Hitch Pivot Drill',
            purpose: 'Sharp pivot at 5 yards, eyes to QB immediately',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // INTERMEDIATE (6)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_curl_flat',
    name: 'Curl/Flat',
    conceptType: 'pass',
    summary: 'Curl route with flat underneath for high-low read',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'CURL',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'curl', depth: 12 },
          notes: 'Curl at 12, work back to QB',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB', 'H'],
          defaultRoute: { pattern: 'flat', depth: 3, direction: 'outside' },
          notes: 'Stretch LB to flat',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'dig', depth: 14, direction: 'inside' },
          notes: 'Dig across the field',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['flat_conflict'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_curl_depth',
          name: 'Curl depth consistency',
          drill: {
            name: 'Curl Route Drill',
            purpose: 'Consistent 12-yard depth with clean break',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_smash',
    name: 'Smash',
    conceptType: 'pass',
    summary: 'Corner/hitch combo attacking Cover 2 corner',
    badges: ['nfl_style', 'air_raid'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1', 'twins'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'CORNER',
          appliesTo: ['X', 'Y'],
          defaultRoute: { pattern: 'corner', depth: 14 },
          notes: 'Corner route at 14, attack hole in Cover 2',
        },
        {
          roleName: 'HITCH',
          appliesTo: ['Z', 'H'],
          defaultRoute: { pattern: 'hitch', depth: 5 },
          notes: 'Hitch under corner, hold CB',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 2 },
          notes: 'Check release to weak flat',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: false,
        zoneBeater: true,
        stress: ['vertical', 'boundary'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_smash_timing',
          name: 'Corner-Hitch timing window',
          drill: {
            name: 'Smash Combo Drill',
            purpose: 'Hitch holds CB, corner attacks hole',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_levels',
    name: 'Levels',
    conceptType: 'pass',
    summary: 'Crossing routes at different depths for layered attack',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'trips', 'bunch'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SHALLOW',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'shallow', depth: 3, direction: 'inside' },
          notes: 'Shallow cross at 3 yards',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'dig', depth: 12, direction: 'inside' },
          notes: 'Dig at 12, find window',
        },
        {
          roleName: 'OVER',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'over', depth: 18, direction: 'inside' },
          notes: 'Deep over route',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 2 },
          notes: 'Protect, release opposite',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal', 'mof'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_levels_spacing',
          name: 'Levels depth spacing',
          drill: {
            name: 'Levels Spacing Drill',
            purpose: 'Maintain 5-6 yard spacing between levels',
            phase: 'group',
          },
        },
        {
          id: 'fp_levels_cross',
          name: 'Crossing route timing',
          drill: {
            name: 'Cross Timing Drill',
            purpose: 'Stagger crossing routes to avoid collisions',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_mesh',
    name: 'Mesh',
    conceptType: 'pass',
    summary: 'Dual shallow crosses creating natural picks',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'trips', 'bunch'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'MESH_OVER',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'shallow', depth: 4, direction: 'inside' },
          notes: 'Cross over partner',
        },
        {
          roleName: 'MESH_UNDER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'shallow', depth: 3, direction: 'inside' },
          notes: 'Cross under partner',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'corner', depth: 15 },
          notes: 'Clear out deep',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'angle', depth: 5 },
          notes: 'Angle route',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'field',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal', 'mof'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_mesh_depth',
          name: 'Mesh point depth',
          drill: {
            name: 'Mesh Crossing Drill',
            purpose: 'Consistent mesh at 4 yards, timing',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_drive',
    name: 'Drive',
    conceptType: 'pass',
    summary: 'Shallow drive route with dig over the top',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'DRIVE',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'shallow', depth: 5, direction: 'inside' },
          notes: 'Drive across at 5 yards',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'dig', depth: 12, direction: 'inside' },
          notes: 'Dig over the drive',
        },
        {
          roleName: 'WHEEL',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'wheel', depth: 15 },
          notes: 'Wheel for alert',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Clear backside',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal', 'mof'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_drive_depth',
          name: 'Drive route depth',
          drill: {
            name: 'Drive Route Drill',
            purpose: 'Maintain 5-yard depth across the field',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_y_cross',
    name: 'Y-Cross',
    conceptType: 'pass',
    summary: 'TE crossing route with deep clear-out',
    badges: ['nfl_style', 'pro_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['12', '21'],
      needsTE: true,
    },
    template: {
      roles: [
        {
          roleName: 'CROSS',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'cross', depth: 10, direction: 'inside' },
          notes: 'TE cross at 10 yards',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 20 },
          notes: 'Vertical to clear safety',
        },
        {
          roleName: 'OUT',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'out', depth: 12 },
          notes: 'Backside out route',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Weak flat',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['mof', 'horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_y_cross_release',
          name: 'TE cross release',
          drill: {
            name: 'TE Release Drill',
            purpose: 'Clean release vs press, maintain depth',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // DEEP (6)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_flood',
    name: 'Flood',
    conceptType: 'pass',
    summary: '3-level outside stretch attacking flat defender',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'bunch', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 20 },
          notes: 'Clear out corner',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'corner', depth: 15 },
          notes: 'Corner route to sideline',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'arrow', depth: 3 },
          notes: 'Arrow to flat',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Backside dig',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: false,
        zoneBeater: true,
        stress: ['flat_conflict', 'horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_flood_spacing',
          name: 'Flood route spacing',
          drill: {
            name: 'Flood Spacing Drill',
            purpose: '3-level vertical spacing (flat/corner/go)',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_dagger',
    name: 'Dagger',
    conceptType: 'pass',
    summary: 'Post with dig underneath for 2-level middle attack',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'POST',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'post', depth: 18, breakAngleDeg: 45 },
          notes: 'Post behind safety',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'dig', depth: 12, direction: 'inside' },
          notes: 'Dig under post',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat route',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Clear backside safety',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: true,
        zoneBeater: true,
        stress: ['mof', 'vertical'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_dagger_post',
          name: 'Post route stem',
          drill: {
            name: 'Post Stem Drill',
            purpose: 'Sell vertical before breaking post',
            phase: 'indy',
          },
        },
        {
          id: 'fp_dagger_read',
          name: 'Post/Dig read progression',
          drill: {
            name: 'Dagger Read Drill',
            purpose: 'QB reads safety, hits post or dig',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_sail',
    name: 'Sail',
    conceptType: 'pass',
    summary: '3-level attack with go, corner, and flat',
    badges: ['nfl_style', 'air_raid'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'GO',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 20 },
          notes: 'Vertical to clear corner',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'corner', depth: 15, direction: 'outside' },
          notes: 'Corner behind go',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat underneath',
        },
        {
          roleName: 'CROSS',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'cross', depth: 10 },
          notes: 'Backside cross',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'boundary',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: false,
        zoneBeater: true,
        stress: ['flat_conflict', 'boundary'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_sail_corner',
          name: 'Corner route depth',
          drill: {
            name: 'Corner Route Drill',
            purpose: 'Get depth behind go route before breaking',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_post_dig',
    name: 'Post/Dig',
    conceptType: 'pass',
    summary: 'Post and dig combo attacking middle of field',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'POST',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'post', depth: 16, breakAngleDeg: 45 },
          notes: 'Post at 16 yards',
        },
        {
          roleName: 'DIG',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Dig from backside',
        },
        {
          roleName: 'OUT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'out', depth: 8 },
          notes: 'Out route underneath',
        },
        {
          roleName: 'WHEEL',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'wheel', depth: 14 },
          notes: 'Wheel route',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: true,
        zoneBeater: true,
        stress: ['mof', 'vertical'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_post_dig_timing',
          name: 'Post/Dig timing window',
          drill: {
            name: 'Hi-Lo Read Drill',
            purpose: 'QB reads safety high/low on post/dig',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_verts',
    name: 'Verts',
    conceptType: 'pass',
    summary: '4-vertical routes stretching the safeties',
    badges: ['air_raid', 'spread'],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ['2x2', 'empty'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SEAM_1',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'seam', depth: 20 },
          notes: 'Inside seam, split safeties',
        },
        {
          roleName: 'SEAM_2',
          appliesTo: ['H'],
          defaultRoute: { pattern: 'seam', depth: 20 },
          notes: 'Inside seam, split safeties',
        },
        {
          roleName: 'GO_1',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 25 },
          notes: 'Outside vertical',
        },
        {
          roleName: 'GO_2',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 25 },
          notes: 'Outside vertical',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Protect, check down',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'field',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: true,
        zoneBeater: false,
        stress: ['vertical', 'mof'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_verts_seam',
          name: 'Seam route spacing',
          drill: {
            name: 'Seam Spacing Drill',
            purpose: 'Maintain inside leverage, split safeties',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_switch_verts',
    name: 'Switch Verts',
    conceptType: 'pass',
    summary: 'Vertical routes with crossing action to create confusion',
    badges: ['air_raid'],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11'],
    },
    template: {
      roles: [
        {
          roleName: 'SWITCH_OUT',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 20, direction: 'outside' },
          notes: 'Start inside, go vertical outside',
        },
        {
          roleName: 'SWITCH_IN',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'seam', depth: 18, direction: 'inside' },
          notes: 'Start outside, seam inside',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'post', depth: 16 },
          notes: 'Backside post',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 3 },
          notes: 'Swing route safety valve',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'deep',
        manBeater: true,
        zoneBeater: false,
        stress: ['vertical', 'mof'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_switch_verts_exchange',
          name: 'Switch route exchange point',
          drill: {
            name: 'Switch Release Drill',
            purpose: 'Clean exchange at 8 yards without collision',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // SCREENS (3)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_bubble',
    name: 'Bubble Screen',
    conceptType: 'pass',
    summary: 'Quick bubble screen to slot receiver',
    badges: ['spread', 'rpo'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1', 'trips'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'BUBBLE',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'bubble', depth: 2, direction: 'outside' },
          notes: 'Bubble behind blockers',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Z'],
          defaultBlock: { scheme: 'seal', target: 'CB' },
          notes: 'Stalk block corner',
        },
        {
          roleName: 'CRACK',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 8 },
          notes: 'Sell go route then block',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'screen',
        manBeater: false,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_bubble_stalk',
          name: 'WR stalk blocking',
          drill: {
            name: 'Stalk Block Drill',
            purpose: 'Engage and sustain DB block',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_tunnel',
    name: 'Tunnel Screen',
    conceptType: 'pass',
    summary: 'Screen to outside receiver with linemen releasing',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SCREEN',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'tunnel', depth: 0, direction: 'back' },
          notes: 'Come back toward QB for screen',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['LG', 'C'],
          defaultBlock: { scheme: 'pull_lead' },
          notes: 'Pull and lead block',
        },
        {
          roleName: 'SEAL',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'seal' },
          notes: 'Crack/seal inside LB',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'screen',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_tunnel_timing',
          name: 'OL release timing',
          drill: {
            name: 'Screen Release Drill',
            purpose: 'OL pass set, then release to screen',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_jail',
    name: 'Jail Screen',
    conceptType: 'pass',
    summary: 'Screen to outside WR with blockers in front',
    badges: ['spread'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'trips'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SCREEN',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'bubble', depth: 1 },
          notes: 'Come back for ball',
        },
        {
          roleName: 'LEAD_1',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'seal', target: 'CB' },
          notes: 'Block outside defender',
        },
        {
          roleName: 'LEAD_2',
          appliesTo: ['H'],
          defaultBlock: { scheme: 'seal', target: 'OLB' },
          notes: 'Block inside defender',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 15 },
          notes: 'Clear backside',
        },
      ],
      buildPolicy: {
        placementStrategy: 'relative_to_alignment',
        defaultSide: 'strength',
        conflictPolicy: 'add_layer',
      },
    },
    suggestionHints: {
      passHints: {
        category: 'screen',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_jail_blocking',
          name: 'WR screen blocking',
          drill: {
            name: 'Jail Block Drill',
            purpose: 'WRs seal inside and outside defenders',
            phase: 'group',
          },
        },
      ],
    },
  },
];

export default PASS_CONCEPTS;
