import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import { getMessages } from '@/i18n';
import {
  acceptInvitation,
  addGroupMember,
  createGroup,
  declineInvitation,
  deleteGroup,
  deleteGroupExpense,
  deleteGroupPayment,
  leaveGroup,
  recordGroupPayment,
  removeGroupMember,
  saveGroupExpense,
  updateGroup,
} from '@/services/groupsService';
import type {
  Group,
  GroupExpenseInput,
  GroupMember,
  GroupPaymentInput,
  NewMember,
} from '@/types/group';

const saveFailed = () => getMessages().groups.errors.save;
const deleteFailed = () => getMessages().groups.errors.delete;

const requireUser = (state: Parameters<typeof requireUid>[0]) => {
  const user = state.auth.user;
  if (!user) throw new Error(getMessages().common.errors.signedOut);
  return user;
};

export const createGroupThunk = createAppAsyncThunk(
  'groups/create',
  async (
    input: { name: string; currency: string; members: NewMember[] },
    { getState, rejectWithValue },
  ) => {
    try {
      return await createGroup(requireUser(getState()), input);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const updateGroupThunk = createAppAsyncThunk(
  'groups/update',
  async (
    { groupId, changes }: { groupId: string; changes: Parameters<typeof updateGroup>[1] },
    { rejectWithValue },
  ) => {
    try {
      await updateGroup(groupId, changes);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const addGroupMemberThunk = createAppAsyncThunk(
  'groups/addMember',
  async ({ groupId, member }: { groupId: string; member: NewMember }, { rejectWithValue }) => {
    try {
      await addGroupMember(groupId, member);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const removeGroupMemberThunk = createAppAsyncThunk(
  'groups/removeMember',
  async ({ groupId, member }: { groupId: string; member: GroupMember }, { rejectWithValue }) => {
    try {
      await removeGroupMember(groupId, member);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const answerInvitationThunk = createAppAsyncThunk(
  'groups/answerInvitation',
  async ({ group, join }: { group: Group; join: boolean }, { getState, rejectWithValue }) => {
    try {
      const user = requireUser(getState());
      await (join ? acceptInvitation(group, user) : declineInvitation(group, user));
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const leaveGroupThunk = createAppAsyncThunk(
  'groups/leave',
  async (group: Group, { getState, rejectWithValue }) => {
    try {
      await leaveGroup(group, requireUid(getState()));
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const deleteGroupThunk = createAppAsyncThunk(
  'groups/delete',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await deleteGroup(groupId);
    } catch {
      return rejectWithValue(deleteFailed());
    }
  },
);

export const saveGroupExpenseThunk = createAppAsyncThunk(
  'groups/saveExpense',
  async (
    {
      groupId,
      input,
      expenseId,
    }: { groupId: string; input: GroupExpenseInput; expenseId?: string },
    { getState, rejectWithValue },
  ) => {
    try {
      await saveGroupExpense(groupId, requireUid(getState()), input, expenseId);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const deleteGroupExpenseThunk = createAppAsyncThunk(
  'groups/deleteExpense',
  async ({ groupId, expenseId }: { groupId: string; expenseId: string }, { rejectWithValue }) => {
    try {
      await deleteGroupExpense(groupId, expenseId);
    } catch {
      return rejectWithValue(deleteFailed());
    }
  },
);

export const recordGroupPaymentThunk = createAppAsyncThunk(
  'groups/recordPayment',
  async (
    { groupId, input }: { groupId: string; input: GroupPaymentInput },
    { getState, rejectWithValue },
  ) => {
    try {
      await recordGroupPayment(groupId, requireUid(getState()), input);
    } catch {
      return rejectWithValue(saveFailed());
    }
  },
);

export const deleteGroupPaymentThunk = createAppAsyncThunk(
  'groups/deletePayment',
  async ({ groupId, paymentId }: { groupId: string; paymentId: string }, { rejectWithValue }) => {
    try {
      await deleteGroupPayment(groupId, paymentId);
    } catch {
      return rejectWithValue(deleteFailed());
    }
  },
);
