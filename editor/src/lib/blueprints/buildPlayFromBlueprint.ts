/**
 * Build Play From Blueprint
 *
 * Converts a Blueprint definition into actual Play actions and assignments.
 * This is the bridge between the declarative Blueprint and the runtime Play state.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Action, Player, Point, RouteAction, BlockAction } from '@/types/dsl';
import type { Blueprint, BlueprintRole, BlueprintRoute, BlueprintBlock } from './tier1Blueprints';
import { calculateRouteEndPoint } from '../concept-builder';

// Position alias mapping for flexible role matching
const POSITION_ALIASES: Record<string, string[]> = {
  'Y': ['TE', 'Y', 'U'],
  'Z': ['WR', 'Z', 'SE'],
  'X': ['WR', 'X', 'FL'],
  'H': ['WR', 'H', 'SLOT'],
  'F': ['WR', 'F', 'SLOT'],
  'RB': ['RB', 'TB', 'HB', 'B', 'TAIL'],
  'FB': ['FB', 'F', 'FULL'],
  'TE': ['TE', 'Y', 'U'],
  'WR': ['WR', 'X', 'Z', 'H', 'F', 'SE', 'FL'],
  'LT': ['LT', 'T'],
  'LG': ['LG', 'G'],
  'C': ['C'],
  'RG': ['RG', 'G'],
  'RT': ['RT', 'T'],
};

/**
 * Check if a player matches a blueprint role
 */
function playerMatchesRole(player: Player, role: string): boolean {
  const upperRole = role.toUpperCase();
  const playerRole = player.role?.toUpperCase() || '';
  const playerLabel = player.label?.toUpperCase() || '';

  // Direct match on label (most specific)
  if (playerLabel === upperRole) {
    return true;
  }

  // Check role includes
  if (playerRole.includes(upperRole)) {
    return true;
  }

  // Check aliases
  const aliases = POSITION_ALIASES[upperRole] || [];
  for (const alias of aliases) {
    if (playerRole.includes(alias) || playerLabel === alias) {
      return true;
    }
  }

  return false;
}

/**
 * Find the best matching player for a blueprint role
 */
function findPlayerForRole(players: Player[], role: string, usedPlayerIds: Set<string>): Player | null {
  // First try exact label match
  for (const player of players) {
    if (usedPlayerIds.has(player.id)) continue;
    if (player.label?.toUpperCase() === role.toUpperCase()) {
      return player;
    }
  }

  // Then try role match with aliases
  for (const player of players) {
    if (usedPlayerIds.has(player.id)) continue;
    if (playerMatchesRole(player, role)) {
      return player;
    }
  }

  return null;
}

/**
 * Create a route action from blueprint route definition
 */
function createRouteAction(
  player: Player,
  route: BlueprintRoute
): RouteAction {
  const startPoint: Point = {
    x: player.alignment.x,
    y: player.alignment.y,
  };

  // Convert depth from yards to normalized (1 yard = 0.04)
  const normalizedDepth = Math.min(route.depth * 0.04, 0.56);

  const { controlPoints, isAngular } = calculateRouteEndPoint(
    startPoint,
    route.pattern,
    route.direction,
    normalizedDepth,
    route.breakAngle
  );

  return {
    id: uuidv4(),
    actionType: 'route',
    fromPlayerId: player.id,
    layer: 'primary',
    style: {
      stroke: '#000000',
      strokeWidth: 2,
      lineStyle: 'solid',
      endMarker: 'arrow',
    },
    route: {
      pattern: route.pattern,
      depth: route.depth,
      controlPoints,
      pathType: 'straight',
      tension: isAngular ? 0 : (controlPoints.length > 2 ? 0.3 : 0),
    },
  };
}

/**
 * Create a block action from blueprint block definition
 */
