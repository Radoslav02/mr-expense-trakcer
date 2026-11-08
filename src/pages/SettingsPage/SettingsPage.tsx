import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { InlineError } from '@/components/InlineError';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/Skeleton';
import { PartnerConnectCard } from '@/features/partner/PartnerConnectCard';
import { AppearanceSettings } from '@/features/settings/AppearanceSettings';
import { InstallAppCard } from '@/features/settings/InstallAppCard';
import { LanguageSettings } from '@/features/settings/LanguageSettings';
import { SettingsForm } from '@/features/settings/SettingsForm';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectSettingsError, selectSettingsStatus } from '@/redux/settings/settingsSelectors';
import { loadSettings } from '@/redux/settings/settingsThunks';
import { useI18n } from '@/i18n';
import './SettingsPage.css';

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectSettingsStatus);
  const error = useAppSelector(selectSettingsError);
  const user = useAppSelector(selectAuthUser);
  const loading = status === 'idle' || status === 'loading';
  const { t } = useI18n();

  return (
    <div className="settings-page mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader
        title={t.settings.title}
        description={user?.email ? t.settings.signedInAs(user.email) : undefined}
      />
      {error && <InlineError message={error} onRetry={() => void dispatch(loadSettings())} />}
      {loading ? (
        <Card title={t.settings.money.title} description={t.settings.money.description}>
          <div className="grid gap-5 sm:grid-cols-2" aria-busy="true">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </Card>
      ) : (
        <SettingsForm />
      )}
      <PartnerConnectCard />
      <LanguageSettings />
      <AppearanceSettings />
      <InstallAppCard />
    </div>
  );
};
