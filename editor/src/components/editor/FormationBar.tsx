'use client';

import { useState } from 'react';
import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Frequently used formations for quick access
const FREQUENT_FORMATIONS = [
  'trips',
  'spread',
  'bunch',
  'twins',
  'shotgun',
  'pistol',
  'emptySet',
  'iFormation',
];

// Formation categories for the dropdown
const FORMATION_CATEGORIES: Record<string, string[]> = {
  'Spread/Air Raid': [
    'trips', 'tripsLeft', 'spread', 'bunch', 'bunchLeft', 'twins', 'twinsLeft',
    'emptySet', 'emptyTrips', 'quadsRight', 'quadsLeft', 'stackRight', 'stackLeft',
    'treyRight', 'treyLeft', 'spreadTight', 'slot', 'slotLeft',
  ],
  'Pro Style': [
    'shotgun', 'pistol', 'singleBack', 'proSet', 'ace',
    'aceTwinsRight', 'aceTwinsLeft', 'splitBacks',
    'doubleTightRight', 'doubleTightLeft',
  ],
  'Power/Run': [
    'iFormation', 'wingT', 'goalLine', 'heavy', 'jumbo',
    'unbalancedRight', 'unbalancedLeft', 'near', 'far',
    'fullHouse', 'marylandI', 'powerI', 'wingRight', 'wingLeft',
    'big', 'tightBunchRight', 'tightBunchLeft', 'tFormation',
  ],
  'Option': [
    'wishbone', 'flexbone', 'veer', 'wildcat',
    'speedOption', 'midlineOption', 'loadOption', 'tripleRight',
  ],
};

export function FormationBar() {
  const loadFormation = useEditorStore((state) => state.loadFormation);
  const play = useEditorStore((state) => state.play);
  const [isOpen, setIsOpen] = useState(false);

  // Get current formation name
  const currentFormation = play.meta?.formationId
    ? FORMATION_PRESETS[play.meta.formationId]?.name
    : null;

  const handleFormationSelect = (formationKey: string) => {
    loadFormation(formationKey);
    setIsOpen(false);
  };

  return (
    <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 overflow-x-auto scrollbar-thin">
      {/* Quick access formation buttons */}
      {FREQUENT_FORMATIONS.map((key) => {
        const formation = FORMATION_PRESETS[key];
        if (!formation) return null;

        const isActive = play.meta?.formationId === key;

        return (
          <Button
            key={key}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleFormationSelect(key)}
            className={`whitespace-nowrap text-xs h-7 px-2.5 ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {formation.name}
          </Button>
        );
      })}

      {/* More formations dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <span className="mr-1">+ More</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-zinc-900 border-zinc-700">
          <ScrollArea className="h-80">
            {Object.entries(FORMATION_CATEGORIES).map(([category, formations], idx) => (
              <div key={category}>
                {idx > 0 && <DropdownMenuSeparator className="bg-zinc-700" />}
                <DropdownMenuLabel className="text-zinc-400 text-xs">
                  {category}
                </DropdownMenuLabel>
                {formations.map((key) => {
                  const formation = FORMATION_PRESETS[key];
                  if (!formation) return null;

                  const isActive = play.meta?.formationId === key;

                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleFormationSelect(key)}
                      className={`text-sm cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {formation.name}
                      {isActive && (
                        <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Current formation indicator */}
      {currentFormation && (
        <div className="ml-auto pl-3 flex items-center text-xs text-zinc-500">
          <span>Current: </span>
          <span className="ml-1 text-zinc-300">{currentFormation}</span>
        </div>
      )}
    </div>
  );
}
