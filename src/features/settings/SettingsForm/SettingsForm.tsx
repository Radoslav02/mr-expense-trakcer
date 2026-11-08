import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { CURRENCY_CODES } from '@/constants/settings';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import {
  selectFinance,
  selectSettings,
  selectSettingsSaveStatus,
} from '@/redux/settings/settingsSelectors';
import { updateSettings } from '@/redux/settings/settingsThunks';
import { formatCurrency, roundMoney } from '@/utils/currency';
import { parseAmount, validateBudget, validateIncome } from '@/utils/validation';
import './SettingsForm.css';

const PREVIEW_AMOUNT = 12345.6;

export const SettingsForm = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { t } = useI18n();
  const copy = t.settings.money;
  const currencyOptions = CURRENCY_CODES.map((code) => ({
    value: code,
    label: t.settings.currencies[code],
  }));
  const settings = useAppSelector(selectSettings);
  const finance = useAppSelector(selectFinance);
  const saving = useAppSelector(selectSettingsSaveStatus) === 'loading';
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.monthlyBudget?.toString() ?? '');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [income, setIncome] = useState(finance.monthlyIncome?.toString() ?? '');
  const [incomeError, setIncomeError] = useState<string | null>(null);

  useEffect(() => {
    setCurrency(settings.currency);
    setBudget(settings.monthlyBudget?.toString() ?? '');
  }, [settings]);

  useEffect(() => {
    setIncome(finance.monthlyIncome?.toString() ?? '');
  }, [finance]);

  const nextBudget = budget.trim() ? roundMoney(parseAmount(budget)) : null;
  const nextIncome = income.trim() ? roundMoney(parseAmount(income)) : null;
  const isDirty =
    currency !== settings.currency ||
    nextBudget !== settings.monthlyBudget ||
    nextIncome !== finance.monthlyIncome;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = { budget: validateBudget(budget), income: validateIncome(income) };
    setBudgetError(errors.budget);
    setIncomeError(errors.income);
    if (errors.budget || errors.income) return;
    try {
      await dispatch(
        updateSettings({
          settings: { currency, monthlyBudget: nextBudget },
          finance: { monthlyIncome: nextIncome },
        }),
      ).unwrap();
      toast.success(copy.saved);
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <Card title={copy.title} description={copy.description}>
      <form onSubmit={handleSubmit} noValidate className="settings-form flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={copy.incomeLabel}
            optional
            inputMode="decimal"
            placeholder={copy.incomePlaceholder}
            value={income}
            onChange={(event) => {
              setIncome(event.target.value);
              setIncomeError(null);
            }}
            error={incomeError ?? undefined}
            hint={copy.incomeHint}
            trailing={currency}
            className="tabular"
            wrapperClassName="min-w-0 sm:col-span-2"
          />
          <Select
            label={copy.currencyLabel}
            value={currency}
            options={currencyOptions}
            onChange={(event) => setCurrency(event.target.value)}
            hint={copy.preview(formatCurrency(PREVIEW_AMOUNT, currency))}
          />
          <Input
            label={copy.budgetLabel}
            optional
            inputMode="decimal"
            placeholder={copy.budgetPlaceholder}
            value={budget}
            onChange={(event) => {
              setBudget(event.target.value);
              setBudgetError(null);
            }}
            error={budgetError ?? undefined}
            hint={copy.budgetHint}
            trailing={currency}
            className="tabular"
          />
        </div>
        <div className="flex justify-end border-t border-line pt-4">
          <Button type="submit" loading={saving} disabled={!isDirty}>
            {t.common.saveChanges}
          </Button>
        </div>
      </form>
    </Card>
  );
};
