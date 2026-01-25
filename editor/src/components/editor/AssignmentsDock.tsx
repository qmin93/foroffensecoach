"use client";

import React from "react";
import { deriveAssignments } from "../../lib/assignments/deriveAssignments";
import { syncRouteFromAssignment } from "../../lib/assignments/parseAssignmentToRoute";
import type { Player } from "../../types/dsl";

// Zustand store
import { useEditorStore } from "../../store/editorStore";

function uid(prefix: string) {
  // @ts-ignore
  const r = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
  return `${prefix}_${r}`;
}

function pickPlay(state: any) {
  return state.currentPlay ?? state.play ?? state.editor?.play ?? null;
}
function pickPlayers(play: any, state: any) {
  return play?.roster?.players ?? play?.players ?? state.players ?? [];
}
function pickActions(play: any, state: any) {
  return play?.actions ?? state.actions ?? [];
}

// Position-specific keywords
const RECEIVER_KEYWORDS = [
  { keyword: 'slant', desc: '6yd' },
  { keyword: 'hitch', desc: '5yd' },
  { keyword: 'curl', desc: '8yd' },
  { keyword: 'out', desc: '5yd' },
  { keyword: 'flat', desc: '2yd' },
  { keyword: 'dig', desc: '12yd' },
  { keyword: 'post', desc: '14yd' },
  { keyword: 'corner', desc: '12yd' },
  { keyword: 'go', desc: '15yd' },
  { keyword: 'seam', desc: '14yd' },
  { keyword: 'shallow', desc: '4yd' },
  { keyword: 'cross', desc: '8yd' },
];

const BACKFIELD_KEYWORDS = [
  { keyword: 'swing', desc: '3yd' },
  { keyword: 'flat', desc: '2yd' },
  { keyword: 'wheel', desc: '12yd' },
  { keyword: 'angle', desc: '6yd' },
  { keyword: 'check', desc: '3yd' },
  { keyword: 'lead', desc: 'block' },
  { keyword: 'iso', desc: 'block' },
];

const OLINE_KEYWORDS = [
  { keyword: 'zone', desc: 'zone step' },
  { keyword: 'reach', desc: 'outside' },
  { keyword: 'combo', desc: 'double' },
  { keyword: 'down', desc: 'inside' },
  { keyword: 'pull', desc: 'pull block' },
  { keyword: 'pull kick', desc: 'kickout' },
  { keyword: 'pass pro', desc: 'protect' },
];

const TE_KEYWORDS = [
  { keyword: 'seam', desc: '14yd' },
  { keyword: 'flat', desc: '2yd' },
  { keyword: 'corner', desc: '12yd' },
  { keyword: 'arc', desc: 'block' },
  { keyword: 'reach', desc: 'block' },
  { keyword: 'down', desc: 'block' },
  { keyword: 'chip', desc: 'block+release' },
];

const QB_KEYWORDS = [
  { keyword: 'Handoff', desc: 'give ball' },
  { keyword: '3-step drop', desc: 'quick pass' },
  { keyword: '5-step drop', desc: 'dropback' },
  { keyword: 'Play action', desc: 'fake handoff' },
  { keyword: 'Sprint out', desc: 'rollout' },
  { keyword: 'Read option', desc: 'zone read' },
];

// Determine position type from role/label
function getPositionType(group: string, label: string): 'receiver' | 'backfield' | 'oline' | 'te' | 'qb' {
  const upperGroup = group.toUpperCase();
  const upperLabel = label.toUpperCase();

  if (upperGroup === 'QB' || upperLabel === 'QB') return 'qb';
  if (upperGroup === 'OL' || ['C', 'LG', 'RG', 'LT', 'RT'].includes(upperLabel)) return 'oline';
  if (upperGroup === 'TE' || upperLabel === 'Y' || upperLabel === 'U' || upperLabel === 'TE') return 'te';
  if (upperGroup === 'RB' || upperGroup === 'FB' || ['RB', 'FB', 'TB', 'HB', 'WB'].includes(upperLabel)) return 'backfield';
  return 'receiver'; // WR, X, Z, H, etc.
}

function getKeywordsForPosition(posType: string) {
  switch (posType) {
    case 'receiver': return RECEIVER_KEYWORDS;
    case 'backfield': return BACKFIELD_KEYWORDS;
    case 'oline': return OLINE_KEYWORDS;
    case 'te': return TE_KEYWORDS;
    case 'qb': return QB_KEYWORDS;
    default: return [];
  }
}

