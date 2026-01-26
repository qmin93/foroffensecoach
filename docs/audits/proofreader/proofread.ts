import { Play, ProofreadResult } from "./types";
import { autoFix } from "./autoFix";

export function proofreadPlay(play: Play): ProofreadResult {
  const errors: string[] = [];
  const fixes: string[] = [];

  /* NAME ↔ SCHEME */
  if (play.name.includes("GT")) {
    const hasT = play.assignments.some(a =>
      a.position.startsWith("LT") || a.position.startsWith("RT")
    );
    if (!hasT) errors.push("GT in name but no Tackle assignment");
  }

  /* DIAGRAM ↔ ASSIGNMENT */
  if (play.diagram.pulls && play.diagram.pulls.length > 0) {
    const declaredPullers = play.assignments.filter(a =>
      a.action.toLowerCase().includes("pull")
    );
    if (declaredPullers.length === 0) {
      errors.push("Diagram shows pull but assignment missing");
    }
  }

  if (errors.length === 0) {
    return {
      playId: play.id,
      status: "VALID",
      appliedFixes: [],
      errors: [],
    };
  }

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
