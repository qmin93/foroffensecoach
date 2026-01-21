import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import {
  Play,
  Player,
  Action,
  EditorMode,
  Point,
  DEFAULT_PLAYER_APPEARANCE,
  DEFAULT_ACTION_STYLE,
  DEFAULT_PLAY_FIELD,
  DEFAULT_DRAWING_CONFIG,
  RouteAction,
  BlockAction,
  MotionAction,
  PlayerAppearance,
  PlayerShape,
  DrawingConfig,
  DrawingPhase,
  DrawLineType,
  LineStyle,
  EndMarker,
} from '@/types/dsl';
import { getConceptById } from '@/data/concepts';
import { playerMatchesRole } from '@/lib/concept-builder';

interface EditorState {
  // Current play data
  play: Play;

  // Editor UI state
  mode: EditorMode;
  selectedPlayerIds: string[];
  selectedActionIds: string[];

  // Hover state
  hoveredPlayerId: string | null;
  hoveredActionId: string | null;

  // Drawing configuration (unified draw mode)
  drawingConfig: DrawingConfig;

  // Drawing state
  drawingPhase: DrawingPhase;
  drawingFromPlayerId: string | null;
  drawingStartPoint: Point | null;
  drawingEndPoint: Point | null;
  drawingControlPoint: Point | null; // For curved lines
  previewPoint: Point | null; // For rubber band effect
  angularPoints: Point[]; // For angular/polyline drawing (stores intermediate points)

  // Editing state (for modifying existing lines)
  editingActionId: string | null;
  editingPointType: 'start' | 'end' | 'control' | null;
  editingPointIndex: number | null; // For multi-point editing (index in controlPoints array)

  // History for undo/redo
  history: Play[];
  historyIndex: number;

  // Stage dimensions
  stageWidth: number;
  stageHeight: number;

  // Zoom
  zoom: number;

  // Grid snap
  gridSnapEnabled: boolean;
}

interface EditorActions {
  // Mode
  setMode: (mode: EditorMode) => void;

