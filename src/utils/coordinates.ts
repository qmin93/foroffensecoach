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
