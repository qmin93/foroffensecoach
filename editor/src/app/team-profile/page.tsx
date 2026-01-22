'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamProfileStore } from '@/store/teamProfileStore';
import { RosterInput } from '@/components/team-profile/RosterInput';
import { UnitStrengthInput } from '@/components/team-profile/UnitStrengthInput';
import { StylePreferencesInput } from '@/components/team-profile/StylePreferencesInput';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'roster' | 'strength' | 'style';

const STEPS: { key: Step; label: string; description: string }[] = [
  { key: 'roster', label: 'Roster', description: 'Player availability' },
  { key: 'strength', label: 'Strength', description: 'Unit capabilities' },
  { key: 'style', label: 'Style', description: 'Preferences' },
];

export default function TeamProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('roster');

  const {
    profile,
    setTeamName,
    setRosterAvailability,
    setUnitStrength,
    setStylePreference,
    saveProfile,
  } = useTeamProfileStore();

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].key);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key);
    }
  };

  const handleComplete = () => {
    saveProfile();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Team Profile Setup</h1>
              <p className="text-sm text-muted-foreground">
                Help us recommend the best formations for your team
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(step.key)}
                className={`flex items-center gap-3 ${
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.key === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStepIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Team Name (always visible) */}
        {currentStep === 'roster' && (
          <div className="mb-8 bg-card border border-border rounded-lg p-4">
            <Label className="text-foreground font-medium block mb-2">Team Name</Label>
            <Input
              value={profile.teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              className="bg-background border-border text-foreground text-lg"
            />
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'roster' && (
          <RosterInput
            roster={profile.rosterAvailability}
            onChange={setRosterAvailability}
          />
        )}

        {currentStep === 'strength' && (
          <UnitStrengthInput
            strength={profile.unitStrength}
            onChange={setUnitStrength}
          />
        )}

        {currentStep === 'style' && (
          <StylePreferencesInput
            preferences={profile.stylePreferences}
            onChange={setStylePreference}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>

          {currentStepIndex < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Complete Setup
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
