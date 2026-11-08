import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { ROUTES } from '@/constants/routes';
import { GroupActivityList } from '@/features/groups/GroupActivityList';
import { GroupBalances } from '@/features/groups/GroupBalances';
import { GroupExpenseForm } from '@/features/groups/GroupExpenseForm';
import { GroupFormModal } from '@/features/groups/GroupFormModal';
import { GroupMembers } from '@/features/groups/GroupMembers';
import { myMemberId } from '@/features/groups/groupUtils';
import { RecordPaymentModal } from '@/features/groups/RecordPaymentModal';
import { useGroupActivity } from '@/hooks/useGroupActivity';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectGroupById, selectGroupsStatus } from '@/redux/groups/groupsSlice';
import {
  deleteGroupExpenseThunk,
  deleteGroupPaymentThunk,
  deleteGroupThunk,
  leaveGroupThunk,
} from '@/redux/groups/groupsThunks';
import type { GroupExpense, GroupPayment, Transfer } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatCurrency, roundMoney } from '@/utils/currency';
import { groupTransfers, memberBalances } from '@/utils/groupBalances';

type Confirm =
  | { kind: 'deleteGroup' }
  | { kind: 'leave' }
  | { kind: 'deleteExpense'; expense: GroupExpense }
  | { kind: 'deletePayment'; payment: GroupPayment }
  | null;

