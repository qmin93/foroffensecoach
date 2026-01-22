'use client';

import { useState } from 'react';
import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';
import { EditorMode, EndMarker, DrawLineType, LineStyle } from '@/types/dsl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const END_MARKERS: { value: EndMarker; label: string; icon: string }[] = [
  { value: 'arrow', label: 'Arrow', icon: '➜' },
  { value: 't_block', label: 'T-Block', icon: '⊥' },
  { value: 'circle', label: 'Circle', icon: '●' },
  { value: 'none', label: 'None', icon: '—' },
];

const LINE_STYLES: { value: LineStyle; label: string }[] = [
  { value: 'solid', label: '———' },
  { value: 'dashed', label: '- - -' },
  { value: 'dotted', label: '· · ·' },
];

export function EditorBottomBar() {
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const addPlayer = useEditorStore((state) => state.addPlayer);
  const playName = useEditorStore((state) => state.play.name);
  const updatePlayName = useEditorStore((state) => state.updatePlayName);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const loadFormation = useEditorStore((state) => state.loadFormation);
  const conceptId = useEditorStore((state) => state.play.meta?.conceptId);
  const applyConceptTemplate = useEditorStore((state) => state.applyConceptTemplate);

  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [lineSettingsOpen, setLineSettingsOpen] = useState(false);

  const handleModeChange = (value: string) => {
    if (value) {
      setMode(value as EditorMode);
    }
  };

  const handleAddPlayer = (role: string) => {
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

  return (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 border-t border-zinc-800">
      {/* Play Name */}
      <Input
        value={playName}
        onChange={(e) => updatePlayName(e.target.value)}
        className="w-40 h-8 bg-zinc-800 border-zinc-700 text-white text-sm"
        placeholder="Play Name"
      />

      <div className="w-px h-6 bg-zinc-700" />

      {/* Mode Selection */}
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={handleModeChange}
        className="gap-0.5"
      >
        <ToggleGroupItem
          value="select"
          className="h-8 px-3 data-[state=on]:bg-blue-600 data-[state=on]:text-white text-xs"
        >
          Select
        </ToggleGroupItem>
        <ToggleGroupItem
          value="draw"
          className="h-8 px-3 data-[state=on]:bg-blue-600 data-[state=on]:text-white text-xs"
        >
          Draw
        </ToggleGroupItem>
        <ToggleGroupItem
          value="text"
          className="h-8 px-3 data-[state=on]:bg-blue-600 data-[state=on]:text-white text-xs"
        >
          Text
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Line Settings (visible when in draw mode) */}
      {mode === 'draw' && (
        <>
          <div className="w-px h-6 bg-zinc-700" />
          <Popover open={lineSettingsOpen} onOpenChange={setLineSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-xs"
              >
                Line: {drawingConfig.lineType} / {drawingConfig.endMarker}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-zinc-800 border-zinc-700 p-3" align="start">
              {/* Line Type */}
              <div className="mb-3">
                <label className="text-[10px] text-zinc-400 mb-1.5 block">Line Type</label>
                <ToggleGroup
                  type="single"
                  value={drawingConfig.lineType}
                  onValueChange={(value) =>
                    value && setDrawingConfig({ lineType: value as DrawLineType })
                  }
                  className="justify-start"
                >
                  <ToggleGroupItem value="straight" className="text-xs data-[state=on]:bg-green-600">
                    Straight
                  </ToggleGroupItem>
                  <ToggleGroupItem value="curved" className="text-xs data-[state=on]:bg-green-600">
                    Curved
                  </ToggleGroupItem>
                  <ToggleGroupItem value="angular" className="text-xs data-[state=on]:bg-green-600">
                    Angular
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* End Marker */}
              <div className="mb-3">
                <label className="text-[10px] text-zinc-400 mb-1.5 block">End Marker</label>
                <ToggleGroup
                  type="single"
                  value={drawingConfig.endMarker}
                  onValueChange={(value) =>
                    value && setDrawingConfig({ endMarker: value as EndMarker })
                  }
                  className="justify-start"
                >
                  {END_MARKERS.map(({ value, label, icon }) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="text-xs data-[state=on]:bg-green-600"
                      title={label}
                    >
                      {icon}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Line Style */}
              <div>
                <label className="text-[10px] text-zinc-400 mb-1.5 block">Line Style</label>
                <ToggleGroup
                  type="single"
                  value={drawingConfig.lineStyle}
                  onValueChange={(value) =>
                    value && setDrawingConfig({ lineStyle: value as LineStyle })
                  }
                  className="justify-start"
                >
                  {LINE_STYLES.map(({ value, label }) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="text-xs data-[state=on]:bg-green-600"
                    >
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </PopoverContent>
          </Popover>

          {/* Drawing Phase Indicator */}
          {drawingPhase !== 'idle' && (
            <span className="text-xs text-blue-400">
              {drawingPhase === 'start_selected' && 'Click end point'}
              {drawingPhase === 'end_selected' && 'Click to confirm'}
              {drawingPhase === 'adjusting_curve' && 'Adjust curve'}
              {drawingPhase === 'angular_drawing' && 'Click points, dbl-click to finish'}
            </span>
          )}
        </>
      )}

      <div className="w-px h-6 bg-zinc-700" />

      {/* Formation Presets */}
      <Select onValueChange={(value) => loadFormation(value)}>
        <SelectTrigger className="w-36 h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
          <SelectValue placeholder="Formation..." />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {Object.entries(FORMATION_PRESETS).map(([key, formation]) => (
            <SelectItem
              key={key}
              value={key}
              className="text-white focus:bg-zinc-700 text-xs"
            >
              {formation.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add Player */}
      <Popover open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-xs"
          >
            + Player
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-zinc-800 border-zinc-700 p-3" align="start">
          {/* Offense */}
          <div className="mb-3">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Offense</label>
            <div className="grid grid-cols-5 gap-1">
              {OFFENSE_PRESETS.map(({ role, label }) => (
                <Button
                  key={role}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddPlayer(role)}
                  className="bg-green-900/50 hover:bg-green-800 text-green-200 text-xs px-1 h-7"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          {/* Defense */}
          <div className="mb-3">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Defense</label>
            <div className="grid grid-cols-5 gap-1">
              {DEFENSE_PRESETS.map(({ role, label }) => (
                <Button
                  key={role}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddPlayer(role)}
                  className="bg-red-900/50 hover:bg-red-800 text-red-200 text-xs px-1 h-7"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          {/* Special */}
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Special</label>
            <div className="grid grid-cols-5 gap-1">
              {SPECIAL_PRESETS.map(({ role, label }) => (
                <Button
                  key={role}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddPlayer(role)}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-1 h-7"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-zinc-700" />

      {/* Play Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => useEditorStore.getState().flipPlay()}
        className="h-8 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-xs"
      >
        ↔ Flip
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => useEditorStore.getState().duplicatePlay()}
        className="h-8 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-xs"
      >
        ⧉ Duplicate
      </Button>

      {/* Regenerate Routes from Concept */}
      {conceptId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (conceptId) {
              const result = applyConceptTemplate(conceptId);
              if (result.success) {
                alert(`Regenerated ${result.actionsCreated} actions`);
              } else {
                alert(`Failed: ${result.message}`);
              }
            }
          }}
          className="h-8 bg-orange-600 hover:bg-orange-500 border-orange-500 text-white text-xs"
        >
          Regenerate
        </Button>
      )}
    </div>
  );
}
