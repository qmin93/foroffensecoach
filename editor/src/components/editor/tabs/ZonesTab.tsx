'use client';

import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ZoneShapeType } from '@/types/dsl';
import {
  Plus,
  Trash2,
  Group,
  Ungroup,
  RotateCcw,
  RotateCw,
  Copy,
} from 'lucide-react';

// Zone shape options
const ZONE_SHAPES: { value: ZoneShapeType; label: string; icon: string }[] = [
  { value: 'circle', label: 'Circle', icon: '○' },
  { value: 'square', label: 'Square', icon: '□' },
  { value: 'triangle', label: 'Triangle', icon: '△' },
];

// Fill color palette
const FILL_COLORS = [
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#374151', label: 'Dark Gray', className: 'bg-gray-700' },
  { value: '#ffffff', label: 'White', className: 'bg-white border border-gray-300' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#22c55e', label: 'Green', className: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#06b6d4', label: 'Cyan', className: 'bg-cyan-500' },
  { value: '#eab308', label: 'Yellow', className: 'bg-yellow-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#f97316', label: 'Orange', className: 'bg-orange-500' },
];

export default function ZonesTab() {
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const zonePlacementConfig = useEditorStore((state) => state.zonePlacementConfig);
  const setZoneConfig = useEditorStore((state) => state.setZoneConfig);
  const startZonePlacement = useEditorStore((state) => state.startZonePlacement);
  const rotateSelected = useEditorStore((state) => state.rotateSelected);
  const mode = useEditorStore((state) => state.mode);
  const placementPhase = useEditorStore((state) => state.placementPhase);

  const hasSelection = selectedPlayerIds.length > 0 || selectedActionIds.length > 0;
  const isPlacingZone = mode === 'zone' && placementPhase === 'placing';

  const handleRemove = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
  };

  const handleShapeSelect = (value: ZoneShapeType) => {
    setZoneConfig({ shape: value });
  };

  const handleColorSelect = (value: string) => {
    setZoneConfig({ fillColor: value });
  };

  const handleOpacityChange = (value: number[]) => {
    setZoneConfig({ opacity: value[0] });
  };

  const handleAddZone = () => {
    startZonePlacement();
  };

  return (
    <div className="space-y-4">
      {/* Tool Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={isPlacingZone ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleAddZone}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isPlacingZone ? 'Drag to Draw' : 'Add Zone'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleRemove}
          disabled={!hasSelection}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remove
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          disabled
        >
          <Group className="w-4 h-4 mr-1" />
          Group
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          disabled
        >
          <Ungroup className="w-4 h-4 mr-1" />
          Ungroup
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={() => rotateSelected(-90)}
          disabled={selectedActionIds.length === 0}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Rotate Left
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={() => rotateSelected(90)}
          disabled={selectedActionIds.length === 0}
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Rotate Right
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start col-span-2"
          onClick={duplicateSelected}
          disabled={!hasSelection}
        >
          <Copy className="w-4 h-4 mr-1" />
          Duplicate
        </Button>
      </div>

      {/* Zone Shape */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Zone Shape</Label>
        <div className="flex gap-2">
          {ZONE_SHAPES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleShapeSelect(value)}
              className={cn(
                'flex-1 h-12 flex items-center justify-center rounded border text-2xl transition-colors',
                zonePlacementConfig.shape === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground'
              )}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Fill Color</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {FILL_COLORS.map(({ value, label, className }) => (
            <button
              key={value}
              onClick={() => handleColorSelect(value)}
              className={cn(
                'h-8 rounded transition-all',
                className,
                zonePlacementConfig.fillColor === value && 'ring-2 ring-primary ring-offset-2'
              )}
              title={label}
            />
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <Label className="text-xs font-medium mb-2 block">
          Opacity: {zonePlacementConfig.opacity}%
        </Label>
        <Slider
          value={[zonePlacementConfig.opacity]}
          onValueChange={handleOpacityChange}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
      </div>

      {/* Preview */}
      <div className="pt-3 border-t border-border">
        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
          Preview
        </Label>
        <div className="h-16 rounded border border-border flex items-center justify-center bg-muted/30">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center text-3xl',
              zonePlacementConfig.shape === 'circle' && 'rounded-full',
              zonePlacementConfig.shape === 'square' && 'rounded-sm',
              zonePlacementConfig.shape === 'triangle' && ''
            )}
            style={{
              backgroundColor: zonePlacementConfig.fillColor,
              opacity: zonePlacementConfig.opacity / 100,
            }}
          >
            {zonePlacementConfig.shape === 'triangle' && (
              <span style={{ color: zonePlacementConfig.fillColor, opacity: zonePlacementConfig.opacity / 100 }}>△</span>
            )}
          </div>
        </div>
        {isPlacingZone && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click and drag on the field to draw the zone
          </p>
        )}
      </div>
    </div>
  );
}
