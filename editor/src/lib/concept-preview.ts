/**
 * Concept Preview Generator
 * Generates preview actions for hover display without modifying store state
 */

import { v4 as uuidv4 } from 'uuid';
import { getConceptById } from '@/data/concepts';
import type { Player, Point, RouteAction, BlockAction, Action } from '@/types/dsl';

const DEFAULT_PREVIEW_STYLE = {
  stroke: '#3b82f6', // Blue color for preview
  strokeWidth: 2,
  lineStyle: 'solid' as const,
  endMarker: 'arrow' as const,
};

// Helper to check if player matches a role pattern
function playerMatchesRole(player: Player, rolePattern: string): boolean {
  const role = player.role.toUpperCase();
  const label = player.label?.toUpperCase() || '';
  const pattern = rolePattern.toUpperCase();

  // Skip BALL - never assign routes to the ball
  if (role === 'BALL') return false;
  // Skip QB - they handle the ball, don't run routes
  if (role === 'QB' || label === 'QB') return false;

  // Direct match
  if (role === pattern || label === pattern) return true;

  // Flexible matching for common patterns
  if (pattern === 'WR' && (role === 'WR' || ['X', 'Y', 'Z', 'H', 'SLOT'].includes(label))) return true;
  if (pattern === 'RB' && (role === 'RB' || ['RB', 'HB', 'TB'].includes(label))) return true;
  if (pattern === 'FB' && (role === 'FB' || label === 'FB')) return true;
  if (pattern === 'TE' && (role === 'TE' || label === 'TE' || label === 'Y')) return true;

  // Position labels
  if (['X', 'Y', 'Z', 'H'].includes(pattern)) {
    return label === pattern;
  }

  return false;
}

/**
 * Generate preview actions for a concept without modifying any state
 * Returns an array of preview actions that can be rendered on the canvas
 */
export function generateConceptPreview(conceptId: string, players: Player[]): Action[] {
  const concept = getConceptById(conceptId);
  if (!concept || players.length === 0) {
    return [];
  }

  const previewActions: Action[] = [];
  const assignedPlayerIds = new Set<string>();
  const template = concept.template;

  // Process each role in the template
  for (const role of template.roles) {
    // Find matching players for this role
    const matchingPlayers = players.filter((p) =>
      role.appliesTo.some((roleMatch) => playerMatchesRole(p, roleMatch))
    );

    for (const player of matchingPlayers) {
      // Skip BALL and QB
      if (player.role === 'BALL' || player.role === 'QB') continue;
      if (player.label?.toUpperCase() === 'QB') continue;

      // Create route action if specified
      if (role.defaultRoute) {
        const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
        // CRITICAL: Use proper yard-to-normalized conversion (1 yard = 0.04 normalized)
        // Cap at 14 yards (0.56) to stay within canvas
        const depthInYards = role.defaultRoute.depth ?? 10;
        const routeDepth = Math.min(depthInYards * 0.04, 0.56);

        let endPoint: Point = { x: startPoint.x, y: startPoint.y + routeDepth };
        let controlPoint: Point | undefined;

        const pattern = role.defaultRoute.pattern;
        const direction = role.defaultRoute.direction;

        // Adjust end point based on pattern
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
              y: startPoint.y + routeDepth * 0.6,
            };
            break;
          case 'corner':
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
          case 'over':
            endPoint = {
              x: startPoint.x + (direction === 'inside' || startPoint.x > 0.5 ? -0.2 : 0.2),
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
            endPoint = {
              x: startPoint.x + (startPoint.x > 0.5 ? 0.15 : -0.15),
              y: startPoint.y + routeDepth,
            };
            controlPoint = {
              x: startPoint.x + (startPoint.x > 0.5 ? 0.1 : -0.1),
              y: startPoint.y + routeDepth * 0.3,
            };
            break;
          case 'seam':
            endPoint = {
              x: startPoint.x,
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
        endPoint.y = Math.max(-0.4, Math.min(0.56, endPoint.y));

        const controlPoints: Point[] = controlPoint
          ? [startPoint, controlPoint, endPoint]
          : [startPoint, endPoint];

        const routeAction: RouteAction = {
          id: `preview-${uuidv4()}`,
          actionType: 'route',
          fromPlayerId: player.id,
          layer: 'primary',
          style: {
            ...DEFAULT_PREVIEW_STYLE,
          },
          route: {
            pattern: pattern,
            depth: role.defaultRoute.depth,
            controlPoints,
            pathType: controlPoint ? 'tension' : 'straight',
            tension: controlPoint ? 0.5 : 0,
          },
        };

        previewActions.push(routeAction);
        assignedPlayerIds.add(player.id);
      }

      // Create block action if specified
      if (role.defaultBlock) {
        const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };
        const endPoint: Point = {
          x: startPoint.x,
          y: startPoint.y + 0.05,
        };

        const scheme = role.defaultBlock.scheme;
        if (scheme === 'pull_kick' || scheme === 'pull_lead') {
          endPoint.x = startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.15 : -0.15);
          endPoint.y = startPoint.y + 0.1;
        } else if (scheme === 'reach') {
          endPoint.x = startPoint.x + (template.buildPolicy.defaultSide === 'right' ? 0.05 : -0.05);
          endPoint.y = startPoint.y + 0.03;
        }

        const blockAction: BlockAction = {
          id: `preview-${uuidv4()}`,
          actionType: 'block',
          fromPlayerId: player.id,
          layer: 'primary',
          style: {
            ...DEFAULT_PREVIEW_STYLE,
            endMarker: 't_block',
          },
          block: {
            scheme: scheme,
            target: {
              toPlayerId: undefined,
              landmark: endPoint,
            },
            pathPoints: [startPoint, endPoint],
            pathType: 'straight',
          },
        };

        previewActions.push(blockAction);
        assignedPlayerIds.add(player.id);
      }
    }
  }

  return previewActions;
}
