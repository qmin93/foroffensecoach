/**
 * Formation Recommendation Engine
 * Based on Formation recommendation.md specification
 *
 * Pipeline:
 * 1. Feasibility Filter - Remove formations that don't match roster
 * 2. Capability Scoring - Score based on unit strength
 * 3. Style Adjustment - Adjust scores based on style preferences
 * 4. Return Top 5 with rationale
 */

import { TeamProfile } from '@/types/team-profile';
import { FormationMeta, FORMATION_LIBRARY } from '@/data/formation-library';

export interface FormationRecommendation {
  formation: FormationMeta;
  score: number;
  breakdown: {
    runFit: number;
    passFit: number;
    styleFit: number;
  };
  rationale: string[];
}

/**
 * Step 1: Feasibility Filter
 * Remove formations that require more players than available
 */
function filterByFeasibility(
  formations: FormationMeta[],
  profile: TeamProfile
): FormationMeta[] {
  return formations.filter((formation) => {
    const { requiredRoster } = formation;
    const { rosterAvailability } = profile;

    // Check if we have enough players at each position
    if (requiredRoster.WR > rosterAvailability.WR.count) return false;
    if (requiredRoster.RB > rosterAvailability.RB.count) return false;
    if (requiredRoster.TE > rosterAvailability.TE.count) return false;
    if (requiredRoster.FB > rosterAvailability.FB.count) return false;
    if (requiredRoster.OL > rosterAvailability.OL.count) return false;

    return true;
  });
}

/**
 * Step 2: Calculate Run Fit Score (0-40 points)
 * Formula: olRunBlock×5 + rbVision×3 + teBlock×2
 */
function calculateRunFitScore(profile: TeamProfile): number {
  const { unitStrength } = profile;
  return (
    unitStrength.olRunBlock * 5 +
    unitStrength.rbVision * 3 +
    unitStrength.teBlock * 2
  );
}

/**
 * Step 2: Calculate Pass Fit Score (0-40 points)
 * Formula: olPassPro×4 + wrSeparation×4 + qbDecision×2
 */
function calculatePassFitScore(profile: TeamProfile): number {
  const { unitStrength } = profile;
  return (
    unitStrength.olPassPro * 4 +
    unitStrength.wrSeparation * 4 +
    unitStrength.qbDecision * 2
  );
}

/**
 * Step 3: Calculate Style Fit Score (0-20 points)
 */
function calculateStyleFitScore(
  formation: FormationMeta,
  profile: TeamProfile
): number {
  const { stylePreferences } = profile;
  let score = 0;

  // Run/Pass Balance Match (0-8 points)
  if (stylePreferences.runPassBalance === 'run_heavy') {
    score += formation.runFitWeight * 8;
  } else if (stylePreferences.runPassBalance === 'pass_heavy') {
    score += formation.passFitWeight * 8;
  } else {
    // Balanced - favor formations close to 50/50
    const balance = Math.abs(formation.runFitWeight - 0.5);
    score += (1 - balance) * 8;
  }

  // Under Center Usage (0-4 points)
  if (stylePreferences.underCenterUsage === 'high' && formation.underCenterCompatible) {
    score += 4;
  } else if (stylePreferences.underCenterUsage === 'low' && formation.shotgunCompatible) {
    score += 4;
  } else if (stylePreferences.underCenterUsage === 'medium') {
    score += 2;
  }

  // Motion Usage (0-4 points)
  if (stylePreferences.motionUsage === 'high' && formation.motionFriendly) {
    score += 4;
  } else if (stylePreferences.motionUsage === 'low' && !formation.motionFriendly) {
    score += 4;
  } else if (stylePreferences.motionUsage === 'medium') {
    score += 2;
  }

  // Tempo (0-4 points)
  if (stylePreferences.tempo === 'high' && formation.tempoFriendly) {
    score += 4;
  } else if (stylePreferences.tempo === 'low' && !formation.tempoFriendly) {
    score += 4;
  } else if (stylePreferences.tempo === 'medium') {
    score += 2;
  }

  return score;
}

/**
 * Generate rationale for a formation recommendation
 */
