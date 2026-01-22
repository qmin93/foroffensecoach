'use client';

import { useMemo, useState } from 'react';
import { Group, Arrow, Text, Rect } from 'react-konva';
import { Player, Point } from '@/types/dsl';
import { toPixel } from '@/utils/coordinates';

interface RouteTreeOverlayProps {
  player: Player;
  width: number;
  height: number;
  onRouteSelect?: (playerId: string, routePattern: string, depth: number) => void;
}

// Standard route definitions with normalized depths (1 yard = 0.04)
const ROUTE_TREE: {
  name: string;
  pattern: string;
  depth: number; // in yards
  breakAngle: number; // degrees from vertical (0 = straight up, 90 = horizontal right, -90 = horizontal left)
}[] = [
  // Vertical routes
  { name: 'Go', pattern: 'go', depth: 15, breakAngle: 0 },

  // Deep breaking routes (12 yards)
  { name: 'Post', pattern: 'post', depth: 12, breakAngle: 45 },
  { name: 'Corner', pattern: 'corner', depth: 12, breakAngle: -45 },

  // Intermediate routes (10 yards)
  { name: 'Out', pattern: 'out', depth: 10, breakAngle: -90 },
  { name: 'In', pattern: 'in', depth: 10, breakAngle: 90 },

  // Short routes
  { name: 'Curl', pattern: 'curl', depth: 8, breakAngle: 180 },
  { name: 'Slant', pattern: 'slant', depth: 6, breakAngle: 60 },
  { name: 'Flat', pattern: 'flat', depth: 3, breakAngle: -90 },
];

// Determine if player is on left or right side of field
function isLeftSide(x: number): boolean {
  return x < 0.5;
}

// Calculate route path for a specific route from a player position
function calculateRoutePath(
  player: Player,
  route: typeof ROUTE_TREE[0],
  width: number,
  height: number
): { points: number[]; labelPos: { x: number; y: number }; endPos: { x: number; y: number } } {
  const startPos = toPixel(player.alignment, width, height);
  const onLeftSide = isLeftSide(player.alignment.x);

  // Convert yards to normalized (1 yard = 0.04)
  const depthNormalized = route.depth * 0.04;

  // Adjust break angle based on side of field
  let adjustedAngle = route.breakAngle;
  if (onLeftSide) {
    if (['out', 'corner', 'flat'].includes(route.pattern)) {
      adjustedAngle = Math.abs(route.breakAngle);
    } else if (['in', 'slant', 'post'].includes(route.pattern)) {
      adjustedAngle = -Math.abs(route.breakAngle);
    }
  } else {
    if (['out', 'corner', 'flat'].includes(route.pattern)) {
      adjustedAngle = -Math.abs(route.breakAngle);
    } else if (['in', 'slant', 'post'].includes(route.pattern)) {
      adjustedAngle = Math.abs(route.breakAngle);
    }
  }

  // Calculate break point
  const breakY = player.alignment.y + depthNormalized;
  const breakPos = toPixel({ x: player.alignment.x, y: breakY }, width, height);

  // For curl route
  if (route.pattern === 'curl') {
    const endY = breakY - 0.08;
    const endPos = toPixel({ x: player.alignment.x, y: endY }, width, height);
    return {
      points: [startPos.x, startPos.y, breakPos.x, breakPos.y, endPos.x, endPos.y],
      labelPos: { x: endPos.x, y: endPos.y - 15 },
      endPos: { x: endPos.x, y: endPos.y },
    };
  }

  // For flat route
  if (route.pattern === 'flat') {
    const horizontalDistance = onLeftSide ? -0.15 : 0.15;
    const endX = player.alignment.x + horizontalDistance;
    const endY = player.alignment.y + depthNormalized;
    const endPos = toPixel({ x: endX, y: endY }, width, height);
    return {
      points: [startPos.x, startPos.y, endPos.x, endPos.y],
      labelPos: { x: endPos.x + (onLeftSide ? -20 : 20), y: endPos.y },
      endPos: { x: endPos.x, y: endPos.y },
    };
  }

  // Calculate end point based on break angle
  const angleRad = (adjustedAngle * Math.PI) / 180;
  const breakDistance = 0.15;

  const endX = player.alignment.x + Math.sin(angleRad) * breakDistance;
  const endY = breakY + Math.cos(angleRad) * breakDistance;
  const endPos = toPixel({ x: endX, y: endY }, width, height);

  // For go route
  if (route.pattern === 'go') {
    return {
      points: [startPos.x, startPos.y, endPos.x, endPos.y],
      labelPos: { x: endPos.x, y: endPos.y - 15 },
      endPos: { x: endPos.x, y: endPos.y },
    };
  }

  // For slant
  if (route.pattern === 'slant') {
    const slantX = player.alignment.x + (onLeftSide ? -0.08 : 0.08);
    const slantY = player.alignment.y + depthNormalized;
    const slantPos = toPixel({ x: slantX, y: slantY }, width, height);
    return {
      points: [startPos.x, startPos.y, slantPos.x, slantPos.y],
      labelPos: { x: slantPos.x + (onLeftSide ? -20 : 20), y: slantPos.y },
      endPos: { x: slantPos.x, y: slantPos.y },
    };
  }

  // For breaking routes
  return {
    points: [startPos.x, startPos.y, breakPos.x, breakPos.y, endPos.x, endPos.y],
    labelPos: { x: endPos.x + (adjustedAngle > 0 ? 20 : -20), y: endPos.y },
    endPos: { x: endPos.x, y: endPos.y },
  };
}

