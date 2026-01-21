/**
 * Pass Concepts (45개) for ForOffenseCoach
 *
 * Categories:
 * - Quick (13): Stick, Spacing, Quick Out, Slant/Flat, Hitch/Seam,
 *               Snag, Now Screen, Rocket, Double Slant, Triple Slant,
 *               Stick Draw, Speed Out, Hank
 * - Intermediate (15): Curl/Flat, Smash, Levels, Mesh, Drive, Y-Cross,
 *                      China, Hunt, Scissor, Divide, Drive Out,
 *                      Bench, Out & Up, Texas, Whip
 * - Deep (11): Flood, Dagger, Sail, Post/Dig, Verts, Switch Verts,
 *              Yankee, Dragon, Seattle, Follow, Double Post
 * - Screen (6): Bubble, Tunnel, Jail, Slip Screen, Middle Screen, Swing Screen
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
          defaultRoute: { pattern: 'cross', depth: 18, direction: 'inside' },
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

  // ============================================
  // QUICK GAME - ADDITIONAL (8)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_snag',
    name: 'Snag',
    conceptType: 'pass',
    summary: 'Triangle concept with snag, flat, and corner for 3-level read',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['3x1', 'trips', 'bunch'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SNAG',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'snag', depth: 6, direction: 'inside' },
          notes: 'Settle inside hash, find grass',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 2, direction: 'outside' },
          notes: 'Quick flat, stretch LB',
        },
        {
          roleName: 'CORNER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'corner', depth: 14 },
          notes: 'Corner route to sideline',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'slant', depth: 6 },
          notes: 'Backside slant option',
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
          id: 'fp_snag_settle',
          name: 'Snag route settle spot',
          drill: {
            name: 'Snag Triangle Drill',
            purpose: 'Find the triangle window between defenders',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_now_screen',
    name: 'Now Screen',
    conceptType: 'pass',
    summary: 'Quick screen with crack block from inside receiver',
    badges: ['spread', 'air_raid'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SCREEN',
          appliesTo: ['Z', 'X'],
          defaultRoute: { pattern: 'bubble', depth: 1, direction: 'back' },
          notes: 'Quick now route, catch and go',
        },
        {
          roleName: 'CRACK',
          appliesTo: ['Y', 'H'],
          defaultBlock: { scheme: 'crack', target: 'CB' },
          notes: 'Crack block corner',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'go', depth: 12 },
          notes: 'Clear defender',
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
        manBeater: false,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_now_crack',
          name: 'Crack block timing',
          drill: {
            name: 'Crack & Go Drill',
            purpose: 'Inside WR crack block DB, outside WR catch and go',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_rocket',
    name: 'Rocket Screen',
    conceptType: 'pass',
    summary: 'Jet motion screen with lead blockers',
    badges: ['spread', 'air_raid'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1', 'trips'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'ROCKET',
          appliesTo: ['H', 'Y'],
          defaultMotion: { pattern: 'jet', direction: 'across' },
          defaultRoute: { pattern: 'tunnel', depth: 0 },
          notes: 'Jet motion, receive toss',
        },
        {
          roleName: 'LEAD',
          appliesTo: ['Z'],
          defaultBlock: { scheme: 'stalk', target: 'CB' },
          notes: 'Stalk block corner',
        },
        {
          roleName: 'SEAL',
          appliesTo: ['X'],
          defaultBlock: { scheme: 'seal', target: 'S' },
          notes: 'Seal safety',
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
        manBeater: false,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_rocket_timing',
          name: 'Jet motion timing',
          drill: {
            name: 'Rocket Timing Drill',
            purpose: 'Timing snap with jet motion at full speed',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_double_slant',
    name: 'Double Slant',
    conceptType: 'pass',
    summary: 'Two slants attacking inside leverage',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'twins'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SLANT_1',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'slant', depth: 6, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Inside slant, first read',
        },
        {
          roleName: 'SLANT_2',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'slant', depth: 7, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Second slant, staggered depth',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 2 },
          notes: 'Check down to flat',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'seam', depth: 12 },
          notes: 'Seam to clear middle',
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
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal', 'mof'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_double_slant_depth',
          name: 'Staggered slant depths',
          drill: {
            name: 'Double Slant Drill',
            purpose: 'Maintain 1-yard depth difference between slants',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_triple_slant',
    name: 'Triple Slant',
    conceptType: 'pass',
    summary: 'Three slants overloading middle of field',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ['3x1', 'trips'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SLANT_1',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'slant', depth: 5, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Quickest slant, first read',
        },
        {
          roleName: 'SLANT_2',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'slant', depth: 7, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Middle slant',
        },
        {
          roleName: 'SLANT_3',
          appliesTo: ['H'],
          defaultRoute: { pattern: 'slant', depth: 9, breakAngleDeg: 45, direction: 'inside' },
          notes: 'Deep slant',
        },
        {
          roleName: 'BACKSIDE',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'hitch', depth: 5 },
          notes: 'Backside hitch',
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
        stress: ['mof', 'horizontal'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_triple_slant_spacing',
          name: 'Triple slant spacing',
          drill: {
            name: 'Triple Slant Spacing Drill',
            purpose: '2-yard depth stagger between all three slants',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_stick_draw',
    name: 'Stick Draw',
    conceptType: 'pass',
    summary: 'Stick concept paired with draw fake action',
    badges: ['west_coast', 'play_action'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12', '21'],
    },
    template: {
      roles: [
        {
          roleName: 'STICK',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'stick', depth: 6 },
          notes: 'Stick at 6 yards, settle',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Draw fake then flat',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 15 },
          notes: 'Vertical to hold safety',
        },
        {
          roleName: 'SLANT',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'slant', depth: 6 },
          notes: 'Backside slant',
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
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_stick_draw_fake',
          name: 'Draw fake sell',
          drill: {
            name: 'Draw Fake Drill',
            purpose: 'RB sells draw, releases to flat',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_speed_out',
    name: 'Speed Out',
    conceptType: 'pass',
    summary: 'Quick speed out to boundary with flat underneath',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'twins'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'SPEED_OUT',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'speed_out', depth: 5, direction: 'outside' },
          notes: 'Quick 3-step out, eyes to QB',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'flat', depth: 2 },
          notes: 'Flat underneath out',
        },
        {
          roleName: 'SEAM',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'seam', depth: 12 },
          notes: 'Seam to clear safety',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 2 },
          notes: 'Protect, swing release',
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
          id: 'fp_speed_out_break',
          name: 'Speed out acceleration',
          drill: {
            name: 'Speed Out Drill',
            purpose: 'Accelerate through the break, no wasted steps',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_hank',
    name: 'Hank',
    conceptType: 'pass',
    summary: 'Hitch adjustment route based on coverage',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'HANK',
          appliesTo: ['Z', 'X'],
          defaultRoute: { pattern: 'hitch', depth: 5 },
          notes: 'Hitch vs off, fade vs press',
        },
        {
          roleName: 'OUT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'out', depth: 8 },
          notes: 'Out underneath',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat route',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Clear out deep',
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
        stress: ['horizontal'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_hank_read',
          name: 'Coverage read conversion',
          drill: {
            name: 'Hank Read Drill',
            purpose: 'WR reads coverage, converts to hitch or fade',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // INTERMEDIATE - ADDITIONAL (9)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_china',
    name: 'China',
    conceptType: 'pass',
    summary: 'Deep crossing route with shallow underneath',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'CHINA',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'cross', depth: 18, direction: 'inside' },
          notes: 'Deep cross from backside',
        },
        {
          roleName: 'SHALLOW',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'shallow', depth: 4, direction: 'inside' },
          notes: 'Shallow cross underneath',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 20 },
          notes: 'Vertical to hold safety',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Protect, flat release',
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
          id: 'fp_china_depth',
          name: 'China route depth',
          drill: {
            name: 'Deep Cross Drill',
            purpose: 'Maintain 18-yard depth through traffic',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_hunt',
    name: 'Hunt',
    conceptType: 'pass',
    summary: 'In-out combination to isolate defender',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'twins'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'IN',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'in', depth: 12, direction: 'inside' },
          notes: 'In route at 12',
        },
        {
          roleName: 'OUT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'out', depth: 10, direction: 'outside' },
          notes: 'Out route underneath',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'post', depth: 16 },
          notes: 'Clear backside',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat check down',
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
        stress: ['horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_hunt_spacing',
          name: 'In-out spacing',
          drill: {
            name: 'Hunt Combo Drill',
            purpose: 'Maintain spacing between in and out routes',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_scissor',
    name: 'Scissor',
    conceptType: 'pass',
    summary: 'Crossing routes at intermediate depth creating traffic',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'trips'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'CROSS_OVER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'post', depth: 14 },
          notes: 'Post route, over the scissor',
        },
        {
          roleName: 'CROSS_UNDER',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'dig', depth: 10, direction: 'inside' },
          notes: 'Dig underneath',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat underneath',
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
        stress: ['mof', 'horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_scissor_exchange',
          name: 'Scissor crossing point',
          drill: {
            name: 'Scissor Cross Drill',
            purpose: 'Time the crossing point to create traffic',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_divide',
    name: 'Divide',
    conceptType: 'pass',
    summary: 'Seam and flat combination to stress LB',
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
          roleName: 'SEAM',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'seam', depth: 14 },
          notes: 'TE seam, sit vs zone',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat underneath seam',
        },
        {
          roleName: 'CURL',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'curl', depth: 12 },
          notes: 'Curl route',
        },
        {
          roleName: 'GO',
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
        stress: ['seam', 'flat_conflict'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_divide_seam',
          name: 'TE seam route',
          drill: {
            name: 'Seam Ball Drill',
            purpose: 'TE finds window in seam vs coverage',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_drive_out',
    name: 'Drive Out',
    conceptType: 'pass',
    summary: 'Drive route with out underneath for horizontal stretch',
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
          appliesTo: ['H'],
          defaultRoute: { pattern: 'shallow', depth: 6, direction: 'inside' },
          notes: 'Drive across at 6 yards',
        },
        {
          roleName: 'OUT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'out', depth: 10, direction: 'outside' },
          notes: 'Out route underneath',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Vertical clear out',
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
        category: 'intermediate',
        manBeater: true,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_drive_out_spacing',
          name: 'Drive-out spacing',
          drill: {
            name: 'Drive Out Combo Drill',
            purpose: 'Maintain depth difference between drive and out',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_bench',
    name: 'Bench',
    conceptType: 'pass',
    summary: 'Sideline bench route with clear out',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'BENCH',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'out', depth: 8, direction: 'outside' },
          notes: 'Bench route to sideline',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'go', depth: 15 },
          notes: 'Clear out corner',
        },
        {
          roleName: 'DIG',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Backside dig',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Check release',
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
        stress: ['boundary'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_bench_sideline',
          name: 'Bench route to sideline',
          drill: {
            name: 'Bench Route Drill',
            purpose: 'Get to sideline, set up DB',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_out_up',
    name: 'Out & Up',
    conceptType: 'pass',
    summary: 'Double move with out fake and go',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'OUT_UP',
          appliesTo: ['Z', 'X'],
          defaultRoute: { pattern: 'out_up', depth: 20 },
          notes: 'Out fake at 5, go vertical',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Dig underneath',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat check',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['X', 'Z'],
          defaultRoute: { pattern: 'post', depth: 16 },
          notes: 'Clear safety',
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
        category: 'intermediate',
        manBeater: true,
        zoneBeater: false,
        stress: ['vertical', 'boundary'],
        dropType: '7_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_out_up_sell',
          name: 'Out fake sell',
          drill: {
            name: 'Double Move Drill',
            purpose: 'Sell the out, burst vertical',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_texas',
    name: 'Texas',
    conceptType: 'pass',
    summary: 'RB angle route with flat combo',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['11', '12', '21'],
    },
    template: {
      roles: [
        {
          roleName: 'TEXAS',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'angle', depth: 6 },
          notes: 'Angle route behind LB',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat to stretch LB',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Vertical clear',
        },
        {
          roleName: 'DIG',
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
          id: 'fp_texas_release',
          name: 'RB release timing',
          drill: {
            name: 'Texas Route Drill',
            purpose: 'RB sells protection, releases angle',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_whip',
    name: 'Whip',
    conceptType: 'pass',
    summary: 'Whip route combination with flat',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'WHIP',
          appliesTo: ['Y', 'H'],
          defaultRoute: { pattern: 'whip', depth: 8 },
          notes: 'Out stem, whip back inside',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat underneath',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Clear corner',
        },
        {
          roleName: 'CURL',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'curl', depth: 12 },
          notes: 'Backside curl',
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
        stress: ['horizontal'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_whip_break',
          name: 'Whip route break',
          drill: {
            name: 'Whip Route Drill',
            purpose: 'Sharp outside stem, whip back inside',
            phase: 'indy',
          },
        },
      ],
    },
  },

  // ============================================
  // DEEP - ADDITIONAL (5)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_yankee',
    name: 'Yankee',
    conceptType: 'pass',
    summary: 'Post-dig combo with frontside emphasis',
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
          appliesTo: ['X'],
          defaultRoute: { pattern: 'post', depth: 18 },
          notes: 'Post behind safety',
        },
        {
          roleName: 'DIG',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'dig', depth: 12 },
          notes: 'Dig from field',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 4 },
          notes: 'Flat check down',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'wheel', depth: 14 },
          notes: 'Wheel route',
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
        manBeater: true,
        zoneBeater: true,
        stress: ['mof', 'vertical'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_yankee_read',
          name: 'Post-dig read',
          drill: {
            name: 'Yankee Read Drill',
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
    id: 'pass_dragon',
    name: 'Dragon',
    conceptType: 'pass',
    summary: 'Deep corner with flat underneath for 2-level read',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['11', '12'],
    },
    template: {
      roles: [
        {
          roleName: 'CORNER',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'corner', depth: 18 },
          notes: 'Deep corner to sideline',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 4 },
          notes: 'Flat underneath corner',
        },
        {
          roleName: 'GO',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'go', depth: 20 },
          notes: 'Clear backside safety',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 3 },
          notes: 'Protect, swing release',
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
        stress: ['flat_conflict', 'boundary'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_dragon_corner',
          name: 'Corner route depth',
          drill: {
            name: 'Deep Corner Drill',
            purpose: 'Get to 18 yards before breaking to sideline',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_seattle',
    name: 'Seattle',
    conceptType: 'pass',
    summary: 'Go route with comeback underneath',
    badges: ['nfl_style'],
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
          defaultRoute: { pattern: 'go', depth: 22 },
          notes: 'Vertical to take top off',
        },
        {
          roleName: 'COMEBACK',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'comeback', depth: 14 },
          notes: 'Comeback under go',
        },
        {
          roleName: 'CROSS',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'cross', depth: 10 },
          notes: 'Crossing route',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'flat', depth: 3 },
          notes: 'Flat check',
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
        zoneBeater: true,
        stress: ['vertical', 'boundary'],
        dropType: '7_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_seattle_comeback',
          name: 'Comeback route depth',
          drill: {
            name: 'Comeback Route Drill',
            purpose: 'Sell go, come back at 14 yards',
            phase: 'indy',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_follow',
    name: 'Follow',
    conceptType: 'pass',
    summary: 'Wheel route with flat in front',
    badges: ['nfl_style', 'west_coast'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['11', '12', '21'],
    },
    template: {
      roles: [
        {
          roleName: 'WHEEL',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'wheel', depth: 16 },
          notes: 'Wheel route up sideline',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 4 },
          notes: 'Flat in front of wheel',
        },
        {
          roleName: 'GO',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'go', depth: 18 },
          notes: 'Clear safety',
        },
        {
          roleName: 'DIG',
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
        manBeater: true,
        zoneBeater: true,
        stress: ['flat_conflict', 'vertical'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_follow_wheel',
          name: 'Wheel route timing',
          drill: {
            name: 'Wheel Route Drill',
            purpose: 'RB release timing on wheel',
            phase: 'group',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_double_post',
    name: 'Double Post',
    conceptType: 'pass',
    summary: 'Two posts attacking middle of field',
    badges: ['nfl_style', 'air_raid'],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ['2x2', 'trips'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'POST_1',
          appliesTo: ['Z'],
          defaultRoute: { pattern: 'post', depth: 16 },
          notes: 'Inside post',
        },
        {
          roleName: 'POST_2',
          appliesTo: ['X'],
          defaultRoute: { pattern: 'post', depth: 18 },
          notes: 'Outside post, deeper',
        },
        {
          roleName: 'FLAT',
          appliesTo: ['Y'],
          defaultRoute: { pattern: 'flat', depth: 4 },
          notes: 'Flat check',
        },
        {
          roleName: 'CHECK',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 3 },
          notes: 'Protect, swing',
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
        stress: ['mof', 'vertical'],
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_double_post_spacing',
          name: 'Double post spacing',
          drill: {
            name: 'Double Post Drill',
            purpose: 'Maintain spacing between posts to split safety',
            phase: 'group',
          },
        },
      ],
    },
  },

  // ============================================
  // SCREENS - ADDITIONAL (3)
  // ============================================
  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_slip_screen',
    name: 'Slip Screen',
    conceptType: 'pass',
    summary: 'OL slips out for RB screen',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['11', '12', '21'],
    },
    template: {
      roles: [
        {
          roleName: 'SCREEN',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'screen', depth: -2 },
          notes: 'Slip behind line, catch screen',
        },
        {
          roleName: 'LEAD_1',
          appliesTo: ['LG', 'LT'],
          defaultBlock: { scheme: 'pull_lead' },
          notes: 'Pull and lead block',
        },
        {
          roleName: 'LEAD_2',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'pull_lead' },
          notes: 'Pull and lead block',
        },
        {
          roleName: 'CLEAR',
          appliesTo: ['Z', 'X'],
          defaultRoute: { pattern: 'go', depth: 12 },
          notes: 'Clear defenders',
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
        dropType: '5_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_slip_timing',
          name: 'OL slip timing',
          drill: {
            name: 'Slip Screen Drill',
            purpose: 'OL pass set, then release on cue',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_middle_screen',
    name: 'Middle Screen',
    conceptType: 'pass',
    summary: 'Screen up the middle with interior OL releasing',
    badges: ['nfl_style'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', 'ace'],
      personnelHints: ['11', '12', '21'],
    },
    template: {
      roles: [
        {
          roleName: 'SCREEN',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'screen', depth: 2 },
          notes: 'Fake draw, catch screen',
        },
        {
          roleName: 'LEAD_1',
          appliesTo: ['LG'],
          defaultBlock: { scheme: 'pull_lead' },
          notes: 'Release playside',
        },
        {
          roleName: 'LEAD_2',
          appliesTo: ['RG'],
          defaultBlock: { scheme: 'pull_lead' },
          notes: 'Release playside',
        },
        {
          roleName: 'SEAL',
          appliesTo: ['C'],
          defaultBlock: { scheme: 'seal' },
          notes: 'Seal backside',
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
        stress: ['mof'],
        dropType: '3_step',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_middle_screen_sell',
          name: 'Draw fake sell',
          drill: {
            name: 'Middle Screen Drill',
            purpose: 'RB sells draw, OL releases after initial block',
            phase: 'team',
          },
        },
      ],
    },
  },

  {
    schemaVersion: '1.0',
    type: 'concept',
    id: 'pass_swing_screen',
    name: 'Swing Screen',
    conceptType: 'pass',
    summary: 'Quick swing screen with WR blocking',
    badges: ['spread'],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ['2x2', '3x1'],
      personnelHints: ['10', '11'],
    },
    template: {
      roles: [
        {
          roleName: 'SWING',
          appliesTo: ['RB'],
          defaultRoute: { pattern: 'swing', depth: 2, direction: 'outside' },
          notes: 'Swing to flat',
        },
        {
          roleName: 'STALK',
          appliesTo: ['Z'],
          defaultBlock: { scheme: 'stalk', target: 'CB' },
          notes: 'Stalk block corner',
        },
        {
          roleName: 'SEAL',
          appliesTo: ['Y'],
          defaultBlock: { scheme: 'seal', target: 'LB' },
          notes: 'Seal inside LB',
        },
        {
          roleName: 'CLEAR',
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
        manBeater: false,
        zoneBeater: true,
        stress: ['horizontal'],
        dropType: 'quick',
      },
    },
    installFocus: {
      failurePoints: [
        {
          id: 'fp_swing_block',
          name: 'WR blocking on screen',
          drill: {
            name: 'Swing Screen Drill',
            purpose: 'WRs engage and sustain blocks',
            phase: 'group',
          },
        },
      ],
    },
  },
];

export default PASS_CONCEPTS;
