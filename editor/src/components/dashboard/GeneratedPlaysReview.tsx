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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Selected:</span>
            <span className="ml-2 font-bold text-foreground">{stats.selected}</span>
            <span className="text-muted-foreground">/{stats.total}</span>
          </div>
          <div>
            <span className="text-blue-600">Pass:</span>
            <span className="ml-1 font-medium text-blue-600">{stats.passPlays}</span>
          </div>
          <div>
            <span className="text-green-600">Run:</span>
            <span className="ml-1 font-medium text-green-600">{stats.runPlays}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSelectAll}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Plays List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(playsByFormation).map(([formationKey, formationPlays]) => (
          <div key={formationKey} className="border border-border rounded-lg overflow-hidden">
            {/* Formation Header */}
            <div className="p-3 bg-muted border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {formationPlays[0]?.formationName ?? formationKey}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formationPlays.filter(p => p.selected).length}/{formationPlays.length} plays
                </span>
              </div>
            </div>

            {/* Plays in Formation */}
            <div className="divide-y divide-border">
              {formationPlays.map(play => (
                <div
                  key={play.id}
                  onClick={() => onTogglePlay(play.id)}
                  className={`
                    p-3 cursor-pointer transition-colors
                    ${play.selected
                      ? 'bg-background hover:bg-muted/50'
                      : 'bg-muted/30 opacity-60 hover:opacity-80'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className={`
                      mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center
                      ${play.selected
                        ? 'bg-primary border-primary'
                        : 'border-border'}
                    `}>
                      {play.selected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Play Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {play.concept.name}
                        </span>
                        <span className={`
                          px-2 py-0.5 text-xs rounded
                          ${play.concept.conceptType === 'pass'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'}
                        `}>
                          {play.concept.conceptType}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {play.concept.summary}
                      </p>
                      {play.rationale.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {play.rationale.slice(0, 2).map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
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
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          {stats.selected > 0 ? (
            <>
              <span className="text-foreground font-medium">{stats.selected} plays</span>
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
