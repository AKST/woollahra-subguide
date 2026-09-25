import { useLayoutEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import type { SignatureValue, Stroke } from './types';
import { paint } from './util';

export function useSignature(value: SignatureValue, onChange: (value: SignatureValue) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentStroke = useRef<Stroke | undefined>(undefined);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;
    const context = canvas.getContext('2d');
    if (context == null) return;

    function redraw() {
      if (canvas == null || context == null) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (!width) return;

      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      paint(context, value.strokes);
    }

    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [value.strokes, value.mode]);

  function pointAt(event: { clientX: number; clientY: number }) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = [pointAt(event)];
    currentStroke.current = stroke;
    onChange({ ...value, strokes: [...value.strokes, stroke] });
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (currentStroke.current == null) return;
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
    const stroke = [...currentStroke.current, ...events.map(pointAt)];
    currentStroke.current = stroke;
    onChange({ ...value, strokes: [...value.strokes.slice(0, -1), stroke] });
  }

  function onPointerUp() {
    currentStroke.current = undefined;
  }

  return { canvasRef, onPointerDown, onPointerMove, onPointerUp };
}
