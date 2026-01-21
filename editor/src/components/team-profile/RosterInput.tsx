'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  RosterAvailability,
  PositionAvailability,
  QualityRating,
} from '@/types/team-profile';

interface RosterInputProps {
  roster: RosterAvailability;
  onChange: (position: keyof RosterAvailability, data: PositionAvailability) => void;
}

const POSITION_INFO: Record<keyof RosterAvailability, { label: string; maxCount: number; description: string }> = {
  QB: { label: 'Quarterbacks', maxCount: 4, description: 'Signal callers' },
  RB: { label: 'Running Backs', maxCount: 6, description: 'Ball carriers' },
  FB: { label: 'Fullbacks', maxCount: 3, description: 'Lead blockers' },
  WR: { label: 'Wide Receivers', maxCount: 8, description: 'Pass catchers' },
  TE: { label: 'Tight Ends', maxCount: 5, description: 'Hybrid players' },
  OL: { label: 'Offensive Linemen', maxCount: 12, description: 'Protection & run blocking' },
};

const QUALITY_LABELS: Record<QualityRating, string> = {
  1: 'Developing',
  2: 'Below Avg',
  3: 'Average',
  4: 'Above Avg',
  5: 'Elite',
};

export function RosterInput({ roster, onChange }: RosterInputProps) {
  const handleCountChange = (position: keyof RosterAvailability, count: number) => {
    onChange(position, {
      ...roster[position],
      count,
    });
  };

  const handleQualityChange = (position: keyof RosterAvailability, quality: QualityRating) => {
    onChange(position, {
      ...roster[position],
      starterQuality: quality,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">Roster Availability</h3>
        <p className="text-sm text-zinc-400 mb-4">
          How many players do you have at each position and how good are your starters?
        </p>
      </div>

      <div className="grid gap-4">
        {(Object.keys(POSITION_INFO) as Array<keyof RosterAvailability>).map((position) => {
          const info = POSITION_INFO[position];
          const data = roster[position];

          return (
            <div
              key={position}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-white font-medium">{info.label}</Label>
                  <p className="text-xs text-zinc-500">{info.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{data.count}</span>
                  <span className="text-zinc-500 text-sm ml-1">players</span>
                </div>
              </div>

              {/* Count Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Count</span>
                  <span>{data.count} / {info.maxCount}</span>
                </div>
                <Slider
                  value={[data.count]}
                  onValueChange={([value]) => handleCountChange(position, value)}
                  min={0}
                  max={info.maxCount}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Quality Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Starter Quality</span>
                  <span className={`font-medium ${
                    data.starterQuality >= 4 ? 'text-green-400' :
                    data.starterQuality >= 3 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {QUALITY_LABELS[data.starterQuality]}
                  </span>
                </div>
                <Slider
                  value={[data.starterQuality]}
                  onValueChange={([value]) => handleQualityChange(position, value as QualityRating)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
