import type { ComponentType } from 'react';
import type { DetailsAnswers } from '../presenter';
import { formatShortDate } from '@common/format';
import styles from './styles.module.css';

export function Agenda({
  answers,
  agendaExpanded,
  onToggleAgenda,
  Fields,
}: {
  answers: DetailsAnswers;
  agendaExpanded: boolean;
  onToggleAgenda: () => void;
  Fields: ComponentType;
}) {
  const summary = [
    formatShortDate(answers.meetingDate),
    answers.stance === 'support'
      ? 'In support'
      : answers.stance === 'objection'
        ? 'In objection'
        : '',
    answers.mode === 'person' ? 'In person' : answers.mode === 'zoom' ? 'Via Zoom' : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className={styles.agenda}>
      <button
        type="button"
        id="agendaToggle"
        className={styles.summary}
        aria-expanded={agendaExpanded}
        aria-controls="agendaFields"
        onClick={onToggleAgenda}
      >
        <span className={styles.label}>Agenda item</span>
        <span
          className={styles.indicator}
          aria-hidden="true"
        >
          {agendaExpanded ? '−' : '+'}
        </span>
        {answers.reportTitle && <span className={styles.report}>{answers.reportTitle}</span>}
        {summary && <span className={styles.meta}>{summary}</span>}
      </button>
      <div
        id="agendaFields"
        className={styles.fields}
        hidden={!agendaExpanded}
      >
        <h3>Which agenda item do you want to speak on?</h3>
        <Fields />
      </div>
    </div>
  );
}
