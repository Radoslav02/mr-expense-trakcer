import type { ReactNode } from 'react';
import { Brand, ThemeToggle } from '@/components/Layout';
import './AuthShell.css';

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export const AuthShell = ({ title, subtitle, footer, children }: AuthShellProps) => (
  <div className="auth-shell flex min-h-dvh flex-col px-4 py-6 sm:px-6">
    <div className="flex items-center justify-between">
      <Brand />
      <ThemeToggle />
    </div>
    <main className="flex flex-1 items-center justify-center py-10">
      <div className="auth-shell__panel w-full max-w-[24rem]">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-subtle">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-center text-sm text-ink-subtle">{footer}</p>
      </div>
    </main>
  </div>
);
