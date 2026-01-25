// editor/src/data/installFocus.ts
// User Flow Spec의 Install Focus 모델: conceptId → failure points(드릴/영상 링크)

export type VideoRef = {
  platform: "instagram" | "youtube" | "other";
  url?: string;          // 링크는 너가 나중에 채워도 됨
  thumbnailUrl?: string; // optional
  accountName?: string;
};

export type FailurePoint = {
  id: string;
  name: string;
  drill: {
    name: string;
    purpose: string;
    phase: "indy" | "group" | "team";
  };
  videoRefs?: VideoRef[];
};

export const INSTALL_FOCUS_BY_CONCEPT: Record<string, FailurePoint[]> = {
  // RUN Tier-1
  run_inside_zone: [
    {
      id: "fp_iz_combo",
      name: "Combo → LB climb timing",
      drill: { name: "Zone Combo Drill", purpose: "더블팀 유지 후 LB로 올라가는 타이밍", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_iz_rb_cut",
      name: "RB one-cut decision",
      drill: { name: "One-Cut Read Drill", purpose: "프레스 → 컷 판단 속도/각도", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  run_split_zone: [
    {
      id: "fp_split_slice",
      name: "Slice(Kick) angle & fit",
      drill: { name: "Slice/Kick Fit Drill", purpose: "H/TE가 EMOL 킥/시프트 각도", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_split_mesh",
      name: "QB/RB mesh timing",
      drill: { name: "Mesh Timing Drill", purpose: "핸드오프 타이밍으로 컷이 살아나게", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  run_duo: [
    {
      id: "fp_duo_double",
      name: "Double team displacement",
      drill: { name: "Duo Double-Team Drill", purpose: "POA 더블팀 이동/수직성", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_duo_rb_press",
      name: "RB press & bounce/bang",
      drill: { name: "Press Read Drill", purpose: "A-gap 프레스 후 bang/bounce 결정", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  run_power: [
    {
      id: "fp_power_puller",
      name: "Puller path & kick timing",
      drill: { name: "Pull & Kick Drill", purpose: "G pull 후 EMOL 킥 타이밍", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_power_rb_aim",
      name: "RB aimpoint discipline",
      drill: { name: "Aimpoint Press Drill", purpose: "인사이드 레그 프레스 유지", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  run_gt_counter: [
    {
      id: "fp_gt_puller_timing",
      name: "Puller timing & path",
      drill: { name: "Pull & Kick Drill", purpose: "G pull kick / T wrap 타이밍", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_gt_kick_vs_log",
      name: "Kick vs Log recognition",
      drill: { name: "Kick/Log Decision Drill", purpose: "EMOL 반응에 따른 킥/로그 판단", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_gt_rb_press_cut",
      name: "RB press & cut decision",
      drill: { name: "Press Read Drill", purpose: "카운터 프레스/컷 시점", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  run_pin_pull: [
    {
      id: "fp_pin_pull_pin",
      name: "Pin rules (who pins?)",
      drill: { name: "Pin Rules Walkthrough", purpose: "핀 담당 확정(다운/리치) 규칙", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_pin_pull_pull",
      name: "Pullers spacing & track",
      drill: { name: "Pull Track Drill", purpose: "풀러 간격/트랙 유지", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],

  // PASS Tier-1(최소)
  pass_mesh: [
    {
      id: "fp_mesh_spacing",
      name: "Mesh spacing & rub timing",
      drill: { name: "Mesh Timing Drill", purpose: "크로서 간격/루브 타이밍", phase: "group" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
    {
      id: "fp_mesh_qb_footwork",
      name: "QB footwork & progression",
      drill: { name: "Quick Progression Drill", purpose: "mesh→sit→corner 진행", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
  pass_stick: [
    {
      id: "fp_stick_read",
      name: "Stick/Flat read speed",
      drill: { name: "Quick Game Read Drill", purpose: "스틱/플랫 하이로 리드 속도", phase: "indy" },
      videoRefs: [{ platform: "instagram", url: "", accountName: "" }],
    },
  ],
};

export function getInstallFocus(conceptId?: string | null): FailurePoint[] {
  if (!conceptId) return [];
  const key = conceptId.replace(/^concept_/, "");
  return INSTALL_FOCUS_BY_CONCEPT[key] ?? INSTALL_FOCUS_BY_CONCEPT[conceptId] ?? [];
}
