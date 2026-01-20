'use client';

import { useState, useEffect } from 'react';
import { useConceptStore } from '@/store/conceptStore';
import type { FrontType, ThreeTechPosition } from '@/types/concept';

interface SituationHeaderProps {
  onDefenseChange?: () => void;
}

export function SituationHeader({ onDefenseChange }: SituationHeaderProps) {
  // Down & Distance state
  const [down, setDown] = useState<1 | 2 | 3 | 4>(1);
  const [distance, setDistance] = useState<number>(10);
  const [fieldPosition, setFieldPosition] = useState<string>('OWN 25');

  // Play type toggle (Pass/Run)
  const [playType, setPlayType] = useState<'pass' | 'run'>('pass');

  // Defense state
  const [boxCount, setBoxCount] = useState<6 | 7 | 8>(7);
  const [front, setFront] = useState<FrontType>('even');
  const [threeTech, setThreeTech] = useState<ThreeTechPosition>('strong');
  const [shell, setShell] = useState<'1-high' | '2-high' | 'quarters'>('2-high');
  const [blitzTendency, setBlitzTendency] = useState<'low' | 'medium' | 'high'>('medium');

  // Concept store for defense context
  const setDefenseContext = useConceptStore((state) => state.setDefenseContext);
  const updateRecommendations = useConceptStore((state) => state.updateRecommendations);

  // Update defense context whenever defense settings change
  useEffect(() => {
    setDefenseContext({
      boxCount,
      front,
      threeTech,
      coverage: shell,
    });
    updateRecommendations();
    onDefenseChange?.();
  }, [boxCount, front, threeTech, shell, blitzTendency, setDefenseContext, updateRecommendations, onDefenseChange]);

  // Update play type preference in the concept store
  const setTypeFilter = useConceptStore((state) => state.setTypeFilter);

  // Sync play type to concept store filter
  useEffect(() => {
    setTypeFilter(playType);
  }, [playType, setTypeFilter]);

  return (
    <div className="bg-zinc-900 border-b border-zinc-700 px-2 md:px-4 py-2 overflow-x-auto">
      {/* Mobile: Two rows, Desktop: One row */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-max">

        {/* Row 1: Down & Distance + Situation Badge */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Down */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] md:text-xs text-zinc-400 font-medium">DOWN</span>
            <div className="flex gap-0.5">
              {([1, 2, 3, 4] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDown(d)}
                  className={`
                    w-6 h-6 md:w-7 md:h-7 rounded text-xs md:text-sm font-bold transition-colors
                    ${down === d
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <span className="text-zinc-500 text-sm">&</span>

          {/* Distance */}
          <select
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="bg-zinc-700 text-white text-xs md:text-sm rounded px-1.5 md:px-2 py-1 border border-zinc-600 focus:outline-none focus:border-orange-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 'Goal'].map((d) => (
              <option key={d} value={d === 'Goal' ? 0 : d}>
                {d === 'Goal' ? 'Goal' : d}
              </option>
            ))}
          </select>

          {/* Field Position */}
          <select
            value={fieldPosition}
            onChange={(e) => setFieldPosition(e.target.value)}
            className="bg-zinc-700 text-white text-xs md:text-sm rounded px-1.5 md:px-2 py-1 border border-zinc-600 focus:outline-none focus:border-orange-500 hidden md:block"
          >
            <optgroup label="Own">
              {['OWN 5', 'OWN 10', 'OWN 20', 'OWN 25', 'OWN 30', 'OWN 40'].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </optgroup>
            <optgroup label="Mid">
              <option value="50">50</option>
            </optgroup>
            <optgroup label="Opp">
              {['OPP 40', 'OPP 30', 'OPP 25', 'OPP 20', 'OPP 10', 'OPP 5', 'Red Zone'].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </optgroup>
          </select>

          {/* Situation Badge */}
          <div className="px-2 py-1 bg-zinc-800 rounded border border-zinc-600 flex items-center gap-1">
            <span className="text-orange-400 font-bold text-sm">{down}</span>
            <span className="text-zinc-500">&</span>
            <span className="text-white font-bold text-sm">{distance === 0 ? 'G' : distance}</span>
          </div>

          {/* Pass/Run Toggle Button */}
          <button
            onClick={() => setPlayType(playType === 'pass' ? 'run' : 'pass')}
            className={`
              px-2 py-1 rounded text-xs md:text-sm font-bold uppercase whitespace-nowrap transition-colors
              ${playType === 'pass'
                ? 'bg-blue-500 text-white hover:bg-blue-400'
                : 'bg-green-500 text-white hover:bg-green-400'
              }
            `}
          >
            {playType === 'pass' ? '🏈 Pass' : '🏃 Run'}
          </button>
        </div>

        <div className="hidden md:block w-px h-6 bg-zinc-600" />

        {/* Row 2: Defense Settings */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-[10px] md:text-xs text-red-400 font-medium uppercase">DEF</span>

          {/* Box Count */}
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-zinc-500 hidden md:inline">Box:</span>
            {([6, 7, 8] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBoxCount(b)}
                className={`
                  w-5 h-5 md:w-6 md:h-6 rounded text-[10px] md:text-xs font-bold transition-colors
                  ${boxCount === b
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }
                `}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Front */}
          <select
            value={front}
            onChange={(e) => setFront(e.target.value as FrontType)}
            className="bg-zinc-700 text-white text-[10px] md:text-xs rounded px-1 md:px-2 py-0.5 md:py-1 border border-zinc-600 focus:outline-none focus:border-red-500"
          >
            <option value="even">4-3</option>
            <option value="odd">3-4</option>
            <option value="bear">Bear</option>
            <option value="over">Over</option>
            <option value="under">Under</option>
          </select>

          {/* 3-Tech */}
          <select
            value={threeTech}
            onChange={(e) => setThreeTech(e.target.value as ThreeTechPosition)}
            className="bg-zinc-700 text-white text-[10px] md:text-xs rounded px-1 md:px-2 py-0.5 md:py-1 border border-zinc-600 focus:outline-none focus:border-red-500"
          >
            <option value="strong">3T-S</option>
            <option value="weak">3T-W</option>
            <option value="both">3T-B</option>
            <option value="none">No 3T</option>
          </select>

          {/* Shell */}
          <select
            value={shell}
            onChange={(e) => setShell(e.target.value as typeof shell)}
            className="bg-zinc-700 text-white text-[10px] md:text-xs rounded px-1 md:px-2 py-0.5 md:py-1 border border-zinc-600 focus:outline-none focus:border-red-500"
          >
            <option value="1-high">1-Hi</option>
            <option value="2-high">2-Hi</option>
            <option value="quarters">Qtr</option>
          </select>

          {/* Blitz */}
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-zinc-500 hidden md:inline">Blitz:</span>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setBlitzTendency(level)}
                className={`
                  px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs transition-colors
                  ${blitzTendency === level
                    ? level === 'high'
                      ? 'bg-red-600 text-white'
                      : level === 'medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-green-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }
                `}
              >
                {level === 'low' ? 'L' : level === 'medium' ? 'M' : 'H'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
