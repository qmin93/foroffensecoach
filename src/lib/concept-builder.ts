/**
 * Concept Builder Utility
 *
 * Generates actions (routes, blocks) from a concept template
 * for a given set of players.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Concept } from '@/types/concept';
import type { Player, Point, Action, RouteAction, BlockAction, ActionStyle } from '@/types/dsl';

const DEFAULT_ACTION_STYLE: ActionStyle = {
  stroke: '#000000', // Black - editor uses only black and white
  strokeWidth: 2,
  lineStyle: 'solid',
  endMarker: 'arrow',
};

// Position alias mapping for concept matching
// Concepts use labels like Y, Z, X, H, F but formations may use TE, WR, etc.
const POSITION_ALIASES: Record<string, string[]> = {
  // Receiver positions
  'Y': ['TE', 'Y', 'U'],  // Y is typically TE
  'Z': ['WR', 'Z', 'SE'],  // Z is split end / flanker
  'X': ['WR', 'X', 'FL'],  // X is outside receiver
  'H': ['WR', 'H', 'SLOT'],  // H is slot receiver
  'F': ['WR', 'F', 'SLOT'],  // F is slot/flex
  // Backfield
  'RB': ['RB', 'TB', 'HB', 'B', 'TAIL'],  // Running back
  'FB': ['FB', 'F', 'FULL'],  // Fullback
  'WB': ['WB', 'WING'],  // Wingback
  // Generic
  'TE': ['TE', 'Y', 'U'],
  'WR': ['WR', 'X', 'Z', 'H', 'F', 'SE', 'FL'],
};

/**
 * Check if a player matches a role requirement
 * Exported for use in editorStore
 */
export function playerMatchesRole(player: Player, roleMatch: string): boolean {
  const upperRole = roleMatch.toUpperCase();
  const playerRole = player.role?.toUpperCase() || '';
  const playerLabel = player.label?.toUpperCase() || '';

  // Direct match
  if (playerRole.includes(upperRole) || playerLabel === upperRole) {
    return true;
  }

  // Check aliases - if concept wants 'Y', also match 'TE'
  const aliases = POSITION_ALIASES[upperRole] || [];
  for (const alias of aliases) {
    if (playerRole.includes(alias) || playerLabel === alias) {
      return true;
    }
  }

  // Reverse check - if player is 'TE' and concept wants 'Y'
  for (const [key, vals] of Object.entries(POSITION_ALIASES)) {
    if (vals.includes(upperRole)) {
      if (playerRole.includes(key) || playerLabel === key) {
        return true;
      }
    }
  }

  return false;
}

interface BuildConceptResult {
  actions: Action[];
  actionsCreated: number;
}

/**
 * Calculate route end point based on pattern and direction
 */
function calculateRouteEndPoint(
  startPoint: Point,
  pattern: string,
  direction: string | undefined,
  routeDepth: number
): { endPoint: Point; controlPoint?: Point } {
  let endPoint: Point = { x: startPoint.x, y: startPoint.y + routeDepth };
  let controlPoint: Point | undefined;

  switch (pattern) {
    case 'slant':
    case 'quick_slant':
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
    case 'dragon':
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
    case 'skinny_post':
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
    case 'in':
    case 'cross':
    case 'shallow':
    case 'china':
    case 'scissor':
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
    case 'snag':
    case 'comeback':
      endPoint = {
        x: startPoint.x,
        y: startPoint.y + routeDepth,
      };
      break;

    case 'flat':
    case 'arrow':
    case 'swing':
    case 'flare':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.12 : -0.12),
        y: startPoint.y + routeDepth * 0.3,
      };
      break;

    case 'wheel':
    case 'follow':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.15 : -0.15),
        y: startPoint.y + routeDepth,
      };
      controlPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
        y: startPoint.y + routeDepth * 0.3,
      };
      break;

    case 'out_and_up':
    case 'out_up':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
        y: startPoint.y + routeDepth,
      };
      controlPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.12 : -0.12),
        y: startPoint.y + routeDepth * 0.3,
      };
      break;

    case 'bench':
    case 'drive':
      endPoint = {
        x: startPoint.x + (direction === 'outside' ? (startPoint.x > 0.5 ? 0.15 : -0.15) : 0),
        y: startPoint.y + routeDepth,
      };
      break;

    case 'texas':
    case 'angle':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? -0.1 : 0.1),
        y: startPoint.y + routeDepth * 0.6,
      };
      controlPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.05 : -0.05),
        y: startPoint.y + routeDepth * 0.2,
      };
      break;

    case 'whip':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
        y: startPoint.y + routeDepth * 0.7,
      };
      controlPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? -0.05 : 0.05),
        y: startPoint.y + routeDepth * 0.5,
      };
      break;

    case 'bubble':
    case 'tunnel':
    case 'screen':
    case 'slip':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
        y: startPoint.y + routeDepth * 0.2,
      };
      break;

    case 'divide':
    case 'seam':
      endPoint = {
        x: startPoint.x + (startPoint.x > 0.5 ? -0.03 : 0.03),
        y: startPoint.y + routeDepth,
      };
      break;

    case 'go':
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

  if (controlPoint) {
    controlPoint.x = Math.max(0.05, Math.min(0.95, controlPoint.x));
    controlPoint.y = Math.max(-0.95, Math.min(0.95, controlPoint.y));
  }

  return { endPoint, controlPoint };
}

