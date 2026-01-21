'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FORMATION_PRESETS } from '@/store/editorStore';
import { generatePlaysForFormations, type GeneratedPlay, getGeneratedPlaysStats } from '@/lib/playbook-generator';

type QuickStartStep = 'formations' | 'generating' | 'review';

interface CreationProgress {
  current: number;
  total: number;
  currentPlayName: string;
}

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    tags: string[],
    generatedPlays: GeneratedPlay[],
    onProgress?: (progress: CreationProgress) => void
  ) => Promise<void>;
}

// Categorize formations
const FORMATION_CATEGORIES: Record<string, string[]> = {
  'Spread / Air Raid': [
    'shotgun', 'spread', 'tripsRight', 'tripsLeft', 'bunchRight', 'bunchLeft',
    'twinsRight', 'twinsLeft', 'slotRight', 'slotLeft', 'emptySet', 'emptyTrips',
    'stackRight', 'stackLeft', 'quadsRight', 'quadsLeft', 'treyRight', 'treyLeft',
    'spreadTight'
  ],
  'Pro Style': [
    'singleBack', 'proSet', 'ace', 'aceTwinsRight', 'aceTwinsLeft', 'splitBacks',
    'doubleTightRight', 'doubleTightLeft', 'near', 'far', 'heavy', 'jumbo',
    'unbalancedRight', 'unbalancedLeft'
  ],
  'Power / Run': [
    'iFormation', 'powerI', 'marylandI', 'fullHouse', 'wingT', 'wingRight', 'wingLeft',
    'goalLine', 'big', 'tightBunchRight', 'tightBunchLeft', 'tFormation'
  ],
  'Option': [
    'pistol', 'wishbone', 'flexbone', 'veer', 'wildcat', 'speedOption',
    'midlineOption', 'loadOption', 'tripleRight'
  ],
};

