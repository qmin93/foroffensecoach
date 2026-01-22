'use client';

import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DrawLineType, EndMarker, LineStyle } from '@/types/dsl';
import {
  Plus,
  Trash2,
  Minus,
  Spline,
  FlipHorizontal2,
  Copy,
  Group,
  Ungroup,
} from 'lucide-react';

// Thickness options
const THICKNESS_OPTIONS = [
  { value: 1, label: 'Thin', height: 1 },
  { value: 2, label: 'Normal', height: 2 },
  { value: 3, label: 'Thick', height: 3 },
];

// Style options (solid, dashed, dotted, wavy)
const STYLE_OPTIONS: { value: LineStyle; label: string; preview: React.ReactNode }[] = [
  { value: 'solid', label: 'Solid', preview: <div className="w-8 h-0.5 bg-current" /> },
  { value: 'dashed', label: 'Dashed', preview: <div className="w-8 h-0.5 border-t-2 border-dashed border-current" /> },
  { value: 'dotted', label: 'Dotted', preview: <div className="w-8 h-0.5 border-t-2 border-dotted border-current" /> },
];

// Endpoint options
const ENDPOINT_OPTIONS: { value: EndMarker; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: '⊘' },
  { value: 'arrow', label: 'Arrow', icon: '↑' },
  { value: 'circle', label: 'Circle', icon: '●' },
  { value: 'arrow', label: 'Arrow Right', icon: '→' },
  { value: 't_block', label: 'T-Block', icon: '⊥' },
  { value: 'arrow', label: 'Diagonal', icon: '↗' },
  { value: 't_block', label: 'T-Block Alt', icon: 'T' },
];

// Color palette - 2 rows
const COLOR_PALETTE = [
  // Row 1
  { value: '#f97316', label: 'Orange', className: 'bg-orange-500' },
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#6b7280', label: 'Gray', className: 'bg-gray-500' },
  { value: '#d1d5db', label: 'Light Gray', className: 'bg-gray-300' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  // Row 2
  { value: '#22c55e', label: 'Green', className: 'bg-green-500' },
  { value: '#06b6d4', label: 'Cyan', className: 'bg-cyan-500' },
  { value: '#eab308', label: 'Yellow', className: 'bg-yellow-500' },
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
];

export default function LineTab() {
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const flipPlay = useEditorStore((state) => state.flipPlay);

  const hasSelection = selectedPlayerIds.length > 0 || selectedActionIds.length > 0;

  const handleRemove = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
  };

  const handleStraightLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'straight' });
  };

  const handleCurveLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'curved' });
  };

  const handleThicknessChange = (thickness: number) => {
    setDrawingConfig({ lineWidth: thickness });
  };

  const handleStyleChange = (style: LineStyle) => {
    setDrawingConfig({ lineStyle: style });
  };

  const handleEndpointChange = (endpoint: EndMarker) => {
    setDrawingConfig({ endMarker: endpoint });
  };

  const handleColorChange = (color: string) => {
    setDrawingConfig({ lineColor: color });
  };

  return (
    <div className="space-y-4">
      {/* Tool Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={() => {}}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Player
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleRemove}
          disabled={!hasSelection}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remove Line
        </Button>
        <Button
          variant={mode === 'draw' && drawingConfig.lineType === 'straight' ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleStraightLine}
        >
          <Minus className="w-4 h-4 mr-1" />
          Straight Line
        </Button>
        <Button
          variant={mode === 'draw' && drawingConfig.lineType === 'curved' ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleCurveLine}
        >
          <Spline className="w-4 h-4 mr-1" />
          Curve Line
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={flipPlay}
        >
          <FlipHorizontal2 className="w-4 h-4 mr-1" />
          Flip Object
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={duplicateSelected}
          disabled={!hasSelection}
        >
          <Copy className="w-4 h-4 mr-1" />
          Duplicate
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
      </div>

      {/* Thickness */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Thickness</Label>
        <div className="flex gap-2">
          {THICKNESS_OPTIONS.map(({ value, label, height }) => (
            <button
              key={value}
              onClick={() => handleThicknessChange(value)}
              className={cn(
                'flex-1 h-10 flex items-center justify-center rounded border transition-colors',
                drawingConfig.lineWidth === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              title={label}
            >
              <div
                className="bg-foreground rounded-full"
                style={{ width: 24, height: height * 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Style</Label>
        <div className="flex gap-2">
          {STYLE_OPTIONS.map(({ value, label, preview }) => (
            <button
              key={value}
              onClick={() => handleStyleChange(value)}
              className={cn(
                'flex-1 h-10 flex items-center justify-center rounded border transition-colors text-foreground',
                drawingConfig.lineStyle === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              title={label}
            >
              {preview}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Endpoint</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {ENDPOINT_OPTIONS.map(({ value, label, icon }, index) => (
            <button
              key={`${value}-${index}`}
              onClick={() => handleEndpointChange(value)}
              className={cn(
                'h-10 flex items-center justify-center rounded border text-lg transition-colors',
                drawingConfig.endMarker === value && index === ENDPOINT_OPTIONS.findIndex(o => o.value === value)
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

      {/* Color */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Color</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {COLOR_PALETTE.map(({ value, label, className }) => (
            <button
              key={value}
              onClick={() => handleColorChange(value)}
              className={cn(
                'h-8 rounded transition-all',
                className,
                drawingConfig.lineColor === value && 'ring-2 ring-primary ring-offset-2'
              )}
              title={label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
