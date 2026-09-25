import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type { Adjustment, LayoutItem } from '@common/form/types';

export const RESIZE_STEP = 1.08;
const NUDGE = 0.5;

export function useAnswer(
  item: LayoutItem,
  adjustment: Adjustment,
  onSelect: (id: string | undefined) => void,
  onMove: (id: string, dx: number, dy: number) => void,
  onResize: (id: string, factor: number) => void,
) {
  const drag = useRef<
    | {
        x: number;
        y: number;
        dx: number;
        dy: number;
        scale: number;
        resizing: boolean;
        width: number;
        size: number;
        currentSize: number;
      }
    | undefined
  >(undefined);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button > 0) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(item.id);
    event.currentTarget.focus({ preventScroll: true });

    const sheet = event.currentTarget.parentElement!;
    const scale = parseFloat(getComputedStyle(sheet).getPropertyValue('--k')) || 1;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      dx: adjustment.dx,
      dy: adjustment.dy,
      scale,
      resizing: (event.target as HTMLElement).closest('[data-resize-handle]') != null,
      width: event.currentTarget.getBoundingClientRect().width,
      size: adjustment.scale,
      currentSize: adjustment.scale,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (start == null) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 3) return;
    if (start.resizing) {
      const size = Math.max(0.4, Math.min(3, start.size * (1 + dx / start.width)));
      onResize(item.id, size / start.currentSize);
      start.currentSize = size;
      return;
    }
    onMove(item.id, start.dx + dx / start.scale, start.dy + dy / start.scale);
  }

  function onPointerUp() {
    drag.current = undefined;
    setDragging(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? NUDGE * 10 : NUDGE;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];

    if (move != null) {
      event.preventDefault();
      onSelect(item.id);
      onMove(item.id, adjustment.dx + move[0], adjustment.dy + move[1]);
    } else if (item.kind !== 'tick' && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      onResize(item.id, RESIZE_STEP);
    } else if (item.kind !== 'tick' && event.key === '-') {
      event.preventDefault();
      onResize(item.id, 1 / RESIZE_STEP);
    } else if (event.key === 'Escape') {
      onSelect(undefined);
    }
  }

  return { dragging, onPointerDown, onPointerMove, onPointerUp, onKeyDown };
}
