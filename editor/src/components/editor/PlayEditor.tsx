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
import { toast } from '@/store/toastStore';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ZoomControls } from './ZoomControls';
import { SituationHeader } from './SituationHeader';
import { TopBar } from './TopBar';
import { FormationBar } from './FormationBar';
import { MobileBottomBar } from './MobileBottomBar';
import { FloatingActions } from './FloatingActions';
import { PropertiesPanel } from './PropertiesPanel';

export function PlayEditor() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);

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

  // Keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);

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
  const addAngularPoint = useEditorStore((state) => state.addAngularPoint);
  const confirmAngularDrawing = useEditorStore((state) => state.confirmAngularDrawing);
  const angularPoints = useEditorStore((state) => state.angularPoints);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const setStageSize = useEditorStore((state) => state.setStageSize);
  const stageWidth = useEditorStore((state) => state.stageWidth);
  const stageHeight = useEditorStore((state) => state.stageHeight);
  const editingActionId = useEditorStore((state) => state.editingActionId);
  const updateEditingPoint = useEditorStore((state) => state.updateEditingPoint);
  const finishEditingAction = useEditorStore((state) => state.finishEditingAction);
  const zoom = useEditorStore((state) => state.zoom);
  const zoomIn = useEditorStore((state) => state.zoomIn);
  const zoomOut = useEditorStore((state) => state.zoomOut);
  const resetZoom = useEditorStore((state) => state.resetZoom);
  const gridSnapEnabled = useEditorStore((state) => state.gridSnapEnabled);
  const toggleGridSnap = useEditorStore((state) => state.toggleGridSnap);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const history = useEditorStore((state) => state.history);
  const redo = useEditorStore((state) => state.redo);

  // Computed undo/redo availability
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Concept panel state for mobile toggle buttons
  const isConceptPanelOpen = useConceptStore((state) => state.isPanelOpen);
  const openConceptPanel = useConceptStore((state) => state.openPanel);
  const closeConceptPanel = useConceptStore((state) => state.closePanel);

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

  // Prevent scrolling on editor page
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

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
        } else if (drawingPhase === 'angular_drawing') {
          // Add point to angular path (single click)
          addAngularPoint(normalized);
        }
        return;
      }

      // Only deselect if clicking on the stage background in select mode
      if (e.target === stage && mode === 'select') {
        clearSelection();
      }
    },
    [mode, drawingPhase, stageWidth, stageHeight, setDrawingEndPoint, confirmDrawing, clearSelection, addAngularPoint]
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
        // Update preview point for angular drawing (shows next segment)
        else if (drawingPhase === 'angular_drawing') {
          setPreviewPoint(normalized);
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

  // Handle double-click for confirming angular drawing
  const handleDoubleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (mode === 'draw' && drawingPhase === 'angular_drawing') {
        if ('preventDefault' in e.evt) {
          e.evt.preventDefault();
        }
        confirmAngularDrawing();
      }
    },
    [mode, drawingPhase, confirmAngularDrawing]
  );

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

      // Enter to confirm angular drawing
      if (e.key === 'Enter' && drawingPhase === 'angular_drawing') {
        e.preventDefault();
        confirmAngularDrawing();
        return;
      }

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

      // Zoom controls
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        store.zoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        store.zoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        store.resetZoom();
      }

      // Show keyboard shortcuts (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShowShortcuts(true);
      }

      // Line type shortcuts (A=Straight, S=Curved, D=Angular)
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
        store.setDrawingConfig({ lineType: 'straight' });
      }
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault(); // Prevent browser save dialog
        store.setDrawingConfig({ lineType: 'curved' });
      }
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        store.setDrawingConfig({ lineType: 'angular' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingPhase, cancelDrawing, clearSelection, editingActionId, finishEditingAction, confirmAngularDrawing]);

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
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Desktop TopBar */}
      <TopBar
        onSave={save}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onExportPNG={handleExport}
        onExportPDF={handlePDFClick}
        onShare={handleShareClick}
        canShare={!!(canShareLinks && isAuthenticated && play.id && !play.id.startsWith('new-'))}
      />

      {/* Desktop FormationBar */}
      <FormationBar />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white hover:bg-zinc-800 rounded-lg"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <span className="text-white font-medium text-sm truncate mx-2">{play.name || 'New Play'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileInstructions(!showMobileInstructions)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            aria-label="Show help"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {isAuthenticated ? (
            <button
              onClick={save}
              disabled={isSaving}
              className="p-2 text-green-400 hover:bg-zinc-800 rounded-lg disabled:opacity-50"
              aria-label="Save play"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="p-2 text-green-400 hover:bg-zinc-800 rounded-lg"
              aria-label="Login"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex flex-row min-h-0">
      {/* Toolbar - Slide-out on mobile */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-72 flex-shrink-0 border-r border-zinc-800 flex flex-col
          bg-zinc-950 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex-1 overflow-y-auto">
          <Toolbar
            onConceptPanelToggle={(isOpen) => {
              // Close Install Focus when opening concepts panel
              if (isOpen) {
                setShowInstallFocus(false);
              }
            }}
          />
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 space-y-2">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => { save(); setIsMobileMenuOpen(false); }}
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
              onClick={() => { handleExport(); setIsMobileMenuOpen(false); }}
              variant="outline"
              className="flex-1 border-zinc-600 hover:bg-zinc-800 text-sm"
            >
              PNG
            </Button>
            <Button
              onClick={() => { handlePDFClick(); setIsMobileMenuOpen(false); }}
              variant="outline"
              className={`flex-1 border-zinc-600 hover:bg-zinc-800 text-sm relative ${
                !canExportPDF ? 'opacity-75' : ''
              }`}
            >
              PDF
              {!canExportPDF && (
                <svg className="w-3 h-3 absolute top-1 right-1 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          {isAuthenticated && play.id && !play.id.startsWith('new-') && (
            <Button
              onClick={() => { handleShareClick(); setIsMobileMenuOpen(false); }}
              variant="outline"
              className={`w-full border-zinc-600 hover:bg-zinc-800 relative ${
                !canShareLinks ? 'opacity-75' : ''
              }`}
            >
              Share
              {!canShareLinks && (
                <svg className="w-3 h-3 absolute top-2 right-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Panel Toggle Buttons */}
      <div className="md:hidden flex items-center justify-center gap-2 py-2 px-3 border-b border-zinc-800 bg-zinc-900/50">
        <button
          onClick={() => {
            if (isConceptPanelOpen) {
              closeConceptPanel();
            } else {
              openConceptPanel();
              setShowInstallFocus(false);
            }
          }}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${isConceptPanelOpen
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Concepts
        </button>
        <button
          onClick={() => {
            if (showInstallFocus) {
              setShowInstallFocus(false);
            } else {
              setShowInstallFocus(true);
              closeConceptPanel();
            }
          }}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${showInstallFocus
              ? 'bg-orange-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Drills
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Situation Header - Down & Distance, Defense Settings */}
        <SituationHeader />

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 min-h-0"
          style={{ cursor: getCursor() }}
        >
        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-2 mb-2">
          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={resetZoom}
          />
          <button
            onClick={toggleGridSnap}
            className={`p-2 rounded-lg border transition-colors ${
              gridSnapEnabled
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
            title={`Grid snap: ${gridSnapEnabled ? 'ON' : 'OFF'}`}
            aria-pressed={gridSnapEnabled}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            onClick={handleStageClick}
            onDblClick={handleDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTap={handleStageClick}
            onDblTap={handleDoubleClick}
            onTouchEnd={handleMouseUp}
            onContextMenu={handleContextMenu}
          >
            <FieldLayer width={stageWidth} height={stageHeight} />
            <ActionLayer width={stageWidth} height={stageHeight} />
            <PlayerLayer width={stageWidth} height={stageHeight} />
          </Stage>
        </div>
      </div>
      </div>
      </div> {/* End Main Content with Sidebar */}

      {/* Instructions - Desktop */}
      <div className="hidden md:block absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded max-w-xs z-10">
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

      {/* Mobile Instructions Modal */}
      {showMobileInstructions && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowMobileInstructions(false)}>
          <div className="bg-zinc-900 text-white text-sm p-4 rounded-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Mode: {mode.toUpperCase()}</span>
              <button onClick={() => setShowMobileInstructions(false)} className="p-1 hover:bg-zinc-800 rounded" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {mode === 'select' && (
              <ul className="space-y-1 text-zinc-300">
                <li>Tap to select player/line</li>
                <li>Drag to move selected items</li>
                <li>Long press for context menu</li>
              </ul>
            )}
            {mode === 'draw' && (
              <ul className="space-y-1 text-zinc-300">
                <li>{drawingConfig.lineType === 'straight' ? 'Straight' : 'Curved'} line mode</li>
                {drawingPhase === 'idle' && <li>Tap a player to start drawing</li>}
                {drawingPhase === 'start_selected' && <li>Tap to set end point</li>}
                {drawingPhase === 'adjusting_curve' && <li>Drag to adjust curve, tap to confirm</li>}
              </ul>
            )}
            <div className="mt-3 pt-3 border-t border-zinc-700 text-zinc-400 text-xs">
              <p>Use the menu (top-left) to access tools and export options.</p>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}

      {/* Concept Panel - hidden when Install Focus is open */}
      {!showInstallFocus && (
        <ConceptPanel
          onApplyConcept={handleApplyConcept}
          onOpenInstallFocus={() => {
            setShowInstallFocus(true);
            useConceptStore.getState().closePanel();
          }}
        />
      )}

      {/* Install Focus Panel - mutually exclusive with Concept Panel */}
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

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Floating Action Button - Desktop only */}
      <FloatingActions
        onAddPlayer={() => {
          // Add a new player at center field
          useEditorStore.getState().addPlayer(
            'WR',
            { x: 0.5, y: -0.1 },
            {
              shape: 'circle',
              fill: '#ffffff',
              stroke: '#000000',
              showLabel: true,
            }
          );
        }}
        onOpenConcepts={() => {
          openConceptPanel();
          setShowInstallFocus(false);
        }}
      />

      {/* Properties Panel - Shows when element is selected */}
      <PropertiesPanel />

      {/* Mobile Bottom Bar - Fixed at bottom */}
      <MobileBottomBar
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenConcepts={() => {
          openConceptPanel();
          setShowInstallFocus(false);
        }}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}
