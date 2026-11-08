import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { recordGroupPaymentThunk } from '@/redux/groups/groupsThunks';
import type { Group, Transfer } from '@/types/group';
import { roundMoney } from '@/utils/currency';
import { todayKey } from '@/utils/dates';
import { parseAmount } from '@/utils/validation';
import { myMemberId, sortedMembers } from './groupUtils';

interface RecordPaymentModalProps {
  open: boolean;
  group: Group;
  /** Prefilled from a "who owes whom" row. */
  suggestion?: Transfer | null;
  onClose: () => void;
}

const FORM_ID = 'group-payment-form';

export const RecordPaymentModal = ({
  open,
  group,
  suggestion = null,
  onClose,
}: RecordPaymentModalProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const myId = myMemberId(group, user?.uid);
  const members = sortedMembers(group, myId);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey());
  const [errors, setErrors] = useState<{ people?: string; amount?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFrom(suggestion?.from ?? myId ?? members[0]?.id ?? '');
    setTo(suggestion?.to ?? members.find((member) => member.id !== myId)?.id ?? '');
    setAmount(suggestion ? String(suggestion.amount) : '');
    setDate(todayKey());
    setErrors({});
    // Reset only when opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, suggestion]);

  const options = members.map((member) => ({
    value: member.id,
    label: member.id === myId ? `${member.name} (${g.members.you})` : member.name,
  }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = parseAmount(amount);
    const next: typeof errors = {};
    if (from === to) next.people = g.validation.samePerson;
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) {
      next.amount = g.validation.amountPositive;
    }
    setErrors(next);
    if (next.people || next.amount || !user) return;
    setSaving(true);
    try {
      await dispatch(
        recordGroupPaymentThunk({
          groupId: group.id,
          input: { from, to, amount: roundMoney(value), date },
        }),
      ).unwrap();
      toast.success(g.payment.recorded);
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
      size="sm"
      title={g.payment.title}
      description={g.payment.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {g.payment.save}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pb-2">
        <Select
          label={g.payment.from}
          value={from}
          options={options}
          onChange={(event) => setFrom(event.target.value)}
          error={errors.people}
        />
        <Select
          label={g.payment.to}
          value={to}
          options={options}
          onChange={(event) => setTo(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={g.payment.amount}
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={errors.amount}
            trailing={group.currency}
            className="tabular"
            wrapperClassName="min-w-0"
          />
          <Input
            label={g.payment.date}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            wrapperClassName="min-w-0"
          />
        </div>
      </form>
    </Modal>
  );
};
