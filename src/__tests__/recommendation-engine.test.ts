import { describe, it, expect } from 'vitest';
import {
  getRecommendations,
  buildFormationContext,
  searchConcepts,
  getPassConceptsByCategory,
  getRunConceptsByCategory,
} from '@/lib/recommendation-engine';

describe('Recommendation Engine', () => {
  describe('buildFormationContext', () => {
    it('should count receivers correctly', () => {
      const players = [
        { role: 'X', alignment: { x: 0.1, y: 0 } },
        { role: 'Y', alignment: { x: 0.35, y: 0 } },
        { role: 'Z', alignment: { x: 0.9, y: 0 } },
        { role: 'H', alignment: { x: 0.2, y: 0 } },
      ];

      const context = buildFormationContext(undefined, players);
      expect(context.receiverCount).toBe(4);
    });

    it('should detect tight end', () => {
      const playersWithTE = [
        { role: 'X', alignment: { x: 0.1, y: 0 } },
        { role: 'Y', alignment: { x: 0.35, y: 0 } },
      ];
      const playersWithoutTE = [
        { role: 'X', alignment: { x: 0.1, y: 0 } },
        { role: 'Z', alignment: { x: 0.9, y: 0 } },
      ];

      expect(buildFormationContext(undefined, playersWithTE).hasTightEnd).toBe(true);
      expect(buildFormationContext(undefined, playersWithoutTE).hasTightEnd).toBe(false);
    });

    it('should infer 3x1 structure', () => {
      const players = [
        { role: 'X', alignment: { x: 0.1, y: 0 } },
        { role: 'H', alignment: { x: 0.2, y: 0 } },
        { role: 'Y', alignment: { x: 0.3, y: 0 } },
        { role: 'Z', alignment: { x: 0.9, y: 0 } },
      ];

      const context = buildFormationContext(undefined, players);
      expect(context.structure).toBe('3x1');
    });

    it('should infer 2x2 structure', () => {
      const players = [
        { role: 'X', alignment: { x: 0.1, y: 0 } },
        { role: 'H', alignment: { x: 0.2, y: 0 } },
        { role: 'Y', alignment: { x: 0.8, y: 0 } },
        { role: 'Z', alignment: { x: 0.9, y: 0 } },
      ];

      const context = buildFormationContext(undefined, players);
      expect(context.structure).toBe('2x2');
    });

    it('should infer strength from TE position', () => {
      const playersRightTE = [
        { role: 'Y', alignment: { x: 0.65, y: 0 } },
      ];
      const playersLeftTE = [
        { role: 'TE', alignment: { x: 0.35, y: 0 } },
      ];

      expect(buildFormationContext(undefined, playersRightTE).strength).toBe('right');
      expect(buildFormationContext(undefined, playersLeftTE).strength).toBe('left');
    });
  });

  describe('getRecommendations', () => {
    it('should return up to 20 concepts', () => {
      const formation = buildFormationContext(undefined, [
        { role: 'QB', alignment: { x: 0.5, y: -0.14 } },
        { role: 'RB', alignment: { x: 0.42, y: -0.14 } },
        { role: 'X', alignment: { x: 0.1, y: -0.02 } },
        { role: 'Y', alignment: { x: 0.65, y: -0.02 } },
        { role: 'Z', alignment: { x: 0.9, y: -0.02 } },
        { role: 'H', alignment: { x: 0.2, y: -0.02 } },
      ]);

      const result = getRecommendations({ formation });
      expect(result.concepts.length).toBeLessThanOrEqual(20);
    });

    it('should filter by pass concepts when specified', () => {
      const formation = buildFormationContext(undefined, [
        { role: 'QB', alignment: { x: 0.5, y: -0.14 } },
        { role: 'X', alignment: { x: 0.1, y: -0.02 } },
        { role: 'Z', alignment: { x: 0.9, y: -0.02 } },
      ]);

      const result = getRecommendations({ formation, preferredType: 'pass' });
      result.concepts.forEach((concept) => {
        expect(concept.conceptType).toBe('pass');
      });
    });

    it('should filter by run concepts when specified', () => {
      const formation = buildFormationContext(undefined, [
        { role: 'QB', alignment: { x: 0.5, y: -0.06 } },
        { role: 'RB', alignment: { x: 0.5, y: -0.14 } },
        { role: 'Y', alignment: { x: 0.35, y: -0.02 } },
      ]);

      const result = getRecommendations({ formation, preferredType: 'run' });
      result.concepts.forEach((concept) => {
        expect(concept.conceptType).toBe('run');
      });
    });

    it('should include match scores', () => {
      const formation = buildFormationContext(undefined, [
        { role: 'X', alignment: { x: 0.1, y: -0.02 } },
        { role: 'Y', alignment: { x: 0.65, y: -0.02 } },
        { role: 'Z', alignment: { x: 0.9, y: -0.02 } },
      ]);

      const result = getRecommendations({ formation });
      result.concepts.forEach((concept) => {
        expect(concept.matchScore).toBeDefined();
        expect(typeof concept.matchScore).toBe('number');
        expect(concept.matchScore).toBeGreaterThanOrEqual(25);
      });
    });

    it('should provide filter counts', () => {
      const formation = buildFormationContext(undefined, [
        { role: 'X', alignment: { x: 0.1, y: -0.02 } },
        { role: 'Z', alignment: { x: 0.9, y: -0.02 } },
      ]);

      const result = getRecommendations({ formation });
      expect(result.filters).toBeDefined();
      expect(result.filters.byType).toBeDefined();
      expect(typeof result.filters.byType.pass).toBe('number');
      expect(typeof result.filters.byType.run).toBe('number');
    });
  });

  describe('searchConcepts', () => {
    it('should find concepts by name', () => {
      const results = searchConcepts('slant');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.name.toLowerCase().includes('slant'))).toBe(true);
    });

    it('should find concepts by summary', () => {
      const results = searchConcepts('quick');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchConcepts('mesh');
      const upperResults = searchConcepts('MESH');
      expect(lowerResults.length).toBe(upperResults.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchConcepts('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getPassConceptsByCategory', () => {
    it('should return only quick concepts', () => {
      const concepts = getPassConceptsByCategory('quick');
      concepts.forEach((c) => {
        expect(c.conceptType).toBe('pass');
        expect(c.suggestionHints.passHints?.category).toBe('quick');
      });
    });

    it('should return only flood concepts', () => {
      const concepts = getPassConceptsByCategory('flood');
      concepts.forEach((c) => {
        expect(c.conceptType).toBe('pass');
        expect(c.suggestionHints.passHints?.category).toBe('flood');
      });
    });
  });

  describe('getRunConceptsByCategory', () => {
    it('should return only inside zone concepts', () => {
      const concepts = getRunConceptsByCategory('inside_zone');
      concepts.forEach((c) => {
        expect(c.conceptType).toBe('run');
        expect(c.suggestionHints.runHints?.category).toBe('inside_zone');
      });
    });

    it('should return only power concepts', () => {
      const concepts = getRunConceptsByCategory('power');
      concepts.forEach((c) => {
        expect(c.conceptType).toBe('run');
        expect(c.suggestionHints.runHints?.category).toBe('power');
      });
    });
  });
});