/**
 * Calculate block end point based on scheme
 */
function calculateBlockEndPoint(
  startPoint: Point,
  scheme: string,
  defaultSide: string
): Point {
  const endPoint: Point = {
    x: startPoint.x,
    y: startPoint.y + 0.05, // Short forward movement
  };

  switch (scheme) {
    case 'pull_kick':
    case 'pull_lead':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? 0.15 : -0.15);
      endPoint.y = startPoint.y + 0.1;
      break;

    case 'reach':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? 0.05 : -0.05);
      endPoint.y = startPoint.y + 0.03;
      break;

    case 'trap':
    case 'wham':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? 0.1 : -0.1);
      endPoint.y = startPoint.y + 0.08;
      break;

    case 'arc':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? 0.12 : -0.12);
      endPoint.y = startPoint.y + 0.1;
      break;

    case 'crack':
    case 'stalk':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? -0.05 : 0.05);
      endPoint.y = startPoint.y + 0.08;
      break;

    case 'lead':
    case 'iso':
    case 'insert':
      endPoint.y = startPoint.y + 0.1;
      break;

    case 'down':
    case 'kick':
      endPoint.x = startPoint.x + (defaultSide === 'right' ? 0.03 : -0.03);
      endPoint.y = startPoint.y + 0.05;
      break;

    case 'zone_step':
    case 'combo':
    case 'climb':
    case 'scoop':
    default:
      endPoint.y = startPoint.y + 0.05;
      break;
  }

  return endPoint;
}

/**
 * Build actions from a concept template for given players
 */
