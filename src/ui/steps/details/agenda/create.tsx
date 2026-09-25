import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { DetailsStore, DetailsPresenter } from '../presenter';
import { createAgendaFields } from './fields/create';
import { Agenda } from './component';

export function createAgenda({
  store,
  presenter,
}: {
  store: DetailsStore;
  presenter: DetailsPresenter;
}) {
  const Fields = createAgendaFields({ store, presenter });
  const onToggleAgenda = () => presenter.toggleAgenda(store);
  return memo(function BoundAgenda() {
    const state = useObservable(store);
    return (
      <Agenda
        answers={state.answers}
        agendaExpanded={state.agendaExpanded}
        onToggleAgenda={onToggleAgenda}
        Fields={Fields}
      />
    );
  });
}
