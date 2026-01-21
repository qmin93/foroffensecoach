'use client';

import { useMemo } from 'react';
import type { GeneratedPlay } from '@/lib/playbook-generator';
import { getGeneratedPlaysStats } from '@/lib/playbook-generator';

interface GeneratedPlaysReviewProps {
  plays: GeneratedPlay[];
  onTogglePlay: (playId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function GeneratedPlaysReview({
  plays,
  onTogglePlay,
  onSelectAll,
  onDeselectAll,
}: GeneratedPlaysReviewProps) {
  const stats = useMemo(() => getGeneratedPlaysStats(plays), [plays]);

  // Group plays by formation
  const playsByFormation = useMemo(() => {
    const grouped: Record<string, GeneratedPlay[]> = {};
    plays.forEach(play => {
      if (!grouped[play.formationKey]) {
        grouped[play.formationKey] = [];
      }
      grouped[play.formationKey].push(play);
    });
    return grouped;
  }, [plays]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-zinc-400';
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-zinc-400">Selected:</span>
            <span className="ml-2 font-bold text-white">{stats.selected}</span>
            <span className="text-zinc-500">/{stats.total}</span>
          </div>
          <div>
            <span className="text-blue-400">Pass:</span>
            <span className="ml-1 font-medium text-blue-400">{stats.passPlays}</span>
          </div>
          <div>
            <span className="text-green-400">Run:</span>
            <span className="ml-1 font-medium text-green-400">{stats.runPlays}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSelectAll}
            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="px-3 py-1 text-xs bg-zinc-700/50 text-zinc-400 rounded hover:bg-zinc-700 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Plays List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(playsByFormation).map(([formationKey, formationPlays]) => (
          <div key={formationKey} className="border border-zinc-700 rounded-lg overflow-hidden">
            {/* Formation Header */}
            <div className="p-3 bg-zinc-800 border-b border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {formationPlays[0]?.formationName ?? formationKey}
                </span>
                <span className="text-xs text-zinc-400">
                  {formationPlays.filter(p => p.selected).length}/{formationPlays.length} plays
                </span>
              </div>
            </div>

            {/* Plays in Formation */}
            <div className="divide-y divide-zinc-800">
              {formationPlays.map(play => (
                <div
                  key={play.id}
                  onClick={() => onTogglePlay(play.id)}
                  className={`
                    p-3 cursor-pointer transition-colors
                    ${play.selected
                      ? 'bg-zinc-900 hover:bg-zinc-800'
                      : 'bg-zinc-900/50 opacity-60 hover:opacity-80'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className={`
                      mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center
                      ${play.selected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-zinc-600'}
                    `}>
                      {play.selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Play Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">
                          {play.concept.name}
                        </span>
                        <span className={`
                          px-2 py-0.5 text-xs rounded
                          ${play.concept.conceptType === 'pass'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-green-600/20 text-green-400'}
                        `}>
                          {play.concept.conceptType}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1 truncate">
                        {play.concept.summary}
                      </p>
                      {play.rationale.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {play.rationale.slice(0, 2).map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(play.score)}`}>
                        {play.score}
                      </div>
                      <div className="text-xs text-zinc-500">match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 text-center">
        <p className="text-sm text-zinc-400">
          {stats.selected > 0 ? (
            <>
              <span className="text-white font-medium">{stats.selected} plays</span>
              {' '}will be added to your playbook
              {' '}({stats.passPlays} pass, {stats.runPlays} run)
            </>
          ) : (
            'Select at least one play to continue'
          )}
        </p>
      </div>
    </div>
  );
}
