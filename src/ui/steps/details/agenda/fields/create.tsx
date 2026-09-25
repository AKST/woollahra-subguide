import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { AnswerChange } from '@ui/steps/types';
import type { DetailsAnswers, DetailsStore, DetailsPresenter } from '../../presenter';
import { AgendaFields } from './component';

export function createAgendaFields({
  store,
  presenter,
}: {
  store: DetailsStore;
  presenter: DetailsPresenter;
}) {
  const onAnswerChange: AnswerChange<DetailsAnswers> = (key, value) =>
    presenter.change(store, key, value);
  return memo(function BoundAgendaFields() {
    const state = useObservable(store);
    return (
      <AgendaFields
        answers={state.answers}
        messages={state.messages}
        onAnswerChange={onAnswerChange}
      />
    );
  });
}
