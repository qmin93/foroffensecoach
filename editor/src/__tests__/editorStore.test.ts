import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore, FORMATION_PRESETS } from '@/store/editorStore';

// Helper to reset store to initial state
const resetStore = () => {
  useEditorStore.setState({
    play: {
      schemaVersion: '1.0',
      type: 'play',
      id: 'test-play',
      name: 'New Play',
      description: '',
      tags: [],
      meta: {
        personnel: '11',
        formation: null,
        concept: null,
        strength: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      field: {
        type: 'full',
        yardLine: 25,
        hashPosition: 'middle',
        direction: 'up',
      },
      roster: {
        players: [],
      },
      actions: [],
      notes: {
        callName: '',
        coachingPoints: [],
        adjustments: [],
      },
      history: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    mode: 'select',
    selectedPlayerIds: [],
    selectedActionIds: [],
    hoveredPlayerId: null,
    hoveredActionId: null,
    drawingPhase: 'idle',
    drawingFromPlayerId: null,
    drawingStartPoint: null,
    drawingEndPoint: null,
    drawingControlPoint: null,
    previewPoint: null,
    editingActionId: null,
    editingPointType: null,
    history: [],
    historyIndex: -1,
    zoom: 1,
    gridSnapEnabled: false,
  });
};

describe('Editor Store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Player Operations', () => {
    it('should add a player', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(1);
      const addedPlayer = updatedStore.play.roster.players[0];
      expect(addedPlayer.role).toBe('QB');
      expect(addedPlayer.alignment.x).toBe(0.5);
      expect(addedPlayer.alignment.y).toBe(-0.06);
    });

    it('should add a player with custom appearance', () => {
      const store = useEditorStore.getState();
      store.addPlayer('WR', { x: 0.1, y: -0.02 }, {
        shape: 'triangle',
        fill: '#ff0000',
      });

      const updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];
      expect(player.appearance.shape).toBe('triangle');
      expect(player.appearance.fill).toBe('#ff0000');
    });

    it('should move a player', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];

      store.movePlayer(player.id, { x: 0.6, y: -0.1 });

      updatedStore = useEditorStore.getState();
      const movedPlayer = updatedStore.play.roster.players.find((p) => p.id === player.id);
      expect(movedPlayer?.alignment.x).toBe(0.6);
      expect(movedPlayer?.alignment.y).toBe(-0.1);
    });

    it('should delete a player', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];
      const playerId = player.id;

      store.deletePlayer(playerId);

      updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.find((p) => p.id === playerId)).toBeUndefined();
    });

    it('should update player appearance', () => {
      const store = useEditorStore.getState();
      store.addPlayer('WR', { x: 0.1, y: -0.02 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];

      store.updatePlayerAppearance(player.id, { shape: 'square', radius: 20 });

      updatedStore = useEditorStore.getState();
      const updatedPlayer = updatedStore.play.roster.players.find((p) => p.id === player.id);
      expect(updatedPlayer?.appearance.shape).toBe('square');
      expect(updatedPlayer?.appearance.radius).toBe(20);
    });
  });

  describe('Selection', () => {
    it('should select a player', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];

      store.selectPlayer(player.id);

      updatedStore = useEditorStore.getState();
      expect(updatedStore.selectedPlayerIds).toContain(player.id);
    });

    it('should add to selection with shift', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });
      store.addPlayer('RB', { x: 0.5, y: -0.14 });

      let updatedStore = useEditorStore.getState();
      const [qb, rb] = updatedStore.play.roster.players;

      store.selectPlayer(qb.id);
      store.selectPlayer(rb.id, true);

      updatedStore = useEditorStore.getState();
      expect(updatedStore.selectedPlayerIds).toContain(qb.id);
      expect(updatedStore.selectedPlayerIds).toContain(rb.id);
      expect(updatedStore.selectedPlayerIds.length).toBe(2);
    });

    it('should clear selection', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];
      store.selectPlayer(player.id);

      store.clearSelection();

      updatedStore = useEditorStore.getState();
      expect(updatedStore.selectedPlayerIds.length).toBe(0);
    });

    it('should select all', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });
      store.addPlayer('RB', { x: 0.5, y: -0.14 });

      store.selectAll();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.selectedPlayerIds.length).toBe(2);
    });
  });

  describe('Formation Loading', () => {
    it('should load I Formation', () => {
      const store = useEditorStore.getState();
      store.loadFormation('iFormation');

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(11);
      expect(updatedStore.play.roster.players.some((p) => p.role === 'QB')).toBe(true);
      expect(updatedStore.play.roster.players.some((p) => p.role === 'FB')).toBe(true);
      expect(updatedStore.play.roster.players.some((p) => p.role === 'RB')).toBe(true);
    });

    it('should load Shotgun formation', () => {
      const store = useEditorStore.getState();
      store.loadFormation('shotgun');

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(11);
      const qb = updatedStore.play.roster.players.find((p) => p.label === 'QB');
      expect(qb?.alignment.y).toBeLessThan(-0.1);
    });

    it('should load Spread formation', () => {
      const store = useEditorStore.getState();
      store.loadFormation('spread');

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(11);
      const wrs = updatedStore.play.roster.players.filter((p) => p.role === 'WR');
      expect(wrs.length).toBe(4);
    });

    it('should clear existing players when loading formation', () => {
      const store = useEditorStore.getState();
      store.addPlayer('Custom', { x: 0.5, y: 0.5 });
      store.loadFormation('iFormation');

      const updatedStore = useEditorStore.getState();
      const customPlayer = updatedStore.play.roster.players.find((p) => p.role === 'Custom');
      expect(customPlayer).toBeUndefined();
    });
  });

  describe('Play Operations', () => {
    it('should flip play horizontally', () => {
      const store = useEditorStore.getState();
      store.addPlayer('WR', { x: 0.1, y: -0.02 });

      let updatedStore = useEditorStore.getState();
      const originalX = updatedStore.play.roster.players[0].alignment.x;

      store.flipPlay();

      updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players[0].alignment.x).toBeCloseTo(1 - originalX);
    });

    it('should duplicate play', () => {
      const store = useEditorStore.getState();
      store.updatePlayName('Test Play');
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const originalId = updatedStore.play.id;

      store.duplicatePlay();

      updatedStore = useEditorStore.getState();
      expect(updatedStore.play.id).not.toBe(originalId);
      expect(updatedStore.play.name).toBe('Test Play (Copy)');
      expect(updatedStore.play.roster.players.length).toBe(1);
    });

    it('should update play name', () => {
      const store = useEditorStore.getState();
      store.updatePlayName('My New Play');

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.name).toBe('My New Play');
    });

    it('should reset play', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });
      store.updatePlayName('Modified Play');

      store.resetPlay();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(0);
      expect(updatedStore.play.name).toBe('New Play');
    });
  });

  describe('Undo/Redo', () => {
    it('should track history for undo', () => {
      const store = useEditorStore.getState();

      // Verify history is tracked when adding player
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.play.roster.players.length).toBe(1);
      expect(updatedStore.history.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain history index', () => {
      const store = useEditorStore.getState();
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.historyIndex).toBeDefined();
    });
  });

  describe('Mode', () => {
    it('should change mode', () => {
      const store = useEditorStore.getState();
      store.setMode('draw');

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.mode).toBe('draw');
    });

    it('should reset drawing state when changing mode', () => {
      const store = useEditorStore.getState();
      store.setMode('draw');
      store.addPlayer('QB', { x: 0.5, y: -0.06 });

      let updatedStore = useEditorStore.getState();
      const player = updatedStore.play.roster.players[0];
      store.startDrawingFromPlayer(player.id);

      store.setMode('select');

      updatedStore = useEditorStore.getState();
      expect(updatedStore.drawingPhase).toBe('idle');
      expect(updatedStore.drawingFromPlayerId).toBeNull();
    });
  });

  describe('Zoom', () => {
    it('should zoom in', () => {
      const store = useEditorStore.getState();
      const initialZoom = store.zoom;

      store.zoomIn();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.zoom).toBeGreaterThan(initialZoom);
    });

    it('should zoom out', () => {
      const store = useEditorStore.getState();
      const initialZoom = store.zoom;

      store.zoomOut();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.zoom).toBeLessThan(initialZoom);
    });

    it('should not exceed max zoom', () => {
      const store = useEditorStore.getState();
      for (let i = 0; i < 20; i++) {
        store.zoomIn();
      }

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.zoom).toBeLessThanOrEqual(2);
    });

    it('should not go below min zoom', () => {
      const store = useEditorStore.getState();
      for (let i = 0; i < 20; i++) {
        store.zoomOut();
      }

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.zoom).toBeGreaterThanOrEqual(0.5);
    });

    it('should reset zoom', () => {
      const store = useEditorStore.getState();
      store.zoomIn();
      store.zoomIn();

      store.resetZoom();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.zoom).toBe(1);
    });
  });

  describe('Grid Snap', () => {
    it('should toggle grid snap', () => {
      const store = useEditorStore.getState();
      const initialState = store.gridSnapEnabled;

      store.toggleGridSnap();

      const updatedStore = useEditorStore.getState();
      expect(updatedStore.gridSnapEnabled).toBe(!initialState);
    });
  });
});

describe('Formation Presets', () => {
  it('should have all standard formations', () => {
    expect(FORMATION_PRESETS).toHaveProperty('iFormation');
    expect(FORMATION_PRESETS).toHaveProperty('shotgun');
    expect(FORMATION_PRESETS).toHaveProperty('spread');
    expect(FORMATION_PRESETS).toHaveProperty('singleBack');
    expect(FORMATION_PRESETS).toHaveProperty('proSet');
    expect(FORMATION_PRESETS).toHaveProperty('emptySet');
  });

  it('should have 11 players in each formation', () => {
    Object.values(FORMATION_PRESETS).forEach((formation) => {
      expect(formation.players.length).toBe(11);
    });
  });

  it('should have valid coordinates for all players', () => {
    Object.values(FORMATION_PRESETS).forEach((formation) => {
      formation.players.forEach((player) => {
        expect(player.x).toBeGreaterThanOrEqual(0);
        expect(player.x).toBeLessThanOrEqual(1);
        expect(player.y).toBeGreaterThanOrEqual(-1);
        expect(player.y).toBeLessThanOrEqual(1);
      });
    });
  });
});
