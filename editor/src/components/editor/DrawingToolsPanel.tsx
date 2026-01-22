'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { PlayerShape, EndMarker, LineStyle, ZoneShapeType } from '@/types/dsl';
import {
  ChevronDown,
  ChevronRight,
  Minus,
  Spline,
} from 'lucide-react';

// ===== Player Constants =====
const PLAYER_SHAPES: { value: PlayerShape; label: string; preview: string }[] = [
  { value: 'circle', label: 'Circle', preview: '○' },
  { value: 'square', label: 'Square', preview: '□' },
  { value: 'triangle', label: 'Triangle', preview: '△' },
  { value: 'diamond', label: 'Diamond', preview: '◇' },
  { value: 'star', label: 'Star', preview: '☆' },
  { value: 'x_mark', label: 'X Mark', preview: 'X' },
];

const FILL_COLORS = [
  { value: 'transparent', label: 'None', className: 'bg-background border-2 border-dashed' },
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#ffffff', label: 'White', className: 'bg-white border border-gray-300' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#22c55e', label: 'Green', className: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#eab308', label: 'Yellow', className: 'bg-yellow-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#f97316', label: 'Orange', className: 'bg-orange-500' },
];

const LABEL_COLORS = [
  { value: '#000000', label: 'Black', className: 'bg-black' },
  { value: '#ffffff', label: 'White', className: 'bg-white border border-gray-300' },
];

const OFFENSE_PRESETS = [
  { role: 'QB', label: 'QB' }, { role: 'RB', label: 'RB' }, { role: 'FB', label: 'FB' },
  { role: 'WR', label: 'WR' }, { role: 'TE', label: 'TE' }, { role: 'C', label: 'C' },
  { role: 'LG', label: 'LG' }, { role: 'RG', label: 'RG' }, { role: 'LT', label: 'LT' },
  { role: 'RT', label: 'RT' },
];

const DEFENSE_PRESETS = [
  { role: 'DE', label: 'DE' }, { role: 'DT', label: 'DT' }, { role: 'NT', label: 'NT' },
  { role: 'OLB', label: 'OLB' }, { role: 'ILB', label: 'ILB' }, { role: 'MLB', label: 'MLB' },
  { role: 'CB', label: 'CB' }, { role: 'SS', label: 'SS' }, { role: 'FS', label: 'FS' },
  { role: 'NB', label: 'NB' },
];

const SPECIAL_PRESETS = [
  { role: 'K', label: 'K' }, { role: 'P', label: 'P' }, { role: 'LS', label: 'LS' },
  { role: 'H', label: 'H' }, { role: 'BALL', label: '🏈' },
];

// ===== Line Constants =====
const THICKNESS_OPTIONS = [
  { value: 1, label: 'Thin', height: 1 },
  { value: 2, label: 'Normal', height: 2 },
  { value: 3, label: 'Thick', height: 3 },
];

const STYLE_OPTIONS: { value: LineStyle; label: string; preview: React.ReactNode }[] = [
  { value: 'solid', label: 'Solid', preview: <div className="w-8 h-0.5 bg-current" /> },
  { value: 'dashed', label: 'Dashed', preview: <div className="w-8 h-0.5 border-t-2 border-dashed border-current" /> },
  { value: 'dotted', label: 'Dotted', preview: <div className="w-8 h-0.5 border-t-2 border-dotted border-current" /> },
];

const ENDPOINT_OPTIONS: { value: EndMarker; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: '—' },
  { value: 'arrow', label: 'Arrow', icon: '→' },
  { value: 'circle', label: 'Circle', icon: '●' },
  { value: 't_block', label: 'T-Block', icon: '⊥' },
];

// ===== Zone Constants =====
const ZONE_SHAPES: { value: ZoneShapeType; label: string; icon: string }[] = [
  { value: 'circle', label: 'Circle', icon: '○' },
  { value: 'square', label: 'Square', icon: '□' },
  { value: 'triangle', label: 'Triangle', icon: '△' },
];

