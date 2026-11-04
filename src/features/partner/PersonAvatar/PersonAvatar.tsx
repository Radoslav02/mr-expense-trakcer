import type { Person } from '@/types/partner';
import { cn } from '@/utils/cn';
import './PersonAvatar.css';

interface PersonAvatarProps {
  person: Person;
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const PersonAvatar = ({ person, name, size = 'md', className }: PersonAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'person-avatar inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
      person === 'me' ? 'bg-accent-soft text-accent' : 'bg-partner-soft text-partner',
      size === 'sm' ? 'h-6 w-6 text-[0.6875rem]' : 'h-9 w-9 text-sm',
      className,
    )}
  >
    {name.charAt(0).toUpperCase()}
  </span>
);
