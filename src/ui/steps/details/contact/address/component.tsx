import { Row } from '@ui/common/layout/component';
import { TextInput } from '@ui/common/form/text_input/component';
import type { AnswerStepProps } from '@ui/steps/types';
import type { DetailsAnswers } from '../../presenter';
import styles from '@ui/common/form/styles.module.css';

export function AddressFields({
  answers,
  messages,
  onAnswerChange,
}: Omit<AnswerStepProps<DetailsAnswers>, 'active'>) {
  return (
    <div
      className={styles.field}
      data-field="address"
    >
      <label htmlFor="address">Street address</label>
      <TextInput
        type="text"
        id="address"
        placeholder="Unit, street number and street name"
        autoComplete="section-speaker street-address"
        value={answers.address}
        onChange={value => onAnswerChange('address', value)}
        invalid={Boolean(messages.address)}
        describedBy={messages.address ? 'addressMessage' : undefined}
        list={undefined}
        spellCheck={undefined}
        disabled={false}
        readOnly={false}
      />
      <Row columns="two">
        <div className={styles.field}>
          <label htmlFor="suburb">Suburb / town</label>
          <TextInput
            id="suburb"
            type="text"
            autoComplete="section-speaker address-level2"
            value={answers.suburb}
            onChange={value => onAnswerChange('suburb', value)}
            invalid={false}
            describedBy={undefined}
            list={undefined}
            placeholder={undefined}
            spellCheck={false}
            disabled={false}
            readOnly={false}
          />
        </div>
        <Row columns="two">
          <div className={styles.field}>
            <label htmlFor="state">State / territory</label>
            <TextInput
              id="state"
              type="text"
              autoComplete="section-speaker address-level1"
              value={answers.state}
              onChange={value => onAnswerChange('state', value)}
              invalid={false}
              describedBy={undefined}
              list="states"
              placeholder={undefined}
              spellCheck={false}
              disabled={false}
              readOnly={false}
            />
            <datalist id="states">
              {['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].map(state => (
                <option
                  key={state}
                  value={state}
                />
              ))}
            </datalist>
          </div>
          <div className={styles.field}>
            <label htmlFor="postcode">Postcode</label>
            <TextInput
              id="postcode"
              type="text"
              inputMode="numeric"
              autoComplete="section-speaker postal-code"
              value={answers.postcode}
              onChange={value => onAnswerChange('postcode', value)}
              invalid={false}
              describedBy={undefined}
              list={undefined}
              placeholder={undefined}
              spellCheck={false}
              disabled={false}
              readOnly={false}
            />
          </div>
        </Row>
      </Row>
      <div
        id="addressMessage"
        className={styles['field-message']}
      >
        {messages.address}
      </div>
    </div>
  );
}
