'use client';

import { useMemo } from 'react';
import { Layer, Arrow, Line, Shape, Circle, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { Action, RouteAction, BlockAction, MotionAction, LandmarkAction, TextAction, SymbolAction, ZoneAction, Point, EndMarker, Player, SymbolType } from '@/types/dsl';
import { toPixel, toNormalized, pointsToPixelArray, findClosestSegment } from '@/utils/coordinates';
import { generateConceptPreview } from '@/lib/concept-preview';
import { RouteTreeOverlay } from './RouteTreeOverlay';

interface ActionLayerProps {
  width: number;
  height: number;
  actions?: Action[];
  isReadOnly?: boolean;
}

// Convert LineStyle to Konva dash array
// Scales with strokeWidth for better visibility on thick lines
function getDash(lineStyle: string, strokeWidth: number = 2): number[] | undefined {
  // Scale factor based on stroke width (minimum 1)
  const scale = Math.max(1, strokeWidth / 2);
  switch (lineStyle) {
    case 'dashed':
      // Dash length proportional to stroke width
      return [8 * scale, 4 * scale];
    case 'dotted':
      // Dot size based on stroke width
      return [2 * scale, 4 * scale];
    default:
      return undefined;
  }
}

// Render a T-block marker at the end of a path (ㅜ shape)
function TBlockMarker({ x, y, angle, stroke, strokeWidth }: {
  x: number;
  y: number;
  angle: number;
  stroke: string;
  strokeWidth: number;
}) {
  const size = 10;
  return (
    <Shape
      x={x}
      y={y}
      rotation={angle}
      sceneFunc={(context, shape) => {
        context.beginPath();
        // Horizontal line of the T (top bar)
        context.moveTo(-size, 0);
        context.lineTo(size, 0);
        // Vertical stem pointing down (ㅜ shape)
        context.moveTo(0, 0);
        context.lineTo(0, size * 0.8);
        context.strokeShape(shape);
      }}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

// Render circle marker at the end of a path
function CircleMarker({ x, y, stroke, strokeWidth }: {
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
}) {
  return (
    <Circle
      x={x}
      y={y}
      radius={6}
      fill={stroke}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

// Render double arrow marker (for combo blocks - double team then climb)
function DoubleArrowMarker({ x, y, angle, stroke, strokeWidth }: {
  x: number;
  y: number;
  angle: number;
  stroke: string;
  strokeWidth: number;
}) {
  const size = 10;
  return (
    <Shape
      x={x}
      y={y}
      rotation={angle}
      sceneFunc={(context, shape) => {
        context.beginPath();
        // First arrow (outer)
        context.moveTo(-size, size * 0.6);
        context.lineTo(0, 0);
        context.lineTo(size, size * 0.6);
        // Second arrow (inner, smaller)
        context.moveTo(-size * 0.6, size);
        context.lineTo(0, size * 0.4);
        context.lineTo(size * 0.6, size);
        context.strokeShape(shape);
      }}
      stroke={stroke}
      strokeWidth={strokeWidth}
      lineCap="round"
      lineJoin="round"
    />
  );
}

// Generic line renderer with end marker support
function LineWithMarker({
  points,
  stroke,
  strokeWidth,
  dash,
  tension,
  endMarker,
  isSelected,
  isHovered = false,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  opacity = 1,
}: {
  points: number[];
  stroke: string;
  strokeWidth: number;
  dash?: number[];
  tension?: number;
  endMarker: EndMarker;
  isSelected: boolean;
  isHovered?: boolean;
  onClick?: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDoubleClick?: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  opacity?: number;
}) {
  // Replace white strokes with black (editor uses only black and white)
  const visibleStroke = stroke === '#ffffff' || stroke === '#FFFFFF' ? '#000000' : stroke;
  const displayStroke = isSelected ? '#000000' : isHovered ? '#000000' : visibleStroke;
  const displayWidth = isSelected ? strokeWidth + 2 : isHovered ? strokeWidth + 1 : strokeWidth;
  const shadowBlur = isHovered && !isSelected ? 6 : 0;

  // Calculate end point and angle for markers
  // Ensure we have at least 2 points (4 values in the flat array)
  if (points.length < 4) {
    return null;
  }
  const lastX = points[points.length - 2];
  const lastY = points[points.length - 1];
  const prevX = points.length >= 4 ? points[points.length - 4] : lastX;
  const prevY = points.length >= 4 ? points[points.length - 3] : lastY;
  const angle = Math.atan2(lastY - prevY, lastX - prevX) * (180 / Math.PI) + 90;

  if (endMarker === 'arrow') {
    return (
      <Arrow
        points={points}
        stroke={displayStroke}
        strokeWidth={displayWidth}
        dash={dash}
        tension={tension}
        pointerLength={10}
        pointerWidth={8}
        fill={displayStroke}
        lineCap="round"
        lineJoin="round"
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hitStrokeWidth={20}
        opacity={opacity}
        shadowColor={shadowBlur > 0 ? '#3b82f6' : undefined}
        shadowBlur={shadowBlur}
        shadowOpacity={0.5}
      />
    );
  }

  return (
    <>
      <Line
        points={points}
        stroke={displayStroke}
        strokeWidth={displayWidth}
        dash={dash}
        tension={tension}
        lineCap="round"
        lineJoin="round"
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hitStrokeWidth={20}
        opacity={opacity}
        shadowColor={shadowBlur > 0 ? '#3b82f6' : undefined}
        shadowBlur={shadowBlur}
        shadowOpacity={0.5}
      />
      {endMarker === 't_block' && (
        <TBlockMarker
          x={lastX}
          y={lastY}
          angle={angle}
          stroke={displayStroke}
          strokeWidth={displayWidth}
        />
      )}
      {endMarker === 'circle' && (
        <CircleMarker
          x={lastX}
          y={lastY}
          stroke={displayStroke}
          strokeWidth={displayWidth}
        />
      )}
      {endMarker === 'double_arrow' && (
        <DoubleArrowMarker
          x={lastX}
          y={lastY}
          angle={angle}
          stroke={displayStroke}
          strokeWidth={displayWidth}
        />
      )}
    </>
  );
}

// Edit handle for control points
function EditHandle({
  x,
  y,
  onMouseDown,
  onDoubleClick,
  color = '#3b82f6',
  isActive = false,
  label,
}: {
  x: number;
  y: number;
  onMouseDown: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDoubleClick?: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  color?: string;
  isActive?: boolean;
  label?: string;
}) {
  return (
    <>
      {/* Larger invisible hit area */}
      <Circle
        x={x}
        y={y}
        radius={16}
        fill="transparent"
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
      />
      {/* Visible handle */}
      <Circle
        x={x}
        y={y}
        radius={isActive ? 12 : 10}
        fill={color}
        stroke="#ffffff"
        strokeWidth={3}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.3}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
      />
      {/* Label */}
      {label && (
        <Text
          x={x + 14}
          y={y - 6}
          text={label}
          fontSize={10}
          fill="#ffffff"
          fontStyle="bold"
        />
      )}
    </>
  );
}

// Render Route action with player-attached start point
function RouteShape({
  action,
  width,
  height,
  isSelected,
  isHovered = false,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  players,
  onEditStart,
  onEditStartByIndex,
  onInsertPoint,
  onDeletePoint,
  editingPointType,
  editingPointIndex,
  isEditing,
}: {
  action: RouteAction;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  players: Player[];
  onEditStart: (actionId: string, pointType: 'start' | 'end' | 'control') => void;
  onEditStartByIndex: (actionId: string, pointIndex: number) => void;
  onInsertPoint: (actionId: string, point: Point, afterIndex: number) => void;
  onDeletePoint: (actionId: string, pointIndex: number) => void;
  editingPointType: 'start' | 'end' | 'control' | null;
  editingPointIndex: number | null;
  isEditing: boolean;
}) {
  const { route, style, fromPlayerId } = action;

  // Get the player position to attach the line start
  const player = players.find(p => p.id === fromPlayerId);

  // Build control points with player position as start
  let controlPoints = [...route.controlPoints];
  if (player && controlPoints.length > 0) {
    // Replace first point with player's current position
    controlPoints[0] = { x: player.alignment.x, y: player.alignment.y };
  }

  const points = pointsToPixelArray(controlPoints, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const shiftKey = 'shiftKey' in e.evt ? e.evt.shiftKey : false;
    onSelect(action.id, shiftKey);
  };

  // Double-click on route to add a new bend point
  const handleDoubleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (!isSelected) return;

    // Get click position
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Convert to normalized coordinates
    const clickPoint = toNormalized(pointerPos, width, height);

    // Find closest segment
    const result = findClosestSegment(clickPoint, controlPoints);
    if (!result) return;

    // Only add point if click is close enough to the line (threshold in normalized coords)
    const threshold = 0.05;
    if (result.distance <= threshold) {
      onInsertPoint(action.id, result.closestPoint, result.segmentIndex);
    }
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(action.id);
  };

  // Use tension=0 for multi-point angular routes, tension for curved
  const tension = route.pathType === 'tension' ? (route.tension || 0.3) : 0;

  // Get pixel positions for all control points
  const allPointPixels = controlPoints.map(p => toPixel(p, width, height));

  return (
    <>
      <LineWithMarker
        points={points}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        dash={getDash(style.lineStyle, style.strokeWidth)}
        tension={tension}
        endMarker={style.endMarker}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {/* Edit handles for ALL control points when selected */}
      {isSelected && (
        <>
          {/* Guide lines connecting all points */}
          {controlPoints.length > 2 && allPointPixels.map((pixel, i) => {
            if (i === 0) return null;
            const prevPixel = allPointPixels[i - 1];
            return (
              <Line
                key={`guide-${i}`}
                points={[prevPixel.x, prevPixel.y, pixel.x, pixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
                opacity={0.5}
              />
            );
          })}
          {/* Render handles for all points */}
          {allPointPixels.map((pixel, index) => {
            const isFirst = index === 0;
            const isLast = index === controlPoints.length - 1;
            // Skip first point (attached to player) - it can't be dragged separately
            if (isFirst) return null;

            const isActiveByIndex = isEditing && editingPointIndex === index;
            const isActiveByType = isEditing && (
              (editingPointType === 'end' && isLast) ||
              (editingPointType === 'control' && index === 1 && !isLast)
            );
            const isActive = isActiveByIndex || isActiveByType;

            // Color: green for end point, orange for middle points
            const color = isLast ? '#22c55e' : '#f59e0b';
            // Label only for end point
            const label = isLast ? 'End' : undefined;

            return (
              <EditHandle
                key={`handle-${index}`}
                x={pixel.x}
                y={pixel.y}
                onMouseDown={(e) => {
                  e.cancelBubble = true;
                  onEditStartByIndex(action.id, index);
                }}
                onDoubleClick={!isFirst && !isLast ? (e) => {
                  e.cancelBubble = true;
                  onDeletePoint(action.id, index);
                } : undefined}
                color={color}
                isActive={isActive}
                label={label}
              />
            );
          })}
        </>
      )}
    </>
  );
}

// Render Block action
function BlockShape({
  action,
  width,
  height,
  isSelected,
  isHovered = false,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onEditStart,
  editingPointType,
  isEditing,
}: {
  action: BlockAction;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onEditStart: (actionId: string, pointType: 'start' | 'end' | 'control') => void;
  editingPointType: 'start' | 'end' | 'control' | null;
  isEditing: boolean;
}) {
  const { block, style } = action;
  const points = pointsToPixelArray(block.pathPoints, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const shiftKey = 'shiftKey' in e.evt ? e.evt.shiftKey : false;
    onSelect(action.id, shiftKey);
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(action.id);
  };

  // Determine block scheme-specific visual styles
  const schemeLower = (block.scheme ?? '').toLowerCase();

  // Scheme detection helpers
  const isZone = schemeLower.includes('zone_step') || schemeLower === 'zone';
  const isCombo = schemeLower.includes('combo') || schemeLower.includes('climb');
  const isDown = schemeLower.includes('down');
  const isReach = schemeLower.includes('reach');
  const isPull = schemeLower.includes('pull');
  const isScoop = schemeLower.includes('scoop');

  // Determine tension (curvature)
  let tension = 0;
  if (isZone || isCombo) tension = 0.5;
  else if (isReach || isScoop) tension = 0.4;
  else if (isPull) tension = 0.6;
  else tension = block.pathType === 'tension' ? (block.tension || 0.3) : 0;

  // Determine line style (solid/dashed/dotted)
  let lineStyle = style.lineStyle;
  if (isZone || isScoop) lineStyle = 'dotted';
  else if (isReach) lineStyle = 'dashed';
  // combo, down, pull stay solid

  // Determine end marker
  let endMarker: EndMarker = 't_block';
  if (isCombo) endMarker = 'double_arrow';
  else if (isZone || isReach || isPull || isScoop) endMarker = 'arrow';
  // down stays t_block (gap block)

  // Determine stroke width adjustment
  let strokeWidthDelta = 0;
  if (isCombo) strokeWidthDelta = 1; // thick for combo (double team)
  else if (isDown) strokeWidthDelta = -0.5; // thinner for down block

  // Get pixel positions for edit handles
  const pathPoints = block.pathPoints;
  const startPixel = pathPoints.length > 0 ? toPixel(pathPoints[0], width, height) : null;
  const endPixel = pathPoints.length > 1 ? toPixel(pathPoints[pathPoints.length - 1], width, height) : null;
  const controlPixel = pathPoints.length > 2 ? toPixel(pathPoints[1], width, height) : null;

  const effectiveStrokeWidth = Math.max(1, style.strokeWidth + strokeWidthDelta);

  return (
    <>
      <LineWithMarker
        points={points}
        stroke={style.stroke}
        strokeWidth={effectiveStrokeWidth}
        dash={getDash(lineStyle, effectiveStrokeWidth)}
        tension={tension}
        endMarker={endMarker}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {/* Edit handles and guide lines when selected */}
      {isSelected && (
        <>
          {/* Guide lines for curved paths */}
          {controlPixel && startPixel && endPixel && (
            <>
              <Line
                points={[startPixel.x, startPixel.y, controlPixel.x, controlPixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
              />
              <Line
                points={[controlPixel.x, controlPixel.y, endPixel.x, endPixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
              />
            </>
          )}
          {/* Start point handle */}
          {startPixel && (
            <EditHandle
              x={startPixel.x}
              y={startPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'start');
              }}
              color="#3b82f6"
              isActive={isEditing && editingPointType === 'start'}
              label="Start"
            />
          )}
          {/* End point handle */}
          {endPixel && (
            <EditHandle
              x={endPixel.x}
              y={endPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'end');
              }}
              color="#22c55e"
              isActive={isEditing && editingPointType === 'end'}
              label="End"
            />
          )}
          {/* Control point handle (for curved lines) */}
          {controlPixel && (
            <EditHandle
              x={controlPixel.x}
              y={controlPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'control');
              }}
              color="#f59e0b"
              isActive={isEditing && editingPointType === 'control'}
              label="Curve"
            />
          )}
        </>
      )}
    </>
  );
}

// Render Motion action
function MotionShape({
  action,
  width,
  height,
  isSelected,
  isHovered = false,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onEditStart,
  editingPointType,
  isEditing,
}: {
  action: MotionAction;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onEditStart: (actionId: string, pointType: 'start' | 'end' | 'control') => void;
  editingPointType: 'start' | 'end' | 'control' | null;
  isEditing: boolean;
}) {
  const { motion, style } = action;
  const points = pointsToPixelArray(motion.pathPoints, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const shiftKey = 'shiftKey' in e.evt ? e.evt.shiftKey : false;
    onSelect(action.id, shiftKey);
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(action.id);
  };

  // Sweep/orbit motions should be curved
  const isSweepMotion = ['sweep', 'orbit', 'jet', 'fly', 'rocket'].some(
    type => motion.motionType?.toLowerCase().includes(type)
  );
  const tension = isSweepMotion
    ? 0.4
    : (motion.pathType === 'tension' ? (motion.tension || 0.3) : 0);

  // Get pixel positions for edit handles
  const pathPoints = motion.pathPoints;
  const startPixel = pathPoints.length > 0 ? toPixel(pathPoints[0], width, height) : null;
  const endPixel = pathPoints.length > 1 ? toPixel(pathPoints[pathPoints.length - 1], width, height) : null;
  const controlPixel = pathPoints.length > 2 ? toPixel(pathPoints[1], width, height) : null;

  return (
    <>
      <LineWithMarker
        points={points}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        dash={getDash(style.lineStyle, style.strokeWidth)}
        tension={tension}
        endMarker={style.endMarker}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {/* Edit handles and guide lines when selected */}
      {isSelected && (
        <>
          {/* Guide lines for curved paths */}
          {controlPixel && startPixel && endPixel && (
            <>
              <Line
                points={[startPixel.x, startPixel.y, controlPixel.x, controlPixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
              />
              <Line
                points={[controlPixel.x, controlPixel.y, endPixel.x, endPixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
              />
            </>
          )}
          {/* Start point handle */}
          {startPixel && (
            <EditHandle
              x={startPixel.x}
              y={startPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'start');
              }}
              color="#3b82f6"
              isActive={isEditing && editingPointType === 'start'}
              label="Start"
            />
          )}
          {/* End point handle */}
          {endPixel && (
            <EditHandle
              x={endPixel.x}
              y={endPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'end');
              }}
              color="#22c55e"
              isActive={isEditing && editingPointType === 'end'}
              label="End"
            />
          )}
          {/* Control point handle (for curved lines) */}
          {controlPixel && (
            <EditHandle
              x={controlPixel.x}
              y={controlPixel.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                onEditStart(action.id, 'control');
              }}
              color="#f59e0b"
              isActive={isEditing && editingPointType === 'control'}
              label="Curve"
            />
          )}
        </>
      )}
    </>
  );
}

// Render Landmark action
function LandmarkShape({ action, width, height, isSelected, onSelect }: {
  action: LandmarkAction;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
}) {
  const { landmark, style } = action;
  const { x, y } = toPixel({ x: landmark.x, y: landmark.y }, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const nativeEvent = e.evt as MouseEvent;
    onSelect(action.id, nativeEvent.shiftKey);
  };

  const sizeMap = { small: 6, medium: 10, large: 14 };
  const size = sizeMap[style.size];

  return (
    <>
      <Circle
        x={x}
        y={y}
        radius={size}
        fill={style.fill}
        stroke={isSelected ? '#3b82f6' : style.stroke}
        strokeWidth={isSelected ? 3 : 2}
        onClick={handleClick}
        onTap={handleClick}
      />
      {landmark.label && (
        <Text
          x={x + size + 4}
          y={y - 6}
          text={landmark.label}
          fontSize={11}
          fill={style.stroke}
        />
      )}
    </>
  );
}

// Render Text action
function TextShape({ action, width, height, isSelected, onSelect }: {
  action: TextAction;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
}) {
  const { text, style } = action;
  const { x, y } = toPixel({ x: text.x, y: text.y }, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const nativeEvent = e.evt as MouseEvent;
    onSelect(action.id, nativeEvent.shiftKey);
  };

  return (
    <Text
      x={x}
      y={y}
      text={text.value}
      fontSize={style.fontSize}
      fill={style.fontColor}
      align={text.align || 'left'}
      width={text.width ? text.width * width : undefined}
      padding={style.showBox ? 4 : 0}
      onClick={handleClick}
      onTap={handleClick}
    />
  );
}

// Symbol icon mapping
const SYMBOL_ICONS: Record<SymbolType, string> = {
  football: '🏈',
  cone: '🔺',
  star: '⭐',
  asterisk: '✳',
  exclamation: '❗',
  dollar: '$',
  flag: '🚩',
  arrow_up: '↑',
  arrow_down: '↓',
  arrow_left: '←',
  arrow_right: '→',
  arrow_ne: '↗',
  arrow_se: '↘',
  arrow_sw: '↙',
  arrow_nw: '↖',
};

// Render Symbol action
function SymbolShape({ action, width, height, isSelected, onSelect }: {
  action: SymbolAction;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
}) {
  const { symbol, style } = action;
  const { x, y } = toPixel({ x: symbol.x, y: symbol.y }, width, height);

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const nativeEvent = e.evt as MouseEvent;
    onSelect(action.id, nativeEvent.shiftKey);
  };

  const sizeMap = { small: 16, medium: 24, large: 36 };
  const size = sizeMap[style.size] * (symbol.scale || 1);
  const rotation = symbol.rotation || 0;

  // Use Text element to render emoji/symbol
  const iconText = SYMBOL_ICONS[symbol.type] || '?';

  return (
    <>
      <Text
        x={x}
        y={y}
        text={iconText}
        fontSize={size}
        rotation={rotation}
        offsetX={size / 2}
        offsetY={size / 2}
        onClick={handleClick}
        onTap={handleClick}
      />
      {/* Selection indicator */}
      {isSelected && (
        <Circle
          x={x}
          y={y}
          radius={size / 2 + 4}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
          fill="transparent"
        />
      )}
    </>
  );
}

// Render Zone action
function ZoneShape({ action, width, height, isSelected, onSelect }: {
  action: ZoneAction;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
}) {
  const { zone, style } = action;
  const center = toPixel({ x: zone.x, y: zone.y }, width, height);
  const zoneWidth = zone.width * width;
  const zoneHeight = zone.height * height;
  const rotation = zone.rotation || 0;

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const nativeEvent = e.evt as MouseEvent;
    onSelect(action.id, nativeEvent.shiftKey);
  };

  // Zone rendered based on shape type
  if (zone.shape === 'circle') {
    const radius = Math.min(zoneWidth, zoneHeight) / 2;
    return (
      <Circle
        x={center.x}
        y={center.y}
        radius={radius}
        fill={style.fill}
        opacity={style.fillOpacity}
        stroke={isSelected ? '#3b82f6' : style.stroke}
        strokeWidth={isSelected ? 2 : style.strokeWidth}
        rotation={rotation}
        onClick={handleClick}
        onTap={handleClick}
      />
    );
  }

  if (zone.shape === 'triangle') {
    // Render triangle using Shape
    return (
      <Shape
        x={center.x}
        y={center.y}
        rotation={rotation}
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(0, -zoneHeight / 2);
          context.lineTo(-zoneWidth / 2, zoneHeight / 2);
          context.lineTo(zoneWidth / 2, zoneHeight / 2);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={style.fill}
        opacity={style.fillOpacity}
        stroke={isSelected ? '#3b82f6' : style.stroke}
        strokeWidth={isSelected ? 2 : style.strokeWidth}
        onClick={handleClick}
        onTap={handleClick}
      />
    );
  }

  // Default: square/rectangle
  return (
    <Shape
      x={center.x}
      y={center.y}
      rotation={rotation}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.rect(-zoneWidth / 2, -zoneHeight / 2, zoneWidth, zoneHeight);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      fill={style.fill}
      opacity={style.fillOpacity}
      stroke={isSelected ? '#3b82f6' : style.stroke}
      strokeWidth={isSelected ? 2 : style.strokeWidth}
      onClick={handleClick}
      onTap={handleClick}
    />
  );
}

