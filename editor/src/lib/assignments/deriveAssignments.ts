// editor/src/lib/assignments/deriveAssignments.ts
// 하단 패널 출력용: assignment action이 있으면 그걸 쓰고,
// 없으면 "아직 없음"으로라도 보여줌(신뢰 깨지지 않게)

export type DerivedRow = {
  playerId: string;
  label: string;
  group: "OL" | "QB" | "BACK" | "WR" | "TE" | "DEF" | "OTHER";
  text: string;
};

const groupOf = (pos: string) => {
  const p = (pos ?? "").toUpperCase();
  if (["C","LG","RG","LT","RT"].includes(p)) return "OL";
  if (p === "QB") return "QB";
  if (["RB","FB","TB"].includes(p)) return "BACK";
  if (["TE","Y"].includes(p)) return "TE";
  if (["WR","X","Z","H"].includes(p)) return "WR";
  if (["DE","DT","NT","OLB","ILB","MLB","CB","SS","FS","NB"].includes(p)) return "DEF";
  return "OTHER";
};

export function deriveAssignments(players: any[], actions: any[]): DerivedRow[] {
  const rows: DerivedRow[] = [];

  const assignmentByPlayer = new Map<string, any[]>();
  for (const a of actions ?? []) {
    if (a?.actionType === "assignment" && a?.fromPlayerId && a?.assignment?.text) {
      const arr = assignmentByPlayer.get(a.fromPlayerId) ?? [];
      arr.push(a);
      assignmentByPlayer.set(a.fromPlayerId, arr);
    }
  }

  for (const p of players ?? []) {
    const pid = p.id;
    const pos = p.position ?? p.role ?? p.label ?? "";
    const label = p.label ?? p.position ?? p.role ?? "P";

    const list = assignmentByPlayer.get(pid) ?? [];
    list.sort((x, y) => (x.assignment?.priority ?? 50) - (y.assignment?.priority ?? 50));
    const text = list[0]?.assignment?.text ?? "(No assignment yet)";

    rows.push({
      playerId: pid,
      label,
      group: groupOf(pos),
      text,
    });
  }

  // group 정렬: QB/OL/BACK → TE/WR → DEF/OTHER
  const groupOrder: Record<string, number> = { QB: 0, OL: 1, BACK: 2, TE: 3, WR: 4, DEF: 5, OTHER: 6 };
  rows.sort((a, b) => groupOrder[a.group] - groupOrder[b.group]);

  return rows;
}