function createBlockAction(
  player: Player,
  block: BlueprintBlock
): BlockAction {
  const startPoint: Point = {
    x: player.alignment.x,
    y: player.alignment.y,
  };

  // Determine end point based on scheme
  let endPoint: Point = { ...startPoint, y: startPoint.y + 0.05 };

  const scheme = block.scheme;
  if (block.target) {
    endPoint = { x: block.target.x, y: block.target.y };
  } else if (scheme === 'pull_kick' || scheme === 'pull_lead') {
    // Pull blocks go horizontally then forward
    endPoint = {
      x: startPoint.x + (startPoint.x > 0.5 ? -0.15 : 0.15),
      y: startPoint.y + 0.1,
    };
  } else if (scheme === 'reach') {
    // Reach blocks go slightly outside and forward
    endPoint = {
      x: startPoint.x + (startPoint.x > 0.5 ? -0.05 : 0.05),
      y: startPoint.y + 0.03,
    };
  } else if (scheme === 'arc') {
    // Arc blocks go wide
    endPoint = {
      x: startPoint.x + (startPoint.x > 0.5 ? -0.12 : 0.12),
      y: startPoint.y + 0.1,
    };
  } else if (scheme === 'lead' || scheme === 'iso' || scheme === 'insert') {
    // Lead blocks go straight forward
    endPoint = { x: startPoint.x, y: startPoint.y + 0.1 };
  } else if (scheme === 'down') {
    // Down blocks angle inside
    endPoint = {
      x: startPoint.x + (startPoint.x > 0.5 ? 0.04 : -0.04),
      y: startPoint.y + 0.04,
    };
  } else if (scheme === 'stalk' || scheme === 'crack') {
    // WR blocks toward middle of field
    endPoint = {
      x: startPoint.x + (startPoint.x > 0.5 ? -0.08 : 0.08),
      y: startPoint.y + 0.06,
    };
  }

  // Determine if zone block (curved) vs gap block (straight)
  const ZONE_SCHEMES = ['zone_step', 'reach', 'combo', 'climb', 'scoop'];
  const isZone = ZONE_SCHEMES.includes(scheme);

  return {
    id: uuidv4(),
    actionType: 'block',
    fromPlayerId: player.id,
    layer: 'primary',
    style: {
      stroke: '#000000',
      strokeWidth: 2,
      lineStyle: 'solid',
      endMarker: isZone ? 'arrow' : 't_block',
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
}

export interface BuildResult {
  actions: Action[];
  assignments: Map<string, string>;  // playerId -> assignment text
  matchedRoles: number;
  unmatchedRoles: string[];
}

/**
 * Build play actions and assignments from a blueprint
 */
export function buildPlayFromBlueprint(
  blueprint: Blueprint,
  players: Player[]
): BuildResult {
  const actions: Action[] = [];
  const assignments = new Map<string, string>();
  const usedPlayerIds = new Set<string>();
  const unmatchedRoles: string[] = [];

  // Process each role in the blueprint
  for (const role of blueprint.roles) {
    const player = findPlayerForRole(players, role.role, usedPlayerIds);

    if (!player) {
      unmatchedRoles.push(role.role);
      continue;
    }

    // Skip BALL and QB for action generation
    if (player.role === 'BALL') continue;

    usedPlayerIds.add(player.id);

    // Store assignment text
    if (role.assignment) {
      assignments.set(player.id, role.assignment);
    }

    // Skip QB for action generation (usually just assignment text)
    if (player.role === 'QB') continue;

    // Generate action if defined
    if (role.action) {
      if (role.action.type === 'route') {
        const routeAction = createRouteAction(player, role.action as BlueprintRoute);
        actions.push(routeAction);
      } else if (role.action.type === 'block') {
        const blockAction = createBlockAction(player, role.action as BlueprintBlock);
        actions.push(blockAction);
      }
      // Motion actions can be added here when needed
    }
  }

  return {
    actions,
    assignments,
    matchedRoles: usedPlayerIds.size,
    unmatchedRoles,
  };
}

/**
 * Create assignment actions from the assignment map
 * These are stored in play.actions as actionType: 'assignment'
 */
export function createAssignmentActions(
  assignments: Map<string, string>
): Action[] {
  const assignmentActions: Action[] = [];

  for (const [playerId, text] of assignments.entries()) {
    assignmentActions.push({
      id: uuidv4(),
      actionType: 'assignment',
      fromPlayerId: playerId,
      assignment: {
        text,
        priority: 1,
      },
    } as Action);
  }

  return assignmentActions;
}
