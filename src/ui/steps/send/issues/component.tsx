import type { Issue } from '@common/form/types';
import { Button } from '@ui/common/button/component';
import styles from './styles.module.css';

export function Issues({ issues, onFix }: { issues: Issue[]; onFix: (issue: Issue) => void }) {
  return (
    <div
      className={styles.issues}
      id="issues"
      role="region"
      aria-labelledby="issuesTitle"
      hidden={!issues.length}
    >
      <p
        className={styles['issues-title']}
        id="issuesTitle"
      >
        {issues.length === 1
          ? '1 answer the form requires is missing or needs checking'
          : `${issues.length} answers the form requires are missing or need checking`}
      </p>
      <p className={styles.note}>Council's form requires these for your application.</p>
      <ul id="issuesList">
        {issues.map(issue => (
          <li key={issue.key}>
            <div>
              <strong>{issue.label}</strong>
              <span>{issue.message}</span>
            </div>
            <Button
              id={undefined}
              type="button"
              variant="small"
              disabled={false}
              busy={false}
              onClick={() => onFix(issue)}
            >
              Fix
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
