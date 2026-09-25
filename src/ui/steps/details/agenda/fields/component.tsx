import { Row } from '@ui/common/layout/component';
import { TextInput } from '@ui/common/form/text_input/component';
import type { AnswerStepProps } from '@ui/steps/types';
import type { DetailsAnswers } from '@ui/steps/details/presenter';
import styles from '@ui/common/form/styles.module.css';

export function AgendaFields({
  answers,
  messages,
  onAnswerChange,
}: Omit<AnswerStepProps<DetailsAnswers>, 'active'>) {
  return (
    <>
      <div
        className={styles.field}
        data-field="reportTitle"
      >
        <label htmlFor="reportTitle">Report title</label>
        <span
          className={styles['hint']}
          id="reportTitleHint"
        >
          Copy it from the agenda, e.g. "DA 412/2025 – 2-4 Cross Street Double Bay"
        </span>
        <TextInput
          type="text"
          id="reportTitle"
          value={answers.reportTitle}
          onChange={value => onAnswerChange('reportTitle', value)}
          invalid={Boolean(messages.reportTitle)}
          describedBy={
            messages.reportTitle ? 'reportTitleHint reportTitleMessage' : 'reportTitleHint'
          }
          list={undefined}
          placeholder={undefined}
          spellCheck={undefined}
          disabled={false}
          readOnly={false}
        />
        <div
          id="reportTitleMessage"
          className={styles['field-message']}
        >
          {messages.reportTitle}
        </div>
      </div>

      <Row columns="two">
        <div
          className={styles.field}
          data-field="meetingDate"
        >
          <label htmlFor="meetingDate">Date of meeting</label>
          <TextInput
            type="date"
            id="meetingDate"
            value={answers.meetingDate}
            onChange={value => onAnswerChange('meetingDate', value)}
            invalid={Boolean(messages.meetingDate)}
            describedBy={messages.meetingDate ? 'meetingDateMessage' : undefined}
            list={undefined}
            placeholder={undefined}
            spellCheck={undefined}
            disabled={false}
            readOnly={false}
          />
          <div
            id="meetingDateMessage"
            className={styles['field-message']}
          >
            {messages.meetingDate}
          </div>
        </div>
      </Row>
    </>
  );
}
