'use client';

import { useState, useMemo } from 'react';
import { useTeamProfileStore } from '@/store/teamProfileStore';
import {
  recommendFormations,
  validateProfileForRecommendation,
  FormationRecommendation,
} from '@/lib/formation-recommendation';
import { FormationPackageCard } from './FormationPackageCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type FilterStyle = 'all' | 'run' | 'pass' | 'balanced';

interface FormationRecommendPanelProps {
  onSelectFormation?: (formationId: string) => void;
  selectedFormationId?: string;
}

export function FormationRecommendPanel({
  onSelectFormation,
  selectedFormationId,
}: FormationRecommendPanelProps) {
  const { profile } = useTeamProfileStore();
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('all');

  // Validate profile
  const validation = useMemo(
    () => validateProfileForRecommendation(profile),
    [profile]
  );

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!validation.valid) return [];

    const tagMap: Record<FilterStyle, string[]> = {
      all: [],
      run: ['power', 'run-heavy', 'run-focused'],
      pass: ['pass-heavy', 'pass-friendly', 'spread', 'pass-only'],
      balanced: ['balanced', 'versatile'],
    };

    return recommendFormations(profile, {
      limit: 5,
      filterTags: tagMap[filterStyle],
    });
  }, [profile, filterStyle, validation.valid]);

  // Profile incomplete state
  if (!validation.valid) {
    return (
      <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700">
        <div className="p-4 border-b border-zinc-700">
          <h3 className="font-semibold text-white">Formation Recommendations</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h4 className="text-white font-medium mb-2">Complete Team Profile</h4>
          <p className="text-sm text-zinc-400 mb-4">
            Set up your team profile to get personalized formation recommendations.
          </p>
          {validation.issues.length > 0 && (
            <ul className="text-xs text-orange-400 mb-4 text-left">
              {validation.issues.map((issue, idx) => (
                <li key={idx}>• {issue}</li>
              ))}
            </ul>
          )}
          <Link href="/team-profile">
            <Button className="bg-blue-600 hover:bg-blue-500">
              Set Up Team Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Formation Recommendations</h3>
          <Link href="/team-profile">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Team Name */}
        <div className="text-sm text-zinc-400 mb-3">
          For: <span className="text-white">{profile.teamName || 'Your Team'}</span>
        </div>

        {/* Style Filter */}
        <div className="flex gap-1">
          {(['all', 'run', 'pass', 'balanced'] as FilterStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setFilterStyle(style)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStyle === style
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {style === 'all' ? 'All' : style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <p className="text-sm">No formations match your criteria.</p>
            <p className="text-xs mt-1">Try adjusting the filter or your team profile.</p>
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <FormationPackageCard
              key={rec.formation.id}
              recommendation={rec}
              rank={idx + 1}
              onSelect={onSelectFormation}
              isSelected={selectedFormationId === rec.formation.id}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-700 bg-zinc-800/50">
        <div className="text-xs text-zinc-500">
          <p>Recommendations based on your team profile:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-zinc-400">
              {profile.stylePreferences.runPassBalance.replace('_', ' ')}
            </span>
            <span>•</span>
            <span className="text-zinc-400">
              {profile.stylePreferences.tempo} tempo
            </span>
            <span>•</span>
            <span className="text-zinc-400">
              {profile.stylePreferences.riskTolerance} risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
