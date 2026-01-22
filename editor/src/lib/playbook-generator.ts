/**
 * Playbook Auto-Generation Logic
 *
 * Given a set of formations, generates a balanced set of plays
 * by matching concepts that work well with each formation.
 */

import { v4 as uuidv4 } from 'uuid';
import { FORMATION_PRESETS } from '@/store/editorStore';
import { ALL_CONCEPTS } from '@/data/concepts';
import { buildConceptActions } from './concept-builder';
import type { Concept, FormationContext } from '@/types/concept';

/**
 * Concept popularity weights based on NFL/NCAA usage statistics
 * Higher weight = more commonly used = recommended first
 * Tier 1: 30 points, Tier 2: 20 points, Tier 3: 10 points, Tier 4: 5 points, Tier 5: 0 points
 */
const CONCEPT_POPULARITY: Record<string, number> = {
  // === PASS CONCEPTS ===
  // Tier 1: Core concepts (most used)
  'pass_slant_flat': 30,
  'pass_mesh': 28,
  'pass_stick': 26,
  'pass_spacing': 24,
  'pass_curl_flat': 22,
  // Tier 2: Frequently used
  'pass_smash': 20,
  'pass_verts': 18,
  'pass_flood': 17,
  'pass_y_cross': 16,
  'pass_levels': 15,
  'pass_bubble': 14,
  'pass_quick_out': 13,
  // Tier 3: Situational
  'pass_snag': 12,
  'pass_drive': 11,
  'pass_hitch_seam': 10,
  'pass_post_dig': 10,
  'pass_sail': 9,
  'pass_dagger': 9,
  'pass_texas': 8,
  'pass_now_screen': 8,
  // Tier 4: Niche
  'pass_double_slant': 6,
  'pass_tunnel': 6,
  'pass_rocket': 5,
  'pass_jail': 5,
  'pass_china': 5,
  'pass_hunt': 5,
  'pass_scissor': 4,
  'pass_whip': 4,
  'pass_divide': 4,
  'pass_bench': 4,
  'pass_seattle': 4,
  'pass_dragon': 3,
  'pass_follow': 3,
  // Tier 5: Rare
  'pass_out_up': 2,
  'pass_yankee': 2,
  'pass_double_post': 2,
  'pass_triple_slant': 2,
  'pass_stick_draw': 2,
  'pass_speed_out': 2,
  'pass_hank': 1,
  'pass_drive_out': 1,
  'pass_slip_screen': 1,
  'pass_middle_screen': 1,
  'pass_swing_screen': 1,

  // === RUN CONCEPTS ===
  // Tier 1: Core concepts (most used)
  'run_inside_zone': 30,
  'run_outside_zone': 26,
  'run_power': 24,
  'run_duo': 22,
  'run_draw': 20,
  // Tier 2: Frequently used
  'run_split_zone': 18,
  'run_gt_counter': 17,
  'run_rpo_zone': 16,
  'run_stretch': 15,
  'run_iso': 14,
  'run_read_option': 13,
  'run_jet_sweep': 12,
  // Tier 3: Situational
  'run_toss': 10,
  'run_qb_power': 10,
  'run_sweep': 9,
  'run_pin_pull': 9,
  'run_wham': 8,
  'run_guard_trap': 8,
  'run_tackle_trap': 8,
  'run_wide_zone': 7,
  'run_bootleg': 7,
  // Tier 4: Niche
  'run_buck_sweep': 6,
  'run_oh_counter': 6,
  'run_dart': 5,
  'run_down_g': 5,
  'run_lead_iso': 5,
  'run_insert': 5,
  'run_fb_dive': 4,
  'run_lead_draw': 4,
  'run_power_read': 4,
  'run_zone_arc': 4,
  'run_mid_zone': 4,
  // Tier 5: Rare
  'run_pitch': 3,
  'run_fly_sweep': 3,
  'run_end_around': 2,
  'run_reverse': 2,
  'run_counter_iso': 2,
  'run_zone_read_give': 2,
  'run_split_zone_weak': 2,
  'run_rocket_toss': 1,
  'run_speed_option': 1,
  'run_waggle': 1,
  'run_triple_option': 0,
  'run_midline_option': 0,
};

/**
 * Get popularity score for a concept (default 5 if not in map)
 */
function getConceptPopularity(conceptId: string): number {
  return CONCEPT_POPULARITY[conceptId] ?? 5;
}

