/**
 * Formation Validation System
 *
 * 포메이션 검증 규칙:
 * 1. TE_POSITION: TE는 RT/LT에서 정확히 OL_GAP(1야드) 거리, LOS에 위치
 * 2. SLOT_DEPTH: 슬롯 리시버는 LOS 뒤 (y < -0.04)
 * 3. QB_CENTER_OVERLAP: QB와 Center 겹침 금지
 * 4. MINIMUM_SPACING: 모든 선수 간 최소 0.06 간격
 * 5. SEVEN_ON_LOS: LOS에 최소 7명 (에러)
 */

import {
  YARD,
  OL_GAP,
  OL_POSITIONS,
  TE_POSITIONS,
  LOS_Y,
  CENTER_X,
  DEPTH_MAP,
} from './alignmentSpecs';
import type { FormationPlayer } from '@/store/formations';

// ============================================
// Types
// ============================================

export type ViolationSeverity = 'error' | 'warning';

export type ValidationRuleId =
  | 'TE_POSITION'
  | 'SLOT_DEPTH'
  | 'QB_CENTER_OVERLAP'
  | 'MINIMUM_SPACING'
  | 'SEVEN_ON_LOS';

export interface Violation {
  ruleId: ValidationRuleId;
  playerId?: string;
  playerLabel: string;
  message: string;
  severity: ViolationSeverity;
  autoFixed: boolean;
  /** Original value before auto-fix */
  originalValue?: { x: number; y: number };
  /** Corrected value after auto-fix */
  correctedValue?: { x: number; y: number };
}

export interface ValidationResult {
  valid: boolean;
  violations: Violation[];
  /** Auto-corrected players (if autoCorrect was true) */
  correctedPlayers?: FormationPlayer[];
}

export interface ValidationOptions {
  /** If true, auto-correct violations where possible */
  autoCorrect?: boolean;
  /** Skip specific rules */
  skipRules?: ValidationRuleId[];
}

// ============================================
// Constants
// ============================================

/** Minimum spacing between any two players (2x node radius + margin) */
const MINIMUM_PLAYER_SPACING = 0.06;

/** Tolerance for position comparisons (small floating point margin) */
const POSITION_TOLERANCE = 0.005;

/** LOS Y threshold - players with y > this are considered "on LOS" */
const LOS_Y_THRESHOLD = -0.04; // -1 yard

/** Slot depth threshold - slot receivers must be deeper than this */
const SLOT_DEPTH_THRESHOLD = -0.04; // -1 yard

// ============================================
// Individual Validators
// ============================================

/**
 * Validate TE Position Rule
 * TE must be exactly OL_GAP (1 yard) from the tackle on LOS
 */
function validateTePosition(
  players: FormationPlayer[],
  autoCorrect: boolean
): { violations: Violation[]; correctedPlayers: FormationPlayer[] } {
  const violations: Violation[] = [];
  const correctedPlayers = [...players];

  // Find tackles
  const lt = players.find((p) => p.role === 'LT' || p.label === 'LT');
  const rt = players.find((p) => p.role === 'RT' || p.label === 'RT');

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Check if this is a TE
    if (player.role !== 'TE' && player.label !== 'Y' && player.label !== 'U') {
      continue;
    }

    // Determine which side the TE should be on based on current position
    const isLeftSide = player.x < CENTER_X;
    const expectedX = isLeftSide ? TE_POSITIONS.TE_L : TE_POSITIONS.TE_R;
    const expectedY = LOS_Y;
    const tackleRef = isLeftSide ? lt : rt;
    const tackleX = isLeftSide ? OL_POSITIONS.LT : OL_POSITIONS.RT;

    // Check X position (must be OL_GAP from tackle)
    const xDiff = Math.abs(player.x - expectedX);
    const yDiff = Math.abs(player.y - expectedY);

    if (xDiff > POSITION_TOLERANCE || yDiff > POSITION_TOLERANCE) {
      const violation: Violation = {
        ruleId: 'TE_POSITION',
        playerLabel: player.label || player.role,
        message: `TE must be ${OL_GAP * 25} yards from tackle (${
          isLeftSide ? 'LT' : 'RT'
        }) on LOS. Current: (${player.x.toFixed(3)}, ${player.y.toFixed(
          3
        )}), Expected: (${expectedX.toFixed(3)}, ${expectedY.toFixed(3)})`,
        severity: 'warning',
        autoFixed: autoCorrect,
        originalValue: { x: player.x, y: player.y },
        correctedValue: autoCorrect ? { x: expectedX, y: expectedY } : undefined,
      };

      violations.push(violation);

      if (autoCorrect) {
        correctedPlayers[i] = {
          ...player,
          x: expectedX,
          y: expectedY,
        };
      }
    }
  }

  return { violations, correctedPlayers };
}

