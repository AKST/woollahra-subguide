/**
 * Works out where every answer goes on the form. The on-screen preview and the
 * PDF writer both draw from the same list of items, so what people see is what they get.
 *
 * Items use points with the origin at the TOP-LEFT of the page (y grows downwards), which
 * matches the screen. The PDF writer converts to PDF's bottom-left origin when drawing.
 */
import { clamp } from '@common/util';
import { formatShortDate } from '@common/format';
import type { FontMetrics, Answers, SignatureImage, Adjustments, LayoutItem, Box } from './types';
import { LINE_HEIGHT, BASELINE } from './drawing';
import { FORM } from './form_map';
import { formatAddress } from './address';

const [PAGE_WIDTH, PAGE_HEIGHT] = FORM.pageSize;

const MAX_TEXT_SIZE = 11;
const MIN_SINGLE_LINE_SIZE = 8; // below this, wrap onto more lines instead
const MIN_TEXT_SIZE = 6;
const PADDING_X = 4; // points of space inside the left and right of each box

/** Helvetica in a PDF only covers Windows-1252, so swap anything else for a close equivalent. */
function pdfSafe(value: string | undefined, metrics: FontMetrics) {
  const text = String(value ?? '')
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  let out = '';
  for (const ch of text) {
    const candidates = [ch, ch.normalize('NFKD').replace(/[̀-ͯ]/g, '')];
    const ok = candidates.find(c => {
      if (!c) return false;
      return metrics.canEncode(c);
    });
    out += ok ?? '?';
  }
  return out;
}

function wrap(text: string, size: number, width: number, metrics: FontMetrics) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || metrics.width(candidate, size) <= width) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size that fits: one line from 11pt down to 8pt, then wrapped lines down to 6pt. */
function fitText(text: string, box: Box, multiline: boolean, metrics: FontMetrics) {
  const width = box.w - PADDING_X * 2;
  const height = box.h - 3;
  if (!multiline) {
    for (let size = MAX_TEXT_SIZE; size >= MIN_SINGLE_LINE_SIZE; size -= 0.5) {
      if (metrics.width(text, size) <= width) return { size, wrap: false };
    }
  }
  for (let size = multiline ? MAX_TEXT_SIZE : 9; size >= MIN_TEXT_SIZE; size -= 0.5) {
    const lines = wrap(text, size, width, metrics);
    if (
      lines.length * LINE_HEIGHT * size <= height &&
      lines.every(l => metrics.width(l, size) <= width)
    ) {
      return { size, wrap: true };
    }
  }
  return { size: MIN_TEXT_SIZE, wrap: true };
}

/** PDF rect [x0, y0, x1, y1] (bottom-left origin) → { x, y, w, h } (top-left origin). */
function toBox([x0, y0, x1, y1]: [number, number, number, number]) {
  return { x: x0, y: PAGE_HEIGHT - y1, w: x1 - x0, h: y1 - y0 };
}

const outside = (x: number, y: number, w: number, h: number, box: Box, slack = 0.5) =>
  x < box.x - slack ||
  x + w > box.x + box.w + slack ||
  y < box.y - slack ||
  y + h > box.y + box.h + slack;

/* ---------- what goes where ---------- */

function textValues(a: Answers): Record<string, string> {
  return {
    meetingDate: formatShortDate(a.meetingDate),
    reportTitle: a.reportTitle,
    honorific: a.honorific,
    fullName: a.fullName,
    company: a.company,
    address: formatAddress(a),
    phone: a.phone,
    email: a.email,
    repDetails: a.rep === 'yes' ? a.repDetails : '',
    declName: [a.honorific, a.fullName].filter(Boolean).join(' '),
    signDate: formatShortDate(a.signDate),
  };
}

