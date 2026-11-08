import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { EMAIL_PATTERN } from '@/hooks/useAuthForm';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { useAppDispatch } from '@/app/hooks';
import { addGroupMemberThunk, removeGroupMemberThunk } from '@/redux/groups/groupsThunks';
import type { Group, GroupMember } from '@/types/group';
import { normalizeEmail } from '@/utils/comparison';
import { sortedMembers } from './groupUtils';
import { MemberAvatar } from './MemberAvatar';

interface GroupMembersProps {
  group: Group;
  myId: string | null;
  /** Members with expenses or payments can't be removed. */
  busyMemberIds: ReadonlySet<string>;
}

export const GroupMembers = ({ group, myId, busyMemberIds }: GroupMembersProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const members = sortedMembers(group, myId);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    const normalized = email.trim() ? normalizeEmail(email) : '';
    const next: typeof errors = {};
    if (!trimmed) next.name = g.validation.personNameRequired;
    if (normalized && !EMAIL_PATTERN.test(normalized)) next.email = g.validation.emailInvalid;
    if (
      (normalized && members.some((member) => member.email === normalized)) ||
      (normalized && group.invitedEmails.includes(normalized))
    ) {
      next.email = g.validation.personExists;
    }
    setErrors(next);
    if (next.name || next.email) return;
    setSaving(true);
    try {
      await dispatch(
        addGroupMemberThunk({
          groupId: group.id,
          member: { name: trimmed, ...(normalized ? { email: normalized } : {}) },
        }),
      ).unwrap();
      toast.success(g.members.added(trimmed));
      setName('');
      setEmail('');
      setAdding(false);
    } catch {
      toast.error(g.errors.save);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (member: GroupMember) => {
    try {
      await dispatch(removeGroupMemberThunk({ groupId: group.id, member })).unwrap();
      toast.success(g.members.removed(member.name));
    } catch {
      toast.error(g.errors.save);
    }
  };

  const status = (member: GroupMember) =>
    member.id === myId
      ? g.members.you
      : member.uid
        ? null
        : member.email
          ? g.members.invited
          : g.members.nameOnly;

  return (
    <Card
      title={g.members.title}
      padded={false}
      actions={
        !adding && (
          <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => setAdding(true)}>
            {g.members.add}
          </Button>
        )
      }
    >
      <ul className="mt-4 border-t border-line">
        {members.map((member) => {
          const label = status(member);
          const removable = member.id !== myId && !busyMemberIds.has(member.id);
          return (
            <li
              key={member.id}
              className="flex min-w-0 items-center gap-3 px-4 py-2.5 sm:px-5 [&+&]:border-t [&+&]:border-line"
            >
              <MemberAvatar member={member} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{member.name}</span>
                {(label || member.email) && (
                  <span className="block truncate text-[0.8125rem] text-ink-subtle">
                    {[label, member.email].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
              {member.id !== myId && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  icon={<X />}
                  disabled={!removable}
                  title={removable ? undefined : g.members.removeBlocked}
                  onClick={() => void remove(member)}
                  className="hover:text-danger"
                >
                  {g.form.remove(member.name)}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {adding && (
        <form
          onSubmit={handleAdd}
          noValidate
          className="grid gap-2 border-t border-line px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start sm:px-5"
        >
          <Input
            label={g.form.personName}
            hideLabel
            placeholder={g.form.personName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            wrapperClassName="min-w-0"
          />
          <Input
            label={g.form.personEmail}
            hideLabel
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder={g.form.personEmail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            wrapperClassName="min-w-0"
          />
          <div className="flex gap-2">
            <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
              {g.form.add}
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)} disabled={saving}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};
