import { memo } from 'react';
import { Header } from './component';
import { STEP } from '@common/form/steps';
import type { StepsController } from '@ui/steps/controller';
import { useStepsState } from '@ui/steps/use_steps_state';
import { useObservable } from '@common/observable';
import type { SkeletonStore } from '../presenter';

export function createHeader({
  steps,
  appearance,
  onToggleTheme,
}: {
  steps: StepsController;
  appearance: SkeletonStore;
  onToggleTheme: () => void;
}) {
  const onSend = () => {
    void steps.goTo(STEP.send);
  };
  return memo(function BoundHeader() {
    const state = useStepsState(steps);
    const theme = useObservable(appearance);
    return (
      <Header
        downloadHref={steps.stepHref(STEP.send)}
        onSend={onSend}
        sendEnabled={!state.outsideScope}
        accentTheme={theme.accentTheme}
        onToggleTheme={onToggleTheme}
      />
    );
  });
}
