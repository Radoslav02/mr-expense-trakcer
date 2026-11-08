import type { Messages } from '../en';
import { pluralSr } from '../plural';

const characters = (count: number) => `${count} ${pluralSr(count, 'znak', 'znaka', 'znakova')}`;

export const auth: Messages['auth'] = {
  orWithEmail: 'ili putem e-pošte',
  continueWithGoogle: 'Nastavi preko Google-a',
  name: 'Ime',
  email: 'E-pošta',
  password: 'Lozinka',
  signIn: 'Prijavi se',
  createAccount: 'Napravi nalog',
  checkingSession: 'Proveravamo prijavu',
  passwordHint: (min: number) => `Najmanje ${characters(min)}.`,
  validation: {
    nameRequired: 'Reci nam kako da te zovemo.',
    emailInvalid: 'Unesi ispravnu adresu e-pošte.',
    passwordRequired: 'Unesi lozinku.',
    passwordTooShort: (min: number) => `Koristi bar ${characters(min)}.`,
  },
  login: {
    title: 'Zdravo opet',
    subtitle: 'Prijavi se i vidi gde ti je otišao novac ovog meseca.',
    newHere: 'Prvi put si ovde?',
    createAccountLink: 'Napravi nalog',
  },
  register: {
    title: 'Napravi svoj nalog',
    subtitle: 'Dobićeš osam početnih kategorija koje uvek možeš da promeniš.',
    haveAccount: 'Već imaš nalog?',
    signInLink: 'Prijavi se',
  },
  failed: {
    loadAccount: 'Nismo uspeli da učitamo tvoj nalog.',
    register: 'Nismo uspeli da napravimo tvoj nalog.',
    signIn: 'Nismo uspeli da te prijavimo.',
    google: 'Prijava preko Google-a nije uspela.',
    signOut: 'Nismo uspeli da te odjavimo.',
    generic: 'Prijava nije uspela.',
  },
  errors: {
    invalidCredential: 'E-pošta ili lozinka nisu tačni.',
    invalidEmail: 'Ta adresa e-pošte ne izgleda ispravno.',
    userNotFound: 'Nijedan nalog ne koristi ovu e-poštu.',
    emailInUse: 'Nalog sa ovom e-poštom već postoji. Probaj da se prijaviš.',
    weakPassword: (min: number) => `Koristi lozinku od najmanje ${characters(min)}.`,
    tooManyRequests: 'Previše pokušaja. Sačekaj minut pa probaj ponovo.',
    popupClosed: 'Prozor za Google prijavu je zatvoren pre nego što je prijava završena.',
    popupBlocked:
      'Pregledač je blokirao prozor za Google prijavu. Dozvoli iskačuće prozore i probaj ponovo.',
    networkFailed: 'Greška na mreži. Proveri vezu i probaj ponovo.',
    operationNotAllowed: 'Ovaj način prijave još nije uključen u Firebase-u.',
    unauthorizedDomain:
      'Prijava sa ove adrese još nije dozvoljena. Dodaj je u Firebase → Authentication → Settings → Authorized domains.',
  },
};
