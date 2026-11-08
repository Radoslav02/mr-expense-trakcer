import { generatePath } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { Group, GroupMember } from '@/types/group';

export const groupPath = (groupId: string) => generatePath(ROUTES.group, { groupId });

/** My member entry in a group, if I've joined it. */
export const myMemberId = (group: Group, uid: string | undefined): string | null =>
  Object.values(group.members).find((member) => member.uid && member.uid === uid)?.id ?? null;

/** Members in a stable order: me first, then by name. */
export const sortedMembers = (group: Group, myId: string | null): GroupMember[] =>
  Object.values(group.members).sort((a, b) =>
    a.id === myId ? -1 : b.id === myId ? 1 : a.name.localeCompare(b.name),
  );
