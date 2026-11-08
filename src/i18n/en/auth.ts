import { pluralEn } from '../plural';

const characters = (count: number) => `${count} ${pluralEn(count, 'character', 'characters')}`;

export const auth = {
  orWithEmail: 'or with email',
  continueWithGoogle: 'Continue with Google',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  signIn: 'Sign in',
  createAccount: 'Create account',
  checkingSession: 'Checking your session',
  passwordHint: (min: number) => `At least ${characters(min)}.`,
  validation: {
    nameRequired: 'Tell us what to call you.',
    emailInvalid: 'Enter a valid email address.',
    passwordRequired: 'Enter your password.',
    passwordTooShort: (min: number) => `Use at least ${characters(min)}.`,
  },
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to see where your money went this month.',
    newHere: 'New here?',
    createAccountLink: 'Create an account',
  },
  register: {
    title: 'Create your account',
    subtitle: 'We’ll set you up with eight starter categories you can change anytime.',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
  },
  /** Fallbacks when an error has no better message. */
  failed: {
    loadAccount: 'Could not load your account.',
    register: 'Could not create your account.',
    signIn: 'Could not sign you in.',
    google: 'Google sign-in failed.',
    signOut: 'Could not sign you out.',
    generic: 'Sign-in failed.',
  },
  /** Firebase Auth error codes. */
  errors: {
    invalidCredential: 'Email or password is incorrect.',
    invalidEmail: 'That email address looks invalid.',
    userNotFound: 'No account uses this email.',
    emailInUse: 'An account with this email already exists. Try signing in.',
    weakPassword: (min: number) => `Use a password with at least ${characters(min)}.`,
    tooManyRequests: 'Too many attempts. Wait a minute and try again.',
    popupClosed: 'Google sign-in was closed before it finished.',
    popupBlocked: 'Your browser blocked the Google sign-in popup. Allow popups and retry.',
    networkFailed: 'Network error. Check your connection and retry.',
    operationNotAllowed: 'This sign-in method is not enabled in Firebase yet.',
    unauthorizedDomain:
      'Sign-in isn’t allowed from this address yet. Add it under Firebase → Authentication → Settings → Authorized domains.',
  },
};
