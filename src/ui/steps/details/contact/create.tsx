import { createAddressFields } from './address/create';
import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { AnswerChange } from '@ui/steps/types';
import type { DetailsAnswers, DetailsStore, DetailsPresenter } from '../presenter';
import { ContactFields } from './component';

export function createContactFields({
  store,
  presenter,
}: {
  store: DetailsStore;
  presenter: DetailsPresenter;
}) {
  const Address = createAddressFields({ store, presenter });
  const onAnswerChange: AnswerChange<DetailsAnswers> = (key, value) =>
    presenter.change(store, key, value);
  return memo(function BoundContactFields() {
    const state = useObservable(store);
    return (
      <ContactFields
        Address={Address}
        answers={state.answers}
        messages={state.messages}
        onAnswerChange={onAnswerChange}
      />
    );
  });
}
