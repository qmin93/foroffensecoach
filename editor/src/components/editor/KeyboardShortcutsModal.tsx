'use client';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'General', items: [
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo (alternative)' },
    { keys: ['Ctrl', 'S'], description: 'Save play' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Esc'], description: 'Cancel / Deselect' },
    { keys: ['?'], description: 'Show shortcuts' },
  ]},
  { category: 'Selection', items: [
    { keys: ['Click'], description: 'Select player/line' },
    { keys: ['Shift', 'Click'], description: 'Add to selection' },
    { keys: ['Delete'], description: 'Delete selected' },
    { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
  ]},
  { category: 'Movement', items: [
    { keys: ['↑', '↓', '←', '→'], description: 'Move selected (small)' },
    { keys: ['Shift', '↑', '↓', '←', '→'], description: 'Move selected (large)' },
    { keys: ['Drag'], description: 'Move player' },
  ]},
  { category: 'Drawing', items: [
    { keys: ['Click player'], description: 'Start drawing from player' },
    { keys: ['Click canvas'], description: 'Set end point' },
    { keys: ['Right-click'], description: 'Context menu' },
    { keys: ['A'], description: 'Straight line' },
    { keys: ['S'], description: 'Curved line' },
    { keys: ['D'], description: 'Angular line' },
  ]},
  { category: 'Zoom', items: [
    { keys: ['Ctrl', '+'], description: 'Zoom in' },
    { keys: ['Ctrl', '-'], description: 'Zoom out' },
    { keys: ['Ctrl', '0'], description: 'Reset zoom' },
  ]},
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 sticky top-0 bg-zinc-900">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          {keyIdx > 0 && <span className="text-zinc-500 mx-1">+</span>}
                          <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-xs font-mono text-zinc-200">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-zinc-300">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 bg-zinc-800/50">
          <p className="text-xs text-zinc-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">?</kbd> anytime to show this dialog
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
