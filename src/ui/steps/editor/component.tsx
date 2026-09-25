import { STEP } from '@common/form/steps';
import type { ComponentType } from 'react';
import { Step } from '@ui/common/step/component';
import styles from './styles.module.css';

export function Editor({
  active,
  Toolbar,
  Sheets,
}: {
  active: boolean;
  Toolbar: ComponentType;
  Sheets: ComponentType;
}) {
  return (
    <Step
      number={STEP.editor}
      active={active}
      title="Check your answers on the form"
      intro={undefined}
    >
      <div className={styles.root}>
        <Toolbar />
        <Sheets />
      </div>
    </Step>
  );
}

export function Sheets({ pages, zoomed }: { pages: ComponentType[]; zoomed: boolean }) {
  return (
    <div className={styles['sheets-scroll']}>
      <div
        className={`${styles.sheets} ${zoomed ? styles.zoomed : ''}`}
        id="sheets"
      >
        {pages.map((Page, index) => (
          <Page key={index} />
        ))}
      </div>
    </div>
  );
}
