'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PlayerShape } from '@/types/dsl';

// Player shape options (matching PlayerShape type)
const PLAYER_SHAPES: { value: PlayerShape; label: string; preview: string }[] = [
  { value: 'circle', label: 'Circle', preview: '○' },
  { value: 'square', label: 'Square', preview: '□' },
  { value: 'triangle', label: 'Triangle', preview: '△' },
  { value: 'diamond', label: 'Diamond', preview: '◇' },
  { value: 'star', label: 'Star', preview: '☆' },
  { value: 'x_mark', label: 'X Mark', preview: 'X' },
];

// Player size options - with visual preview sizes
const PLAYER_SIZES = [
  { value: 'xs', label: 'XS', size: 16, previewSize: 8 },
  { value: 's', label: 'S', size: 24, previewSize: 12 },
  { value: 'm', label: 'M', size: 32, previewSize: 16 },
  { value: 'l', label: 'L', size: 40, previewSize: 20 },
];

// Fill color palette
const FILL_COLORS = [
  { value: 'transparent', label: 'None', className: 'bg-background border-2 border-dashed' },
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#374151', label: 'Dark Gray', className: 'bg-gray-700' },
  { value: '#6b7280', label: 'Gray', className: 'bg-gray-500' },
  { value: '#ffffff', label: 'White', className: 'bg-white border border-gray-300' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#22c55e', label: 'Green', className: 'bg-green-500' },
  { value: '#06b6d4', label: 'Cyan', className: 'bg-cyan-500' },
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#eab308', label: 'Yellow', className: 'bg-yellow-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#f97316', label: 'Orange', className: 'bg-orange-500' },
];

// Label color options
const LABEL_COLORS = [
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#ffffff', label: 'White', className: 'bg-white border border-gray-300' },
];

// Position presets
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
  { role: 'BALL', label: '🏈' },
];

export default function PlayerTab() {
  const addPlayer = useEditorStore((state) => state.addPlayer);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const players = useEditorStore((state) => state.play.roster.players);
  const updatePlayerAppearance = useEditorStore((state) => state.updatePlayerAppearance);
  const updatePlayer = useEditorStore((state) => state.updatePlayer);

  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<PlayerShape>('circle');
  const [selectedSize, setSelectedSize] = useState('m');
  const [selectedFillColor, setSelectedFillColor] = useState('#ffffff');
  const [selectedLabelColor, setSelectedLabelColor] = useState('#000000');
  const [labelText, setLabelText] = useState('');

  // Get selected player for editing
  const selectedPlayer = selectedPlayerIds.length === 1
    ? players.find((p) => p.id === selectedPlayerIds[0])
    : null;

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
      addPlayer(role, { x: 0.5, y: 0 }, {
        shape: selectedShape,
        fill: selectedFillColor,
        stroke: '#000000',
      });
    }
    setAddPlayerOpen(false);
  };

  const handleShapeChange = (shape: PlayerShape) => {
    setSelectedShape(shape);
    if (selectedPlayer) {
      updatePlayerAppearance(selectedPlayer.id, { shape });
    }
  };

  const handleFillColorChange = (color: string) => {
    setSelectedFillColor(color);
    if (selectedPlayer) {
      updatePlayerAppearance(selectedPlayer.id, { fill: color });
    }
  };

  const handleLabelColorChange = (color: string) => {
    setSelectedLabelColor(color);
    if (selectedPlayer) {
      updatePlayerAppearance(selectedPlayer.id, { labelColor: color });
    }
  };

  const handleLabelChange = (text: string) => {
    setLabelText(text);
    if (selectedPlayer) {
      updatePlayer(selectedPlayer.id, { label: text });
    }
  };

  const handleSizeChange = (sizeValue: string) => {
    setSelectedSize(sizeValue);
    const sizeOption = PLAYER_SIZES.find((s) => s.value === sizeValue);
    if (selectedPlayer && sizeOption) {
      updatePlayerAppearance(selectedPlayer.id, { radius: sizeOption.size });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Player Section */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Add Player</Label>
        <Popover open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start">
              + Add Player
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            {/* Offense */}
            <div className="mb-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Offense
              </Label>
              <div className="grid grid-cols-5 gap-1">
                {OFFENSE_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-green-100 hover:bg-green-200 text-green-800 text-xs px-1 h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Defense */}
            <div className="mb-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Defense
              </Label>
              <div className="grid grid-cols-5 gap-1">
                {DEFENSE_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-1 h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Special */}
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Special
              </Label>
              <div className="grid grid-cols-5 gap-1">
                {SPECIAL_PRESETS.map(({ role, label }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddPlayer(role)}
                    className="bg-muted hover:bg-muted/80 text-foreground text-xs px-1 h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Player Shape */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Player Shape</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {PLAYER_SHAPES.map(({ value, label, preview }) => (
            <button
              key={value}
              onClick={() => handleShapeChange(value)}
              className={cn(
                'h-10 w-10 flex items-center justify-center rounded border text-lg transition-colors',
                selectedShape === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground'
              )}
              title={label}
            >
              {preview}
            </button>
          ))}
        </div>
      </div>

      {/* Player Size */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Player Size</Label>
        <div className="flex gap-1.5">
          {PLAYER_SIZES.map(({ value, label, previewSize }) => (
            <button
              key={value}
              onClick={() => handleSizeChange(value)}
              className={cn(
                'flex-1 h-10 flex flex-col items-center justify-center rounded border transition-colors gap-0.5',
                selectedSize === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              title={label}
            >
              <div
                className={cn(
                  'rounded-full border-2',
                  selectedSize === value
                    ? 'border-primary bg-primary/30'
                    : 'border-muted-foreground bg-muted'
                )}
                style={{ width: previewSize, height: previewSize }}
              />
              <span className={cn(
                'text-[9px] font-medium',
                selectedSize === value ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Label Color & Text */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium mb-2 block">Label Color</Label>
          <div className="flex gap-1.5">
            {LABEL_COLORS.map(({ value, label, className }) => (
              <button
                key={value}
                onClick={() => handleLabelColorChange(value)}
                className={cn(
                  'h-8 w-8 rounded-full transition-all',
                  className,
                  selectedLabelColor === value && 'ring-2 ring-primary ring-offset-2'
                )}
                title={label}
              />
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium mb-2 block">Label Text</Label>
          <Input
            value={selectedPlayer?.label || labelText}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Label"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Fill Color</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {FILL_COLORS.map(({ value, label, className }) => (
            <button
              key={value}
              onClick={() => handleFillColorChange(value)}
              className={cn(
                'h-8 w-8 rounded transition-all',
                className,
                selectedFillColor === value && 'ring-2 ring-primary ring-offset-2'
              )}
              title={label}
            />
          ))}
        </div>
      </div>

      {/* Selected Player Info */}
      {selectedPlayer && (
        <div className="pt-3 border-t border-border">
          <Label className="text-xs font-medium mb-2 block text-muted-foreground">
            Selected: {selectedPlayer.label || selectedPlayer.role}
          </Label>
        </div>
      )}
    </div>
  );
}