function tickedBoxes(a: Answers) {
  const ticks = [];
  if (a.stance) ticks.push(a.stance); // 'support' | 'objection'
  if (a.mode) ticks.push(a.mode); // 'person' | 'zoom'
  if (a.rep === 'yes') ticks.push('repYes');
  if (a.rep === 'no') ticks.push('repNo');
  if (a.accept) ticks.push(...FORM.declarationTicks);
  return ticks;
}

/**
 * @param answers     the trimmed form answers
 * @param signature   the rendered signature, or undefined
 * @param adjustments per-item nudges from the editor: { [id]: { dx, dy, scale } }
 * @returns items: { id, kind: 'text'|'tick'|'image', page, label, x, y, w, h, target, overflow, ... }
 */
export function layoutAnswers(
  answers: Answers,
  signature: SignatureImage | undefined,
  adjustments: Adjustments,
  metrics: FontMetrics,
): LayoutItem[] {
  const items: LayoutItem[] = [];
  const values = textValues(answers);

  for (const [id, spec] of Object.entries(FORM.text)) {
    const text = pdfSafe(values[id], metrics);
    if (!text) continue;
    const box = toBox(spec.rect);
    const adj = adjustments[id] ?? { dx: 0, dy: 0, scale: 1 };
    const fit = fitText(text, box, spec.multiline, metrics);
    const size = clamp(Math.round(fit.size * (adj.scale ?? 1) * 2) / 2, 5, 24);
    const lines = fit.wrap ? wrap(text, size, box.w - PADDING_X * 2, metrics) : [text];
    const w = Math.max(...lines.map(l => metrics.width(l, size)));
    const h = lines.length * LINE_HEIGHT * size;
    const top = spec.multiline ? box.y + 2 : box.y + (box.h - h) / 2;
    const x = clamp(box.x + PADDING_X + (adj.dx ?? 0), 0, PAGE_WIDTH - w);
    const y = clamp(top + (adj.dy ?? 0), 0, PAGE_HEIGHT - h);
    // Check the glyphs themselves (not the line box) against the field box.
    const inkTop = y + (BASELINE - 0.905) * size;
    const inkHeight = (lines.length - 1) * LINE_HEIGHT * size + (0.905 + 0.212) * size;
    items.push({
      id,
      kind: 'text',
      page: spec.page,
      label: spec.label,
      x,
      y,
      w,
      h,
      size,
      lines,
      target: box,
      overflow: outside(x, inkTop, w, inkHeight, box),
    });
  }

  for (const id of tickedBoxes(answers)) {
    const spec = FORM.ticks[id];
    const box = toBox(spec.rect);
    const adj = adjustments[id] ?? { dx: 0, dy: 0, scale: 1 };
    items.push({
      id,
      kind: 'tick',
      page: spec.page,
      label: `Tick: ${spec.label}`,
      x: box.x + (adj.dx ?? 0),
      y: box.y + (adj.dy ?? 0),
      w: box.w,
      h: box.h,
      target: box,
      overflow: false,
    });
  }

  if (signature) {
    const spec = FORM.signature;
    const box = toBox(spec.rect);
    const adj = adjustments.signature ?? { dx: 0, dy: 0, scale: 1 };
    const aspect = signature.width / signature.height;
    let h = box.h - 4;
    let w = h * aspect;
    if (w > box.w - PADDING_X * 2) {
      w = box.w - PADDING_X * 2;
      h = w / aspect;
    }
    const scale = clamp(adj.scale ?? 1, 0.4, 3);
    w *= scale;
    h *= scale;
    const x = clamp(box.x + PADDING_X + (adj.dx ?? 0), 0, PAGE_WIDTH - w);
    const y = clamp(box.y + (box.h - h) / 2 + (adj.dy ?? 0), 0, PAGE_HEIGHT - h);
    items.push({
      id: 'signature',
      kind: 'image',
      page: spec.page,
      label: spec.label,
      x,
      y,
      w,
      h,
      url: signature.url,
      target: box,
      overflow: outside(x, y, w, h, box),
    });
  }

  return items;
}
