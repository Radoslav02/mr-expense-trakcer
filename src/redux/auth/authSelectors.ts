import type { RootState } from '@/app/store';

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectUid = (state: RootState) => state.auth.user?.uid ?? null;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
