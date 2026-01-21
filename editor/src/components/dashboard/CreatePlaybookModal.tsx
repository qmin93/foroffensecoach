'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormationSelector } from './FormationSelector';
import { GeneratedPlaysReview } from './GeneratedPlaysReview';
import { generatePlaysForFormations, type GeneratedPlay, getGeneratedPlaysStats } from '@/lib/playbook-generator';

type WizardStep = 'info' | 'formations' | 'review';

type NamingFormat = 'formation_concept' | 'concept_only' | 'numbered' | 'custom_prefix';

interface NamingOptions {
  format: NamingFormat;
  customPrefix: string;
  includeNumber: boolean;
}

interface CreationProgress {
  current: number;
  total: number;
  currentPlayName: string;
}

interface CreatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    tags: string[],
    generatedPlays: GeneratedPlay[],
    onProgress?: (progress: CreationProgress) => void
  ) => Promise<void>;
}

const defaultNamingOptions: NamingOptions = {
  format: 'formation_concept',
  customPrefix: '',
  includeNumber: false,
};

export function CreatePlaybookModal({ isOpen, onClose, onCreate }: CreatePlaybookModalProps) {
  const [step, setStep] = useState<WizardStep>('info');
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFormations, setSelectedFormations] = useState<string[]>([]);
  const [generatedPlays, setGeneratedPlays] = useState<GeneratedPlay[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationProgress, setCreationProgress] = useState<CreationProgress | null>(null);
  const [namingOptions, setNamingOptions] = useState<NamingOptions>(defaultNamingOptions);

  const stats = useMemo(() => getGeneratedPlaysStats(generatedPlays), [generatedPlays]);

  const resetForm = useCallback(() => {
    setStep('info');
    setName('');
    setTagsInput('');
    setSelectedFormations([]);
    setGeneratedPlays([]);
    setError(null);
    setIsCreating(false);
    setIsGenerating(false);
    setCreationProgress(null);
    setNamingOptions(defaultNamingOptions);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextFromInfo = () => {
    if (!name.trim()) {
      setError('Please enter a playbook name');
      return;
    }
    setError(null);
    setStep('formations');
  };

  // Helper function to format play name based on naming options
  const formatPlayName = (
    formationName: string,
    conceptName: string,
    index: number,
    options: NamingOptions
  ): string => {
    let baseName: string;

    switch (options.format) {
      case 'concept_only':
        baseName = conceptName;
        break;
      case 'numbered':
        baseName = `Play ${index + 1} - ${conceptName}`;
        break;
      case 'custom_prefix':
        baseName = options.customPrefix
          ? `${options.customPrefix} ${conceptName}`
          : conceptName;
        break;
      case 'formation_concept':
      default:
        baseName = `${formationName} ${conceptName}`;
        break;
    }

    if (options.includeNumber && options.format !== 'numbered') {
      return `${index + 1}. ${baseName}`;
    }

    return baseName;
  };

  const handleNextFromFormations = async () => {
    if (selectedFormations.length === 0) {
      setError('Please select at least one formation');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      const plays = generatePlaysForFormations({
        formations: selectedFormations,
        targetPlayCount: 30,
        passRunRatio: 0.5,
      });

      // Apply naming options to generated plays
      const namedPlays = plays.map((play, index) => ({
        ...play,
        name: formatPlayName(play.formationName, play.concept.name, index, namingOptions),
      }));

      setGeneratedPlays(namedPlays);
      setStep('review');
    } catch (err) {
      setError('Failed to generate plays');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlay = (playId: string) => {
    setGeneratedPlays(plays =>
      plays.map(p =>
        p.id === playId ? { ...p, selected: !p.selected } : p
      )
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
    if (selectedPlays.length === 0) {
      setError('Please select at least one play');
      return;
    }

    setIsCreating(true);
    setError(null);
    setCreationProgress({ current: 0, total: selectedPlays.length, currentPlayName: '' });

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onCreate(name.trim(), tags, selectedPlays, (progress) => {
        setCreationProgress(progress);
      });
      resetForm();
      onClose();
    } catch (err) {
      setError('Failed to create playbook');
    } finally {
      setIsCreating(false);
      setCreationProgress(null);
    }
  };

  const handleBack = () => {
    if (step === 'formations') setStep('info');
    else if (step === 'review') setStep('formations');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'info': return '1. Playbook Info';
      case 'formations': return '2. Select Formations';
      case 'review': return '3. Review & Select Plays';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Create New Playbook</h2>
            <button
              onClick={handleClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {['info', 'formations', 'review'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === s
                    ? 'bg-blue-600 text-white'
                    : ['info', 'formations', 'review'].indexOf(step) > i
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-700 text-zinc-400'}
                `}>
                  {['info', 'formations', 'review'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-0.5 mx-1 ${
                    ['info', 'formations', 'review'].indexOf(step) > i ? 'bg-green-600' : 'bg-zinc-700'
                  }`} />
                )}
              </div>
            ))}
            <span className="ml-4 text-sm text-zinc-400">{getStepTitle()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Playbook Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-zinc-300">
                  Playbook Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., 2024 Season Playbook"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-zinc-300">
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g., offense, varsity, 2024"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Optional. Use tags to organize your playbooks.
                </p>
              </div>

              {/* Play Naming Options */}
              <div className="mt-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <h3 className="font-medium text-white mb-3">Play Naming Format</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingOptions.format === 'formation_concept'}
                      onChange={() => setNamingOptions(prev => ({ ...prev, format: 'formation_concept' }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm text-white">Formation + Concept</span>
                      <span className="block text-xs text-zinc-500">e.g., "Shotgun Mesh"</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingOptions.format === 'concept_only'}
                      onChange={() => setNamingOptions(prev => ({ ...prev, format: 'concept_only' }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm text-white">Concept Only</span>
                      <span className="block text-xs text-zinc-500">e.g., "Mesh"</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingOptions.format === 'numbered'}
                      onChange={() => setNamingOptions(prev => ({ ...prev, format: 'numbered' }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm text-white">Numbered</span>
                      <span className="block text-xs text-zinc-500">e.g., "Play 1 - Mesh"</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingOptions.format === 'custom_prefix'}
                      onChange={() => setNamingOptions(prev => ({ ...prev, format: 'custom_prefix' }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm text-white">Custom Prefix</span>
                      <span className="block text-xs text-zinc-500">Add your own prefix</span>
                    </div>
                  </label>

                  {namingOptions.format === 'custom_prefix' && (
                    <div className="ml-7">
                      <Input
                        value={namingOptions.customPrefix}
                        onChange={e => setNamingOptions(prev => ({ ...prev, customPrefix: e.target.value }))}
                        placeholder="e.g., Red Zone, Goal Line..."
                        className="bg-zinc-800 border-zinc-600 text-white text-sm"
                      />
                    </div>
                  )}

                  {namingOptions.format !== 'numbered' && (
                    <label className="flex items-center gap-3 cursor-pointer ml-7 mt-2">
                      <input
                        type="checkbox"
                        checked={namingOptions.includeNumber}
                        onChange={e => setNamingOptions(prev => ({ ...prev, includeNumber: e.target.checked }))}
                        className="w-4 h-4 accent-blue-500 rounded"
                      />
                      <span className="text-sm text-zinc-400">Add play number prefix (1. 2. 3...)</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg mt-4">
                <h3 className="font-medium text-blue-400 mb-2">Auto-Generate Plays</h3>
                <p className="text-sm text-zinc-400">
                  In the next step, you&apos;ll select your preferred formations.
                  We&apos;ll automatically generate 30 plays optimized for those formations,
                  and you can select which ones to include in your playbook.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Formation Selection */}
          {step === 'formations' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Select the formations you want to use in your playbook.
                We recommend selecting 3-6 formations for a balanced playbook.
              </p>

              <FormationSelector
                selectedFormations={selectedFormations}
                onSelectionChange={setSelectedFormations}
                maxSelections={10}
              />
            </div>
          )}

          {/* Step 3: Review Generated Plays */}
          {step === 'review' && (
            <div className="space-y-4">
              {isCreating && creationProgress ? (
                /* Progress Display */
                <div className="space-y-4 py-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 mb-4">
                      <svg className="animate-spin h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Creating Playbook...
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                      Adding play {creationProgress.current} of {creationProgress.total}
                    </p>
                    {creationProgress.currentPlayName && (
                      <p className="text-xs text-zinc-500 truncate max-w-xs mx-auto">
                        {creationProgress.currentPlayName}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300 ease-out"
                        style={{
                          width: `${(creationProgress.current / creationProgress.total) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-2">
                      <span>{creationProgress.current} completed</span>
                      <span>{creationProgress.total - creationProgress.current} remaining</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Review State */
                <>
                  <p className="text-sm text-zinc-400">
                    We&apos;ve generated {generatedPlays.length} plays based on your selected formations.
                    Uncheck any plays you don&apos;t want to include, then click Create to finish.
                  </p>

                  <GeneratedPlaysReview
                    plays={generatedPlays}
                    onTogglePlay={handleTogglePlay}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                  />
                </>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-700">
          <div className="flex gap-3">
            {step !== 'info' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Back
              </Button>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>

            {step === 'info' && (
              <Button
                type="button"
                onClick={handleNextFromInfo}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Next: Select Formations
              </Button>
            )}

            {step === 'formations' && (
              <Button
                type="button"
                onClick={handleNextFromFormations}
                disabled={isGenerating || selectedFormations.length === 0}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  `Generate ${selectedFormations.length > 0 ? '30' : ''} Plays`
                )}
              </Button>
            )}

            {step === 'review' && (
              <Button
                type="button"
                onClick={handleCreate}
                disabled={isCreating || stats.selected === 0}
                className="bg-green-600 hover:bg-green-500 min-w-[200px]"
              >
                {isCreating && creationProgress ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating {creationProgress.current}/{creationProgress.total}</span>
                  </div>
                ) : (
                  `Create Playbook (${stats.selected} plays)`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
