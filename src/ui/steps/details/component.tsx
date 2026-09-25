import type { ComponentType } from 'react';
import { Step } from '@ui/common/step/component';
import { STEP } from '@common/form/steps';

export function DetailsStep({
  active,
  outsideScope,
  Introduction,
  Agenda,
  Participation,
  Contact,
  Representing,
  DetailsLabel,
}: {
  active: boolean;
  outsideScope: boolean;
  Introduction: ComponentType;
  Agenda: ComponentType;
  Participation: ComponentType;
  Contact: ComponentType;
  Representing: ComponentType;
  DetailsLabel: ComponentType;
}) {
  return (
    <Step
      number={STEP.details}
      active={active}
      title={<DetailsLabel />}
      intro={undefined}
      beforeTitle={<Introduction />}
    >
      <Agenda />
      <Participation />
      {!outsideScope && (
        <>
          <Contact />
          <Representing />
        </>
      )}
    </Step>
  );
}
