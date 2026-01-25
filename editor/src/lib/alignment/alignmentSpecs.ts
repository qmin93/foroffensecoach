/**
 * Alignment Specification System
 *
 * 좌표를 직접 저장하지 않고, 정렬 규칙(Alignment Specs)을 저장
 * 렌더링 시점에 규칙을 기반으로 좌표를 생성
 *
 * 핵심 원칙:
 * - TE는 반드시 RT/LT에서 OL_GAP 만큼 떨어짐 (anchor 기반)
 * - 모든 좌표는 규칙에서 계산됨
 * - 중복 데이터 없음
 */

// ============================================
// Constants (단일 소스)
// ============================================

/** 1 yard = 0.04 normalized units */
export const YARD = 0.04;

/** O-Line gap (1 yard between each lineman) */
export const OL_GAP = YARD;

/** Field center X */
export const CENTER_X = 0.5;

/** LOS Y position (slightly behind) */
export const LOS_Y = -0.03;

// O-Line absolute positions (the foundation)
export const OL_POSITIONS = {
  C: CENTER_X,
  LG: CENTER_X - OL_GAP,      // 0.46
  RG: CENTER_X + OL_GAP,      // 0.54
  LT: CENTER_X - OL_GAP * 2,  // 0.42
  RT: CENTER_X + OL_GAP * 2,  // 0.58
} as const;

// TE positions (MUST be anchored to tackles)
export const TE_POSITIONS = {
  TE_L: OL_POSITIONS.LT - OL_GAP,  // 0.38 (always LT - 1 yard)
  TE_R: OL_POSITIONS.RT + OL_GAP,  // 0.62 (always RT + 1 yard)
} as const;

// ============================================
// Alignment Spec Types
// ============================================

export type DepthType =
  | 'LOS'           // On line of scrimmage (-0.03)
  | 'SLOT'          // 1 yard off LOS (-0.05)
  | 'QB_UC'         // Under center (-0.09)
  | 'QB_PISTOL'     // Pistol depth (-0.10)
  | 'QB_GUN'        // Shotgun depth (-0.15)
  | 'FB'            // Fullback depth (-0.13)
  | 'TB'            // Tailback I-form depth (-0.19)
  | 'RB_GUN'        // RB in shotgun (-0.15)
  | 'WING'          // Wing position (-0.07)
  | number;         // Custom depth in yards (negative = backfield)

export type AnchorType =
  | 'CENTER'        // Field center
  | 'LT' | 'RT'     // Tackles
  | 'LG' | 'RG'     // Guards
  | 'C'             // Center
  | 'HASH_L' | 'HASH_R'  // Hash marks
  | 'NUMBERS_L' | 'NUMBERS_R'  // Numbers
  | 'SIDELINE_L' | 'SIDELINE_R';  // Sidelines

export interface AlignmentSpec {
  anchor: AnchorType;
  /** Offset from anchor in yards (positive = right/toward strong side) */
  offsetYards: number;
  depth: DepthType;
  /** For eligible/ineligible tracking */
  onLOS?: boolean;
}

// ============================================
// Depth Mapping (DepthType → normalized Y)
// ============================================

export const DEPTH_MAP: Record<string, number> = {
  'LOS': -0.03,
  'SLOT': -0.05,
  'QB_UC': -0.09,
  'QB_PISTOL': -0.10,
  'QB_GUN': -0.15,
  'FB': -0.13,
  'TB': -0.19,
  'RB_GUN': -0.15,
  'WING': -0.07,
};

// ============================================
// Anchor X Position Mapping
// ============================================

export const ANCHOR_X_MAP: Record<AnchorType, number> = {
  'CENTER': CENTER_X,
  'C': OL_POSITIONS.C,
  'LG': OL_POSITIONS.LG,
  'RG': OL_POSITIONS.RG,
  'LT': OL_POSITIONS.LT,
  'RT': OL_POSITIONS.RT,
  'HASH_L': 0.35,
  'HASH_R': 0.65,
  'NUMBERS_L': 0.15,
  'NUMBERS_R': 0.85,
  'SIDELINE_L': 0.05,
  'SIDELINE_R': 0.95,
};

// ============================================
// Coordinate Generation Functions
// ============================================

/**
 * Generate X coordinate from alignment spec
 */
export function generateX(spec: AlignmentSpec): number {
  const anchorX = ANCHOR_X_MAP[spec.anchor];
  const offsetNormalized = spec.offsetYards * YARD;
  return anchorX + offsetNormalized;
}

/**
 * Generate Y coordinate from alignment spec
 */
export function generateY(spec: AlignmentSpec): number {
  if (typeof spec.depth === 'number') {
    // Custom depth in yards (negative = backfield)
    return spec.depth * YARD;
  }
  return DEPTH_MAP[spec.depth] ?? LOS_Y;
}

/**
 * Generate both coordinates from alignment spec
 */
