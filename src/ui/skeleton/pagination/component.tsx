import { Button } from '@ui/common/button/component';
import styles from './styles.module.css';

export function Pagination({
  canGoBack,
  canGoNext,
  backLabel,
  busy,
  nextLabel,
  error,
  onBack,
}: {
  canGoBack: boolean;
  canGoNext: boolean;
  backLabel: string;
  busy: boolean;
  nextLabel: string;
  error: string | undefined;
  onBack: () => void;
}) {
  return (
    <div>
      <div
        className={styles['step-error']}
        id="stepError"
        role="alert"
      >
        {error}
      </div>
      <div className={styles['step-nav']}>
        {canGoBack && (
          <Button
            id="backButton"
            type="button"
            variant="ghost"
            disabled={busy}
            busy={false}
            onClick={onBack}
          >
            {backLabel}
          </Button>
        )}
        {canGoNext && (
          <Button
            id="nextButton"
            type="submit"
            variant="primary"
            disabled={false}
            busy={busy}
            onClick={undefined}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
