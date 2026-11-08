import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getMessages, useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import {
  selectIncomingInvite,
  selectLinkStatus,
  selectPartnerEmail,
  selectPartnerMutating,
  selectPersonNames,
} from '@/redux/partner/partnerSelectors';
import { connectPartner, disconnectPartner } from '@/redux/partner/partnerThunks';
import { normalizeEmail } from '@/utils/comparison';
import { EMAIL_PATTERN } from './useAuthForm';
import { useToast } from './useToast';

const validatePartnerEmail = (value: string, ownEmail: string | null): string | null => {
  const email = normalizeEmail(value);
  const { validation } = getMessages().partner;
  if (!EMAIL_PATTERN.test(email)) return validation.emailRequired;
  if (ownEmail && email === normalizeEmail(ownEmail)) return validation.ownEmail;
  return null;
};

export const usePartnerConnection = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { t } = useI18n();
  const user = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectLinkStatus);
  const partnerEmail = useAppSelector(selectPartnerEmail);
  const incoming = useAppSelector(selectIncomingInvite);
  const names = useAppSelector(selectPersonNames);
  const busy = useAppSelector(selectPartnerMutating);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmingStop, setConfirmingStop] = useState(false);

  const share = async (target: string) => {
    const validation = validatePartnerEmail(target, user?.email ?? null);
    setError(validation);
    if (validation) return;
    try {
      await dispatch(connectPartner(target)).unwrap();
      setEmail('');
      toast.success(t.partner.connect.shared);
    } catch (message) {
      toast.error(String(message));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void share(email);
  };

  const stop = async () => {
    try {
      await dispatch(disconnectPartner()).unwrap();
      setConfirmingStop(false);
      toast.success(t.partner.connect.stopped);
    } catch (message) {
      toast.error(String(message));
    }
  };

  return {
    status,
    partnerEmail,
    incoming,
    names,
    ownEmail: user?.email ?? '',
    busy,
    email,
    error,
    setEmail: (value: string) => {
      setEmail(value);
      setError(null);
    },
    handleSubmit,
    shareBack: () => incoming && void share(incoming.email),
    confirmingStop,
    setConfirmingStop,
    stop,
  };
};
