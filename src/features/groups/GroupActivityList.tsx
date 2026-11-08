import { ArrowRightLeft, ReceiptText, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useI18n } from '@/i18n';
import type { Group, GroupExpense, GroupPayment } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatCurrency, roundMoney } from '@/utils/currency';
import { formatDayHeading } from '@/utils/dates';

interface GroupActivityListProps {
  group: Group;
  expenses: readonly GroupExpense[];
  payments: readonly GroupPayment[];
  myId: string | null;
  onEditExpense: (expense: GroupExpense) => void;
  onDeletePayment: (payment: GroupPayment) => void;
}

type Item =
  | { kind: 'expense'; date: string; created: string; expense: GroupExpense }
  | { kind: 'payment'; date: string; created: string; payment: GroupPayment };

/** Expenses and payments, newest day first. */
export const GroupActivityList = ({
  group,
  expenses,
  payments,
  myId,
  onEditExpense,
  onDeletePayment,
}: GroupActivityListProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const format = (amount: number) => formatCurrency(amount, group.currency);
  const nameOf = (id: string) => (id === myId ? t.common.you : (group.members[id]?.name ?? '?'));

  const items: Item[] = [
    ...expenses.map((expense) => ({
      kind: 'expense' as const,
      date: expense.date,
      created: expense.createdAt,
      expense,
    })),
    ...payments.map((payment) => ({
      kind: 'payment' as const,
      date: payment.date,
      created: payment.createdAt,
      payment,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.created.localeCompare(a.created));

  const days = items.reduce<{ date: string; items: Item[] }[]>((list, item) => {
    const last = list[list.length - 1];
    if (last?.date === item.date) last.items.push(item);
    else list.push({ date: item.date, items: [item] });
    return list;
  }, []);

  /** What this expense means for me: what I'm owed back, or what I owe. */
  const myPosition = (expense: GroupExpense) => {
    if (!myId) return null;
    const share = expense.shares[myId] ?? 0;
    if (expense.paidBy === myId) {
      const lent = roundMoney(expense.amount - share);
      return lent > 0 ? { text: g.activity.youLent(format(lent)), tone: 'text-positive' } : null;
    }
    if (share > 0) return { text: g.activity.youBorrowed(format(share)), tone: 'text-danger' };
    return { text: g.activity.notInvolved, tone: 'text-ink-subtle' };
  };

  return (
    <Card title={g.activity.title} padded={false}>
      {items.length === 0 ? (
        <p className="flex items-center gap-2 px-4 pb-5 pt-4 text-sm text-ink-subtle sm:px-5">
          <ReceiptText aria-hidden="true" className="h-4 w-4 shrink-0" />
          {g.activity.empty}
        </p>
      ) : (
        <div className="mt-4 border-t border-line">
          {days.map((day) => (
            <section key={day.date}>
              <h3 className="bg-sunken/60 px-4 py-1.5 text-xs font-medium text-ink-muted sm:px-5">
                {formatDayHeading(day.date)}
              </h3>
              <ul>
                {day.items.map((item) => {
                  if (item.kind === 'payment') {
                    const { payment } = item;
                    return (
                      <li
                        key={`p-${payment.id}`}
                        className="flex min-w-0 items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:px-5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-muted">
                          <ArrowRightLeft aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block truncate text-[0.9375rem] font-medium text-ink">
                            {g.activity.payment(
                              nameOf(payment.from),
                              payment.to === myId ? g.members.you : nameOf(payment.to),
                            )}
                          </span>
                          <span className="block text-[0.8125rem] text-ink-subtle">
                            {g.activity.paymentLabel}
                          </span>
                        </span>
                        <span className="tabular shrink-0 whitespace-nowrap text-[0.9375rem] font-semibold text-ink">
                          {format(payment.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          icon={<Trash2 />}
                          onClick={() => onDeletePayment(payment)}
                          className="hover:text-danger"
                        >
                          {g.payment.delete}
                        </Button>
                      </li>
                    );
                  }
                  const { expense } = item;
                  const position = myPosition(expense);
                  return (
                    <li key={`e-${expense.id}`} className="border-t border-line first:border-t-0">
                      <button
                        type="button"
                        onClick={() => onEditExpense(expense)}
                        className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sunken/60 sm:px-5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                          <ReceiptText aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block truncate text-[0.9375rem] font-medium text-ink">
                            {expense.title}
                          </span>
                          <span className="block truncate text-[0.8125rem] text-ink-subtle">
                            {g.activity.paidBy(nameOf(expense.paidBy), format(expense.amount))}
                          </span>
                        </span>
                        {position && (
                          <span
                            className={cn(
                              'tabular shrink-0 whitespace-nowrap text-right text-[0.8125rem] font-medium',
                              position.tone,
                            )}
                          >
                            {position.text}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
};