export function ActionLayer({ width, height, actions: propActions, isReadOnly = false }: ActionLayerProps) {
  const storeActions = useEditorStore((state) => state.play.actions);
  const players = useEditorStore((state) => state.play.roster.players);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const hoveredActionId = useEditorStore((state) => state.hoveredActionId);
  const selectAction = useEditorStore((state) => state.selectAction);
  const setHoveredAction = useEditorStore((state) => state.setHoveredAction);
  const startEditingAction = useEditorStore((state) => state.startEditingAction);
  const startEditingPointByIndex = useEditorStore((state) => state.startEditingPointByIndex);
  const insertRoutePoint = useEditorStore((state) => state.insertRoutePoint);
  const deleteRoutePoint = useEditorStore((state) => state.deleteRoutePoint);
  const mode = useEditorStore((state) => state.mode);

  // Concept hover preview state
  const hoveredConceptId = useConceptStore((state) => state.hoveredConceptId);

  const actions = propActions ?? storeActions;

  // Generate concept preview actions when a concept is hovered
  const previewActions = useMemo(() => {
    if (!hoveredConceptId || isReadOnly) return [];
    return generateConceptPreview(hoveredConceptId, players);
  }, [hoveredConceptId, players, isReadOnly]);

  // Editing state
  const editingActionId = useEditorStore((state) => state.editingActionId);
  const editingPointType = useEditorStore((state) => state.editingPointType);
  const editingPointIndex = useEditorStore((state) => state.editingPointIndex);

  // Drawing state
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const drawingStartPoint = useEditorStore((state) => state.drawingStartPoint);
  const drawingEndPoint = useEditorStore((state) => state.drawingEndPoint);
  const drawingControlPoint = useEditorStore((state) => state.drawingControlPoint);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const previewPoint = useEditorStore((state) => state.previewPoint);
  const angularPoints = useEditorStore((state) => state.angularPoints);

  // Zone drag preview state
  const zoneDragStart = useEditorStore((state) => state.zoneDragStart);
  const zoneDragCurrent = useEditorStore((state) => state.zoneDragCurrent);
  const zonePlacementConfig = useEditorStore((state) => state.zonePlacementConfig);

  // Route tree hover state
  const hoveredPlayerId = useEditorStore((state) => state.hoveredPlayerId);
  const addRouteFromTree = useEditorStore((state) => state.addRouteFromTree);
  const setHoveredPlayer = useEditorStore((state) => state.setHoveredPlayer);
  const hoveredPlayer = useMemo(() => {
    if (!hoveredPlayerId) return null;
    return players.find(p => p.id === hoveredPlayerId) || null;
  }, [hoveredPlayerId, players]);

  // Handle route selection from route tree overlay
  const handleRouteTreeSelect = (playerId: string, routePattern: string, depth: number) => {
    addRouteFromTree(playerId, routePattern, depth);
    setHoveredPlayer(null); // Hide route tree after selection
  };

  const handleSelect = (actionId: string, shiftKey: boolean) => {
    if (isReadOnly) return;
    // Allow selection in select mode or any non-draw mode
    if (mode !== 'draw') {
      selectAction(actionId, shiftKey);
    }
  };

  const handleMouseEnter = (actionId: string) => {
    if (isReadOnly) return;
    setHoveredAction(actionId);
  };

  const handleMouseLeave = () => {
    if (isReadOnly) return;
    setHoveredAction(null);
  };

  const handleEditStart = (actionId: string, pointType: 'start' | 'end' | 'control') => {
    if (isReadOnly) return;
    if (mode === 'select') {
      startEditingAction(actionId, pointType);
    }
  };

  const handleEditStartByIndex = (actionId: string, pointIndex: number) => {
    if (isReadOnly) return;
    if (mode === 'select') {
      startEditingPointByIndex(actionId, pointIndex);
    }
  };

  const handleInsertPoint = (actionId: string, point: Point, afterIndex: number) => {
    if (isReadOnly) return;
    insertRoutePoint(actionId, point, afterIndex);
  };

  const handleDeletePoint = (actionId: string, pointIndex: number) => {
    if (isReadOnly) return;
    deleteRoutePoint(actionId, pointIndex);
  };

  const renderAction = (action: Action) => {
    const isSelected = !isReadOnly && selectedActionIds.includes(action.id);
    const isHovered = !isReadOnly && hoveredActionId === action.id;
    const isEditing = !isReadOnly && editingActionId === action.id;

    switch (action.actionType) {
      case 'route':
        return (
          <RouteShape
            key={action.id}
            action={action}
            width={width}
            height={height}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={handleSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            players={players}
            onEditStart={handleEditStart}
            onEditStartByIndex={handleEditStartByIndex}
            onInsertPoint={handleInsertPoint}
            onDeletePoint={handleDeletePoint}
            editingPointType={isEditing ? editingPointType : null}
            editingPointIndex={isEditing ? editingPointIndex : null}
            isEditing={isEditing}
          />
        );
      case 'block':
        return (
          <BlockShape
            key={action.id}
            action={action}
            width={width}
            height={height}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={handleSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onEditStart={handleEditStart}
            editingPointType={isEditing ? editingPointType : null}
            isEditing={isEditing}
          />
        );
      case 'motion':
        return (
          <MotionShape
            key={action.id}
            action={action}
            width={width}
            height={height}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={handleSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onEditStart={handleEditStart}
            editingPointType={isEditing ? editingPointType : null}
            isEditing={isEditing}
          />
        );
      case 'landmark':
        return (
          <LandmarkShape
            key={action.id}
            action={action}
            width={width}
            height={height}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
      case 'text':
        return (
          <TextShape
            key={action.id}
            action={action}
            width={width}
            height={height}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
      case 'symbol':
        return (
          <SymbolShape
            key={action.id}
            action={action as SymbolAction}
            width={width}
            height={height}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
      case 'zone':
        return (
          <ZoneShape
            key={action.id}
            action={action as ZoneAction}
            width={width}
            height={height}
            isSelected={isSelected}
            onSelect={handleSelect}
          />
        );
      default:
        return null;
    }
  };

  // Render drawing preview with rubber band effect
  const renderDrawingPreview = () => {
    if (drawingPhase === 'idle') return null;

    // Handle angular drawing preview
    if (drawingPhase === 'angular_drawing' && angularPoints.length > 0) {
      const previewPixel = previewPoint ? toPixel(previewPoint, width, height) : null;

      // Convert all angular points to pixels
      const angularPixels = angularPoints.map(p => toPixel(p, width, height));

      // Build points array for existing segments
      const existingPoints: number[] = [];
      angularPixels.forEach(p => {
        existingPoints.push(p.x, p.y);
      });

      // Add preview point for rubber band effect
      const previewPoints = previewPixel
        ? [...existingPoints, previewPixel.x, previewPixel.y]
        : existingPoints;

      return (
        <>
          {/* Existing segments (solid) */}
          {angularPoints.length >= 2 && (
            <LineWithMarker
              points={existingPoints}
              stroke="#3b82f6"
              strokeWidth={2}
              dash={getDash(drawingConfig.lineStyle, 2)}
              tension={0}
              endMarker="none"
              isSelected={false}
              opacity={1}
            />
          )}
          {/* Preview segment (semi-transparent) */}
          {previewPixel && angularPixels.length > 0 && (
            <Line
              points={[
                angularPixels[angularPixels.length - 1].x,
                angularPixels[angularPixels.length - 1].y,
                previewPixel.x,
                previewPixel.y,
              ]}
              stroke="#3b82f6"
              strokeWidth={2}
              dash={getDash(drawingConfig.lineStyle, 2)}
              opacity={0.5}
            />
          )}
          {/* Show point markers for all angular points */}
          {angularPixels.map((p, i) => (
            <Circle
              key={i}
              x={p.x}
              y={p.y}
              radius={i === 0 ? 6 : 4}
              fill={i === 0 ? '#22c55e' : '#3b82f6'}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </>
      );
    }

    // Original straight/curved preview logic
    if (!drawingStartPoint) return null;

    const startPixel = toPixel(drawingStartPoint, width, height);
    const endPixel = drawingEndPoint ? toPixel(drawingEndPoint, width, height) : null;
    const controlPixel = drawingControlPoint ? toPixel(drawingControlPoint, width, height) : null;
    const previewPixel = previewPoint ? toPixel(previewPoint, width, height) : null;

    // Build points array
    let points: number[];
    let tension = 0;

    if (drawingPhase === 'start_selected' && previewPixel) {
      // Rubber band effect: show line from start to current mouse position
      points = [startPixel.x, startPixel.y, previewPixel.x, previewPixel.y];
    } else if (endPixel) {
      if (controlPixel && drawingConfig.lineType === 'curved') {
        // Curved line with control point
        points = [startPixel.x, startPixel.y, controlPixel.x, controlPixel.y, endPixel.x, endPixel.y];
        tension = 0.5;
      } else {
        // Straight line
        points = [startPixel.x, startPixel.y, endPixel.x, endPixel.y];
      }
    } else {
      // Only start point - no preview yet
      return null;
    }

    return (
      <>
        <LineWithMarker
          points={points}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={getDash(drawingConfig.lineStyle, 2)}
          tension={tension}
          endMarker={drawingConfig.endMarker}
          isSelected={false}
          opacity={drawingPhase === 'start_selected' ? 0.6 : 1}
        />
        {/* Control point handle for curved lines */}
        {controlPixel && drawingConfig.lineType === 'curved' && drawingPhase === 'adjusting_curve' && (
          <>
            {/* Line from start to control point */}
            <Line
              points={[startPixel.x, startPixel.y, controlPixel.x, controlPixel.y]}
              stroke="#94a3b8"
              strokeWidth={1}
              dash={[4, 4]}
            />
            {/* Line from control point to end */}
            {endPixel && (
              <Line
                points={[controlPixel.x, controlPixel.y, endPixel.x, endPixel.y]}
                stroke="#94a3b8"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}
            {/* Control point handle */}
            <Circle
              x={controlPixel.x}
              y={controlPixel.y}
              radius={8}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </>
        )}
      </>
    );
  };

  // Render concept preview actions with semi-transparent blue style
  const renderConceptPreview = () => {
    if (previewActions.length === 0) return null;

    return previewActions.map((action) => {
      if (action.actionType === 'route') {
        const routeAction = action as RouteAction;
        const player = players.find((p) => p.id === routeAction.fromPlayerId);
        let controlPoints = [...routeAction.route.controlPoints];
        if (player && controlPoints.length > 0) {
          controlPoints[0] = { x: player.alignment.x, y: player.alignment.y };
        }
        const points = pointsToPixelArray(controlPoints, width, height);
        const tension = routeAction.route.pathType === 'tension' ? (routeAction.route.tension || 0.3) : 0;

        return (
          <LineWithMarker
            key={action.id}
            points={points}
            stroke="#3b82f6"
            strokeWidth={3}
            dash={undefined}
            tension={tension}
            endMarker={routeAction.style?.endMarker || 'arrow'}
            isSelected={false}
            isHovered={false}
            opacity={0.6}
          />
        );
      }

      if (action.actionType === 'block') {
        const blockAction = action as BlockAction;
        const points = pointsToPixelArray(blockAction.block.pathPoints, width, height);

        return (
          <LineWithMarker
            key={action.id}
            points={points}
            stroke="#3b82f6"
            strokeWidth={3}
            dash={undefined}
            tension={0}
            endMarker="t_block"
            isSelected={false}
            isHovered={false}
            opacity={0.6}
          />
        );
      }

      return null;
    });
  };

  // Render zone drag preview
  const renderZonePreview = () => {
    if (!zoneDragStart || !zoneDragCurrent) return null;

    const startPixel = toPixel(zoneDragStart, width, height);
    const currentPixel = toPixel(zoneDragCurrent, width, height);

    const x = Math.min(startPixel.x, currentPixel.x);
    const y = Math.min(startPixel.y, currentPixel.y);
    const zoneWidth = Math.abs(currentPixel.x - startPixel.x);
    const zoneHeight = Math.abs(currentPixel.y - startPixel.y);

    const centerX = x + zoneWidth / 2;
    const centerY = y + zoneHeight / 2;

    if (zonePlacementConfig.shape === 'circle') {
      const radius = Math.min(zoneWidth, zoneHeight) / 2;
      return (
        <Circle
          x={centerX}
          y={centerY}
          radius={radius}
          fill={zonePlacementConfig.fillColor}
          opacity={zonePlacementConfig.opacity / 100}
          stroke={zonePlacementConfig.fillColor}
          strokeWidth={2}
          dash={[6, 4]}
        />
      );
    }

    if (zonePlacementConfig.shape === 'triangle') {
      return (
        <Shape
          x={centerX}
          y={centerY}
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(0, -zoneHeight / 2);
            context.lineTo(-zoneWidth / 2, zoneHeight / 2);
            context.lineTo(zoneWidth / 2, zoneHeight / 2);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={zonePlacementConfig.fillColor}
          opacity={zonePlacementConfig.opacity / 100}
          stroke={zonePlacementConfig.fillColor}
          strokeWidth={2}
          dash={[6, 4]}
        />
      );
    }

    // Default: square/rectangle
    return (
      <Shape
        x={centerX}
        y={centerY}
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.rect(-zoneWidth / 2, -zoneHeight / 2, zoneWidth, zoneHeight);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={zonePlacementConfig.fillColor}
        opacity={zonePlacementConfig.opacity / 100}
        stroke={zonePlacementConfig.fillColor}
        strokeWidth={2}
        dash={[6, 4]}
      />
    );
  };

  return (
    <Layer>
      {actions.map(renderAction)}
      {!isReadOnly && renderConceptPreview()}
      {!isReadOnly && renderDrawingPreview()}
      {!isReadOnly && renderZonePreview()}
      {/* Route tree overlay for hovered receiver */}
      {!isReadOnly && hoveredPlayer && (
        <RouteTreeOverlay
          player={hoveredPlayer}
          width={width}
          height={height}
          onRouteSelect={handleRouteTreeSelect}
        />
      )}
    </Layer>
  );
}
