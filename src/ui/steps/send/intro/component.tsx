import { MissingFieldsWarning } from '../warning/component';
import styles from './styles.module.css';

export function SendIntro() {
  return (
    <span className={styles.copy}>
      <MissingFieldsWarning />
    </span>
  );
}
