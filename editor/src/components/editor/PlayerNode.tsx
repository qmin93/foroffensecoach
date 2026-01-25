'use client';

import { Group, Circle, Rect, RegularPolygon, Star, Text, Shape, Label, Tag } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Player, PlayerShape } from '@/types/dsl';
import { toPixel } from '@/utils/coordinates';
import { useEditorStore } from '@/store/editorStore';

interface PlayerNodeProps {
  player: Player;
  stageWidth: number;
  stageHeight: number;
  maxRadius?: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect?: (playerId: string, shiftKey: boolean) => void;
  onDragEnd?: (playerId: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onMouseEnter?: (playerId: string) => void;
  onMouseLeave?: () => void;
  draggable?: boolean;
  assignmentText?: string | null;
}

export function PlayerNode({
  player,
  stageWidth,
  stageHeight,
  maxRadius = 120,
  isSelected,
  isHovered = false,
  onSelect,
  onDragEnd,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  draggable = true,
  assignmentText,
}: PlayerNodeProps) {
  const mode = useEditorStore((state) => state.mode);
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const drawingFromPlayerId = useEditorStore((state) => state.drawingFromPlayerId);

  const { x, y } = toPixel(
    { x: player.alignment.x, y: player.alignment.y },
    stageWidth,
    stageHeight
  );

  const { appearance } = player;
  const { shape, strokeWidth, labelFontSize, showLabel } =
    appearance;

  // Check if this is the BALL - BALL has special handling
  const isBall = player.role === 'BALL';

  // Responsive sizing: scale radius and font based on stage width
  // Node size: 1.8% of canvas width (FirstDown PlayBook style)
  // EXCEPTION: BALL uses fixed size from appearance.radius (default 10)
  const baseRadius = Math.max(8, Math.min(18, stageWidth * 0.018));
  const radius = isBall
    ? (appearance.radius || 10) // BALL uses its own fixed size
    : Math.min(baseRadius, maxRadius);
  const responsiveLabelFontSize = Math.max(7, Math.min(10, stageWidth * 0.01));

  // Check if this player is the drawing source
  const isDrawingSource = drawingFromPlayerId === player.id;

  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    const shiftKey = 'shiftKey' in e.evt ? e.evt.shiftKey : false;
    onSelect?.(player.id, shiftKey);
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(player.id);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
  };

  const handleDragStart = () => {
    onDragStart?.();
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    onDragEnd?.(player.id, newX, newY);
  };

  const renderShape = () => {
    // Highlight when selected, hovered, or when it's the drawing source
    const isHighlighted = isSelected || isDrawingSource;

    // Editor uses only black and white: white fill, black border
    // Selection/hover states use blue for visibility
    // EXCEPTION: BALL uses its original brown color (#8B4513)
    const shapeProps = {
      x: 0,
      y: 0,
      fill: isBall ? (appearance.fill || '#8B4513') : '#ffffff', // BALL uses brown, others white
      stroke: isHighlighted ? '#3b82f6' : isHovered ? '#60a5fa' : (isBall ? '#ffffff' : '#000000'), // BALL has white border, others black
      strokeWidth: isHighlighted ? strokeWidth + 2 : isHovered ? strokeWidth + 1 : strokeWidth,
      shadowColor: isHovered && !isSelected ? '#3b82f6' : undefined,
      shadowBlur: isHovered && !isSelected ? 8 : 0,
      shadowOpacity: isHovered && !isSelected ? 0.5 : 0,
    };

    switch (shape) {
      case 'circle':
        return <Circle {...shapeProps} radius={radius} />;

      case 'square':
        return (
          <Rect
            {...shapeProps}
            width={radius * 2}
            height={radius * 2}
            offsetX={radius}
            offsetY={radius}
          />
        );

      case 'triangle':
        return <RegularPolygon {...shapeProps} sides={3} radius={radius} />;

      case 'diamond':
        return <RegularPolygon {...shapeProps} sides={4} radius={radius} rotation={45} />;

      case 'star':
        return (
          <Star
            {...shapeProps}
            numPoints={5}
            innerRadius={radius * 0.5}
            outerRadius={radius}
          />
        );

      case 'x_mark':
        return (
          <Shape
            {...shapeProps}
            sceneFunc={(context, shape) => {
              const size = radius * 0.8;
              context.beginPath();
              context.moveTo(-size, -size);
              context.lineTo(size, size);
              context.moveTo(size, -size);
              context.lineTo(-size, size);
              context.fillStrokeShape(shape);
            }}
          />
        );

      case 'football':
        return (
          <Shape
            {...shapeProps}
            sceneFunc={(context, shape) => {
              const w = radius * 1.6; // Width
              const h = radius * 1.0; // Height
              context.beginPath();
              // Draw football/rugby ball shape using bezier curves
              context.moveTo(-w, 0);
              context.bezierCurveTo(-w, -h * 1.2, w, -h * 1.2, w, 0);
              context.bezierCurveTo(w, h * 1.2, -w, h * 1.2, -w, 0);
              context.closePath();
              context.fillStrokeShape(shape);
              // Draw laces - BALL uses white laces, others use black/blue
              const laceColor = isHighlighted ? '#3b82f6' : isHovered ? '#60a5fa' : (isBall ? '#ffffff' : '#000000');
              context.save();
              context.strokeStyle = laceColor;
              context.lineWidth = strokeWidth * 0.7;
              // Center line
              context.beginPath();
              context.moveTo(-w * 0.3, 0);
              context.lineTo(w * 0.3, 0);
              context.stroke();
              // Cross laces
              const laceSpacing = w * 0.15;
              for (let i = -2; i <= 2; i++) {
                const lx = i * laceSpacing;
                context.beginPath();
                context.moveTo(lx, -h * 0.25);
                context.lineTo(lx, h * 0.25);
                context.stroke();
              }
              context.restore();
            }}
          />
        );

      default:
        return <Circle {...shapeProps} radius={radius} />;
    }
  };

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Selection ring - shows behind the player shape */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={radius + 6}
          stroke="#3b82f6"
          strokeWidth={3}
          dash={[6, 3]}
          fill="transparent"
        />
      )}

      {/* Drawing source indicator */}
      {isDrawingSource && !isSelected && (
        <Circle
          x={0}
          y={0}
          radius={radius + 4}
          stroke="#22c55e"
          strokeWidth={2}
          fill="transparent"
        />
      )}

      {renderShape()}

      {showLabel && player.label && (
        <Text
          text={player.label}
          fontSize={responsiveLabelFontSize}
          fill="#000000"
          align="center"
          verticalAlign="middle"
          width={radius * 2}
          height={responsiveLabelFontSize}
          offsetX={radius}
          offsetY={responsiveLabelFontSize / 2}
          fontStyle="bold"
        />
      )}

      {/* Assignment badge - shows above the player */}
      {assignmentText && (
        <Label x={0} y={-radius - 22} offsetX={0}>
          <Tag
            fill="rgba(17,24,39,0.92)"
            cornerRadius={4}
            pointerDirection="down"
            pointerWidth={6}
            pointerHeight={4}
          />
          <Text
            text={assignmentText.length > 28 ? assignmentText.slice(0, 28) + '…' : assignmentText}
            fontSize={9}
            fontStyle="600"
            fill="white"
            padding={4}
          />
        </Label>
      )}
    </Group>
  );
}
