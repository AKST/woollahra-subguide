/**
 * Builds the completed PDF: Council's blank form with the answers drawn onto the pages.
 *
 * The form's own fill-in fields are removed first, so every PDF viewer shows exactly
 * what is drawn and nothing can be typed over it later. Links on the form are kept.
 */
import { LineCapStyle, PDFDict, PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib';
import { FORM } from '@common/form/form_map';
import { BASELINE, LINE_HEIGHT, TICK_PATH } from '@common/form/drawing';

import type { LayoutItem } from '@common/form/types';

const [, PAGE_HEIGHT] = FORM.pageSize;
const INK = rgb(0x10 / 255, 0x18 / 255, 0x3a / 255);

function removeFormFields(doc: PDFDocument) {
  const widget = PDFName.of('Widget');
  for (const page of doc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (let i = annots.size() - 1; i >= 0; i--) {
      let annot;
      try {
        annot = annots.lookupMaybe(i, PDFDict);
      } catch {
        annot = undefined; // dangling reference
      }
      if (!annot || annot.get(PDFName.of('Subtype')) === widget) annots.remove(i);
    }
  }
  doc.catalog.delete(PDFName.of('AcroForm'));
}

/**
 * @param items from layoutAnswers() (top-left origin, points)
 * @param info  { title, author, subject } for the document properties
 * @returns Uint8Array of the finished PDF
 */
export async function writePdf(
  blankForm: ArrayBuffer,
  items: LayoutItem[],
  info: { title: string; author: string; subject: string },
) {
  const doc = await PDFDocument.load(blankForm);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  removeFormFields(doc);

  // PDF y runs up from the bottom of the page; layout y runs down from the top.
  const flipY = (y: number) => PAGE_HEIGHT - y;

  for (const item of items) {
    const page = pages[item.page];

    if (item.kind === 'text') {
      item.lines.forEach((line, i) => {
        const baseline = item.y + i * LINE_HEIGHT * item.size + BASELINE * item.size;
        page.drawText(line, { x: item.x, y: flipY(baseline), size: item.size, font, color: INK });
      });
    } else if (item.kind === 'tick') {
      const thickness = 0.16 * Math.min(item.w, item.h);
      const [a, b, c] = TICK_PATH.map(([u, v]) => ({
        x: item.x + u * item.w,
        y: flipY(item.y + v * item.h),
      }));
      page.drawLine({ start: a, end: b, thickness, color: INK, lineCap: LineCapStyle.Round });
      page.drawLine({ start: b, end: c, thickness, color: INK, lineCap: LineCapStyle.Round });
      page.drawCircle({ x: b.x, y: b.y, size: thickness / 2, color: INK }); // rounds the joint
    } else if (item.kind === 'image') {
      const image = await doc.embedPng(item.url);
      page.drawImage(image, {
        x: item.x,
        y: flipY(item.y + item.h),
        width: item.w,
        height: item.h,
      });
    }
  }

  if (info.title) doc.setTitle(info.title);
  if (info.author) doc.setAuthor(info.author);
  if (info.subject) doc.setSubject(info.subject);
  doc.setCreator('Speak Woollahra on Rezoning');
  doc.setProducer('pdf-lib');
  return doc.save();
}