/**
 * Validate Slot Depth Rule
 * Slot receivers must be behind LOS (y < SLOT_DEPTH_THRESHOLD)
 */
function validateSlotDepth(
  players: FormationPlayer[],
  autoCorrect: boolean
): { violations: Violation[]; correctedPlayers: FormationPlayer[] } {
  const violations: Violation[] = [];
  const correctedPlayers = [...players];

  // Slot receivers are typically H or have SLOT in label, off the line
  const slotLabels = ['H', 'A', 'SLOT'];
  const correctSlotY = DEPTH_MAP['SLOT']; // -0.05

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Check if this is a slot receiver
    const isSlot =
      slotLabels.includes(player.label) ||
      (player.role === 'WR' &&
        player.y < LOS_Y_THRESHOLD &&
        player.y > -0.1 &&
        player.x > 0.1 &&
        player.x < 0.9);

    if (!isSlot) continue;

    // Slot must be off LOS (behind the -0.04 threshold)
    if (player.y > SLOT_DEPTH_THRESHOLD) {
      const violation: Violation = {
        ruleId: 'SLOT_DEPTH',
        playerLabel: player.label || player.role,
        message: `Slot receiver must be off LOS (y < ${SLOT_DEPTH_THRESHOLD}). Current y: ${player.y.toFixed(
          3
        )}`,
        severity: 'warning',
        autoFixed: autoCorrect,
        originalValue: { x: player.x, y: player.y },
        correctedValue: autoCorrect
          ? { x: player.x, y: correctSlotY }
          : undefined,
      };

      violations.push(violation);

      if (autoCorrect) {
        correctedPlayers[i] = {
          ...player,
          y: correctSlotY,
        };
      }
    }
  }

  return { violations, correctedPlayers };
}

/**
 * Validate QB-Center Overlap Rule
 * QB must not overlap with Center position
 */
function validateQbCenterOverlap(
  players: FormationPlayer[],
  autoCorrect: boolean
): { violations: Violation[]; correctedPlayers: FormationPlayer[] } {
  const violations: Violation[] = [];
  const correctedPlayers = [...players];

  const qb = players.find((p) => p.role === 'QB' || p.label === 'QB');
  const center = players.find((p) => p.role === 'C' || p.label === 'C');

  if (!qb || !center) {
    return { violations, correctedPlayers };
  }

  const qbIndex = players.indexOf(qb);
  const distance = Math.sqrt(
    Math.pow(qb.x - center.x, 2) + Math.pow(qb.y - center.y, 2)
  );

  if (distance < MINIMUM_PLAYER_SPACING) {
    // Determine correct QB depth based on current position
    // If QB is close to center depth, move to under center depth
    const correctY = DEPTH_MAP['QB_UC']; // -0.09

    const violation: Violation = {
      ruleId: 'QB_CENTER_OVERLAP',
      playerLabel: 'QB',
      message: `QB overlaps with Center. Distance: ${distance.toFixed(
        3
      )}, minimum required: ${MINIMUM_PLAYER_SPACING}`,
      severity: 'error',
      autoFixed: autoCorrect,
      originalValue: { x: qb.x, y: qb.y },
      correctedValue: autoCorrect ? { x: qb.x, y: correctY } : undefined,
    };

    violations.push(violation);

    if (autoCorrect && qbIndex >= 0) {
      correctedPlayers[qbIndex] = {
        ...qb,
        y: correctY,
      };
    }
  }

  return { violations, correctedPlayers };
}

/**
 * Validate Minimum Spacing Rule
 * All players must have at least MINIMUM_PLAYER_SPACING between them
 */
function validateMinimumSpacing(
  players: FormationPlayer[]
): { violations: Violation[] } {
  const violations: Violation[] = [];

  // Skip BALL from spacing checks
  const activePlayers = players.filter((p) => p.role !== 'BALL');

  for (let i = 0; i < activePlayers.length; i++) {
    for (let j = i + 1; j < activePlayers.length; j++) {
      const p1 = activePlayers[i];
      const p2 = activePlayers[j];

      const distance = Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
      );

      if (distance < MINIMUM_PLAYER_SPACING) {
        violations.push({
          ruleId: 'MINIMUM_SPACING',
          playerLabel: `${p1.label || p1.role} & ${p2.label || p2.role}`,
          message: `Players too close: ${p1.label || p1.role} and ${
            p2.label || p2.role
          }. Distance: ${distance.toFixed(
            3
          )}, minimum: ${MINIMUM_PLAYER_SPACING}`,
          severity: 'warning',
          autoFixed: false, // Don't auto-fix spacing - too complex
        });
      }
    }
  }

  return { violations };
}

