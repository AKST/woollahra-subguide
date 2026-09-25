import type { ComponentType } from 'react';
import { Row } from '@ui/common/layout/component';
import { TextInput } from '@ui/common/form/text_input/component';
import type { AnswerStepProps } from '@ui/steps/types';
import type { DetailsAnswers } from '@ui/steps/details/presenter';
import styles from '@ui/common/form/styles.module.css';

export function ContactFields({
  answers,
  messages,
  onAnswerChange,
  Address,
}: Omit<AnswerStepProps<DetailsAnswers>, 'active'> & { Address: ComponentType }) {
  return (
    <>
      <Row columns="title-name">
        <div className={styles['field']}>
          <label htmlFor="honorific">
            Title <span className={styles['optional']}>optional</span>
          </label>
          <TextInput
            type="text"
            id="honorific"
            autoComplete="section-speaker honorific-prefix"
            list="honorifics"
            value={answers.honorific}
            onChange={value => onAnswerChange('honorific', value)}
            invalid={Boolean(messages.honorific)}
            describedBy={messages.honorific ? 'honorificMessage' : undefined}
            placeholder={undefined}
            spellCheck={undefined}
            disabled={false}
            readOnly={false}
          />
          <datalist id="honorifics">
            <option value="Mr"></option>
            <option value="Ms"></option>
            <option value="Mrs"></option>
            <option value="Miss"></option>
            <option value="Mx"></option>
            <option value="Dr"></option>
          </datalist>
        </div>
        <div
          className={styles.field}
          data-field="fullName"
        >
          <label htmlFor="fullName">Full name</label>
          <TextInput
            type="text"
            id="fullName"
            autoComplete="section-speaker name"
            value={answers.fullName}
            onChange={value => onAnswerChange('fullName', value)}
            invalid={Boolean(messages.fullName)}
            describedBy={messages.fullName ? 'fullNameMessage' : undefined}
            list={undefined}
            placeholder={undefined}
            spellCheck={undefined}
            disabled={false}
            readOnly={false}
          />
          <div
            id="fullNameMessage"
            className={styles['field-message']}
          >
            {messages.fullName}
          </div>
        </div>
      </Row>

      <div className={styles['field']}>
        <label htmlFor="company">
          Company name{' '}
          <span className={styles['optional']}>only if you're speaking for a company</span>
        </label>
        <TextInput
          type="text"
          id="company"
          autoComplete="section-speaker organization"
          value={answers.company}
          onChange={value => onAnswerChange('company', value)}
          invalid={Boolean(messages.company)}
          describedBy={messages.company ? 'companyMessage' : undefined}
          list={undefined}
          placeholder={undefined}
          spellCheck={undefined}
          disabled={false}
          readOnly={false}
        />
      </div>

      <Address />

      <Row columns="two">
        <div
          className={styles.field}
          data-field="phone"
        >
          <label htmlFor="phone">Phone</label>
          <TextInput
            type="tel"
            id="phone"
            autoComplete="section-speaker tel"
            value={answers.phone}
            onChange={value => onAnswerChange('phone', value)}
            invalid={Boolean(messages.phone)}
            describedBy={messages.phone ? 'phoneMessage' : undefined}
            list={undefined}
            placeholder={undefined}
            spellCheck={undefined}
            disabled={false}
            readOnly={false}
          />
          <div
            id="phoneMessage"
            className={styles['field-message']}
          >
            {messages.phone}
          </div>
        </div>
        <div
          className={styles.field}
          data-field="email"
        >
          <label htmlFor="email">Email</label>
          <TextInput
            type="email"
            id="email"
            autoComplete="section-speaker email"
            spellCheck={false}
            value={answers.email}
            onChange={value => onAnswerChange('email', value)}
            invalid={Boolean(messages.email)}
            describedBy={messages.email ? 'emailMessage' : undefined}
            list={undefined}
            placeholder={undefined}
            disabled={false}
            readOnly={false}
          />
          <div
            id="emailMessage"
            className={styles['field-message']}
          >
            {messages.email}
          </div>
        </div>
      </Row>
    </>
  );
}
