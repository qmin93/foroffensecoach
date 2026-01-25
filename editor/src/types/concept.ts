/**
 * Concept Types for ForOffenseCoach
 * Based on DSL Specification v1.0 - Section 4.4, 8
 *
 * Concept는 추천/자동생성의 "레시피"다.
 * Pass 20개 + Run 20개 = 40개 컨셉으로 MVP 구성
 */

// ============================================
// Base Types
// ============================================

export type ConceptType = 'pass' | 'run';

/**
 * Concept Tier Classification
 * 1 = Core: 현대 풋볼에서 80%+ 사용 (NFL/NCAA 표준)
 * 2 = Situational: 상황/팀 스타일에 따라 사용
 * 3 = Legacy: 특수 오펜스 또는 드물게 사용
 */
export type ConceptTier = 1 | 2 | 3;

export const TIER_LABELS: Record<ConceptTier, string> = {
  1: 'Core',
  2: 'Situational',
  3: 'Legacy',
};

export const TIER_DESCRIPTIONS: Record<ConceptTier, string> = {
  1: 'Commonly used in modern football (NFL/NCAA)',
  2: 'Effective in specific situations or team styles',
  3: 'Specialized schemes or less common concepts',
};

export type PassCategory = 'quick' | 'intermediate' | 'deep' | 'screen';
export type RunCategory = 'inside_zone' | 'outside_zone' | 'gap' | 'power' | 'counter' | 'option' | 'special';

export type RoutePattern =
  // Quick
  | 'hitch'
  | 'speed_out'
  | 'quick_out'
  | 'slant'
  | 'arrow'
  | 'flat'
  | 'quick_slant'
  | 'hank'
  // Intermediate
  | 'curl'
  | 'dig'
  | 'out'
  | 'in'
  | 'cross'
  | 'shallow'
  | 'whip'
  | 'over'
  | 'stick'
  | 'snag'
  | 'drive'
  | 'bench'
  | 'out_and_up'
  | 'out_up'
  | 'texas'
  | 'china'
  | 'divide'
  | 'scissor'
  // Deep
  | 'go'
  | 'post'
  | 'corner'
  | 'deep_out'
  | 'seam'
  | 'wheel'
  | 'return'
  | 'comeback'
  | 'skinny_post'
  | 'follow'
  | 'dragon'
  // Special
  | 'pivot'
  | 'bubble'
  | 'tunnel'
  | 'angle'
  | 'swing'
  | 'delay'
  | 'screen'
  | 'slip'
  | 'check_release'
  | 'draw'
  | 'flare'
  | 'option'
  | 'custom';

export type BlockScheme =
  // Zone
  | 'zone_step'
  | 'reach'
  | 'combo'
  | 'climb'
  | 'scoop'
  // Gap/Power
  | 'down'
  | 'kick'
  | 'wrap'
  | 'pull_lead'
  | 'pull_kick'
  | 'trap'
  | 'fold'
  | 'pin'
  // Specialty
  | 'wham'
  | 'arc'
  | 'sift'
  | 'seal'
  | 'log'
  | 'cut'
  // Perimeter
  | 'crack'
  | 'stalk'
  | 'lead'
  | 'iso'
  | 'insert'
  // Pass Protection
  | 'pass_set'
  | 'slide'
  | 'hinge'
  | 'fan'
  // Option
  | 'veer'
  | 'midline'
  | 'load'
  | 'speed';

export type MotionType = 'jet' | 'orbit' | 'return' | 'shift' | 'short' | 'custom';

export type PreferredStructure = '2x2' | '3x1' | 'bunch' | 'stack' | 'trips' | 'twins' | 'ace' | 'I' | 'pistol' | 'empty' | 'wishbone' | 'flexbone' | 'veer' | 'wildcat' | 'pro' | 'singleback' | 'shotgun' | 'spread';

export type Personnel = '10' | '11' | '12' | '13' | '20' | '21' | '22' | '23';

export type BoxTolerance = '6_ok' | '7_ok' | '8_risky';

export type PullerNeeds = 'none' | 'G' | 'T' | 'GT';

export type FrontType = 'even' | 'odd' | 'bear' | 'over' | 'under';

export type ThreeTechPosition = 'strong' | 'weak' | 'none' | 'both';

export type DrillPhase = 'indy' | 'group' | 'team';

export type CoverageStress = 'horizontal' | 'vertical' | 'flat_conflict' | 'mof' | 'boundary' | 'seam' | 'levels' | 'deep_middle' | 'sideline' | 'wheel' | 'corner' | 'flood' | 'high_low' | 'triangle';

// ============================================
// Video Reference (for Install Focus)
// ============================================

export interface VideoRef {
  platform: 'instagram' | 'youtube' | 'tiktok';
  url: string;
  thumbnailUrl?: string;
  accountName: string;
  hashtags?: string[];
}

// ============================================
// Drill & Failure Point (Install Focus)
// ============================================

export interface Drill {
  name: string;
  purpose: string;
  phase: DrillPhase;
}

export interface FailurePoint {
  id: string;
  name: string;
  drill: Drill;
  videoRefs?: VideoRef[];
}

export interface InstallFocus {
  failurePoints: FailurePoint[]; // Max 3 per concept
}

// ============================================
// Concept Template (Route/Block assignments)
// ============================================

export interface RouteAssignment {
  pattern: RoutePattern;
  depth?: number; // yards
  breakAngleDeg?: number;
  direction?: 'inside' | 'outside' | 'up' | 'back';
}

export interface BlockAssignment {
  scheme: BlockScheme;
  target?: string; // Role name or 'EMOL', 'PSLB', etc.
}

export interface MotionAssignment {
  motionType?: MotionType;
  pattern?: MotionType | string;
  direction?: 'across' | 'towards' | 'away' | 'return';
  timing?: 'pre_snap' | 'post_snap';
}

