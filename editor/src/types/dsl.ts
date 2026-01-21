// ForOffenseCoach DSL Types v1.0

// ============================================
// Base Entity (DSL Specification 2.3)
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: string;   // ISO-8601
  updatedAt: string;   // ISO-8601
  createdBy?: string;  // userId (optional for local-only plays)
  updatedBy?: string;  // userId
}

// ============================================
// Common Types
// ============================================

export interface Point {
  x: number; // 0.0 ~ 1.0 (normalized)
  y: number; // -1.0 ~ +1.0 (LOS = 0)
}

export type PlayerShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'x_mark' | 'football';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type PathType = 'straight' | 'quadratic' | 'bezier' | 'tension';
export type EndMarker = 'arrow' | 'none' | 'circle' | 't_block';
export type EditorMode = 'select' | 'draw' | 'text';
export type DrawLineType = 'straight' | 'curved' | 'angular';

// Drawing configuration for unified draw mode
export interface DrawingConfig {
  lineType: DrawLineType;
  lineStyle: LineStyle;
  endMarker: EndMarker;
}

// Drawing state phases
// angular_drawing: multi-point drawing mode for angular routes (click to add points, double-click or Enter to finish)
export type DrawingPhase = 'idle' | 'start_selected' | 'end_selected' | 'adjusting_curve' | 'angular_drawing';

// ============================================
// Player Types
// ============================================

export interface PlayerAppearance {
  shape: PlayerShape;
  fill: string;        // HEX color
  stroke: string;      // HEX color
  strokeWidth: number;
  radius: number;      // pixels
  labelColor: string;
  labelFontSize: number;
  showLabel: boolean;
}

export interface PlayerAlignment {
  x: number;
  y: number;
  facing?: 'up' | 'down' | 'left' | 'right';
  stance?: 'two_point' | 'three_point' | 'none';
  splitPreset?: 'wide' | 'normal' | 'reduced' | 'slot';
}

export interface Player {
  id: string;
  role: string;        // QB, RB, WR, TE, etc.
  label: string;
  unit: 'offense' | 'defense' | 'special';
  alignment: PlayerAlignment;
  appearance: PlayerAppearance;
  lock?: {
    positionLocked: boolean;
  };
}

// ============================================
// Action Types
// ============================================

export interface ActionStyle {
  stroke: string;
  strokeWidth: number;
  lineStyle: LineStyle;
  endMarker: EndMarker;
}

export interface RouteAction {
  id: string;
  actionType: 'route';
  fromPlayerId: string;
  route: {
    pattern: string;   // slant, go, curl, etc.
    depth?: number;
    breakAngleDeg?: number;
    direction?: 'inside' | 'outside' | 'none';
    controlPoints: Point[];
    pathType: PathType;
    tension?: number;  // for tension curves (0-1)
  };
  style: ActionStyle;
  layer?: 'primary' | 'secondary' | 'alt';
}

export interface BlockAction {
  id: string;
  actionType: 'block';
  fromPlayerId: string;
  block: {
    scheme: string;    // pull_kick, down, reach, etc.
    target?: {
      toPlayerId?: string;
      landmark?: Point;
    };
    pathPoints: Point[];
    pathType: PathType;
    tension?: number;
    notes?: string;
  };
  style: ActionStyle;
  layer?: 'primary' | 'secondary' | 'alt';
}

export interface MotionAction {
  id: string;
  actionType: 'motion';
  fromPlayerId: string;
  motion: {
    motionType: string;  // jet, orbit, shift, etc.
    pathPoints: Point[];
    pathType: PathType;
    tension?: number;
    endAlignment?: Point;
  };
  style: ActionStyle;
  timing?: {
    phase: 'pre_snap' | 'post_snap';
  };
}

export interface LandmarkAction {
  id: string;
  actionType: 'landmark';
  landmark: {
    kind: 'aim_point' | 'read_key' | 'landmark' | 'cone' | 'alert';
    label?: string;
    x: number;
    y: number;
  };
  style: {
    fill: string;
    stroke: string;
    size: 'small' | 'medium' | 'large';
  };
}

