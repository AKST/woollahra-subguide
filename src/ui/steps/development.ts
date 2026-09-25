import type { Answers } from '@common/form/types';
import { STEP } from '@common/form/steps';
import type { SignatureValue } from '@ui/common/signature/types';
import type { StepsStore, StepsPresenter } from './presenter';

export interface FormSnapshot {
  answers: Answers;
  signature: SignatureValue;
}

/** Only supplied in development; the dev menu never receives a store or presenter. */
export interface StepsDevelopmentController {
  assistedStance: Answers['stance'];
  getSnapshot: () => FormSnapshot;
  subscribe: (listener: () => void) => () => void;
  apply: (snapshot: FormSnapshot) => Promise<void>;
}

export function createDevelopmentController(
  store: StepsStore,
  presenter: StepsPresenter,
): StepsDevelopmentController {
  return {
    assistedStance: store.details.assistedStance,
    getSnapshot: () => ({ answers: store.answers, signature: store.declaration.signature }),
    subscribe(listener) {
      const releases = [store.details, store.representing, store.declaration].map(child =>
        child.subscribe(listener),
      );
      return () => releases.forEach(release => release());
    },
    async apply({ answers, signature }) {
      if (store.busy) return;
      const step = store.step;
      if (
        step >= STEP.editor &&
        !(await presenter.goTo(store, STEP.details, { addToHistory: false }))
      )
        return;
      presenter.declaration.cancelUpload(store.declaration);
      for (const key of Object.keys(
        store.details.answers,
      ) as (keyof typeof store.details.answers)[])
        presenter.details.change(store.details, key, answers[key] ?? '');
      presenter.details.resetAgendaExpansion(store.details);
      for (const key of Object.keys(
        store.representing.answers,
      ) as (keyof typeof store.representing.answers)[])
        presenter.representing.change(store.representing, key, answers[key]);
      presenter.declaration.change(store.declaration, 'accept', answers.accept);
      presenter.declaration.change(store.declaration, 'signDate', answers.signDate);
      presenter.declaration.changeSignature(store.declaration, signature);
      store.declaration.uploadError = undefined;
      if (step >= STEP.editor) await presenter.goTo(store, step, { addToHistory: false });
    },
  };
}
