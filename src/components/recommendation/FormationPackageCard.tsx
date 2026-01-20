'use client';

import { FormationRecommendation } from '@/lib/formation-recommendation';

interface FormationPackageCardProps {
  recommendation: FormationRecommendation;
  rank: number;
  onSelect?: (formationId: string) => void;
  isSelected?: boolean;
}

export function FormationPackageCard({
  recommendation,
  rank,
  onSelect,
  isSelected = false,
}: FormationPackageCardProps) {
  const { formation, score, breakdown, rationale } = recommendation;

  const scoreColor =
    score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-orange-400';

  return (
    <div
      className={`border rounded-lg p-4 transition-all cursor-pointer hover:border-blue-500 ${
        isSelected
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-zinc-700 bg-zinc-800'
      }`}
      onClick={() => onSelect?.(formation.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">#{rank}</span>
          <h4 className="font-semibold text-white">{formation.name}</h4>
        </div>
        <div className={`text-lg font-bold ${scoreColor}`}>
          {score.toFixed(0)}
        </div>
      </div>

      {/* Formation Info */}
      <div className="mb-3">
        <p className="text-sm text-zinc-400 mb-2">{formation.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded">
            {formation.structure}
          </span>
          <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded">
            {formation.personnel.join('/')} Personnel
          </span>
          {formation.strengthBias !== 'balanced' && (
            <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded">
              {formation.strengthBias} bias
            </span>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-900 rounded p-2">
          <div className="text-xs text-zinc-500">Run Fit</div>
          <div className="text-sm font-medium text-white">{breakdown.runFit.toFixed(0)}</div>
        </div>
        <div className="bg-zinc-900 rounded p-2">
          <div className="text-xs text-zinc-500">Pass Fit</div>
          <div className="text-sm font-medium text-white">{breakdown.passFit.toFixed(0)}</div>
        </div>
        <div className="bg-zinc-900 rounded p-2">
          <div className="text-xs text-zinc-500">Style Fit</div>
          <div className="text-sm font-medium text-white">{breakdown.styleFit.toFixed(0)}</div>
        </div>
      </div>

      {/* Rationale */}
      <div className="border-t border-zinc-700 pt-3">
        <div className="text-xs text-zinc-500 mb-1">Why this works:</div>
        <ul className="space-y-1">
          {rationale.map((point, idx) => (
            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      {formation.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {formation.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs bg-zinc-700/50 text-zinc-400 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Risk Tags Warning */}
      {formation.riskTags.length > 0 && (
        <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
          <span>⚠️</span>
          <span>Risks: {formation.riskTags.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
