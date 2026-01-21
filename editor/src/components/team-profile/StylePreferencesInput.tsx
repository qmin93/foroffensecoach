'use client';

import { Label } from '@/components/ui/label';
import {
  StylePreferences,
  PreferenceLevel,
  RunPassBalance,
  RiskTolerance,
} from '@/types/team-profile';

interface StylePreferencesInputProps {
  preferences: StylePreferences;
  onChange: <K extends keyof StylePreferences>(key: K, value: StylePreferences[K]) => void;
}

interface ToggleOptionProps<T extends string> {
  value: T;
  selected: T;
  onChange: (value: T) => void;
  label: string;
  description?: string;
}

function ToggleOption<T extends string>({
  value,
  selected,
  onChange,
  label,
  description,
}: ToggleOptionProps<T>) {
  const isSelected = value === selected;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10 text-white'
          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
      }`}
    >
      <div className="font-medium text-sm">{label}</div>
      {description && (
        <div className="text-xs mt-0.5 opacity-70">{description}</div>
      )}
    </button>
  );
}

export function StylePreferencesInput({ preferences, onChange }: StylePreferencesInputProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">Style Preferences</h3>
        <p className="text-sm text-zinc-400 mb-4">
          What kind of offense do you want to run?
        </p>
      </div>

      {/* Run/Pass Balance */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <Label className="text-white font-medium block mb-3">Run/Pass Balance</Label>
        <div className="flex gap-2">
          <ToggleOption<RunPassBalance>
            value="run_heavy"
            selected={preferences.runPassBalance}
            onChange={(v) => onChange('runPassBalance', v)}
            label="Run Heavy"
            description="60%+ run plays"
          />
          <ToggleOption<RunPassBalance>
            value="balanced"
            selected={preferences.runPassBalance}
            onChange={(v) => onChange('runPassBalance', v)}
            label="Balanced"
            description="50/50 split"
          />
          <ToggleOption<RunPassBalance>
            value="pass_heavy"
            selected={preferences.runPassBalance}
            onChange={(v) => onChange('runPassBalance', v)}
            label="Pass Heavy"
            description="60%+ pass plays"
          />
        </div>
      </div>

      {/* Under Center Usage */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <Label className="text-white font-medium block mb-3">Under Center Usage</Label>
        <p className="text-xs text-zinc-500 mb-3">How often do you want QB under center vs shotgun?</p>
        <div className="flex gap-2">
          <ToggleOption<PreferenceLevel>
            value="low"
            selected={preferences.underCenterUsage}
            onChange={(v) => onChange('underCenterUsage', v)}
            label="Low"
            description="Mostly shotgun"
          />
          <ToggleOption<PreferenceLevel>
            value="medium"
            selected={preferences.underCenterUsage}
            onChange={(v) => onChange('underCenterUsage', v)}
            label="Medium"
            description="Mix of both"
          />
          <ToggleOption<PreferenceLevel>
            value="high"
            selected={preferences.underCenterUsage}
            onChange={(v) => onChange('underCenterUsage', v)}
            label="High"
            description="Mostly under center"
          />
        </div>
      </div>

      {/* Motion Usage */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <Label className="text-white font-medium block mb-3">Pre-Snap Motion</Label>
        <p className="text-xs text-zinc-500 mb-3">How much motion do you want to use?</p>
        <div className="flex gap-2">
          <ToggleOption<PreferenceLevel>
            value="low"
            selected={preferences.motionUsage}
            onChange={(v) => onChange('motionUsage', v)}
            label="Low"
            description="Simple, static"
          />
          <ToggleOption<PreferenceLevel>
            value="medium"
            selected={preferences.motionUsage}
            onChange={(v) => onChange('motionUsage', v)}
            label="Medium"
            description="Some motion"
          />
          <ToggleOption<PreferenceLevel>
            value="high"
            selected={preferences.motionUsage}
            onChange={(v) => onChange('motionUsage', v)}
            label="High"
            description="Motion-heavy"
          />
        </div>
      </div>

      {/* Tempo */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <Label className="text-white font-medium block mb-3">Offensive Tempo</Label>
        <p className="text-xs text-zinc-500 mb-3">How fast do you want to play?</p>
        <div className="flex gap-2">
          <ToggleOption<PreferenceLevel>
            value="low"
            selected={preferences.tempo}
            onChange={(v) => onChange('tempo', v)}
            label="Slow"
            description="Control the clock"
          />
          <ToggleOption<PreferenceLevel>
            value="medium"
            selected={preferences.tempo}
            onChange={(v) => onChange('tempo', v)}
            label="Normal"
            description="Standard pace"
          />
          <ToggleOption<PreferenceLevel>
            value="high"
            selected={preferences.tempo}
            onChange={(v) => onChange('tempo', v)}
            label="Fast"
            description="Up-tempo"
          />
        </div>
      </div>

      {/* Risk Tolerance */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <Label className="text-white font-medium block mb-3">Risk Tolerance</Label>
        <p className="text-xs text-zinc-500 mb-3">How aggressive do you want to be?</p>
        <div className="flex gap-2">
          <ToggleOption<RiskTolerance>
            value="conservative"
            selected={preferences.riskTolerance}
            onChange={(v) => onChange('riskTolerance', v)}
            label="Conservative"
            description="Protect the ball"
          />
          <ToggleOption<RiskTolerance>
            value="normal"
            selected={preferences.riskTolerance}
            onChange={(v) => onChange('riskTolerance', v)}
            label="Balanced"
            description="Calculated risks"
          />
          <ToggleOption<RiskTolerance>
            value="aggressive"
            selected={preferences.riskTolerance}
            onChange={(v) => onChange('riskTolerance', v)}
            label="Aggressive"
            description="Push the limits"
          />
        </div>
      </div>
    </div>
  );
}
