'use client';

import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SymbolType } from '@/types/dsl';
import {
  Plus,
  Trash2,
  FlipHorizontal2,
  Copy,
  Group,
  Ungroup,
  RotateCcw,
  RotateCw,
  ZoomOut,
  ZoomIn,
} from 'lucide-react';

// Symbol shape options - 4 columns x 4 rows
const SYMBOL_SHAPES: { value: SymbolType; label: string; icon: string }[] = [
  // Row 1
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'cone', label: 'Cone', icon: '🔺' },
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'asterisk', label: 'Asterisk', icon: '✳' },
  // Row 2
  { value: 'exclamation', label: 'Exclamation', icon: '❗' },
  { value: 'dollar', label: 'Dollar', icon: '$' },
  { value: 'flag', label: 'Flag', icon: '🚩' },
  { value: 'arrow_up', label: 'Arrow Up', icon: '↑' },
  // Row 3
  { value: 'arrow_down', label: 'Arrow Down', icon: '↓' },
  { value: 'arrow_left', label: 'Arrow Left', icon: '←' },
  { value: 'arrow_right', label: 'Arrow Right', icon: '→' },
  { value: 'arrow_ne', label: 'Arrow NE', icon: '↗' },
  // Row 4
  { value: 'arrow_se', label: 'Arrow SE', icon: '↘' },
  { value: 'arrow_sw', label: 'Arrow SW', icon: '↙' },
  { value: 'arrow_nw', label: 'Arrow NW', icon: '↖' },
];

export default function SymbolTab() {
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const flipPlay = useEditorStore((state) => state.flipPlay);
  const symbolPlacementConfig = useEditorStore((state) => state.symbolPlacementConfig);
  const setSymbolConfig = useEditorStore((state) => state.setSymbolConfig);
  const startSymbolPlacement = useEditorStore((state) => state.startSymbolPlacement);
  const rotateSelected = useEditorStore((state) => state.rotateSelected);
  const scaleSelected = useEditorStore((state) => state.scaleSelected);
  const mode = useEditorStore((state) => state.mode);
  const placementPhase = useEditorStore((state) => state.placementPhase);

  const hasSelection = selectedPlayerIds.length > 0 || selectedActionIds.length > 0;
  const isPlacingSymbol = mode === 'symbol' && placementPhase === 'placing';

  const handleRemove = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
  };

  const handleSymbolSelect = (value: SymbolType) => {
    setSymbolConfig({ type: value });
  };

  const handleAddSymbol = () => {
    startSymbolPlacement();
  };

  return (
    <div className="space-y-4">
      {/* Tool Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={isPlacingSymbol ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={handleAddSymbol}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isPlacingSymbol ? 'Click to Place' : 'Add Symbol'}
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
          className="h-9 text-xs justify-start"
          onClick={() => scaleSelected(0.8)}
          disabled={selectedActionIds.length === 0}
        >
          <ZoomOut className="w-4 h-4 mr-1" />
          Scale Down
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs justify-start"
          onClick={() => scaleSelected(1.25)}
          disabled={selectedActionIds.length === 0}
        >
          <ZoomIn className="w-4 h-4 mr-1" />
          Scale Up
        </Button>
      </div>

      {/* Symbol Shape */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Shape</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {SYMBOL_SHAPES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleSymbolSelect(value)}
              className={cn(
                'h-10 flex items-center justify-center rounded border text-lg transition-colors',
                symbolPlacementConfig.type === value
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

      {/* Preview */}
      <div className="pt-3 border-t border-border">
        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
          Selected: {SYMBOL_SHAPES.find(s => s.value === symbolPlacementConfig.type)?.label}
        </Label>
        <div className="h-16 rounded border border-border flex items-center justify-center bg-muted/30">
          <span className="text-4xl">
            {SYMBOL_SHAPES.find(s => s.value === symbolPlacementConfig.type)?.icon}
          </span>
        </div>
        {isPlacingSymbol && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on the field to place the symbol
          </p>
        )}
      </div>
    </div>
  );
}
