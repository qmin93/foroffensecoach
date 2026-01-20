'use client';

import { Layer } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import { PlayerNode } from './PlayerNode';
import { toNormalized } from '@/utils/coordinates';
import { Player } from '@/types/dsl';

interface PlayerLayerProps {
  width: number;
  height: number;
  players?: Player[];
  isReadOnly?: boolean;
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
