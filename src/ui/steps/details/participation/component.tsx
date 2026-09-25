import { Choice, ChoiceGroup } from '@ui/common/form/choice/component';
import type { AnswerStepProps } from '@ui/steps/types';
import type { DetailsAnswers } from '@ui/steps/details/presenter';
import styles from '@ui/common/form/styles.module.css';
import detailsStyles from './styles.module.css';

export function ParticipationFields({
  answers,
  messages,
  onAnswerChange,
}: Omit<AnswerStepProps<DetailsAnswers>, 'active'>) {
  return (
    <>
      <div
        className={styles.field}
        data-field="stance"
      >
        <span
          className={styles['label']}
          id="stanceLabel"
        >
          Are you speaking in support or in objection?
        </span>
        <ChoiceGroup labelId="stanceLabel">
          <Choice
            name="stance"
            invalid={Boolean(messages.stance)}
            value="support"
            checked={answers.stance === 'support'}
            onChange={() => onAnswerChange('stance', 'support')}
            disabled={true}
          >
            In support
          </Choice>
          <Choice
            name="stance"
            invalid={Boolean(messages.stance)}
            value="objection"
            checked={answers.stance === 'objection'}
            onChange={() => onAnswerChange('stance', 'objection')}
            disabled={true}
          >
            In objection
          </Choice>
        </ChoiceGroup>
        <div
          id="stanceMessage"
          className={styles['field-message']}
        >
          {messages.stance}
        </div>
        <p className={detailsStyles.explanation}>
          Note, <b>"In objection"</b> here means objecting to the council's plan, in favour of the
          state's plan.
        </p>
      </div>

      <div
        className={styles.field}
        data-field="mode"
      >
        <span
          className={styles.label}
          id="modeLabel"
        >
          How will you speak?
        </span>
        <div id="attendanceOptions">
          <ChoiceGroup labelId="modeLabel">
            <Choice
              name="mode"
              invalid={Boolean(messages.mode)}
              value="person"
              checked={answers.mode === 'person'}
              onChange={() => onAnswerChange('mode', 'person')}
              disabled={false}
            >
              In person
            </Choice>
            <Choice
              name="mode"
              invalid={Boolean(messages.mode)}
              value="zoom"
              checked={answers.mode === 'zoom'}
              onChange={() => onAnswerChange('mode', 'zoom')}
              disabled={false}
            >
              Via Zoom
            </Choice>
          </ChoiceGroup>
        </div>
        <div
          id="modeMessage"
          className={styles['field-message']}
        >
          {messages.mode}
        </div>
      </div>
    </>
  );
}
