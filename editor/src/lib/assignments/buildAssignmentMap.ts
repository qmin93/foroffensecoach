// editor/src/lib/assignments/buildAssignmentMap.ts
// actions[] → playerId별 최종 assignment text (캔버스 배지용)

export function buildAssignmentMap(actions: any[]) {
  const map = new Map<string, string>();

  const all = (actions ?? []).filter(
    (a) => a?.actionType === "assignment" && a?.fromPlayerId && a?.assignment?.text
  );

  const grouped = new Map<string, any[]>();
  for (const a of all) {
    const arr = grouped.get(a.fromPlayerId) ?? [];
    arr.push(a);
    grouped.set(a.fromPlayerId, arr);
  }

  for (const [pid, list] of grouped.entries()) {
    list.sort((x, y) => (x.assignment?.priority ?? 50) - (y.assignment?.priority ?? 50));
    map.set(pid, list[0].assignment.text);
  }

  return map;
}
