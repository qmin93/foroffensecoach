/**
 * Team Profile Types
 * Based on Formation recommendation.md specification
 */

// Position quality rating (1-5 scale)
export type QualityRating = 1 | 2 | 3 | 4 | 5;

// Position availability
export interface PositionAvailability {
  count: number;
  starterQuality: QualityRating;
}

// Roster availability for all offensive positions
export interface RosterAvailability {
  QB: PositionAvailability;
  RB: PositionAvailability;
  FB: PositionAvailability;
  WR: PositionAvailability;
  TE: PositionAvailability;
  OL: PositionAvailability;
}

// Unit strength ratings (1-5 scale)
export interface UnitStrength {
  olRunBlock: QualityRating;
  olPassPro: QualityRating;
  rbVision: QualityRating;
  rbPower: QualityRating;
  wrSeparation: QualityRating;
  wrCatch: QualityRating;
  qbArm: QualityRating;
  qbDecision: QualityRating;
  qbMobility: QualityRating;
  teBlock: QualityRating;
  teRoute: QualityRating;
}

// Style preference levels
export type PreferenceLevel = 'low' | 'medium' | 'high';
export type RunPassBalance = 'run_heavy' | 'balanced' | 'pass_heavy';
export type RiskTolerance = 'conservative' | 'normal' | 'aggressive';

// Style preferences
export interface StylePreferences {
  runPassBalance: RunPassBalance;
  underCenterUsage: PreferenceLevel;
  motionUsage: PreferenceLevel;
  tempo: PreferenceLevel;
  riskTolerance: RiskTolerance;
}

// Complete Team Profile
export interface TeamProfile {
  schemaVersion: '1.0';
  type: 'team_profile';
  id: string;
  teamName: string;
  rosterAvailability: RosterAvailability;
  unitStrength: UnitStrength;
  stylePreferences: StylePreferences;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

// Default values for creating a new team profile
export const DEFAULT_ROSTER_AVAILABILITY: RosterAvailability = {
  QB: { count: 2, starterQuality: 3 },
  RB: { count: 3, starterQuality: 3 },
  FB: { count: 1, starterQuality: 3 },
  WR: { count: 5, starterQuality: 3 },
  TE: { count: 2, starterQuality: 3 },
  OL: { count: 8, starterQuality: 3 },
};

export const DEFAULT_UNIT_STRENGTH: UnitStrength = {
  olRunBlock: 3,
  olPassPro: 3,
  rbVision: 3,
  rbPower: 3,
  wrSeparation: 3,
  wrCatch: 3,
  qbArm: 3,
  qbDecision: 3,
  qbMobility: 3,
  teBlock: 3,
  teRoute: 3,
};

export const DEFAULT_STYLE_PREFERENCES: StylePreferences = {
  runPassBalance: 'balanced',
  underCenterUsage: 'medium',
  motionUsage: 'medium',
  tempo: 'medium',
  riskTolerance: 'normal',
};

export function createEmptyTeamProfile(teamName: string = 'My Team'): TeamProfile {
  return {
    schemaVersion: '1.0',
    type: 'team_profile',
    id: crypto.randomUUID(),
    teamName,
    rosterAvailability: { ...DEFAULT_ROSTER_AVAILABILITY },
    unitStrength: { ...DEFAULT_UNIT_STRENGTH },
    stylePreferences: { ...DEFAULT_STYLE_PREFERENCES },
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
