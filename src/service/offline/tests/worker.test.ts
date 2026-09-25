// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(new URL('../worker.js', import.meta.url), 'utf8');
const scope = 'https://example.com/subdir/';
const asset = `${scope}assets/form.pdf`;

type WorkerEvent = {
  request: { url: string; method: string; mode: string };
  waitUntil: (promise: Promise<unknown>) => void;
  respondWith: (promise: Promise<Response>) => void;
};

function setup() {
  const handlers: Record<string, (event: WorkerEvent) => void> = {};
  const saved = new Map<string, Response>();
  const cache = {
    put: vi.fn(async (key: string, response: Response) => {
      saved.set(key, response);
    }),
    match: vi.fn(async (key: string) => saved.get(key)?.clone()),
  };
  const caches = { open: vi.fn(async () => cache), keys: vi.fn(async () => []), delete: vi.fn() };
  const fetch = vi.fn(async (_request: unknown, _options?: unknown) => new Response('fresh'));
  const skipWaiting = vi.fn();
  const claim = vi.fn();
  runInNewContext(source, {
    __VERSION__: 'test',
    __ASSETS__: ['index.html', 'assets/form.pdf'],
    URL,
    Request,
    caches,
    fetch,
    self: {
      registration: { scope },
      skipWaiting,
      clients: { claim },
      addEventListener: (name: string, handler: (event: WorkerEvent) => void) => {
        handlers[name] = handler;
      },
    },
  });
  function dispatch(type: string, url = asset, mode = 'cors') {
    const tasks: Promise<unknown>[] = [];
    let response: Promise<Response> | undefined;
    handlers[type]({
      request: { url, method: 'GET', mode },
      waitUntil: promise => {
        tasks.push(promise);
      },
      respondWith: promise => {
        response = promise;
      },
    });
    return { response, done: () => Promise.all(tasks) };
  }
  return { saved, cache, caches, fetch, skipWaiting, claim, dispatch };
}

describe('service worker network fallback', () => {
  it('uses the network even with a cached file and saves the fresh response', async () => {
    const worker = setup();
    worker.saved.set(asset, new Response('old'));
    const event = worker.dispatch('fetch');
    expect(await (await event.response)?.text()).toBe('fresh');
    await event.done();
    expect(await worker.saved.get(asset)?.text()).toBe('fresh');
    expect(worker.cache.match).not.toHaveBeenCalled();
    expect(worker.fetch.mock.calls[0][1]).toEqual({ cache: 'no-cache' });
  });

  it('falls back to the canonical document when a navigation fails', async () => {
    const worker = setup();
    worker.saved.set(`${scope}index.html`, new Response('cached app'));
    worker.fetch.mockRejectedValueOnce(new Error('offline'));
    const event = worker.dispatch('fetch', `${scope}?mode=zoom`, 'navigate');
    expect(await (await event.response)?.text()).toBe('cached app');
    await event.done();
    expect(worker.cache.match).toHaveBeenCalledWith(`${scope}index.html`, { ignoreVary: true });
  });

  it('uses cached assets on an HTTP error without overwriting the good copy', async () => {
    const worker = setup();
    worker.saved.set(asset, new Response('cached PDF'));
    worker.fetch.mockResolvedValueOnce(new Response('unavailable', { status: 503 }));
    const event = worker.dispatch('fetch');
    expect(await (await event.response)?.text()).toBe('cached PDF');
    await event.done();
    expect(worker.cache.put).not.toHaveBeenCalled();
  });

  it('returns the network response when cache storage fails', async () => {
    const worker = setup();
    worker.caches.open.mockRejectedValue(new Error('storage blocked'));
    const event = worker.dispatch('fetch');
    expect(await (await event.response)?.text()).toBe('fresh');
    await expect(event.done()).resolves.toBeDefined();
  });

  it('installs and caches the other files if one background download fails', async () => {
    const worker = setup();
    worker.fetch.mockRejectedValueOnce(new Error('one failed file'));
    await worker.dispatch('install').done();
    expect(worker.fetch).toHaveBeenCalledTimes(2);
    expect(worker.saved.has(asset)).toBe(true);
    expect(worker.skipWaiting).toHaveBeenCalledOnce();
  });

  it('does not intercept external URLs or generated files', () => {
    const worker = setup();
    for (const url of [
      'https://other.example/file.pdf',
      `${scope}private.pdf`,
      'blob:https://example.com/signature',
    ]) {
      expect(worker.dispatch('fetch', url).response).toBeUndefined();
    }
    expect(worker.fetch).not.toHaveBeenCalled();
  });
});
