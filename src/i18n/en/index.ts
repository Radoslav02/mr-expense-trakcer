import { common } from './common';
import { nav } from './nav';
import { auth } from './auth';
import { expenses } from './expenses';
import { categories } from './categories';
import { dashboard } from './dashboard';
import { partner } from './partner';
import { settings } from './settings';
import { groups } from './groups';

/** English is the source of truth: every other language must match this shape. */
export const en = { common, nav, auth, expenses, categories, dashboard, partner, settings, groups };

export type Messages = typeof en;
