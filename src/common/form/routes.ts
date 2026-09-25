import { STEP } from './steps';

const names = ['about', 'details', 'signature', 'check', 'send'];

export function stepHash(step: number, reducedMotion = false): string {
  return `#?page=${names[step] ?? names[STEP.details]}${reducedMotion ? '&reducedMotion=true' : ''}`;
}

export function stepFromHash(hash: string): number {
  const name = new URLSearchParams(hash.replace(/^#\??/, '')).get('page');
  const step = names.indexOf(name ?? '');
  return step < 0 ? STEP.details : step;
}
