import { useCallback, useState } from 'react';
import type { Expense } from '@/types/expense';

type FormState = { open: false } | { open: true; expense: Expense | null };

export const useExpenseDialogs = () => {
  const [form, setForm] = useState<FormState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const openCreate = useCallback(() => setForm({ open: true, expense: null }), []);
  const openEdit = useCallback((expense: Expense) => setForm({ open: true, expense }), []);
  const closeForm = useCallback(() => setForm({ open: false }), []);
  const requestDelete = useCallback((expense: Expense) => setPendingDelete(expense), []);
  const closeDelete = useCallback(() => setPendingDelete(null), []);

  return {
    formOpen: form.open,
    editingExpense: form.open ? form.expense : null,
    pendingDelete,
    openCreate,
    openEdit,
    closeForm,
    requestDelete,
    closeDelete,
  };
};