export const GroupDetailPage = () => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const user = useAppSelector(selectAuthUser);
  const group = useAppSelector((state) => selectGroupById(state, groupId));
  const groupsStatus = useAppSelector(selectGroupsStatus);
  const { expenses, payments, loading, error } = useGroupActivity(group ? groupId : undefined);

  const [editingGroup, setEditingGroup] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{ open: boolean; expense: GroupExpense | null }>({
    open: false,
    expense: null,
  });
  const [payment, setPayment] = useState<{ open: boolean; suggestion: Transfer | null }>({
    open: false,
    suggestion: null,
  });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);

  const myId = group ? myMemberId(group, user?.uid) : null;
  const memberIds = useMemo(() => (group ? Object.keys(group.members) : []), [group]);
  const balances = useMemo(
    () => memberBalances(memberIds, expenses, payments),
    [memberIds, expenses, payments],
  );
  const transfers = useMemo(
    () => (group ? groupTransfers(group.simplifyDebts, memberIds, expenses, payments) : []),
    [group, memberIds, expenses, payments],
  );
  const busyMemberIds = useMemo(() => {
    const ids = new Set<string>();
    expenses.forEach((expense) => {
      ids.add(expense.paidBy);
      Object.keys(expense.shares).forEach((id) => ids.add(id));
    });
    payments.forEach((item) => {
      ids.add(item.from);
      ids.add(item.to);
    });
    return ids;
  }, [expenses, payments]);

  if (!group) {
    if (groupsStatus === 'idle' || groupsStatus === 'loading') return <Loader />;
    return (
      <EmptyState
        icon={<ArrowLeft />}
        title={g.detail.notFound}
        description=""
        action={
          <Link to={ROUTES.groups} className="font-medium text-accent hover:underline">
            {g.detail.back}
          </Link>
        }
      />
    );
  }

  const format = (amount: number) => formatCurrency(amount, group.currency);
  const total = roundMoney(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const myBalance = myId ? (balances[myId] ?? 0) : 0;
  const isCreator = group.createdBy === user?.uid;

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'deleteGroup') {
        await dispatch(deleteGroupThunk(group.id)).unwrap();
        toast.success(g.dialogs.deleted);
        navigate(ROUTES.groups);
      } else if (confirm.kind === 'leave') {
        await dispatch(leaveGroupThunk(group)).unwrap();
        toast.success(g.dialogs.left);
        navigate(ROUTES.groups);
      } else if (confirm.kind === 'deleteExpense') {
        await dispatch(
          deleteGroupExpenseThunk({ groupId: group.id, expenseId: confirm.expense.id }),
        ).unwrap();
        toast.success(g.expenseForm.deleted);
        setExpenseForm({ open: false, expense: null });
      } else if (confirm.kind === 'deletePayment') {
        await dispatch(
          deleteGroupPaymentThunk({ groupId: group.id, paymentId: confirm.payment.id }),
        ).unwrap();
        toast.success(g.payment.deleted);
      }
      setConfirm(null);
    } catch {
      toast.error(g.errors.delete);
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy = (() => {
    switch (confirm?.kind) {
      case 'deleteGroup':
        return {
          title: g.dialogs.deleteGroupTitle,
          message: g.dialogs.deleteGroupMessage(group.name),
          label: g.dialogs.deleteGroupConfirm,
        };
      case 'leave':
        return {
          title: g.dialogs.leaveTitle,
          message: g.dialogs.leaveMessage,
          label: g.dialogs.leaveConfirm,
        };
      case 'deleteExpense':
        return {
          title: g.dialogs.deleteExpenseTitle,
          message: g.dialogs.deleteExpenseMessage(confirm.expense.title),
          label: g.expenseForm.delete,
        };
      case 'deletePayment':
        return {
          title: g.dialogs.deletePaymentTitle,
          message: g.dialogs.deletePaymentMessage,
          label: g.payment.delete,
        };
      default:
        return { title: '', message: '', label: '' };
    }
  })();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link
        to={ROUTES.groups}
        className="-mb-2 inline-flex items-center gap-1.5 self-start rounded text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {g.detail.back}
      </Link>
      <PageHeader
        title={group.name}
        description={g.detail.totalSpent(format(total))}
        actions={
          <>
            <Button icon={<Plus />} onClick={() => setExpenseForm({ open: true, expense: null })}>
              {g.detail.addExpense}
            </Button>
            <Button
              variant="ghost"
              iconOnly
              icon={<Pencil />}
              onClick={() => setEditingGroup(true)}
            >
              {g.detail.edit}
            </Button>
            {isCreator ? (
              <Button
                variant="ghost"
                iconOnly
                icon={<Trash2 />}
                onClick={() => setConfirm({ kind: 'deleteGroup' })}
                className="hover:text-danger"
              >
                {g.detail.delete}
              </Button>
            ) : (
              <Button
                variant="ghost"
                iconOnly
                icon={<LogOut />}
                onClick={() => setConfirm({ kind: 'leave' })}
              >
                {g.detail.leave}
              </Button>
            )}
          </>
        }
      />

      {error && <InlineError message={error} />}
      {loading ? (
        <Loader />
      ) : (
        <>
          {myId && (
            <p
              className={cn(
                'tabular rounded-xl px-4 py-3 text-sm font-medium',
                Math.abs(myBalance) < 0.005
                  ? 'bg-sunken text-ink-muted'
                  : myBalance > 0
                    ? 'bg-accent-soft text-positive'
                    : 'bg-danger-soft text-danger',
              )}
            >
              {Math.abs(myBalance) < 0.005
                ? g.detail.youAreSettled
                : myBalance > 0
                  ? g.detail.youAreOwedTotal(format(myBalance))
                  : g.detail.youOweTotal(format(-myBalance))}
            </p>
          )}
          <GroupBalances
            group={group}
            transfers={transfers}
            myId={myId}
            onSettle={(suggestion) => setPayment({ open: true, suggestion })}
          />
          <GroupActivityList
            group={group}
            expenses={expenses}
            payments={payments}
            myId={myId}
            onEditExpense={(expense) => setExpenseForm({ open: true, expense })}
            onDeletePayment={(item) => setConfirm({ kind: 'deletePayment', payment: item })}
          />
          <GroupMembers group={group} myId={myId} busyMemberIds={busyMemberIds} />
        </>
      )}

      <GroupFormModal open={editingGroup} group={group} onClose={() => setEditingGroup(false)} />
      <GroupExpenseForm
        open={expenseForm.open}
        group={group}
        expense={expenseForm.expense}
        onClose={() => setExpenseForm({ open: false, expense: null })}
        onDelete={(expense) => setConfirm({ kind: 'deleteExpense', expense })}
      />
      <RecordPaymentModal
        open={payment.open}
        group={group}
        suggestion={payment.suggestion}
        onClose={() => setPayment({ open: false, suggestion: null })}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={confirmCopy.title}
        message={<p>{confirmCopy.message}</p>}
        confirmLabel={confirmCopy.label}
        loading={busy}
        onConfirm={() => void runConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};