export interface TemplateRole {
  roleName: string; // e.g., 'CLEAR', 'FLAT', 'PULLER', 'KICK'
  appliesTo: string[]; // Player roles: ['X', 'Z'], ['RG'], ['RB']
  defaultRoute?: RouteAssignment;
  defaultBlock?: BlockAssignment;
  defaultMotion?: MotionAssignment;
  assignment?: string; // Player's assignment text (e.g., "Zone step, combo to LB")
  notes?: string;
}

export interface BuildPolicy {
  placementStrategy: 'relative_to_alignment' | 'absolute_template' | 'hybrid';
  defaultSide: 'strength' | 'boundary' | 'field' | 'left' | 'right' | 'weak';
  conflictPolicy?: 'add_layer' | 'replace_actions';
  routeDepthScale?: number;
  runLandmarks?: boolean;
}

export interface ConceptTemplate {
  roles: TemplateRole[];
  buildPolicy: BuildPolicy;
}

// ============================================
// Suggestion Hints
// ============================================

export interface PassHints {
  category: PassCategory;
  manBeater: boolean;
  zoneBeater: boolean;
  stress: CoverageStress[];
  dropType?: 'quick' | '3_step' | '5_step' | '7_step' | 'sprint_out' | 'bootleg';
}

export interface RunHints {
  category: RunCategory;
  bestVsFront: FrontType[];
  bestVs3T: ThreeTechPosition[];
  bestWhenBox: ('6' | '7' | '8')[];
  surfaceNeeds?: 'te_required' | 'te_preferred' | 'te_optional' | 'no_te';
  aim: string; // e.g., 'a_gap', 'b_gap', 'c_gap', 'off_tackle', 'edge'
}

export interface SuggestionHints {
  passHints?: PassHints;
  runHints?: RunHints;
}

// ============================================
// Concept Requirements (for filtering/matching)
// ============================================

export interface ConceptRequirements {
  // Pass requirements
  minEligibleReceivers?: number; // 3, 4, 5
  preferredStructures?: PreferredStructure[];
  personnelHints?: Personnel[];

  // Run requirements
  needsTE?: boolean;
  needsPuller?: PullerNeeds;
  boxTolerance?: BoxTolerance;

  // Common
  preferredFormations?: string[]; // Formation IDs or names
}

// ============================================
// Main Concept Type
// ============================================

export interface Concept {
  schemaVersion: '1.0';
  type: 'concept';
  id: string;
  name: string;
  conceptType: ConceptType;
  tier: ConceptTier; // 1=Core, 2=Situational, 3=Legacy
  summary: string;
  badges?: string[]; // e.g., ['nfl_style', 'air_raid', 'west_coast']

  requirements: ConceptRequirements;
  template: ConceptTemplate;
  suggestionHints: SuggestionHints;
  installFocus?: InstallFocus;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  extensions?: Record<string, unknown>;
}

// ============================================
// Concept Display Types (for UI)
// ============================================

export interface RoleAssignmentDisplay {
  roleName: string;
  appliesTo: string[];
  action: string; // e.g., "Slant @ 6 yds" or "Zone block"
  notes?: string;
}

export interface ConceptCardData {
  id: string;
  name: string;
  conceptType: ConceptType;
  tier: ConceptTier; // 1=Core, 2=Situational, 3=Legacy
  category: PassCategory | RunCategory;
  summary: string;
  badges: string[];
  matchScore?: number; // 0-100, for recommendation ranking
  rationale?: string[]; // 3-line explanation for run concepts
  roles?: RoleAssignmentDisplay[]; // Player assignments for this concept
}

// ============================================
// Recommendation Engine Types
// ============================================

export interface FormationContext {
  formationId?: string;
  structure?: PreferredStructure;
  personnel?: Personnel;
  receiverCount: number;
  hasTightEnd: boolean;
  hasFullback?: boolean;
  strengthSide?: 'left' | 'right';
  strength?: 'left' | 'right';
}

export interface DefenseContext {
  boxCount?: 6 | 7 | 8;
  front?: FrontType;
  threeTech?: ThreeTechPosition;
  coverage?: string;
}

export interface RecommendationInput {
  formation: FormationContext;
  defense?: DefenseContext;
  preferredType?: ConceptType;
}

export interface RecommendationResult {
  concepts: ConceptCardData[];
  totalMatches: number;
  filters: {
    byType: { pass: number; run: number };
    byCategory: Record<string, number>;
  };
}

// ============================================
// Auto-build Types
// ============================================

export interface AutoBuildResult {
  success: boolean;
  actionsCreated: number;
  warnings?: string[];
}

// ============================================
// Constants
// ============================================

export const PASS_CATEGORIES: PassCategory[] = ['quick', 'intermediate', 'deep', 'screen'];

export const RUN_CATEGORIES: RunCategory[] = [
  'inside_zone',
  'outside_zone',
  'gap',
  'power',
  'counter',
  'option',
  'special',
];

export const BADGE_LABELS: Record<string, string> = {
  nfl_style: 'NFL',
  air_raid: 'Air Raid',
  west_coast: 'West Coast',
  spread: 'Spread',
  pro_style: 'Pro Style',
  option: 'Option',
  rpo: 'RPO',
};

export const CATEGORY_LABELS: Record<PassCategory | RunCategory, string> = {
  quick: 'Quick Game',
  intermediate: 'Intermediate',
  deep: 'Deep',
  screen: 'Screen',
  inside_zone: 'Inside Zone',
  outside_zone: 'Outside Zone',
  gap: 'Gap Scheme',
  power: 'Power',
  counter: 'Counter',
  option: 'Option',
  special: 'Special',
};
