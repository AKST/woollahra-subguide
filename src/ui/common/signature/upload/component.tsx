import type { SignatureImage } from '@common/form/types';
import type { ComponentType } from 'react';
import styles from './styles.module.css';

export function SignatureUpload({
  image,
  loading,
  error,
  invalid,
  onUpload,
  onClear,
  BackgroundEditor,
  editing,
  onEdit,
}: {
  image: SignatureImage | undefined;
  loading: boolean;
  error: string | undefined;
  invalid: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
  BackgroundEditor: ComponentType;
  editing: boolean;
  onEdit: () => void;
}) {
  return (
    <div
      className={styles.root}
      aria-busy={loading}
    >
      <label htmlFor="signatureFile">Choose a signature image</label>
      <input
        id="signatureFile"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-invalid={invalid || Boolean(error)}
        aria-describedby="signatureUploadHint signatureUploadError"
        onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) onUpload(file);
        }}
      />
      <p
        id="signatureUploadHint"
        className={styles.hint}
      >
        PNG, JPEG or WebP, up to 10 MB. Crop close to your signature for the best fit. Your image
        stays in this browser and is included in your PDF.
      </p>
      {image && !editing && (
        <div className={styles.preview}>
          <img
            src={image.url}
            alt="Uploaded signature"
          />
        </div>
      )}
      <BackgroundEditor />
      {image && !editing && (
        <button
          type="button"
          className={styles.clear}
          onClick={onEdit}
        >
          Adjust background
        </button>
      )}
      {loading && <p role="status">Reading image…</p>}
      <p
        id="signatureUploadError"
        className={styles.error}
        role="alert"
      >
        {error}
      </p>
      {(image || loading) && (
        <button
          type="button"
          className={styles.clear}
          onClick={onClear}
        >
          Clear image
        </button>
      )}
    </div>
  );
}
