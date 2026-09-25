import { memo } from 'react';
import type { StepsController } from '@ui/steps/controller';
import { useStepsState } from '@ui/steps/use_steps_state';
import { Navigation } from './component';

export function createNavigation(steps: StepsController) {
  const onGo = (step: number) => {
    void steps.goTo(step);
  };
  return memo(function BoundNavigation() {
    const state = useStepsState(steps);
    return (
      <Navigation
        items={state.navigation}
        disabled={state.busy}
        onGo={onGo}
      />
    );
  });
}
