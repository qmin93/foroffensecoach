'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  Download,
  HelpCircle,
  Undo2,
  Redo2,
  FlipHorizontal,
} from 'lucide-react';

interface TopBarProps {
  onSave: () => void;
  isSaving: boolean;
  lastSaved?: Date | null;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onShare: () => void;
  canShare: boolean;
}

// Group formations by category for better organization
const FORMATION_CATEGORIES = {
  'Spread / Air Raid': ['shotgun', 'spread', 'trips', 'tripsLeft', 'twins', 'twinsLeft', 'emptySet', 'bunch', 'bunchLeft', 'slot', 'slotLeft'],
  'Pro Style': ['singleBack', 'ace', 'proSet', 'aceTwinsRight', 'aceTwinsLeft', 'heavy', 'jumbo'],
  'Power / Run': ['iFormation', 'goalLine', 'wingT', 'powerI', 'marylandI', 'fullHouse'],
  'Option': ['pistol', 'wildcat', 'wishbone', 'flexbone'],
};

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export function TopBar({
  onSave,
  isSaving,
  lastSaved,
  onExportPNG,
  onExportPDF,
  onShare,
  canShare,
}: TopBarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const loadFormation = useEditorStore((state) => state.loadFormation);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const history = useEditorStore((state) => state.history);
  const flipPlay = useEditorStore((state) => state.flipPlay);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const playName = useEditorStore((state) => state.play.name);
  const updatePlayName = useEditorStore((state) => state.updatePlayName);

  const [selectedFormation, setSelectedFormation] = useState<string>('');

  const canUndo = historyIndex >= 0 && history.length > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleFormationChange = (formationKey: string) => {
    setSelectedFormation(formationKey);
    loadFormation(formationKey);
  };

  const handleZoomChange = (value: string) => {
    setZoom(Number(value) / 100); // Convert percentage to decimal (e.g., 100 -> 1.0)
  };

  return (
    <TooltipProvider>
      <div className="hidden md:flex items-center justify-between h-12 px-4 bg-background border-b border-border">
        {/* Left Section: BACK, VIEW, SAVE, HELP */}
        <div className="flex items-center gap-1">
          {/* BACK */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">BACK</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-border" />

          {/* Play Name Input */}
          <Input
            value={playName || ''}
            onChange={(e) => updatePlayName(e.target.value)}
            className="h-8 w-48 font-bold text-base border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="작전 이름"
          />

          <div className="h-6 w-px bg-border" />

          {/* SAVE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">SAVE</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={onSave} disabled={isSaving || !isAuthenticated}>
                    {isSaving ? 'Saving...' : 'Save Play'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportPNG}>
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                  {canShare && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onShare}>
                        Share Link
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Save & Export</TooltipContent>
          </Tooltip>

          {/* HELP */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">HELP</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help & Shortcuts</TooltipContent>
          </Tooltip>
        </div>

        {/* Center Section: Formation Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground font-bold">FORMATION:</span>
          <Select value={selectedFormation} onValueChange={handleFormationChange}>
            <SelectTrigger className="w-52 h-9 text-sm font-semibold">
              <SelectValue placeholder="Select Formation..." />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {Object.entries(FORMATION_CATEGORIES).map(([category, formations]) => (
                <div key={category}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                    {category}
                  </DropdownMenuLabel>
                  {formations.map((key) => {
                    const formation = FORMATION_PRESETS[key];
                    if (!formation) return null;
                    return (
                      <SelectItem key={key} value={key} className="text-sm">
                        {formation.name}
                      </SelectItem>
                    );
                  })}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Section: Zoom, UNDO, REDO, FLIP */}
        <div className="flex items-center gap-1">
          {/* Zoom Dropdown */}
          <Select value={String(Math.round((zoom || 1) * 100))} onValueChange={handleZoomChange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="100%" />
            </SelectTrigger>
            <SelectContent>
              {ZOOM_LEVELS.map((level) => (
                <SelectItem key={level} value={String(level)} className="text-xs">
                  {level}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border mx-1" />

          {/* UNDO */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-9 px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          {/* REDO */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-9 px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-border mx-1" />

          {/* FLIP */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={flipPlay}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <FlipHorizontal className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">FLIP</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip Play Horizontally</TooltipContent>
          </Tooltip>

          {/* Save status indicator */}
          {lastSaved && (
            <span className="text-xs text-muted-foreground ml-2">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
