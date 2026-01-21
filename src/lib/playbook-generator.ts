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
  let score = 50;
  const rationale: string[] = [];

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

  return { score: Math.min(100, Math.max(0, score)), rationale };
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
    console.log('Generated actions for play:', {
      playName: generatedPlay.name,
      conceptName: generatedPlay.concept.name,
      formationKey: generatedPlay.formationKey,
      playersCount: players.length,
      actionsCount: actions.length,
      firstAction: actions[0],
    });
  } catch (err) {
    console.error('Error building concept actions:', err, {
      concept: generatedPlay.concept.name,
      formation: generatedPlay.formationKey,
    });
    // Continue with empty actions rather than failing
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