export function buildConceptActions(
  concept: Concept,
  players: Player[]
): BuildConceptResult {
  const actions: Action[] = [];
  const assignedPlayerIds = new Set<string>();
  let actionsCreated = 0;

  const template = concept.template;
  const defaultSide = template.buildPolicy.defaultSide || 'strength';

  // Process each role in the template
  for (const role of template.roles) {
    // Find matching players for this role using flexible position matching
    const matchingPlayers = players.filter((p) =>
      role.appliesTo.some((roleMatch) => playerMatchesRole(p, roleMatch))
    );

    for (const player of matchingPlayers) {
      if (assignedPlayerIds.has(player.id)) continue;

      const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };

      // Create route action if specified
      if (role.defaultRoute) {
        const routeDepth = (role.defaultRoute.depth ?? 10) / 100; // Convert yards to normalized
        const { endPoint, controlPoint } = calculateRouteEndPoint(
          startPoint,
          role.defaultRoute.pattern,
          role.defaultRoute.direction,
          routeDepth
        );

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
            pattern: role.defaultRoute.pattern,
            depth: role.defaultRoute.depth,
            controlPoints,
            pathType: controlPoint ? 'tension' : 'straight',
            tension: controlPoint ? 0.5 : 0,
          },
        };

        actions.push(routeAction);
        assignedPlayerIds.add(player.id);
        actionsCreated++;
      }

      // Create block action if specified (for run concepts)
      if (role.defaultBlock) {
        const endPoint = calculateBlockEndPoint(startPoint, role.defaultBlock.scheme, defaultSide);

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
            scheme: role.defaultBlock.scheme,
            target: {
              toPlayerId: undefined,
              landmark: endPoint,
            },
            pathPoints: [startPoint, endPoint],
            pathType: 'straight',
          },
        };

        actions.push(blockAction);
        assignedPlayerIds.add(player.id);
        actionsCreated++;
      }
    }
  }

  // Assign default actions to unassigned players
  const isPassConcept = concept.conceptType === 'pass';

  for (const player of players) {
    if (assignedPlayerIds.has(player.id)) continue;

    const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
    const role = player.role.toUpperCase();
    const label = player.label?.toUpperCase() || '';

    // Skip QB, Ball, and already assigned players
    if (role === 'QB' || label === 'QB' || role === 'BALL') {
      continue;
    }

    // OL players get block assignments
    if (['C', 'LG', 'RG', 'LT', 'RT', 'OL'].includes(role) ||
        ['C', 'LG', 'RG', 'LT', 'RT'].includes(label)) {
      const endPoint: Point = {
        x: startPoint.x,
        y: startPoint.y + 0.05,
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
          scheme: isPassConcept ? 'zone_step' : 'zone_step',
          target: {
            toPlayerId: undefined,
            landmark: endPoint,
          },
          pathPoints: [startPoint, endPoint],
          pathType: 'straight',
        },
      };

      actions.push(blockAction);
      actionsCreated++;
      continue;
    }

    // TE gets route or block based on concept type
    if (role === 'TE' || label === 'TE' || label === 'Y' || label === 'U') {
      if (isPassConcept) {
        // Default flat route for TE
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
          y: startPoint.y + 0.05,
        };

        const routeAction: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: DEFAULT_ACTION_STYLE,
          route: {
            pattern: 'flat',
            depth: 3,
            controlPoints: [startPoint, endPoint],
            pathType: 'straight',
            tension: 0,
          },
        };

        actions.push(routeAction);
        actionsCreated++;
      } else {
        // Block for run plays
        const endPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + 0.05,
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
            scheme: 'zone_step',
            target: {
              toPlayerId: undefined,
              landmark: endPoint,
            },
            pathPoints: [startPoint, endPoint],
            pathType: 'straight',
          },
        };

        actions.push(blockAction);
        actionsCreated++;
      }
      continue;
    }

    // FB gets lead block for run, checkdown for pass
    if (role === 'FB' || label === 'FB') {
      if (isPassConcept) {
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.05 : -0.05),
          y: startPoint.y + 0.03,
        };

        const routeAction: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: DEFAULT_ACTION_STYLE,
          route: {
            pattern: 'flat',
            depth: 2,
            controlPoints: [startPoint, endPoint],
            pathType: 'straight',
            tension: 0,
          },
        };

        actions.push(routeAction);
        actionsCreated++;
      } else {
        const endPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + 0.1,
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
            scheme: 'lead',
            target: {
              toPlayerId: undefined,
              landmark: endPoint,
            },
            pathPoints: [startPoint, endPoint],
            pathType: 'straight',
          },
        };

        actions.push(blockAction);
        actionsCreated++;
      }
      continue;
    }

    // WR gets routes
    if (role === 'WR' || ['X', 'Z', 'H', 'F'].includes(label)) {
      if (isPassConcept) {
        // Default go route for unassigned WRs
        const endPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + 0.2,
        };

        const routeAction: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: DEFAULT_ACTION_STYLE,
          route: {
            pattern: 'go',
            depth: 15,
            controlPoints: [startPoint, endPoint],
            pathType: 'straight',
            tension: 0,
          },
        };

        actions.push(routeAction);
        actionsCreated++;
      } else {
        // Run blocking - stalk block for run plays
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? -0.05 : 0.05),
          y: startPoint.y + 0.08,
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
            scheme: 'stalk',
            target: {
              toPlayerId: undefined,
              landmark: endPoint,
            },
            pathPoints: [startPoint, endPoint],
            pathType: 'straight',
          },
        };

        actions.push(blockAction);
        actionsCreated++;
      }
      continue;
    }

    // RB gets run path or checkdown
    if (role === 'RB' || label === 'RB' || label === 'HB') {
      if (isPassConcept) {
        // Checkdown route
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
          y: startPoint.y + 0.05,
        };

        const routeAction: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: DEFAULT_ACTION_STYLE,
          route: {
            pattern: 'swing',
            depth: 3,
            controlPoints: [startPoint, endPoint],
            pathType: 'straight',
            tension: 0,
          },
        };

        actions.push(routeAction);
        actionsCreated++;
      } else {
        // Run path for RB - draw a path toward the play side
        const runEndPoint: Point = {
          x: startPoint.x + (defaultSide === 'right' ? 0.05 : -0.05),
          y: startPoint.y + 0.15, // Run forward toward LOS and beyond
        };

        const controlPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + 0.08,
        };

        const routeAction: RouteAction = {
          id: uuidv4(),
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: {
            ...DEFAULT_ACTION_STYLE,
            strokeWidth: 3,
          },
          route: {
            pattern: 'go',
            depth: 15,
            controlPoints: [startPoint, controlPoint, runEndPoint],
            pathType: 'tension',
            tension: 0.3,
          },
        };

        actions.push(routeAction);
        actionsCreated++;
      }
      continue;
    }
  }

  return { actions, actionsCreated };
}
