'use client';

import { useEffect, useState } from 'react';

interface UndoToastProps {
  message: string;
  isVisible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoToast({
  message,
  isVisible,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    // Start countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-700">
          <div
            className="h-full bg-blue-500 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message */}
          <p className="text-sm text-white">{message}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onUndo}
              className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
              aria-label="Undo action"
            >
              Undo
            </button>
            <button
              onClick={onDismiss}
              className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UndoToast;
