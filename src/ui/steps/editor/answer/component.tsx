import { TICK_PATH } from '@common/form/drawing';
import type { Adjustment, LayoutItem } from '@common/form/types';
import type { EditorCallbacks } from '../types';
import { useAnswer } from './use_answer';
import { boxStyle } from '../util';
import styles from './styles.module.css';

export function Answer({
  item,
  selected,
  adjustment,
  onSelect,
  onMove,
  onResize,
}: Pick<EditorCallbacks, 'onMove' | 'onResize'> & {
  item: LayoutItem;
  selected: boolean;
  adjustment: Adjustment;
  onSelect: (id: string | undefined) => void;
}) {
  const { dragging, onPointerDown, onPointerMove, onPointerUp, onKeyDown } = useAnswer(
    item,
    adjustment,
    onSelect,
    onMove,
    onResize,
  );
  const style = boxStyle(item, item.kind === 'text' ? item.size : undefined);
  const warnOverflow = item.kind === 'text' && item.overflow;
  let content;

  if (item.kind === 'text') {
    content = item.lines.join('\n');
  } else if (item.kind === 'tick') {
    content = (
      <svg
        viewBox={`0 0 ${item.w} ${item.h}`}
        aria-hidden="true"
      >
        <polyline
          points={TICK_PATH.map(([x, y]) => `${x * item.w},${y * item.h}`).join(' ')}
          fill="none"
          stroke="#10183A"
          strokeWidth={0.16 * Math.min(item.w, item.h)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    content = (
      <img
        src={item.url}
        alt=""
        draggable={false}
      />
    );
  }

  return (
    <div
      className={[
        styles.answer,
        styles[`answer-${item.kind}`],
        selected && styles.selected,
        warnOverflow && styles.overflow,
        dragging && styles.dragging,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      tabIndex={0}
      role="button"
      aria-label={`${item.label}${warnOverflow ? ', runs outside its box' : ''}. Use the arrow keys to move it.${item.kind === 'image' ? ' Use plus or minus to resize.' : ''}`}
      data-id={item.id}
      data-kind={item.kind}
      data-overflow={item.overflow}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      onKeyDown={onKeyDown}
      onFocus={() => onSelect(item.id)}
    >
      {content}
      {item.kind === 'image' && (
        <span
          className={styles.resizeHandle}
          data-resize-handle
          aria-hidden="true"
        />
      )}
    </div>
  );
}
