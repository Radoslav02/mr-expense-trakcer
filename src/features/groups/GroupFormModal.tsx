import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Plus, User, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { CURRENCY_CODES } from '@/constants/settings';
import { EMAIL_PATTERN } from '@/hooks/useAuthForm';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import { createGroupThunk, updateGroupThunk } from '@/redux/groups/groupsThunks';
import type { Group, NewMember } from '@/types/group';
import { normalizeEmail } from '@/utils/comparison';
import { groupPath } from './groupUtils';

interface GroupFormModalProps {
  open: boolean;
  /** Edit this group's name and currency; without it, a new group is created. */
  group?: Group | null;
  onClose: () => void;
}

const FORM_ID = 'group-form';

export const GroupFormModal = ({ open, group = null, onClose }: GroupFormModalProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const defaultCurrency = useAppSelector(selectCurrency);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [people, setPeople] = useState<NewMember[]>([]);
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; person?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? '');
    setCurrency(group?.currency ?? defaultCurrency);
    setPeople([]);
    setPersonName('');
    setPersonEmail('');
    setErrors({});
  }, [open, group, defaultCurrency]);

  const addPerson = () => {
    const trimmed = personName.trim();
    const email = personEmail.trim() ? normalizeEmail(personEmail) : '';
    const next: typeof errors = {};
    if (!trimmed) next.person = g.validation.personNameRequired;
    if (email && !EMAIL_PATTERN.test(email)) next.email = g.validation.emailInvalid;
    const taken =
      (email &&
        (email === normalizeEmail(user?.email ?? '') || people.some((p) => p.email === email))) ||
      people.some((p) => !email && p.name.toLowerCase() === trimmed.toLowerCase());
    if (!next.person && !next.email && taken) next.person = g.validation.personExists;
    setErrors(next);
    if (next.person || next.email) return;
    setPeople((current) => [...current, { name: trimmed, ...(email ? { email } : {}) }]);
    setPersonName('');
    setPersonEmail('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrors({ name: g.validation.nameRequired });
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (group) {
        await dispatch(
          updateGroupThunk({ groupId: group.id, changes: { name, currency } }),
        ).unwrap();
        toast.success(g.form.saved);
        onClose();
      } else {
        const id = await dispatch(createGroupThunk({ name, currency, members: people })).unwrap();
        toast.success(g.form.created(name.trim()));
        onClose();
        navigate(groupPath(id));
      }
    } catch {
      toast.error(g.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={group ? g.form.editTitle : g.form.createTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {group ? t.common.saveChanges : g.form.create}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pb-2">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <Input
            label={g.form.name}
            value={name}
            maxLength={60}
            placeholder={g.form.namePlaceholder}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            error={errors.name}
            wrapperClassName="min-w-0"
          />
          <Select
            label={g.form.currency}
            value={currency}
            options={CURRENCY_CODES.map((code) => ({ value: code, label: code }))}
            onChange={(event) => setCurrency(event.target.value)}
            wrapperClassName="min-w-0"
          />
        </div>

        {!group && (
          <fieldset className="min-w-0">
            <legend className="text-sm font-medium text-ink">{g.form.people}</legend>
            <p className="mb-3 mt-0.5 text-[0.8125rem] text-ink-subtle">{g.form.peopleHint}</p>
            {people.length > 0 && (
              <ul className="mb-3 flex flex-col gap-1.5">
                {people.map((person, index) => (
                  <li
                    key={`${person.name}-${person.email ?? index}`}
                    className="flex min-w-0 items-center gap-2 rounded-lg bg-sunken px-3 py-2 text-sm"
                  >
                    {person.email ? (
                      <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
                    ) : (
                      <User aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-ink">{person.name}</span>
                      {person.email && <span className="text-ink-subtle"> · {person.email}</span>}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={<X />}
                      onClick={() => setPeople((current) => current.filter((_, i) => i !== index))}
                    >
                      {g.form.remove(person.name)}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <Input
                label={g.form.personName}
                hideLabel
                placeholder={g.form.personName}
                value={personName}
                onChange={(event) => setPersonName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addPerson();
                  }
                }}
                error={errors.person}
                wrapperClassName="min-w-0"
              />
              <Input
                label={g.form.personEmail}
                hideLabel
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder={g.form.personEmail}
                value={personEmail}
                onChange={(event) => setPersonEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addPerson();
                  }
                }}
                error={errors.email}
                wrapperClassName="min-w-0"
              />
              <Button variant="secondary" icon={<Plus />} onClick={addPerson}>
                {g.form.add}
              </Button>
            </div>
          </fieldset>
        )}
      </form>
    </Modal>
  );
};
