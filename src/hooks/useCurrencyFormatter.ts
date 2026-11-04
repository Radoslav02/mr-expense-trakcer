import { useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';

export const useCurrencyFormatter = () => {
  const currency = useAppSelector(selectCurrency);

  const format = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);
  const formatCompact = useCallback(
    (amount: number) => formatCompactCurrency(amount, currency),
    [currency],
  );

  return { currency, format, formatCompact };
};
