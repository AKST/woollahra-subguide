import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { SendStore, SendPresenter } from '../presenter';
import { Email } from './component';

export function createEmail({ store, presenter }: { store: SendStore; presenter: SendPresenter }) {
  return memo(function BoundEmail() {
    const state = useObservable(store);
    return (
      <Email
        address={presenter.email}
        subject={state.subject}
        body={state.body}
        emailUrl={presenter.emailUrl(state)}
      />
    );
  });
}
