'use client';

import { useMemo } from 'react';
import { Layer } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import { PlayerNode } from './PlayerNode';
import { toNormalized, toPixel } from '@/utils/coordinates';
import { Player } from '@/types/dsl';

interface PlayerLayerProps {
  width: number;
  height: number;
  players?: Player[];
  isReadOnly?: boolean;
}

// Calculate maximum radius that prevents overlap between players
function calculateMaxRadius(players: Player[], width: number, height: number): number {
  if (players.length < 2) return 30; // Default max if only 1 player

  let minDistance = Infinity;

  // Find minimum distance between any two players
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = toPixel(players[i].alignment, width, height);
      const p2 = toPixel(players[j].alignment, width, height);
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
  }

  // Max radius is half the minimum distance minus some padding
  // This ensures no overlap (each player takes half the distance)
  // Minimum 24px to ensure readable player nodes
  const maxRadius = Math.max(24, (minDistance / 2) - 2);
  return maxRadius;
}

export function PlayerLayer({ width, height, players: propPlayers, isReadOnly = false }: PlayerLayerProps) {
  const storePlayers = useEditorStore((state) => state.play.roster.players);
  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const hoveredPlayerId = useEditorStore((state) => state.hoveredPlayerId);
  const selectPlayer = useEditorStore((state) => state.selectPlayer);
  const setHoveredPlayer = useEditorStore((state) => state.setHoveredPlayer);
  const movePlayer = useEditorStore((state) => state.movePlayer);
  const saveToHistory = useEditorStore((state) => state.saveToHistory);
  const mode = useEditorStore((state) => state.mode);
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const startDrawingFromPlayer = useEditorStore((state) => state.startDrawingFromPlayer);

  const players = propPlayers ?? storePlayers;

  // Calculate max radius to prevent overlap
  const maxRadius = useMemo(() => {
    return calculateMaxRadius(players, width, height);
  }, [players, width, height]);

  const handleDragEnd = (playerId: string, pixelX: number, pixelY: number) => {
    const normalized = toNormalized({ x: pixelX, y: pixelY }, width, height);
    movePlayer(playerId, normalized);
  };

  const handleDragStart = () => {
    saveToHistory();
  };

  const handlePlayerClick = (playerId: string, shiftKey: boolean) => {
    if (mode === 'draw' && drawingPhase === 'idle') {
      // Start drawing from this player
      startDrawingFromPlayer(playerId);
    } else if (mode === 'select') {
      // Normal selection with shift support
      selectPlayer(playerId, shiftKey);
    } else {
      // For other modes (text), still allow selection
      selectPlayer(playerId, shiftKey);
    }
  };

  const handleMouseEnter = (playerId: string) => {
    setHoveredPlayer(playerId);
  };

  const handleMouseLeave = () => {
    setHoveredPlayer(null);
  };

  return (
    <Layer>
      {players.map((player) => (
        <PlayerNode
          key={player.id}
          player={player}
          stageWidth={width}
          stageHeight={height}
          maxRadius={maxRadius}
          isSelected={!isReadOnly && selectedPlayerIds.includes(player.id)}
          isHovered={!isReadOnly && hoveredPlayerId === player.id}
          onSelect={isReadOnly ? undefined : handlePlayerClick}
          onDragEnd={isReadOnly ? undefined : handleDragEnd}
          onDragStart={isReadOnly ? undefined : handleDragStart}
          onMouseEnter={isReadOnly ? undefined : handleMouseEnter}
          onMouseLeave={isReadOnly ? undefined : handleMouseLeave}
          draggable={!isReadOnly && mode === 'select'}
        />
      ))}
    </Layer>
  );
}
