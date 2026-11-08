import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectCategoryMap, selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { selectMySpending } from '@/redux/expenses/expensesSelectors';
import { selectLinkStatus, selectPersonNames } from '@/redux/partner/partnerSelectors';
import { ALL } from '@/types/expense';
import {
  currentMonthKey,
  formatShortDate,
  isValidDateKey,
  monthBounds,
  todayKey,
} from '@/utils/dates';
import { sortByDateDesc, sumAmounts } from '@/utils/expenses';

interface ExportExpensesModalProps {
  open: boolean;
  onClose: () => void;
}

type Which = 'all' | 'shared' | 'private';

const FORM_ID = 'export-expenses-form';

export const ExportExpensesModal = ({ open, onClose }: ExportExpensesModalProps) => {
  const { t } = useI18n();
  const x = t.expenses.export;
  const toast = useToast();
  const { format } = useCurrencyFormatter();
  const expenses = useAppSelector(selectMySpending);
  const categories = useAppSelector(selectSortedCategories);
  const categoryMap = useAppSelector(selectCategoryMap);
  const hasPartner = useAppSelector(selectLinkStatus) !== 'none';
  const partnerName = useAppSelector(selectPersonNames).partner;
  const user = useAppSelector(selectAuthUser);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [which, setWhich] = useState<Which>('all');
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { start, end } = monthBounds(currentMonthKey());
    setFrom(start);
    setTo(end);
    setWhich('all');
    setCategoryId(ALL);
    setError(null);
  }, [open]);

  // Shared expenses only use shared categories; private ones can use either kind.
  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: t.expenses.filters.allCategories },
      ...categories
        .filter((category) => which !== 'shared' || !category.isPrivate)
        .map((category) => ({
          value: category.id,
          label: category.isPrivate ? x.privateCategory(category.name) : category.name,
        })),
    ],
    [categories, which, t, x],
  );

  const chooseWhich = (value: Which) => {
    setWhich(value);
    if (value === 'shared' && categoryMap[categoryId]?.isPrivate) setCategoryId(ALL);
    setError(null);
  };

  const matching = useMemo(
    () =>
      sortByDateDesc(
        expenses.filter(
          (expense) =>
            expense.date >= from &&
            expense.date <= to &&
            (which === 'all' ||
              (which === 'private' ? expense.isPrivate === true : !expense.isPrivate)) &&
            (categoryId === ALL || expense.categoryId === categoryId),
        ),
      ).reverse(),
    [expenses, from, to, which, categoryId],
  );

  const whichLabel =
    which === 'all' ? x.all : which === 'shared' ? x.shared(partnerName) : x.private;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDateKey(from) || !isValidDateKey(to) || from > to) {
      setError(x.rangeInvalid);
      return;
    }
    if (matching.length === 0) {
      setError(x.nothing);
      return;
    }
    setBusy(true);
    try {
      const { downloadExpensesPdf } = await import('@/utils/exportPdf');
      await downloadExpensesPdf({
        fileName: `${x.fileName}_${from}_${to}`,
        title: x.pdf.title,
        period: x.pdf.period(formatShortDate(from), formatShortDate(to)),
        filters: x.pdf.filters(
          whichLabel,
          categoryId === ALL
            ? t.expenses.filters.allCategories
            : (categoryMap[categoryId]?.name ?? t.common.uncategorized),
        ),
        owner: user?.displayName || user?.email || '',
        generated: x.pdf.generated(formatShortDate(todayKey())),
        labels: {
          date: x.pdf.date,
          item: x.pdf.item,
          category: x.pdf.category,
          payment: x.pdf.payment,
          amount: x.pdf.amount,
        },
        rows: matching.map((expense) => ({
          date: formatShortDate(expense.date),
          title: expense.title,
          details:
            [
              expense.shared ? x.pdf.splitOf(format(expense.shared.total)) : null,
              expense.isPrivate ? x.pdf.privateMark : null,
              expense.note ?? null,
            ]
              .filter(Boolean)
              .join(' · ') || undefined,
          category: categoryMap[expense.categoryId]?.name ?? t.common.uncategorized,
          payment: t.expenses.paymentMethods[expense.paymentMethod],
          amount: format(expense.amount),
        })),
        totalLabel: x.pdf.total,
        total: format(sumAmounts(matching)),
        count: x.pdf.count(matching.length),
        page: x.pdf.page,
      });
      onClose();
    } catch {
      toast.error(x.failed);
    } finally {
      setBusy(false);
    }
  };

  const whichOptions: { value: Which; label: string }[] = [
    { value: 'all', label: x.all },
    { value: 'shared', label: x.shared(partnerName) },
    { value: 'private', label: x.private },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="sm"
      title={x.title}
      description={x.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={busy}>
            {busy ? x.preparing : x.download}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={x.from}
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => {
              setFrom(event.target.value);
              setError(null);
            }}
            wrapperClassName="min-w-0"
          />
          <Input
            label={x.to}
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => {
              setTo(event.target.value);
              setError(null);
            }}
            wrapperClassName="min-w-0"
          />
        </div>
        {hasPartner && (
          <Select
            label={x.which}
            value={which}
            options={whichOptions}
            onChange={(event) => chooseWhich(event.target.value as Which)}
          />
        )}
        <Select
          label={x.category}
          value={categoryId}
          options={categoryOptions}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setError(null);
          }}
        />
        <p className="tabular text-[0.8125rem] text-ink-muted">
          {x.pdf.count(matching.length)} · {format(sumAmounts(matching))}
        </p>
        {error && (
          <p role="alert" className="text-[0.8125rem] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
