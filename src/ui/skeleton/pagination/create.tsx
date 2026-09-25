import { memo } from 'react';
import type { StepsController } from '@ui/steps/controller';
import { useStepsState } from '@ui/steps/use_steps_state';
import { Pagination } from './component';

export function createPagination(steps: StepsController) {
  const onBack = () => {
    void steps.back();
  };
  return memo(function BoundPagination() {
    const state = useStepsState(steps);
    if (!state.showPagination) return null;
    return (
      <Pagination
        canGoBack={state.canGoBack}
        canGoNext={state.canGoNext}
        backLabel={state.backLabel}
        busy={state.busy}
        nextLabel={state.nextLabel}
        error={state.error}
        onBack={onBack}
      />
    );
  });
}
