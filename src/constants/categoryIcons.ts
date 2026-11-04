import {
  Baby,
  BookOpen,
  Car,
  CircleDashed,
  Clapperboard,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  PawPrint,
  Receipt,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Readonly<Record<string, LucideIcon>> = {
  utensils: Utensils,
  car: Car,
  receipt: Receipt,
  home: Home,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  clapperboard: Clapperboard,
  'circle-dashed': CircleDashed,
  coffee: Coffee,
  plane: Plane,
  gift: Gift,
  'graduation-cap': GraduationCap,
  dumbbell: Dumbbell,
  smartphone: Smartphone,
  'paw-print': PawPrint,
  baby: Baby,
  'book-open': BookOpen,
  wrench: Wrench,
};

export const DEFAULT_CATEGORY_ICON = 'circle-dashed';

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);
