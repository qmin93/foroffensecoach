"use client";

import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useEditorStore } from "../../store/editorStore";
import { AssignmentsDock } from "./AssignmentsDock";
import { InstallFocusDock } from "./InstallFocusDock";

export function EditorBottomPanel() {
  const tab = useEditorStore((s: any) => s.ui?.bottomTab ?? "assignments");
  const showOnCanvas = useEditorStore((s: any) => s.ui?.showAssignmentsOnCanvas ?? false);
  const collapsed = useEditorStore((s: any) => s.ui?.bottomPanelCollapsed ?? true);

  const setTab = (next: "assignments" | "install") => {
    useEditorStore.setState((s: any) => ({
      ui: { ...(s.ui ?? {}), bottomTab: next },
    }));
  };

  const toggleCanvas = () => {
    useEditorStore.setState((s: any) => ({
      ui: { ...(s.ui ?? {}), showAssignmentsOnCanvas: !(s.ui?.showAssignmentsOnCanvas ?? false) },
    }));
  };

  const toggleCollapse = () => {
    useEditorStore.setState((s: any) => ({
      ui: { ...(s.ui ?? {}), bottomPanelCollapsed: !(s.ui?.bottomPanelCollapsed ?? true) },
    }));
  };

  return (
    <div className="w-full border-t border-border bg-background">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex gap-2">
          <button
            className={`text-sm px-3 py-1 rounded ${
              tab === "assignments" ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
            onClick={() => setTab("assignments")}
          >
            Assignments
          </button>
          <button
            className={`text-sm px-3 py-1 rounded ${
              tab === "install" ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
            onClick={() => setTab("install")}
          >
            Install Focus
          </button>
        </div>

        <div className="flex items-center gap-4">
          {!collapsed && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showOnCanvas} onChange={toggleCanvas} />
              Show assignments on canvas
            </label>
          )}
          <button
            onClick={toggleCollapse}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Expand
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="h-[240px]">
          {tab === "assignments" ? <AssignmentsDock /> : <InstallFocusDock />}
        </div>
      )}
    </div>
  );
}
