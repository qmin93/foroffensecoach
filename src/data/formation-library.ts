/**
 * Formation Library with Metadata
 * Based on Formation recommendation.md specification
 */

export interface FormationMeta {
  id: string;
  name: string;
  description: string;
  personnel: string[]; // e.g., ["11", "12", "21"]
  structure: string; // e.g., "3x1", "2x2", "Empty"
  requiredRoster: {
    WR: number;
    RB: number;
    TE: number;
    FB: number;
    OL: number;
  };
  tags: string[];
  strengthBias: 'left' | 'right' | 'balanced';
  riskTags: string[];
  // Scoring weights for recommendation
  runFitWeight: number; // 0-1
  passFitWeight: number; // 0-1
  // Style compatibility
  underCenterCompatible: boolean;
  shotgunCompatible: boolean;
  motionFriendly: boolean;
  tempoFriendly: boolean;
}

export const FORMATION_LIBRARY: FormationMeta[] = [
  // Pro Style Formations
  {
    id: 'pro-right',
    name: 'Pro Right',
    description: 'Classic pro-style formation with TE to the right, 2 WRs',
    personnel: ['21', '12'],
    structure: '2x1',
    requiredRoster: { WR: 2, RB: 1, TE: 1, FB: 1, OL: 5 },
    tags: ['pro', 'balanced', 'traditional'],
    strengthBias: 'right',
    riskTags: [],
    runFitWeight: 0.6,
    passFitWeight: 0.4,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: true,
    tempoFriendly: false,
  },
  {
    id: 'pro-left',
    name: 'Pro Left',
    description: 'Pro-style formation with TE to the left',
    personnel: ['21', '12'],
    structure: '1x2',
    requiredRoster: { WR: 2, RB: 1, TE: 1, FB: 1, OL: 5 },
    tags: ['pro', 'balanced', 'traditional'],
    strengthBias: 'left',
    riskTags: [],
    runFitWeight: 0.6,
    passFitWeight: 0.4,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: true,
    tempoFriendly: false,
  },

  // I Formation
  {
    id: 'i-formation',
    name: 'I Formation',
    description: 'Traditional power running formation',
    personnel: ['21', '22'],
    structure: 'I',
    requiredRoster: { WR: 2, RB: 1, TE: 1, FB: 1, OL: 5 },
    tags: ['power', 'run-heavy', 'traditional'],
    strengthBias: 'balanced',
    riskTags: [],
    runFitWeight: 0.8,
    passFitWeight: 0.2,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: false,
    tempoFriendly: false,
  },
  {
    id: 'i-formation-strong',
    name: 'I Formation Strong',
    description: 'I Formation with TE to strong side',
    personnel: ['21'],
    structure: 'I-Strong',
    requiredRoster: { WR: 2, RB: 1, TE: 1, FB: 1, OL: 5 },
    tags: ['power', 'run-heavy', 'strong-side'],
    strengthBias: 'right',
    riskTags: [],
    runFitWeight: 0.85,
    passFitWeight: 0.15,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: false,
    tempoFriendly: false,
  },

  // Spread Formations
  {
    id: 'spread-2x2',
    name: 'Spread 2x2',
    description: 'Balanced spread with 2 receivers each side',
    personnel: ['10', '11'],
    structure: '2x2',
    requiredRoster: { WR: 4, RB: 1, TE: 0, FB: 0, OL: 5 },
    tags: ['spread', 'balanced', 'pass-friendly'],
    strengthBias: 'balanced',
    riskTags: ['light-box'],
    runFitWeight: 0.3,
    passFitWeight: 0.7,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },
  {
    id: 'spread-3x1',
    name: 'Spread 3x1 (Trips)',
    description: 'Trips formation with 3 receivers to one side',
    personnel: ['10', '11'],
    structure: '3x1',
    requiredRoster: { WR: 4, RB: 1, TE: 0, FB: 0, OL: 5 },
    tags: ['spread', 'trips', 'pass-heavy'],
    strengthBias: 'left',
    riskTags: ['one-sided', 'light-box'],
    runFitWeight: 0.25,
    passFitWeight: 0.75,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },

  // Single Back
  {
    id: 'ace',
    name: 'Ace (Single Back)',
    description: 'Single back with 2 TEs and 2 WRs',
    personnel: ['12'],
    structure: '2x2',
    requiredRoster: { WR: 2, RB: 1, TE: 2, FB: 0, OL: 5 },
    tags: ['ace', 'balanced', 'versatile'],
    strengthBias: 'balanced',
    riskTags: [],
    runFitWeight: 0.5,
    passFitWeight: 0.5,
    underCenterCompatible: true,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },
  {
    id: 'shotgun-ace',
    name: 'Shotgun Ace',
    description: 'Ace formation from shotgun',
    personnel: ['11', '12'],
    structure: '2x2',
    requiredRoster: { WR: 3, RB: 1, TE: 1, FB: 0, OL: 5 },
    tags: ['shotgun', 'balanced', 'modern'],
    strengthBias: 'balanced',
    riskTags: [],
    runFitWeight: 0.4,
    passFitWeight: 0.6,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },

  // Empty Formations
  {
    id: 'empty-5-wide',
    name: 'Empty (5 Wide)',
    description: 'All receivers, no backs',
    personnel: ['00', '10'],
    structure: 'Empty',
    requiredRoster: { WR: 5, RB: 0, TE: 0, FB: 0, OL: 5 },
    tags: ['empty', 'pass-only', 'aggressive'],
    strengthBias: 'balanced',
    riskTags: ['no-protection', 'predictable-pass'],
    runFitWeight: 0.0,
    passFitWeight: 1.0,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },
  {
    id: 'empty-trips',
    name: 'Empty Trips',
    description: 'Empty backfield with trips to one side',
    personnel: ['01', '10'],
    structure: 'Empty-3x2',
    requiredRoster: { WR: 4, RB: 0, TE: 1, FB: 0, OL: 5 },
    tags: ['empty', 'trips', 'pass-heavy'],
    strengthBias: 'left',
    riskTags: ['no-protection', 'predictable-pass'],
    runFitWeight: 0.0,
    passFitWeight: 1.0,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },

  // Bunch/Stack Formations
  {
    id: 'bunch-right',
    name: 'Bunch Right',
    description: 'Three receivers bunched to the right',
    personnel: ['10', '11'],
    structure: 'Bunch-3x1',
    requiredRoster: { WR: 3, RB: 1, TE: 1, FB: 0, OL: 5 },
    tags: ['bunch', 'picks', 'rub-routes'],
    strengthBias: 'right',
    riskTags: ['concentrated'],
    runFitWeight: 0.2,
    passFitWeight: 0.8,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: false,
    tempoFriendly: true,
  },

  // Heavy Formations
  {
    id: 'jumbo',
    name: 'Jumbo (Goal Line)',
    description: 'Heavy formation with extra linemen',
    personnel: ['22', '23'],
    structure: 'Heavy',
    requiredRoster: { WR: 1, RB: 2, TE: 2, FB: 0, OL: 5 },
    tags: ['goal-line', 'power', 'short-yardage'],
    strengthBias: 'balanced',
    riskTags: ['predictable-run'],
    runFitWeight: 0.95,
    passFitWeight: 0.05,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: false,
    tempoFriendly: false,
  },
  {
    id: 'heavy-12',
    name: 'Heavy 12',
    description: '12 personnel with run focus',
    personnel: ['12'],
    structure: '2x1-Heavy',
    requiredRoster: { WR: 1, RB: 1, TE: 2, FB: 1, OL: 5 },
    tags: ['heavy', 'run-focused', 'play-action'],
    strengthBias: 'right',
    riskTags: [],
    runFitWeight: 0.7,
    passFitWeight: 0.3,
    underCenterCompatible: true,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: false,
  },

  // Pistol Formations
  {
    id: 'pistol',
    name: 'Pistol',
    description: 'QB closer to line with RB behind',
    personnel: ['11', '12'],
    structure: 'Pistol-2x2',
    requiredRoster: { WR: 3, RB: 1, TE: 1, FB: 0, OL: 5 },
    tags: ['pistol', 'option', 'read-run'],
    strengthBias: 'balanced',
    riskTags: [],
    runFitWeight: 0.55,
    passFitWeight: 0.45,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },
  {
    id: 'pistol-trips',
    name: 'Pistol Trips',
    description: 'Pistol with trips formation',
    personnel: ['10', '11'],
    structure: 'Pistol-3x1',
    requiredRoster: { WR: 4, RB: 1, TE: 0, FB: 0, OL: 5 },
    tags: ['pistol', 'trips', 'versatile'],
    strengthBias: 'left',
    riskTags: [],
    runFitWeight: 0.45,
    passFitWeight: 0.55,
    underCenterCompatible: false,
    shotgunCompatible: true,
    motionFriendly: true,
    tempoFriendly: true,
  },

  // Wing/Flex Formations
  {
    id: 'wing-t',
    name: 'Wing-T',
    description: 'Traditional Wing-T with misdirection',
    personnel: ['21'],
    structure: 'Wing',
    requiredRoster: { WR: 2, RB: 1, TE: 1, FB: 1, OL: 5 },
    tags: ['wing-t', 'misdirection', 'traditional'],
    strengthBias: 'balanced',
    riskTags: [],
    runFitWeight: 0.75,
    passFitWeight: 0.25,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: true,
    tempoFriendly: false,
  },
  {
    id: 'flexbone',
    name: 'Flexbone (Triple Option)',
    description: 'Triple option formation with slot backs',
    personnel: ['20'],
    structure: 'Flexbone',
    requiredRoster: { WR: 2, RB: 3, TE: 0, FB: 0, OL: 5 },
    tags: ['option', 'triple-option', 'run-focused'],
    strengthBias: 'balanced',
    riskTags: ['option-timing'],
    runFitWeight: 0.9,
    passFitWeight: 0.1,
    underCenterCompatible: true,
    shotgunCompatible: false,
    motionFriendly: false,
    tempoFriendly: false,
  },
];

/**
 * Get formation by ID
 */
export function getFormationById(id: string): FormationMeta | undefined {
  return FORMATION_LIBRARY.find((f) => f.id === id);
}

/**
 * Get formations by tag
 */
export function getFormationsByTag(tag: string): FormationMeta[] {
  return FORMATION_LIBRARY.filter((f) => f.tags.includes(tag));
}

/**
 * Get formations by personnel grouping
 */
export function getFormationsByPersonnel(personnel: string): FormationMeta[] {
  return FORMATION_LIBRARY.filter((f) => f.personnel.includes(personnel));
}
