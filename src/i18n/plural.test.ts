import { describe, expect, it } from 'vitest';
import { pluralEn, pluralSr } from './plural';

describe('pluralSr', () => {
  const form = (n: number) => pluralSr(n, 'trošak', 'troška', 'troškova');

  it('uses the singular for 1, 21, 101', () => {
    expect([1, 21, 31, 101].map(form)).toEqual(['trošak', 'trošak', 'trošak', 'trošak']);
  });

  it('uses the "few" form for 2–4 and 22–24', () => {
    expect([2, 3, 4, 22, 104].map(form)).toEqual([
      'troška',
      'troška',
      'troška',
      'troška',
      'troška',
    ]);
  });

  it('uses the "many" form for 0, 5–20 and the teens', () => {
    expect([0, 5, 11, 12, 13, 14, 20, 111].map(form)).toEqual(Array(8).fill('troškova'));
  });
});

describe('pluralEn', () => {
  it('only treats exactly one as singular', () => {
    expect([0, 1, 2].map((n) => pluralEn(n, 'expense', 'expenses'))).toEqual([
      'expenses',
      'expense',
      'expenses',
    ]);
  });
});
