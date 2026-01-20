'use client';

import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { EditorMode, PlayerShape, EndMarker, DrawLineType, LineStyle } from '@/types/dsl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OFFENSE_PRESETS = [
  { role: 'QB', label: 'QB' },
  { role: 'RB', label: 'RB' },
  { role: 'FB', label: 'FB' },
  { role: 'WR', label: 'WR' },
  { role: 'TE', label: 'TE' },
  { role: 'C', label: 'C' },
  { role: 'LG', label: 'LG' },
  { role: 'RG', label: 'RG' },
  { role: 'LT', label: 'LT' },
  { role: 'RT', label: 'RT' },
];

const DEFENSE_PRESETS = [
  { role: 'DE', label: 'DE' },
  { role: 'DT', label: 'DT' },
  { role: 'NT', label: 'NT' },
  { role: 'OLB', label: 'OLB' },
  { role: 'ILB', label: 'ILB' },
  { role: 'MLB', label: 'MLB' },
  { role: 'CB', label: 'CB' },
  { role: 'SS', label: 'SS' },
  { role: 'FS', label: 'FS' },
  { role: 'NB', label: 'NB' },
];

const SPECIAL_PRESETS = [
  { role: 'K', label: 'K' },
  { role: 'P', label: 'P' },
  { role: 'LS', label: 'LS' },
  { role: 'H', label: 'H' },
  { role: 'KR', label: 'KR' },
  { role: 'PR', label: 'PR' },
  { role: 'BALL', label: '🏈' },
];

const SHAPES: { value: PlayerShape; icon: string }[] = [
  { value: 'circle', icon: '●' },
  { value: 'square', icon: '■' },
  { value: 'triangle', icon: '▲' },
  { value: 'diamond', icon: '◆' },
  { value: 'star', icon: '★' },
  { value: 'x_mark', icon: '✕' },
  { value: 'football', icon: '🏈' },
];

const COLORS = [
  '#22c55e', // green
  '#ef4444', // red
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#000000', // black
  '#ffffff', // white
];

const END_MARKERS: { value: EndMarker; label: string; icon: string }[] = [
  { value: 'arrow', label: 'Arrow', icon: '➜' },
  { value: 't_block', label: 'T-Block', icon: '⊥' },
  { value: 'circle', label: 'Circle', icon: '●' },
  { value: 'none', label: 'None', icon: '—' },
];

const LINE_STYLES: { value: LineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid ———' },
  { value: 'dashed', label: 'Dashed - - -' },
  { value: 'dotted', label: 'Dotted · · ·' },
];

interface ToolbarProps {
  onConceptPanelToggle?: (isOpen: boolean) => void;
}

