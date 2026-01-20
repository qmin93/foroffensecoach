'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { RouteAction } from '@/types/dsl';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedPlayerIds = useEditorStore((state) => state.selectedPlayerIds);
  const selectedActionIds = useEditorStore((state) => state.selectedActionIds);
  const actions = useEditorStore((state) => state.play.actions);
  const deletePlayer = useEditorStore((state) => state.deletePlayer);
  const deleteAction = useEditorStore((state) => state.deleteAction);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const convertLineType = useEditorStore((state) => state.convertLineType);
  const selectAll = useEditorStore((state) => state.selectAll);

  // Get selected route for line-specific options
  const selectedRoute =
    selectedActionIds.length === 1
      ? (actions.find((a) => a.id === selectedActionIds[0]) as RouteAction | undefined)
      : null;

  const isRouteCurved =
    selectedRoute && selectedRoute.actionType === 'route'
      ? selectedRoute.route.controlPoints.length > 2
      : false;

  const hasSelection = selectedPlayerIds.length > 0 || selectedActionIds.length > 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedPosition = useCallback(() => {
    const menuWidth = 180;
    const menuHeight = 200;
    const padding = 10;

    let adjustedX = x;
    let adjustedY = y;

    if (typeof window !== 'undefined') {
      if (x + menuWidth + padding > window.innerWidth) {
        adjustedX = x - menuWidth;
      }
      if (y + menuHeight + padding > window.innerHeight) {
        adjustedY = y - menuHeight;
      }
    }

    return { x: Math.max(padding, adjustedX), y: Math.max(padding, adjustedY) };
  }, [x, y]);

  const pos = adjustedPosition();

  const handleDelete = () => {
    selectedPlayerIds.forEach((id) => deletePlayer(id));
    selectedActionIds.forEach((id) => deleteAction(id));
    onClose();
  };

  const handleDuplicate = () => {
    duplicateSelected();
    onClose();
  };

  const handleConvertLine = () => {
    if (selectedRoute) {
      convertLineType(selectedRoute.id, isRouteCurved ? 'straight' : 'curved');
    }
    onClose();
  };

  const handleSelectAll = () => {
    selectAll();
    onClose();
  };

  const menuItems = [
    ...(hasSelection
      ? [
          { label: 'Delete', shortcut: 'Del', onClick: handleDelete, danger: true },
          { label: 'Duplicate', shortcut: 'Ctrl+D', onClick: handleDuplicate },
        ]
      : []),
    ...(selectedRoute
      ? [
          { type: 'separator' as const },
          {
            label: isRouteCurved ? 'Convert to Straight' : 'Convert to Curved',
            onClick: handleConvertLine,
          },
        ]
      : []),
    { type: 'separator' as const },
    { label: 'Select All', shortcut: 'Ctrl+A', onClick: handleSelectAll },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      aria-label="Context menu"
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="h-px bg-zinc-600 my-1" />;
        }

        return (
          <button
            key={index}
            onClick={item.onClick}
            role="menuitem"
            className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-zinc-700 transition-colors ${
              item.danger ? 'text-red-400 hover:text-red-300' : 'text-white'
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-zinc-500 ml-4" aria-hidden="true">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
