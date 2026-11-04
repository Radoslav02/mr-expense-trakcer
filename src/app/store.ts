import { configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import { authReducer } from '@/redux/auth/authSlice';
import { categoriesReducer } from '@/redux/categories/categoriesSlice';
import { expensesReducer } from '@/redux/expenses/expensesSlice';
import { partnerReducer } from '@/redux/partner/partnerSlice';
import { settingsReducer } from '@/redux/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    expenses: expensesReducer,
    partner: partnerReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  undefined,
  UnknownAction
>;
