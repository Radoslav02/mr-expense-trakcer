import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { CURRENCY_OPTIONS } from '@/constants/settings';
import { useToast } from '@/hooks/useToast';
import { selectSettings, selectSettingsSaveStatus } from '@/redux/settings/settingsSelectors';
import { updateSettings } from '@/redux/settings/settingsThunks';
import { formatCurrency, roundMoney } from '@/utils/currency';
import { parseAmount, validateBudget } from '@/utils/validation';
import './SettingsForm.css';

const CURRENCY_SELECT_OPTIONS = CURRENCY_OPTIONS.map(({ code, label }) => ({ value: code, label }));
const PREVIEW_AMOUNT = 12345.6;

export const SettingsForm = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const settings = useAppSelector(selectSettings);
  const saving = useAppSelector(selectSettingsSaveStatus) === 'loading';
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.monthlyBudget?.toString() ?? '');
  const [budgetError, setBudgetError] = useState<string | null>(null);

  useEffect(() => {
    setCurrency(settings.currency);
    setBudget(settings.monthlyBudget?.toString() ?? '');
  }, [settings]);

  const nextBudget = budget.trim() ? roundMoney(parseAmount(budget)) : null;
  const isDirty = currency !== settings.currency || nextBudget !== settings.monthlyBudget;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateBudget(budget);
    setBudgetError(error);
    if (error) return;
    try {
      await dispatch(updateSettings({ currency, monthlyBudget: nextBudget })).unwrap();
      toast.success('Settings saved.');
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <Card title="Money" description="How amounts are shown and what you plan to spend each month.">
      <form onSubmit={handleSubmit} noValidate className="settings-form flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Currency"
            value={currency}
            options={CURRENCY_SELECT_OPTIONS}
            onChange={(event) => setCurrency(event.target.value)}
            hint={`Preview: ${formatCurrency(PREVIEW_AMOUNT, currency)}`}
          />
          <Input
            label="Monthly budget"
            optional
            inputMode="decimal"
            placeholder="No budget"
            value={budget}
            onChange={(event) => {
              setBudget(event.target.value);
              setBudgetError(null);
            }}
            error={budgetError ?? undefined}
            hint="Leave empty to hide the budget bar."
            trailing={currency}
            className="tabular"
          />
        </div>
        <div className="flex justify-end border-t border-line pt-4">
          <Button type="submit" loading={saving} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
};
