import type { Messages } from '../en';
import { pluralSr } from '../plural';

export const savings: Messages['savings'] = {
  title: 'Ušteđevina',
  description: 'Prati šta si odvojio/la sa strane.',
  add: 'Dodaj uštedu',
  edit: 'Izmeni uštedu',
  totals: {
    mine: 'Stanje',
    thisYear: 'Ušteđeno ove godine',
    together: 'Zajedničko stanje',
    togetherHint: (partner: string) => `Tvoje zajedničke uštede i uštede: ${partner}`,
  },
  empty: {
    title: 'Još ništa nije ušteđeno',
    description:
      'Kad ti posle meseca ostane novca ili nešto odvojiš, zapiši to ovde i prati kako raste.',
  },
  count: (count: number) => `${count} ${pluralSr(count, 'ušteda', 'uštede', 'ušteda')}`,
  leftoverBadge: 'Ostatak plate',
  takeOut: 'Podigni',
  takenOut: 'Podignuto',
  form: {
    kind: 'Vrsta',
    deposit: 'Uplati',
    withdrawal: 'Podigni',
    withdrawalTitle: 'Odakle je podignuto',
    withdrawalPlaceholder: 'npr. Štedni račun',
    note: 'Zašto',
    notePlaceholder: 'npr. Izgubljen novčanik, popravka auta',
    balanceHint: (amount: string) => `Trenutno stanje: ${amount}`,
    takenAdded: 'Podizanje je sačuvano.',
    source: 'Iznos',
    leftover: 'Ostatak ovog meseca',
    custom: 'Drugi iznos',
    leftoverHint: (month: string, amount: string) => `Ostatak prihoda za ${month}: ${amount}`,
    nothingLeft: (month: string) =>
      `Od prihoda za ${month} još ništa nije ostalo, pa unesi drugi iznos.`,
    amount: 'Iznos',
    date: 'Datum',
    title: 'Gde se čuva?',
    titlePlaceholder: 'npr. Štedni račun, keš kod kuće',
    delete: 'Obriši uštedu',
    added: 'Ušteda je dodata.',
    saved: 'Ušteda je izmenjena.',
    deleted: 'Ušteda je obrisana.',
  },
  validation: {
    titleRequired: 'Napiši gde se čuva.',
    amountPositive: 'Iznos mora biti veći od 0.',
    overBalance: (amount: string) => `Možeš da podigneš najviše ${amount}.`,
  },
  dialogs: {
    deleteTitle: 'Obrisati ovu uštedu?',
    deleteMessage: (title: string) => `„${title}” će biti uklonjena. Ovo ne može da se poništi.`,
  },
  errors: {
    load: 'Uštede nisu mogle da se učitaju.',
    save: 'Čuvanje nije uspelo. Pokušaj ponovo.',
    delete: 'Brisanje nije uspelo. Pokušaj ponovo.',
  },
};
