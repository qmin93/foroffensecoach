'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { useConceptStore } from '@/store/conceptStore';
import { useAuthStore } from '@/store/authStore';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FieldLayer } from './FieldLayer';
import { PlayerLayer } from './PlayerLayer';
import { ActionLayer } from './ActionLayer';
import { Toolbar } from './Toolbar';
import { ContextMenu } from './ContextMenu';
import { ConceptPanel } from './ConceptPanel';
import { InstallFocusPanel } from './InstallFocusPanel';
import { UndoToast } from './UndoToast';
import { toNormalized } from '@/utils/coordinates';
import { Button } from '@/components/ui/button';
import { useSavePlay } from '@/hooks/useSavePlay';
import { PDFExportModal } from '@/components/export/PDFExportModal';
import { exportPlayToPDF, PDFExportSettings } from '@/lib/pdf-export';
import { ShareModal } from '@/components/share/ShareModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { FeatureAccess } from '@/lib/subscription';

export function PlayEditor() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Undo toast state
  const [undoToast, setUndoToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // PDF export modal state
  const [showPDFExport, setShowPDFExport] = useState(false);

  // Share modal state
  const [showShare, setShowShare] = useState(false);

  // Install Focus panel state
  const [showInstallFocus, setShowInstallFocus] = useState(false);

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<keyof FeatureAccess | undefined>();

  // Auth state
  const { user, workspace } = useAuthStore();

  // Feature access
  const { tier, canExportPDF, canShareLinks, showWatermark } = useFeatureAccess();
  const isAuthenticated = !!user;

  // Save hook
  const { save, isSaving, lastSaved } = useSavePlay();

  const mode = useEditorStore((state) => state.mode);
  const play = useEditorStore((state) => state.play);
  const applyConceptTemplate = useEditorStore((state) => state.applyConceptTemplate);
  const undo = useEditorStore((state) => state.undo);
  const drawingPhase = useEditorStore((state) => state.drawingPhase);
  const drawingConfig = useEditorStore((state) => state.drawingConfig);
  const setDrawingEndPoint = useEditorStore((state) => state.setDrawingEndPoint);
  const setDrawingControlPoint = useEditorStore((state) => state.setDrawingControlPoint);
  const setPreviewPoint = useEditorStore((state) => state.setPreviewPoint);
  const confirmDrawing = useEditorStore((state) => state.confirmDrawing);
  const cancelDrawing = useEditorStore((state) => state.cancelDrawing);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const setStageSize = useEditorStore((state) => state.setStageSize);
  const stageWidth = useEditorStore((state) => state.stageWidth);
  const stageHeight = useEditorStore((state) => state.stageHeight);
  const editingActionId = useEditorStore((state) => state.editingActionId);
  const updateEditingPoint = useEditorStore((state) => state.updateEditingPoint);
  const finishEditingAction = useEditorStore((state) => state.finishEditingAction);

  // Responsive canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const padding = 32; // 16px padding on each side
      const availableWidth = rect.width - padding;
      const availableHeight = rect.height - padding;

      // Maintain 4:3 aspect ratio
      const aspectRatio = 4 / 3;
      let width = availableWidth;
      let height = width / aspectRatio;

      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspectRatio;
      }

      setStageSize(Math.floor(width), Math.floor(height));
    };

    // Initial size
    updateSize();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [setStageSize]);

  // Handle stage click for drawing and deselection
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const normalized = toNormalized(pointerPos, stageWidth, stageHeight);

      // Handle drawing phases
      if (mode === 'draw') {
        if (drawingPhase === 'start_selected') {
          // Set end point
          setDrawingEndPoint(normalized);
        } else if (drawingPhase === 'end_selected') {
          // Confirm straight line
          confirmDrawing();
        } else if (drawingPhase === 'adjusting_curve') {
          // Confirm curved line
          confirmDrawing();
        }
        return;
      }

      // Only deselect if clicking on the stage background in select mode
      if (e.target === stage && mode === 'select') {
        clearSelection();
      }
    },
    [mode, drawingPhase, stageWidth, stageHeight, setDrawingEndPoint, confirmDrawing, clearSelection]
  );

  // Handle mouse move for drawing preview and control point adjustment
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const normalized = toNormalized(pointerPos, stageWidth, stageHeight);

      // Handle editing mode
      if (editingActionId) {
        updateEditingPoint(normalized);
        return;
      }

      // Handle drawing mode
      if (mode === 'draw') {
        // Update preview point for rubber band effect
        if (drawingPhase === 'start_selected') {
          setPreviewPoint(normalized);
        }
        // Update control point when adjusting curve
        else if (drawingPhase === 'adjusting_curve') {
          setDrawingControlPoint(normalized);
        }
      }
    },
    [mode, drawingPhase, stageWidth, stageHeight, setDrawingControlPoint, setPreviewPoint, editingActionId, updateEditingPoint]
  );

  // Handle mouse up for finishing editing
  const handleMouseUp = useCallback(() => {
    if (editingActionId) {
      finishEditingAction();
    }
  }, [editingActionId, finishEditingAction]);

  // Handle right-click for context menu
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      // Get the absolute position relative to the page
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      // Calculate position relative to viewport
      const x = containerRect.left + pointerPos.x;
      const y = containerRect.top + pointerPos.y;

      setContextMenu({ x, y });
    },
    []
  );

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle applying a concept template
  const handleApplyConcept = useCallback(
    (conceptId: string) => {
      const result = applyConceptTemplate(conceptId);
      if (result.success) {
        setUndoToast({
          visible: true,
          message: result.message,
        });
      }
    },
    [applyConceptTemplate]
  );

  // Handle undo from toast
  const handleUndoFromToast = useCallback(() => {
    undo();
    setUndoToast({ visible: false, message: '' });
  }, [undo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const store = useEditorStore.getState();

      // Escape to cancel drawing or deselect
      if (e.key === 'Escape') {
        if (drawingPhase !== 'idle') {
          cancelDrawing();
        } else if (editingActionId) {
          finishEditingAction();
        } else {
          clearSelection();
        }
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
      }

      // Redo (Ctrl+Y)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        store.redo();
      }

      // Select All (Ctrl+A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        store.selectAll();
      }

      // Duplicate (Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        store.duplicateSelected();
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedPlayerIds, selectedActionIds, deletePlayer, deleteAction } = store;
        selectedPlayerIds.forEach((id) => deletePlayer(id));
        selectedActionIds.forEach((id) => deleteAction(id));
      }

      // Arrow keys for movement
      const moveAmount = e.shiftKey ? 0.05 : 0.01; // Shift for larger steps
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        store.moveSelectedByOffset(0, -moveAmount);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        store.moveSelectedByOffset(0, moveAmount);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        store.moveSelectedByOffset(-moveAmount, 0);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        store.moveSelectedByOffset(moveAmount, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingPhase, cancelDrawing, clearSelection, editingActionId, finishEditingAction]);

  // Export function
  const handleExport = useCallback(() => {
    if (!stageRef.current) return;

    // Hide UI layer for export
    const uiLayer = stageRef.current.findOne('.uiLayer');
    if (uiLayer) {
      uiLayer.hide();
    }

    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
    });

    // Show UI layer again
    if (uiLayer) {
      uiLayer.show();
    }

    // Download
    const link = document.createElement('a');
    link.download = `${useEditorStore.getState().play.name || 'play'}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // PDF Export function
  const handlePDFExport = useCallback(
    async (settings: PDFExportSettings) => {
      if (!stageRef.current) return;

      // Apply watermark setting based on subscription
      const exportSettings: PDFExportSettings = {
        ...settings,
        includeWatermark: showWatermark,
      };

      await exportPlayToPDF(
        stageRef.current,
        play.name || 'Play',
        play.notes?.coachingPoints || [],
        play.tags || [],
        exportSettings
      );
    },
    [play.name, play.notes, play.tags, showWatermark]
  );

  // Handle feature-gated PDF export click
  const handlePDFClick = useCallback(() => {
    if (!canExportPDF) {
      setUpgradeFeature('exportFormats');
      setShowUpgradeModal(true);
      return;
    }
    setShowPDFExport(true);
  }, [canExportPDF]);

  // Handle feature-gated share click
  const handleShareClick = useCallback(() => {
    if (!canShareLinks) {
      setUpgradeFeature('shareLinks');
      setShowUpgradeModal(true);
      return;
    }
    setShowShare(true);
  }, [canShareLinks]);

  // Cursor based on mode and phase
  const getCursor = () => {
    if (editingActionId) {
      return 'move';
    }
    if (mode === 'draw') {
      if (drawingPhase === 'idle') {
        return 'crosshair';
      } else if (drawingPhase === 'adjusting_curve') {
        return 'move';
      }
      return 'crosshair';
    }
    switch (mode) {
      case 'select':
        return 'default';
      case 'text':
        return 'text';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Toolbar */}
      <div className="w-72 flex-shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Toolbar />
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 space-y-2">
          {isAuthenticated ? (
            <>
              <Button
                onClick={save}
                disabled={isSaving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Play'}
              </Button>
              {lastSaved && (
                <p className="text-xs text-zinc-500 text-center">
                  Saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </>
          ) : (
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Login to Save
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex-1 border-zinc-600 hover:bg-zinc-800 text-sm"
            >
              PNG
            </Button>
            <Button
              onClick={handlePDFClick}
              variant="outline"
              className={`flex-1 border-zinc-600 hover:bg-zinc-800 text-sm relative ${
                !canExportPDF ? 'opacity-75' : ''
              }`}
            >
              PDF
              {!canExportPDF && (
                <svg className="w-3 h-3 absolute top-1 right-1 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </Button>
          </div>
          {showWatermark && canExportPDF && (
            <p className="text-[10px] text-orange-400 text-center">
              Free tier: PDF exports include watermark
            </p>
          )}
          <Button
            onClick={() => setShowInstallFocus(!showInstallFocus)}
            variant="outline"
            className={`w-full border-zinc-600 hover:bg-zinc-800 flex items-center justify-center gap-2 ${
              showInstallFocus ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Install Focus
          </Button>
          {isAuthenticated && play.id && !play.id.startsWith('new-') && (
            <Button
              onClick={handleShareClick}
              variant="outline"
              className={`w-full border-zinc-600 hover:bg-zinc-800 relative ${
                !canShareLinks ? 'opacity-75' : ''
              }`}
            >
              Share
              {!canShareLinks && (
                <svg className="w-3 h-3 absolute top-2 right-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </Button>
          )}
          {isAuthenticated && (
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4"
        style={{ cursor: getCursor() }}
      >
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            onClick={handleStageClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTap={handleStageClick}
            onTouchEnd={handleMouseUp}
            onContextMenu={handleContextMenu}
          >
            <FieldLayer width={stageWidth} height={stageHeight} />
            <ActionLayer width={stageWidth} height={stageHeight} />
            <PlayerLayer width={stageWidth} height={stageHeight} />
          </Stage>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs p-3 rounded max-w-xs">
        <div className="font-semibold mb-1">Mode: {mode.toUpperCase()}</div>
        {mode === 'select' && (
          <>
            <div>Click to select, Shift+click to multi-select</div>
            <div>Drag handles to edit lines</div>
            <div>Right-click for context menu</div>
          </>
        )}
        {mode === 'draw' && (
          <>
            <div className="mb-1">
              {drawingConfig.lineType === 'straight' ? 'Straight' : 'Curved'} line | End: {drawingConfig.endMarker}
            </div>
            {drawingPhase === 'idle' && <div>Click a player to start</div>}
            {drawingPhase === 'start_selected' && <div>Click to set end point</div>}
            {drawingPhase === 'end_selected' && <div>Click to confirm</div>}
            {drawingPhase === 'adjusting_curve' && <div>Move mouse to adjust curve, click to confirm</div>}
          </>
        )}
        <div className="mt-2 text-zinc-400 space-y-0.5">
          <div>ESC: Cancel | Ctrl+Z/Y: Undo/Redo</div>
          <div>Ctrl+A: Select All | Ctrl+D: Duplicate</div>
          <div>Arrow keys: Move (Shift for larger)</div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}

      {/* Concept Panel */}
      <ConceptPanel onApplyConcept={handleApplyConcept} />

      {/* Install Focus Panel */}
      <InstallFocusPanel
        isOpen={showInstallFocus}
        onClose={() => setShowInstallFocus(false)}
      />

      {/* Undo Toast */}
      <UndoToast
        message={undoToast.message}
        isVisible={undoToast.visible}
        onUndo={handleUndoFromToast}
        onDismiss={() => setUndoToast({ visible: false, message: '' })}
      />

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={showPDFExport}
        onClose={() => setShowPDFExport(false)}
        onExport={handlePDFExport}
        playName={play.name || 'Play'}
      />

      {/* Share Modal */}
      {user && play.id && (
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          playId={play.id}
          playName={play.name || 'Play'}
          userId={user.id}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={tier}
        blockedFeature={upgradeFeature}
        suggestedTier="pro"
      />
    </div>
  );
}
