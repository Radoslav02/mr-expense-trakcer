import type { CategoryInput } from '@/types/category';

export const OTHER_CATEGORY_ID = 'default-other';

export interface DefaultCategory extends CategoryInput {
  id: string;
}

export const DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  { id: 'default-food', name: 'Food', color: '#e07a3f', icon: 'utensils' },
  { id: 'default-transport', name: 'Transport', color: '#3b82c4', icon: 'car' },
  { id: 'default-bills', name: 'Bills', color: '#8b5cf6', icon: 'receipt' },
  { id: 'default-rent', name: 'Rent', color: '#2f8f6b', icon: 'home' },
  { id: 'default-shopping', name: 'Shopping', color: '#d94f7a', icon: 'shopping-bag' },
  { id: 'default-health', name: 'Health', color: '#d64545', icon: 'heart-pulse' },
  { id: 'default-entertainment', name: 'Entertainment', color: '#c9a227', icon: 'clapperboard' },
  { id: OTHER_CATEGORY_ID, name: 'Other', color: '#7a7f7c', icon: 'circle-dashed' },
];

export const CATEGORY_COLOR_OPTIONS: readonly string[] = [
  '#e07a3f',
  '#c9a227',
  '#2f8f6b',
  '#1f9aa8',
  '#3b82c4',
  '#5b6ad0',
  '#8b5cf6',
  '#d94f7a',
  '#d64545',
  '#7a7f7c',
];

export const UNCATEGORIZED_COLOR = '#9a9e9b';
