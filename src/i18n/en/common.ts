import { pluralEn } from '../plural';

export const common = {
  cancel: 'Cancel',
  save: 'Save',
  saveChanges: 'Save changes',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  new: 'New',
  retry: 'Try again',
  loading: 'Loading',
  optional: '(optional)',
  you: 'You',
  partner: 'Partner',
  today: 'Today',
  yesterday: 'Yesterday',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  month: 'Month',
  closeDialog: 'Close dialog',
  skipToContent: 'Skip to content',
  signOut: 'Sign out',
  account: 'Account',
  uncategorized: 'Uncategorized',
  dismissNotification: 'Dismiss notification',
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',
  goToOverview: (appName: string) => `${appName}, go to overview`,
  notFound: {
    title: 'This page doesn’t exist',
    description: 'The link may be old, or the address has a typo.',
    backToOverview: 'Back to overview',
  },
  errors: {
    generic: 'Something went wrong. Try again.',
    signedOut: 'You are signed out. Sign in again to continue.',
    permissionDenied:
      'Firestore refused access. Publish the rules from firestore.rules in the Firebase console, then try again.',
    unavailable: 'The server is unreachable. Check your connection and retry.',
  },
  expenseCount: (count: number) => `${count} ${pluralEn(count, 'expense', 'expenses')}`,
  /** 1 → "1st", 22 → "22nd". */
  ordinal: (day: number) => {
    const tens = day % 100;
    if (tens >= 11 && tens <= 13) return `${day}th`;
    return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`;
  },
  /** date-fns patterns. */
  dateFormats: {
    month: 'MMMM yyyy',
    shortMonth: 'MMM',
    dayHeading: 'EEEE, d MMMM',
    shortDate: 'd MMM yyyy',
    /** Day and short month, for week ranges: "3 Nov". */
    dayMonth: 'd MMM',
    /**
     * Month names to use right after a day number, when the language inflects them there
     * (Serbian: "5. novembra"). `null` keeps the locale's own month names.
     */
    monthAfterDay: null as string[] | null,
  },
  language: {
    en: 'English',
    sr: 'Srpski',
  },
};
