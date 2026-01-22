'use client';

import { useMemo } from 'react';
import { Tables } from '@/types/database';
import type { Player, Action, RouteAction, BlockAction, PlayField, ActionStyle, PlayerAppearance } from '@/types/dsl';
import { DEFAULT_ACTION_STYLE, DEFAULT_PLAYER_APPEARANCE, DEFAULT_PLAY_FIELD } from '@/types/dsl';

type PlayRow = Tables<'plays'>;

interface PlayPreviewProps {
  play: PlayRow;
  width?: number;
  height?: number;
}

// Convert normalized coords to SVG coords
// IMPORTANT: Offense direction is UPWARD (toward top of screen)
// - y < 0 (backfield) renders at BOTTOM of screen
// - y = 0 (LOS) renders at ~60% from top
// - y > 0 (downfield) renders at TOP of screen (12 o'clock = forward)
function toSVG(x: number, y: number, width: number, height: number) {
  const svgX = x * width;
  // Invert Y-axis: higher Y values (forward) go toward top of screen
  const svgY = (0.6 - y) * height;
  return { x: svgX, y: svgY };
}

// Render arrow marker at end of path
function renderArrow(
  endX: number,
  endY: number,
  prevX: number,
  prevY: number,
  stroke: string,
  size: number = 4
) {
  const angle = Math.atan2(endY - prevY, endX - prevX);
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = endX - size * Math.cos(angle - arrowAngle);
  const y1 = endY - size * Math.sin(angle - arrowAngle);
  const x2 = endX - size * Math.cos(angle + arrowAngle);
  const y2 = endY - size * Math.sin(angle + arrowAngle);

  return (
    <polygon
      points={`${endX},${endY} ${x1},${y1} ${x2},${y2}`}
      fill={stroke}
    />
  );
}

// Render T-block marker
function renderTBlock(
  endX: number,
  endY: number,
  prevX: number,
  prevY: number,
  stroke: string,
  size: number = 3
) {
  const angle = Math.atan2(endY - prevY, endX - prevX);
  // Perpendicular angle for the T bar
  const perpAngle = angle + Math.PI / 2;

  const x1 = endX + size * Math.cos(perpAngle);
  const y1 = endY + size * Math.sin(perpAngle);
  const x2 = endX - size * Math.cos(perpAngle);
  const y2 = endY - size * Math.sin(perpAngle);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={1.5}
    />
  );
}

// Render circle marker
function renderCircle(endX: number, endY: number, stroke: string, size: number = 2) {
  return (
    <circle
      cx={endX}
      cy={endY}
      r={size}
      fill={stroke}
    />
  );
}

