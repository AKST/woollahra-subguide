import { memo, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useObservable } from '@common/observable';
import { FORM } from '@common/form/form_map';
import { STEP } from '@common/form/steps';
import { stepHash } from '@common/form/routes';
import type { Answers, Issue } from '@common/form/types';
import { StepsStore, StepsPresenter, type StepsDependencies } from './presenter';
import { createStepsController } from './controller';
import { createDeetsLabel } from '@ui/common/deets_label/create';
import { createAbout } from './about/create';
import type { CalendarDates } from './about/calendar/types';
import { createDetailsStep } from './details/create';
import { createRepresentingFields } from './details/representing/create';
import { createDeclarationStep } from './declaration/create';
import { createEditor } from '@ui/steps/editor/create';
import { createSend } from '@ui/steps/send/create';
import { Steps as StepsView } from './component';

export function createSteps({
  answers,
  assistedStance,
  enableEmailInitialCopy,
  enableDeetsAnimation,
  reducedMotion,
  enableWhyThisIsImportant,
  calendar,
  pdf,
  browser,
  exportSignature,
}: Pick<StepsDependencies, 'pdf' | 'browser' | 'exportSignature'> & {
  answers: Answers;
  assistedStance: Answers['stance'];
  enableEmailInitialCopy: boolean;
  enableDeetsAnimation: boolean;
  reducedMotion: boolean;
  enableWhyThisIsImportant: boolean;
  calendar: CalendarDates;
}) {
  const store = new StepsStore(answers, assistedStance, enableEmailInitialCopy);
  const stepHref = (step: number) => stepHash(step, reducedMotion);
  const presenter: StepsPresenter = new StepsPresenter({
    stepHref,
    pdf,
    browser,
    exportSignature,
    email: FORM.email,
    onChange: () => presenter.changed(store),
  });
  const DetailsLabel = createDeetsLabel({ enabled: enableDeetsAnimation, reducedMotion });
  const controller = createStepsController(store, presenter, DetailsLabel);
  const About = createAbout({
    calendar,
    enableWhyThisIsImportant,
    onSignUp: () => {
      void controller.goTo(STEP.details);
    },
  });
  const Representing = createRepresentingFields({
    store: store.representing,
    presenter: presenter.representing,
  });
  const Details = createDetailsStep({
    downloadHref: stepHref(STEP.send),
    store: store.details,
    presenter: presenter.details,
    Representing,
    DetailsLabel,
    onSend: () => {
      void presenter.goTo(store, STEP.send);
    },
  });
  const Declaration = createDeclarationStep({
    store: store.declaration,
    presenter: presenter.declaration,
    details: store.details,
  });
  const Editor = createEditor({
    store: store.editor,
    presenter: presenter.editor,
    pages: FORM.pages,
    pageWidth: FORM.pageSize[0],
  });
  const onFix = (issue: Issue) => {
    void presenter.fixIssue(store, issue);
  };
  const Send = createSend({
    store: store.send,
    presenter: presenter.send,
    onFix,
    aboutHref: stepHref(STEP.about),
  });

  const Steps = memo(function BoundSteps({ Pagination }: { Pagination: ComponentType }) {
    const state = useObservable(store);
    useEffect(() => {
      presenter.attach(store);
      return () => presenter.dispose(store);
    }, []);
    return (
      <StepsView
        step={state.step}
        About={About}
        Pagination={Pagination}
        onNext={controller.next}
        Details={Details}
        Declaration={Declaration}
        Editor={Editor}
        Send={Send}
      />
    );
  });

  return {
    controller,
    Steps,
  };
}
