import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectInvitations } from '@/redux/groups/groupsSlice';
import { answerInvitationThunk } from '@/redux/groups/groupsThunks';
import type { Group } from '@/types/group';

/** Groups I've been invited to, with join and decline. */
export const InvitationList = () => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const invitations = useAppSelector(selectInvitations);
  const [busy, setBusy] = useState<string | null>(null);

  if (invitations.length === 0 || !user) return null;

  const answer = async (group: Group, join: boolean) => {
    setBusy(group.id);
    try {
      await dispatch(answerInvitationThunk({ group, join })).unwrap();
      toast.success(join ? g.invitations.joined(group.name) : g.invitations.declined);
    } catch {
      toast.error(g.errors.save);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title={g.invitations.title} padded={false}>
      <ul className="mt-4 border-t border-line">
        {invitations.map((group) => (
          <li
            key={group.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5 [&+&]:border-t [&+&]:border-line"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-partner-soft text-partner">
              <Mail aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-medium text-ink">
                {group.name}
              </span>
              <span className="block truncate text-[0.8125rem] text-ink-subtle">
                {g.invitations.invitedBy(group.members[group.createdBy]?.name ?? '?')}
              </span>
            </span>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={busy !== null}
                onClick={() => void answer(group, false)}
              >
                {g.invitations.decline}
              </Button>
              <Button
                size="sm"
                loading={busy === group.id}
                disabled={busy !== null && busy !== group.id}
                onClick={() => void answer(group, true)}
              >
                {g.invitations.join}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
