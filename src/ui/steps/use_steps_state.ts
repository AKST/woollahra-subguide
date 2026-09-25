import { useSyncExternalStore } from 'react';
import type { StepsController, StepsState } from './controller';

export function useStepsState(steps: StepsController): StepsState {
  useSyncExternalStore(steps.subscribe, steps.getVersion);
  return steps.getState();
}
