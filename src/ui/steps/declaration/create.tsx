import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { AnswerChange } from '../types';
import type { DeclarationAnswers, DeclarationStore, DeclarationPresenter } from './presenter';
import { DeclarationStep } from './component';
import type { DetailsStore } from '../details/presenter';
import type { SignatureValue } from '@ui/common/signature/types';
import { Signature } from '@ui/common/signature/component';
import { SignatureUpload } from '@ui/common/signature/upload/component';
import { SignatureBackground } from '@ui/common/signature/background/component';

export function createDeclarationStep({
  store,
  presenter,
  details,
}: {
  store: DeclarationStore;
  presenter: DeclarationPresenter;
  details: DetailsStore;
}) {
  const onAnswerChange: AnswerChange<DeclarationAnswers> = (key, value) =>
    presenter.change(store, key, value);
  const onSignatureChange = (value: SignatureValue) => presenter.changeSignature(store, value);
  const onUpload = (file: File) => {
    void presenter.upload(store, file);
  };
  const onClearUpload = () => presenter.clearUpload(store);
  const BackgroundEditor = memo(function BackgroundEditor() {
    const state = useObservable(store.background);
    if (!state.open || !state.original) return null;
    return (
      <SignatureBackground
        original={state.original}
        preview={state.preview}
        colour={state.colour}
        tolerance={state.tolerance}
        loading={state.loading}
        error={state.error}
        onColour={colour =>
          presenter.background.update(store.background, colour, store.background.tolerance)
        }
        onTolerance={tolerance =>
          presenter.background.update(store.background, store.background.colour, tolerance)
        }
        onApply={() => presenter.finishBackground(store, false)}
        onKeep={() => presenter.finishBackground(store, true)}
      />
    );
  });
  const Upload = memo(function Upload({ invalid }: { invalid: boolean }) {
    const state = useObservable(store);
    const background = useObservable(store.background);
    return (
      <SignatureUpload
        image={state.signature.uploadedImage}
        loading={state.uploadLoading}
        error={state.uploadError}
        invalid={invalid}
        onUpload={onUpload}
        onClear={onClearUpload}
        BackgroundEditor={BackgroundEditor}
        editing={background.open}
        onEdit={() => {
          if (store.background.original) store.background.open = true;
          else if (store.signature.uploadedImage)
            void presenter.background.start(store.background, store.signature.uploadedImage);
        }}
      />
    );
  });
  const BoundSignature = memo(function BoundSignature() {
    const state = useObservable(store);
    const name = useObservable(details);
    return (
      <Signature
        value={state.signature}
        defaultName={name.answers.fullName}
        invalid={Boolean(state.messages.signature)}
        onChange={onSignatureChange}
        Upload={Upload}
      />
    );
  });

  return memo(function BoundDeclarationStep({ active }: { active: boolean }) {
    const state = useObservable(store);
    return (
      <DeclarationStep
        active={active}
        answers={state.answers}
        messages={state.messages}
        onAnswerChange={onAnswerChange}
        Signature={BoundSignature}
      />
    );
  });
}
