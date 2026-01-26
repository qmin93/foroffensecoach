// PROOFREAD_AND_AUTO_FIX Type Definitions
// Version: v1.0

export type PlayCategory = "run" | "pass";

export type PlayStatus = "VALID" | "AUTO_FIXED" | "INVALID";

export interface Diagram {
  pulls?: string[];      // ["LG", "LT"]
  routes?: string[];     // ["go", "out", "flat"]
  blocks?: string[];     // ["down", "zone", "kick", "wrap"]
}

export interface Assignment {
  position: string;      // LT, LG, RB, QB, X, Y...
  role: string;          // Kick, Wrap, Clear, Under...
  action: string;
}

export interface Play {
  id: string;
  name: string;
  category: PlayCategory;
  scheme: string;
  formation: string;
  assignments: Assignment[];
  diagram: Diagram;
}

export interface ProofreadResult {
  playId: string;
  status: PlayStatus;
  appliedFixes: string[];
  errors: string[];
  updatedPlay?: Play;
}
