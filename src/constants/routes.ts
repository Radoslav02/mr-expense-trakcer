export const ROUTES = {
  dashboard: '/',
  expenses: '/expenses',
  together: '/together',
  groups: '/groups',
  group: '/groups/:groupId',
  categories: '/categories',
  settings: '/settings',
  login: '/login',
  register: '/register',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
