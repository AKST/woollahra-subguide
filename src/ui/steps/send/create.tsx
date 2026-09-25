import { STEP } from '@common/form/steps';
import { memo, useEffect } from 'react';
import { useObservable } from '@common/observable';
import type { Issue } from '@common/form/types';
import { Step } from '@ui/common/step/component';
import type { SendStore, SendPresenter } from './presenter';
import { Send } from './component';
import { createDownload } from './download/create';
import { createEmail } from './email/create';
import { createIssues } from './issues/create';
import { SendIntro } from './intro/component';

export function createSend({
  store,
  presenter,
  onFix,
  aboutHref,
}: {
  store: SendStore;
  presenter: SendPresenter;
  onFix: (issue: Issue) => void;
  aboutHref: string;
}) {
  const Download = createDownload({ store, presenter });
  const Email = createEmail({ store, presenter });
  const Issues = createIssues({ store, onFix });

  const Content = memo(function SendContent() {
    const state = useObservable(store);
    useEffect(() => {
      presenter.attach(store);
      return () => presenter.dispose(store);
    }, []);
    return (
      <Send
        aboutHref={aboutHref}
        Download={Download}
        Email={Email}
        Issues={Issues}
        deadline={state.deadline}
        mode={state.data?.answers.mode ?? ''}
      />
    );
  });

  return memo(function BoundSend({ active }: { active: boolean }) {
    const state = useObservable(store);
    return (
      <Step
        number={STEP.send}
        active={active}
        title="Download the PDF"
        intro={active && state.data?.issues.length ? <SendIntro /> : undefined}
      >
        {active && state.data != null && <Content />}
      </Step>
    );
  });
}
