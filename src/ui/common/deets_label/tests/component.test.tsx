import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { createDeetsLabel } from '../create';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('deets label', () => {
  it('leaves plain text and starts no animation when disabled', () => {
    const matchMedia = vi.fn();
    vi.stubGlobal('matchMedia', matchMedia);
    const Label = createDeetsLabel({ enabled: false });
    const { container } = render(<Label />);
    expect(container.textContent).toBe('Your Deets');
    expect(container.querySelector('sup')).toBeNull();
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('scrambles unresolved letters together and settles from right to left', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const Label = createDeetsLabel({ enabled: true });
    const { container } = render(<Label />);
    const question = container.querySelector('sup')!;
    const text = () => question.parentElement!.firstChild!.textContent;
    expect(text()).toBe('Your Deets');
    expect(question.style.opacity).toBe('1');
    act(() => vi.advanceTimersByTime(2000));
    act(() => vi.advanceTimersByTime(60));
    expect(text()).toBe('Aaaa aaaaaaa');
    expect(Number(question.style.opacity)).toBeGreaterThan(0);
    expect(Number(question.style.opacity)).toBeLessThan(1);
    random.mockReturnValue(0.99);
    act(() => vi.advanceTimersByTime(60));
    expect(text()).toBe('Zzzz zzzzzzs');
    act(() => vi.advanceTimersByTime(60));
    expect(text()).toBe('Zzzz zzzzzzs');
    act(() => vi.advanceTimersByTime(540));
    expect(text()).toBe('Zzzz zetails');
    expect(question.style.opacity).toBe('0');
    act(() => vi.advanceTimersByTime(720));
    expect(text()).toBe('Your Details');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows the final text immediately with reduced motion', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }));
    const Label = createDeetsLabel({ enabled: true });
    const { container } = render(<Label />);
    const question = container.querySelector('sup')!;
    expect(question.parentElement!.firstChild!.textContent).toBe('Your Details');
    expect(question.style.opacity).toBe('0');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('skips the scramble when reduced motion is passed into the factory', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
    const Label = createDeetsLabel({ enabled: true, reducedMotion: true });
    const { container } = render(<Label />);
    const question = container.querySelector('sup')!;
    expect(question.parentElement!.firstChild!.textContent).toBe('Your Details');
    expect(question.style.opacity).toBe('0');
    expect(vi.getTimerCount()).toBe(0);
  });
});
