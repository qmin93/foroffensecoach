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

interface CustomVideo {
  id: string;
  platform: 'youtube' | 'instagram';
  url: string;
  title?: string;
}

export function InstallFocusPanel({ isOpen, onClose }: InstallFocusPanelProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [customVideos, setCustomVideos] = useState<CustomVideo[]>([]);

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

  // Detect video platform from URL
  const detectPlatform = (url: string): 'youtube' | 'instagram' | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('instagram.com')) {
      return 'instagram';
    }
    return null;
  };

  // Add custom video
  const handleAddVideo = () => {
    const platform = detectPlatform(videoUrl);
    if (!platform) {
      alert('Please enter a valid YouTube or Instagram URL');
      return;
    }

    const newVideo: CustomVideo = {
      id: `custom-${Date.now()}`,
      platform,
      url: videoUrl,
      title: videoTitle || (platform === 'youtube' ? 'YouTube Video' : 'Instagram Video'),
    };

    setCustomVideos([...customVideos, newVideo]);
    setVideoUrl('');
    setVideoTitle('');
    setShowAddVideo(false);
  };

  // Remove custom video
  const handleRemoveVideo = (id: string) => {
    setCustomVideos(customVideos.filter(v => v.id !== id));
  };

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
        ) : (
          <div className="space-y-4">
            {/* Training Drills Section */}
            {allFailurePoints.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-zinc-400 pb-2 border-b border-zinc-700/50">
                  <p className="font-medium text-zinc-300 mb-1">Training Drills</p>
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
                    <div className="space-y-3 blur-sm pointer-events-none opacity-60">
                      {lockedFailurePoints.slice(0, 2).map((fp, index) => (
                        <FailurePointCard
                          key={fp.id}
                          failurePoint={fp}
                          index={visibleFailurePoints.length + index}
                        />
                      ))}
                    </div>
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

            {allFailurePoints.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-400">No training drills available for this concept.</p>
              </div>
            )}

            {/* Custom Videos Section */}
            <div className="space-y-3 pt-2 border-t border-zinc-700/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-300">Reference Videos</p>
                <button
                  onClick={() => setShowAddVideo(!showAddVideo)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Video
                </button>
              </div>

              {/* Add Video Form */}
              {showAddVideo && (
                <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube or Instagram URL"
                    className="w-full bg-zinc-700 text-white text-xs rounded px-2 py-1.5 border border-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full bg-zinc-700 text-white text-xs rounded px-2 py-1.5 border border-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddVideo}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddVideo(false);
                        setVideoUrl('');
                        setVideoTitle('');
                      }}
                      className="flex-1 px-3 py-1.5 bg-zinc-700 text-zinc-300 text-xs font-medium rounded hover:bg-zinc-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Videos List */}
              {customVideos.length > 0 && (
                <div className="space-y-2">
                  {customVideos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-zinc-800 rounded border border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-700 transition-colors group"
                    >
                      {/* Platform Icon */}
                      {video.platform === 'youtube' ? (
                        <div className="flex-shrink-0 w-8 h-8 rounded bg-red-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 font-medium group-hover:text-blue-400 transition-colors truncate">
                          {video.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {video.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveVideo(video.id);
                        }}
                        className="p-1 rounded hover:bg-zinc-600 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </a>
                  ))}
                </div>
              )}

              {customVideos.length === 0 && !showAddVideo && (
                <p className="text-[10px] text-zinc-500 text-center py-2">
                  Add YouTube or Instagram videos for this concept
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700 bg-zinc-800/50">
        <p className="text-[10px] text-zinc-500 text-center">
          Click video links to view • Add your own reference videos
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
