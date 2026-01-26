import { Play } from "./types";
import { proofreadPlay } from "./proofread";

/**
 * 유저 업로드 작전 처리 파이프라인
 */
export function handleUserUploadedPlay(
  uploadedPlay: Play
) {
  const result = proofreadPlay(uploadedPlay);

  if (result.status === "INVALID") {
    return {
      accepted: false,
      reason: result.errors,
    };
  }

  return {
    accepted: true,
    play:
      result.status === "AUTO_FIXED"
        ? result.updatedPlay
        : uploadedPlay,
    notes: result.appliedFixes,
  };
}
