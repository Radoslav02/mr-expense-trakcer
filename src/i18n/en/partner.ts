import { pluralEn } from '../plural';

export const partner = {
  page: {
    title: 'Together',
    descriptionConnected: (partner: string) => `You and ${partner}, side by side.`,
    description: 'Compare spending with your partner.',
    live: 'Live',
    checkingLink: 'Checking your partner link',
    currencyMismatch: (partner: string, theirs: string, mine: string) =>
      `${partner} records amounts in ${theirs} and you use ${mine}. Amounts are compared as entered, without conversion.`,
  },
  connect: {
    title: 'Partner',
    description:
      'Share your spending with one person. You can see each other’s expenses but only edit your own.',
    sharingWith: (partner: string) => `Sharing with ${partner}`,
    stopSharing: 'Stop sharing',
    pendingBefore: 'You’re sharing with',
    pendingMiddle: (appName: string) => `. To finish, they sign in to ${appName} and add`,
    pendingAfter: 'under Settings → Partner.',
    cancelInvite: 'Cancel invite',
    incoming: (email: string) => `(${email}) shared their spending with you.`,
    shareBack: 'Share back',
    emailLabel: 'Partner’s email',
    emailPlaceholder: 'partner@example.com',
    share: 'Share my spending',
    confirmStopTitle: (partner: string) => `Stop sharing with ${partner}?`,
    confirmStopMessage: (partner: string) =>
      `${partner} will no longer see your expenses, and the Together page will be empty until you share again.`,
    shared: 'Your spending is now shared.',
    stopped: 'You stopped sharing your spending.',
  },
  validation: {
    emailRequired: 'Enter your partner’s email address.',
    ownEmail: 'That’s your own email.',
  },
  errors: {
    checkLink: 'Could not check your partner link.',
    needsEmailAccount: 'Sign in with an email account to share spending.',
    notSharingWithYou: 'Your partner isn’t sharing with you right now.',
    loadSpending: 'Could not load your partner’s spending.',
    share: 'Could not share with your partner.',
    stop: 'Could not stop sharing.',
    notConnected: 'You’re not connected to your partner right now.',
    editNeedsShare: 'Your partner needs to share with you before you can edit their expenses.',
    updateExpense: 'Could not update the expense.',
    noEmail: 'Your account has no email address, so it cannot be shared.',
  },
  split: {
    label: 'Who spent how much',
    nothingYet: 'Neither of you has spent anything this month yet.',
    same: 'You spent exactly the same.',
    youMore: (amount: string, partner: string) => `You spent ${amount} more than ${partner}.`,
    partnerMore: (partner: string, amount: string) => `${partner} spent ${amount} more than you.`,
    barLabel: (me: string, meShare: string, partner: string, partnerShare: string) =>
      `${me} ${meShare}, ${partner} ${partnerShare} of combined spending`,
    together: (amount: string) => `Together ${amount}`,
  },
  sharedCosts: {
    title: 'Shared costs',
    description: 'Things you split this month, like groceries',
    empty: (partner: string) =>
      `Nothing shared this month. Turn on “Split with ${partner}” when adding one.`,
    inExpenses: (count: number) => `in ${count} ${pluralEn(count, 'expense', 'expenses')}`,
    yourPart: 'Your part',
    partnerPart: (partner: string) => `${partner}’s part`,
    youBought: (amount: string) => `You bought ${amount}`,
    partnerBought: (partner: string, amount: string) => `${partner} bought ${amount}`,
  },
  categories: {
    title: 'By category',
    description: 'Who spends what, side by side',
    emptyTitle: 'Nothing to compare yet',
    emptyDescription: 'Once either of you adds expenses this month, categories line up here.',
  },
  trend: {
    title: (months: number) => `Last ${months} months`,
    description: 'Monthly totals for each of you',
    chartLabel: (months: number) =>
      `Grouped bar chart of the last ${months} months for both of you`,
  },
  activity: {
    title: 'Who bought what',
    description: 'Every expense from both of you this month. Tap one to edit it.',
    filterLabel: 'Show expenses from',
    both: 'Both',
    emptyTitle: 'No expenses here',
    emptyDescription: 'Nothing recorded for this month yet.',
    editedByPartner: (partner: string) => `edited by ${partner}`,
    editedByYou: 'edited by you',
    editLabel: (title: string, amount: string, person: string) =>
      `Edit ${title}, ${amount}, paid by ${person}`,
    split: 'Split',
    showMore: (count: number) => `Show ${count} more`,
  },
};
