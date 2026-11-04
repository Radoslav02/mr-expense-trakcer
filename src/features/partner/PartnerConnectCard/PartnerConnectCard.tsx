import { HeartHandshake, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Input } from '@/components/Input';
import { APP_NAME } from '@/constants/settings';
import { usePartnerConnection } from '@/hooks/usePartnerConnection';
import { PersonAvatar } from '../PersonAvatar';
import './PartnerConnectCard.css';

export const PartnerConnectCard = () => {
  const connection = usePartnerConnection();
  const { status, partnerEmail, incoming, names, busy } = connection;

  const renderBody = () => {
    if (status === 'connected') {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <PersonAvatar person="partner" name={names.partner} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">Sharing with {names.partner}</p>
            <p className="truncate text-sm text-ink-subtle">{partnerEmail}</p>
          </div>
          <Button variant="secondary" onClick={() => connection.setConfirmingStop(true)}>
            Stop sharing
          </Button>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className="flex flex-col gap-4">
          <p className="partner-connect__note text-sm text-ink-muted">
            You’re sharing with <strong>{partnerEmail}</strong>. To finish, they sign in to{' '}
            {APP_NAME}
            and add <strong>{connection.ownEmail}</strong> under Settings → Partner.
          </p>
          <div>
            <Button variant="secondary" loading={busy} onClick={() => void connection.stop()}>
              Cancel invite
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
              <strong>{names.partner}</strong> ({incoming.email}) shared their spending with you.
            </p>
            <Button size="sm" loading={busy} onClick={connection.shareBack}>
              Share back
            </Button>
          </div>
        )}
        <form
          onSubmit={connection.handleSubmit}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <Input
            label="Partner’s email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="partner@example.com"
            value={connection.email}
            onChange={(event) => connection.setEmail(event.target.value)}
            error={connection.error ?? undefined}
            hideLabel
            wrapperClassName="flex-1"
          />
          <Button type="submit" loading={busy} icon={<HeartHandshake />}>
            Share my spending
          </Button>
        </form>
      </div>
    );
  };

  return (
    <Card
      title="Partner"
      description="Share your spending with one person. You can see each other’s expenses but only edit your own."
      className="partner-connect"
    >
      {renderBody()}
      <ConfirmDialog
        open={connection.confirmingStop}
        title={`Stop sharing with ${names.partner}?`}
        message={`${names.partner} will no longer see your expenses, and the Together page will be empty until you share again.`}
        confirmLabel="Stop sharing"
        loading={busy}
        onConfirm={() => void connection.stop()}
        onCancel={() => connection.setConfirmingStop(false)}
      />
    </Card>
  );
};
