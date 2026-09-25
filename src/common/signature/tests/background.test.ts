import { describe, expect, it } from 'vitest';
import { backgroundColour, removeBackground } from '../background';

describe('signature background removal', () => {
  it('removes paper, preserves dark and blue ink and does not mutate the original', () => {
    const data = new Uint8ClampedArray([
      255, 255, 255, 255, 5, 5, 5, 255, 0, 30, 160, 255, 240, 240, 240, 255, 255, 255, 255, 0,
    ]);
    const original = new Uint8ClampedArray(data);
    const result = removeBackground({ width: 5, height: 1, data }, '#ffffff', 35);
    expect([3, 7, 11, 15, 19].map(index => result.data[index])).toEqual([0, 255, 255, 0, 0]);
    expect(data).toEqual(original);
  });

  it('detects coloured paper from the border without confusing central ink for paper', () => {
    const paper = [245, 235, 210, 255];
    const pixels = {
      width: 3,
      height: 3,
      data: new Uint8ClampedArray(
        Array.from({ length: 9 }, (_, index) => (index === 4 ? [0, 0, 0, 255] : paper)).flat(),
      ),
    };
    expect(backgroundColour(pixels)).toBe('#f5ebd2');
    const result = removeBackground(pixels, backgroundColour(pixels), 10);
    expect(result.data[3]).toBe(0);
    expect(result.data[19]).toBe(255);
  });

  it('keeps existing transparency and feathers near-background pixels', () => {
    const pixels = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([0, 0, 0, 70, 213, 213, 213, 255]),
    };
    const result = removeBackground(pixels, '#ffffff', 30);
    expect(result.data[3]).toBe(70);
    expect(result.data[7]).toBe(128);
  });
});
