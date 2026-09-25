import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { SendStore, SendPresenter } from '../presenter';
import { Download } from './component';

export function createDownload({
  store,
  presenter,
}: {
  store: SendStore;
  presenter: SendPresenter;
}) {
  const onShare = () => {
    void presenter.share(store);
  };
  return memo(function BoundDownload() {
    const state = useObservable(store);
    return (
      <Download
        name={state.name}
        url={state.url}
        byteLength={state.data?.pdfBytes.length ?? 0}
        canShare={state.canShare}
        shareError={state.shareError}
        showCompletionNote={state.data?.showCompletionNote ?? false}
        onShare={onShare}
      />
    );
  });
}
