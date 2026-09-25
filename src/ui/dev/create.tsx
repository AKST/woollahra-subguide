import './fonts.css';
import { memo, useEffect } from 'react';
import { useObservable } from '@common/observable';
import { createLocalStorageService } from '@service/storage/service';
import type { StepsController } from '@ui/steps/controller';
import { useStepsState } from '@ui/steps/use_steps_state';
import { DemoPresenter, DemoStore } from './presenter';
import { DemoTools } from './component';
import { useAppearance } from './use_appearance';
import type { FontChoice, ThemeChoice } from './appearance';

export function createDemoTools(steps: StepsController) {
  if (!steps.development) throw new Error('Demo controls are only available in development');
  const store = new DemoStore();
  const demo = new DemoPresenter(createLocalStorageService(), steps.development);
  const onFill = () => {
    if (!steps.getState().busy) void demo.fill(store);
  };
  const onFontChange = (font: FontChoice) => demo.changeFont(store, font);
  const onThemeChange = (theme: ThemeChoice) => demo.changeTheme(store, theme);
  return memo(function BoundDemoTools() {
    const state = useObservable(store);
    const navigation = useStepsState(steps);
    useAppearance(state.font, state.theme);
    useEffect(() => demo.attach(store), []);
    return (
      <DemoTools
        disabled={navigation.busy || state.applying}
        status={state.status}
        onFill={onFill}
        font={state.font}
        theme={state.theme}
        onFontChange={onFontChange}
        onThemeChange={onThemeChange}
      />
    );
  });
}