export interface GeneratedPlay {
  id: string;
  name: string;
  formationKey: string;
  formationName: string;
  concept: Concept;
  score: number;
  rationale: string[];
  selected: boolean;
}

export interface PlaybookGeneratorOptions {
  formations: string[];
  targetPlayCount?: number;
  passRunRatio?: number; // 0-1, where 0.5 = balanced
  includeCategories?: {
    pass: string[];
    run: string[];
  };
}

/**
 * Analyze a formation to extract context for concept matching
 */
function analyzeFormation(formationKey: string): FormationContext | null {
  const formation = FORMATION_PRESETS[formationKey];
  if (!formation) return null;

  const players = formation.players;

  // Count receivers (WR + TE not counting linemen)
  const receivers = players.filter(p =>
    p.role === 'WR' || p.role === 'TE'
  ).length;

  // Check for TE
  const hasTightEnd = players.some(p => p.role === 'TE');

  // Check for FB
  const hasFullback = players.some(p => p.role === 'FB');

  // Determine structure based on WR positions
  const wrs = players.filter(p => p.role === 'WR');
  let structure: '2x2' | '3x1' | 'bunch' | 'trips' | 'twins' | 'I' | 'ace' | 'empty' | 'pistol' = '2x2';

  if (wrs.length >= 4) {
    const leftWRs = wrs.filter(w => w.x < 0.4).length;
    const rightWRs = wrs.filter(w => w.x > 0.6).length;
    if (leftWRs >= 3 || rightWRs >= 3) structure = 'trips';
    else structure = '2x2';
  } else if (wrs.length === 3) {
    structure = 'trips';
  } else if (wrs.length === 2) {
    structure = '2x2';
  }

  // Check for empty backfield
  const hasRB = players.some(p => p.role === 'RB');
  if (!hasRB && !hasFullback) structure = 'empty';

  // Check for I-formation pattern (FB and RB stacked behind QB)
  if (hasFullback && hasRB) {
    const fb = players.find(p => p.role === 'FB');
    const rb = players.find(p => p.role === 'RB');
    if (fb && rb && Math.abs(fb.x - rb.x) < 0.1) {
      structure = 'I';
    }
  }

  return {
    personnel: receivers >= 3 ? '11' : receivers >= 2 ? '12' : '21',
    receiverCount: receivers,
    hasTightEnd,
    hasFullback,
    structure,
    strengthSide: 'right', // Default
  };
}

/**
 * Score a concept against a formation context
 */
function scoreConceptForFormation(
  concept: Concept,
  context: FormationContext
): { score: number; rationale: string[] } {
  // Start with popularity-based score (0-30 points based on NFL/NCAA usage)
  const popularity = getConceptPopularity(concept.id);
  let score = 50 + popularity; // Base 50 + popularity bonus (max 80 starting)
  const rationale: string[] = [];

  // Add popularity tier info to rationale for high-popularity concepts
  if (popularity >= 20) {
    rationale.push('Highly used in NFL/NCAA');
  } else if (popularity >= 10) {
    rationale.push('Commonly used');
  }

  const req = concept.requirements;

  if (concept.conceptType === 'pass') {
    // Check receiver requirements
    if (req.minEligibleReceivers && context.receiverCount >= req.minEligibleReceivers) {
      score += 20;
      rationale.push(`${context.receiverCount} receivers available`);
    } else if (req.minEligibleReceivers && context.receiverCount < req.minEligibleReceivers) {
      score -= 30;
    }

    // Check TE requirement
    if (req.needsTE && !context.hasTightEnd) {
      score -= 40;
    } else if (req.needsTE && context.hasTightEnd) {
      score += 10;
      rationale.push('TE surface available');
    }

    // Structure match
    if (req.preferredStructures?.includes(context.structure as any)) {
      score += 20;
      rationale.push(`Works well with ${context.structure}`);
    }

    // Personnel match
    if (context.personnel && req.personnelHints?.includes(context.personnel)) {
      score += 10;
      rationale.push(`Fits ${context.personnel} personnel`);
    }
  }

  if (concept.conceptType === 'run') {
    const runHints = concept.suggestionHints.runHints;

    // TE surface needs
    if (runHints?.surfaceNeeds === 'te_required' && !context.hasTightEnd) {
      score -= 50;
    } else if (runHints?.surfaceNeeds === 'te_required' && context.hasTightEnd) {
      score += 15;
      rationale.push('TE provides run support');
    }

    // FB for power schemes
    if (context.hasFullback &&
      (runHints?.category === 'power' || runHints?.category === 'gap')) {
      score += 15;
      rationale.push('FB available for lead block');
    }

    // Structure match for outside runs
    if (runHints?.category === 'outside_zone') {
      if (context.structure === '2x2' || context.structure === 'trips') {
        score += 10;
        rationale.push('Spread formation for outside run');
      }
    }

    // Inside runs work better with heavier personnel
    if (runHints?.category === 'inside_zone' || runHints?.category === 'gap') {
      if (context.structure === 'I' || context.hasFullback) {
        score += 15;
        rationale.push('Heavy backfield for inside run');
      }
    }

    // Personnel hints
    if (context.personnel && req.personnelHints?.includes(context.personnel)) {
      score += 10;
      rationale.push(`Fits ${context.personnel} personnel`);
    }
  }

  // Max score now 130 (50 base + 30 popularity + 50 from formation match)
  return { score: Math.min(130, Math.max(0, score)), rationale };
}

