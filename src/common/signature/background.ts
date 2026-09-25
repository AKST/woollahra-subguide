export interface ImagePixels {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

// The most common opaque border colour is usually the paper, not the ink.
export function backgroundColour({ width, height, data }: ImagePixels): string {
  const colours = new Map<string, { count: number; rgb: number[] }>();
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    if (data[i + 3] < 240) return;
    const rgb = [data[i], data[i + 1], data[i + 2]];
    const key = rgb.map(value => Math.round(value / 16)).join(',');
    const entry = colours.get(key);
    if (entry) entry.count++;
    else colours.set(key, { count: 1, rgb });
  };
  for (let x = 0; x < width; x++) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    sample(0, y);
    sample(width - 1, y);
  }
  const best = [...colours.values()].sort((a, b) => b.count - a.count)[0];
  return (
    '#' + (best?.rgb ?? [255, 255, 255]).map(value => value.toString(16).padStart(2, '0')).join('')
  );
}

export function removeBackground(
  source: ImagePixels,
  colour: string,
  tolerance: number,
): ImagePixels {
  const rgb = [1, 3, 5].map(index => parseInt(colour.slice(index, index + 2), 16));
  const data = new Uint8ClampedArray(source.data);
  const threshold = Math.max(0, Math.min(160, tolerance));
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.max(
      Math.abs(data[i] - rgb[0]),
      Math.abs(data[i + 1] - rgb[1]),
      Math.abs(data[i + 2] - rgb[2]),
    );
    // A short feather avoids a hard white fringe around scanned ink.
    const opacity = Math.max(0, Math.min(1, (distance - threshold) / 24));
    data[i + 3] = Math.round(data[i + 3] * opacity);
  }
  return { width: source.width, height: source.height, data };
}
