import { pluralEn } from '../plural';

export const categories = {
  title: 'Categories',
  pageDescription:
    'Shared categories are visible to your partner too; private ones are only yours. Deleted ones hand their expenses to Other.',
  defaultBadge: 'Default',
  noExpenses: 'No expenses',
  loadingList: 'Loading categories',
  manager: {
    sharedTitle: 'Shared categories',
    sharedDescription: (partner: string) =>
      `You and ${partner} both see these. Changes show up for both of you.`,
    soloDescription:
      'Used for your expenses. If you connect a partner, these are shared with them.',
    privateTitle: 'Private categories',
    privateDescription: 'Only you see these. They’re for private expenses.',
    privateEmpty:
      'No private categories yet. They’re only for your private expenses and only you see them.',
    emptyTitle: 'No categories yet',
    emptyDescription: 'Categories group your spending so the overview can show where money goes.',
    create: 'Create a category',
  },
  row: {
    edit: (name: string) => `Edit ${name}`,
    delete: (name: string) => `Delete ${name}`,
    protected: (other: string) => `${other} collects reassigned expenses and cannot be deleted`,
  },
  form: {
    editTitle: 'Edit category',
    newTitle: 'New category',
    newPrivateTitle: 'New private category',
    privateNote: 'Only you can see this category. Use it for your private expenses.',
    sharedNote: (partner: string) => `Shared with ${partner}: it shows up in both your lists.`,
    name: 'Name',
    color: 'Color',
    icon: 'Icon',
    create: 'Create category',
    updated: 'Category updated.',
    created: (name: string) => `“${name}” created.`,
  },
  deleteDialog: {
    title: (name: string) => `Delete ${name}?`,
    fallbackName: 'category',
    confirm: 'Delete category',
    confirmReassign: 'Delete and reassign',
    partnerToo: 'This removes it for your partner too. ',
    inUse: (count: number) =>
      `${count} ${pluralEn(count, 'expense uses', 'expenses use')} this category.`,
    /** Around the Other category's name: "They will be moved to <Other> so nothing is lost." */
    movedBefore: 'They will be moved to ',
    movedAfter: ' so nothing is lost.',
    unused: 'No expenses use this category. This can’t be undone.',
    deleted: (name: string) => `Deleted “${name}”.`,
    deletedAndMoved: (name: string, count: number, other: string) =>
      `Deleted “${name}” and moved ${count} ${pluralEn(count, 'expense', 'expenses')} to ${other}.`,
  },
  errors: {
    load: 'Could not load categories.',
    create: 'Could not create the category.',
    update: 'Could not update the category.',
    delete: 'Could not delete the category.',
    otherProtected: (other: string) =>
      `“${other}” collects reassigned expenses, so it cannot be deleted.`,
  },
  /** Names for the color swatches, keyed by lowercase hex value. */
  colors: {
    '#e07a3f': 'Orange',
    '#c9a227': 'Mustard',
    '#2f8f6b': 'Green',
    '#1f9aa8': 'Teal',
    '#3b82c4': 'Blue',
    '#5b6ad0': 'Indigo',
    '#8b5cf6': 'Purple',
    '#d94f7a': 'Pink',
    '#d64545': 'Red',
    '#7a7f7c': 'Gray',
  } as Record<string, string>,
  /** Names for the icon choices, keyed by icon id. */
  icons: {
    utensils: 'Utensils',
    car: 'Car',
    receipt: 'Receipt',
    home: 'Home',
    'shopping-bag': 'Shopping bag',
    'heart-pulse': 'Heart rate',
    clapperboard: 'Clapperboard',
    'circle-dashed': 'Dashed circle',
    coffee: 'Coffee',
    plane: 'Plane',
    gift: 'Gift',
    'graduation-cap': 'Graduation cap',
    dumbbell: 'Dumbbell',
    smartphone: 'Smartphone',
    'paw-print': 'Paw print',
    baby: 'Baby',
    'book-open': 'Open book',
    wrench: 'Wrench',
  } as Record<string, string>,
  validation: {
    nameRequired: 'Name the category.',
    nameTooLong: (max: number) => `Keep it under ${max} characters.`,
    nameTaken: 'A category with this name already exists.',
  },
  /** Built-in categories keep these names unless renamed. */
  defaults: {
    'default-food': 'Food',
    'default-transport': 'Transport',
    'default-bills': 'Bills',
    'default-rent': 'Rent',
    'default-shopping': 'Shopping',
    'default-health': 'Health',
    'default-entertainment': 'Entertainment',
    'default-other': 'Other',
  } as Record<string, string>,
};