export interface TextAction {
  id: string;
  actionType: 'text';
  text: {
    value: string;
    x: number;
    y: number;
    width?: number;
    align?: 'left' | 'center' | 'right';
  };
  style: {
    fontSize: number;
    fontColor: string;
    backgroundColor?: string;
    showBox: boolean;
  };
}

export type Action = RouteAction | BlockAction | MotionAction | LandmarkAction | TextAction;

// ============================================
// Play Types
// ============================================

export interface PlayMeta {
  personnel?: string;    // "11", "12", "21", etc.
  unit: 'offense' | 'defense' | 'special';
  strength?: 'left' | 'right' | 'none';
  formationId?: string;
  conceptId?: string;
  nflStyle?: boolean;
}

export interface PlayField {
  orientation: 'up' | 'down';
  showGrid: boolean;
  showHash: boolean;
  showYardLines: boolean;
  backgroundColor: string;
  lineColor: string;
}

export interface PlayNotes {
  callName?: string;
  coachingPoints: string[];
}

export interface PlayHistory {
  version: number;
  derivedFrom?: {
    sourcePlayId?: string | null;
    sourceConceptId?: string | null;
    sourceTeamId?: string | null;
  };
}

export interface Play extends BaseEntity {
  schemaVersion: string;
  type: 'play';
  name: string;
  description?: string;
  tags: string[];
  meta: PlayMeta;
  field: PlayField;
  roster: {
    players: Player[];
  };
  actions: Action[];
  notes: PlayNotes;
  history?: PlayHistory;
  // Auth & Workspace fields (Phase 1)
  workspaceId?: string;
  playbookId?: string;
}

// ============================================
// Formation Types
// ============================================

export interface FormationMeta {
  personnelHint: string[];
  structure: string;
  strength: 'left' | 'right' | 'none';
}

export interface Formation {
  schemaVersion: string;
  type: 'formation';
  id: string;
  name: string;
  meta: FormationMeta;
  defaults: {
    players: Omit<Player, 'id'>[];
    snapRules?: {
      olSpacingPreset: 'standard' | 'tight' | 'wide';
      wrSplitPreset: 'wide' | 'normal' | 'reduced' | 'slot';
      lockCenterToHash: boolean;
    };
  };
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_PLAYER_APPEARANCE: PlayerAppearance = {
  shape: 'square',
  fill: '#ffffff',    // white fill
  stroke: '#000000',  // black border
  strokeWidth: 2,
  radius: 18,
  labelColor: '#000000',
  labelFontSize: 11,
  showLabel: true,
};

export const DEFAULT_ACTION_STYLE: ActionStyle = {
  stroke: '#000000',
  strokeWidth: 2,
  lineStyle: 'solid',
  endMarker: 'arrow',
};

export const DEFAULT_MOTION_STYLE: ActionStyle = {
  stroke: '#000000',
  strokeWidth: 2,
  lineStyle: 'dashed',
  endMarker: 'none',
};

export const DEFAULT_PLAY_FIELD: PlayField = {
  orientation: 'up',
  showGrid: true,
  showHash: true,
  showYardLines: true,
  backgroundColor: '#ffffff',
  lineColor: '#000000',
};

export const DEFAULT_DRAWING_CONFIG: DrawingConfig = {
  lineType: 'straight',
  lineStyle: 'solid',
  endMarker: 'arrow',
};

// ============================================
// Playbook Types (DSL Specification 4.2)
// ============================================

export interface PlaybookSection {
  id: string;
  name: string;  // "Run", "Pass", "RPO", "Special"
  playIds: string[];
}

export interface ExportSettings {
  pageStyle: 'classic' | 'modern' | 'minimal';
  includeNotes: boolean;
  includeGrid: boolean;
  footer: 'playName+page' | 'pageOnly' | 'none';
}

export interface Playbook extends BaseEntity {
  schemaVersion: string;
  type: 'playbook';
  name: string;
  tags: string[];
  sections: PlaybookSection[];
  exportSettings: ExportSettings;
  workspaceId: string;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  pageStyle: 'classic',
  includeNotes: true,
  includeGrid: false,
  footer: 'playName+page',
};
