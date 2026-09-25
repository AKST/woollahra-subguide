import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { Issue } from '@common/form/types';
import type { SendStore } from '../presenter';
import { Issues } from './component';

export function createIssues({
  store,
  onFix,
}: {
  store: SendStore;
  onFix: (issue: Issue) => void;
}) {
  return memo(function BoundIssues() {
    const state = useObservable(store);
    return (
      <Issues
        issues={state.data?.issues ?? []}
        onFix={onFix}
      />
    );
  });
}
