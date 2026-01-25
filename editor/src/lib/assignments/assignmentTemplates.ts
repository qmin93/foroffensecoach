// editor/src/lib/assignments/assignmentTemplates.ts
// Concept Auto-build 때 actionType:"assignment" 자동 생성 템플릿

export type AssignmentGroup = "OL" | "QB" | "BACK" | "WR" | "TE" | "DEF" | "OTHER";

export type AssignmentAction = {
  id: string;
  actionType: "assignment";
  fromPlayerId: string;
  assignment: {
    text: string;
    group?: AssignmentGroup;
    priority?: number;
  };
  meta?: Record<string, any>;
};

export type PlayerLite = { id: string; position: string };

export type BuildAssignmentsInput = {
  conceptId: string;
  players: PlayerLite[];
  strength?: "left" | "right" | "none";
};

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const posToGroup = (pos: string): AssignmentGroup => {
  const p = (pos ?? "").toUpperCase();
  if (["C", "LG", "RG", "LT", "RT"].includes(p)) return "OL";
  if (["QB"].includes(p)) return "QB";
  if (["RB", "FB", "TB"].includes(p)) return "BACK";
  if (["TE", "Y"].includes(p)) return "TE";
  if (["WR", "X", "Z", "H"].includes(p)) return "WR";
  if (["DE","DT","NT","OLB","ILB","MLB","CB","SS","FS","NB"].includes(p)) return "DEF";
  return "OTHER";
};

