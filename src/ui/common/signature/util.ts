import type { Stroke, TypedFont } from './types';

const INK = '#10183A';
const STROKE_WIDTH = 2.4; // CSS pixels on the pad
const EXPORT_SCALE = 4; // export resolution multiplier, so the signature stays sharp in the PDF

/** Handwriting styles offered for typed signatures. Keys match the style buttons in component.tsx. */
const TYPED_FONTS = {
  caveat: (px: number) => `500 ${px}px "Caveat"`,
  apple: (px: number) => `400 ${px}px "Homemade Apple"`,
  delafield: (px: number) => `400 ${px}px "Mrs Saint Delafield"`,
};

export function paint(context: CanvasRenderingContext2D, list: Stroke[]) {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = INK;
  context.lineWidth = STROKE_WIDTH;
  for (const stroke of list) {
    context.beginPath();
    stroke.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    if (stroke.length === 1) context.lineTo(stroke[0].x + 0.1, stroke[0].y); // a dot
    context.stroke();
  }
}

function cropToInk(source: HTMLCanvasElement, pad: number) {
  const { data, width, height } = source
    .getContext('2d')!
    .getImageData(0, 0, source.width, source.height);
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  if (x1 < 0) return undefined;
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1 + pad * 2;
  out.height = y1 - y0 + 1 + pad * 2;
  out
    .getContext('2d')!
    .drawImage(source, x0 - pad, y0 - pad, out.width, out.height, 0, 0, out.width, out.height);
  return { url: out.toDataURL('image/png'), width: out.width, height: out.height };
}

export async function typedImage(value: string, typedFont: TypedFont) {
  const text = value.trim();
  if (!text) return undefined;
  const px = 44 * EXPORT_SCALE;
  const font = TYPED_FONTS[typedFont](px);
  try {
    await document.fonts.load(font, text);
  } catch {
    // Fall back to whichever font the browser has.
  }
  const c = document.createElement('canvas');
  const cx = c.getContext('2d')!;
  cx.font = font;
  c.width = Math.ceil(cx.measureText(text).width + px * 1.2);
  c.height = Math.ceil(px * 2.2);
  cx.font = font; // resizing the canvas resets its state
  cx.fillStyle = INK;
  cx.fillText(text, px * 0.6, px * 1.45);
  return cropToInk(c, 6);
}

export function drawnImage(strokes: Stroke[]) {
  if (!strokes.length) return undefined;
  const points = strokes.flat();
  const pad = 3;
  const minX = Math.min(...points.map(p => p.x)) - pad;
  const maxX = Math.max(...points.map(p => p.x)) + pad;
  const minY = Math.min(...points.map(p => p.y)) - pad;
  const maxY = Math.max(...points.map(p => p.y)) + pad;
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil((maxX - minX) * EXPORT_SCALE));
  c.height = Math.max(2, Math.ceil((maxY - minY) * EXPORT_SCALE));
  const cx = c.getContext('2d')!;
  cx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, -minX * EXPORT_SCALE, -minY * EXPORT_SCALE);
  paint(cx, strokes);
  return { url: c.toDataURL('image/png'), width: c.width, height: c.height };
}
