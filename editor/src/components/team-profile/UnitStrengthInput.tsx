'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { UnitStrength, QualityRating } from '@/types/team-profile';

interface UnitStrengthInputProps {
  strength: UnitStrength;
  onChange: (key: keyof UnitStrength, value: QualityRating) => void;
}

interface StrengthCategory {
  title: string;
  items: Array<{
    key: keyof UnitStrength;
    label: string;
    description: string;
  }>;
}

const STRENGTH_CATEGORIES: StrengthCategory[] = [
  {
    title: 'Offensive Line',
    items: [
      { key: 'olRunBlock', label: 'Run Blocking', description: 'Creating running lanes' },
      { key: 'olPassPro', label: 'Pass Protection', description: 'Keeping QB clean' },
    ],
  },
  {
    title: 'Running Backs',
    items: [
      { key: 'rbVision', label: 'Vision', description: 'Finding holes' },
      { key: 'rbPower', label: 'Power', description: 'Breaking tackles' },
    ],
  },
  {
    title: 'Wide Receivers',
    items: [
      { key: 'wrSeparation', label: 'Separation', description: 'Getting open' },
      { key: 'wrCatch', label: 'Hands', description: 'Catching ability' },
    ],
  },
  {
    title: 'Quarterback',
    items: [
      { key: 'qbArm', label: 'Arm Strength', description: 'Throwing power' },
      { key: 'qbDecision', label: 'Decision Making', description: 'Reading defenses' },
      { key: 'qbMobility', label: 'Mobility', description: 'Scrambling ability' },
    ],
  },
  {
    title: 'Tight Ends',
    items: [
      { key: 'teBlock', label: 'Blocking', description: 'Inline blocking' },
      { key: 'teRoute', label: 'Route Running', description: 'Receiving skills' },
    ],
  },
];

const RATING_COLORS: Record<QualityRating, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-lime-500',
  5: 'bg-green-500',
};

const RATING_LABELS: Record<QualityRating, string> = {
  1: 'Poor',
  2: 'Below Avg',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

export function UnitStrengthInput({ strength, onChange }: UnitStrengthInputProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">Unit Strength</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Rate your team's abilities in key areas (1-5 scale)
        </p>
      </div>

      <div className="space-y-6">
        {STRENGTH_CATEGORIES.map((category) => (
          <div key={category.title} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-zinc-300 mb-4">{category.title}</h4>

            <div className="space-y-4">
              {category.items.map((item) => {
                const value = strength[item.key];

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label className="text-white text-sm">{item.label}</Label>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${RATING_COLORS[value]}`} />
                        <span className="text-sm font-medium text-white w-20 text-right">
                          {RATING_LABELS[value]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => onChange(item.key, v as QualityRating)}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-white w-6 text-center">{value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
