import { Choice, ChoiceGroup } from '@ui/common/form/choice/component';
import { TextArea } from '@ui/common/form/text_input/component';
import sectionStyles from './styles.module.css';
import type { AnswerStepProps } from '@ui/steps/types';
import type { RepresentingAnswers } from './presenter';
import styles from '@ui/common/form/styles.module.css';

export function RepresentingFields({
  answers,
  messages,
  onAnswerChange,
}: Omit<AnswerStepProps<RepresentingAnswers>, 'active'>) {
  return (
    <div className={sectionStyles.root}>
      <h3>Are you speaking for someone else?</h3>
      <div
        className={styles.field}
        data-field="rep"
      >
        <span
          className={styles['label']}
          id="repLabel"
        >
          Are you a legal representative or consultant acting on behalf of others?
        </span>
        <ChoiceGroup labelId="repLabel">
          <Choice
            name="rep"
            invalid={Boolean(messages.rep)}
            value="no"
            checked={answers.rep === 'no'}
            onChange={() => onAnswerChange('rep', 'no')}
            disabled={false}
          >
            No
          </Choice>
          <Choice
            name="rep"
            invalid={Boolean(messages.rep)}
            value="yes"
            checked={answers.rep === 'yes'}
            onChange={() => onAnswerChange('rep', 'yes')}
            disabled={false}
          >
            Yes
          </Choice>
        </ChoiceGroup>
        <div
          id="repMessage"
          className={styles['field-message']}
        >
          {messages.rep}
        </div>
      </div>

      <div
        className={styles.field}
        data-field="repDetails"
        id="repDetailsField"
        hidden={answers.rep !== 'yes'}
      >
        <label htmlFor="repDetails">Who are you addressing the committee on behalf of?</label>
        <TextArea
          id="repDetails"
          rows={3}
          value={answers.repDetails}
          onChange={value => onAnswerChange('repDetails', value)}
          invalid={Boolean(messages.repDetails)}
          describedBy={messages.repDetails ? 'repDetailsMessage' : undefined}
          disabled={false}
          readOnly={false}
        />
        <div
          id="repDetailsMessage"
          className={styles['field-message']}
        >
          {messages.repDetails}
        </div>
      </div>
    </div>
  );
}
