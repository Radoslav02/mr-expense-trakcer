import { getMessages } from '@/i18n';

/** Firebase's minimum password length (`auth/weak-password`). */
const FIREBASE_MIN_PASSWORD_LENGTH = 6;

/** Built at call time so messages follow the current language. */
const errorMessages = (): Readonly<Record<string, string>> => {
  const { auth, common } = getMessages();
  const e = auth.errors;
  return {
    'auth/invalid-credential': e.invalidCredential,
    'auth/invalid-email': e.invalidEmail,
    'auth/user-not-found': e.userNotFound,
    'auth/wrong-password': e.invalidCredential,
    'auth/email-already-in-use': e.emailInUse,
    'auth/weak-password': e.weakPassword(FIREBASE_MIN_PASSWORD_LENGTH),
    'auth/too-many-requests': e.tooManyRequests,
    'auth/popup-closed-by-user': e.popupClosed,
    'auth/cancelled-popup-request': e.popupClosed,
    'auth/popup-blocked': e.popupBlocked,
    'auth/network-request-failed': e.networkFailed,
    'auth/operation-not-allowed': e.operationNotAllowed,
    'auth/unauthorized-domain': e.unauthorizedDomain,
    'permission-denied': common.errors.permissionDenied,
    unavailable: common.errors.unavailable,
  };
};

const hasCode = (error: unknown): error is { code: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof (error as { code: unknown }).code === 'string';

export const isPermissionDenied = (error: unknown): boolean =>
  hasCode(error) && error.code === 'permission-denied';

export const getErrorMessage = (
  error: unknown,
  fallback: string = getMessages().common.errors.generic,
): string => {
  const known = hasCode(error) ? errorMessages()[error.code] : undefined;
  if (known) return known;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