export function QuickStartModal({ isOpen, onClose, onCreate }: QuickStartModalProps) {
  const [step, setStep] = useState<QuickStartStep>('formations');
  const [selectedFormations, setSelectedFormations] = useState<string[]>([]);
  const [generatedPlays, setGeneratedPlays] = useState<GeneratedPlay[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<CreationProgress | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Spread / Air Raid');

  const stats = useMemo(() => getGeneratedPlaysStats(generatedPlays), [generatedPlays]);

  const resetForm = useCallback(() => {
    setStep('formations');
    setSelectedFormations([]);
    setGeneratedPlays([]);
    setIsCreating(false);
    setCreationProgress(null);
    setExpandedCategory('Spread / Air Raid');
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getFormationName = (key: string) => {
    return FORMATION_PRESETS[key]?.name ?? key;
  };

  const toggleFormation = (formationKey: string) => {
    if (selectedFormations.includes(formationKey)) {
      setSelectedFormations(prev => prev.filter(f => f !== formationKey));
    } else {
      if (selectedFormations.length < 10) {
        setSelectedFormations(prev => [...prev, formationKey]);
      }
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryFormations = FORMATION_CATEGORIES[category] || [];
    const validFormations = categoryFormations.filter(f => FORMATION_PRESETS[f]);
    const allSelected = validFormations.every(f => selectedFormations.includes(f));

    if (allSelected) {
      setSelectedFormations(prev => prev.filter(f => !validFormations.includes(f)));
    } else {
      const newSelections = new Set(selectedFormations);
      validFormations.forEach(f => {
        if (newSelections.size < 10) newSelections.add(f);
      });
      setSelectedFormations(Array.from(newSelections));
    }
  };

  const handleGenerate = async () => {
    if (selectedFormations.length === 0) return;

    setStep('generating');

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 800));

    const plays = generatePlaysForFormations({
      formations: selectedFormations,
      targetPlayCount: 30,
      passRunRatio: 0.5,
    });

    // Auto-select all plays initially
    const playsWithSelection = plays.map(play => ({ ...play, selected: true }));
    setGeneratedPlays(playsWithSelection);
    setStep('review');
  };

  const handleTogglePlay = (playId: string) => {
    setGeneratedPlays(plays =>
      plays.map(p => p.id === playId ? { ...p, selected: !p.selected } : p)
    );
  };

  const handleSelectAll = () => {
    setGeneratedPlays(plays => plays.map(p => ({ ...p, selected: true })));
  };

  const handleDeselectAll = () => {
    setGeneratedPlays(plays => plays.map(p => ({ ...p, selected: false })));
  };

  const handleCreate = async () => {
    const selectedPlays = generatedPlays.filter(p => p.selected);
    if (selectedPlays.length === 0) return;

    setIsCreating(true);
    setCreationProgress({ current: 0, total: selectedPlays.length, currentPlayName: '' });

    try {
      const playbookName = `Quick Playbook ${new Date().toLocaleDateString()}`;
      const tags = ['quick-start', ...selectedFormations.slice(0, 3).map(f => getFormationName(f).toLowerCase())];

      await onCreate(playbookName, tags, selectedPlays, (progress) => {
        setCreationProgress(progress);
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to create playbook:', err);
    } finally {
      setIsCreating(false);
      setCreationProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Quick Start
              </h2>
              <p className="text-white/80 mt-1">
                {step === 'formations' && 'Select formations to auto-generate 30 plays'}
                {step === 'generating' && 'Generating plays...'}
                {step === 'review' && 'Select the plays you want to keep'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === 'formations' ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}>
              <span>1</span> Select Formations
            </div>
            <div className="w-8 h-0.5 bg-white/30" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === 'review' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
            }`}>
              <span>2</span> Select Plays
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Formation Selection */}
          {step === 'formations' && (
            <div className="space-y-4">
              {/* Selected Count */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-white font-medium">
                  Selected: <span className="text-green-400">{selectedFormations.length}</span> / 10
                </span>
                {selectedFormations.length > 0 && (
                  <button
                    onClick={() => setSelectedFormations([])}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Selected Formations Tags */}
              {selectedFormations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFormations.map(key => (
                    <span
                      key={key}
                      onClick={() => toggleFormation(key)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-full cursor-pointer hover:bg-red-500 transition-colors flex items-center gap-1"
                    >
                      {getFormationName(key)}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ))}
                </div>
              )}

              {/* Formation Categories */}
              <div className="space-y-2">
                {Object.entries(FORMATION_CATEGORIES).map(([category, formationKeys]) => {
                  const validFormations = formationKeys.filter(f => FORMATION_PRESETS[f]);
                  const selectedInCategory = validFormations.filter(f => selectedFormations.includes(f)).length;
                  const isExpanded = expandedCategory === category;

                  return (
                    <div key={category} className="border border-zinc-700 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-750 transition-colors"
                      >
                        <span className="font-semibold text-white text-lg">{category}</span>
                        <div className="flex items-center gap-3">
                          {selectedInCategory > 0 && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                              {selectedInCategory} selected
                            </span>
                          )}
                          <span className="text-zinc-400 text-xl">{isExpanded ? '−' : '+'}</span>
                        </div>
                      </button>

                      {/* Formation Grid */}
                      {isExpanded && (
                        <div className="p-4 bg-zinc-900/50">
                          <div className="flex justify-end mb-3">
                            <button
                              onClick={() => selectAllInCategory(category)}
                              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                            >
                              {validFormations.every(f => selectedFormations.includes(f))
                                ? 'Deselect All'
                                : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {validFormations.map(key => {
                              const isSelected = selectedFormations.includes(key);
                              const isDisabled = !isSelected && selectedFormations.length >= 10;

                              return (
                                <button
                                  key={key}
                                  onClick={() => !isDisabled && toggleFormation(key)}
                                  disabled={isDisabled}
                                  className={`
                                    p-3 text-sm rounded-lg border-2 transition-all font-medium
                                    ${isSelected
                                      ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/20'
                                      : isDisabled
                                        ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-green-500 hover:text-white'
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
          )}

          {/* Generating Animation */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-green-500/30 rounded-full" />
                <div className="absolute inset-0 w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🏈</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Generating Plays...</h3>
              <p className="text-zinc-400 mt-2">
                Creating 30 plays based on {selectedFormations.length} formations
              </p>
            </div>
          )}

          {/* Step 2: Review & Select */}
          {step === 'review' && !isCreating && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-800 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.selected}</div>
                  <div className="text-sm text-zinc-400">Selected</div>
                </div>
                <div className="p-4 bg-zinc-800 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.passPlays}</div>
                  <div className="text-sm text-zinc-400">Pass Plays</div>
                </div>
                <div className="p-4 bg-zinc-800 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-400">{stats.runPlays}</div>
                  <div className="text-sm text-zinc-400">Run Plays</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">
                  {stats.selected} plays will be added to your playbook
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <span className="text-zinc-600">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Play List */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {generatedPlays.map((play, index) => (
                  <div
                    key={play.id}
                    onClick={() => handleTogglePlay(play.id)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${play.selected
                        ? 'bg-green-600/10 border-green-500'
                        : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        play.selected ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                      }`}>
                        {play.selected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">#{index + 1}</span>
                          <span className="font-medium text-white">{play.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            play.concept.conceptType === 'pass'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {play.concept.conceptType === 'pass' ? 'Pass' : 'Run'}
                          </span>
                          <span className="text-xs text-zinc-500">{play.formationName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">{play.score}%</div>
                        <div className="text-xs text-zinc-500">Match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creating Progress */}
          {isCreating && creationProgress && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 mb-4">
                    <svg className="animate-spin h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Creating Playbook...</h3>
                  <p className="text-zinc-400 mt-2">
                    {creationProgress.current} / {creationProgress.total} plays added
                  </p>
                </div>

                <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${(creationProgress.current / creationProgress.total) * 100}%` }}
                  />
                </div>

                {creationProgress.currentPlayName && (
                  <p className="text-sm text-zinc-500 text-center mt-3 truncate">
                    {creationProgress.currentPlayName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-700 bg-zinc-900">
          <div className="flex gap-3">
            {step === 'review' && !isCreating && (
              <Button
                onClick={() => setStep('formations')}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                ← Back to Formations
              </Button>
            )}

            <div className="flex-1" />

            <Button
              onClick={handleClose}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>

            {step === 'formations' && (
              <Button
                onClick={handleGenerate}
                disabled={selectedFormations.length === 0}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8"
              >
                Generate 30 Plays →
              </Button>
            )}

            {step === 'review' && !isCreating && (
              <Button
                onClick={handleCreate}
                disabled={stats.selected === 0}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8"
              >
                Create Playbook ({stats.selected})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
