// editor/src/data/tier1-lock.ts
// Tier-1 Lock: 추천/퀵스타트에 노출되는 핵심 포메이션과 컨셉만 정의
// 현대 풋볼에서 80%+ 사용되는 표준 플레이만 포함

export const TIER1_FORMATION_KEYS = [
  // Spread / Air Raid - Tier 1 (most used 60%+)
  'shotgun',
  'spread',
  'trips',
  'tripsLeft',
  'twins',
  'twinsLeft',
  'bunch',
  'bunchLeft',
  'emptySet',
  'emptyTrips',
  'slot',
  'slotLeft',
  // Pro Style - Tier 1-2
  'singleBack',
  'ace',
  'aceTwinsRight',
  'aceTwinsLeft',
  // Power / Run
  'iFormation',
  'goalLine',
  // Option
  'pistol',
] as const;

export const TIER1_PASS_CONCEPT_IDS = [
  // Quick
  'pass_stick',
  'pass_spacing',
  'pass_snag',
  'pass_slant_flat',
  'pass_hitch_seam',
  'pass_hank',
  'pass_double_slant',
  'pass_quick_out',
  'pass_speed_out',
  // Intermediate / Core Dropback
  'pass_curl_flat',
  'pass_smash',
  'pass_mesh',
  'pass_shallow',
  'pass_drive',
  'pass_levels',
  'pass_y_cross',
  // Deep / Stretch
  'pass_flood',
  'pass_sail',
  'pass_dagger',
  'pass_post_dig',
  'pass_verts',
  'pass_switch_verts',
  'pass_yankee',
  // Screens / Pressure answers
  'pass_now_screen',
  'pass_bubble',
  'pass_tunnel',
  'pass_jail',
] as const;

export const TIER1_RUN_CONCEPT_IDS = [
  // Inside / Zone family
  'run_inside_zone',
  'run_split_zone',
  'run_duo',
  'run_mid_zone',
  // Wide / Perimeter
  'run_outside_zone',
  'run_wide_zone',
  'run_stretch',
  'run_toss',
  'run_pin_pull',
  'run_buck_sweep',
  // Gap / Pull
  'run_power',
  'run_gt_counter',
  'run_oh_counter',
  'run_guard_trap',
  'run_tackle_trap',
  // Specialty / Answers
  'run_wham',
  'run_iso',
  'run_lead_iso',
  'run_qb_power',
  'run_read_option',
  'run_power_read',
  'run_rpo_zone',
  'run_jet_sweep',
] as const;

// 타입 정의
export type Tier1FormationKey = typeof TIER1_FORMATION_KEYS[number];
export type Tier1PassConceptId = typeof TIER1_PASS_CONCEPT_IDS[number];
export type Tier1RunConceptId = typeof TIER1_RUN_CONCEPT_IDS[number];
export type Tier1ConceptId = Tier1PassConceptId | Tier1RunConceptId;

// 헬퍼 함수
export const TIER1_CONCEPT_SET = new Set<string>([
  ...TIER1_PASS_CONCEPT_IDS,
  ...TIER1_RUN_CONCEPT_IDS,
]);

export const TIER1_FORMATION_SET = new Set<string>(TIER1_FORMATION_KEYS);

export function isTier1Concept(conceptId: string): boolean {
  return TIER1_CONCEPT_SET.has(conceptId);
}

export function isTier1Formation(formationKey: string): boolean {
  return TIER1_FORMATION_SET.has(formationKey);
}
