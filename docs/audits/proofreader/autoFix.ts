import { Play, Assignment } from "./types";
import { FORMATION_POSITIONS } from "./formationMap";
import { hasPuller } from "./rules";

function defaultAssignment(position: string): Assignment {
  if (["LT", "LG", "C", "RG", "RT"].includes(position)) {
    return {
      position,
      role: "Block",
      action: "Base block",
    };
  }

  if (position === "QB") {
    return {
      position,
      role: "QB",
      action: "Execute play",
    };
  }

  if (position === "RB") {
    return {
      position,
      role: "RB",
      action: "Run assigned path",
    };
  }

  return {
    position,
    role: "Route",
    action: "Standard route",
  };
}

export function autoFix(play: Play) {
  const fixes: string[] = [];
  let updated = { ...play };

  const required = FORMATION_POSITIONS[play.formation] ?? [];

  /* RULE: GT Counter - name/scheme validation */
  if (play.name.includes("GT")) {
    const guardPull = hasPuller(play, "LG") || hasPuller(play, "RG");
    const tacklePull = hasPuller(play, "LT") || hasPuller(play, "RT");

    if (!guardPull || !tacklePull) {
      if (guardPull) {
        updated.name = play.name.replace("GT", "G");
        fixes.push("Renamed GT → G Counter (missing Tackle pull)");
      } else {
        return {
          status: "INVALID",
          fixes,
          errors: ["GT Counter missing Guard + Tackle pull"],
        };
      }
    }
  }

  /* RULE: Zone - no pulls allowed */
  if (play.name.includes("Zone")) {
    const hasIllegalPull = play.assignments.some(a =>
      a.action.toLowerCase().includes("pull")
    );
    if (hasIllegalPull) {
      updated.assignments = play.assignments.map(a =>
        a.action.toLowerCase().includes("pull")
          ? { ...a, action: "Zone step" }
          : a
      );
      fixes.push("Removed illegal pull from Zone scheme");
    }
  }

  /* RULE: 누락 Assignment 자동 보완 */
  for (const pos of required) {
    if (!updated.assignments.find(a => a.position === pos)) {
      updated.assignments.push(defaultAssignment(pos));
      fixes.push(`Auto-added assignment for ${pos}`);
    }
  }

  if (fixes.length === 0) {
    return {
      status: "INVALID",
      fixes: [],
      errors: ["Unfixable assignment/diagram mismatch"],
    };
  }

  return {
    status: "AUTO_FIXED",
    updated,
    fixes,
    errors: [],
  };
}
