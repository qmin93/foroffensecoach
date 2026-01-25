"use client";

import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { getInstallFocus } from "../../data/installFocus";

function pickPlay(state: any) {
  return state.currentPlay ?? state.play ?? state.editor?.play ?? null;
}

export function InstallFocusDock() {
  const state = useEditorStore();
  const play = pickPlay(state);

  const conceptId =
    play?.meta?.conceptId ??
    play?.conceptId ??
    play?.concept?.id ??
    null;

  const focus = React.useMemo(() => getInstallFocus(conceptId), [conceptId]);

  if (!conceptId) {
    return (
      <div className="h-full w-full p-3 text-sm text-muted-foreground">
        This play has no <b>conceptId</b>. Unable to show Install Focus.
        <div className="mt-2 text-xs text-muted-foreground">
          (Select a concept from the recommendations panel to auto-generate with a conceptId)
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Install Focus</div>
        <div className="text-xs text-muted-foreground">{focus.length} items</div>
      </div>

      {focus.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No Install Focus data for this concept ({conceptId}).
          <div className="mt-2 text-xs text-muted-foreground">
            Add failure points in `editor/src/data/installFocus.ts`
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {focus.map((fp, i) => (
            <div key={fp.id} className="rounded-lg border border-border p-3">
              <div className="text-xs font-semibold text-muted-foreground">#{i + 1}</div>
              <div className="text-sm font-semibold text-foreground">{fp.name}</div>

              <div className="mt-2 text-sm">
                <div><b>Drill:</b> {fp.drill.name}</div>
                <div className="text-muted-foreground"><b>Purpose:</b> {fp.drill.purpose}</div>
                <div className="text-muted-foreground"><b>Phase:</b> {fp.drill.phase.toUpperCase()}</div>
              </div>

              <div className="mt-2 grid gap-1">
                {(fp.videoRefs ?? []).map((v, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {v.platform.toUpperCase()}{" "}
                    {v.accountName ? <span className="text-muted-foreground">{v.accountName}</span> : null}
                    {v.url ? (
                      <>
                        {" · "}
                        <a className="underline" href={v.url} target="_blank" rel="noreferrer">
                          open
                        </a>
                      </>
                    ) : (
                      <span className="text-muted-foreground/60"> · (no link)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
