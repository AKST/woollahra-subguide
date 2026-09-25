import { memo } from 'react';
import type { ComponentType } from 'react';
import { useObservable } from '@common/observable';
import type { DetailsStore, DetailsPresenter } from './presenter';
import { DetailsStep } from './component';
import { createAgenda } from './agenda/create';
import { createContactFields } from './contact/create';
import { createParticipationFields } from './participation/create';
import { createIntroduction } from './introduction/create';

export function createDetailsStep({
  store,
  presenter,
  Representing,
  DetailsLabel,
  onSend,
  downloadHref,
}: {
  store: DetailsStore;
  presenter: DetailsPresenter;
  Representing: ComponentType;
  DetailsLabel: ComponentType;
  onSend: () => void;
  downloadHref: string;
}) {
  const Introduction = createIntroduction({ store, onSend, downloadHref });
  const Agenda = createAgenda({ store, presenter });
  const Contact = createContactFields({ store, presenter });
  const Participation = createParticipationFields({ store, presenter });
  return memo(function BoundDetailsStep({ active }: { active: boolean }) {
    const state = useObservable(store);
    return (
      <DetailsStep
        active={active}
        outsideScope={state.outsideScope}
        Introduction={Introduction}
        Agenda={Agenda}
        Participation={Participation}
        Contact={Contact}
        Representing={Representing}
        DetailsLabel={DetailsLabel}
      />
    );
  });
}
