import type { Messages } from '../en';
import { pluralSr } from '../plural';

// Past-tense verbs in Serbian carry gender, and names can't be declined generically, so these
// strings use present tense ("trošiš") and "label: name" forms.
export const partner: Messages['partner'] = {
  page: {
    title: 'Zajedno',
    descriptionConnected: (partner: string) => `Ti i ${partner}, rame uz rame.`,
    description: 'Uporedi potrošnju sa partnerom.',
    live: 'Uživo',
    checkingLink: 'Proveravamo vezu sa partnerom',
    currencyMismatch: (partner: string, theirs: string, mine: string) =>
      `${partner} unosi iznose u valuti ${theirs}, a ti koristiš ${mine}. Iznosi se porede onako kako su uneti, bez konverzije.`,
  },
  connect: {
    title: 'Partner',
    description:
      'Deli troškove sa jednom osobom. Vidite troškove jedno drugog, ali svako menja samo svoje.',
    sharingWith: (partner: string) => `Deliš troškove sa: ${partner}`,
    stopSharing: 'Prestani da deliš',
    pendingBefore: 'Deliš troškove sa',
    pendingMiddle: (appName: string) =>
      `. Da bi se povezivanje završilo, neka se ta osoba prijavi u ${appName} i doda`,
    pendingAfter: 'u Podešavanja → Partner.',
    cancelInvite: 'Otkaži poziv',
    incoming: (email: string) => `(${email}) deli svoje troškove s tobom.`,
    shareBack: 'Podeli i ti',
    emailLabel: 'Partnerov imejl',
    emailPlaceholder: 'partner@primer.rs',
    share: 'Podeli moje troškove',
    confirmStopTitle: (partner: string) => `Prestani da deliš troškove sa: ${partner}?`,
    confirmStopMessage: (partner: string) =>
      `${partner} više neće videti tvoje troškove, a stranica Zajedno biće prazna dok ponovo ne podeliš.`,
    shared: 'Tvoji troškovi su sada podeljeni.',
    stopped: 'Više ne deliš svoje troškove.',
  },
  export: {
    button: 'Izvoz',
    title: 'Izvoz zajedničkog u PDF',
    description: 'Preuzmi zajedničke troškove vas oboje za bilo koji period.',
    from: 'Od',
    to: 'Do',
    whose: 'Čiji troškovi',
    both: 'Oboje',
    mine: 'Samo moji',
    theirs: (name: string) => `Samo: ${name}`,
    category: 'Kategorija',
    allCategories: 'Sve kategorije',
    download: 'Preuzmi PDF',
    preparing: 'Pripremam…',
    nothing: 'Nema troškova za ovaj izbor. Izaberi druge datume ili kategoriju.',
    rangeInvalid: 'Početni datum mora biti pre krajnjeg ili isti.',
    failed: 'PDF nije mogao da se napravi. Pokušaj ponovo.',
    fileName: 'zajedno',
    pdf: {
      title: (me: string, partner: string) => `${me} i ${partner}`,
      period: (from: string, to: string) => `${from} – ${to}`,
      filters: (whose: string, category: string) => `${whose} · ${category}`,
      date: 'Datum',
      item: 'Trošak',
      category: 'Kategorija',
      paidBy: 'Platio/la',
      amount: 'Iznos',
      parts: (me: string, mine: string, partner: string, theirs: string) =>
        `Podeljeno · ${me} ${mine} · ${partner} ${theirs}`,
      paidByName: (name: string) => `Platio/la: ${name}`,
      together: 'Zajedno',
      sharedCosts: 'Zajednički troškovi (podeljeni)',
      partOf: (name: string) => `Deo zajedničkih troškova: ${name}`,
      total: 'Ukupno',
      count: (count: number) => `${count} ${pluralSr(count, 'trošak', 'troška', 'troškova')}`,
      generated: (date: string) => `Napravljeno ${date}`,
      page: (page: number, pages: number) => `Strana ${page} od ${pages}`,
    },
  },
  validation: {
    emailRequired: 'Unesi partnerovu imejl adresu.',
    ownEmail: 'To je tvoj imejl.',
  },
  errors: {
    checkLink: 'Nismo uspeli da proverimo vezu sa partnerom.',
    needsEmailAccount: 'Prijavi se nalogom sa imejlom da bi delio troškove.',
    notSharingWithYou: 'Partner trenutno ne deli troškove s tobom.',
    loadSpending: 'Nismo uspeli da učitamo partnerove troškove.',
    share: 'Nismo uspeli da podelimo troškove sa partnerom.',
    stop: 'Nismo uspeli da prekinemo deljenje.',
    notConnected: 'Trenutno nisi povezan sa partnerom.',
    editNeedsShare: 'Partner prvo treba da podeli troškove s tobom da bi mogao da ih menjaš.',
    updateExpense: 'Nismo uspeli da izmenimo trošak.',
    noEmail: 'Tvoj nalog nema imejl adresu, pa ne može da se deli.',
  },
  split: {
    label: 'Ko koliko troši',
    nothingYet: 'Ovog meseca niko od vas još ništa nije potrošio.',
    same: 'Trošite potpuno isto.',
    youMore: (amount: string, partner: string) =>
      `Ovog meseca trošiš ${amount} više nego ${partner}.`,
    partnerMore: (partner: string, amount: string) =>
      `${partner} ovog meseca troši ${amount} više nego ti.`,
    barLabel: (me: string, meShare: string, partner: string, partnerShare: string) =>
      `${me} ${meShare}, ${partner} ${partnerShare} ukupne potrošnje`,
    together: (amount: string) => `Zajedno ${amount}`,
  },
  sharedCosts: {
    title: 'Zajednički troškovi',
    description: 'Ono što ovog meseca delite, kao namirnice',
    empty: () =>
      'Ovog meseca nema zajedničkih troškova. Kad dodaješ trošak, uključi podelu sa partnerom.',
    inExpenses: (count: number) => `u ${count} ${pluralSr(count, 'trošku', 'troška', 'troškova')}`,
    yourPart: 'Tvoj deo',
    partnerPart: (partner: string) => `Deo: ${partner}`,
    youBought: (amount: string) => `Kupljeno: ${amount}`,
    partnerBought: (_partner: string, amount: string) => `Kupljeno: ${amount}`,
  },
  categories: {
    title: 'Po kategorijama',
    description: 'Ko na šta troši, jedno pored drugog',
    emptyTitle: 'Još nema šta da se uporedi',
    emptyDescription: 'Kad neko od vas doda troškove ovog meseca, kategorije će se pojaviti ovde.',
  },
  trend: {
    title: (months: number) =>
      `${pluralSr(months, 'Poslednji', 'Poslednja', 'Poslednjih')} ${months} ${pluralSr(months, 'mesec', 'meseca', 'meseci')}`,
    description: 'Mesečni zbir za svako od vas',
    chartLabel: (months: number) =>
      `Grupisani stubičasti grafikon za ${pluralSr(months, 'poslednji', 'poslednja', 'poslednjih')} ${months} ${pluralSr(months, 'mesec', 'meseca', 'meseci')} za oboje`,
  },
  activity: {
    title: 'Ko je šta kupio',
    description: 'Svi troškovi vas oboje ovog meseca. Dodirni neki da ga izmeniš.',
    filterLabel: 'Prikaži troškove za',
    both: 'Oboje',
    emptyTitle: 'Ovde nema troškova',
    emptyDescription: 'Za ovaj mesec još ništa nije uneto.',
    editedByPartner: (partner: string) => `izmena: ${partner}`,
    editedByYou: 'tvoja izmena',
    editLabel: (title: string, amount: string, person: string) =>
      `Izmeni ${title}, ${amount}, platilac: ${person}`,
    split: 'Podeljeno',
    showMore: (count: number) => `Prikaži još ${count}`,
  },
};
