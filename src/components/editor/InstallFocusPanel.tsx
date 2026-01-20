'use client';

import { useMemo, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { getConceptById } from '@/data/concepts';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FailurePointCard } from './FailurePointCard';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

interface InstallFocusPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallFocusPanel({ isOpen, onClose }: InstallFocusPanelProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get feature access
  const { tier, canAccessFullInstallFocus } = useFeatureAccess();

  // Get the concept ID from the play's meta
  const conceptId = useEditorStore((state) => state.play.meta?.conceptId);
  const lastAppliedConceptId = useConceptStore((state) => state.lastAppliedConceptId);

  // Use either the play's conceptId or the last applied concept
  const activeConceptId = conceptId || lastAppliedConceptId;

  // Get the concept and its install focus data
  const concept = useMemo(() => {
    if (!activeConceptId) return null;
    return getConceptById(activeConceptId);
  }, [activeConceptId]);

  const installFocus = concept?.installFocus;
  const allFailurePoints = installFocus?.failurePoints || [];

  // For free tier, only show first failure point
  const visibleFailurePoints = canAccessFullInstallFocus
    ? allFailurePoints
    : allFailurePoints.slice(0, 1);
  const lockedFailurePoints = canAccessFullInstallFocus
    ? []
    : allFailurePoints.slice(1);

  if (!isOpen) return null;

  return (
    <div className="w-80 flex-shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="font-semibold text-white">Install Focus</h3>
          {allFailurePoints.length > 0 && (
            <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
              {allFailurePoints.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Concept Info */}
      {concept && (
        <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-700">
          <p className="text-xs text-zinc-400">
            Current Concept
          </p>
          <p className="text-sm font-medium text-white">{concept.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{concept.summary}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!activeConceptId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-zinc-400 mb-1">No concept applied</p>
            <p className="text-xs text-zinc-500">
              Apply a concept from the Concepts panel
              <br />
              to see drill recommendations
            </p>
          </div>
        ) : allFailurePoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-zinc-400 mb-1">No drill data available</p>
            <p className="text-xs text-zinc-500">
              This concept doesn&apos;t have
              <br />
              Install Focus data yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Intro text */}
            <div className="text-xs text-zinc-400 pb-2 border-b border-zinc-700/50">
              <p className="font-medium text-zinc-300 mb-1">Key Failure Points</p>
              <p>Focus on these areas during installation to ensure proper execution.</p>
            </div>

            {/* Visible Failure Points List */}
            {visibleFailurePoints.map((fp, index) => (
              <FailurePointCard
                key={fp.id}
                failurePoint={fp}
                index={index}
              />
            ))}

            {/* Locked Failure Points (Free tier) */}
            {lockedFailurePoints.length > 0 && (
              <div className="relative">
                {/* Blurred preview */}
                <div className="space-y-3 blur-sm pointer-events-none opacity-60">
                  {lockedFailurePoints.slice(0, 2).map((fp, index) => (
                    <FailurePointCard
                      key={fp.id}
                      failurePoint={fp}
                      index={visibleFailurePoints.length + index}
                    />
                  ))}
                </div>

                {/* Upgrade overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg">
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 text-orange-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm text-white font-medium mb-1">
                      {lockedFailurePoints.length} more drill{lockedFailurePoints.length > 1 ? 's' : ''} available
                    </p>
                    <p className="text-xs text-zinc-400 mb-3">
                      Upgrade to Pro for full access
                    </p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700 bg-zinc-800/50">
        <p className="text-[10px] text-zinc-500 text-center">
          Drills are read-only • Click video links to view on Instagram
        </p>
        {!canAccessFullInstallFocus && allFailurePoints.length > 1 && (
          <p className="text-[10px] text-orange-400 text-center mt-1">
            Free tier: 1 of {allFailurePoints.length} drills shown
          </p>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={tier}
        blockedFeature="installFocus"
        suggestedTier="pro"
      />
    </div>
  );
}

export default InstallFocusPanel;
