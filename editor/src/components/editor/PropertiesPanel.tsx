'use client';

import { useEditorStore } from '@/store/editorStore';
import { PlayerShape, LineStyle, EndMarker } from '@/types/dsl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SHAPES: { value: PlayerShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'star', label: 'Star' },
  { value: 'x_mark', label: 'X Mark' },
];

const LINE_STYLES: { value: LineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const END_MARKERS: { value: EndMarker; label: string }[] = [
  { value: 'arrow', label: 'Arrow' },
  { value: 't_block', label: 'T-Block' },
  { value: 'circle', label: 'Circle' },
  { value: 'none', label: 'None' },
];

export function PropertiesPanel() {
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const play = useEditorStore((state) => state.play);
  const updatePlayer = useEditorStore((state) => state.updatePlayer);
  const updatePlayerAppearance = useEditorStore((state) => state.updatePlayerAppearance);
  const updateActionStyle = useEditorStore((state) => state.updateActionStyle);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);

  // Get selected player
  const selectedPlayer = selectedPlayerIds.length === 1
    ? play.roster.players.find((p) => p.id === selectedPlayerIds[0])
    : null;

  // Get selected action
  const selectedAction = selectedActionIds.length === 1
    ? play.actions.find((a) => a.id === selectedActionIds[0])
    : null;

  // No selection
  if (!selectedPlayer && !selectedAction) {
    return null;
  }

  return (
    <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl shadow-2xl p-4 min-w-80 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Player Properties */}
      {selectedPlayer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Player: {selectedPlayer.label}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePlayer(selectedPlayer.id)}
              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Label */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Label</Label>
              <Input
                value={selectedPlayer.label}
                onChange={(e) => updatePlayer(selectedPlayer.id, { label: e.target.value })}
                className="h-8 text-sm bg-zinc-800 border-zinc-600"
              />
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Role</Label>
              <Input
                value={selectedPlayer.role}
                onChange={(e) => updatePlayer(selectedPlayer.id, { role: e.target.value })}
                className="h-8 text-sm bg-zinc-800 border-zinc-600"
              />
            </div>

            {/* Shape */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Shape</Label>
              <Select
                value={selectedPlayer.appearance.shape}
                onValueChange={(value: PlayerShape) =>
                  updatePlayerAppearance(selectedPlayer.id, { shape: value })
                }
              >
                <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  {SHAPES.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value}>
                      {shape.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fill Color */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Fill Color</Label>
              <div className="flex gap-1">
                <Input
                  type="color"
                  value={selectedPlayer.appearance.fill}
                  onChange={(e) =>
                    updatePlayerAppearance(selectedPlayer.id, { fill: e.target.value })
                  }
                  className="w-10 h-8 p-0.5 bg-zinc-800 border-zinc-600"
                />
                <Input
                  value={selectedPlayer.appearance.fill}
                  onChange={(e) =>
                    updatePlayerAppearance(selectedPlayer.id, { fill: e.target.value })
                  }
                  className="h-8 text-xs bg-zinc-800 border-zinc-600 flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Properties */}
      {selectedAction && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {selectedAction.actionType === 'route' ? 'Route' : 'Action'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteAction(selectedAction.id)}
              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Line Style */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Style</Label>
              <Select
                value={selectedAction.style?.lineStyle || 'solid'}
                onValueChange={(value: LineStyle) =>
                  updateActionStyle(selectedAction.id, { lineStyle: value })
                }
              >
                <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  {LINE_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Marker */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">End</Label>
              <Select
                value={selectedAction.style?.endMarker || 'arrow'}
                onValueChange={(value: EndMarker) =>
                  updateActionStyle(selectedAction.id, { endMarker: value })
                }
              >
                <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  {END_MARKERS.map((marker) => (
                    <SelectItem key={marker.value} value={marker.value}>
                      {marker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stroke Width */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Width</Label>
              <Select
                value={String(selectedAction.style?.strokeWidth || 2)}
                onValueChange={(value) =>
                  updateActionStyle(selectedAction.id, { strokeWidth: parseInt(value) })
                }
              >
                <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="1">Thin</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">Thick</SelectItem>
                  <SelectItem value="4">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tip */}
          <p className="text-[10px] text-zinc-500 mt-2">
            Tip: Double-click on route to add/remove bend points
          </p>
        </div>
      )}
    </div>
  );
}