export function PlayPreview({ play, width = 160, height = 120 }: PlayPreviewProps) {
  const { players, actions, field, hasData } = useMemo(() => {
    try {
      const roster = play.roster as { players?: Player[] } | null;
      const actionsData = play.actions as Action[] | null;
      const fieldData = play.field as PlayField | null;

      const players = roster?.players || [];
      const actions = actionsData || [];
      const field = { ...DEFAULT_PLAY_FIELD, ...fieldData };

      return {
        players,
        actions,
        field,
        hasData: players.length > 0,
      };
    } catch {
      return { players: [], actions: [], field: DEFAULT_PLAY_FIELD, hasData: false };
    }
  }, [play]);

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </div>
    );
  }

  // Responsive player size based on thumbnail width
  // Smaller than editor to prevent overlap in thumbnails
  const baseSize = Math.max(2, Math.min(5, width * 0.025));

  // Lighten line color for yard lines
  const lightenColor = (color: string, amount: number = 0.3): string => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
      const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
      const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  };

  // Build player position map for route start point lookup
  const playerPositionMap = new Map<string, { x: number; y: number }>();
  players.forEach(player => {
    playerPositionMap.set(player.id, { x: player.alignment.x, y: player.alignment.y });
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
    >
      {/* Field background */}
      <rect x={0} y={0} width={width} height={height} fill={field.backgroundColor} />

      {/* Yard lines */}
      {field.showYardLines && [0.2, 0.4, 0.6, 0.8].map((y, i) => (
        <line
          key={i}
          x1={0}
          y1={y * height}
          x2={width}
          y2={y * height}
          stroke={lightenColor(field.lineColor, 0.5)}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* LOS - Line of Scrimmage at y=0 which maps to height * 0.6 */}
      {field.showYardLines && (
        <line
          x1={0}
          y1={height * 0.6}
          x2={width}
          y2={height * 0.6}
          stroke={field.lineColor}
          strokeWidth={0.5}
          opacity={0.7}
        />
      )}

      {/* Routes and Blocks */}
      {actions.map((action, i) => {
        if (action.actionType === 'route') {
          const routeAction = action as RouteAction;
          let controlPoints = [...(routeAction.route?.controlPoints || [])];
          if (controlPoints.length < 2) return null;

          // Attach route start to player position (like editor does)
          const playerPos = playerPositionMap.get(routeAction.fromPlayerId);
          if (playerPos && controlPoints.length > 0) {
            controlPoints[0] = { x: playerPos.x, y: playerPos.y };
          }

          const style: ActionStyle = { ...DEFAULT_ACTION_STYLE, ...routeAction.style };
          const stroke = style.stroke || '#000000';
          const lineStyle = style.lineStyle || 'solid';
          const endMarker = style.endMarker || 'arrow';

          const points = controlPoints.map(p => toSVG(p.x, p.y, width, height));
          const pathD = points.length === 2
            ? `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
            : `M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`;

          const lastPoint = points[points.length - 1];
          const prevPoint = points[points.length - 2];

          return (
            <g key={`route-${i}`}>
              <path
                d={pathD}
                fill="none"
                stroke={stroke}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={lineStyle === 'dashed' ? '3,1.5' : lineStyle === 'dotted' ? '1,1.5' : undefined}
              />
              {/* End marker based on style */}
              {endMarker === 'arrow' && renderArrow(lastPoint.x, lastPoint.y, prevPoint.x, prevPoint.y, stroke)}
              {endMarker === 't_block' && renderTBlock(lastPoint.x, lastPoint.y, prevPoint.x, prevPoint.y, stroke)}
              {endMarker === 'circle' && renderCircle(lastPoint.x, lastPoint.y, stroke)}
            </g>
          );
        }

        if (action.actionType === 'block') {
          const blockAction = action as BlockAction;
          const pathPoints = blockAction.block?.pathPoints || [];
          if (pathPoints.length < 2) return null;

          const style: ActionStyle = { ...DEFAULT_ACTION_STYLE, ...blockAction.style };
          const stroke = style.stroke || '#000000';
          const endMarker = style.endMarker || 't_block';

          const points = pathPoints.map(p => toSVG(p.x, p.y, width, height));
          const lastPoint = points[points.length - 1];
          const prevPoint = points[points.length - 2];

          return (
            <g key={`block-${i}`}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={stroke}
                strokeWidth={1.5}
              />
              {/* End marker based on style */}
              {endMarker === 't_block' && renderTBlock(lastPoint.x, lastPoint.y, prevPoint.x, prevPoint.y, stroke)}
              {endMarker === 'arrow' && renderArrow(lastPoint.x, lastPoint.y, prevPoint.x, prevPoint.y, stroke)}
              {endMarker === 'circle' && renderCircle(lastPoint.x, lastPoint.y, stroke)}
            </g>
          );
        }

        return null;
      })}

      {/* Players - Editor uses white fill, black border */}
      {players.map((player, i) => {
        if (player.role === 'BALL') return null;

        const pos = toSVG(player.alignment.x, player.alignment.y, width, height);
        const appearance: PlayerAppearance = { ...DEFAULT_PLAYER_APPEARANCE, ...player.appearance };
        const shape = appearance.shape || 'circle';
        const isOL = ['C', 'LG', 'RG', 'LT', 'RT'].includes(player.label || '');
        const playerSize = isOL ? baseSize * 0.9 : baseSize;

        // Editor style: white fill, black border
        const fill = '#ffffff';
        const stroke = '#000000';

        return (
          <g key={player.id || i}>
            {(shape === 'square' || isOL) ? (
              <rect
                x={pos.x - playerSize}
                y={pos.y - playerSize}
                width={playerSize * 2}
                height={playerSize * 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.8}
              />
            ) : shape === 'triangle' ? (
              <polygon
                points={`${pos.x},${pos.y - playerSize} ${pos.x - playerSize},${pos.y + playerSize} ${pos.x + playerSize},${pos.y + playerSize}`}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.8}
              />
            ) : shape === 'diamond' ? (
              <polygon
                points={`${pos.x},${pos.y - playerSize} ${pos.x + playerSize},${pos.y} ${pos.x},${pos.y + playerSize} ${pos.x - playerSize},${pos.y}`}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.8}
              />
            ) : (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={playerSize}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.8}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
