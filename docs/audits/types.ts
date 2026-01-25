/**
 * Audit Type Definitions
 * Used by concept-lint.ts and audit files
 */

export type Side = 'strength' | 'weak' | 'either';

export interface FormationPreset {
  id: string;
  name: string;
  structure: string;
  personnel: string;
  tags?: string[];
  positions: Record<string, string>;
}

export interface PassConcept {
  id: string;
  name: string;
  family?: string;
  dropType?: '3_step' | '5_step' | '7_step';
  appliesTo?: string[];
  summary?: string;
  routes?: Record<string, { type: string; depth?: number }>;
  progression?: string;
}

export interface RunConceptRequirements {
  needsTE?: boolean;
  needsPuller?: 'none' | 'G' | 'GT' | 'T' | 'any';
  boxTolerance?: string;
  preferredStructures?: string[];
  personnelHints?: string[];
}

export interface RunConceptRole {
  roleName: string;
  appliesTo: string[];
  defaultBlock?: { scheme?: string; target?: string };
  notes?: string;
}

export interface RunConceptTemplate {
  roles?: RunConceptRole[];
  buildPolicy?: {
    defaultSide?: Side;
    placementStrategy?: string;
    conflictPolicy?: string;
    runLandmarks?: boolean;
  };
}

export interface RunConcept {
  schemaVersion?: string;
  type?: string;
  id: string;
  name: string;
  conceptType?: 'run' | string;
  appliesTo?: string[];
  summary?: string;
  badges?: string[];
  requirements?: RunConceptRequirements;
  template?: RunConceptTemplate;
  suggestionHints?: unknown;
}
