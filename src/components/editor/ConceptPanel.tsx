'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useConceptStore } from '@/store/conceptStore';
import { useEditorStore } from '@/store/editorStore';
import { ConceptCard } from './ConceptCard';
import { buildFormationContext, getRecommendations } from '@/lib/recommendation-engine';
import { PASS_CATEGORIES, RUN_CATEGORIES, CATEGORY_LABELS } from '@/types/concept';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { ConceptCardData } from '@/types/concept';

interface ConceptPanelProps {
  onApplyConcept: (conceptId: string) => void;
  onOpenInstallFocus?: () => void;
}

export function ConceptPanel({ onApplyConcept, onOpenInstallFocus }: ConceptPanelProps) {
  const isPanelOpen = useConceptStore((state) => state.isPanelOpen);
  const activeTab = useConceptStore((state) => state.activeTab);
  const setActiveTab = useConceptStore((state) => state.setActiveTab);
  const filters = useConceptStore((state) => state.filters);
  const setTypeFilter = useConceptStore((state) => state.setTypeFilter);
  const setCategoryFilter = useConceptStore((state) => state.setCategoryFilter);
  const setSearchQuery = useConceptStore((state) => state.setSearchQuery);
  const selectedConceptId = useConceptStore((state) => state.selectedConceptId);
  const hoveredConceptId = useConceptStore((state) => state.hoveredConceptId);
  const selectConcept = useConceptStore((state) => state.selectConcept);
  const hoverConcept = useConceptStore((state) => state.hoverConcept);
  const closePanel = useConceptStore((state) => state.closePanel);
  const getFilteredConcepts = useConceptStore((state) => state.getFilteredConcepts);

  // Get players from editor store
  const players = useEditorStore((state) => state.play.roster.players);

  // Build formation context from current players
  const formationContext = useMemo(() => {
    if (players.length === 0) return null;
    return buildFormationContext(
      undefined,
      players.map((p) => ({ role: p.role, alignment: p.alignment }))
    );
  }, [players]);

  // Get recommendations based on current formation
  const recommendations = useMemo(() => {
    if (!formationContext) return { concepts: [], totalMatches: 0, filters: { byType: { pass: 0, run: 0 }, byCategory: {} } };

    return getRecommendations({
      formation: formationContext,
      defense: undefined, // TODO: Add defense context input
      preferredType: activeTab === 'recommended' ? undefined : activeTab,
    });
  }, [formationContext, activeTab]);

  // Get concepts to display based on tab
  const displayConcepts: ConceptCardData[] = useMemo(() => {
    if (activeTab === 'recommended') {
      return recommendations.concepts;
    }

    // Filter concepts by tab type
    const filtered = getFilteredConcepts().filter((c) => c.conceptType === activeTab);

    return filtered.map((c) => ({
      id: c.id,
      name: c.name,
      conceptType: c.conceptType,
      category:
        c.conceptType === 'pass'
          ? c.suggestionHints.passHints?.category ?? 'quick'
          : c.suggestionHints.runHints?.category ?? 'inside_zone',
      summary: c.summary,
      badges: c.badges ?? [],
    }));
  }, [activeTab, recommendations, getFilteredConcepts, filters.category, filters.searchQuery]);

  // Handle apply
  const handleApply = useCallback(
    (conceptId: string) => {
      onApplyConcept(conceptId);
      selectConcept(null);
    },
    [onApplyConcept, selectConcept]
  );

  const categories = activeTab === 'pass' ? PASS_CATEGORIES : activeTab === 'run' ? RUN_CATEGORIES : [];

  // Footer content
  const footerContent = (
    <div className="space-y-2">
      {onOpenInstallFocus && (
        <button
          onClick={onOpenInstallFocus}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium">Install Focus</span>
        </button>
      )}
      <p className="text-[10px] text-zinc-500 text-center">
        Click a concept to preview • Apply to add routes/blocks
      </p>
    </div>
  );

  return (
    <BottomSheet
      isOpen={isPanelOpen}
      onClose={closePanel}
      title="Concepts"
      footer={footerContent}
    >
      {/* Tabs */}
      <div className="flex border-b border-zinc-700">
        {(['recommended', 'pass', 'run'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium capitalize transition-colors
              ${activeTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-white'
              }
            `}
          >
            {tab === 'recommended' ? 'For You' : tab}
          </button>
        ))}
      </div>

      {/* Formation Context Info */}
      {activeTab === 'recommended' && formationContext && (
        <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-700 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-300">Current:</span>
            <span>{formationContext.structure || 'Custom'}</span>
            <span>•</span>
            <span>{formationContext.receiverCount} WR</span>
            {formationContext.hasTightEnd && (
              <>
                <span>•</span>
                <span>TE</span>
              </>
            )}
          </div>
          <p className="mt-1 text-zinc-500">
            {recommendations.totalMatches} concepts match your formation
          </p>
        </div>
      )}

      {/* Category Filter (for pass/run tabs) */}
      {activeTab !== 'recommended' && categories.length > 0 && (
        <div className="px-3 py-2 border-b border-zinc-700">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.category === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filters.category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Search concepts..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Concept List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayConcepts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            {players.length === 0 ? (
              <>
                <p>Add players to your formation</p>
                <p className="mt-1">to see concept recommendations</p>
              </>
            ) : (
              <p>No concepts match your filters</p>
            )}
          </div>
        ) : (
          displayConcepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              isSelected={selectedConceptId === concept.id}
              isHovered={hoveredConceptId === concept.id}
              onSelect={selectConcept}
              onHover={hoverConcept}
              onApply={handleApply}
            />
          ))
        )}
      </div>
    </BottomSheet>
  );
}

export default ConceptPanel;
