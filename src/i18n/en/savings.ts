import { pluralEn } from '../plural';

export const savings = {
  title: 'Savings',
  description: 'Keep an eye on what you put aside.',
  add: 'Add saving',
  edit: 'Edit saving',
  totals: {
    mine: 'Balance',
    thisYear: 'Saved this year',
    together: 'Together balance',
    togetherHint: (partner: string) => `Your shared savings and ${partner}’s`,
  },
  empty: {
    title: 'Nothing saved yet',
    description:
      'When money is left over after a month, or you put some aside, note it here to watch it grow.',
  },
  count: (count: number) => `${count} ${pluralEn(count, 'saving', 'savings')}`,
  leftoverBadge: 'Left from income',
  takeOut: 'Take out',
  takenOut: 'Taken out',
  form: {
    kind: 'Type',
    deposit: 'Put in',
    withdrawal: 'Take out',
    withdrawalTitle: 'Taken from',
    withdrawalPlaceholder: 'e.g. Savings account',
    note: 'Why',
    notePlaceholder: 'e.g. Lost wallet, car repair',
    balanceHint: (amount: string) => `Current balance: ${amount}`,
    takenAdded: 'Withdrawal saved.',
    source: 'Amount',
    leftover: 'What’s left this month',
    custom: 'Custom amount',
    leftoverHint: (month: string, amount: string) => `Left from your ${month} income: ${amount}`,
    nothingLeft: (month: string) =>
      `Nothing is left from your ${month} income yet, so enter a custom amount.`,
    amount: 'Amount',
    date: 'Date',
    title: 'Where is it kept?',
    titlePlaceholder: 'e.g. Savings account, cash at home',
    delete: 'Delete saving',
    added: 'Saving added.',
    saved: 'Saving updated.',
    deleted: 'Saving deleted.',
  },
  validation: {
    titleRequired: 'Say where it’s kept.',
    amountPositive: 'Amount must be greater than 0.',
    overBalance: (amount: string) => `You can take out at most ${amount}.`,
  },
  dialogs: {
    deleteTitle: 'Delete this saving?',
    deleteMessage: (title: string) => `“${title}” will be removed. This can’t be undone.`,
  },
  errors: {
    load: 'Could not load your savings.',
    save: 'Could not save. Try again.',
    delete: 'Could not delete. Try again.',
  },
};
