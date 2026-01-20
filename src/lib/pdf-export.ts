import { jsPDF } from 'jspdf';
import Konva from 'konva';

export interface PDFExportSettings {
  pageStyle: 'classic' | 'modern' | 'minimal';
  includeNotes: boolean;
  includeGrid: boolean;
  footer: 'playName+page' | 'pageOnly' | 'none';
  playsPerPage: 1 | 2 | 4;
  watermark?: string;
  includeWatermark?: boolean; // For subscription-based watermarking
}

export const DEFAULT_PDF_SETTINGS: PDFExportSettings = {
  pageStyle: 'modern',
  includeNotes: true,
  includeGrid: true,
  footer: 'playName+page',
  playsPerPage: 1,
};

interface PlayData {
  name: string;
  imageDataUrl: string;
  notes?: string[];
  tags?: string[];
}

/**
 * Export a single play to PDF
 */
export async function exportPlayToPDF(
  stage: Konva.Stage,
  playName: string,
  notes: string[] = [],
  tags: string[] = [],
  settings: Partial<PDFExportSettings> = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_SETTINGS, ...settings };

  // Hide UI layer for export
  const uiLayer = stage.findOne('.uiLayer');
  if (uiLayer) {
    uiLayer.hide();
  }

  // Get the canvas image
  const imageDataUrl = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
  });

  // Show UI layer again
  if (uiLayer) {
    uiLayer.show();
  }

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Add styling based on pageStyle
  if (config.pageStyle === 'modern') {
    // Modern style: dark header bar
    pdf.setFillColor(30, 30, 30);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(playName, margin, 13);

    // Tags
    if (tags.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(tags.join(' | '), pageWidth - margin, 13, { align: 'right' });
    }

    pdf.setTextColor(0, 0, 0);
  } else if (config.pageStyle === 'classic') {
    // Classic style: simple text header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(playName, margin, 15);

    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, 18, pageWidth - margin, 18);
  } else {
    // Minimal style: no header decoration
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(playName, margin, 12);
  }

  // Calculate image dimensions (4:3 aspect ratio)
  const contentTop = config.pageStyle === 'modern' ? 25 : 22;
  const contentHeight = pageHeight - contentTop - (config.includeNotes && notes.length > 0 ? 40 : 15);
  const imageAspect = 4 / 3;
  let imageWidth = contentHeight * imageAspect;
  let imageHeight = contentHeight;

  // Ensure image fits within page width
  const maxImageWidth = config.includeNotes && notes.length > 0
    ? (pageWidth - margin * 3) * 0.65
    : pageWidth - margin * 2;

  if (imageWidth > maxImageWidth) {
    imageWidth = maxImageWidth;
    imageHeight = imageWidth / imageAspect;
  }

  const imageX = config.includeNotes && notes.length > 0 ? margin : (pageWidth - imageWidth) / 2;
  const imageY = contentTop;

  // Add border for the field
  if (config.includeGrid) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(imageX - 1, imageY - 1, imageWidth + 2, imageHeight + 2);
  }

  // Add the play image
  pdf.addImage(imageDataUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);

  // Add notes if enabled
  if (config.includeNotes && notes.length > 0) {
    const notesX = imageX + imageWidth + margin;
    const notesWidth = pageWidth - notesX - margin;
    let notesY = contentTop;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Coaching Points', notesX, notesY);
    notesY += 7;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    notes.forEach((note, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${note}`, notesWidth);
      pdf.text(lines, notesX, notesY);
      notesY += lines.length * 4 + 2;
    });
  }

  // Add watermark if specified or if subscription requires it
  const watermarkText = config.watermark || (config.includeWatermark ? 'Created with ForOffenseCoach (Free)' : null);
  if (watermarkText) {
    pdf.setFontSize(10);
    pdf.setTextColor(180, 180, 180);
    pdf.text(watermarkText, pageWidth / 2, pageHeight - 5, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  }

  // Add footer
  if (config.footer !== 'none') {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);

    if (config.footer === 'playName+page') {
      pdf.text(`${playName} - Page 1 of 1`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    } else {
      pdf.text('Page 1 of 1', pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  }

  // Download the PDF
  pdf.save(`${playName}.pdf`);
}

/**
 * Export multiple plays to a single PDF (playbook export)
 */
export async function exportPlaybookToPDF(
  plays: PlayData[],
  playbookName: string,
  settings: Partial<PDFExportSettings> = {}
): Promise<void> {
  const config = { ...DEFAULT_PDF_SETTINGS, ...settings };

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Cover page
  pdf.setFillColor(30, 30, 30);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(playbookName, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${plays.length} Plays`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(180, 180, 180);
  pdf.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

  if (config.watermark) {
    pdf.text(config.watermark, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Add each play
  plays.forEach((play, index) => {
    pdf.addPage();

    // Header
    pdf.setFillColor(30, 30, 30);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(play.name, margin, 13);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    if (play.tags && play.tags.length > 0) {
      pdf.text(play.tags.join(' | '), pageWidth - margin, 13, { align: 'right' });
    }

    pdf.setTextColor(0, 0, 0);

    // Image
    const contentTop = 25;
    const hasNotes = config.includeNotes && play.notes && play.notes.length > 0;
    const contentHeight = pageHeight - contentTop - 15;
    const imageAspect = 4 / 3;

    let imageWidth = contentHeight * imageAspect;
    let imageHeight = contentHeight;

    const maxImageWidth = hasNotes
      ? (pageWidth - margin * 3) * 0.65
      : pageWidth - margin * 2;

    if (imageWidth > maxImageWidth) {
      imageWidth = maxImageWidth;
      imageHeight = imageWidth / imageAspect;
    }

    const imageX = hasNotes ? margin : (pageWidth - imageWidth) / 2;
    const imageY = contentTop;

    if (config.includeGrid) {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(imageX - 1, imageY - 1, imageWidth + 2, imageHeight + 2);
    }

    pdf.addImage(play.imageDataUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);

    // Notes
    if (hasNotes && play.notes) {
      const notesX = imageX + imageWidth + margin;
      const notesWidth = pageWidth - notesX - margin;
      let notesY = contentTop;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Coaching Points', notesX, notesY);
      notesY += 7;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      play.notes.forEach((note, noteIndex) => {
        const lines = pdf.splitTextToSize(`${noteIndex + 1}. ${note}`, notesWidth);
        pdf.text(lines, notesX, notesY);
        notesY += lines.length * 4 + 2;
      });
    }

    // Footer
    if (config.footer !== 'none') {
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);

      if (config.footer === 'playName+page') {
        pdf.text(`${play.name} - Page ${index + 2} of ${plays.length + 1}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      } else {
        pdf.text(`Page ${index + 2} of ${plays.length + 1}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      if (config.watermark) {
        pdf.setFontSize(10);
        pdf.setTextColor(180, 180, 180);
        pdf.text(config.watermark, pageWidth / 2, pageHeight - 3, { align: 'center' });
      }
    }
  });

  // Download the PDF
  pdf.save(`${playbookName}.pdf`);
}