/**
 * Validate Seven on LOS Rule
 * At least 7 players must be on the line of scrimmage
 */
function validateSevenOnLos(
  players: FormationPlayer[]
): { violations: Violation[] } {
  const violations: Violation[] = [];

  // Skip BALL
  const activePlayers = players.filter((p) => p.role !== 'BALL');

  // Count players on LOS (y close to LOS_Y or slightly in front)
  const playersOnLos = activePlayers.filter(
    (p) => p.y >= LOS_Y - POSITION_TOLERANCE && p.y <= 0.01
  );

  if (playersOnLos.length < 7) {
    violations.push({
      ruleId: 'SEVEN_ON_LOS',
      playerLabel: 'Formation',
      message: `Only ${playersOnLos.length} players on LOS. Minimum 7 required for legal formation.`,
      severity: 'error',
      autoFixed: false,
    });
  }

  return { violations };
}

// ============================================
// Main Validation Function
// ============================================

/**
 * Validate a formation against all rules
 *
 * @param players - Array of formation players
 * @param options - Validation options
 * @returns Validation result with violations and optionally corrected players
 */
export function validateFormation(
  players: FormationPlayer[],
  options: ValidationOptions = {}
): ValidationResult {
  const { autoCorrect = false, skipRules = [] } = options;

  let allViolations: Violation[] = [];
  let currentPlayers = [...players];

  // 1. TE Position
  if (!skipRules.includes('TE_POSITION')) {
    const result = validateTePosition(currentPlayers, autoCorrect);
    allViolations.push(...result.violations);
    if (autoCorrect) {
      currentPlayers = result.correctedPlayers;
    }
  }

  // 2. Slot Depth
  if (!skipRules.includes('SLOT_DEPTH')) {
    const result = validateSlotDepth(currentPlayers, autoCorrect);
    allViolations.push(...result.violations);
    if (autoCorrect) {
      currentPlayers = result.correctedPlayers;
    }
  }

  // 3. QB-Center Overlap
  if (!skipRules.includes('QB_CENTER_OVERLAP')) {
    const result = validateQbCenterOverlap(currentPlayers, autoCorrect);
    allViolations.push(...result.violations);
    if (autoCorrect) {
      currentPlayers = result.correctedPlayers;
    }
  }

  // 4. Minimum Spacing (warning only, no auto-fix)
  if (!skipRules.includes('MINIMUM_SPACING')) {
    const result = validateMinimumSpacing(currentPlayers);
    allViolations.push(...result.violations);
  }

  // 5. Seven on LOS (error, no auto-fix)
  if (!skipRules.includes('SEVEN_ON_LOS')) {
    const result = validateSevenOnLos(currentPlayers);
    allViolations.push(...result.violations);
  }

  // Determine if formation is valid (no errors)
  const hasErrors = allViolations.some((v) => v.severity === 'error');

  return {
    valid: !hasErrors,
    violations: allViolations,
    correctedPlayers: autoCorrect ? currentPlayers : undefined,
  };
}

/**
 * Quick check if a formation is valid (no errors)
 * More efficient than full validation if you only need pass/fail
 */
export function isFormationValid(players: FormationPlayer[]): boolean {
  const result = validateFormation(players, { skipRules: ['MINIMUM_SPACING'] });
  return result.valid;
}

/**
 * Auto-correct a formation and return corrected players
 * Convenience wrapper around validateFormation
 */
export function autoCorrectFormation(
  players: FormationPlayer[]
): FormationPlayer[] {
  const result = validateFormation(players, { autoCorrect: true });
  return result.correctedPlayers || players;
}

/**
 * Get human-readable summary of violations
 */
export function getViolationSummary(violations: Violation[]): string {
  if (violations.length === 0) {
    return 'No violations found.';
  }

  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');

  const parts: string[] = [];
  if (errors.length > 0) {
    parts.push(`${errors.length} error(s)`);
  }
  if (warnings.length > 0) {
    parts.push(`${warnings.length} warning(s)`);
  }

  return parts.join(', ') + ': ' + violations.map((v) => v.message).join('; ');
}

// ============================================
// Exports
// ============================================

export {
  MINIMUM_PLAYER_SPACING,
  POSITION_TOLERANCE,
  LOS_Y_THRESHOLD,
  SLOT_DEPTH_THRESHOLD,
};
