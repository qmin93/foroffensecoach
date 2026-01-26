import { Play } from "./types";
import { hasPuller } from "./rules";

export function autoFix(play: Play) {
  const fixes: string[] = [];
  let updated = { ...play };

  /* RULE: GT Counter */
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

  /* RULE: Zone */
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

  return {
    status: fixes.length ? "AUTO_FIXED" : "VALID",
    updated,
    fixes,
    errors: [],
  };
}
