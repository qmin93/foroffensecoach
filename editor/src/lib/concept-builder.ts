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
 * Calculate route control points based on pattern, direction, and break angle
 * Returns multiple points for angular routes with sharp breaks
 */
function calculateRouteEndPoint(
  startPoint: Point,
  pattern: string,
  direction: string | undefined,
  routeDepth: number,
  breakAngleDeg?: number
): { endPoint: Point; controlPoints: Point[]; isAngular: boolean } {
  // Determine if player is on left or right side of field
  const isRightSide = startPoint.x > 0.5;
  // Determine inside/outside direction
  const goesInside = direction === 'inside' || direction === undefined;

  // Helper to calculate horizontal offset based on angle and depth
  const calcAngularOffset = (angleDeg: number, depth: number, towardCenter: boolean): number => {
    const radians = (angleDeg * Math.PI) / 180;
    const offset = depth * Math.tan(radians);
    if (towardCenter) {
      return isRightSide ? -offset : offset;
    }
    return isRightSide ? offset : -offset;
  };

  let endPoint: Point;
  let controlPoints: Point[] = [startPoint];
  let isAngular = false;

  switch (pattern) {
    // ANGULAR ROUTES - routes with sharp breaks
    case 'slant':
    case 'quick_slant': {
      // Slant: short stem (2-3 yards) then break at 45° inside
      const stemDepth = Math.min(0.08, routeDepth * 0.3); // ~2 yards stem
      const angle = breakAngleDeg ?? 45;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const remainingDepth = routeDepth - stemDepth;
      const horizontalMove = calcAngularOffset(angle, remainingDepth, goesInside);
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'out':
    case 'quick_out':
    case 'speed_out': {
      // Out: vertical stem then 90° break outside
      const stemDepth = routeDepth * 0.7;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const horizontalMove = isRightSide ? 0.12 : -0.12;
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + stemDepth, // Out routes stay at break depth
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'corner':
    case 'dragon': {
      // Corner: vertical stem then break at 45° outside
      const stemDepth = routeDepth * 0.5;
      const angle = breakAngleDeg ?? 45;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const remainingDepth = routeDepth - stemDepth;
      const horizontalMove = calcAngularOffset(angle, remainingDepth, false); // Outside
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'post':
    case 'skinny_post': {
      // Post: vertical stem then break at 45° inside toward middle
      const stemDepth = routeDepth * 0.5;
      const angle = breakAngleDeg ?? 45;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const remainingDepth = routeDepth - stemDepth;
      const horizontalMove = calcAngularOffset(angle, remainingDepth, true); // Inside toward middle
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + routeDepth,
      };
      // Clamp to not go past center too much
      if (isRightSide && endPoint.x < 0.35) endPoint.x = 0.35;
      if (!isRightSide && endPoint.x > 0.65) endPoint.x = 0.65;
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'dig':
    case 'in':
    case 'cross':
    case 'shallow':
    case 'china':
    case 'scissor': {
      // Dig/In: vertical stem then 90° break inside
      const stemDepth = routeDepth;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const horizontalMove = goesInside
        ? (isRightSide ? -0.2 : 0.2)
        : (isRightSide ? 0.2 : -0.2);
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + stemDepth, // Stay at break depth for in-routes
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'comeback': {
      // Comeback: vertical stem then turn back
      const stemDepth = routeDepth;
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.05 : -0.05),
        y: startPoint.y + stemDepth - 0.08, // Come back ~2 yards
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'curl':
    case 'hitch': {
      // Curl/Hitch: vertical stem then slight turn
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + routeDepth };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.03 : -0.03),
        y: startPoint.y + routeDepth - 0.04,
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'stick':
    case 'snag': {
      // Stick: short route, sit in zone
      endPoint = {
        x: startPoint.x,
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false;
      break;
    }

    case 'flat':
    case 'arrow': {
      // Flat: immediate break outside and shallow
      const breakPoint: Point = { x: startPoint.x, y: startPoint.y + 0.04 };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.15 : -0.15),
        y: startPoint.y + routeDepth * 0.3,
      };
      controlPoints = [startPoint, breakPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'swing':
    case 'flare': {
      // Swing: arc out of backfield
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.15 : -0.15),
        y: startPoint.y + routeDepth * 0.3,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false; // Use curved for swing
      break;
    }

    case 'wheel':
    case 'follow': {
      // Wheel: flat then vertical - 2 break points
      const flatPoint: Point = {
        x: startPoint.x + (isRightSide ? 0.1 : -0.1),
        y: startPoint.y + routeDepth * 0.2,
      };
      const turnPoint: Point = {
        x: startPoint.x + (isRightSide ? 0.15 : -0.15),
        y: startPoint.y + routeDepth * 0.35,
      };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.15 : -0.15),
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, flatPoint, turnPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'out_and_up':
    case 'out_up': {
      // Out and up: stem, break out, then vertical
      const stemDepth = routeDepth * 0.25;
      const stemPoint: Point = { x: startPoint.x, y: startPoint.y + stemDepth };
      const outPoint: Point = {
        x: startPoint.x + (isRightSide ? 0.1 : -0.1),
        y: startPoint.y + stemDepth,
      };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.08 : -0.08),
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, stemPoint, outPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'bench':
    case 'drive': {
      // Drive: straight angle route
      const horizontalMove = direction === 'outside'
        ? (isRightSide ? 0.15 : -0.15)
        : (goesInside ? (isRightSide ? -0.1 : 0.1) : 0);
      endPoint = {
        x: startPoint.x + horizontalMove,
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false;
      break;
    }

    case 'texas':
    case 'angle': {
      // Angle: slight outside then break inside
      const releasePoint: Point = {
        x: startPoint.x + (isRightSide ? 0.05 : -0.05),
        y: startPoint.y + routeDepth * 0.25,
      };
      endPoint = {
        x: startPoint.x + (isRightSide ? -0.1 : 0.1),
        y: startPoint.y + routeDepth * 0.6,
      };
      controlPoints = [startPoint, releasePoint, endPoint];
      isAngular = true;
      break;
    }

    case 'whip': {
      // Whip: inside then back outside
      const inPoint: Point = {
        x: startPoint.x + (isRightSide ? -0.05 : 0.05),
        y: startPoint.y + routeDepth * 0.4,
      };
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.08 : -0.08),
        y: startPoint.y + routeDepth * 0.7,
      };
      controlPoints = [startPoint, inPoint, endPoint];
      isAngular = true;
      break;
    }

    case 'bubble':
    case 'tunnel':
    case 'screen':
    case 'slip': {
      // Screen/Bubble: quick outside
      endPoint = {
        x: startPoint.x + (isRightSide ? 0.1 : -0.1),
        y: startPoint.y + routeDepth * 0.2,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false;
      break;
    }

    case 'divide':
    case 'seam': {
      // Seam: straight up with slight inside lean
      endPoint = {
        x: startPoint.x + (isRightSide ? -0.03 : 0.03),
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false;
      break;
    }

    case 'go':
    default: {
      // Go: straight vertical
      endPoint = {
        x: startPoint.x,
        y: startPoint.y + routeDepth,
      };
      controlPoints = [startPoint, endPoint];
      isAngular = false;
      break;
    }
  }

  // Ensure all coordinates stay within bounds
  const clampPoint = (p: Point): Point => ({
    x: Math.max(0.05, Math.min(0.95, p.x)),
    y: Math.max(-0.95, Math.min(0.95, p.y)),
  });

  endPoint = clampPoint(endPoint);
  controlPoints = controlPoints.map(clampPoint);

  return { endPoint, controlPoints, isAngular };
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
 * Check if concept is an outside run (sweep, toss, etc.)
 */
function isOutsideRun(concept: Concept): boolean {
  const outsidePatterns = ['sweep', 'toss', 'jet', 'fly', 'rocket', 'pitch', 'stretch'];
  const conceptId = concept.id?.toLowerCase() || '';
  const conceptName = concept.name?.toLowerCase() || '';

  return outsidePatterns.some(pattern =>
    conceptId.includes(pattern) || conceptName.includes(pattern)
  );
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
  const isOutside = isOutsideRun(concept);

  // Process each role in the template
  for (const role of template.roles) {
    // Find matching players for this role using flexible position matching
    const matchingPlayers = players.filter((p) =>
      role.appliesTo.some((roleMatch) => playerMatchesRole(p, roleMatch))
    );

    for (const player of matchingPlayers) {
      if (assignedPlayerIds.has(player.id)) continue;
      // EXCEPTION: Never assign actions to the BALL or QB
      if (player.role === 'BALL' || player.role === 'QB') continue;

      const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };

      // Create route action if specified
      if (role.defaultRoute) {
        // Convert yards to normalized coordinates: 1 yard = 0.04 normalized y
        // Cap at 14 yards (0.56) to keep routes within canvas
        const rawDepth = (role.defaultRoute.depth ?? 10) * 0.04;
        const routeDepth = Math.min(rawDepth, 0.56);
        const { controlPoints, isAngular } = calculateRouteEndPoint(
          startPoint,
          role.defaultRoute.pattern,
          role.defaultRoute.direction,
          routeDepth,
          role.defaultRoute.breakAngleDeg
        );

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
            breakAngleDeg: role.defaultRoute.breakAngleDeg,
            controlPoints,
            // Angular routes use straight pathType with tension 0 for sharp breaks
            // Non-angular routes with 3+ points use tension for smooth curves
            pathType: 'straight',
            tension: isAngular ? 0 : (controlPoints.length > 2 ? 0.3 : 0),
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
        // Default flat route for TE (3 yards)
        const teFlatDepth = 3 * 0.04; // 3 yards in normalized coords
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
          y: startPoint.y + teFlatDepth,
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
        // FB checkdown (2 yards)
        const fbCheckdownDepth = 2 * 0.04; // 2 yards in normalized coords
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.05 : -0.05),
          y: startPoint.y + fbCheckdownDepth,
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
        // Default go route for unassigned WRs (15 yards)
        const wrRouteDepth = 14 * 0.04; // 14 yards in normalized coords (max)
        const endPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + wrRouteDepth,
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
        // Checkdown route (3 yards)
        const rbCheckdownDepth = 3 * 0.04; // 3 yards in normalized coords
        const endPoint: Point = {
          x: startPoint.x + (startPoint.x > 0.5 ? 0.08 : -0.08),
          y: startPoint.y + rbCheckdownDepth,
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
        // Run path for RB
        const rbRunDepth = 14 * 0.04; // 14 yards in normalized coords (max)
        const sideMultiplier = defaultSide === 'right' ? 1 : -1;

        let controlPoints: Point[];
        let routePattern: string;

        if (isOutside) {
          // Sweep/Toss: First move horizontally, then turn upfield
          // Phase 1: Lateral movement toward play side (receive handoff)
          const lateralPoint: Point = {
            x: startPoint.x + (sideMultiplier * 0.15), // Move 15% canvas width laterally
            y: startPoint.y + 0.02, // Slight forward movement
          };
          // Phase 2: Turn corner and go upfield
          const turnPoint: Point = {
            x: startPoint.x + (sideMultiplier * 0.20),
            y: startPoint.y + 0.08,
          };
          // Phase 3: Upfield toward sideline
          const runEndPoint: Point = {
            x: startPoint.x + (sideMultiplier * 0.25),
            y: startPoint.y + rbRunDepth,
          };
          controlPoints = [startPoint, lateralPoint, turnPoint, runEndPoint];
          routePattern = 'sweep';
        } else {
          // Inside run: More vertical path toward play side
          const runEndPoint: Point = {
            x: startPoint.x + (sideMultiplier * 0.05),
            y: startPoint.y + rbRunDepth,
          };
          const controlPoint: Point = {
            x: startPoint.x,
            y: startPoint.y + rbRunDepth * 0.4,
          };
          controlPoints = [startPoint, controlPoint, runEndPoint];
          routePattern = 'go';
        }

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
            pattern: routePattern,
            depth: 15,
            controlPoints,
            pathType: isOutside ? 'straight' : 'tension',
            tension: isOutside ? 0 : 0.3,
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
