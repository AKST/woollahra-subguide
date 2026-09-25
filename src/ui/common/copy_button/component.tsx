import { Button } from '../button/component';
import { useCopy } from './use_copy';
import styles from './styles.module.css';

export function CopyButton({
  id,
  text,
  label,
  truncate = false,
}: {
  id: string;
  text: string;
  label: string;
  truncate?: boolean;
}) {
  const { sourceRef, copied, onCopy } = useCopy(text);

  return (
    <div className={`${styles.row} ${truncate ? styles.singleLine : ''}`}>
      <code
        ref={sourceRef}
        id={id}
        title={truncate ? text : undefined}
      >
        {text}
      </code>
      <Button
        id={undefined}
        type="button"
        variant="small"
        disabled={false}
        busy={false}
        onClick={() => void onCopy()}
      >
        {copied ? 'Copied' : label}
      </Button>
    </div>
  );
}
