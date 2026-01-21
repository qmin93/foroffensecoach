'use client';

import { memo } from 'react';
import type { ConceptCardData, RoleAssignmentDisplay } from '@/types/concept';
import { BADGE_LABELS, CATEGORY_LABELS } from '@/types/concept';

interface ConceptCardProps {
  concept: ConceptCardData;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (conceptId: string) => void;
  onHover?: (conceptId: string | null) => void;
  onApply?: (conceptId: string) => void;
}

export const ConceptCard = memo(function ConceptCard({
  concept,
  isSelected = false,
  isHovered = false,
  onSelect,
  onHover,
  onApply,
}: ConceptCardProps) {
  const typeColor = concept.conceptType === 'pass' ? 'blue' : 'green';
  const categoryLabel = CATEGORY_LABELS[concept.category] || concept.category;

  return (
    <div
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-150
        ${isSelected
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
          : isHovered
            ? 'border-zinc-500 bg-zinc-700/50'
            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
        }
      `}
      onClick={() => onSelect?.(concept.id)}
      onMouseEnter={() => onHover?.(concept.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{concept.name}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{concept.summary}</p>
        </div>

        {/* Match score */}
        {concept.matchScore !== undefined && (
          <div
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${concept.matchScore >= 80
                ? 'bg-green-500/20 text-green-400'
                : concept.matchScore >= 60
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-zinc-600/50 text-zinc-400'
              }
            `}
          >
            {concept.matchScore}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {/* Type badge */}
        <span
          className={`
            inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase
            ${typeColor === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}
          `}
        >
          {concept.conceptType}
        </span>

        {/* Category badge */}
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-600/50 text-zinc-300 text-[10px]">
          {categoryLabel}
        </span>

        {/* Style badges */}
        {concept.badges.slice(0, 2).map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]"
          >
            {BADGE_LABELS[badge] || badge}
          </span>
        ))}
      </div>

      {/* Rationale (for run concepts with defense context) */}
      {concept.rationale && concept.rationale.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-700/50">
          <ul className="space-y-0.5">
            {concept.rationale.map((line, idx) => (
              <li key={idx} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                <span className="text-green-400 mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Player Assignments (shown when selected) */}
      {isSelected && concept.roles && concept.roles.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-700/50">
          <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wide mb-1.5">
            Player Assignments
          </h5>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {concept.roles.map((role, idx) => (
              <div key={idx} className="text-[10px] flex items-start gap-1.5 bg-zinc-700/30 rounded px-1.5 py-1">
                <span className="font-medium text-yellow-400 min-w-[28px]">
                  {role.appliesTo.length > 0 ? role.appliesTo.join('/') : '—'}
                </span>
                <span className="text-zinc-300">{role.action}</span>
                {role.notes && (
                  <span className="text-zinc-500 ml-auto truncate" title={role.notes}>
                    {role.notes.length > 20 ? role.notes.slice(0, 20) + '...' : role.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply button (shown on hover/select) */}
      {(isSelected || isHovered) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(concept.id);
          }}
          className={`
            absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium
            bg-blue-600 hover:bg-blue-500 text-white transition-colors
            ${isSelected && concept.roles ? 'relative mt-2' : ''}
          `}
        >
          Apply
        </button>
      )}
    </div>
  );
});

export default ConceptCard;
