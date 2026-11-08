import { CircleCheck, Download, Share, SquarePlus } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { APP_NAME } from '@/constants/settings';
import { useInstallApp } from '@/hooks/useInstallApp';
import { useI18n } from '@/i18n';
import './InstallAppCard.css';

export const InstallAppCard = () => {
  const { mode, install } = useInstallApp();
  const { t } = useI18n();
  const copy = t.settings.install;

  const renderBody = () => {
    switch (mode) {
      case 'installed':
        return (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CircleCheck aria-hidden="true" className="h-4 w-4 text-positive" />
            {copy.installed(APP_NAME)}
          </p>
        );
      case 'prompt':
        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">{copy.prompt(APP_NAME)}</p>
            <Button icon={<Download />} onClick={() => void install()}>
              {copy.installButton}
            </Button>
          </div>
        );
      case 'ios':
        return (
          <ol className="install-steps flex flex-col gap-2 text-sm text-ink-muted">
            <li>
              <span className="install-steps__n">1</span>
              {copy.iosStep1Before}{' '}
              <Share aria-label={copy.iosShare} className="install-steps__icon" />{' '}
              {copy.iosStep1After}
            </li>
            <li>
              <span className="install-steps__n">2</span>
              {copy.iosStep2Before}{' '}
              <SquarePlus aria-hidden="true" className="install-steps__icon" />
              <strong>{copy.iosAddToHomeScreen}</strong>
              {copy.iosStep2After}
            </li>
          </ol>
        );
      default:
        return <p className="text-sm text-ink-muted">{copy.unsupported(APP_NAME)}</p>;
    }
  };

  return (
    <Card title={copy.title} description={copy.description}>
      {renderBody()}
    </Card>
  );
};
