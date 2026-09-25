import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { AnswerChange } from '@ui/steps/types';
import type { RepresentingAnswers, RepresentingStore, RepresentingPresenter } from './presenter';
import { RepresentingFields } from './component';

export function createRepresentingFields({
  store,
  presenter,
}: {
  store: RepresentingStore;
  presenter: RepresentingPresenter;
}) {
  const onAnswerChange: AnswerChange<RepresentingAnswers> = (key, value) =>
    presenter.change(store, key, value);

  return memo(function BoundRepresentingFields() {
    const state = useObservable(store);
    return (
      <RepresentingFields
        answers={state.answers}
        messages={state.messages}
        onAnswerChange={onAnswerChange}
      />
    );
  });
}
