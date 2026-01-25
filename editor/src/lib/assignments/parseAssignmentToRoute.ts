/**
 * Parse assignment text and update route/block actions accordingly
 */

import { v4 as uuidv4 } from 'uuid';
import type { Action, RouteAction, BlockAction, Point, Player } from '@/types/dsl';
import { calculateRouteEndPoint } from '../concept-builder';

// Common route pattern keywords
const ROUTE_PATTERNS: Record<string, { pattern: string; defaultDepth: number }> = {
  // Quick game
  'slant': { pattern: 'slant', defaultDepth: 6 },
  'quick slant': { pattern: 'quick_slant', defaultDepth: 5 },
  'hitch': { pattern: 'hitch', defaultDepth: 5 },
  'curl': { pattern: 'curl', defaultDepth: 8 },
  'out': { pattern: 'out', defaultDepth: 5 },
  'quick out': { pattern: 'quick_out', defaultDepth: 3 },
  'speed out': { pattern: 'speed_out', defaultDepth: 3 },
  'flat': { pattern: 'flat', defaultDepth: 2 },
  'stick': { pattern: 'stick', defaultDepth: 5 },
  'snag': { pattern: 'snag', defaultDepth: 5 },
  'bubble': { pattern: 'bubble', defaultDepth: 1 },
  'screen': { pattern: 'screen', defaultDepth: 0 },

  // Intermediate
  'dig': { pattern: 'dig', defaultDepth: 12 },
  'in': { pattern: 'in', defaultDepth: 10 },
  'cross': { pattern: 'cross', defaultDepth: 8 },
  'shallow': { pattern: 'shallow', defaultDepth: 4 },
  'drag': { pattern: 'shallow', defaultDepth: 3 },
  'comeback': { pattern: 'comeback', defaultDepth: 12 },
  'corner': { pattern: 'corner', defaultDepth: 12 },

  // Deep
  'go': { pattern: 'go', defaultDepth: 15 },
  'streak': { pattern: 'go', defaultDepth: 15 },
  'fade': { pattern: 'go', defaultDepth: 15 },
  'post': { pattern: 'post', defaultDepth: 14 },
  'skinny post': { pattern: 'skinny_post', defaultDepth: 12 },
  'seam': { pattern: 'seam', defaultDepth: 14 },

  // Backfield
  'swing': { pattern: 'swing', defaultDepth: 3 },
  'flare': { pattern: 'flare', defaultDepth: 2 },
  'wheel': { pattern: 'wheel', defaultDepth: 12 },
  'angle': { pattern: 'angle', defaultDepth: 6 },
  'texas': { pattern: 'texas', defaultDepth: 6 },
  'check': { pattern: 'flat', defaultDepth: 3 },
  'checkdown': { pattern: 'flat', defaultDepth: 3 },
};

// Block scheme keywords
const BLOCK_SCHEMES: Record<string, string> = {
  'zone': 'zone_step',
  'zone step': 'zone_step',
  'reach': 'reach',
  'combo': 'combo',
  'climb': 'climb',
  'scoop': 'scoop',
  'down': 'down',
  'kick': 'kick',
  'pull': 'pull_lead',
  'pull kick': 'pull_kick',
  'pull lead': 'pull_lead',
  'trap': 'trap',
  'wham': 'wham',
  'arc': 'arc',
  'lead': 'lead',
  'iso': 'iso',
  'insert': 'insert',
  'crack': 'crack',
  'stalk': 'stalk',
  'pass pro': 'zone_step',
  'pass protection': 'zone_step',
  'slide': 'zone_step',
  'man': 'zone_step',
  'boc': 'zone_step', // block on contact
};

interface ParsedAssignment {
  routePattern?: string;
  routeDepth?: number;
  blockScheme?: string;
  direction?: 'inside' | 'outside';
}

/**
 * Parse assignment text to extract route/block info
 */
