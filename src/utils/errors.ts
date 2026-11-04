const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-not-found': 'No account uses this email.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
  'auth/cancelled-popup-request': 'Google sign-in was closed before it finished.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups and retry.',
  'auth/network-request-failed': 'Network error. Check your connection and retry.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase yet.',
  'permission-denied':
    'Firestore refused access. Publish the rules from firestore.rules in the Firebase console, then try again.',
  unavailable: 'The server is unreachable. Check your connection and retry.',
};

const hasCode = (error: unknown): error is { code: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof (error as { code: unknown }).code === 'string';

export const isPermissionDenied = (error: unknown): boolean =>
  hasCode(error) && error.code === 'permission-denied';

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Try again.') => {
  if (hasCode(error) && ERROR_MESSAGES[error.code]) return ERROR_MESSAGES[error.code];
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
