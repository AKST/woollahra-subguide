import { STEP } from '@common/form/steps';
import { Checkbox } from '@ui/common/form/checkbox/component';
import declarationStyles from '@ui/steps/declaration/styles.module.css';
import { TextInput } from '@ui/common/form/text_input/component';
import { Step } from '@ui/common/step/component';
import type { AnswerStepProps } from '../types';
import type { DeclarationAnswers } from './presenter';
import styles from '@ui/common/form/styles.module.css';
import type { ComponentType } from 'react';

export function DeclarationStep({
  active,
  answers,
  messages,
  onAnswerChange,
  Signature,
}: AnswerStepProps<DeclarationAnswers> & {
  Signature: ComponentType;
}) {
  return (
    <Step
      number={STEP.declaration}
      active={active}
      title="Declaration and signature"
      intro={undefined}
    >
      <div className={styles['field']}>
        <span className={styles['label']}>
          By signing, you accept these conditions for your address to Council:
        </span>

        <ol className={declarationStyles['conditions']}>
          <li>I will only refer to the agenda item that I have registered (if accepted).</li>
          <li>I will obey all rulings from the Mayor/Chair.</li>
          <li>I will restrict my address to the allotted time of three (3) minutes.</li>
          <li>
            I will restrict my statements and comments to the subject of debate and topic of my
            address, noting that Woollahra Council does not accept any liability for statements,
            comments or actions taken by individuals during Meetings/Public Forums.
          </li>
          <li>
            I will refrain from the use of indecent language and maintain good orderly conduct and
            behaviour.
          </li>
          <li>
            I will withdraw from the Council Chamber/from Zoom if required to do so by the
            Mayor/Chair.
          </li>
          <li>
            I will not knowingly make any false statement or declaration during my submission to the
            Meeting/Public Forum.
          </li>
          <li>
            I acknowledge that Council and Committee Meetings are live streamed, accessible via a
            link from Council's website, and agree to my image, voice and personal information
            (including name) being recorded and publicly accessible via Council's website.
          </li>
          <li>
            I also acknowledge that the audio recording of the Meeting/Public Forum will be
            available on Council's website in accordance with Council's Code of Meeting Practice.
          </li>
        </ol>
      </div>

      <div
        className={styles.field}
        data-field="accept"
      >
        <Checkbox
          id="accept"
          checked={answers.accept}
          onChange={checked => onAnswerChange('accept', checked)}
          disabled={false}
          invalid={Boolean(messages.accept)}
        >
          I accept all nine conditions. This ticks each box on the form.
        </Checkbox>
        <div
          id="acceptMessage"
          className={styles['field-message']}
        >
          {messages.accept}
        </div>
      </div>

      <div
        className={styles.field}
        data-field="signature"
      >
        <span
          className={styles['label']}
          id="signatureLabel"
        >
          Your signature
        </span>
        <Signature />
        <div
          id="signatureMessage"
          className={styles['field-message']}
        >
          {messages.signature}
        </div>
      </div>

      <div
        className={`${styles.field} ${styles.narrow} `}
        data-field="signDate"
      >
        <label htmlFor="signDate">Date signed</label>
        <TextInput
          type="date"
          id="signDate"
          value={answers.signDate}
          onChange={value => onAnswerChange('signDate', value)}
          invalid={Boolean(messages.signDate)}
          describedBy={messages.signDate ? 'signDateMessage' : undefined}
          list={undefined}
          placeholder={undefined}
          spellCheck={undefined}
          disabled={false}
          readOnly={false}
        />
        <div
          id="signDateMessage"
          className={styles['field-message']}
        >
          {messages.signDate}
        </div>
      </div>
    </Step>
  );
}
