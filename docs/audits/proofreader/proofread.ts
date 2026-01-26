import { Play, ProofreadResult } from "./types";
import { autoFix } from "./autoFix";
import { FORMATION_POSITIONS } from "./formationMap";
import { diagramHasAction } from "./diagramUtils";

export function proofreadPlay(play: Play): ProofreadResult {
  const errors: string[] = [];
  const fixes: string[] = [];

  const requiredPositions = FORMATION_POSITIONS[play.formation];

  if (!requiredPositions) {
    return {
      playId: play.id,
      status: "INVALID",
      appliedFixes: [],
      errors: [`Unknown formation: ${play.formation}`],
    };
  }

  /* STEP 1 — 모든 포지션 Assignment 존재 여부 */
  for (const pos of requiredPositions) {
    const assignment = play.assignments.find(a => a.position === pos);
    if (!assignment) {
      errors.push(`Missing assignment for position: ${pos}`);
    }
  }

  /* STEP 2 — Assignment ↔ Diagram 매칭 */
  for (const assignment of play.assignments) {
    if (!diagramHasAction(play, assignment.position)) {
      errors.push(
        `Assignment exists but no diagram action for: ${assignment.position}`
      );
    }
  }

  /* STEP 3 — Diagram만 있고 Assignment 없는 경우 */
  const diagramActors = new Set([
    ...(play.diagram.pulls ?? []),
    ...(play.diagram.routes ?? []),
    ...(play.diagram.blocks ?? []),
  ]);

  for (const pos of diagramActors) {
    const assignment = play.assignments.find(a => a.position === pos);
    if (!assignment) {
      errors.push(
        `Diagram shows action but assignment missing for: ${pos}`
      );
    }
  }

  /* 에러 없으면 VALID */
  if (errors.length === 0) {
    return {
      playId: play.id,
      status: "VALID",
      appliedFixes: [],
      errors: [],
    };
  }

  /* STEP 4 — AUTO-FIX 시도 */
  const fixResult = autoFix(play);

  if (fixResult.status === "INVALID") {
    return {
      playId: play.id,
      status: "INVALID",
      appliedFixes: [],
      errors: [...errors, ...(fixResult.errors ?? [])],
    };
  }

  return {
    playId: play.id,
    status: fixResult.status,
    appliedFixes: fixResult.fixes,
    errors: [],
    updatedPlay: fixResult.updated,
  };
}
