'use client';

import { Layer, Arrow, Line, Shape, Circle, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '@/store/editorStore';
import { Action, RouteAction, BlockAction, MotionAction, LandmarkAction, TextAction, Point, EndMarker, Player } from '@/types/dsl';
import { toPixel, pointsToPixelArray } from '@/utils/coordinates';

interface ActionLayerProps {
  width: number;
  height: number;
  actions?: Action[];
  isReadOnly?: boolean;
}

// Convert LineStyle to Konva dash array
function getDash(lineStyle: string): number[] | undefined {
  switch (lineStyle) {
    case 'dashed':
      return [10, 5];
    case 'dotted':
      return [2, 4];
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
    </>
  );
}

// Edit handle for control points
function EditHandle({
  x,
  y,
  onMouseDown,
  color = '#3b82f6',
  isActive = false,
  label,
}: {
  x: number;
  y: number;
  onMouseDown: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
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
  editingPointType,
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
  editingPointType: 'start' | 'end' | 'control' | null;
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

  const handleMouseEnter = () => {
    onMouseEnter?.(action.id);
  };

  const tension = route.pathType === 'tension' ? (route.tension || 0.3) : 0;

  // Get pixel positions for edit handles
  const startPixel = controlPoints.length > 0 ? toPixel(controlPoints[0], width, height) : null;
  const endPixel = controlPoints.length > 1 ? toPixel(controlPoints[controlPoints.length - 1], width, height) : null;
  const controlPixel = controlPoints.length > 2 ? toPixel(controlPoints[1], width, height) : null;

  return (
    <>
      <LineWithMarker
        points={points}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        dash={getDash(style.lineStyle)}
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
          {/* Guide lines for curved paths (show control point connections) */}
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

// Render Block action
function BlockShape({ action, width, height, isSelected, isHovered = false, onSelect, onMouseEnter, onMouseLeave }: {
  action: BlockAction;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
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

  const tension = block.pathType === 'tension' ? (block.tension || 0.3) : 0;

  return (
    <LineWithMarker
      points={points}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      dash={getDash(style.lineStyle)}
      tension={tension}
      endMarker={style.endMarker}
      isSelected={isSelected}
      isHovered={isHovered}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

// Render Motion action
function MotionShape({ action, width, height, isSelected, isHovered = false, onSelect, onMouseEnter, onMouseLeave }: {
  action: MotionAction;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
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

  const tension = motion.pathType === 'tension' ? (motion.tension || 0.3) : 0;

  return (
    <LineWithMarker
      points={points}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      dash={getDash(style.lineStyle)}
      tension={tension}
      endMarker={style.endMarker}
      isSelected={isSelected}
      isHovered={isHovered}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    />
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

export function ActionLayer({ width, height, actions: propActions, isReadOnly = false }: ActionLayerProps) {
  const storeActions = useEditorStore((state) => state.play.actions);
  const players = useEditorStore((state) => state.play.roster.players);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const hoveredActionId = useEditorStore((state) => state.hoveredActionId);
  const selectAction = useEditorStore((state) => state.selectAction);
  const setHoveredAction = useEditorStore((state) => state.setHoveredAction);
  const startEditingAction = useEditorStore((state) => state.startEditingAction);
  const mode = useEditorStore((state) => state.mode);

  const actions = propActions ?? storeActions;

  // Editing state
  const editingActionId = useEditorStore((state) => state.editingActionId);
  const editingPointType = useEditorStore((state) => state.editingPointType);

  // Drawing state
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const drawingStartPoint = useEditorStore((state) => state.drawingStartPoint);
  const drawingEndPoint = useEditorStore((state) => state.drawingEndPoint);
  const drawingControlPoint = useEditorStore((state) => state.drawingControlPoint);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const previewPoint = useEditorStore((state) => state.previewPoint);

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
            editingPointType={isEditing ? editingPointType : null}
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
      default:
        return null;
    }
  };

  // Render drawing preview with rubber band effect
  const renderDrawingPreview = () => {
    if (drawingPhase === 'idle' || !drawingStartPoint) return null;

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
          dash={getDash(drawingConfig.lineStyle)}
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

  return (
    <Layer>
      {actions.map(renderAction)}
      {!isReadOnly && renderDrawingPreview()}
    </Layer>
  );
}
