'use client';

import { Group, Circle, Rect, RegularPolygon, Star, Text, Shape } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Player, PlayerShape } from '@/types/dsl';
import { toPixel } from '@/utils/coordinates';
import { useEditorStore } from '@/store/editorStore';

interface PlayerNodeProps {
  player: Player;
  stageWidth: number;
  stageHeight: number;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect?: (playerId: string, shiftKey: boolean) => void;
  onDragEnd?: (playerId: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onMouseEnter?: (playerId: string) => void;
  onMouseLeave?: () => void;
  draggable?: boolean;
}

export function PlayerNode({
  player,
  stageWidth,
  stageHeight,
  isSelected,
  isHovered = false,
  onSelect,
  onDragEnd,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  draggable = true,
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
  const { shape, fill, stroke, strokeWidth, radius, labelColor, labelFontSize, showLabel } =
    appearance;

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

    const shapeProps = {
      x: 0,
      y: 0,
      fill,
      stroke: isHighlighted ? '#3b82f6' : isHovered ? '#60a5fa' : stroke,
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

      {showLabel && (
        <Text
          text={player.label}
          fontSize={labelFontSize}
          fill={labelColor}
          align="center"
          verticalAlign="middle"
          offsetX={player.label.length * (labelFontSize * 0.3)}
          offsetY={labelFontSize / 2}
          fontStyle="bold"
        />
      )}
    </Group>
  );
}
