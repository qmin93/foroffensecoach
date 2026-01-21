'use client';

import { useEffect, useCallback } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  titleIcon,
  badge,
  children,
  footer,
}: BottomSheetProps) {
  // Handle escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Mobile only */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Container */}
      <div
        className={`
          fixed inset-x-0 bottom-0 z-50
          max-h-[75vh] rounded-t-2xl
          md:inset-x-auto md:right-0 md:top-0 md:bottom-0
          md:w-80 md:max-h-none md:rounded-none
          bg-zinc-900 border-l border-zinc-700 flex flex-col
          transform transition-transform duration-300 ease-out
          translate-y-0 md:translate-y-0
          animate-slide-up-sheet md:animate-none
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
      >
        {/* Drag Handle - Mobile only */}
        <div className="md:hidden flex justify-center py-2 flex-shrink-0">
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            {titleIcon}
            <h3 id="bottom-sheet-title" className="font-semibold text-white">
              {title}
            </h3>
            {badge}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-3 border-t border-zinc-700 bg-zinc-800/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

export default BottomSheet;