export function AssignmentsDock() {
  const state = useEditorStore();
  const play = pickPlay(state);
  const players = pickPlayers(play, state);
  const actions = pickActions(play, state);

  const rows = React.useMemo(() => deriveAssignments(players, actions), [players, actions]);

  // inline edit
  const [editing, setEditing] = React.useState<{ playerId: string; value: string; group: string; label: string } | null>(null);

  const upsertAssignment = (playerId: string, text: string) => {
    const trimmed = (text ?? "").trim();

    useEditorStore.setState((s: any) => {
      const p = pickPlay(s);
      let curActions = [...(pickActions(p, s) ?? [])];
      const curPlayers = pickPlayers(p, s);

      // Find the player for route sync
      const player = curPlayers.find((pl: Player) => pl.id === playerId);

      // Update/remove assignment action
      const idx = curActions.findIndex((a: any) => a?.actionType === "assignment" && a?.fromPlayerId === playerId);

      if (!trimmed) {
        // Remove assignment AND related route/block if empty
        if (idx >= 0) curActions.splice(idx, 1);
        // Also remove route/block for this player
        curActions = curActions.filter((a: any) =>
          !(a.fromPlayerId === playerId && (a.actionType === 'route' || a.actionType === 'block'))
        );
      } else {
        const next = {
          ...(idx >= 0 ? curActions[idx] : {}),
          id: idx >= 0 ? curActions[idx].id : uid("a_asg_manual"),
          actionType: "assignment",
          fromPlayerId: playerId,
          assignment: { text: trimmed, priority: 1 },
        };
        if (idx >= 0) curActions[idx] = next;
        else curActions.push(next);

        // Sync route/block on canvas (updates existing, creates if none)
        if (player) {
          curActions = syncRouteFromAssignment(playerId, trimmed, player, curActions);
        }
      }

      // Update play.actions or state.actions
      if (p && p.actions) {
        const nextPlay = { ...p, actions: curActions };
        if (s.currentPlay) return { currentPlay: nextPlay };
        if (s.play) return { play: nextPlay };
        if (s.editor?.play) return { editor: { ...s.editor, play: nextPlay } };
      }
      return { actions: curActions };
    });
  };

  // Click keyword -> replace and immediately save
  const applyKeyword = (playerId: string, keyword: string) => {
    upsertAssignment(playerId, keyword);
    setEditing(null);
  };

  return (
    <div className="h-full w-full overflow-auto p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Assignments</div>
        <div className="text-xs text-muted-foreground">Click keyword to add</div>
      </div>

      <div className="grid gap-2">
        {rows.map((r) => {
          const isEditing = editing?.playerId === r.playerId;
          const posType = getPositionType(r.group, r.label);
          const keywords = getKeywordsForPosition(posType);

          return (
            <div key={r.playerId} className="rounded-lg border border-border p-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-foreground">
                  [{r.group}] {r.label}
                </div>
                <button
                  className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                  onClick={() => setEditing({
                    playerId: r.playerId,
                    value: r.text === "(No assignment yet)" ? "" : r.text,
                    group: r.group,
                    label: r.label
                  })}
                >
                  Edit
                </button>
              </div>

              {!isEditing ? (
                <div className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {r.text}
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {/* Position-specific keyword chips - click to apply immediately */}
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {keywords.map(k => (
                        <button
                          key={k.keyword}
                          className="px-2 py-0.5 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded border border-border transition-colors"
                          onClick={() => applyKeyword(r.playerId, k.keyword)}
                          title={k.desc}
                        >
                          {k.keyword}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="w-full rounded border border-border p-2 text-sm"
                    rows={2}
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    placeholder={posType === 'qb' ? "QB assignment..." : "Click keyword above or type..."}
                  />

                  <div className="flex gap-2">
                    <button
                      className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground"
                      onClick={() => {
                        upsertAssignment(r.playerId, editing.value);
                        setEditing(null);
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded border border-border"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="ml-auto text-xs px-3 py-1 rounded border border-border text-destructive"
                      onClick={() => {
                        upsertAssignment(r.playerId, "");
                        setEditing(null);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
