import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { STORAGE_KEYS } from '@/constants/settings';
import { selectTheme } from '@/redux/settings/settingsSelectors';
import { themeChanged } from '@/redux/settings/settingsSlice';

const persistTheme = (theme: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // Storage can be unavailable in private mode; the in-memory theme still applies.
  }
};

export const useThemeSync = (): void => {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const canvas = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas');
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', `rgb(${canvas.trim().split(/\s+/).join(',')})`);
      meta.removeAttribute('media');
    });
  }, [theme]);
};

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    dispatch(themeChanged(next));
  }, [dispatch, theme]);

  return { theme, toggleTheme };
};
