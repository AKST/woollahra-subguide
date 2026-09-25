import { STEP } from '@common/form/steps';
import { describe, expect, it } from 'vitest';
import type { SignatureImage } from '@common/form/types';
import { createHarness, deferred } from '../../tests/fixture';

const file = new File(['image'], 'signature.png', { type: 'image/png' });
const image = { url: 'data:image/png;base64,new', width: 400, height: 100 };

describe('signature uploads', () => {
  it('previews without changing the uploaded image until applied, and can restore the original', async () => {
    const { store, presenter } = createHarness();
    const declaration = store.declaration;
    await presenter.declaration.upload(declaration, file);
    const original = declaration.signature.uploadedImage;
    expect(declaration.background.open).toBe(true);
    expect(declaration.background.preview?.url).toContain('clean');
    expect(declaration.signature.uploadedImage).toBe(original);
    presenter.declaration.finishBackground(declaration, false);
    expect(declaration.signature.uploadedImage).toBe(declaration.background.preview);
    expect(declaration.background.open).toBe(false);
    presenter.declaration.finishBackground(declaration, true);
    expect(declaration.signature.uploadedImage).toBe(original);
  });

  it('does not restore a background preview after the upload is cleared', async () => {
    const { store, presenter, browser } = createHarness();
    const pending = deferred<Awaited<ReturnType<typeof browser.readPixels>>>();
    browser.readPixels.mockReturnValueOnce(pending.promise);
    await presenter.declaration.upload(store.declaration, file);
    presenter.declaration.clearUpload(store.declaration);
    pending.resolve({ width: 1, height: 1, data: new Uint8ClampedArray([255, 255, 255, 255]) });
    await Promise.resolve();
    expect(store.declaration.background.open).toBe(false);
    expect(store.declaration.background.preview).toBeUndefined();
    expect(store.declaration.signature.uploadedImage).toBeUndefined();
  });
  it('validates only the active signature method and clears uploads', async () => {
    const { store, presenter } = createHarness();
    const declaration = store.declaration;
    presenter.declaration.changeSignature(declaration, {
      ...declaration.signature,
      mode: 'upload',
    });
    expect(presenter.declaration.hasSignature(declaration)).toBe(false);
    await presenter.declaration.upload(declaration, file);
    expect(presenter.declaration.hasSignature(declaration)).toBe(true);
    expect(store.dirty).toBe(true);
    presenter.declaration.changeSignature(declaration, { ...declaration.signature, mode: 'draw' });
    expect(presenter.declaration.hasSignature(declaration)).toBe(false);
    presenter.declaration.clearUpload(declaration);
    expect(declaration.signature.uploadedImage).toBeUndefined();
  });

  it('rejects unsupported and oversized images before decoding', async () => {
    const { store, presenter, browser } = createHarness();
    await presenter.declaration.upload(
      store.declaration,
      new File(['svg'], 's.svg', { type: 'image/svg+xml' }),
    );
    expect(store.declaration.uploadError).toContain('PNG, JPEG or WebP');
    const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    await presenter.declaration.upload(store.declaration, large);
    expect(store.declaration.uploadError).toContain('10 MB');
    expect(browser.readImage).not.toHaveBeenCalled();
  });

  it('keeps the previous image on decoding failure and permits retry', async () => {
    const { store, presenter, browser } = createHarness();
    store.declaration.signature = { ...store.declaration.signature, uploadedImage: image };
    browser.readImage.mockRejectedValueOnce(new Error('Bad image'));
    await presenter.declaration.upload(store.declaration, file);
    expect(store.declaration.uploadError).toContain('could not be read');
    expect(store.declaration.signature.uploadedImage).toEqual(image);
    expect(store.declaration.uploadLoading).toBe(false);
    await presenter.declaration.upload(store.declaration, file);
    expect(store.declaration.uploadError).toBeUndefined();
  });

  it('ignores stale completions after replacement, clearing or disposal', async () => {
    for (const action of ['replace', 'clear', 'dispose']) {
      const { store, presenter, browser } = createHarness();
      const pending = deferred<SignatureImage>();
      browser.readImage.mockReturnValueOnce(pending.promise);
      const upload = presenter.declaration.upload(store.declaration, file);
      if (action === 'replace') await presenter.declaration.upload(store.declaration, file);
      else if (action === 'clear') presenter.declaration.clearUpload(store.declaration);
      else presenter.dispose(store);
      const expected = store.declaration.signature.uploadedImage;
      pending.resolve(image);
      await upload;
      expect(store.declaration.signature.uploadedImage).toBe(expected);
      expect(store.declaration.uploadLoading).toBe(false);
    }
  });

  it('waits for the selected image before creating a preview or PDF', async () => {
    const { store, presenter, browser, exportSignature } = createHarness();
    const pending = deferred<SignatureImage>();
    browser.readImage.mockReturnValueOnce(pending.promise);
    store.declaration.signature = { ...store.declaration.signature, mode: 'upload' };
    exportSignature.mockImplementation(async value => value.uploadedImage);
    void presenter.declaration.upload(store.declaration, file);
    const navigation = presenter.goTo(store, STEP.send);
    expect(exportSignature).not.toHaveBeenCalled();
    pending.resolve(image);
    expect(await navigation).toBe(true);
    expect(store.editor.items.find(item => item.id === 'signature')).toMatchObject({
      url: image.url,
    });
    expect(store.send.data?.issues.some(issue => issue.key === 'signature')).toBe(false);
  });
});
