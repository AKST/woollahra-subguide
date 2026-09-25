import type { ComponentType } from 'react';
import type { SignatureValue, TypedFont } from './types';
import { useSignature } from './use_signature';
import { TextField } from '../form/component';
import styles from './styles.module.css';

const FONTS: TypedFont[] = ['caveat', 'apple', 'delafield'];
const MODES: SignatureValue['mode'][] = ['upload', 'draw', 'type'];

export function Signature({
  value,
  defaultName,
  invalid,
  onChange,
  Upload,
}: {
  value: SignatureValue;
  defaultName: string;
  invalid: boolean;
  onChange: (value: SignatureValue) => void;
  Upload: ComponentType<{ invalid: boolean }>;
}) {
  const { canvasRef, onPointerDown, onPointerMove, onPointerUp } = useSignature(value, onChange);

  function setMode(mode: SignatureValue['mode']) {
    let typedName = value.typedName;
    if (mode === 'type' && !typedName.trim()) typedName = defaultName.trim();
    onChange({ ...value, mode, typedName });
  }

  return (
    <div className={styles.root}>
      <div
        className={styles['sig-tabs']}
        role="tablist"
        aria-label="Signature method"
        onKeyDown={event => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const direction = event.key === 'ArrowRight' ? 1 : -1;
          const mode = MODES[(MODES.indexOf(value.mode) + direction + MODES.length) % MODES.length];
          setMode(mode);
          event.currentTarget.querySelector<HTMLButtonElement>(`[data-mode="${mode}"]`)?.focus();
        }}
      >
        {MODES.map(mode => {
          const suffix = mode[0].toUpperCase() + mode.slice(1);
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              id={`tab${suffix}`}
              data-mode={mode}
              tabIndex={value.mode === mode ? 0 : -1}
              aria-selected={value.mode === mode}
              aria-controls={`sig${suffix}`}
              onClick={() => setMode(mode)}
            >
              {mode === 'upload' ? 'Upload image' : mode === 'draw' ? 'Draw it' : 'Type it'}
            </button>
          );
        })}
      </div>
      <div
        className={styles['sig-panel']}
        id="sigDraw"
        role="tabpanel"
        aria-labelledby="tabDraw"
        hidden={value.mode !== 'draw'}
      >
        <div
          className={styles['sig-pad']}
          data-invalid={invalid}
          onContextMenu={event => event.preventDefault()}
        >
          <canvas
            ref={canvasRef}
            id="sigCanvas"
            aria-label="Signature pad. Draw your signature with your finger, a stylus or a mouse."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onLostPointerCapture={onPointerUp}
          />
          <span
            className={styles['sig-pad-x']}
            aria-hidden="true"
          >
            ×
          </span>
          <div className={styles['sig-pad-line']} />
          <span className={styles['sig-pad-hint']}>
            Sign above the line with your finger or mouse
          </span>
          <button
            type="button"
            className={styles['sig-pad-clear']}
            id="sigClear"
            onClick={() => onChange({ ...value, strokes: [] })}
          >
            Clear
          </button>
        </div>
      </div>
      <div
        className={styles['sig-panel']}
        id="sigType"
        role="tabpanel"
        aria-labelledby="tabType"
        hidden={value.mode !== 'type'}
      >
        <TextField
          name="sigTyped"
          label="Type your name"
          value={value.typedName}
          type="text"
          placeholder={undefined}
          message={undefined}
          disabled={false}
          readOnly={false}
          onChange={typedName => onChange({ ...value, typedName })}
        />
        <span id="sigStyleLabel">Choose a style</span>
        <div
          className={styles['sig-styles']}
          role="group"
          aria-labelledby="sigStyleLabel"
        >
          {FONTS.map(font => (
            <button
              key={font}
              type="button"
              data-font={font}
              aria-pressed={value.typedFont === font}
              onClick={() => onChange({ ...value, typedFont: font })}
            >
              {value.typedName.trim() || 'Your name'}
            </button>
          ))}
        </div>
      </div>
      <div
        className={styles['sig-panel']}
        id="sigUpload"
        role="tabpanel"
        aria-labelledby="tabUpload"
        hidden={value.mode !== 'upload'}
      >
        <Upload invalid={invalid} />
      </div>
    </div>
  );
}
