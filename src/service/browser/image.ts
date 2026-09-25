import type { ImagePixels } from '@common/signature/background';
import type { SignatureImage } from '@common/form/types';

export async function readPixels(source: SignatureImage): Promise<ImagePixels> {
  const image = new Image();
  image.src = source.url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image editing is unavailable');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  return { width: pixels.width, height: pixels.height, data: pixels.data };
}

export function writePixels(pixels: ImagePixels): SignatureImage {
  const canvas = document.createElement('canvas');
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image editing is unavailable');
  const image = context.createImageData(pixels.width, pixels.height);
  image.data.set(pixels.data);
  context.putImageData(image, 0, 0);
  return { url: canvas.toDataURL('image/png'), width: pixels.width, height: pixels.height };
}

// Decode locally and normalise to PNG for PDF embedding, preserving aspect ratio.
export async function readImage(
  file: Blob,
): Promise<{ url: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image conversion is unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