function generateRationale(
  formation: FormationMeta,
  profile: TeamProfile,
  breakdown: { runFit: number; passFit: number; styleFit: number }
): string[] {
  const rationale: string[] = [];
  const { unitStrength, stylePreferences, rosterAvailability } = profile;

  // Run-focused rationale
  if (formation.runFitWeight >= 0.6) {
    if (unitStrength.olRunBlock >= 4) {
      rationale.push(`Strong OL run blocking (${unitStrength.olRunBlock}/5) maximizes power run game`);
    }
    if (unitStrength.rbVision >= 4) {
      rationale.push(`Elite RB vision (${unitStrength.rbVision}/5) exploits zone scheme cutback lanes`);
    }
    if (formation.tags.includes('power')) {
      rationale.push('Gap scheme creates angles for downhill running');
    }
  }

  // Pass-focused rationale
  if (formation.passFitWeight >= 0.6) {
    if (unitStrength.wrSeparation >= 4) {
      rationale.push(`Strong WR separation (${unitStrength.wrSeparation}/5) creates open targets`);
    }
    if (unitStrength.olPassPro >= 4) {
      rationale.push(`Elite pass protection (${unitStrength.olPassPro}/5) gives QB time`);
    }
    if (formation.structure.includes('3x1') || formation.structure.includes('trips')) {
      rationale.push('Trips alignment stresses coverage with route combinations');
    }
  }

  // Style match rationale
  if (stylePreferences.motionUsage === 'high' && formation.motionFriendly) {
    rationale.push('Motion-friendly structure enables pre-snap adjustments');
  }
  if (stylePreferences.tempo === 'high' && formation.tempoFriendly) {
    rationale.push('Formation supports up-tempo operations');
  }

  // Personnel fit rationale
  if (formation.requiredRoster.TE >= 2 && rosterAvailability.TE.count >= 2) {
    if (unitStrength.teBlock >= 4 && unitStrength.teRoute >= 3) {
      rationale.push('Dual TE personnel leverages blocking AND receiving threats');
    }
  }

  // Risk consideration
  if (formation.riskTags.length > 0 && stylePreferences.riskTolerance === 'aggressive') {
    rationale.push(`Aggressive formation choice: ${formation.riskTags.join(', ')}`);
  }

  // Ensure we have at least 2 rationale points
  if (rationale.length < 2) {
    rationale.push(`${formation.structure} structure matches ${stylePreferences.runPassBalance} style`);
    rationale.push(`Personnel (${formation.personnel.join('/')}) fits roster availability`);
  }

  // Return max 3 rationale points
  return rationale.slice(0, 3);
}

/**
 * Main recommendation function
 * Returns top 5 formations sorted by total score
 */
export function recommendFormations(
  profile: TeamProfile,
  options: {
    limit?: number;
    filterTags?: string[];
  } = {}
): FormationRecommendation[] {
  const { limit = 5, filterTags = [] } = options;

  // Start with all formations
  let formations = [...FORMATION_LIBRARY];

  // Apply tag filter if specified
  if (filterTags.length > 0) {
    formations = formations.filter((f) =>
      filterTags.some((tag) => f.tags.includes(tag))
    );
  }

  // Step 1: Feasibility filter
  const feasibleFormations = filterByFeasibility(formations, profile);

  // Step 2 & 3: Score each formation
  const runFitBase = calculateRunFitScore(profile);
  const passFitBase = calculatePassFitScore(profile);

  const scoredFormations: FormationRecommendation[] = feasibleFormations.map(
    (formation) => {
      // Weight the base scores by formation's run/pass fit weights
      const runFit = runFitBase * formation.runFitWeight;
      const passFit = passFitBase * formation.passFitWeight;
      const styleFit = calculateStyleFitScore(formation, profile);

      const breakdown = { runFit, passFit, styleFit };
      const totalScore = runFit + passFit + styleFit;

      return {
        formation,
        score: Math.round(totalScore * 10) / 10,
        breakdown: {
          runFit: Math.round(runFit * 10) / 10,
          passFit: Math.round(passFit * 10) / 10,
          styleFit: Math.round(styleFit * 10) / 10,
        },
        rationale: generateRationale(formation, profile, breakdown),
      };
    }
  );

  // Sort by score descending and return top N
  return scoredFormations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get formations by style preference
 */
export function getFormationsByStyle(
  profile: TeamProfile,
  style: 'run' | 'pass' | 'balanced'
): FormationRecommendation[] {
  const tagMap = {
    run: ['power', 'run-heavy', 'run-focused'],
    pass: ['pass-heavy', 'pass-friendly', 'spread'],
    balanced: ['balanced', 'versatile'],
  };

  return recommendFormations(profile, {
    filterTags: tagMap[style],
    limit: 5,
  });
}

/**
 * Quick validation to check if team profile is complete enough for recommendations
 */
export function validateProfileForRecommendation(profile: TeamProfile): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check roster availability
  const { rosterAvailability } = profile;
  if (rosterAvailability.QB.count < 1) issues.push('Need at least 1 QB');
  if (rosterAvailability.OL.count < 5) issues.push('Need at least 5 OL');
  if (
    rosterAvailability.WR.count +
      rosterAvailability.TE.count +
      rosterAvailability.RB.count <
    3
  ) {
    issues.push('Need at least 3 skill players (WR/TE/RB combined)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
