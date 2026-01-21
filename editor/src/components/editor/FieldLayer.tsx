'use client';

import { Layer, Line, Rect, Text } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';

interface FieldLayerProps {
  width: number;
  height: number;
}

export function FieldLayer({ width, height }: FieldLayerProps) {
  const field = useEditorStore((state) => state.play.field);

  // Field dimensions
  const sidePadding = 30; // Space for yard numbers on sides
  const fieldLeft = sidePadding;
  const fieldRight = width - sidePadding;
  const fieldWidth = fieldRight - fieldLeft;

  // Calculate Y position for yard lines
  // Offense direction is UPWARD:
  // - Backfield (negative yards) = bottom of screen (higher pixel Y)
  // - Defense direction (positive yards) = top of screen (lower pixel Y)
  // LOS is at 60% down from top (where 50 yard line is)
  const losY = height * 0.6;
  const yardHeight = height / 25; // 25 total yards visible

  // Yard line positions (relative to LOS, positive = toward defense = upward)
  // Show yard lines every 5 yards: -10, -5, 0, 5, 10, 15
  const yardLines = [-10, -5, 0, 5, 10, 15];

  // Field yard numbers (displayed on both sides, rotated)
  // LOS is at 50 yard line, offense moving toward opponent's end zone
  const yardNumbers = [
    { yard: -10, label: '40' },
    { yard: -5, label: '45' },
    { yard: 0, label: '50' },  // LOS
    { yard: 5, label: '45' },
    { yard: 10, label: '40' },
    { yard: 15, label: '35' },
  ];

  // Hash mark positions (1/3 and 2/3 of field width)
  const leftHashX = fieldLeft + fieldWidth / 3;
  const rightHashX = fieldLeft + (fieldWidth * 2) / 3;

  return (
    <Layer listening={false}>
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={field.backgroundColor}
      />

      {/* Yard Lines */}
      {field.showYardLines &&
        yardLines.map((yard) => {
          const y = losY - yard * yardHeight;
          const isLOS = yard === 0;

          return (
            <Line
              key={`yard-${yard}`}
              points={[fieldLeft, y, fieldRight, y]}
              stroke={field.lineColor}
              strokeWidth={isLOS ? 2 : 1}
              opacity={isLOS ? 0.8 : 0.4}
            />
          );
        })}

      {/* Yard Numbers - Left Side (rotated) */}
      {field.showYardLines &&
        yardNumbers.map(({ yard, label }) => {
          const y = losY - yard * yardHeight;
          return (
            <Text
              key={`yard-num-left-${yard}`}
              x={8}
              y={y}
              text={label}
              fontSize={16}
              fill={field.lineColor}
              opacity={0.35}
              rotation={-90}
              offsetX={8}
              offsetY={-4}
            />
          );
        })}

      {/* Yard Numbers - Right Side (rotated) */}
      {field.showYardLines &&
        yardNumbers.map(({ yard, label }) => {
          const y = losY - yard * yardHeight;
          return (
            <Text
              key={`yard-num-right-${yard}`}
              x={width - 8}
              y={y}
              text={label}
              fontSize={16}
              fill={field.lineColor}
              opacity={0.35}
              rotation={90}
              offsetX={8}
              offsetY={4}
            />
          );
        })}

      {/* Hash Marks */}
      {field.showHash && (
        <>
          {/* Left hash mark ticks */}
          {yardLines.map((yard) => {
            const y = losY - yard * yardHeight;
            return (
              <Line
                key={`hash-l-${yard}`}
                points={[leftHashX - 8, y, leftHashX + 8, y]}
                stroke={field.lineColor}
                strokeWidth={1}
                opacity={0.3}
              />
            );
          })}

          {/* Right hash mark ticks */}
          {yardLines.map((yard) => {
            const y = losY - yard * yardHeight;
            return (
              <Line
                key={`hash-r-${yard}`}
                points={[rightHashX - 8, y, rightHashX + 8, y]}
                stroke={field.lineColor}
                strokeWidth={1}
                opacity={0.3}
              />
            );
          })}

          {/* Vertical hash lines (subtle) */}
          <Line
            points={[leftHashX, 0, leftHashX, height]}
            stroke={field.lineColor}
            strokeWidth={1}
            opacity={0.1}
            dash={[4, 8]}
          />
          <Line
            points={[rightHashX, 0, rightHashX, height]}
            stroke={field.lineColor}
            strokeWidth={1}
            opacity={0.1}
            dash={[4, 8]}
          />
        </>
      )}
    </Layer>
  );
}