// ===== Collapsible Section Component =====
function Section({
  title,
  children,
  defaultOpen = true
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-semibold text-foreground mb-2 hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
}

interface DrawingToolsPanelProps {
  className?: string;
}

export function DrawingToolsPanel({ className }: DrawingToolsPanelProps) {
  // Player state
  const [selectedShape, setSelectedShape] = useState<PlayerShape>('circle');
  const [selectedFillColor, setSelectedFillColor] = useState('#ffffff');
  const [selectedLabelColor, setSelectedLabelColor] = useState('#000000');
  const [labelText, setLabelText] = useState('');

  // Store
  const addPlayer = useEditorStore((state) => state.addPlayer);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const players = useEditorStore((state) => state.play.roster.players);
  const updatePlayerAppearance = useEditorStore((state) => state.updatePlayerAppearance);
  const updatePlayer = useEditorStore((state) => state.updatePlayer);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);
  const zonePlacementConfig = useEditorStore((state) => state.zonePlacementConfig);
  const setZoneConfig = useEditorStore((state) => state.setZoneConfig);
  const startZonePlacement = useEditorStore((state) => state.startZonePlacement);
  const placementPhase = useEditorStore((state) => state.placementPhase);

  // Get selected player for editing
  const selectedPlayer = selectedPlayerIds.length === 1
    ? players.find((p) => p.id === selectedPlayerIds[0])
    : null;

  const isPlacingZone = mode === 'zone' && placementPhase === 'placing';

  // ===== Player Handlers =====
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

  // ===== Line Handlers =====
  const handleStraightLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'straight' });
  };

  const handleCurveLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'curved' });
  };

  // ===== Zone Handlers =====
  const handleAddZone = () => {
    startZonePlacement();
  };

  return (
    <div className={`w-64 bg-card border-l border-border flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground">Tools</h2>
      </div>

      {/* Add Player Buttons - Fixed under header */}
      <div className="px-3 py-2 border-b border-border flex-shrink-0 space-y-2">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide block">Offense</Label>
        <div className="grid grid-cols-5 gap-1">
          {OFFENSE_PRESETS.map(({ role, label }) => (
            <Button key={role} variant="secondary" size="sm" onClick={() => handleAddPlayer(role)}
              className="bg-green-100 hover:bg-green-200 text-green-800 text-xs px-1 h-7">{label}</Button>
          ))}
        </div>
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide block">Defense</Label>
        <div className="grid grid-cols-5 gap-1">
          {DEFENSE_PRESETS.map(({ role, label }) => (
            <Button key={role} variant="secondary" size="sm" onClick={() => handleAddPlayer(role)}
              className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-1 h-7">{label}</Button>
          ))}
        </div>
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide block">Special</Label>
        <div className="grid grid-cols-5 gap-1">
          {SPECIAL_PRESETS.map(({ role, label }) => (
            <Button key={role} variant="secondary" size="sm" onClick={() => handleAddPlayer(role)}
              className="bg-muted hover:bg-muted/80 text-foreground text-xs px-1 h-7">{label}</Button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 pb-8">
          {/* ===== PLAYER Section ===== */}
          <Section title="PLAYER">
            {/* Shape */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Shape</Label>
              <div className="grid grid-cols-6 gap-1">
                {PLAYER_SHAPES.map(({ value, label, preview }) => (
                  <button key={value} onClick={() => handleShapeChange(value)}
                    className={cn('h-8 w-8 flex items-center justify-center rounded border text-sm transition-colors',
                      selectedShape === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground'
                    )} title={label}>{preview}</button>
                ))}
              </div>
            </div>

            {/* Fill Color */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Fill Color</Label>
              <div className="grid grid-cols-9 gap-1">
                {FILL_COLORS.map(({ value, label, className }) => (
                  <button key={value} onClick={() => handleFillColorChange(value)}
                    className={cn('h-6 w-6 rounded transition-all', className,
                      selectedFillColor === value && 'ring-2 ring-primary ring-offset-1'
                    )} title={label} />
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="flex gap-2">
              <div className="flex gap-1">
                {LABEL_COLORS.map(({ value, label, className }) => (
                  <button key={value} onClick={() => handleLabelColorChange(value)}
                    className={cn('h-6 w-6 rounded-full transition-all', className,
                      selectedLabelColor === value && 'ring-2 ring-primary ring-offset-1'
                    )} title={label} />
                ))}
              </div>
              <Input value={selectedPlayer?.label || labelText} onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Label" className="h-6 text-xs flex-1" />
            </div>
          </Section>

          {/* ===== LINE Section ===== */}
          <Section title="LINE">
            {/* Line Type */}
            <div className="flex gap-1">
              <Button variant={mode === 'draw' && drawingConfig.lineType === 'straight' ? 'default' : 'outline'}
                size="sm" className="flex-1 h-8 text-xs" onClick={handleStraightLine}>
                <Minus className="w-3 h-3 mr-1" /> Straight
              </Button>
              <Button variant={mode === 'draw' && drawingConfig.lineType === 'curved' ? 'default' : 'outline'}
                size="sm" className="flex-1 h-8 text-xs" onClick={handleCurveLine}>
                <Spline className="w-3 h-3 mr-1" /> Curved
              </Button>
            </div>

            {/* Thickness */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Thickness</Label>
              <div className="flex gap-1">
                {THICKNESS_OPTIONS.map(({ value, label, height }) => (
                  <button key={value} onClick={() => setDrawingConfig({ lineWidth: value })}
                    className={cn('flex-1 h-8 flex items-center justify-center rounded border transition-colors',
                      drawingConfig.lineWidth === value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )} title={label}>
                    <div className="bg-foreground rounded-full" style={{ width: 20, height: height * 2 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Style</Label>
              <div className="flex gap-1">
                {STYLE_OPTIONS.map(({ value, label, preview }) => (
                  <button key={value} onClick={() => setDrawingConfig({ lineStyle: value })}
                    className={cn('flex-1 h-8 flex items-center justify-center rounded border transition-colors text-foreground',
                      drawingConfig.lineStyle === value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )} title={label}>{preview}</button>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Endpoint</Label>
              <div className="flex gap-1">
                {ENDPOINT_OPTIONS.map(({ value, label, icon }) => (
                  <button key={value} onClick={() => setDrawingConfig({ endMarker: value })}
                    className={cn('flex-1 h-8 flex items-center justify-center rounded border text-lg transition-colors',
                      drawingConfig.endMarker === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground'
                    )} title={label}>{icon}</button>
                ))}
              </div>
            </div>
          </Section>

          {/* ===== ZONE Section ===== */}
          <Section title="ZONE" defaultOpen={false}>
            {/* Add Zone */}
            <Button variant={isPlacingZone ? 'default' : 'outline'} size="sm" className="w-full h-8 text-xs" onClick={handleAddZone}>
              {isPlacingZone ? 'Drag to Draw' : '+ Add Zone'}
            </Button>

            {/* Zone Shape */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Shape</Label>
              <div className="flex gap-1">
                {ZONE_SHAPES.map(({ value, label, icon }) => (
                  <button key={value} onClick={() => setZoneConfig({ shape: value })}
                    className={cn('flex-1 h-10 flex items-center justify-center rounded border text-xl transition-colors',
                      zonePlacementConfig.shape === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground'
                    )} title={label}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Zone Color */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Fill Color</Label>
              <div className="grid grid-cols-9 gap-1">
                {FILL_COLORS.slice(1).map(({ value, label, className }) => (
                  <button key={value} onClick={() => setZoneConfig({ fillColor: value })}
                    className={cn('h-6 w-6 rounded transition-all', className,
                      zonePlacementConfig.fillColor === value && 'ring-2 ring-primary ring-offset-1'
                    )} title={label} />
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1.5 block">Opacity: {zonePlacementConfig.opacity}%</Label>
              <Slider value={[zonePlacementConfig.opacity]} onValueChange={(v) => setZoneConfig({ opacity: v[0] })}
                max={100} min={0} step={5} className="w-full" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
