import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="md"
      iconOnly
      onClick={toggleTheme}
      aria-pressed={isDark}
      className="theme-toggle"
      icon={isDark ? <Sun key="sun" /> : <Moon key="moon" />}
    >
      {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    </Button>
  );
};
