import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { FontMetrics, LayoutItem } from '@common/form/types';
import { writePdf } from './write';

export interface PdfService {
  loadMetrics: () => Promise<FontMetrics>;
  buildPdf: (
    items: LayoutItem[],
    info: { title: string; author: string; subject: string },
  ) => Promise<Uint8Array>;
}

export function createPdfService(file: string): PdfService {
  let blankForm: ArrayBuffer | undefined;
  let metrics: FontMetrics | undefined;

  return {
    async loadMetrics() {
      if (metrics != null) return metrics;
      const scratch = await PDFDocument.create();
      const font = await scratch.embedFont(StandardFonts.Helvetica);
      metrics = {
        width: (text, size) => font.widthOfTextAtSize(text, size),
        canEncode(text) {
          try {
            font.encodeText(text);
            return true;
          } catch {
            return false;
          }
        },
      };
      return metrics;
    },
    async buildPdf(items, info) {
      if (blankForm == null) {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`the blank form didn't load (error ${response.status})`);
        blankForm = await response.arrayBuffer();
      }
      return writePdf(blankForm.slice(0), items, info);
    },
  };
}
