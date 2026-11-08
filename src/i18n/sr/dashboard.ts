import type { Messages } from '../en';
import { pluralSr } from '../plural';

export const dashboard: Messages['dashboard'] = {
  title: 'Pregled',
  description: 'Brz uvid u to gde ti odlazi novac.',
  addExpense: 'Dodaj trošak',
  summary: {
    spentThisMonth: 'Potrošeno ovog meseca',
    spentIn: (month: string) => `Potrošeno: ${month}`,
    lastMonth: 'Prošli mesec',
    noComparison: 'Nema troškova za poređenje',
    more: (percent: string) => `${percent} više nego ranije`,
    less: (percent: string) => `${percent} manje nego ranije`,
    dailyAverage: 'Dnevni prosek',
    daysSoFar: 'Za dosadašnje dane',
    wholeMonth: 'Za ceo mesec',
    largest: 'Najveći trošak',
    nothingYet: 'Još ništa nije uneto',
  },
  budget: {
    empty: 'Postavi mesečni budžet da vidiš koliko ti je još ostalo.',
    setBudget: 'Postavi budžet',
    monthly: 'Mesečni budžet',
    of: (budget: string) => `od ${budget}`,
    left: (amount: string) => `ostalo ${amount}`,
    over: (amount: string) => `${amount} preko budžeta`,
    used: (percent: string) => `iskorišćeno ${percent}`,
    progressLabel: 'Iskorišćen budžet',
    progressValue: (percent: string) => `Iskorišćeno ${percent} budžeta`,
  },
  moneyLeft: {
    empty: 'Dodaj mesečni prihod da vidiš koliko ti je novca ostalo.',
    addIncome: 'Dodaj prihod',
    title: 'Preostalo ovog meseca',
    income: 'Prihod',
    spent: 'Potrošeno',
    barLabel: (spent: string, income: string) => `Potrošeno ${spent} od ${income}`,
    barUpcoming: (amount: string) => `, još ${amount} za račune koji dolaze`,
    billsToCome: (count: number) =>
      `Još ${count} ${pluralSr(count, 'račun stiže', 'računa stižu', 'računa stiže')}`,
    shortAfterBills: (amount: string) => `nedostaje ${amount} posle računa`,
    leftAfterBills: (amount: string) => `ostaje ${amount} posle računa`,
  },
  pie: {
    title: 'Troškovi po kategorijama',
    description: 'Gde je otišao novac ovog meseca',
    emptyTitle: 'Nema troškova ovog meseca',
    emptyDescription: 'Dodaj trošak i ovde ćeš videti udeo njegove kategorije.',
    chartLabel: 'Kružni grafikon troškova po kategorijama',
    total: 'Ukupno',
  },
  trend: {
    title: (months: number) =>
      `${pluralSr(months, 'Poslednji', 'Poslednja', 'Poslednjih')} ${months} ${pluralSr(months, 'mesec', 'meseca', 'meseci')}`,
    description: (month: string) => `Mesečni zbirovi zaključno sa: ${month}`,
    chartLabel: (months: number) =>
      `Stubičasti grafikon zbirova za ${pluralSr(months, 'poslednji', 'poslednja', 'poslednjih')} ${months} ${pluralSr(months, 'mesec', 'meseca', 'meseci')}`,
  },
};
