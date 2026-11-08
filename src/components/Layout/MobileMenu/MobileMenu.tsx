import { NavLink } from 'react-router-dom';
import { ChevronRight, Languages } from 'lucide-react';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Modal } from '@/components/Modal';
import { MOBILE_MENU } from '@/constants/navigation';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** The phone menu behind the ☰ button: the pages that aren't bottom tabs, and the language. */
export const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onClose} size="sm" title={t.nav.menu}>
      <nav aria-label={t.nav.menu} className="-mx-2 pb-2">
        <ul className="flex flex-col gap-0.5">
          {MOBILE_MENU.map(({ to, labelKey, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex h-12 items-center gap-3 rounded-lg px-2 text-[0.9375rem] font-medium transition-colors hover:bg-sunken',
                    isActive ? 'text-accent' : 'text-ink',
                  )
                }
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="flex-1">{t.nav[labelKey]}</span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 pt-4">
          <span className="flex items-center gap-3 text-[0.9375rem] font-medium text-ink">
            <Languages aria-hidden="true" className="h-5 w-5 shrink-0" />
            {t.settings.languageTitle}
          </span>
          <LanguageSwitch name="language-menu" />
        </div>
      </nav>
    </Modal>
  );
};
