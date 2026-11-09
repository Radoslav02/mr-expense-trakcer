import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectCategoryMap, selectSharedCategories } from '@/redux/categories/categoriesSelectors';
import { selectPersonNames, selectTogetherExpenses } from '@/redux/partner/partnerSelectors';
import { ALL } from '@/types/expense';
import { roundMoney } from '@/utils/currency';
import {
  currentMonthKey,
  formatShortDate,
  isValidDateKey,
  monthBounds,
  todayKey,
} from '@/utils/dates';
import { isSplit, ownShare } from '@/utils/split';

interface TogetherExportModalProps {
  open: boolean;
  onClose: () => void;
}

type Whose = 'both' | 'me' | 'partner';

const FORM_ID = 'together-export-form';

const sum = (values: number[]) => roundMoney(values.reduce((total, value) => total + value, 0));

/** Exports both partners' shared expenses for a period as a PDF. */
export const TogetherExportModal = ({ open, onClose }: TogetherExportModalProps) => {
  const { t } = useI18n();
  const x = t.partner.export;
  const toast = useToast();
  const { format } = useCurrencyFormatter();
  const all = useAppSelector(selectTogetherExpenses);
  const categories = useAppSelector(selectSharedCategories);
  const categoryMap = useAppSelector(selectCategoryMap);
  const names = useAppSelector(selectPersonNames);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [whose, setWhose] = useState<Whose>('both');
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { start, end } = monthBounds(currentMonthKey());
    setFrom(start);
    setTo(end);
    setWhose('both');
    setCategoryId(ALL);
    setError(null);
  }, [open]);

  const matching = useMemo(
    () =>
      all
        .filter(
          (item) =>
            item.expense.date >= from &&
            item.expense.date <= to &&
            (whose === 'both' || item.owner === whose) &&
            (categoryId === ALL || item.categoryId === categoryId),
        )
        .sort(
          (a, b) =>
            a.expense.date.localeCompare(b.expense.date) ||
            a.expense.createdAt.localeCompare(b.expense.createdAt),
        ),
    [all, from, to, whose, categoryId],
  );

  const nameOf = (owner: 'me' | 'partner') => (owner === 'me' ? names.meFull : names.partner);
  const whoseOptions: { value: Whose; label: string }[] = [
    { value: 'both', label: x.both },
    { value: 'me', label: x.mine },
    { value: 'partner', label: x.theirs(names.partner) },
  ];
  const categoryOptions = [
    { value: ALL, label: x.allCategories },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];
  const total = sum(matching.map((item) => item.expense.amount));

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
      const paidBy = (owner: 'me' | 'partner') =>
        sum(matching.filter((item) => item.owner === owner).map((item) => item.expense.amount));
      const splits = matching.filter((item) => isSplit(item.expense));
      // In a split, the payer carries ownShare and the other person partnerShare.
      const partOf = (person: 'me' | 'partner') =>
        sum(
          splits.map(({ owner, expense }) =>
            owner === person ? ownShare(expense) : (expense.partnerShare ?? 0),
          ),
        );

      const { downloadExpensesPdf } = await import('@/utils/exportPdf');
      await downloadExpensesPdf({
        fileName: `${x.fileName}_${from}_${to}`,
        title: x.pdf.title(names.meFull, names.partner),
        period: x.pdf.period(formatShortDate(from), formatShortDate(to)),
        filters: x.pdf.filters(
          whoseOptions.find((option) => option.value === whose)?.label ?? '',
          categoryId === ALL ? x.allCategories : (categoryMap[categoryId]?.name ?? ''),
        ),
        owner: '',
        generated: x.pdf.generated(formatShortDate(todayKey())),
        labels: {
          date: x.pdf.date,
          item: x.pdf.item,
          category: x.pdf.category,
          payment: x.pdf.paidBy,
          amount: x.pdf.amount,
        },
        rows: matching.map(({ owner, expense, categoryId: id }) => {
          const payerPart = ownShare(expense);
          const otherPart = expense.partnerShare ?? 0;
          const [myPart, theirPart] =
            owner === 'me' ? [payerPart, otherPart] : [otherPart, payerPart];
          return {
            date: formatShortDate(expense.date),
            title: expense.title,
            details:
              [
                isSplit(expense)
                  ? x.pdf.parts(names.meFull, format(myPart), names.partner, format(theirPart))
                  : null,
                expense.note ?? null,
              ]
                .filter(Boolean)
                .join(' · ') || undefined,
            category: categoryMap[id]?.name ?? t.common.uncategorized,
            payment: nameOf(owner),
            amount: format(expense.amount),
          };
        }),
        totalLabel: x.pdf.total,
        total: format(total),
        count: x.pdf.count(matching.length),
        summary: [
          ...(whose !== 'partner'
            ? [{ label: x.pdf.paidByName(names.meFull), value: format(paidBy('me')) }]
            : []),
          ...(whose !== 'me'
            ? [{ label: x.pdf.paidByName(names.partner), value: format(paidBy('partner')) }]
            : []),
          ...(splits.length > 0
            ? [
                {
                  label: x.pdf.sharedCosts,
                  value: format(sum(splits.map((item) => item.expense.amount))),
                },
                { label: x.pdf.partOf(names.meFull), value: format(partOf('me')) },
                { label: x.pdf.partOf(names.partner), value: format(partOf('partner')) },
              ]
            : []),
          { label: x.pdf.together, value: format(total), strong: true },
        ],
        page: x.pdf.page,
      });
      onClose();
    } catch {
      toast.error(x.failed);
    } finally {
      setBusy(false);
    }
  };

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
        <Select
          label={x.whose}
          value={whose}
          options={whoseOptions}
          onChange={(event) => {
            setWhose(event.target.value as Whose);
            setError(null);
          }}
        />
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
          {x.pdf.count(matching.length)} · {format(total)}
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