/**
 * Generate a balanced set of plays for the given formations
 */
export function generatePlaysForFormations(options: PlaybookGeneratorOptions): GeneratedPlay[] {
  const {
    formations,
    targetPlayCount = 30,
    passRunRatio = 0.5,
  } = options;

  const results: GeneratedPlay[] = [];
  const usedConceptIds = new Set<string>();

  // Calculate plays per formation
  const playsPerFormation = Math.ceil(targetPlayCount / formations.length);
  const targetPassPlays = Math.ceil(targetPlayCount * passRunRatio);
  const targetRunPlays = targetPlayCount - targetPassPlays;

  let passPlaysAdded = 0;
  let runPlaysAdded = 0;

  // Generate plays for each formation
  for (const formationKey of formations) {
    const context = analyzeFormation(formationKey);
    if (!context) continue;

    const formationName = FORMATION_PRESETS[formationKey]?.name ?? formationKey;

    // Score all concepts for this formation
    const scoredConcepts = ALL_CONCEPTS
      .filter(c => !usedConceptIds.has(c.id))
      .map(concept => ({
        concept,
        ...scoreConceptForFormation(concept, context)
      }))
      .filter(item => item.score >= 40) // Only include viable options
      .sort((a, b) => b.score - a.score);

    // Separate pass and run concepts
    const passConcepts = scoredConcepts.filter(c => c.concept.conceptType === 'pass');
    const runConcepts = scoredConcepts.filter(c => c.concept.conceptType === 'run');

    // Determine how many of each to add for this formation
    let passToAdd = Math.ceil(playsPerFormation * passRunRatio);
    let runToAdd = playsPerFormation - passToAdd;

    // Balance based on overall targets
    if (passPlaysAdded >= targetPassPlays) {
      runToAdd += passToAdd;
      passToAdd = 0;
    }
    if (runPlaysAdded >= targetRunPlays) {
      passToAdd += runToAdd;
      runToAdd = 0;
    }

    // Add pass concepts
    for (let i = 0; i < Math.min(passToAdd, passConcepts.length); i++) {
      const { concept, score, rationale } = passConcepts[i];

      results.push({
        id: uuidv4(),
        name: `${formationName} ${concept.name}`,
        formationKey,
        formationName,
        concept,
        score,
        rationale,
        selected: true, // Default selected
      });

      usedConceptIds.add(concept.id);
      passPlaysAdded++;
    }

    // Add run concepts
    for (let i = 0; i < Math.min(runToAdd, runConcepts.length); i++) {
      const { concept, score, rationale } = runConcepts[i];

      results.push({
        id: uuidv4(),
        name: `${formationName} ${concept.name}`,
        formationKey,
        formationName,
        concept,
        score,
        rationale,
        selected: true, // Default selected
      });

      usedConceptIds.add(concept.id);
      runPlaysAdded++;
    }
  }

  // If we haven't reached target, add more plays from remaining concepts
  if (results.length < targetPlayCount) {
    const remainingConcepts = ALL_CONCEPTS.filter(c => !usedConceptIds.has(c.id));

    for (const formationKey of formations) {
      if (results.length >= targetPlayCount) break;

      const context = analyzeFormation(formationKey);
      if (!context) continue;

      const formationName = FORMATION_PRESETS[formationKey]?.name ?? formationKey;

      for (const concept of remainingConcepts) {
        if (results.length >= targetPlayCount) break;
        if (usedConceptIds.has(concept.id)) continue;

        const { score, rationale } = scoreConceptForFormation(concept, context);
        if (score < 40) continue;

        results.push({
          id: uuidv4(),
          name: `${formationName} ${concept.name}`,
          formationKey,
          formationName,
          concept,
          score,
          rationale,
          selected: true,
        });

        usedConceptIds.add(concept.id);
      }
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get statistics about generated plays
 */
export function getGeneratedPlaysStats(plays: GeneratedPlay[]) {
  const selected = plays.filter(p => p.selected);
  const passPlays = selected.filter(p => p.concept.conceptType === 'pass');
  const runPlays = selected.filter(p => p.concept.conceptType === 'run');

  const formationCounts: Record<string, number> = {};
  selected.forEach(p => {
    formationCounts[p.formationKey] = (formationCounts[p.formationKey] || 0) + 1;
  });

  return {
    total: plays.length,
    selected: selected.length,
    passPlays: passPlays.length,
    runPlays: runPlays.length,
    passRunRatio: passPlays.length / (selected.length || 1),
    formationCounts,
  };
}

/**
 * Identify the ball carrier role based on concept
 * Returns the role/label of the player who should have the ball
 */
function getBallCarrierRole(concept: Concept): string {
  const conceptId = concept.id?.toLowerCase() || '';
  const conceptName = concept.name?.toLowerCase() || '';

  // Pass concepts: QB holds the ball
  if (concept.conceptType === 'pass') {
    return 'QB';
  }

  // QB run concepts (QB Power, Read Option, Speed Option, QB Draw, QB Sneak)
  if (conceptId.includes('qb_power') || conceptName.includes('qb power') ||
      conceptId.includes('qb_draw') || conceptName.includes('qb draw') ||
      conceptId.includes('qb_sneak') || conceptName.includes('qb sneak') ||
      conceptId.includes('read_option') || conceptName.includes('read option') ||
      conceptId.includes('speed_option') || conceptName.includes('speed option') ||
      conceptId.includes('midline') || conceptName.includes('midline')) {
    return 'QB';
  }

  // Motion/Jet sweep concepts: WR/Slot carries
  if (conceptId.includes('jet_sweep') || conceptName.includes('jet sweep') ||
      conceptId.includes('fly_sweep') || conceptName.includes('fly sweep') ||
      conceptId.includes('end_around') || conceptName.includes('end around') ||
      conceptId.includes('reverse') || conceptName.includes('reverse')) {
    return 'H'; // Motion player (slot receiver)
  }

  // FB Dive: FB carries
  if (conceptId.includes('fb_dive') || conceptName.includes('fb dive')) {
    return 'FB';
  }

  // Default for run concepts: RB carries
  return 'RB';
}

/**
 * Find the ball carrier player and return their position
 */
function findBallCarrierPosition(
  players: Array<{ role: string; label?: string; alignment: { x: number; y: number } }>,
  ballCarrierRole: string
): { x: number; y: number } | null {
  // Try to find by role first
  let carrier = players.find(p =>
    p.role.toUpperCase() === ballCarrierRole.toUpperCase()
  );

  // Try by label if not found by role
  if (!carrier) {
    carrier = players.find(p =>
      p.label?.toUpperCase() === ballCarrierRole.toUpperCase()
    );
  }

  // For H/slot, also try WR positions
  if (!carrier && (ballCarrierRole === 'H' || ballCarrierRole === 'SLOT')) {
    carrier = players.find(p =>
      p.role === 'WR' && p.label && ['H', 'F', 'SLOT'].includes(p.label.toUpperCase())
    );
  }

  if (carrier) {
    return { ...carrier.alignment };
  }

  return null;
}

/**
 * Convert a GeneratedPlay to a Play DSL format
 * Now includes auto-generated routes and blocks from concept template
 */
export function convertGeneratedPlayToPlayDSL(generatedPlay: GeneratedPlay) {
  const formation = FORMATION_PRESETS[generatedPlay.formationKey];
  if (!formation) {
    console.error(`Formation not found: ${generatedPlay.formationKey}`);
    throw new Error(`Formation not found: ${generatedPlay.formationKey}`);
  }

  const now = new Date().toISOString();

  // Identify ball carrier based on concept
  const ballCarrierRole = getBallCarrierRole(generatedPlay.concept);

  // Create players from formation with proper Player type
  const players = formation.players.map((p) => ({
    id: uuidv4(),
    role: p.role,
    label: p.label,
    unit: 'offense' as const,
    alignment: {
      x: p.x,
      y: p.y,
    },
    appearance: {
      shape: p.appearance?.shape ?? ('circle' as const),
      fill: p.appearance?.fill ?? '#3b82f6',
      stroke: p.appearance?.stroke ?? '#ffffff',
      strokeWidth: 2,
      radius: p.appearance?.radius ?? 16,
      labelColor: '#ffffff',
      labelFontSize: 12,
      showLabel: p.appearance?.showLabel ?? true,
    },
  }));

  // Build actions from concept template with error handling
  let actions: ReturnType<typeof buildConceptActions>['actions'] = [];
  try {
    const result = buildConceptActions(generatedPlay.concept, players as any);
    actions = result.actions;
  } catch (err) {
    console.error('Error building concept actions:', err);
    // Continue with empty actions rather than failing
  }

  // Position the BALL on the ball carrier's route line
  const ballPlayer = players.find(p => p.role === 'BALL');

  if (ballPlayer) {
    // Find the ball carrier player
    let ballCarrier = players.find(p =>
      p.role.toUpperCase() === ballCarrierRole.toUpperCase()
    );
    if (!ballCarrier) {
      ballCarrier = players.find(p =>
        p.label?.toUpperCase() === ballCarrierRole.toUpperCase()
      );
    }
    // For H/slot, also try WR positions
    if (!ballCarrier && (ballCarrierRole === 'H' || ballCarrierRole === 'SLOT')) {
      ballCarrier = players.find(p =>
        p.role === 'WR' && p.label && ['H', 'F', 'SLOT'].includes(p.label.toUpperCase())
      );
    }
    // Fallback to QB
    if (!ballCarrier) {
      ballCarrier = players.find(p => p.role === 'QB');
    }

    if (ballCarrier) {
      // Find the ball carrier's route action
      const carrierAction = actions.find(a =>
        a.actionType === 'route' && a.fromPlayerId === ballCarrier!.id
      );

      if (carrierAction && carrierAction.actionType === 'route') {
        const controlPoints = carrierAction.route.controlPoints;
        // Route has at least 2 control points (start and end)
        if (controlPoints && controlPoints.length >= 2) {
          const start = controlPoints[0];
          const end = controlPoints[1];

          // Position ball on the route line (20% along the first segment)
          const t = 0.2;
          ballPlayer.alignment.x = start.x + (end.x - start.x) * t;
          ballPlayer.alignment.y = start.y + (end.y - start.y) * t;
        } else {
          // Not enough control points, position near ball carrier
          ballPlayer.alignment.x = ballCarrier.alignment.x;
          ballPlayer.alignment.y = ballCarrier.alignment.y + 0.02;
        }
      } else {
        // No route found, position ball slightly in front of ball carrier
        ballPlayer.alignment.x = ballCarrier.alignment.x;
        ballPlayer.alignment.y = ballCarrier.alignment.y + 0.02;
      }
    }
  }

  return {
    schemaVersion: '1.0' as const,
    type: 'play' as const,
    id: generatedPlay.id,
    name: generatedPlay.name,
    description: generatedPlay.concept.summary,
    tags: [
      generatedPlay.concept.conceptType,
      ...(generatedPlay.concept.badges || []),
    ],
    meta: {
      personnel: generatedPlay.concept.requirements.personnelHints?.[0] ?? '11',
      formationName: generatedPlay.formationName,
      conceptName: generatedPlay.concept.name,
      conceptId: generatedPlay.concept.id,
      strength: 'right' as const,
    },
    field: {
      orientation: 'up' as const,
      showGrid: true,
      showHash: true,
      showYardLines: true,
      backgroundColor: '#ffffff',
      lineColor: '#000000',
    },
    roster: {
      players,
    },
    actions, // Auto-generated from concept template
    notes: {
      callName: generatedPlay.name,
      coachingPoints: generatedPlay.rationale,
    },
    history: {},
    createdAt: now,
    updatedAt: now,
  };
}
