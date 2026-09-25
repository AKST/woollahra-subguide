import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { AnswerChange } from '@ui/steps/types';
import type { DetailsAnswers, DetailsStore, DetailsPresenter } from '../presenter';
import { ParticipationFields } from './component';

export function createParticipationFields({
  store,
  presenter,
}: {
  store: DetailsStore;
  presenter: DetailsPresenter;
}) {
  const onAnswerChange: AnswerChange<DetailsAnswers> = (key, value) =>
    presenter.change(store, key, value);
  return memo(function BoundParticipationFields() {
    const state = useObservable(store);
    return (
      <ParticipationFields
        answers={state.answers}
        messages={state.messages}
        onAnswerChange={onAnswerChange}
      />
    );
  });
}
