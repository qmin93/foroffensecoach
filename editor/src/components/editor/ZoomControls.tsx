'use client';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minZoom = 0.5,
  maxZoom = 2,
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="p-1.5 rounded hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom out"
        title="Zoom out (Ctrl+-)"
      >
        <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <button
        onClick={onZoomReset}
        className="px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 rounded transition-colors min-w-[48px]"
        title="Reset zoom (Ctrl+0)"
      >
        {zoomPercentage}%
      </button>

      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="p-1.5 rounded hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom in"
        title="Zoom in (Ctrl++)"
      >
        <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default ZoomControls;
