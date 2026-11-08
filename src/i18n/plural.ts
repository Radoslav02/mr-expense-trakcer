/** English: 1 expense, 2 expenses. */
export const pluralEn = (count: number, one: string, other: string): string =>
  Math.abs(count) === 1 ? one : other;

/**
 * Serbian has three forms: 1, 21, 31… take `one` (1 trošak); 2–4, 22–24… take `few`
 * (2 troška); everything else, including 11–14, takes `many` (5 troškova).
 */
export const pluralSr = (count: number, one: string, few: string, many: string): string => {
  const n = Math.abs(Math.trunc(count));
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};