export function parseAssignmentText(text: string): ParsedAssignment {
  const lowerText = text.toLowerCase().trim();
  const result: ParsedAssignment = {};

  // Try to find route pattern
  for (const [keyword, routeInfo] of Object.entries(ROUTE_PATTERNS)) {
    if (lowerText.includes(keyword)) {
      result.routePattern = routeInfo.pattern;
      result.routeDepth = routeInfo.defaultDepth;

      // Try to extract custom depth (e.g., "curl 10", "post 15")
      const depthMatch = lowerText.match(new RegExp(`${keyword}\\s*(\\d+)`));
      if (depthMatch) {
        result.routeDepth = parseInt(depthMatch[1], 10);
      }

      break;
    }
  }

  // Try to find block scheme
  for (const [keyword, scheme] of Object.entries(BLOCK_SCHEMES)) {
    if (lowerText.includes(keyword)) {
      result.blockScheme = scheme;
      break;
    }
  }

  // Direction hints
  if (lowerText.includes('outside') || lowerText.includes('out')) {
    result.direction = 'outside';
  } else if (lowerText.includes('inside') || lowerText.includes('in')) {
    result.direction = 'inside';
  }

  return result;
}

/**
 * Update or create route action based on assignment text
 */
export function syncRouteFromAssignment(
  playerId: string,
  assignmentText: string,
  player: Player,
  existingActions: Action[]
): Action[] {
  const parsed = parseAssignmentText(assignmentText);
  const newActions = [...existingActions];

  // Find existing route action for this player
  const routeIdx = newActions.findIndex(
    (a) => a.actionType === 'route' && a.fromPlayerId === playerId
  );

  // If we parsed a route pattern, update/create route
  if (parsed.routePattern && parsed.routeDepth) {
    const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
    const routeDepth = Math.min(parsed.routeDepth * 0.04, 0.56); // Convert to normalized

    const { controlPoints, isAngular } = calculateRouteEndPoint(
      startPoint,
      parsed.routePattern,
      parsed.direction,
      routeDepth
    );

    const routeAction: RouteAction = {
      id: routeIdx >= 0 ? (newActions[routeIdx] as RouteAction).id : uuidv4(),
      actionType: 'route',
      fromPlayerId: playerId,
      layer: 'primary',
      style: {
        stroke: '#000000',
        strokeWidth: 2,
        lineStyle: 'solid',
        endMarker: 'arrow',
      },
      route: {
        pattern: parsed.routePattern,
        depth: parsed.routeDepth,
        controlPoints,
        pathType: 'straight',
        tension: isAngular ? 0 : (controlPoints.length > 2 ? 0.3 : 0),
      },
    };

    if (routeIdx >= 0) {
      newActions[routeIdx] = routeAction;
    } else {
      newActions.push(routeAction);
    }
  }

  // Find existing block action for this player
  const blockIdx = newActions.findIndex(
    (a) => a.actionType === 'block' && a.fromPlayerId === playerId
  );

  // If we parsed a block scheme, update/create block
  if (parsed.blockScheme) {
    const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
    const endPoint: Point = {
      x: startPoint.x,
      y: startPoint.y + 0.05, // Default forward movement
    };

    // Adjust end point based on scheme
    const scheme = parsed.blockScheme;
    if (scheme === 'pull_kick' || scheme === 'pull_lead') {
      endPoint.x = startPoint.x + (startPoint.x > 0.5 ? -0.15 : 0.15);
      endPoint.y = startPoint.y + 0.1;
    } else if (scheme === 'reach') {
      endPoint.x = startPoint.x + (startPoint.x > 0.5 ? -0.05 : 0.05);
      endPoint.y = startPoint.y + 0.03;
    } else if (scheme === 'arc') {
      endPoint.x = startPoint.x + (startPoint.x > 0.5 ? -0.12 : 0.12);
      endPoint.y = startPoint.y + 0.1;
    } else if (scheme === 'lead' || scheme === 'iso' || scheme === 'insert') {
      endPoint.y = startPoint.y + 0.1;
    }

    const blockAction: BlockAction = {
      id: blockIdx >= 0 ? (newActions[blockIdx] as BlockAction).id : uuidv4(),
      actionType: 'block',
      fromPlayerId: playerId,
      layer: 'primary',
      style: {
        stroke: '#000000',
        strokeWidth: 2,
        lineStyle: 'solid',
        endMarker: 't_block',
      },
      block: {
        scheme,
        target: {
          toPlayerId: undefined,
          landmark: endPoint,
        },
        pathPoints: [startPoint, endPoint],
        pathType: 'straight',
      },
    };

    if (blockIdx >= 0) {
      newActions[blockIdx] = blockAction;
    } else {
      newActions.push(blockAction);
    }
  }

  return newActions;
}
