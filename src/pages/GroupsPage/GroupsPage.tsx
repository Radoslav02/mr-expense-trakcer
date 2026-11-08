import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { GroupCard } from '@/features/groups/GroupCard';
import { GroupFormModal } from '@/features/groups/GroupFormModal';
import { InvitationList } from '@/features/groups/InvitationList';
import { useI18n } from '@/i18n';
import { selectGroups, selectGroupsError, selectGroupsStatus } from '@/redux/groups/groupsSlice';

export const GroupsPage = () => {
  const { t } = useI18n();
  const g = t.groups;
  const groups = useAppSelector(selectGroups);
  const status = useAppSelector(selectGroupsStatus);
  const error = useAppSelector(selectGroupsError);
  const [creating, setCreating] = useState(false);
  const loading = status === 'idle' || status === 'loading';

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-5"
      style={{ animation: 'page-in 220ms var(--ease-out)' }}
    >
      <PageHeader
        title={g.title}
        description={g.description}
        actions={
          <Button icon={<Plus />} onClick={() => setCreating(true)}>
            {g.newGroup}
          </Button>
        }
      />
      {error && <InlineError message={error} onRetry={() => window.location.reload()} />}
      <InvitationList />
      {loading ? (
        <Loader />
      ) : groups.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={<Users />}
            title={g.empty.title}
            description={g.empty.description}
            action={
              <Button icon={<Plus />} onClick={() => setCreating(true)}>
                {g.newGroup}
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </ul>
      )}
      <GroupFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
};
