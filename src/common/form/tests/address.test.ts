import { expect, it } from 'vitest';
import { formatAddress } from '../address';

it('combines street, suburb, state and postcode without dropping a unit or leading zero', () => {
  expect(
    formatAddress({
      address: ' Unit 2, 12 Smith Street ',
      suburb: 'Darwin',
      state: 'NT',
      postcode: '0800',
    }),
  ).toBe('Unit 2, 12 Smith Street, Darwin NT 0800');
});

it('keeps legacy complete addresses and tolerates unfilled autofill fields', () => {
  expect(formatAddress({ address: '12 Example Street, Double Bay NSW 2028' })).toBe(
    '12 Example Street, Double Bay NSW 2028',
  );
  expect(
    formatAddress({
      address: '12 Example Street',
      suburb: 'Double Bay',
      state: '',
      postcode: '2028',
    }),
  ).toBe('12 Example Street, Double Bay 2028');
});
