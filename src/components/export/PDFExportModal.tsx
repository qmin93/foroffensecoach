'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PDFExportSettings, DEFAULT_PDF_SETTINGS } from '@/lib/pdf-export';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: PDFExportSettings) => Promise<void>;
  playName: string;
  isPro?: boolean;
}

export function PDFExportModal({
  isOpen,
  onClose,
  onExport,
  playName,
  isPro = false,
}: PDFExportModalProps) {
  const [settings, setSettings] = useState<PDFExportSettings>({
    ...DEFAULT_PDF_SETTINGS,
    watermark: isPro ? undefined : 'Created with ForOffenseCoach',
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(settings);
      onClose();
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const updateSetting = <K extends keyof PDFExportSettings>(
    key: K,
    value: PDFExportSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold text-white mb-2">Export to PDF</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Export "{playName}" as a PDF document
        </p>

        <div className="space-y-4">
          {/* Page Style */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Page Style</Label>
            <Select
              value={settings.pageStyle}
              onValueChange={(value) =>
                updateSetting('pageStyle', value as PDFExportSettings['pageStyle'])
              }
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="modern" className="text-white focus:bg-zinc-700">
                  Modern (Dark Header)
                </SelectItem>
                <SelectItem value="classic" className="text-white focus:bg-zinc-700">
                  Classic (Simple Line)
                </SelectItem>
                <SelectItem value="minimal" className="text-white focus:bg-zinc-700">
                  Minimal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer Style */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Footer</Label>
            <Select
              value={settings.footer}
              onValueChange={(value) =>
                updateSetting('footer', value as PDFExportSettings['footer'])
              }
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="playName+page" className="text-white focus:bg-zinc-700">
                  Play Name + Page Number
                </SelectItem>
                <SelectItem value="pageOnly" className="text-white focus:bg-zinc-700">
                  Page Number Only
                </SelectItem>
                <SelectItem value="none" className="text-white focus:bg-zinc-700">
                  No Footer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeNotes}
                onChange={(e) => updateSetting('includeNotes', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-zinc-300">Include coaching notes</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeGrid}
                onChange={(e) => updateSetting('includeGrid', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-zinc-300">Include field border</span>
            </label>
          </div>

          {/* Watermark Notice */}
          {!isPro && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                Free tier includes watermark. Upgrade to Pro for watermark-free exports.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 bg-blue-600 hover:bg-blue-500"
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
