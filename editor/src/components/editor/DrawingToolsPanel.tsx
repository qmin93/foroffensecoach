'use client';

import { useState, lazy, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UserCircle,
  Minus,
  Square,
  Type,
  FileText,
  Video,
  LayoutTemplate,
} from 'lucide-react';

// Lazy load tab contents for better performance
const PlayerTab = lazy(() => import('./tabs/PlayerTab'));
const LineTab = lazy(() => import('./tabs/LineTab'));
const ZonesTab = lazy(() => import('./tabs/ZonesTab'));

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

  return (
    <div className={`w-64 bg-card border-l border-border flex flex-col h-full overflow-hidden ${className}`}>
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
              style={{ width: '25%' }}
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
