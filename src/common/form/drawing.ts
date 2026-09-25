/** Line height as a multiple of font size. */
export const LINE_HEIGHT = 1.2;
/**
 * Distance from the top of a line to its baseline, as a multiple of font size.
 * With Helvetica/Arimo metrics (ascent 0.905, descent 0.212) and a 1.2 line height:
 * (1.2 - 0.905 - 0.212) / 2 + 0.905 = 0.9465.
 */
export const BASELINE = 0.9465;
/** Tick mark drawn inside a unit square, as [x, y] points with y downwards. */
export const TICK_PATH = [
  [0.18, 0.55],
  [0.42, 0.8],
  [0.86, 0.18],
];
