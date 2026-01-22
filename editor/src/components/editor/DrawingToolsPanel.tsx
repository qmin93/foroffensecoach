'use client';

import { useState, lazy, Suspense } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { EditorMode } from '@/types/dsl';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UserCircle,
  Minus,
  Square,
  Type,
  Star,
  FileText,
  Video,
  LayoutTemplate,
  Plus,
  Trash2,
  Spline,
  Copy,
  FlipHorizontal2,
  Group,
  Ungroup,
  Eraser,
} from 'lucide-react';

// Lazy load tab contents for better performance
const PlayerTab = lazy(() => import('./tabs/PlayerTab'));
const LineTab = lazy(() => import('./tabs/LineTab'));
const ZonesTab = lazy(() => import('./tabs/ZonesTab'));
const SymbolTab = lazy(() => import('./tabs/SymbolTab'));

// Skeleton component for loading states
function TabSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-10" />
        ))}
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

// Tab configuration
const TABS = [
  { id: 'player', label: 'PLAYER', icon: UserCircle },
  { id: 'line', label: 'LINE', icon: Minus },
  { id: 'zones', label: 'ZONES', icon: Square },
  { id: 'text', label: 'TEXT', icon: Type },
  { id: 'symbol', label: 'SYMBOL', icon: Star },
] as const;

const SECONDARY_TABS = [
  { id: 'notes', label: 'NOTES', icon: FileText },
  { id: 'video', label: 'VIDEO', icon: Video },
  { id: 'templates', label: 'TEMPLATES', icon: LayoutTemplate },
] as const;

type TabId = typeof TABS[number]['id'] | typeof SECONDARY_TABS[number]['id'];

interface DrawingToolsPanelProps {
  className?: string;
}

export function DrawingToolsPanel({ className }: DrawingToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('player');
  const [showLOS, setShowLOS] = useState(true);

  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const flipPlay = useEditorStore((state) => state.flipPlay);
  const resetPlay = useEditorStore((state) => state.resetPlay);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingConfig = useEditorStore((state) => state.setDrawingConfig);

  const hasSelection = selectedPlayerIds.length > 0 || selectedActionIds.length > 0;

  const handleRemove = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
  };

  const handleDuplicate = () => {
    duplicateSelected();
  };

  const handleStraightLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'straight' });
  };

  const handleCurveLine = () => {
    setMode('draw');
    setDrawingConfig({ lineType: 'curved' });
  };

  return (
    <div className={`w-64 bg-card border-l border-border flex flex-col h-full ${className}`}>
      {/* Tab Navigation - Primary Tabs */}
      <div className="border-b border-border">
        <div className="flex flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-2 py-2 text-[10px] font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={{ width: '20%' }}
            >
              <tab.icon className="w-4 h-4 mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Secondary Tabs */}
        <div className="flex border-t border-border">
          {SECONDARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-2 py-2 text-[10px] font-medium transition-colors flex-1 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4 mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Line of Scrimmage Toggle */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <Label htmlFor="los-toggle" className="text-xs font-medium">
              LINE OF SCRIMMAGE
            </Label>
            <Switch
              id="los-toggle"
              checked={showLOS}
              onCheckedChange={setShowLOS}
            />
          </div>

          {/* Tool Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs justify-start"
              onClick={() => setActiveTab('player')}
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
              Remove
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
              onClick={handleDuplicate}
              disabled={selectedPlayerIds.length === 0}
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
              variant="destructive"
              size="sm"
              className="h-9 text-xs justify-start col-span-2"
              onClick={resetPlay}
            >
              <Eraser className="w-4 h-4 mr-1" />
              Delete All
            </Button>
          </div>

          {/* Tab Content */}
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === 'player' && <PlayerTab />}
            {activeTab === 'line' && <LineTab />}
            {activeTab === 'zones' && <ZonesTab />}
            {activeTab === 'text' && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Text tool coming soon
              </div>
            )}
            {activeTab === 'symbol' && <SymbolTab />}
            {activeTab === 'notes' && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Notes coming soon
              </div>
            )}
            {activeTab === 'video' && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Video coming soon
              </div>
            )}
            {activeTab === 'templates' && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Templates coming soon
              </div>
            )}
          </Suspense>
        </div>
      </ScrollArea>
    </div>
  );
}