export function generateCoordinates(spec: AlignmentSpec): { x: number; y: number } {
  return {
    x: generateX(spec),
    y: generateY(spec),
  };
}

// ============================================
// Pre-defined Alignment Specs for Common Positions
// ============================================

export const ALIGNMENT_PRESETS: Record<string, AlignmentSpec> = {
  // O-Line (always on LOS)
  'C': { anchor: 'C', offsetYards: 0, depth: 'LOS', onLOS: true },
  'LG': { anchor: 'LG', offsetYards: 0, depth: 'LOS', onLOS: true },
  'RG': { anchor: 'RG', offsetYards: 0, depth: 'LOS', onLOS: true },
  'LT': { anchor: 'LT', offsetYards: 0, depth: 'LOS', onLOS: true },
  'RT': { anchor: 'RT', offsetYards: 0, depth: 'LOS', onLOS: true },

  // TE (MUST be anchored to tackles with OL gap)
  'TE_L': { anchor: 'LT', offsetYards: -1, depth: 'LOS', onLOS: true },
  'TE_R': { anchor: 'RT', offsetYards: 1, depth: 'LOS', onLOS: true },

  // Wide Receivers
  'X_WIDE_L': { anchor: 'SIDELINE_L', offsetYards: 0, depth: 'LOS', onLOS: true },
  'Z_WIDE_R': { anchor: 'SIDELINE_R', offsetYards: 0, depth: 'LOS', onLOS: true },
  'X_SPLIT_L': { anchor: 'NUMBERS_L', offsetYards: -1, depth: 'LOS', onLOS: true },
  'Z_SPLIT_R': { anchor: 'NUMBERS_R', offsetYards: 1, depth: 'LOS', onLOS: true },

  // Slot Receivers (off LOS for eligibility)
  'SLOT_L': { anchor: 'NUMBERS_L', offsetYards: 0, depth: 'SLOT', onLOS: false },
  'SLOT_R': { anchor: 'NUMBERS_R', offsetYards: 0, depth: 'SLOT', onLOS: false },
  'SLOT_L_TIGHT': { anchor: 'LT', offsetYards: -5, depth: 'SLOT', onLOS: false },
  'SLOT_R_TIGHT': { anchor: 'RT', offsetYards: 5, depth: 'SLOT', onLOS: false },

  // Backfield
  'QB_UC': { anchor: 'CENTER', offsetYards: 0, depth: 'QB_UC' },
  'QB_PISTOL': { anchor: 'CENTER', offsetYards: 0, depth: 'QB_PISTOL' },
  'QB_GUN': { anchor: 'CENTER', offsetYards: 0, depth: 'QB_GUN' },
  'FB_CENTER': { anchor: 'CENTER', offsetYards: 0, depth: 'FB' },
  'RB_I': { anchor: 'CENTER', offsetYards: 0, depth: 'TB' },
  'RB_GUN_L': { anchor: 'LG', offsetYards: 0, depth: 'RB_GUN' },
  'RB_GUN_R': { anchor: 'RG', offsetYards: 0, depth: 'RB_GUN' },
  'WING_R': { anchor: 'RT', offsetYards: 3, depth: 'WING' },
  'WING_L': { anchor: 'LT', offsetYards: -3, depth: 'WING' },
};

// ============================================
// TE Position Enforcement
// ============================================

/**
 * CRITICAL: Enforce TE position rule
 * TE must ALWAYS be exactly OL_GAP from the tackle
 * This function corrects any manually entered TE position
 */
export function enforceTePosition(
  role: string,
  currentX: number,
  currentY: number,
  side: 'left' | 'right' | 'auto'
): { x: number; y: number } {
  // Only apply to TE roles
  if (!role.toUpperCase().includes('TE') && role !== 'Y' && role !== 'U') {
    return { x: currentX, y: currentY };
  }

  // Determine side from current position if auto
  const actualSide = side === 'auto'
    ? (currentX < CENTER_X ? 'left' : 'right')
    : side;

  // Calculate correct X based on anchor to tackle
  const correctX = actualSide === 'left'
    ? TE_POSITIONS.TE_L  // LT - OL_GAP = 0.38
    : TE_POSITIONS.TE_R; // RT + OL_GAP = 0.62

  return {
    x: correctX,
    y: LOS_Y, // TE is always on LOS
  };
}

/**
 * Validate and correct all player positions in a formation
 * Returns corrected positions with TE enforcement
 */
export function enforceFormationRules(
  players: Array<{ role: string; label: string; x: number; y: number }>
): Array<{ role: string; label: string; x: number; y: number }> {
  return players.map(p => {
    // Enforce TE positioning
    if (p.role === 'TE' || p.label === 'Y' || p.label === 'U') {
      const corrected = enforceTePosition(p.role, p.x, p.y, 'auto');
      return { ...p, x: corrected.x, y: corrected.y };
    }
    return p;
  });
}
