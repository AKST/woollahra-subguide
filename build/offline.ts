import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

// Build the manifest from the actual output, including fonts that CSS loads lazily.
export function offlinePlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'offline-app',
    apply: 'build',
    configResolved(value) {
      config = value;
    },
    async closeBundle() {
      const root = resolve(config.root, config.build.outDir);
      const walk = async (directory: string): Promise<string[]> => {
        const entries = await readdir(directory, { withFileTypes: true });
        return (
          await Promise.all(
            entries.map(entry => {
              const path = resolve(directory, entry.name);
              return entry.isDirectory() ? walk(path) : Promise.resolve([path]);
            }),
          )
        ).flat();
      };
      const files = (await walk(root))
        .filter(path => !['sw.js', 'diagnostics.html'].includes(relative(root, path)))
        .sort();
      const template = await readFile(
        new URL('../src/service/offline/worker.js', import.meta.url),
        'utf8',
      );
      const hash = createHash('sha256').update(template);
      for (const file of files) hash.update(relative(root, file)).update(await readFile(file));
      const manifest = files.map(file => relative(root, file).split('\\').join('/'));
      await writeFile(
        resolve(root, 'sw.js'),
        template
          .replace('__VERSION__', JSON.stringify(hash.digest('hex').slice(0, 16)))
          .replace('__ASSETS__', JSON.stringify(manifest)),
      );
    },
  };
}
