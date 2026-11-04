import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { startCategoriesSync } from '@/redux/categories/categoriesThunks';
import { startExpensesSync } from '@/redux/expenses/expensesThunks';
import { selectConnectedPartnerUid } from '@/redux/partner/partnerSelectors';
import { startPartnerDataSync, startPartnerLinkSync } from '@/redux/partner/partnerThunks';
import { startSettingsSync } from '@/redux/settings/settingsThunks';

export const useUserDataSync = (): void => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const partnerUid = useAppSelector(selectConnectedPartnerUid);
  const uid = user?.uid;
  const email = user?.email;

  useEffect(() => {
    if (!uid) return;
    const unsubscribes = [
      dispatch(startSettingsSync(uid)),
      dispatch(startCategoriesSync(uid)),
      dispatch(startExpensesSync(uid)),
      ...(email ? [dispatch(startPartnerLinkSync(uid, email))] : []),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [dispatch, uid, email]);

  useEffect(() => {
    if (!partnerUid) return;
    return dispatch(startPartnerDataSync(partnerUid));
  }, [dispatch, partnerUid]);
};