  // Selection
  selectPlayer: (playerId: string, addToSelection?: boolean) => void;
  selectAction: (actionId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Hover
  setHoveredPlayer: (playerId: string | null) => void;
  setHoveredAction: (actionId: string | null) => void;

  // Player operations
  addPlayer: (role: string, position: Point, appearance?: Partial<PlayerAppearance>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  movePlayer: (playerId: string, position: Point) => void;
  deletePlayer: (playerId: string) => void;
  updatePlayerAppearance: (playerId: string, appearance: Partial<PlayerAppearance>) => void;

  // Action operations
  addLine: (fromPlayerId: string, startPoint: Point, endPoint: Point, controlPoint?: Point) => void;
  updateAction: (actionId: string, updates: Partial<Action>) => void;
  deleteAction: (actionId: string) => void;
  updateActionStyle: (actionId: string, style: Partial<{ stroke: string; strokeWidth: number; lineStyle: LineStyle; endMarker: EndMarker }>) => void;
  convertLineType: (actionId: string, toType: 'straight' | 'curved') => void;

  // Bulk operations
  duplicateSelected: () => void;
  moveSelectedByOffset: (dx: number, dy: number) => void;

  // Drawing configuration
  setDrawingConfig: (config: Partial<DrawingConfig>) => void;

  // Drawing (new unified system)
  startDrawingFromPlayer: (playerId: string) => void;
  setDrawingEndPoint: (point: Point) => void;
  setDrawingControlPoint: (point: Point) => void;
  setPreviewPoint: (point: Point | null) => void;
  confirmDrawing: () => void;
  cancelDrawing: () => void;

  // Angular drawing (multi-point polyline)
  addAngularPoint: (point: Point) => void;
  confirmAngularDrawing: () => void;

  // Editing existing lines
  startEditingAction: (actionId: string, pointType: 'start' | 'end' | 'control') => void;
  startEditingPointByIndex: (actionId: string, pointIndex: number) => void;
  updateEditingPoint: (point: Point) => void;
  finishEditingAction: () => void;
  updateRouteControlPoints: (actionId: string, controlPoints: Point[]) => void;
  insertRoutePoint: (actionId: string, point: Point, afterIndex: number) => void;
  deleteRoutePoint: (actionId: string, pointIndex: number) => void;

  // Play operations
  setPlay: (play: Play) => void;
  updatePlayName: (name: string) => void;
  resetPlay: () => void;
  loadFormation: (formationKey: string) => void;
  flipPlay: () => void;
  duplicatePlay: () => void;

  // Concept auto-build
  applyConceptTemplate: (conceptId: string) => { success: boolean; actionsCreated: number; message: string };

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Stage
  setStageSize: (width: number, height: number) => void;

  // Zoom
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Grid snap
  toggleGridSnap: () => void;
}

const createEmptyPlay = (): Play => ({
  schemaVersion: '1.0',
  type: 'play',
  id: uuidv4(),
  name: 'New Play',
  tags: [],
  meta: {
    unit: 'offense',
    strength: 'right',
  },
  field: DEFAULT_PLAY_FIELD,
  roster: {
    players: [],
  },
  actions: [],
  notes: {
    coachingPoints: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Formation presets with normalized coordinates
// Y coordinate: negative = backfield (below LOS visually), positive = toward defense (above LOS visually)
// Offense direction is UPWARD. All players must be below LOS (negative Y values)
// Visible range: y = -0.4 (bottom, 10 yards back) to y = 0.6 (top, 15 yards ahead)
// Scale: 0.04 = 1 yard
export const FORMATION_PRESETS: Record<string, { name: string; players: Array<{ role: string; label: string; x: number; y: number; appearance?: { shape?: PlayerShape; fill?: string; stroke?: string; showLabel?: boolean; radius?: number } }> }> = {
  iFormation: {
    name: 'I Formation',
    players: [
      // Ball at center
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      // O-Line
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      // Backfield (under center)
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.19 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  shotgun: {
    name: 'Shotgun',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.2, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  spread: {
    name: 'Spread 2x2',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
      { role: 'WR', label: 'Y', x: 0.85, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
    ],
  },
  trips: {
    name: 'Trips Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
      { role: 'WR', label: 'H', x: 0.72, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.82, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
    ],
  },
  bunch: {
    name: 'Bunch Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
      { role: 'TE', label: 'Y', x: 0.75, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.78, y: -0.08 },
      { role: 'WR', label: 'Z', x: 0.82, y: -0.03 },
    ],
  },
  singleBack: {
    name: 'Single Back',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
      { role: 'WR', label: 'H', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  proSet: {
    name: 'Pro Set',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.13 },
      { role: 'FB', label: 'FB', x: 0.58, y: -0.13 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  pistol: {
    name: 'Pistol',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.2, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.10 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.18 },
      { role: 'WR', label: 'Y', x: 0.8, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  twins: {
    name: 'Twins Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
      { role: 'WR', label: 'H', x: 0.78, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  wingT: {
    name: 'Wing-T',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'WB', x: 0.70, y: -0.07 },
      { role: 'RB', label: 'TB', x: 0.42, y: -0.13 },
    ],
  },
  ace: {
    name: 'Ace (12 Personnel)',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },
  emptySet: {
    name: 'Empty Set',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.2, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'TE', label: 'Y', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'F', x: 0.85, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
    ],
  },
  goalLine: {
    name: 'Goal Line',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.11 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.17 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
    ],
  },
  slot: {
    name: 'Slot Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.1, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
      { role: 'WR', label: 'H', x: 0.78, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.9, y: -0.03 },
    ],
  },

  // ===== SPREAD/AIR RAID FORMATIONS =====
  tripsLeft: {
    name: 'Trips Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.25, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },
  bunchLeft: {
    name: 'Bunch Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
      { role: 'TE', label: 'Y', x: 0.25, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.22, y: -0.08 },
      { role: 'WR', label: 'Z', x: 0.18, y: -0.03 },
    ],
  },
  twinsLeft: {
    name: 'Twins Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },
  emptyTrips: {
    name: 'Empty Trips',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.25, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'WR', label: 'F', x: 0.85, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
    ],
  },
  quadsRight: {
    name: 'Quads Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.85, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.75, y: -0.03 },
      { role: 'WR', label: 'F', x: 0.70, y: -0.07 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
    ],
  },
  quadsLeft: {
    name: 'Quads Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.25, y: -0.03 },
      { role: 'WR', label: 'F', x: 0.30, y: -0.07 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
    ],
  },
  stackRight: {
    name: 'Stack Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.85, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.85, y: -0.08 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
    ],
  },
  stackLeft: {
    name: 'Stack Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.08 },
      { role: 'TE', label: 'TE', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },
  treyRight: {
    name: 'Trey Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.75, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
    ],
  },
  treyLeft: {
    name: 'Trey Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.25, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },
  spreadTight: {
    name: 'Spread Tight',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.20, y: -0.03 },
      { role: 'WR', label: 'Y', x: 0.80, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.12 },
    ],
  },
  slotLeft: {
    name: 'Slot Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.20, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },

  // ===== PRO STYLE/WEST COAST FORMATIONS =====
  aceTwinsRight: {
    name: 'Ace Twins Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.85, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  aceTwinsLeft: {
    name: 'Ace Twins Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  splitBacks: {
    name: 'Split Backs',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.13 },
      { role: 'FB', label: 'FB', x: 0.58, y: -0.13 },
    ],
  },
  doubleTightRight: {
    name: 'Double Tight Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.65, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.70, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  doubleTightLeft: {
    name: 'Double Tight Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.30, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  heavy: {
    name: 'Heavy',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.19 },
    ],
  },
  jumbo: {
    name: 'Jumbo',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'TE', label: 'F', x: 0.70, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.19 },
    ],
  },
  unbalancedRight: {
    name: 'Unbalanced Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.45, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.40, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.50, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.35, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.55, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.45, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.45, y: -0.15 },
    ],
  },
  unbalancedLeft: {
    name: 'Unbalanced Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.55, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.50, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.60, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.45, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.65, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.40, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.55, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.55, y: -0.15 },
    ],
  },
  near: {
    name: 'Near',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.55, y: -0.12 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.18 },
    ],
  },

  // ===== POWER RUN/SMASHMOUTH FORMATIONS =====
  far: {
    name: 'Far',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.45, y: -0.12 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.18 },
    ],
  },
  fullHouse: {
    name: 'Full House',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'HB1', x: 0.42, y: -0.18 },
      { role: 'RB', label: 'HB2', x: 0.58, y: -0.18 },
    ],
  },
  marylandI: {
    name: 'Maryland I',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.55, y: -0.10 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.18 },
    ],
  },
  powerI: {
    name: 'Power I',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.13 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.19 },
    ],
  },
  wingRight: {
    name: 'Wing Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.70, y: -0.08 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  wingLeft: {
    name: 'Wing Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.30, y: -0.08 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  big: {
    name: 'Big',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'U', x: 0.65, y: -0.03 },
      { role: 'TE', label: 'F', x: 0.30, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.12 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.17 },
    ],
  },
  tightBunchRight: {
    name: 'Tight Bunch Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.72, y: -0.05 },
      { role: 'WR', label: 'Z', x: 0.72, y: -0.10 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  tightBunchLeft: {
    name: 'Tight Bunch Left',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'Y', x: 0.35, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.28, y: -0.05 },
      { role: 'WR', label: 'X', x: 0.28, y: -0.10 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.15 },
    ],
  },
  tFormation: {
    name: 'T Formation',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'LE', x: 0.35, y: -0.03 },
      { role: 'TE', label: 'RE', x: 0.65, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'LH', x: 0.42, y: -0.12 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.12 },
      { role: 'RB', label: 'RH', x: 0.58, y: -0.12 },
    ],
  },

  // ===== OPTION/TRIPLE OPTION FORMATIONS =====
  wishbone: {
    name: 'Wishbone',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.12 },
      { role: 'RB', label: 'LH', x: 0.42, y: -0.18 },
      { role: 'RB', label: 'RH', x: 0.58, y: -0.18 },
    ],
  },
  flexbone: {
    name: 'Flexbone',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'A', x: 0.32, y: -0.08 },
      { role: 'RB', label: 'B', x: 0.5, y: -0.15 },
    ],
  },
  veer: {
    name: 'Veer',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'HB', x: 0.42, y: -0.10 },
      { role: 'RB', label: 'FB', x: 0.58, y: -0.10 },
    ],
  },
  wildcat: {
    name: 'Wildcat',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'RB', label: 'RB', x: 0.5, y: -0.12 },
      { role: 'QB', label: 'QB', x: 0.35, y: -0.08 },
      { role: 'RB', label: 'HB', x: 0.58, y: -0.15 },
    ],
  },
  speedOption: {
    name: 'Speed Option',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.15, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
    ],
  },
  midlineOption: {
    name: 'Midline',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'FB', label: 'FB', x: 0.5, y: -0.12 },
      { role: 'RB', label: 'RB', x: 0.58, y: -0.15 },
    ],
  },
  loadOption: {
    name: 'Load Option',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'H', x: 0.70, y: -0.07 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.15 },
      { role: 'RB', label: 'RB', x: 0.42, y: -0.15 },
    ],
  },
  tripleRight: {
    name: 'Triple Right',
    players: [
      { role: 'BALL', label: '🏈', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
      { role: 'C', label: 'C', x: 0.5, y: -0.03 },
      { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
      { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
      { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
      { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
      { role: 'TE', label: 'TE', x: 0.65, y: -0.03 },
      { role: 'WR', label: 'X', x: 0.05, y: -0.03 },
      { role: 'WR', label: 'Z', x: 0.95, y: -0.03 },
      { role: 'QB', label: 'QB', x: 0.5, y: -0.07 },
      { role: 'RB', label: 'A', x: 0.68, y: -0.08 },
      { role: 'RB', label: 'B', x: 0.5, y: -0.15 },
    ],
  },
};

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    // Initial state
    play: createEmptyPlay(),
    mode: 'select',
    selectedPlayerIds: [],
    selectedActionIds: [],
    hoveredPlayerId: null,
    hoveredActionId: null,
    drawingConfig: { ...DEFAULT_DRAWING_CONFIG },
    drawingPhase: 'idle',
    drawingFromPlayerId: null,
    drawingStartPoint: null,
    drawingEndPoint: null,
    drawingControlPoint: null,
    previewPoint: null,
    angularPoints: [],
    editingActionId: null,
    editingPointType: null,
    editingPointIndex: null,
    history: [],
    historyIndex: -1,
    stageWidth: 800,
    stageHeight: 600,
    zoom: 1,
    gridSnapEnabled: false,

    // Mode
    setMode: (mode) => set((state) => {
      state.mode = mode;
      state.drawingPhase = 'idle';
      state.drawingFromPlayerId = null;
      state.drawingStartPoint = null;
      state.drawingEndPoint = null;
      state.drawingControlPoint = null;
      state.previewPoint = null;
      state.editingActionId = null;
      state.editingPointType = null;
    }),

    // Selection
    selectPlayer: (playerId, addToSelection = false) => set((state) => {
      if (addToSelection) {
        if (state.selectedPlayerIds.includes(playerId)) {
          state.selectedPlayerIds = state.selectedPlayerIds.filter(id => id !== playerId);
        } else {
          state.selectedPlayerIds.push(playerId);
        }
      } else {
        state.selectedPlayerIds = [playerId];
        state.selectedActionIds = [];
      }
    }),

    selectAction: (actionId, addToSelection = false) => set((state) => {
      if (addToSelection) {
        if (state.selectedActionIds.includes(actionId)) {
          state.selectedActionIds = state.selectedActionIds.filter(id => id !== actionId);
        } else {
          state.selectedActionIds.push(actionId);
        }
      } else {
        state.selectedActionIds = [actionId];
        state.selectedPlayerIds = [];
      }
    }),

    clearSelection: () => set((state) => {
      state.selectedPlayerIds = [];
      state.selectedActionIds = [];
      state.editingActionId = null;
      state.editingPointType = null;
      state.editingPointIndex = null;
    }),

    selectAll: () => set((state) => {
      state.selectedPlayerIds = state.play.roster.players.map(p => p.id);
      state.selectedActionIds = state.play.actions.map(a => a.id);
    }),

    // Hover
    setHoveredPlayer: (playerId) => set((state) => {
      state.hoveredPlayerId = playerId;
    }),

    setHoveredAction: (actionId) => set((state) => {
      state.hoveredActionId = actionId;
    }),

    // Player operations
    addPlayer: (role, position, appearance) => set((state) => {
      get().saveToHistory();
      const player: Player = {
        id: uuidv4(),
        role,
        label: role,
        unit: 'offense',
        alignment: {
          x: position.x,
          y: position.y,
        },
        appearance: {
          ...DEFAULT_PLAYER_APPEARANCE,
          ...appearance,
        },
      };
      state.play.roster.players.push(player);
      state.play.updatedAt = new Date().toISOString();
    }),

    updatePlayer: (playerId, updates) => set((state) => {
      get().saveToHistory();
      const playerIndex = state.play.roster.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        Object.assign(state.play.roster.players[playerIndex], updates);
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    movePlayer: (playerId, position) => set((state) => {
      const playerIndex = state.play.roster.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        state.play.roster.players[playerIndex].alignment.x = position.x;
        state.play.roster.players[playerIndex].alignment.y = position.y;
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    deletePlayer: (playerId) => set((state) => {
      get().saveToHistory();
      state.play.roster.players = state.play.roster.players.filter(p => p.id !== playerId);
      // Also delete actions from this player
      state.play.actions = state.play.actions.filter(a => {
        if ('fromPlayerId' in a) {
          return a.fromPlayerId !== playerId;
        }
        return true;
      });
      state.selectedPlayerIds = state.selectedPlayerIds.filter(id => id !== playerId);
      state.play.updatedAt = new Date().toISOString();
    }),

    updatePlayerAppearance: (playerId, appearance) => set((state) => {
      get().saveToHistory();
      const playerIndex = state.play.roster.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        Object.assign(state.play.roster.players[playerIndex].appearance, appearance);
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    // Action operations - unified line drawing
    addLine: (fromPlayerId, startPoint, endPoint, controlPoint) => set((state) => {
      get().saveToHistory();
      const { lineType, lineStyle, endMarker } = state.drawingConfig;

      // Build path points
      const pathPoints: Point[] = controlPoint
        ? [startPoint, controlPoint, endPoint]
        : [startPoint, endPoint];

      // Create a generic route action (which can represent route, block, motion based on style)
      const route: RouteAction = {
        id: uuidv4(),
        actionType: 'route',
        fromPlayerId,
        route: {
          pattern: 'custom',
          controlPoints: pathPoints,
          pathType: controlPoint ? 'tension' : 'straight',
          tension: controlPoint ? 0.5 : 0,
        },
        style: {
          stroke: '#000000',
          strokeWidth: 2,
          lineStyle: lineStyle,
          endMarker: endMarker,
        },
      };
      state.play.actions.push(route);
      state.play.updatedAt = new Date().toISOString();
    }),

    updateAction: (actionId, updates) => set((state) => {
      get().saveToHistory();
      const actionIndex = state.play.actions.findIndex(a => a.id === actionId);
      if (actionIndex !== -1) {
        Object.assign(state.play.actions[actionIndex], updates);
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    deleteAction: (actionId) => set((state) => {
      get().saveToHistory();
      state.play.actions = state.play.actions.filter(a => a.id !== actionId);
      state.selectedActionIds = state.selectedActionIds.filter(id => id !== actionId);
      state.play.updatedAt = new Date().toISOString();
    }),

    updateActionStyle: (actionId, style) => set((state) => {
      get().saveToHistory();
      const action = state.play.actions.find(a => a.id === actionId);
      if (action && 'style' in action) {
        Object.assign(action.style, style);
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    convertLineType: (actionId, toType) => set((state) => {
      get().saveToHistory();
      const action = state.play.actions.find(a => a.id === actionId);
      if (action && action.actionType === 'route') {
        const routeAction = action as RouteAction;
        const points = routeAction.route.controlPoints;

        if (toType === 'curved' && points.length === 2) {
          // Add control point at midpoint
          const midPoint = {
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2 - 0.1,
          };
          routeAction.route.controlPoints = [points[0], midPoint, points[1]];
          routeAction.route.pathType = 'tension';
          routeAction.route.tension = 0.5;
        } else if (toType === 'straight' && points.length > 2) {
          // Remove middle control points
          routeAction.route.controlPoints = [points[0], points[points.length - 1]];
          routeAction.route.pathType = 'straight';
          routeAction.route.tension = 0;
        }
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    duplicateSelected: () => set((state) => {
      get().saveToHistory();
      const offset = 0.03; // Offset for duplicated items

      // Duplicate players
      const newPlayerIds: string[] = [];
      const playerIdMap: Record<string, string> = {};

      state.selectedPlayerIds.forEach(playerId => {
        const player = state.play.roster.players.find(p => p.id === playerId);
        if (player) {
          const newId = uuidv4();
          playerIdMap[playerId] = newId;
          const newPlayer: Player = {
            ...JSON.parse(JSON.stringify(player)),
            id: newId,
            alignment: {
              x: Math.min(1, player.alignment.x + offset),
              y: player.alignment.y + offset,
            },
          };
          state.play.roster.players.push(newPlayer);
          newPlayerIds.push(newId);
        }
      });

      // Duplicate actions
      const newActionIds: string[] = [];
      state.selectedActionIds.forEach(actionId => {
        const action = state.play.actions.find(a => a.id === actionId);
        if (action) {
          const newId = uuidv4();
          const newAction = JSON.parse(JSON.stringify(action));
          newAction.id = newId;

          // Update fromPlayerId if the source player was also duplicated
          if ('fromPlayerId' in newAction && playerIdMap[newAction.fromPlayerId]) {
            newAction.fromPlayerId = playerIdMap[newAction.fromPlayerId];
          }

          // Offset control points
          if ('route' in newAction) {
            newAction.route.controlPoints = newAction.route.controlPoints.map((p: Point) => ({
              x: Math.min(1, p.x + offset),
              y: p.y + offset,
            }));
          }

          state.play.actions.push(newAction);
          newActionIds.push(newId);
        }
      });

      // Select the new items
      state.selectedPlayerIds = newPlayerIds;
      state.selectedActionIds = newActionIds;
      state.play.updatedAt = new Date().toISOString();
    }),

    moveSelectedByOffset: (dx, dy) => set((state) => {
      // Move selected players
      state.selectedPlayerIds.forEach(playerId => {
        const player = state.play.roster.players.find(p => p.id === playerId);
        if (player) {
          player.alignment.x = Math.max(0, Math.min(1, player.alignment.x + dx));
          player.alignment.y = Math.max(-1, Math.min(1, player.alignment.y + dy));
        }
      });

      // Move selected actions (update control points)
      state.selectedActionIds.forEach(actionId => {
        const action = state.play.actions.find(a => a.id === actionId);
        if (action && action.actionType === 'route') {
          const routeAction = action as RouteAction;
          routeAction.route.controlPoints = routeAction.route.controlPoints.map(p => ({
            x: Math.max(0, Math.min(1, p.x + dx)),
            y: Math.max(-1, Math.min(1, p.y + dy)),
          }));
        }
      });

      state.play.updatedAt = new Date().toISOString();
    }),

    // Drawing configuration
    setDrawingConfig: (config) => set((state) => {
      Object.assign(state.drawingConfig, config);
    }),

    // Drawing - new unified system
    startDrawingFromPlayer: (playerId) => set((state) => {
      const player = state.play.roster.players.find(p => p.id === playerId);
      if (player && state.mode === 'draw') {
        const startPoint = { x: player.alignment.x, y: player.alignment.y };
        state.drawingFromPlayerId = playerId;
        state.drawingStartPoint = startPoint;
        state.drawingEndPoint = null;
        state.drawingControlPoint = null;
        state.angularPoints = [];

        // For angular mode, start with the initial point and enter angular_drawing phase
        if (state.drawingConfig.lineType === 'angular') {
          state.angularPoints = [startPoint];
          state.drawingPhase = 'angular_drawing';
        } else {
          state.drawingPhase = 'start_selected';
        }
      }
    }),

    setDrawingEndPoint: (point) => set((state) => {
      if (state.drawingPhase === 'start_selected') {
        state.drawingEndPoint = point;

        // For straight lines, auto-confirm; for curved, go to adjustment phase
        if (state.drawingConfig.lineType === 'straight') {
          // Will confirm on next click
          state.drawingPhase = 'end_selected';
        } else if (state.drawingConfig.lineType === 'curved') {
          // For curved lines, set initial control point at midpoint
          if (state.drawingStartPoint) {
            state.drawingControlPoint = {
              x: (state.drawingStartPoint.x + point.x) / 2,
              y: (state.drawingStartPoint.y + point.y) / 2 - 0.1, // Slight offset for visible curve
            };
          }
          state.drawingPhase = 'adjusting_curve';
        }
      }
    }),

    setDrawingControlPoint: (point) => set((state) => {
      if (state.drawingPhase === 'adjusting_curve') {
        state.drawingControlPoint = point;
      }
    }),

    setPreviewPoint: (point) => set((state) => {
      state.previewPoint = point;
    }),

    confirmDrawing: () => {
      const state = get();
      const { drawingFromPlayerId, drawingStartPoint, drawingEndPoint, drawingControlPoint, drawingConfig } = state;

      if (drawingFromPlayerId && drawingStartPoint && drawingEndPoint) {
        get().addLine(
          drawingFromPlayerId,
          drawingStartPoint,
          drawingEndPoint,
          drawingConfig.lineType === 'curved' ? drawingControlPoint || undefined : undefined
        );
      }

      set((state) => {
        state.drawingPhase = 'idle';
        state.drawingFromPlayerId = null;
        state.drawingStartPoint = null;
        state.drawingEndPoint = null;
        state.drawingControlPoint = null;
      });
    },

    cancelDrawing: () => set((state) => {
      state.drawingPhase = 'idle';
      state.drawingFromPlayerId = null;
      state.drawingStartPoint = null;
      state.drawingEndPoint = null;
      state.drawingControlPoint = null;
      state.previewPoint = null;
      state.angularPoints = [];
    }),

    // Angular drawing (multi-point polyline)
    addAngularPoint: (point) => set((state) => {
      if (state.drawingPhase === 'angular_drawing') {
        state.angularPoints.push(point);
      }
    }),

    confirmAngularDrawing: () => {
      const state = get();
      const { drawingFromPlayerId, angularPoints, drawingConfig } = state;

      // Need at least 2 points (start + one more)
      if (drawingFromPlayerId && angularPoints.length >= 2) {
        get().saveToHistory();

        // Create route with all angular points (pathType: straight, tension: 0 for sharp angles)
        const route: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: drawingFromPlayerId,
          route: {
            pattern: 'custom',
            controlPoints: [...angularPoints],
            pathType: 'straight', // straight segments with no smoothing
            tension: 0,
          },
          style: {
            stroke: '#000000',
            strokeWidth: 2,
            lineStyle: drawingConfig.lineStyle,
            endMarker: drawingConfig.endMarker,
          },
        };

        set((state) => {
          state.play.actions.push(route);
          state.play.updatedAt = new Date().toISOString();
          state.drawingPhase = 'idle';
          state.drawingFromPlayerId = null;
          state.drawingStartPoint = null;
          state.drawingEndPoint = null;
          state.drawingControlPoint = null;
          state.previewPoint = null;
          state.angularPoints = [];
        });
      } else {
        // Cancel if not enough points
        set((state) => {
          state.drawingPhase = 'idle';
          state.drawingFromPlayerId = null;
          state.drawingStartPoint = null;
          state.angularPoints = [];
          state.previewPoint = null;
        });
      }
    },

    // Editing existing lines
    startEditingAction: (actionId, pointType) => set((state) => {
      state.editingActionId = actionId;
      state.editingPointType = pointType;
    }),

    updateEditingPoint: (point) => set((state) => {
      const { editingActionId, editingPointType, editingPointIndex } = state;
      if (!editingActionId) return;
      // Either pointType or pointIndex must be set
      if (editingPointType === null && editingPointIndex === null) return;

      const action = state.play.actions.find(a => a.id === editingActionId);
      if (!action) return;

      // Handle route actions
      if (action.actionType === 'route') {
        const routeAction = action as RouteAction;
        const points = [...routeAction.route.controlPoints];

        // If editing by index, update that specific point
        if (editingPointIndex !== null && editingPointIndex >= 0 && editingPointIndex < points.length) {
          points[editingPointIndex] = point;
        } else if (editingPointType === 'start' && points.length >= 1) {
          points[0] = point;
        } else if (editingPointType === 'end' && points.length >= 2) {
          points[points.length - 1] = point;
        } else if (editingPointType === 'control' && points.length >= 3) {
          points[1] = point;
        }

        routeAction.route.controlPoints = points;
        state.play.updatedAt = new Date().toISOString();
      }
      // Handle block actions
      else if (action.actionType === 'block') {
        const blockAction = action as BlockAction;
        const points = [...blockAction.block.pathPoints];

        if (editingPointIndex !== null && editingPointIndex >= 0 && editingPointIndex < points.length) {
          points[editingPointIndex] = point;
        } else if (editingPointType === 'start' && points.length >= 1) {
          points[0] = point;
        } else if (editingPointType === 'end' && points.length >= 2) {
          points[points.length - 1] = point;
        } else if (editingPointType === 'control' && points.length >= 3) {
          points[1] = point;
        }

        blockAction.block.pathPoints = points;
        state.play.updatedAt = new Date().toISOString();
      }
      // Handle motion actions
      else if (action.actionType === 'motion') {
        const motionAction = action as MotionAction;
        const points = [...motionAction.motion.pathPoints];

        if (editingPointIndex !== null && editingPointIndex >= 0 && editingPointIndex < points.length) {
          points[editingPointIndex] = point;
        } else if (editingPointType === 'start' && points.length >= 1) {
          points[0] = point;
        } else if (editingPointType === 'end' && points.length >= 2) {
          points[points.length - 1] = point;
        } else if (editingPointType === 'control' && points.length >= 3) {
          points[1] = point;
        }

        motionAction.motion.pathPoints = points;
        state.play.updatedAt = new Date().toISOString();
      }
    }),

    finishEditingAction: () => set((state) => {
      if (state.editingActionId) {
        // Save to history before finishing edit
        const currentPlay = JSON.parse(JSON.stringify(state.play));
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(currentPlay);
        state.historyIndex = state.history.length - 1;
        if (state.history.length > 50) {
          state.history.shift();
          state.historyIndex--;
        }
      }
      state.editingActionId = null;
      state.editingPointType = null;
      state.editingPointIndex = null;
    }),

    updateRouteControlPoints: (actionId, controlPoints) => set((state) => {
      get().saveToHistory();
      const actionIndex = state.play.actions.findIndex(a => a.id === actionId);
      if (actionIndex !== -1) {
        const action = state.play.actions[actionIndex];
        if (action.actionType === 'route') {
          (action as RouteAction).route.controlPoints = controlPoints;
          (action as RouteAction).route.pathType = controlPoints.length > 2 ? 'tension' : 'straight';
          (action as RouteAction).route.tension = controlPoints.length > 2 ? 0.5 : 0;
          state.play.updatedAt = new Date().toISOString();
        }
      }
    }),

    // Start editing a specific point by index (for multi-point routes)
    startEditingPointByIndex: (actionId, pointIndex) => set((state) => {
      state.editingActionId = actionId;
      state.editingPointType = null;
      state.editingPointIndex = pointIndex;
    }),

    // Insert a new point into a route after the specified index
    insertRoutePoint: (actionId, point, afterIndex) => set((state) => {
      get().saveToHistory();
      const action = state.play.actions.find(a => a.id === actionId);
      if (!action || action.actionType !== 'route') return;

      const routeAction = action as RouteAction;
      const points = [...routeAction.route.controlPoints];

      // Insert the new point after the specified index
      points.splice(afterIndex + 1, 0, point);

      routeAction.route.controlPoints = points;
      // Update path type for multi-point routes
      routeAction.route.pathType = 'straight';
      routeAction.route.tension = 0;
      state.play.updatedAt = new Date().toISOString();
    }),

    // Delete a point from a route by index (min 2 points required)
    deleteRoutePoint: (actionId, pointIndex) => set((state) => {
      const action = state.play.actions.find(a => a.id === actionId);
      if (!action || action.actionType !== 'route') return;

      const routeAction = action as RouteAction;
      const points = [...routeAction.route.controlPoints];

      // Don't delete if only 2 points left (start and end)
      if (points.length <= 2) return;

      // Don't delete first (start) or last (end) points
      if (pointIndex === 0 || pointIndex === points.length - 1) return;

      get().saveToHistory();
      points.splice(pointIndex, 1);

      routeAction.route.controlPoints = points;
      // Update path type based on remaining points
      routeAction.route.pathType = points.length > 2 ? 'straight' : 'straight';
      routeAction.route.tension = 0;
      state.play.updatedAt = new Date().toISOString();
    }),

    // Play operations
    setPlay: (play) => set((state) => {
      state.play = play;
      state.history = [];
      state.historyIndex = -1;
    }),

    updatePlayName: (name) => set((state) => {
      state.play.name = name;
      state.play.updatedAt = new Date().toISOString();
    }),

    resetPlay: () => set((state) => {
      state.play = createEmptyPlay();
      state.selectedPlayerIds = [];
      state.selectedActionIds = [];
      state.history = [];
      state.historyIndex = -1;
    }),

    loadFormation: (formationKey) => set((state) => {
      const formation = FORMATION_PRESETS[formationKey];
      if (!formation) return;

      get().saveToHistory();

      // Clear existing players and actions
      state.play.roster.players = [];
      state.play.actions = [];
      state.selectedPlayerIds = [];
      state.selectedActionIds = [];

      // Add players from formation
      formation.players.forEach((p) => {
        const player: Player = {
          id: uuidv4(),
          role: p.role,
          label: p.label,
          unit: 'offense',
          alignment: {
            x: p.x,
            y: p.y,
          },
          appearance: {
            ...DEFAULT_PLAYER_APPEARANCE,
            ...p.appearance, // Preserve ball/custom appearance from preset
          },
        };
        state.play.roster.players.push(player);
      });

      state.play.updatedAt = new Date().toISOString();
    }),

    // Flip play horizontally (mirror)
    flipPlay: () => set((state) => {
      get().saveToHistory();

      // Flip all players horizontally (mirror around x=0.5)
      state.play.roster.players.forEach((player) => {
        player.alignment.x = 1 - player.alignment.x;
      });

      // Flip all actions
      state.play.actions.forEach((action) => {
        if (action.actionType === 'route' && 'route' in action) {
          action.route.controlPoints = action.route.controlPoints.map((p) => ({
            x: 1 - p.x,
            y: p.y,
          }));
        } else if (action.actionType === 'block' && 'block' in action) {
          action.block.pathPoints = action.block.pathPoints.map((p) => ({
            x: 1 - p.x,
            y: p.y,
          }));
          if (action.block.target?.landmark) {
            action.block.target.landmark.x = 1 - action.block.target.landmark.x;
          }
        } else if (action.actionType === 'motion' && 'motion' in action) {
          action.motion.pathPoints = action.motion.pathPoints.map((p) => ({
            x: 1 - p.x,
            y: p.y,
          }));
          if (action.motion.endAlignment) {
            action.motion.endAlignment.x = 1 - action.motion.endAlignment.x;
          }
        } else if (action.actionType === 'landmark' && 'landmark' in action) {
          action.landmark.x = 1 - action.landmark.x;
        } else if (action.actionType === 'text' && 'text' in action) {
          action.text.x = 1 - action.text.x;
        }
      });

      // Flip strength
      if (state.play.meta.strength === 'left') {
        state.play.meta.strength = 'right';
      } else if (state.play.meta.strength === 'right') {
        state.play.meta.strength = 'left';
      }

      state.play.updatedAt = new Date().toISOString();
    }),

    // Duplicate play (create a copy with new ID)
    duplicatePlay: () => set((state) => {
      // Create a deep copy of the current play
      const newPlay = JSON.parse(JSON.stringify(state.play));
      newPlay.id = uuidv4();
      newPlay.name = `${state.play.name} (Copy)`;
      newPlay.createdAt = new Date().toISOString();
      newPlay.updatedAt = new Date().toISOString();

      // Assign new IDs to all players and actions
      const playerIdMap: Record<string, string> = {};
      newPlay.roster.players.forEach((player: { id: string }) => {
        const oldId = player.id;
        const newId = uuidv4();
        playerIdMap[oldId] = newId;
        player.id = newId;
      });

      // Update action references
      newPlay.actions.forEach((action: { id: string; fromPlayerId?: string }) => {
        action.id = uuidv4();
        if (action.fromPlayerId && playerIdMap[action.fromPlayerId]) {
          action.fromPlayerId = playerIdMap[action.fromPlayerId];
        }
      });

      state.play = newPlay;
      state.history = [];
      state.historyIndex = -1;
    }),

    // Concept auto-build
    applyConceptTemplate: (conceptId) => {
      console.log('applyConceptTemplate called with conceptId:', conceptId);
      const concept = getConceptById(conceptId);
      console.log('Concept lookup result:', concept ? concept.name : 'NOT FOUND');
      if (!concept) {
        return { success: false, actionsCreated: 0, message: `Concept not found: ${conceptId}` };
      }

      const state = get();
      const players = state.play.roster.players;
      console.log('Players count:', players.length);

      if (players.length === 0) {
        return { success: false, actionsCreated: 0, message: 'No players on field' };
      }

      // Save to history before making changes
      get().saveToHistory();

      let actionsCreated = 0;

      set((draft) => {
        // Clear existing actions when applying a new concept
        draft.play.actions = [];

        const template = concept.template;
        const assignedPlayerIds = new Set<string>();

        // Process each role in the template
        for (const role of template.roles) {
          // Find matching players for this role using flexible position matching
          const matchingPlayers = draft.play.roster.players.filter((p) =>
            role.appliesTo.some((roleMatch) => playerMatchesRole(p, roleMatch))
          );

          for (const player of matchingPlayers) {
            // Create route action if specified
            if (role.defaultRoute) {
              const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
              const routeDepth = (role.defaultRoute.depth ?? 10) / 100; // Convert yards to normalized

              // Calculate end point based on route pattern
              // Y coordinate: negative = backfield, positive = toward defense
              // Routes go FORWARD (upward on screen), so we ADD routeDepth to Y
              let endPoint: Point = { x: startPoint.x, y: startPoint.y + routeDepth };
              let controlPoint: Point | undefined;

              const pattern = role.defaultRoute.pattern;
              const direction = role.defaultRoute.direction;

              // Adjust end point based on pattern
              switch (pattern) {
                case 'slant':
                  endPoint = {
                    x: startPoint.x + (direction === 'inside' ? (startPoint.x > 0.5 ? -0.1 : 0.1) : (startPoint.x > 0.5 ? 0.1 : -0.1)),
                    y: startPoint.y + routeDepth,
                  };
                  break;
                case 'out':
                case 'quick_out':
                case 'speed_out':
                  endPoint = {
                    x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
                    y: startPoint.y + routeDepth * 0.5,
                  };
                  break;
                case 'corner':
                  endPoint = {
                    x: startPoint.x + (startPoint.x > 0.5 ? 0.15 : -0.15),
                    y: startPoint.y + routeDepth,
                  };
                  controlPoint = {
                    x: startPoint.x,
                    y: startPoint.y + routeDepth * 0.5,
                  };
                  break;
                case 'post':
                  endPoint = {
                    x: 0.5,
                    y: startPoint.y + routeDepth,
                  };
                  controlPoint = {
                    x: startPoint.x,
                    y: startPoint.y + routeDepth * 0.5,
                  };
                  break;
                case 'dig':
                case 'cross':
                case 'shallow':
                  endPoint = {
                    x: startPoint.x + (direction === 'inside' ? (startPoint.x > 0.5 ? -0.2 : 0.2) : (startPoint.x > 0.5 ? 0.2 : -0.2)),
                    y: startPoint.y + routeDepth,
                  };
                  controlPoint = {
                    x: startPoint.x,
                    y: startPoint.y + routeDepth,
                  };
                  break;
                case 'curl':
                case 'hitch':
                case 'stick':
                  endPoint = {
                    x: startPoint.x,
                    y: startPoint.y + routeDepth,
                  };
                  break;
                case 'flat':
                case 'arrow':
                  endPoint = {
                    x: startPoint.x + (startPoint.x > 0.5 ? 0.12 : -0.12),
                    y: startPoint.y + routeDepth * 0.3,
                  };
                  break;
                case 'wheel':
                  endPoint = {
                    x: startPoint.x + (startPoint.x > 0.5 ? 0.15 : -0.15),
                    y: startPoint.y + routeDepth,
                  };
                  controlPoint = {
                    x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
                    y: startPoint.y + routeDepth * 0.3,
                  };
                  break;
                case 'go':
                case 'seam':
                default:
                  endPoint = {
                    x: startPoint.x,
                    y: startPoint.y + routeDepth,
                  };
                  break;
              }

              // Ensure coordinates stay within bounds
              endPoint.x = Math.max(0.05, Math.min(0.95, endPoint.x));
              endPoint.y = Math.max(-0.95, Math.min(0.95, endPoint.y));

              const controlPoints: Point[] = controlPoint
                ? [startPoint, controlPoint, endPoint]
                : [startPoint, endPoint];

              const routeAction: RouteAction = {
                id: uuidv4(),
                actionType: 'route',
                fromPlayerId: player.id,
                layer: 'primary',
                style: {
                  ...DEFAULT_ACTION_STYLE,
                },
                route: {
                  pattern: pattern,
                  depth: role.defaultRoute.depth,
                  controlPoints,
                  pathType: controlPoint ? 'tension' : 'straight',
                  tension: controlPoint ? 0.5 : 0,
                },
              };

              draft.play.actions.push(routeAction);
              assignedPlayerIds.add(player.id);
              actionsCreated++;
            }

            // Create block action if specified (for run concepts)
            if (role.defaultBlock) {
              const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };

              // Calculate block end point (short movement toward target)
              // Blocks go FORWARD (upward on screen), so we ADD to Y
              const endPoint: Point = {
                x: startPoint.x,
                y: startPoint.y + 0.05, // Short forward movement
              };

              // Adjust based on block scheme
              const scheme = role.defaultBlock.scheme;
              if (scheme === 'pull_kick' || scheme === 'pull_lead') {
                // Pull blocks go to the side
                endPoint.x = startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.15 : -0.15);
                endPoint.y = startPoint.y + 0.1;
              } else if (scheme === 'reach') {
                endPoint.x = startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.05 : -0.05);
                endPoint.y = startPoint.y + 0.03;
              }

              const blockAction: BlockAction = {
                id: uuidv4(),
                actionType: 'block',
                fromPlayerId: player.id,
                layer: 'primary',
                style: {
                  ...DEFAULT_ACTION_STYLE,
                  endMarker: 't_block',
                },
                block: {
                  scheme: scheme,
                  target: {
                    toPlayerId: undefined,
                    landmark: endPoint,
                  },
                  pathPoints: [startPoint, endPoint],
                  pathType: 'straight',
                },
              };

              draft.play.actions.push(blockAction);
              assignedPlayerIds.add(player.id);
              actionsCreated++;
            }
          }
        }

        // Assign default actions to unassigned players
        const isPassConcept = concept.conceptType === 'pass';

        for (const player of draft.play.roster.players) {
          if (assignedPlayerIds.has(player.id)) continue;

          const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
          const role = player.role.toUpperCase();
          const label = player.label?.toUpperCase() || '';

          // Skip QB - they don't need an action
          if (role === 'QB' || label === 'QB') {
            continue;
          }

          // OL players get block assignments
          if (['C', 'LG', 'RG', 'LT', 'RT', 'OL'].includes(role) ||
              ['C', 'LG', 'RG', 'LT', 'RT'].includes(label)) {
            const endPoint: Point = {
              x: startPoint.x,
              y: startPoint.y + 0.05, // Short forward block
            };

            const blockAction: BlockAction = {
              id: uuidv4(),
              actionType: 'block',
              fromPlayerId: player.id,
              layer: 'primary',
              style: {
                ...DEFAULT_ACTION_STYLE,
                endMarker: 't_block',
              },
              block: {
                scheme: isPassConcept ? 'pass_pro' : 'zone',
                target: {
                  toPlayerId: undefined,
                  landmark: endPoint,
                },
                pathPoints: [startPoint, endPoint],
                pathType: 'straight',
              },
            };

            draft.play.actions.push(blockAction);
            actionsCreated++;
            continue;
          }

          // TE gets block or short route depending on concept type
          if (role === 'TE' || label === 'TE' || label === 'Y') {
            if (isPassConcept) {
              // Default to a short route for unassigned TE
              const endPoint: Point = {
                x: startPoint.x + (startPoint.x > 0.5 ? -0.08 : 0.08),
                y: startPoint.y + 0.08,
              };

              const routeAction: RouteAction = {
                id: uuidv4(),
                actionType: 'route',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE },
                route: {
                  pattern: 'check',
                  depth: 8,
                  controlPoints: [startPoint, endPoint],
                  pathType: 'straight',
                  tension: 0,
                },
              };

              draft.play.actions.push(routeAction);
            } else {
              // Run concept - TE blocks
              const endPoint: Point = {
                x: startPoint.x + (startPoint.x > 0.5 ? 0.05 : -0.05),
                y: startPoint.y + 0.05,
              };

              const blockAction: BlockAction = {
                id: uuidv4(),
                actionType: 'block',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE, endMarker: 't_block' },
                block: {
                  scheme: 'seal',
                  target: { toPlayerId: undefined, landmark: endPoint },
                  pathPoints: [startPoint, endPoint],
                  pathType: 'straight',
                },
              };

              draft.play.actions.push(blockAction);
            }
            actionsCreated++;
            continue;
          }

          // FB gets block or check route
          if (role === 'FB' || label === 'FB') {
            if (isPassConcept) {
              // Pass protection check route
              const endPoint: Point = {
                x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
                y: startPoint.y + 0.05,
              };

              const routeAction: RouteAction = {
                id: uuidv4(),
                actionType: 'route',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE },
                route: {
                  pattern: 'check',
                  depth: 5,
                  controlPoints: [startPoint, endPoint],
                  pathType: 'straight',
                  tension: 0,
                },
              };

              draft.play.actions.push(routeAction);
            } else {
              // Run concept - FB leads
              const endPoint: Point = {
                x: startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.1 : -0.1),
                y: startPoint.y + 0.08,
              };

              const blockAction: BlockAction = {
                id: uuidv4(),
                actionType: 'block',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE, endMarker: 't_block' },
                block: {
                  scheme: 'lead',
                  target: { toPlayerId: undefined, landmark: endPoint },
                  pathPoints: [startPoint, endPoint],
                  pathType: 'straight',
                },
              };

              draft.play.actions.push(blockAction);
            }
            actionsCreated++;
            continue;
          }

          // RB gets check route or run path
          if (role === 'RB' || label === 'RB') {
            if (isPassConcept) {
              // Default check down route
              const endPoint: Point = {
                x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
                y: startPoint.y + 0.05,
              };

              const routeAction: RouteAction = {
                id: uuidv4(),
                actionType: 'route',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE },
                route: {
                  pattern: 'check',
                  depth: 5,
                  controlPoints: [startPoint, endPoint],
                  pathType: 'straight',
                  tension: 0,
                },
              };

              draft.play.actions.push(routeAction);
            } else {
              // Run path to the play side
              const endPoint: Point = {
                x: startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.15 : -0.15),
                y: startPoint.y + 0.15,
              };

              const routeAction: RouteAction = {
                id: uuidv4(),
                actionType: 'route',
                fromPlayerId: player.id,
                layer: 'primary',
                style: { ...DEFAULT_ACTION_STYLE },
                route: {
                  pattern: 'run',
                  depth: 15,
                  controlPoints: [startPoint, endPoint],
                  pathType: 'straight',
                  tension: 0,
                },
              };

              draft.play.actions.push(routeAction);
            }
            actionsCreated++;
            continue;
          }

          // WR or any other skill player gets a route
          if (role === 'WR' || ['X', 'Z', 'H', 'Y'].includes(label) || role.includes('WR')) {
            // Default vertical route for unassigned receivers
            const endPoint: Point = {
              x: startPoint.x,
              y: startPoint.y + 0.12, // 12 yard go route
            };

            const routeAction: RouteAction = {
              id: uuidv4(),
              actionType: 'route',
              fromPlayerId: player.id,
              layer: 'primary',
              style: { ...DEFAULT_ACTION_STYLE },
              route: {
                pattern: 'go',
                depth: 12,
                controlPoints: [startPoint, endPoint],
                pathType: 'straight',
                tension: 0,
              },
            };

            draft.play.actions.push(routeAction);
            actionsCreated++;
          }
        }

        draft.play.updatedAt = new Date().toISOString();
        if (concept.id) {
          draft.play.meta = draft.play.meta || {};
          draft.play.meta.conceptId = concept.id;
        }
      });

      return {
        success: true,
        actionsCreated,
        message: `Applied "${concept.name}" - ${actionsCreated} actions created`,
      };
    },

    // History
    saveToHistory: () => set((state) => {
      // Clone current play and add to history
      const currentPlay = JSON.parse(JSON.stringify(state.play));

      // Remove future history if we're not at the end
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }

      state.history.push(currentPlay);
      state.historyIndex = state.history.length - 1;

      // Limit history size to 50
      if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
      }
    }),

    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.play = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.play = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    // Stage
    setStageSize: (width, height) => set((state) => {
      state.stageWidth = width;
      state.stageHeight = height;
    }),

    // Zoom
    setZoom: (zoom) => set((state) => {
      state.zoom = Math.max(0.5, Math.min(2, zoom));
    }),

    zoomIn: () => set((state) => {
      state.zoom = Math.min(2, state.zoom + 0.1);
    }),

    zoomOut: () => set((state) => {
      state.zoom = Math.max(0.5, state.zoom - 0.1);
    }),

    resetZoom: () => set((state) => {
      state.zoom = 1;
    }),

    // Grid snap
    toggleGridSnap: () => set((state) => {
      state.gridSnapEnabled = !state.gridSnapEnabled;
    }),
  }))
);
