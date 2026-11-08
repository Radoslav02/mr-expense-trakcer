import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { TextArea } from '@/components/TextArea';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { saveGroupExpenseThunk } from '@/redux/groups/groupsThunks';
import type { Group, GroupExpense, GroupSplitMode } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatCurrency, roundMoney } from '@/utils/currency';
import { todayKey } from '@/utils/dates';
import { splitEqually, sumShares } from '@/utils/groupBalances';
import { parseAmount } from '@/utils/validation';
import { myMemberId, sortedMembers } from './groupUtils';
import { MemberAvatar } from './MemberAvatar';

interface GroupExpenseFormProps {
  open: boolean;
  group: Group;
  /** Edit this expense; without it, a new one is added. */
  expense?: GroupExpense | null;
  onClose: () => void;
  onDelete?: (expense: GroupExpense) => void;
}

const FORM_ID = 'group-expense-form';

interface Errors {
  title?: string;
  amount?: string;
  people?: string;
}

const validAmount = (value: string) => {
  const amount = parseAmount(value);
  return value.trim() && Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : null;
};

export const GroupExpenseForm = ({
  open,
  group,
  expense = null,
  onClose,
  onDelete,
}: GroupExpenseFormProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const myId = myMemberId(group, user?.uid);
  const members = useMemo(() => sortedMembers(group, myId), [group, myId]);
  const format = (amount: number) => formatCurrency(amount, group.currency);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey());
  const [paidBy, setPaidBy] = useState('');
  const [mode, setMode] = useState<GroupSplitMode>('equal');
  const [selected, setSelected] = useState<string[]>([]);
  const [exact, setExact] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(expense?.title ?? '');
    setAmount(expense ? String(expense.amount) : '');
    setDate(expense?.date ?? todayKey());
    setPaidBy(expense?.paidBy ?? myId ?? members[0]?.id ?? '');
    setMode(expense?.splitMode ?? 'equal');
    setSelected(expense ? Object.keys(expense.shares) : members.map((member) => member.id));
    setExact(
      expense
        ? Object.fromEntries(Object.entries(expense.shares).map(([id, v]) => [id, String(v)]))
        : {},
    );
    setNote(expense?.note ?? '');
    setErrors({});
    // Reset only when opening or switching expense.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense]);

  const total = validAmount(amount);
  // Keep the order of the member list, whatever order people were ticked in.
  const chosen = members.filter((member) => selected.includes(member.id)).map((m) => m.id);
  const exactShares = Object.fromEntries(
    chosen.map((id) => [id, roundMoney(parseAmount(exact[id] ?? '') || 0)]),
  );
  const shares = mode === 'equal' ? (total ? splitEqually(total, chosen) : {}) : exactShares;
  const difference = total !== null ? roundMoney(total - sumShares(exactShares)) : 0;

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setErrors((current) => ({ ...current, people: undefined }));
  };

  const allSelected = chosen.length === members.length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = g.validation.titleRequired;
    if (total === null) next.amount = g.validation.amountPositive;
    if (chosen.length === 0) next.people = g.validation.nobodySelected;
    else if (mode === 'exact' && total !== null && Math.abs(difference) >= 0.005) {
      next.people = g.validation.partsMismatch(format(total));
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || total === null || !user) return;

    setSaving(true);
    try {
      await dispatch(
        saveGroupExpenseThunk({
          groupId: group.id,
          expenseId: expense?.id,
          input: {
            title,
            amount: total,
            date,
            paidBy,
            splitMode: mode,
            shares: mode === 'equal' ? splitEqually(total, chosen) : exactShares,
            note: note.trim() || undefined,
          },
        }),
      ).unwrap();
      toast.success(expense ? g.expenseForm.saved : g.expenseForm.added);
      onClose();
    } catch {
      toast.error(g.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={expense ? g.expenseForm.editTitle : g.expenseForm.addTitle}
      footer={
        <>
          {expense && onDelete && (
            <Button
              variant="ghost"
              onClick={() => onDelete(expense)}
              disabled={saving}
              className="text-danger hover:text-danger sm:mr-auto"
            >
              {g.expenseForm.delete}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {expense ? t.common.saveChanges : g.expenseForm.addTitle}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid min-w-0 gap-4 pb-2 sm:grid-cols-2"
      >
        <Input
          label={g.expenseForm.title}
          value={title}
          maxLength={80}
          placeholder={g.expenseForm.titlePlaceholder}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((current) => ({ ...current, title: undefined }));
          }}
          error={errors.title}
          wrapperClassName="min-w-0 sm:col-span-2"
        />
        <Input
          label={g.expenseForm.amount}
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setErrors((current) => ({ ...current, amount: undefined }));
          }}
          error={errors.amount}
          trailing={group.currency}
          className="tabular"
          wrapperClassName="min-w-0"
        />
        <Input
          label={g.expenseForm.date}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          wrapperClassName="min-w-0"
        />
        <Select
          label={g.expenseForm.paidBy}
          value={paidBy}
          options={members.map((member) => ({
            value: member.id,
            label: member.id === myId ? `${member.name} (${g.members.you})` : member.name,
          }))}
          onChange={(event) => setPaidBy(event.target.value)}
          wrapperClassName="min-w-0 sm:col-span-2"
        />

        <fieldset className="min-w-0 sm:col-span-2">
          <legend className="sr-only">{g.expenseForm.splitBetween}</legend>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span aria-hidden="true" className="text-sm font-medium text-ink">
              {g.expenseForm.splitBetween}
            </span>
            <div role="group" className="inline-flex rounded-lg bg-sunken p-0.5">
              {(['equal', 'exact'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    'h-8 rounded-md px-3 text-xs font-medium text-ink-muted transition-colors',
                    mode === value && 'bg-accent text-accent-ink shadow-card',
                  )}
                >
                  {value === 'equal' ? g.expenseForm.equally : g.expenseForm.exact}
                </button>
              ))}
            </div>
          </div>

          <ul className="overflow-hidden rounded-xl border border-line">
            <li className="border-b border-line">
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? [] : members.map((member) => member.id))
                  }
                  className="h-4 w-4 accent-[rgb(var(--color-accent))]"
                />
                <span className="font-medium text-ink">{g.expenseForm.everyone}</span>
                {mode === 'equal' && total !== null && chosen.length > 0 && (
                  <span className="tabular ml-auto text-[0.8125rem] text-ink-subtle">
                    {g.expenseForm.each(format(roundMoney(total / chosen.length)))}
                  </span>
                )}
              </label>
            </li>
            {members.map((member) => {
              const isOn = selected.includes(member.id);
              return (
                <li
                  key={member.id}
                  className="flex min-w-0 items-center gap-3 px-3 py-2 [&+&]:border-t [&+&]:border-line"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(member.id)}
                      className="h-4 w-4 shrink-0 accent-[rgb(var(--color-accent))]"
                    />
                    <MemberAvatar member={member} size="sm" />
                    <span className="min-w-0 truncate text-ink">
                      {member.name}
                      {member.id === myId && (
                        <span className="text-ink-subtle"> ({g.members.you})</span>
                      )}
                    </span>
                  </label>
                  {isOn && mode === 'equal' && shares[member.id] !== undefined && (
                    <span className="tabular shrink-0 text-[0.8125rem] text-ink-subtle">
                      {format(shares[member.id])}
                    </span>
                  )}
                  {isOn && mode === 'exact' && (
                    <Input
                      label={g.expenseForm.partFor(member.name)}
                      hideLabel
                      inputMode="decimal"
                      placeholder="0"
                      value={exact[member.id] ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setExact((current) => ({ ...current, [member.id]: value }));
                        setErrors((current) => ({ ...current, people: undefined }));
                      }}
                      className="tabular h-9 text-right"
                      wrapperClassName="w-28 shrink-0"
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {mode === 'exact' && total !== null && Math.abs(difference) >= 0.005 && (
            <p
              className={cn(
                'tabular mt-2 text-[0.8125rem]',
                difference < 0 ? 'text-danger' : 'text-ink-subtle',
              )}
            >
              {difference > 0
                ? g.expenseForm.left(format(difference))
                : g.expenseForm.over(format(-difference))}
            </p>
          )}
          {errors.people && (
            <p role="alert" className="mt-2 text-[0.8125rem] text-danger">
              {errors.people}
            </p>
          )}
        </fieldset>

        <div className="min-w-0 sm:col-span-2">
          <TextArea
            label={g.expenseForm.note}
            optional
            rows={2}
            maxLength={300}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
