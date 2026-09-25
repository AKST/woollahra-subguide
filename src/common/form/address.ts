import type { Answers } from './types';

export function formatAddress(
  answers: Pick<Answers, 'address' | 'suburb' | 'state' | 'postcode'>,
): string {
  const locality = [answers.suburb, answers.state, answers.postcode]
    .map(value => value?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
  return [answers.address.trim(), locality].filter(Boolean).join(', ');
}