// Check if player role is a receiver
function isReceiver(role: string): boolean {
  const receiverRoles = ['WR', 'TE', 'RB', 'FB', 'H', 'X', 'Y', 'Z', 'SLOT', 'SE', 'FL'];
  return receiverRoles.includes(role.toUpperCase());
}

export function RouteTreeOverlay({ player, width, height, onRouteSelect }: RouteTreeOverlayProps) {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  // Only show for receiver positions
  if (!isReceiver(player.role)) {
    return null;
  }

  const routes = useMemo(() => {
    return ROUTE_TREE.map((route) => {
      const { points, labelPos, endPos } = calculateRoutePath(player, route, width, height);
      return {
        ...route,
        points,
        labelPos,
        endPos,
      };
    });
  }, [player, width, height]);

  const handleRouteClick = (routePattern: string, depth: number) => {
    if (onRouteSelect) {
      onRouteSelect(player.id, routePattern, depth);
    }
  };

  return (
    <Group>
      {routes.map((route) => {
        const isHovered = hoveredRoute === route.pattern;
        return (
          <Group key={route.pattern}>
            {/* Clickable hit area (invisible wider line) */}
            <Arrow
              points={route.points}
              stroke="transparent"
              strokeWidth={15}
              hitStrokeWidth={20}
              pointerLength={0}
              pointerWidth={0}
              onClick={() => handleRouteClick(route.pattern, route.depth)}
              onTap={() => handleRouteClick(route.pattern, route.depth)}
              onMouseEnter={() => setHoveredRoute(route.pattern)}
              onMouseLeave={() => setHoveredRoute(null)}
              listening={true}
            />
            {/* Visible route line */}
            <Arrow
              points={route.points}
              stroke={isHovered ? '#2563eb' : '#3b82f6'}
              strokeWidth={isHovered ? 2.5 : 1.5}
              opacity={isHovered ? 0.8 : 0.4}
              pointerLength={6}
              pointerWidth={5}
              fill={isHovered ? '#2563eb' : '#3b82f6'}
              lineCap="round"
              lineJoin="round"
              dash={isHovered ? undefined : [4, 4]}
              listening={false}
            />
            {/* Route label with background */}
            {isHovered && (
              <Rect
                x={route.labelPos.x - route.name.length * 3.5}
                y={route.labelPos.y - 8}
                width={route.name.length * 7}
                height={16}
                fill="#2563eb"
                cornerRadius={3}
                listening={false}
              />
            )}
            <Text
              x={route.labelPos.x}
              y={route.labelPos.y}
              text={route.name}
              fontSize={isHovered ? 11 : 9}
              fontStyle={isHovered ? 'bold' : 'normal'}
              fill={isHovered ? '#ffffff' : '#3b82f6'}
              opacity={isHovered ? 1 : 0.7}
              offsetX={route.name.length * (isHovered ? 3.5 : 2.5)}
              offsetY={5}
              listening={false}
            />
          </Group>
        );
      })}
    </Group>
  );
}
