import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { DetailsStore } from '../presenter';
import { Introduction } from './component';

export function createIntroduction({
  store,
  onSend,
  downloadHref,
}: {
  store: DetailsStore;
  onSend: () => void;
  downloadHref: string;
}) {
  return memo(function BoundIntroduction() {
    const state = useObservable(store);
    return (
      <Introduction
        downloadHref={downloadHref}
        outsideScope={state.outsideScope}
        onSend={onSend}
      />
    );
  });
}
