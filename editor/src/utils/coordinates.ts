import { Point } from '@/types/dsl';

/**
 * Convert normalized coordinates to pixel coordinates
 * Normalized: x (0~1), y (-0.4~+0.6 where 0 is LOS)
 * Pixel: x (0~width), y (0~height)
 *
 * Offense direction is UPWARD:
 * - y < 0 (backfield) renders at BOTTOM of screen (max -0.4 = 10 yards back)
 * - y = 0 (LOS) renders at 60% from top
 * - y > 0 (defense direction) renders at TOP of screen (max 0.6 = 15 yards ahead)
 *
 * Scale: normalized y of 0.04 = 1 yard = height/25 pixels
 */
export function toPixel(
  normalized: Point,
  stageWidth: number,
  stageHeight: number
): { x: number; y: number } {
  // Ensure valid dimensions
  const width = Math.max(1, stageWidth);
  const height = Math.max(1, stageHeight);
  return {
    x: normalized.x * width,
    y: (0.6 - normalized.y) * height, // LOS (y=0) at 60% down
  };
}

/**
 * Convert pixel coordinates to normalized coordinates
 */
export function toNormalized(
  pixel: { x: number; y: number },
  stageWidth: number,
  stageHeight: number
): Point {
  // Prevent division by zero
  const width = Math.max(1, stageWidth);
  const height = Math.max(1, stageHeight);
  return {
    x: pixel.x / width,
    y: 0.6 - pixel.y / height, // LOS (y=0) at 60% down
  };
}

/**
 * Convert an array of normalized points to pixel points (flat array for Konva)
 */
export function pointsToPixelArray(
  points: Point[],
  stageWidth: number,
  stageHeight: number
): number[] {
  const result: number[] = [];
  for (const point of points) {
    const pixel = toPixel(point, stageWidth, stageHeight);
    result.push(pixel.x, pixel.y);
  }
  return result;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Get angle between two points in degrees
 */
export function angleBetween(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

/**
 * Snap position to grid
 */
export function snapToGrid(
  position: Point,
  gridSizeX: number,
  gridSizeY: number
): Point {
  return {
    x: Math.round(position.x / gridSizeX) * gridSizeX,
    y: Math.round(position.y / gridSizeY) * gridSizeY,
  };
}

/**
 * Find the closest point on a line segment to a given point
 * Returns the closest point and the parameter t (0-1) along the segment
 */
export function closestPointOnSegment(
  point: Point,
  segStart: Point,
  segEnd: Point
): { closest: Point; t: number; distance: number } {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Segment is a point
    return {
      closest: segStart,
      t: 0,
      distance: distance(point, segStart),
    };
  }

  // Project point onto line and clamp to segment
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closest: Point = {
    x: segStart.x + t * dx,
    y: segStart.y + t * dy,
  };

  return {
    closest,
    t,
    distance: distance(point, closest),
  };
}

/**
 * Find which segment of a multi-point path is closest to a given point
 * Returns the segment index (insert after this index) and the closest point on that segment
 */
export function findClosestSegment(
  point: Point,
  pathPoints: Point[]
): { segmentIndex: number; closestPoint: Point; distance: number } | null {
  if (pathPoints.length < 2) return null;

  let minDistance = Infinity;
  let bestSegmentIndex = 0;
  let bestClosestPoint = pathPoints[0];

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const result = closestPointOnSegment(point, pathPoints[i], pathPoints[i + 1]);
    if (result.distance < minDistance) {
      minDistance = result.distance;
      bestSegmentIndex = i;
      bestClosestPoint = result.closest;
    }
  }

  return {
    segmentIndex: bestSegmentIndex,
    closestPoint: bestClosestPoint,
    distance: minDistance,
  };
}
