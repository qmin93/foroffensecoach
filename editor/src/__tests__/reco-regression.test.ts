// reco-regression.test.ts
// Recommendation regression test - Top5 + Assignment validation

import { describe, it, expect } from 'vitest';

import { loadSnapshots, recommendTop5, toPassConcept, toRunConcept } from './_recoAdapter';
import { formatAssignments } from '@/lib/assignment-formatter';

// Concept registries
import { PASS_CONCEPTS } from '@/data/concepts/pass-concepts';
import { RUN_CONCEPTS } from '@/data/concepts/run-concepts';

// Formation library for context
import { FORMATION_LIBRARY, FormationMeta } from '@/data/formation-library';
import type { FormationPreset } from '@/lib/assignment-formatter';

function findPassConcept(id: string) {
  return PASS_CONCEPTS.find((c) => c.id === id);
}

function findRunConcept(id: string) {
  return RUN_CONCEPTS.find((c) => c.id === id);
}

function findFormation(id: string) {
  return FORMATION_LIBRARY?.find((f) => f.id === id);
}

// Convert FormationMeta to FormationPreset for assignment-formatter
function toFormationPreset(meta: FormationMeta | undefined): FormationPreset | undefined {
  if (!meta) return undefined;
  return {
    id: meta.id,
    name: meta.name,
    structure: meta.shotgunCompatible ? 'shotgun' : meta.underCenterCompatible ? 'under_center' : 'pistol',
    personnel: meta.personnel[0] ?? '11',
    tags: meta.tags,
    positions: {}, // Basic mapping - can be enhanced
  };
}

function values(obj: Record<string, string | undefined>) {
  return Object.values(obj).filter(Boolean) as string[];
}

describe('Reco regression (Top5 + assignment)', () => {
  it('all snapshots should produce sane top5 and valid assignments', async () => {
    const snapshots = loadSnapshots();

    for (const snap of snapshots) {
      const top5 = await recommendTop5(snap);

      // 1) Top5 basic validation
      expect(top5, `[${snap.id}] top5 should exist`).toBeTruthy();
      expect(top5.length, `[${snap.id}] top5 length`).toBeGreaterThan(0);
      expect(top5.length, `[${snap.id}] top5 length`).toBeLessThanOrEqual(5);

      // 2) Score sanity check
      const scores = top5.map((x) => x.score);
      // Scores should be positive (engine uses base 50 + bonuses, can exceed 100)
      expect(scores[0], `[${snap.id}] score should be positive`).toBeGreaterThan(0);

      // 3) Kind should match tendency
      const expectedKind = snap.tendency === 'PASS' ? 'pass' : 'run';
      expect(
        top5[0].kind,
        `[${snap.id}] top1 kind should match tendency`,
      ).toBe(expectedKind);

      // 4) Assignment generation + format validation
      const formationMeta = findFormation(snap.formationId);
      const formationPreset = toFormationPreset(formationMeta);

      for (const rec of top5) {
        if (rec.kind === 'pass') {
          const concept = findPassConcept(rec.id);
          expect(concept, `[${snap.id}] missing PASS concept: ${rec.id}`).toBeTruthy();

          if (!concept) continue;

          // Convert to audit format for assignment-formatter
          const passConcept = toPassConcept(concept);

          const a = formatAssignments({
            kind: 'pass',
            concept: passConcept,
            formation: formationPreset,
          });

          const lines = values(a as Record<string, string | undefined>);

          // Minimum: QB line should be present at least
          expect(lines.length, `[${snap.id}] pass assignment lines`).toBeGreaterThanOrEqual(1);

          // Line length limit: prevent overly long text
          for (const line of lines) {
            expect(line.length, `[${snap.id}] pass line too long: "${line}"`).toBeLessThanOrEqual(95);
          }
        }

        if (rec.kind === 'run') {
          const concept = findRunConcept(rec.id);
          expect(concept, `[${snap.id}] missing RUN concept: ${rec.id}`).toBeTruthy();

          if (!concept) continue;

          // Convert to audit format for assignment-formatter
          const runConcept = toRunConcept(concept);

          const a = formatAssignments({
            kind: 'run',
            concept: runConcept,
            formation: formationPreset,
          });

          const lines = values(a as Record<string, string | undefined>);

          // Minimum: RB/QB aiming line should be present
          expect(lines.length, `[${snap.id}] run assignment lines`).toBeGreaterThanOrEqual(1);

          for (const line of lines) {
            expect(line.length, `[${snap.id}] run line too long: "${line}"`).toBeLessThanOrEqual(95);
          }
        }
      }
    }
  });
});
