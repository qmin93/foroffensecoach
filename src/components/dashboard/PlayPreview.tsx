'use client';

import { useMemo } from 'react';
import { Tables } from '@/types/database';
import type { Player, Action, RouteAction, BlockAction } from '@/types/dsl';

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

export function PlayPreview({ play, width = 160, height = 120 }: PlayPreviewProps) {
  const { players, actions, hasData } = useMemo(() => {
    try {
      const roster = play.roster as { players?: Player[] } | null;
      const actionsData = play.actions as Action[] | null;

      const players = roster?.players || [];
      const actions = actionsData || [];

      // Debug logging
      console.log('PlayPreview data:', {
        playName: play.name,
        playersCount: players.length,
        actionsCount: actions.length,
        firstAction: actions[0],
      });

      return {
        players,
        actions,
        hasData: players.length > 0,
      };
    } catch {
      return { players: [], actions: [], hasData: false };
    }
  }, [play]);

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </div>
    );
  }

  // Find player by ID for route rendering
  const playerMap = new Map(players.map(p => [p.id, p]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full bg-green-900/30"
    >
      {/* Field background */}
      <rect x={0} y={0} width={width} height={height} fill="#1a2f1a" />

      {/* Yard lines */}
      {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
        <line
          key={i}
          x1={0}
          y1={y * height}
          x2={width}
          y2={y * height}
          stroke="#2d4a2d"
          strokeWidth={1}
        />
      ))}

      {/* LOS - Line of Scrimmage at y=0 which maps to height * 0.6 */}
      <line
        x1={0}
        y1={height * 0.6}
        x2={width}
        y2={height * 0.6}
        stroke="#4a7a4a"
        strokeWidth={2}
      />

      {/* Routes and Blocks */}
      {actions.map((action, i) => {
        if (action.actionType === 'route') {
          const routeAction = action as RouteAction;
          const controlPoints = routeAction.route?.controlPoints || [];
          if (controlPoints.length < 2) return null;

          const points = controlPoints.map(p => toSVG(p.x, p.y, width, height));
          const pathD = points.length === 2
            ? `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
            : `M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`;

          return (
            <g key={`route-${i}`}>
              <path
                d={pathD}
                fill="none"
                stroke="#000000"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Arrow head */}
              {points.length >= 2 && (
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r={3}
                  fill="#000000"
                />
              )}
            </g>
          );
        }

        if (action.actionType === 'block') {
          const blockAction = action as BlockAction;
          const pathPoints = blockAction.block?.pathPoints || [];
          if (pathPoints.length < 2) return null;

          const points = pathPoints.map(p => toSVG(p.x, p.y, width, height));

          return (
            <g key={`block-${i}`}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke="#000000"
                strokeWidth={2}
              />
              {/* T-block marker */}
              <line
                x1={points[1].x - 4}
                y1={points[1].y}
                x2={points[1].x + 4}
                y2={points[1].y}
                stroke="#000000"
                strokeWidth={2}
              />
            </g>
          );
        }

        return null;
      })}

      {/* Players - white fill with black border */}
      {players.map((player, i) => {
        if (player.role === 'BALL') return null;

        const pos = toSVG(player.alignment.x, player.alignment.y, width, height);
        const isOL = ['C', 'LG', 'RG', 'LT', 'RT'].includes(player.label || '');
        const size = isOL ? 5 : 6;

        return (
          <g key={player.id || i}>
            {isOL ? (
              <rect
                x={pos.x - size}
                y={pos.y - size}
                width={size * 2}
                height={size * 2}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={1}
              />
            ) : (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
