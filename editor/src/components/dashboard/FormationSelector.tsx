'use client';

import { useState, useMemo } from 'react';
import { FORMATION_PRESETS } from '@/store/editorStore';

interface FormationSelectorProps {
  selectedFormations: string[];
  onSelectionChange: (formations: string[]) => void;
  maxSelections?: number;
}

// Categorize formations for better UX
const FORMATION_CATEGORIES: Record<string, string[]> = {
  'Spread / Air Raid': [
    'shotgun', 'spread', 'tripsRight', 'tripsLeft', 'bunchRight', 'bunchLeft',
    'twinsRight', 'twinsLeft', 'slotRight', 'slotLeft', 'emptySet', 'emptyTrips',
    'stackRight', 'stackLeft', 'quadsRight', 'quadsLeft', 'treyRight', 'treyLeft',
    'spreadTight'
  ],
  'Pro Style / West Coast': [
    'singleBack', 'proSet', 'ace', 'aceTwinsRight', 'aceTwinsLeft', 'splitBacks',
    'doubleTightRight', 'doubleTightLeft', 'near', 'far', 'heavy', 'jumbo',
    'unbalancedRight', 'unbalancedLeft'
  ],
  'Power / Run Heavy': [
    'iFormation', 'powerI', 'marylandI', 'fullHouse', 'wingT', 'wingRight', 'wingLeft',
    'goalLine', 'big', 'tightBunchRight', 'tightBunchLeft', 'tFormation'
  ],
  'Pistol / Option': [
    'pistol', 'wishbone', 'flexbone', 'veer', 'wildcat', 'speedOption',
    'midlineOption', 'loadOption', 'tripleRight'
  ],
};

export function FormationSelector({
  selectedFormations,
  onSelectionChange,
  maxSelections = 10
}: FormationSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Spread / Air Raid');

  const formationList = useMemo(() => {
    return Object.entries(FORMATION_PRESETS).map(([key, value]) => ({
      key,
      name: value.name,
    }));
  }, []);

  const getFormationName = (key: string) => {
    return FORMATION_PRESETS[key]?.name ?? key;
  };

  const toggleFormation = (formationKey: string) => {
    if (selectedFormations.includes(formationKey)) {
      onSelectionChange(selectedFormations.filter(f => f !== formationKey));
    } else {
      if (selectedFormations.length < maxSelections) {
        onSelectionChange([...selectedFormations, formationKey]);
      }
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryFormations = FORMATION_CATEGORIES[category] || [];
    const validFormations = categoryFormations.filter(f => FORMATION_PRESETS[f]);
    const newSelections = new Set(selectedFormations);

    // Check if all are already selected
    const allSelected = validFormations.every(f => selectedFormations.includes(f));

    if (allSelected) {
      // Deselect all in category
      validFormations.forEach(f => newSelections.delete(f));
    } else {
      // Select all in category (up to max)
      validFormations.forEach(f => {
        if (newSelections.size < maxSelections) {
          newSelections.add(f);
        }
      });
    }

    onSelectionChange(Array.from(newSelections));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          Selected: {selectedFormations.length} / {maxSelections}
        </span>
        <button
          onClick={() => onSelectionChange([])}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Clear All
        </button>
      </div>

      {/* Selected Formations Preview */}
      {selectedFormations.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          {selectedFormations.map(key => (
            <span
              key={key}
              onClick={() => toggleFormation(key)}
              className="px-2 py-1 text-xs bg-blue-600/80 text-white rounded cursor-pointer hover:bg-red-600/80 transition-colors"
              title="Click to remove"
            >
              {getFormationName(key)} ×
            </span>
          ))}
        </div>
      )}

      {/* Category Accordion */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
        {Object.entries(FORMATION_CATEGORIES).map(([category, formationKeys]) => {
          const validFormations = formationKeys.filter(f => FORMATION_PRESETS[f]);
          const selectedInCategory = validFormations.filter(f => selectedFormations.includes(f)).length;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="border border-zinc-700 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between p-3 bg-zinc-800 hover:bg-zinc-750 transition-colors"
              >
                <span className="font-medium text-white">{category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">
                    {selectedInCategory}/{validFormations.length}
                  </span>
                  <span className="text-zinc-400">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Formation Grid */}
              {isExpanded && (
                <div className="p-3 bg-zinc-900">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => selectAllInCategory(category)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {validFormations.every(f => selectedFormations.includes(f))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {validFormations.map(key => {
                      const isSelected = selectedFormations.includes(key);
                      const isDisabled = !isSelected && selectedFormations.length >= maxSelections;

                      return (
                        <button
                          key={key}
                          onClick={() => !isDisabled && toggleFormation(key)}
                          disabled={isDisabled}
                          className={`
                            p-2 text-sm rounded border transition-all
                            ${isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : isDisabled
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-white'
                            }
                          `}
                        >
                          {getFormationName(key)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
