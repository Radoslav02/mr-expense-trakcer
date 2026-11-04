import { CircleCheck, Download, Share, SquarePlus } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { APP_NAME } from '@/constants/settings';
import { useInstallApp } from '@/hooks/useInstallApp';
import './InstallAppCard.css';

export const InstallAppCard = () => {
  const { mode, install } = useInstallApp();

  const renderBody = () => {
    switch (mode) {
      case 'installed':
        return (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CircleCheck aria-hidden="true" className="h-4 w-4 text-positive" />
            {APP_NAME} is installed on this device.
          </p>
        );
      case 'prompt':
        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              Add {APP_NAME} to your home screen. It opens full screen and works offline.
            </p>
            <Button icon={<Download />} onClick={() => void install()}>
              Install app
            </Button>
          </div>
        );
      case 'ios':
        return (
          <ol className="install-steps flex flex-col gap-2 text-sm text-ink-muted">
            <li>
              <span className="install-steps__n">1</span>
              Tap <Share aria-label="Share" className="install-steps__icon" /> Share in Safari’s
              toolbar.
            </li>
            <li>
              <span className="install-steps__n">2</span>
              Choose <SquarePlus aria-hidden="true" className="install-steps__icon" />
              <strong>Add to Home Screen</strong>, then tap Add.
            </li>
          </ol>
        );
      default:
        return (
          <p className="text-sm text-ink-muted">
            Open {APP_NAME} in Chrome on Android or Safari on iPhone to add it to your home screen.
          </p>
        );
    }
  };

  return (
    <Card title="Install app" description="Use it like a regular phone app.">
      {renderBody()}
    </Card>
  );
};
