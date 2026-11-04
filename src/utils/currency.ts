const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (currency: string, compact: boolean): Intl.NumberFormat => {
  const key = `${currency}:${compact ? 'compact' : 'full'}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: 0,
  });
  formatterCache.set(key, formatter);
  return formatter;
};

export const formatCurrency = (amount: number, currency: string): string =>
  getFormatter(currency, false).format(amount);

export const formatCompactCurrency = (amount: number, currency: string): string =>
  getFormatter(currency, true).format(amount);

export const formatPercent = (ratio: number): string =>
  new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);

export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;
