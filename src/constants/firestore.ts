export const COLLECTIONS = {
  users: 'users',
  categories: 'categories',
  expenses: 'expenses',
  /** Owner-only: partners can't read these. */
  privateCategories: 'privateCategories',
  privateExpenses: 'privateExpenses',
  recurring: 'recurring',
  private: 'private',
  partnerInvites: 'partnerInvites',
} as const;

export const PRIVATE_DOCS = {
  finance: 'finance',
} as const;

export const PROFILE_FIELDS = {
  partnerEmail: 'partnerEmail',
} as const;

export const EXPENSE_FIELDS = {
  categoryId: 'categoryId',
  date: 'date',
} as const;
