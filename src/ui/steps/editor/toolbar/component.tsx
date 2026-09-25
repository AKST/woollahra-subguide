import type { LayoutItem, Adjustments } from '@common/form/types';
import type { EditorCallbacks } from '../types';
import { RESIZE_STEP } from '../answer/use_answer';
import styles from './styles.module.css';

export function Toolbar({
  selected,
  overflowing,
  adjustments,
  zoomed,
  onResize,
  onReset,
  onZoom,
}: Pick<EditorCallbacks, 'onResize' | 'onReset'> & {
  selected: LayoutItem | undefined;
  overflowing: number;
  adjustments: Adjustments;
  zoomed: boolean;
  onZoom: () => void;
}) {
  const resizable = selected != null && selected.kind !== 'tick';
  let status;

  if (selected != null) {
    status = (
      <div>
        Selected: <strong>{selected.label}</strong>
        {selected.kind === 'text' && selected.overflow && (
          <span className={styles['editor-warning']}>
            This runs outside its box. Drag it or make it smaller.
          </span>
        )}
      </div>
    );
  } else if (overflowing > 0) {
    status = (
      <span className={styles['editor-warning']}>
        {overflowing === 1 ? '1 answer runs' : `${overflowing} answers run`} outside its box
        (outlined in red). Tap it to fix it.
      </span>
    );
  } else {
    status = 'Tap an answer to move or resize it.';
  }

  return (
    <div className={styles['editor-toolbar']}>
      <div
        className={styles['editor-status']}
        id="editorStatus"
        aria-live="polite"
      >
        {status}
      </div>
      <div className={styles['editor-tools']}>
        {selected?.kind === 'image' && (
          <label className={styles.signatureSize}>
            Signature size
            <input
              type="range"
              min="40"
              max="300"
              step="5"
              value={Math.round((adjustments[selected.id]?.scale ?? 1) * 100)}
              onChange={event =>
                onResize(
                  selected.id,
                  Number(event.target.value) / 100 / (adjustments[selected.id]?.scale ?? 1),
                )
              }
            />
          </label>
        )}
        <button
          type="button"
          id="toolSmaller"
          aria-label="Make smaller"
          disabled={!resizable}
          onClick={() => selected && onResize(selected.id, 1 / RESIZE_STEP)}
        >
          {selected?.kind === 'image' ? 'Smaller' : 'A−'}
        </button>
        <button
          type="button"
          id="toolLarger"
          aria-label="Make larger"
          disabled={!resizable}
          onClick={() => selected && onResize(selected.id, RESIZE_STEP)}
        >
          {selected?.kind === 'image' ? 'Larger' : 'A+'}
        </button>
        <button
          type="button"
          id="toolReset"
          disabled={selected == null || adjustments[selected.id] == null}
          onClick={() => selected && onReset(selected.id)}
        >
          Reset
        </button>
        <button
          type="button"
          id="toolResetAll"
          disabled={!Object.keys(adjustments).length}
          onClick={() => onReset(undefined)}
        >
          Reset all
        </button>
        <button
          type="button"
          id="toolZoom"
          aria-pressed={zoomed}
          onClick={() => onZoom()}
        >
          {zoomed ? 'Zoom out' : 'Zoom in'}
        </button>
      </div>
    </div>
  );
}
