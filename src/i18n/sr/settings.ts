import type { Messages } from '../en';

export const settings: Messages['settings'] = {
  title: 'Podešavanja',
  signedInAs: (email: string) => `Prijavljen nalog: ${email}`,
  languageTitle: 'Jezik',
  languageDescription: 'Čuva se na ovom uređaju.',
  validation: {
    budgetPositive: 'Budžet mora biti pozitivan broj, ili ostavi prazno.',
    incomePositive: 'Prihod mora biti pozitivan broj, ili ostavi prazno.',
  },
  money: {
    title: 'Novac',
    description: 'Kako se prikazuju iznosi, koliko zarađuješ i koliko planiraš da trošiš mesečno.',
    incomeLabel: 'Mesečni prihod',
    incomePlaceholder: 'Nije uneto',
    incomeHint: 'Koliko ti stiže svakog meseca. Vidiš samo ti.',
    currencyLabel: 'Valuta',
    preview: (amount: string) => `Primer: ${amount}`,
    budgetLabel: 'Mesečni budžet',
    budgetPlaceholder: 'Bez budžeta',
    budgetHint: 'Ostavi prazno da sakriješ traku budžeta.',
    saved: 'Podešavanja su sačuvana.',
  },
  currencies: {
    RSD: 'Srpski dinar (RSD)',
    EUR: 'Evro (EUR)',
    USD: 'Američki dolar (USD)',
    GBP: 'Britanska funta (GBP)',
    CHF: 'Švajcarski franak (CHF)',
    BAM: 'Konvertibilna marka (BAM)',
    HUF: 'Mađarska forinta (HUF)',
    MKD: 'Makedonski denar (MKD)',
  },
  appearance: {
    title: 'Izgled',
    description: 'Čuva se na ovom uređaju.',
    theme: 'Tema',
    light: 'Svetla',
    dark: 'Tamna',
  },
  install: {
    title: 'Instaliraj aplikaciju',
    description: 'Koristi je kao običnu aplikaciju na telefonu.',
    installed: (appName: string) => `${appName} je instaliran na ovom uređaju.`,
    prompt: (appName: string) =>
      `Dodaj ${appName} na početni ekran. Otvara se preko celog ekrana i radi bez interneta.`,
    installButton: 'Instaliraj aplikaciju',
    iosStep1Before: 'Dodirni',
    iosShare: 'Deli',
    iosStep1After: 'Deli na traci u Safariju.',
    iosStep2Before: 'Izaberi',
    iosAddToHomeScreen: 'Dodaj na početni ekran',
    iosStep2After: ', pa dodirni Dodaj.',
    unsupported: (appName: string) =>
      `Otvori ${appName} u Chrome-u na Androidu ili u Safariju na iPhone-u da ga dodaš na početni ekran.`,
  },
  errors: {
    load: 'Nismo uspeli da učitamo tvoja podešavanja.',
    save: 'Nismo uspeli da sačuvamo tvoja podešavanja.',
  },
};
