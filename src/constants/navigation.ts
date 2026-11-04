import {
  HeartHandshake,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES, type AppRoute } from './routes';

export interface NavItem {
  to: AppRoute;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: ROUTES.dashboard, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.expenses, label: 'Expenses', icon: ReceiptText },
  { to: ROUTES.together, label: 'Together', icon: HeartHandshake },
  { to: ROUTES.categories, label: 'Categories', icon: Tags },
  { to: ROUTES.settings, label: 'Settings', icon: Settings },
];
