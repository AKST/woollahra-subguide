import type { ComponentType } from 'react';
import { STEP } from '@common/form/steps';

type StepComponent = ComponentType<{ active: boolean }>;

export function Steps({
  step,
  About,
  Pagination,
  onNext,
  Details,
  Declaration,
  Editor,
  Send,
}: {
  step: number;
  About: StepComponent;
  Pagination: ComponentType;
  onNext: () => void;
  Details: StepComponent;
  Declaration: StepComponent;
  Editor: StepComponent;
  Send: StepComponent;
}) {
  return (
    <>
      <About active={step === STEP.about} />
      <form
        hidden={step === STEP.about}
        id="wizard"
        noValidate
        autoComplete="on"
        onSubmit={event => {
          event.preventDefault();
          onNext();
        }}
      >
        <div>
          <Details active={step === STEP.details} />
          <Declaration active={step === STEP.declaration} />
          <Editor active={step === STEP.editor} />
          <Send active={step === STEP.send} />
        </div>
        <Pagination />
      </form>
    </>
  );
}
