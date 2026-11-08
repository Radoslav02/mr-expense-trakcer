import { HeartHandshake, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Input } from '@/components/Input';
import { APP_NAME } from '@/constants/settings';
import { usePartnerConnection } from '@/hooks/usePartnerConnection';
import { useI18n } from '@/i18n';
import { PersonAvatar } from '../PersonAvatar';
import './PartnerConnectCard.css';

export const PartnerConnectCard = () => {
  const connection = usePartnerConnection();
  const { t } = useI18n();
  const copy = t.partner.connect;
  const { status, partnerEmail, incoming, names, busy } = connection;

  const renderBody = () => {
    if (status === 'connected') {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <PersonAvatar person="partner" name={names.partner} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{copy.sharingWith(names.partner)}</p>
            <p className="truncate text-sm text-ink-subtle">{partnerEmail}</p>
          </div>
          <Button variant="secondary" onClick={() => connection.setConfirmingStop(true)}>
            {copy.stopSharing}
          </Button>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className="flex flex-col gap-4">
          <p className="partner-connect__note text-sm text-ink-muted">
            {copy.pendingBefore} <strong>{partnerEmail}</strong>
            {copy.pendingMiddle(APP_NAME)} <strong>{connection.ownEmail}</strong>{' '}
            {copy.pendingAfter}
          </p>
          <div>
            <Button variant="secondary" loading={busy} onClick={() => void connection.stop()}>
              {copy.cancelInvite}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {incoming && (
          <div className="partner-connect__incoming flex flex-wrap items-center gap-3 rounded-lg bg-partner-soft px-4 py-3">
            <UserRoundCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-partner" />
            <p className="min-w-0 flex-1 text-sm text-ink">
              <strong>{names.partner}</strong> {copy.incoming(incoming.email)}
            </p>
            <Button size="sm" loading={busy} onClick={connection.shareBack}>
              {copy.shareBack}
            </Button>
          </div>
        )}
        <form
          onSubmit={connection.handleSubmit}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <Input
            label={copy.emailLabel}
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder={copy.emailPlaceholder}
            value={connection.email}
            onChange={(event) => connection.setEmail(event.target.value)}
            error={connection.error ?? undefined}
            hideLabel
            wrapperClassName="flex-1"
          />
          <Button type="submit" loading={busy} icon={<HeartHandshake />}>
            {copy.share}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <Card title={copy.title} description={copy.description} className="partner-connect">
      {renderBody()}
      <ConfirmDialog
        open={connection.confirmingStop}
        title={copy.confirmStopTitle(names.partner)}
        message={copy.confirmStopMessage(names.partner)}
        confirmLabel={copy.stopSharing}
        loading={busy}
        onConfirm={() => void connection.stop()}
        onCancel={() => connection.setConfirmingStop(false)}
      />
    </Card>
  );
};
