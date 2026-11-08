import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { logoutUser } from '@/redux/auth/authThunks';
import { Brand } from '../Brand';
import { ThemeToggle } from '../ThemeToggle';
import './Header.css';

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const Header = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const user = useAppSelector(selectAuthUser);
  const name = user?.displayName || user?.email || t.common.account;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <header className="header sticky top-0 z-20 border-b border-line bg-canvas/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <div className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
          <div className="flex items-center gap-2.5 pl-1">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
              >
                {initialsOf(name)}
              </span>
            )}
            <span className="hidden max-w-[12rem] truncate text-sm font-medium text-ink sm:block">
              {name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut />}
            onClick={handleLogout}
            className="ml-1"
          >
            <span className="hidden sm:inline">{t.common.signOut}</span>
            <span className="sr-only sm:hidden">{t.common.signOut}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
