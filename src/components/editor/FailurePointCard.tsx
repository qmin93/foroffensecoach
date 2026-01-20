'use client';

import type { FailurePoint, DrillPhase } from '@/types/concept';

interface FailurePointCardProps {
  failurePoint: FailurePoint;
  index: number;
}

const PHASE_LABELS: Record<DrillPhase, string> = {
  indy: 'Individual',
  group: 'Position Group',
  team: 'Team',
};

const PHASE_COLORS: Record<DrillPhase, string> = {
  indy: 'bg-blue-500/20 text-blue-400',
  group: 'bg-yellow-500/20 text-yellow-400',
  team: 'bg-green-500/20 text-green-400',
};

export function FailurePointCard({ failurePoint, index }: FailurePointCardProps) {
  const { name, drill, videoRefs } = failurePoint;

  return (
    <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
      {/* Header with number and name */}
      <div className="flex items-start gap-2 mb-2">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <h4 className="text-sm font-medium text-white leading-tight">{name}</h4>
      </div>

      {/* Drill Info */}
      <div className="ml-7 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Drill:</span>
          <span className="text-xs text-zinc-200 font-medium">{drill.name}</span>
        </div>

        <p className="text-xs text-zinc-400">{drill.purpose}</p>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${PHASE_COLORS[drill.phase]}`}>
            {PHASE_LABELS[drill.phase]}
          </span>
        </div>
      </div>

      {/* Video References */}
      {videoRefs && videoRefs.length > 0 && (
        <div className="mt-3 ml-7 space-y-2">
          {videoRefs.map((video, vIndex) => (
            <a
              key={vIndex}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 bg-zinc-900 rounded border border-zinc-700 hover:border-pink-500/50 hover:bg-zinc-800 transition-colors group"
            >
              {/* Instagram Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 font-medium group-hover:text-pink-400 transition-colors">
                  {video.accountName}
                </p>
                {video.hashtags && video.hashtags.length > 0 && (
                  <p className="text-[10px] text-zinc-500 truncate">
                    {video.hashtags.slice(0, 3).join(' ')}
                  </p>
                )}
              </div>

              {/* External link icon */}
              <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default FailurePointCard;
