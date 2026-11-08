import {
  HeartHandshake,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Messages } from '@/i18n';
import { ROUTES, type AppRoute } from './routes';

export interface NavItem {
  to: AppRoute;
  /** Key into `t.nav`. */
  labelKey: keyof Messages['nav'];
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: ROUTES.dashboard, labelKey: 'overview', icon: LayoutDashboard },
  { to: ROUTES.expenses, labelKey: 'expenses', icon: ReceiptText },
  { to: ROUTES.together, labelKey: 'together', icon: HeartHandshake },
  { to: ROUTES.groups, labelKey: 'groups', icon: Users },
  { to: ROUTES.savings, labelKey: 'savings', icon: PiggyBank },
  { to: ROUTES.categories, labelKey: 'categories', icon: Tags },
  { to: ROUTES.settings, labelKey: 'settings', icon: Settings },
];

/** Phone bottom tabs. Together only shows once a partner is linked. */
export const MOBILE_TABS: readonly (NavItem & { needsPartner?: boolean })[] = [
  { to: ROUTES.dashboard, labelKey: 'overview', icon: LayoutDashboard },
  { to: ROUTES.expenses, labelKey: 'expenses', icon: ReceiptText },
  { to: ROUTES.together, labelKey: 'together', icon: HeartHandshake, needsPartner: true },
  { to: ROUTES.groups, labelKey: 'groups', icon: Users },
];

/** Phone menu (behind the ☰ button). */
export const MOBILE_MENU: readonly NavItem[] = [
  { to: ROUTES.savings, labelKey: 'savings', icon: PiggyBank },
  { to: ROUTES.categories, labelKey: 'categories', icon: Tags },
  { to: ROUTES.settings, labelKey: 'settings', icon: Settings },
];