const byPos = (players: PlayerLite[]) => {
  const map = new Map<string, PlayerLite[]>();
  for (const p of players) {
    const key = (p.position ?? "").toUpperCase();
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  return map;
};

const first = (m: Map<string, PlayerLite[]>, pos: string) => (m.get(pos.toUpperCase()) ?? [])[0];
const all = (m: Map<string, PlayerLite[]>, pos: string) => (m.get(pos.toUpperCase()) ?? []);

const WR_GROUP = (m: Map<string, PlayerLite[]>) => [
  ...all(m, "X"),
  ...all(m, "Z"),
  ...all(m, "WR"),
  ...all(m, "H"),
];
const TE_GROUP = (m: Map<string, PlayerLite[]>) => [...all(m, "TE"), ...all(m, "Y")];
const OL_GROUP = (m: Map<string, PlayerLite[]>) => [
  ...all(m, "LT"),
  ...all(m, "LG"),
  ...all(m, "C"),
  ...all(m, "RG"),
  ...all(m, "RT"),
];
const BACK_GROUP = (m: Map<string, PlayerLite[]>) => [...all(m, "RB"), ...all(m, "TB"), ...all(m, "FB")];

const addAll = (
  out: AssignmentAction[],
  targets: PlayerLite[],
  text: string,
  group?: AssignmentGroup,
  priority: number = 50,
) => {
  for (const t of targets) {
    out.push({
      id: uid("a_asg"),
      actionType: "assignment",
      fromPlayerId: t.id,
      assignment: { text, group: group ?? posToGroup(t.position), priority },
    });
  }
};

export function buildAssignmentActionsForConcept(input: BuildAssignmentsInput): AssignmentAction[] {
  const { conceptId, players } = input;
  const m = byPos(players);
  const out: AssignmentAction[] = [];

  const qb = first(m, "QB");
  const rb = first(m, "RB") ?? first(m, "TB");
  const fb = first(m, "FB");
  const wrs = WR_GROUP(m);
  const tes = TE_GROUP(m);
  const ol = OL_GROUP(m);

  const id = (conceptId ?? "").replace(/^concept_/, "").toLowerCase();

  console.log('[buildAssignmentActionsForConcept] conceptId:', conceptId, '→ id:', id);
  console.log('[buildAssignmentActionsForConcept] players:', players.map(p => p.position));

  // ===== TIER-1 RUN =====
  if (id.includes("run_iso") || id.endsWith("iso")) {
    if (ol.length) addAll(out, ol, "OL: Combo + GDL (gap-down-backside LB)", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Hand off", "QB", 10);
    if (fb) addAll(out, [fb], "FB: Lead block (play-side ILB)", "BACK", 10);
    if (rb) addAll(out, [rb], "RB: ISO downhill (A/B by call)", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Base/Down (secure edge)", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk block", "WR", 40);
    return out;
  }

  if (id.includes("run_inside_zone") || id.endsWith("inside_zone")) {
    if (ol.length) addAll(out, ol, "OL: IZ zone step + combo to LB", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open/mesh — handoff (read if tagged)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Aim A/B — one cut", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Zone/Reach — stay square", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk (crack if tagged)", "WR", 40);
    return out;
  }

  if (id.includes("run_split_zone")) {
    if (ol.length) addAll(out, ol, "OL: Split Zone (zone + combo)", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open/mesh — handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Aim A/B — one cut", "BACK", 20);
    const h = first(m, "H");
    if (h) addAll(out, [h], "H: Slice across — kick/secure EMOL", "WR", 25);
    else if (tes.length) addAll(out, tes, "TE: Sift/Slice — secure EMOL", "TE", 25);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  if (id.includes("run_duo") || id.endsWith("duo")) {
    if (ol.length) addAll(out, ol, "OL: Duo — double @POA + climb", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open — handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Press A — bounce/bang by LB", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Base/Drive (set edge)", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  if (id.includes("run_power") || id.endsWith("power")) {
    if (ol.length) addAll(out, ol, "OL: Power — down blocks + pullers (G kick / T wrap)", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open — handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Aim inside leg of play-side TE/OT", "BACK", 20);
    if (fb) addAll(out, [fb], "FB: Insert/Lead — fit inside-out", "BACK", 30);
    if (tes.length) addAll(out, tes, "TE: Down/Seal (close C-gap)", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  if (id.includes("run_gt_counter") || id.includes("gt_counter") || id.includes("counter")) {
    if (ol.length) addAll(out, ol, "OL: Counter — down + (G kick / T wrap)", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Reverse out — handoff (timing)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Counter step — follow pullers", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Down/Seal (protect edge)", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  if (id.includes("run_outside_zone") || id.endsWith("outside_zone")) {
    if (ol.length) addAll(out, ol, "OL: OZ stretch — reach/overtake", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open/reach — handoff (wide)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Press edge — cut back off blocks", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Reach/Arc — set edge", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk/Crack", "WR", 40);
    return out;
  }

  if (id.includes("run_draw") || id.endsWith("draw")) {
    if (ol.length) addAll(out, ol, "OL: Pass set (2 count) → drive block", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Drop back (sell pass) → handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Delay 2 count → take handoff", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Pass pro (sell) → release", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Run routes (sell pass)", "WR", 40);
    return out;
  }

  if (id.includes("run_pin_pull") || id.includes("pin_pull")) {
    if (ol.length) addAll(out, ol, "OL: Pin-Pull — pin inside / pull to edge", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open — handoff (wide timing)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Aim outside hip of puller — press & read", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Pin/Reach (by call)", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Crack/Stalk (by call)", "WR", 40);
    return out;
  }

  // Buck Sweep, Sweep, Toss
  if (id.includes("buck_sweep") || id.includes("sweep") || id.includes("toss")) {
    if (ol.length) addAll(out, ol, "OL: Down blocks + pulling guards", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open — toss/handoff to perimeter", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Take toss — follow pullers to edge", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Down block / Kick out EMOL", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk / Crack on safety", "WR", 40);
    return out;
  }

  // Stretch / Wide Zone
  if (id.includes("stretch") || id.includes("wide_zone")) {
    if (ol.length) addAll(out, ol, "OL: Stretch — reach & overtake", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Open step — handoff (wide mesh)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Press outside — bang or bend", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Reach / Arc release", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk block", "WR", 40);
    return out;
  }

  // Trap
  if (id.includes("trap")) {
    if (ol.length) addAll(out, ol, "OL: Trap — down + pull for trap", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Quick handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: One cut — follow trapper", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Base block", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  // Jet Sweep / Fly Sweep
  if (id.includes("jet") || id.includes("fly_sweep") || id.includes("end_around")) {
    if (ol.length) addAll(out, ol, "OL: Reach / Zone step", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Jet motion handoff (timing)", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Fake / Lead block", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Arc release — kick corner", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Jet motion / Stalk block", "WR", 40);
    return out;
  }

  // Option plays
  if (id.includes("option") || id.includes("triple") || id.includes("midline") || id.includes("veer")) {
    if (ol.length) addAll(out, ol, "OL: Zone step — leave read key", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Read unblocked defender", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Mesh — receive or fake", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Arc to safety", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk / Crack", "WR", 40);
    return out;
  }

  // Wham
  if (id.includes("wham")) {
    if (ol.length) addAll(out, ol, "OL: Combo — leave DT for wham", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Handoff", "QB", 10);
    if (fb) addAll(out, [fb], "FB: Wham block backside DT", "BACK", 15);
    if (rb) addAll(out, [rb], "RB: Press A-gap", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Base block", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk", "WR", 40);
    return out;
  }

  // Bootleg / Waggle / Rollout
  if (id.includes("bootleg") || id.includes("waggle") || id.includes("rollout")) {
    if (ol.length) addAll(out, ol, "OL: Zone step — protect boot side", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Fake handoff — rollout", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Fake — block backside", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Drag / Flat route", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Clear / Comeback", "WR", 40);
    return out;
  }

  // ===== TIER-1 PASS(최소) =====
  if (id.includes("pass_mesh") || id.endsWith("mesh")) {
    if (qb) addAll(out, [qb], "QB: Read mesh → sit → corner", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Mesh/cross rules (rub + settle)", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Hook/Sit — find window", "TE", 25);
    if (ol.length) addAll(out, ol, "OL: Pass pro (5/6-man by tag)", "OL", 30);
    if (rb) addAll(out, [rb], "RB: Check-release (scan blitz)", "BACK", 35);
    return out;
  }

  if (id.includes("pass_stick") || id.endsWith("stick")) {
    if (qb) addAll(out, [qb], "QB: Read stick/flat (quick game)", "QB", 10);
    if (tes.length) addAll(out, tes, "TE: Stick 6y — settle vs zone", "TE", 20);
    if (rb) addAll(out, [rb], "RB: Flat/arrow (or protect tag)", "BACK", 30);
    if (wrs.length) addAll(out, wrs, "WR: Clear/spacing by alignment", "WR", 40);
    if (ol.length) addAll(out, ol, "OL: Quick pro", "OL", 50);
    return out;
  }

  if (id.includes("pass_slant_flat") || id.includes("slant_flat")) {
    if (qb) addAll(out, [qb], "QB: 3-step — slant/flat read", "QB", 10);
    if (wrs.length >= 2) {
      addAll(out, [wrs[0]], "WR: Slant 6y", "WR", 20);
      addAll(out, [wrs[1]], "WR: Flat/arrow", "WR", 25);
      if (wrs.length > 2) addAll(out, wrs.slice(2), "WR: Clear out", "WR", 30);
    } else if (wrs.length) {
      addAll(out, wrs, "WR: Slant 6y", "WR", 20);
    }
    if (tes.length) addAll(out, tes, "TE: Check release — flat/seam", "TE", 30);
    if (rb) addAll(out, [rb], "RB: Check-release flat", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Quick pro (3-step)", "OL", 50);
    return out;
  }

  if (id.includes("pass_four_verts") || id.includes("four_verts") || id.includes("verts")) {
    if (qb) addAll(out, [qb], "QB: 5-step — read safeties", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Vertical — beat top", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Seam — split safeties", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release (scan blitz)", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Full slide protection", "OL", 50);
    return out;
  }

  if (id.includes("pass_smash") || id.endsWith("smash")) {
    if (qb) addAll(out, [qb], "QB: Read hitch/corner — beat Cover 2", "QB", 10);
    if (wrs.length >= 2) {
      addAll(out, [wrs[0]], "WR: Hitch 5y — sit", "WR", 20);
      addAll(out, [wrs[1]], "WR: Corner 12y — outside release", "WR", 25);
      if (wrs.length > 2) addAll(out, wrs.slice(2), "WR: Clear/Dig", "WR", 30);
    } else if (wrs.length) {
      addAll(out, wrs, "WR: Corner 12y", "WR", 20);
    }
    if (tes.length) addAll(out, tes, "TE: Flat/Seam (backside)", "TE", 30);
    if (rb) addAll(out, [rb], "RB: Check-release (protection first)", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Pass pro (half slide)", "OL", 50);
    return out;
  }

  if (id.includes("pass_dagger") || id.endsWith("dagger")) {
    if (qb) addAll(out, [qb], "QB: 5-step — seam to dig read", "QB", 10);
    if (wrs.length >= 2) {
      addAll(out, [wrs[0]], "WR: Dig 12y — find hole", "WR", 20);
      addAll(out, [wrs[1]], "WR: Post/Clear 15y", "WR", 25);
      if (wrs.length > 2) addAll(out, wrs.slice(2), "WR: Flat/Out", "WR", 30);
    } else if (wrs.length) {
      addAll(out, wrs, "WR: Dig 12y", "WR", 20);
    }
    if (tes.length) addAll(out, tes, "TE: Seam — split defenders", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Pass pro (5-step timing)", "OL", 50);
    return out;
  }

  // ===== MORE PASS CONCEPTS =====
  // Flood / Sail
  if (id.includes("flood") || id.includes("sail")) {
    if (qb) addAll(out, [qb], "QB: Read flat → corner → post", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Corner / Flat / Clear", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Seam / Drag", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Flat / Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Half slide protection", "OL", 50);
    return out;
  }

  // Curl / Comeback
  if (id.includes("curl") || id.includes("comeback") || id.includes("hitch")) {
    if (qb) addAll(out, [qb], "QB: Quick game — read curl to flat", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Curl/Comeback at depth", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Flat / Hook", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Quick pro", "OL", 50);
    return out;
  }

  // Levels / Y-Cross
  if (id.includes("level") || id.includes("cross") || id.includes("drive")) {
    if (qb) addAll(out, [qb], "QB: Read levels — high to low", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Cross / Dig at depth", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Drag / Cross underneath", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Pass pro", "OL", 50);
    return out;
  }

  // Screen plays
  if (id.includes("screen") || id.includes("bubble") || id.includes("tunnel") || id.includes("jail")) {
    if (qb) addAll(out, [qb], "QB: Quick throw to screen", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Screen / Block for screen", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Release for block", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Screen target / Blocker", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Release to block", "OL", 50);
    return out;
  }

  // Out routes / Speed out
  if (id.includes("out") || id.includes("quick_out") || id.includes("speed_out")) {
    if (qb) addAll(out, [qb], "QB: 3-step — quick out read", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Out at 5y — snap break", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Flat / Hook", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Quick pro", "OL", 50);
    return out;
  }

  // Post plays
  if (id.includes("post") || id.includes("double_post")) {
    if (qb) addAll(out, [qb], "QB: 5/7-step — post read", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Post — split safeties", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Seam / Cross", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release (protection)", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Max protect", "OL", 50);
    return out;
  }

  // Slant / Double slant
  if (id.includes("slant")) {
    if (qb) addAll(out, [qb], "QB: 3-step — slant timing", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Slant 6y — inside release", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Flat / Arrow", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Quick pro", "OL", 50);
    return out;
  }

  // Generic RUN fallback (better than "(set assignment)")
  if (id.startsWith("run_")) {
    if (ol.length) addAll(out, ol, "OL: Run block", "OL", 10);
    if (qb) addAll(out, [qb], "QB: Handoff", "QB", 10);
    if (rb) addAll(out, [rb], "RB: Take handoff — read blocks", "BACK", 20);
    if (tes.length) addAll(out, tes, "TE: Block / Release", "TE", 30);
    if (wrs.length) addAll(out, wrs, "WR: Stalk block", "WR", 40);
    return out;
  }

  // Generic PASS fallback (better than "(set assignment)")
  if (id.startsWith("pass_")) {
    if (qb) addAll(out, [qb], "QB: Read progression", "QB", 10);
    if (wrs.length) addAll(out, wrs, "WR: Run assigned route", "WR", 20);
    if (tes.length) addAll(out, tes, "TE: Route / Check-release", "TE", 25);
    if (rb) addAll(out, [rb], "RB: Check-release (protection)", "BACK", 35);
    if (ol.length) addAll(out, ol, "OL: Pass protection", "OL", 50);
    return out;
  }

  // fallback: 최소 텍스트라도 박아두기
  console.log('[buildAssignmentActionsForConcept] No template matched for:', id, '→ using fallback');
  if (ol.length) addAll(out, ol, "OL: (set assignment)", "OL", 90);
  if (qb) addAll(out, [qb], "QB: (set assignment)", "QB", 90);
  if (BACK_GROUP(m).length) addAll(out, BACK_GROUP(m), "BACK: (set assignment)", "BACK", 90);
  if (wrs.length) addAll(out, wrs, "WR: (set assignment)", "WR", 90);
  if (tes.length) addAll(out, tes, "TE: (set assignment)", "TE", 90);

  return out;
}
