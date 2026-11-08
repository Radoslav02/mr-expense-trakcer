import type { GroupMember } from '@/types/group';
import { cn } from '@/utils/cn';

const AVATAR_COLORS = [
  'bg-accent-soft text-accent',
  'bg-partner-soft text-partner',
  'bg-[#fdecd9] text-[#b5591a] dark:bg-[#3d2a17] dark:text-[#f0a868]',
  'bg-[#f6e3ef] text-[#a8326f] dark:bg-[#3b1c2d] dark:text-[#f08cc0]',
  'bg-[#e1eef9] text-[#2d6ea6] dark:bg-[#17293b] dark:text-[#7db8ec]',
];

const colorFor = (id: string) =>
  AVATAR_COLORS[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLORS.length];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const MemberAvatar = ({
  member,
  size = 'md',
  className,
}: {
  member: Pick<GroupMember, 'id' | 'name'>;
  size?: 'sm' | 'md';
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full font-semibold',
      size === 'sm' ? 'h-6 w-6 text-[0.6875rem]' : 'h-9 w-9 text-sm',
      colorFor(member.id),
      className,
    )}
  >
    {initials(member.name)}
  </span>
);
