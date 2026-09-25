import type { SignatureImage } from '@common/form/types';
import styles from './styles.module.css';

export function SignatureBackground({
  original,
  preview,
  colour,
  tolerance,
  loading,
  error,
  onColour,
  onTolerance,
  onApply,
  onKeep,
}: {
  original: SignatureImage;
  preview: SignatureImage | undefined;
  colour: string;
  tolerance: number;
  loading: boolean;
  error: string;
  onColour: (colour: string) => void;
  onTolerance: (tolerance: number) => void;
  onApply: () => void;
  onKeep: () => void;
}) {
  return (
    <section
      className={styles.root}
      aria-labelledby="backgroundTitle"
      aria-busy={loading}
    >
      <h4 id="backgroundTitle">Remove the background</h4>
      <p>
        Check the preview, then adjust the colour and amount if needed. The squares show transparent
        areas.
      </p>
      <div className={styles.previews}>
        <figure>
          <figcaption>Original</figcaption>
          <div className={styles.image}>
            <img
              src={original.url}
              alt="Original signature"
            />
          </div>
        </figure>
        <figure>
          <figcaption>Preview</figcaption>
          <div className={styles.image}>
            <img
              src={(preview ?? original).url}
              alt="Signature with background removed"
            />
          </div>
        </figure>
      </div>
      <label className={styles.colour}>
        Background colour
        <input
          type="color"
          value={colour}
          disabled={loading}
          onChange={event => onColour(event.currentTarget.value)}
        />
      </label>
      <label>
        Removal amount
        <input
          type="range"
          min="0"
          max="160"
          step="1"
          value={tolerance}
          disabled={loading}
          onChange={event => onTolerance(Number(event.currentTarget.value))}
        />
      </label>
      {loading && <p role="status">Preparing preview…</p>}
      {error && <p role="alert">{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          disabled={loading || !preview}
          onClick={onApply}
        >
          Use cleaned signature
        </button>
        <button
          type="button"
          onClick={onKeep}
        >
          Keep original
        </button>
      </div>
    </section>
  );
}
