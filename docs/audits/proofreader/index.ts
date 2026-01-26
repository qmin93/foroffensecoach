import { Play, ProofreadResult } from "./types";
import { proofreadPlay } from "./proofread";

export function proofreadAllPlays(plays: Play[]): ProofreadResult[] {
  return plays.map(play => proofreadPlay(play));
}
