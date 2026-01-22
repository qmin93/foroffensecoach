'use client';

import { Layer, Rect } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import { toPixel } from '@/utils/coordinates';

interface SelectionLayerProps {
  width: number;
  height: number;
}

export function SelectionLayer({ width, height }: SelectionLayerProps) {
  const marqueeStart = useEditorStore((state) => state.marqueeStart);
  const marqueeEnd = useEditorStore((state) => state.marqueeEnd);

  if (!marqueeStart || !marqueeEnd) {
    return <Layer name="selectionLayer" />;
  }

  const startPixel = toPixel(marqueeStart, width, height);
  const endPixel = toPixel(marqueeEnd, width, height);

  const x = Math.min(startPixel.x, endPixel.x);
  const y = Math.min(startPixel.y, endPixel.y);
  const rectWidth = Math.abs(endPixel.x - startPixel.x);
  const rectHeight = Math.abs(endPixel.y - startPixel.y);

  return (
    <Layer name="selectionLayer">
      <Rect
        x={x}
        y={y}
        width={rectWidth}
        height={rectHeight}
        fill="rgba(59, 130, 246, 0.1)"
        stroke="#3b82f6"
        strokeWidth={1}
        dash={[4, 4]}
      />
    </Layer>
  );
}
