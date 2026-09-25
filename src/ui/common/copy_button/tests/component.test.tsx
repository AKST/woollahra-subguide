import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CopyButton } from '../component';

afterEach(cleanup);

describe('copy button', () => {
  it('copies the supplied text and shows confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(
      <CopyButton
        id="address"
        text="records@example.com"
        label="Copy address"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy address' }));
    await screen.findByRole('button', { name: 'Copied' });
    expect(writeText).toHaveBeenCalledWith('records@example.com');
  });

  it('selects text for manual copying when clipboard access is denied', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) },
    });
    render(
      <CopyButton
        id="subject"
        text="Public Forum Registration"
        label="Copy subject"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy subject' }));
    await waitFor(() =>
      expect(window.getSelection()?.toString()).toBe('Public Forum Registration'),
    );
    expect(screen.getByRole('button', { name: 'Copy subject' })).toBeTruthy();
  });
});