export function Toolbar({ onConceptPanelToggle }: ToolbarProps) {
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const addPlayer = useEditorStore((state) => state.addPlayer);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const players = useEditorStore((state) => state.play.roster.players);
  const actions = useEditorStore((state) => state.play.actions);
  const updatePlayerAppearance = useEditorStore((state) => state.updatePlayerAppearance);
  const updateActionStyle = useEditorStore((state) => state.updateActionStyle);
  const convertLineType = useEditorStore((state) => state.convertLineType);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const playName = useEditorStore((state) => state.play.name);
  const updatePlayName = useEditorStore((state) => state.updatePlayName);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const loadFormation = useEditorStore((state) => state.loadFormation);
  const toggleConceptPanel = useConceptStore((state) => state.togglePanel);
  const isPanelOpen = useConceptStore((state) => state.isPanelOpen);

  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

  const selectedPlayer =
    selectedPlayerIds.length === 1
      ? players.find((p) => p.id === selectedPlayerIds[0])
      : null;

  // Get selected action for editing
  const selectedAction =
    selectedActionIds.length === 1
      ? actions.find((a) => a.id === selectedActionIds[0])
      : null;

  // Check if selected action is a route (has style)
  const selectedRoute =
    selectedAction && selectedAction.actionType === 'route'
      ? selectedAction
      : null;

  // Determine if the route is curved (has 3+ control points)
  const isRouteCurved =
    selectedRoute && 'route' in selectedRoute
      ? selectedRoute.route.controlPoints.length > 2
      : false;

  const handleModeChange = (value: string) => {
    if (value) {
      setMode(value as EditorMode);
    }
  };

  const handleAddPlayer = (role: string) => {
    // Special handling for football (BALL)
    if (role === 'BALL') {
      addPlayer(role, { x: 0.5, y: 0 }, {
        shape: 'football',
        fill: '#8B4513',
        stroke: '#ffffff',
        showLabel: false,
        radius: 12,
      });
    } else {
      addPlayer(role, { x: 0.5, y: 0 });
    }
    setAddPlayerOpen(false);
  };

  const handleDelete = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
  };

  return (
    <div className="bg-zinc-900 text-white p-4 flex flex-col gap-4 h-full">
      {/* Play Name */}
      <div>
        <Label htmlFor="playName" className="text-xs text-zinc-400">
          Play Name
        </Label>
        <Input
          id="playName"
          value={playName}
          onChange={(e) => updatePlayName(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white text-lg font-bold"
          placeholder="Play Name"
        />
      </div>

      <Separator className="bg-zinc-700" />

      {/* Mode Selection */}
      <div>
        <Label className="text-xs text-zinc-400 mb-2 block">Mode</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem
            value="select"
            className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
          >
            <span className="mr-1">⬚</span> Select
          </ToggleGroupItem>
          <ToggleGroupItem
            value="draw"
            className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
          >
            <span className="mr-1">✏</span> Draw
          </ToggleGroupItem>
          <ToggleGroupItem
            value="text"
            className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
          >
            <span className="mr-1">T</span> Text
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Formation Presets */}
      <div>
        <Label className="text-xs text-zinc-400 mb-2 block">Formation Presets</Label>
        <Select onValueChange={(value) => loadFormation(value)}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Select formation..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {Object.entries(FORMATION_PRESETS).map(([key, formation]) => (
              <SelectItem
                key={key}
                value={key}
                className="text-white focus:bg-zinc-700"
              >
                {formation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Concepts Button */}
      <div className="space-y-2">
        <Button
          onClick={() => {
            const newState = !isPanelOpen;
            toggleConceptPanel();
            onConceptPanelToggle?.(newState);
          }}
          variant={isPanelOpen ? 'default' : 'outline'}
          className={`w-full ${isPanelOpen ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600'}`}
        >
          <span className="mr-2">💡</span>
          {isPanelOpen ? 'Hide Concepts' : 'Show Concepts'}
        </Button>
        <p className="text-[10px] text-zinc-500 text-center">
          Formation → Concept
        </p>
      </div>

      <Separator className="bg-zinc-700" />

      {/* Drawing Config (visible when in draw mode) */}
      {mode === 'draw' && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-zinc-300">Line Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            {/* Line Type */}
            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Line Type</Label>
              <ToggleGroup
                type="single"
                value={drawingConfig.lineType}
                onValueChange={(value) =>
                  value && setDrawingConfig({ lineType: value as DrawLineType })
                }
                className="justify-start"
              >
                <ToggleGroupItem
                  value="straight"
                  className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                >
                  Straight
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="curved"
                  className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                >
                  Curved
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* End Marker */}
            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">End Marker</Label>
              <ToggleGroup
                type="single"
                value={drawingConfig.endMarker}
                onValueChange={(value) =>
                  value && setDrawingConfig({ endMarker: value as EndMarker })
                }
                className="justify-start flex-wrap"
              >
                {END_MARKERS.map(({ value, label, icon }) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                    title={label}
                  >
                    {icon}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Line Style */}
            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Line Style</Label>
              <Select
                value={drawingConfig.lineStyle}
                onValueChange={(value) =>
                  setDrawingConfig({ lineStyle: value as LineStyle })
                }
              >
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {LINE_STYLES.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-white focus:bg-zinc-700"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drawing Phase Indicator */}
            {drawingPhase !== 'idle' && (
              <div className="text-xs bg-blue-600/20 text-blue-300 p-2 rounded">
                {drawingPhase === 'start_selected' && 'Click to set end point'}
                {drawingPhase === 'end_selected' && 'Click to confirm or ESC to cancel'}
                {drawingPhase === 'adjusting_curve' && 'Drag control point, then click to confirm'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="bg-zinc-700" />

      {/* Add Player */}
      <div>
        <Label className="text-xs text-zinc-400 mb-2 block">Add Player</Label>
        <Popover open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
          <PopoverTrigger asChild>
            <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
              + Add Player
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-zinc-800 border-zinc-700 p-3" align="start">
            {/* Offense */}
            <div className="mb-3">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Offense</Label>
              <div className="grid grid-cols-5 gap-1">
                {OFFENSE_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-green-900/50 hover:bg-green-800 text-green-200 text-xs px-1"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Defense */}
            <div className="mb-3">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Defense</Label>
              <div className="grid grid-cols-5 gap-1">
                {DEFENSE_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-red-900/50 hover:bg-red-800 text-red-200 text-xs px-1"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Special */}
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Special</Label>
              <div className="grid grid-cols-5 gap-1">
                {SPECIAL_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-1"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Player Customization */}
      {selectedPlayer && (
        <>
          <Separator className="bg-zinc-700" />
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-zinc-300">
                Selected: {selectedPlayer.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              {/* Shape Selection */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Shape</Label>
                <ToggleGroup
                  type="single"
                  value={selectedPlayer.appearance.shape}
                  onValueChange={(value) =>
                    value &&
                    updatePlayerAppearance(selectedPlayer.id, {
                      shape: value as PlayerShape,
                    })
                  }
                  className="justify-start flex-wrap"
                >
                  {SHAPES.map(({ value, icon }) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="w-8 h-8 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                    >
                      {icon}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Fill Color */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Fill Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updatePlayerAppearance(selectedPlayer.id, { fill: color })
                      }
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        selectedPlayer.appearance.fill === color
                          ? 'border-blue-400 scale-110'
                          : 'border-transparent hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Color */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Stroke Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updatePlayerAppearance(selectedPlayer.id, { stroke: color })
                      }
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        selectedPlayer.appearance.stroke === color
                          ? 'border-blue-400 scale-110'
                          : 'border-transparent hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">
                  Size: {selectedPlayer.appearance.radius}
                </Label>
                <Slider
                  value={[selectedPlayer.appearance.radius]}
                  onValueChange={([value]) =>
                    updatePlayerAppearance(selectedPlayer.id, { radius: value })
                  }
                  min={10}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Label */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Label</Label>
                <Input
                  value={selectedPlayer.label}
                  onChange={(e) => {
                    useEditorStore.getState().updatePlayer(selectedPlayer.id, {
                      label: e.target.value,
                    });
                  }}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Selected Line Customization */}
      {selectedRoute && (
        <>
          <Separator className="bg-zinc-700" />
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-zinc-300">
                Selected Line
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              {/* Line Type Toggle */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Line Type</Label>
                <ToggleGroup
                  type="single"
                  value={isRouteCurved ? 'curved' : 'straight'}
                  onValueChange={(value) => {
                    if (value) {
                      convertLineType(selectedRoute.id, value as 'straight' | 'curved');
                    }
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="straight"
                    className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                  >
                    Straight
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="curved"
                    className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                  >
                    Curved
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* End Marker */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">End Marker</Label>
                <ToggleGroup
                  type="single"
                  value={selectedRoute.style.endMarker}
                  onValueChange={(value) =>
                    value && updateActionStyle(selectedRoute.id, { endMarker: value as EndMarker })
                  }
                  className="justify-start flex-wrap"
                >
                  {END_MARKERS.map(({ value, label, icon }) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="data-[state=on]:bg-green-600 data-[state=on]:text-white text-xs"
                      title={label}
                    >
                      {icon}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Line Style */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Line Style</Label>
                <Select
                  value={selectedRoute.style.lineStyle}
                  onValueChange={(value) =>
                    updateActionStyle(selectedRoute.id, { lineStyle: value as LineStyle })
                  }
                >
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {LINE_STYLES.map(({ value, label }) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-white focus:bg-zinc-700"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stroke Color */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Line Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updateActionStyle(selectedRoute.id, { stroke: color })
                      }
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        selectedRoute.style.stroke === color
                          ? 'border-blue-400 scale-110'
                          : 'border-transparent hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">
                  Line Width: {selectedRoute.style.strokeWidth}
                </Label>
                <Slider
                  value={[selectedRoute.style.strokeWidth]}
                  onValueChange={([value]) =>
                    updateActionStyle(selectedRoute.id, { strokeWidth: value })
                  }
                  min={1}
                  max={6}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Separator className="bg-zinc-700" />

      {/* Play Actions */}
      <div>
        <Label className="text-xs text-zinc-400 mb-2 block">Play Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => useEditorStore.getState().flipPlay()}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-xs"
          >
            ↔ Flip
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => useEditorStore.getState().duplicatePlay()}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-xs"
          >
            ⧉ Duplicate
          </Button>
        </div>
      </div>

      <Separator className="bg-zinc-700" />

      {/* Undo/Redo */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={undo}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600"
        >
          ↶ Undo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={redo}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600"
        >
          ↷ Redo
        </Button>
      </div>

      {/* Delete */}
      {(selectedPlayerIds.length > 0 || selectedActionIds.length > 0) && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete Selected
        </Button>
      )}
    </div>
  );
}
