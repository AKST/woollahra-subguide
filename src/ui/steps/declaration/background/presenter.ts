import { ObservableStore, observable } from '@common/observable';
import { backgroundColour, removeBackground, type ImagePixels } from '@common/signature/background';
import type { SignatureImage } from '@common/form/types';
import type { BrowserService } from '@service/browser/service';

export class BackgroundStore extends ObservableStore {
  @observable open = false;
  @observable loading = false;
  @observable error = '';
  @observable colour = '#ffffff';
  @observable tolerance = 35;
  @observable preview: SignatureImage | undefined = undefined;
  @observable original: SignatureImage | undefined = undefined;
  pixels: ImagePixels | undefined;
  generation = 0;
}

export class BackgroundPresenter {
  constructor(private readonly browser: Pick<BrowserService, 'readPixels' | 'writePixels'>) {}

  reset(store: BackgroundStore): void {
    store.generation++;
    store.open = false;
    store.loading = false;
    store.original = undefined;
    store.preview = undefined;
    store.pixels = undefined;
    store.error = '';
  }

  async start(store: BackgroundStore, image: SignatureImage): Promise<void> {
    this.reset(store);
    const generation = store.generation;
    store.original = image;
    store.open = true;
    store.loading = true;
    try {
      const pixels = await this.browser.readPixels(image);
      if (store.generation !== generation) return;
      store.pixels = pixels;
      store.colour = backgroundColour(pixels);
      store.tolerance = 35;
      this.update(store, store.colour, store.tolerance);
    } catch {
      if (store.generation === generation)
        store.error = 'The background could not be removed. You can keep the original image.';
    } finally {
      if (store.generation === generation) store.loading = false;
    }
  }

  update(store: BackgroundStore, colour: string, tolerance: number): void {
    if (!/^#[0-9a-f]{6}$/i.test(colour) || !Number.isFinite(tolerance)) return;
    store.colour = colour;
    store.tolerance = Math.max(0, Math.min(160, tolerance));
    if (!store.pixels) return;
    try {
      store.preview = this.browser.writePixels(
        removeBackground(store.pixels, colour, store.tolerance),
      );
      store.error = '';
    } catch {
      store.preview = undefined;
      store.error = 'The background could not be removed. You can keep the original image.';
    }
  }
}
