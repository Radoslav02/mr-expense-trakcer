import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { startCategoriesSync, syncSharedCategories } from '@/redux/categories/categoriesThunks';
import { startExpensesSync } from '@/redux/expenses/expensesThunks';
import { selectConnectedPartnerUid } from '@/redux/partner/partnerSelectors';
import { startPartnerDataSync, startPartnerLinkSync } from '@/redux/partner/partnerThunks';
import { addDueRecurringExpenses, startRecurringSync } from '@/redux/recurring/recurringSlice';
import { startSettingsSync } from '@/redux/settings/settingsThunks';

export const useUserDataSync = (): void => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const partnerUid = useAppSelector(selectConnectedPartnerUid);
  const myCategories = useAppSelector((state) => state.categories.items);
  const partnerCategories = useAppSelector((state) => state.partner.categories);
  const uid = user?.uid;
  const email = user?.email;

  useEffect(() => {
    if (!uid) return;
    const unsubscribes = [
      dispatch(startSettingsSync(uid)),
      dispatch(startCategoriesSync(uid)),
      dispatch(startExpensesSync(uid)),
      dispatch(startRecurringSync(uid)),
      ...(email ? [dispatch(startPartnerLinkSync(uid, email))] : []),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [dispatch, uid, email]);

  useEffect(() => {
    if (!partnerUid) return;
    return dispatch(startPartnerDataSync(partnerUid));
  }, [dispatch, partnerUid]);

  // Keep shared categories identical on both sides whenever either list changes.
  useEffect(() => {
    if (partnerUid) dispatch(syncSharedCategories());
  }, [dispatch, partnerUid, myCategories, partnerCategories]);

  // An installed app can stay open for days: check for due recurring expenses when it's reopened.
  useEffect(() => {
    if (!uid) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') dispatch(addDueRecurringExpenses());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [dispatch, uid]);
};
